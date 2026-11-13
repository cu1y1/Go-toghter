import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUserId, unauthorized } from '@/lib/auth'
import { aiChat, AiChatMessage, getAiMode } from '@/lib/ai'

const prisma = new PrismaClient()

// 免费档限流：每用户每小时 10 次（内存计数，重启清零即可接受）
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 3600 * 1000

function checkRate(userId: string): boolean {
  const now = Date.now()
  const rec = rateMap.get(userId)
  if (!rec || rec.resetAt < now) {
    rateMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (rec.count >= RATE_LIMIT) return false
  rec.count += 1
  return true
}

// POST /api/ai/chat - AI 问答
// body: { messages: [{role:'user'|'assistant', content}] }
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    if (!checkRate(userId)) {
      return NextResponse.json(
        { success: false, error: '今日 AI 问答次数已达上限（每小时10次），请稍后再试' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const rawMessages = Array.isArray(body.messages) ? body.messages : []
    const messages: AiChatMessage[] = rawMessages
      .filter((m: { role?: string; content?: string }) =>
        (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
      .map((m: { role: 'user' | 'assistant'; content: string }) => ({ role: m.role, content: m.content.slice(0, 2000) }))
      .slice(-10)

    if (!messages.length) {
      return NextResponse.json({ success: false, error: '消息不能为空' }, { status: 400 })
    }

    const result = await aiChat(messages)

    // 落库（记录问答历史，便于后续优化 prompt）
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS AiChatLog (id TEXT PRIMARY KEY, userId TEXT, question TEXT, answer TEXT, mode TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP)`
    ).catch(() => {})

    return NextResponse.json({
      success: result.ok,
      data: {
        content: result.ok ? `${result.content}` : null,
        mode: result.mode,
        quota: { used: rateMap.get(userId)?.count ?? 0, limit: RATE_LIMIT },
      },
      error: result.ok ? undefined : result.error,
    })
  } catch (error) {
    console.error('AI问答失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// GET /api/ai/chat - 查询当前模式与配额
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()
    const rec = rateMap.get(userId)
    return NextResponse.json({
      success: true,
      data: {
        mode: getAiMode(),
        quota: { used: rec && rec.resetAt > Date.now() ? rec.count : 0, limit: RATE_LIMIT },
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
