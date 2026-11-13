import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUserId, unauthorized } from '@/lib/auth'

const prisma = new PrismaClient()

// POST /api/push/register - 注册/更新推送令牌
// body: { token: string, platform?: string }
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const body = await request.json()
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    if (!token || token.length < 10 || token.length > 512) {
      return NextResponse.json({ success: false, error: '无效的推送令牌' }, { status: 400 })
    }

    const record = await prisma.pushToken.upsert({
      where: { token },
      create: {
        userId,
        token,
        platform: typeof body.platform === 'string' ? body.platform.slice(0, 20) : null,
        lastActiveAt: new Date(),
      },
      update: {
        userId,
        enabled: true,
        lastActiveAt: new Date(),
        platform: typeof body.platform === 'string' ? body.platform.slice(0, 20) : null,
      },
    })

    return NextResponse.json({ success: true, data: { id: record.id } })
  } catch (error) {
    console.error('注册推送令牌失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// DELETE /api/push/register - 注销令牌（用户关闭推送时）
// body: { token: string }
export async function DELETE(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const body = await request.json()
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    if (!token) {
      return NextResponse.json({ success: false, error: '缺少token' }, { status: 400 })
    }

    // 只允许操作自己的令牌
    const existing = await prisma.pushToken.findFirst({ where: { token, userId } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    await prisma.pushToken.update({ where: { id: existing.id }, data: { enabled: false } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('注销推送令牌失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
