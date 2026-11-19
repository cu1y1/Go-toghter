import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUserId, unauthorized } from '@/lib/auth'
import { aiChat, glmVision, REPORT_PROMPT, getAiMode } from '@/lib/ai'

const prisma = new PrismaClient()

// 免费档限流：产检单解读每用户每小时 5 次（重解析耗token）
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5
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

// POST /api/ai/report - 产检单解读
// body: { reportText: string }（手动输入）或 { image: string }（dataURL，glm-4.5v 拍照识别）
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    if (!checkRate(userId)) {
      return NextResponse.json(
        { success: false, error: '解读次数已达上限（每小时5次），请稍后再试' },
        { status: 429 }
      )
    }

    const body = await request.json()
    let reportText = typeof body.reportText === 'string' ? body.reportText.trim() : ''

    // 拍照识别：image（dataURL，≤4MB）→ glm-4.5v 提取报告单文字后走同一解读链路
    if (!reportText && typeof body.image === 'string' && body.image.startsWith('data:image/')) {
      if (body.image.length > 4 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: '图片过大，请重新拍照（≤4MB）' }, { status: 400 })
      }
      const vision = await glmVision(
        body.image,
        '这是产检报告单照片。请完整、逐行提取报告单上的文字内容（项目名/数值/单位/参考范围/提示），保持原有结构输出；模糊无法识别的字段标注[无法识别]。只输出提取的文字，不要解读。'
      )
      if (!vision.ok) {
        return NextResponse.json({ success: false, error: vision.error || '图片识别失败，可改用手动输入' }, { status: 200 })
      }
      reportText = vision.text.trim()
    }

    if (!reportText || reportText.length < 10) {
      return NextResponse.json({ success: false, error: '请粘贴产检报告单的文字内容（至少10字）' }, { status: 400 })
    }
    if (reportText.length > 4000) {
      return NextResponse.json({ success: false, error: '报告内容过长，请截取关键部分（≤4000字）' }, { status: 400 })
    }

    const result = await aiChat(
      [{ role: 'user', content: `${REPORT_PROMPT}\n\n-----报告内容-----\n${reportText}` }],
      { maxTokens: 1500 }
    )

    return NextResponse.json({
      success: result.ok,
      data: result.ok
        ? { content: result.content, mode: result.mode, quota: { used: rateMap.get(userId)?.count ?? 0, limit: RATE_LIMIT } }
        : null,
      error: result.ok ? undefined : result.error,
    })
  } catch (error) {
    console.error('产检单解读失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
