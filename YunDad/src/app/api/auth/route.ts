import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createToken, hashPassword, verifyPassword, getAuthUserId } from '@/lib/auth'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function publicUser(u: {
  id: string; email: string; babyName: string | null; dueDate: Date | null
  pregnancyWeek: number; level: number; points: number; avatar: string | null; createdAt: Date
}) {
  return {
    id: u.id,
    email: u.email,
    babyName: u.babyName,
    dueDate: u.dueDate,
    pregnancyWeek: u.pregnancyWeek,
    level: u.level,
    points: u.points,
    avatar: u.avatar,
    createdAt: u.createdAt,
  }
}

// POST /api/auth
// body: { action: 'register' | 'login' | 'logout', email?, password?, babyName?, dueDate?, pregnancyWeek? }
export async function POST(request: NextRequest) {
  try {
    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch {}

    const action = String(body.action || (body.email && body.password ? 'login' : ''))

    if (action === 'register') {
      const email = String(body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      if (!EMAIL_RE.test(email)) {
        return NextResponse.json({ success: false, error: '邮箱格式不正确' }, { status: 400 })
      }
      if (password.length < 6) {
        return NextResponse.json({ success: false, error: '密码至少6位' }, { status: 400 })
      }
      const exists = await db.user.findUnique({ where: { email } })
      if (exists) {
        return NextResponse.json({ success: false, error: '该邮箱已注册' }, { status: 409 })
      }
      const user = await db.user.create({
        data: {
          email,
          password: hashPassword(password),
          babyName: typeof body.babyName === 'string' && body.babyName ? body.babyName : null,
          dueDate: body.dueDate ? new Date(String(body.dueDate)) : null,
          pregnancyWeek: Number.isFinite(Number(body.pregnancyWeek)) ? Number(body.pregnancyWeek) : 1,
        },
      })
      return NextResponse.json({
        success: true,
        data: { token: createToken(user.id), user: publicUser(user) },
      })
    }

    if (action === 'login') {
      const email = String(body.email || '').trim().toLowerCase()
      const password = String(body.password || '')
      const user = await db.user.findUnique({ where: { email } })
      if (!user || !verifyPassword(password, user.password)) {
        return NextResponse.json({ success: false, error: '邮箱或密码错误' }, { status: 401 })
      }
      return NextResponse.json({
        success: true,
        data: { token: createToken(user.id), user: publicUser(user) },
      })
    }

    if (action === 'logout') {
      // 无状态 token：退出由客户端删除本地会话完成
      return NextResponse.json({ success: true, message: '已退出' })
    }

    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 })
  } catch (error) {
    console.error('认证失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// GET /api/auth — 获取当前登录用户（用于会话恢复）
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: publicUser(user) })
  } catch (error) {
    console.error('会话恢复失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
