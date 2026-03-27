import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// 获取用户信息
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        babyName: true,
        dueDate: true,
        pregnancyWeek: true,
        level: true,
        points: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 用户注册（支持游客模式）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, babyName, dueDate, isGuest } = body

    // 游客模式
    if (isGuest) {
      const guestEmail = `guest_${randomUUID()}@guest.local`

      const user = await db.user.create({
        data: {
          email: guestEmail,
          password: null,
          babyName: babyName || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          level: 1,
          points: 0,
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          isGuest: true,
        },
        message: '游客账号创建成功',
      })
    }

    // 正常注册
    if (!email) {
      return NextResponse.json(
        { success: false, error: '邮箱不能为空' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    const user = await db.user.create({
      data: {
        email,
        password: password || null,
        babyName: babyName || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        level: 1,
        points: 0,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        isGuest: false,
      },
      message: '注册成功',
    })
  } catch (error) {
    console.error('用户注册失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { babyName, dueDate, pregnancyWeek, avatar } = body

    const updateData: {
      babyName?: string | null
      dueDate?: Date | null
      pregnancyWeek?: number
      avatar?: string | null
    } = {}

    if (babyName !== undefined) updateData.babyName = babyName
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (pregnancyWeek !== undefined) updateData.pregnancyWeek = pregnancyWeek
    if (avatar !== undefined) updateData.avatar = avatar

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        babyName: true,
        dueDate: true,
        pregnancyWeek: true,
        level: true,
        points: true,
        avatar: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: '更新成功',
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
