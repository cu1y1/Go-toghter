import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUserId, unauthorized } from '@/lib/auth'

// 获取用户信息
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)

    if (!userId) return unauthorized()

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

// 注册已迁移至 /api/auth（统一签发 token）。此端点冻结，禁止再创建用户。
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: '注册已迁移至 /api/auth，请使用新接口' },
    { status: 410 }
  )
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)

    if (!userId) return unauthorized()

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
