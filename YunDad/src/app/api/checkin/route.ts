import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 打卡
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { mealType, recipeId, note } = body

    if (!mealType) {
      return NextResponse.json(
        { success: false, error: '餐食类型不能为空' },
        { status: 400 }
      )
    }

    const now = new Date()
    const today = new Date(now.toDateString())

    // 检查今天该餐食类型是否已打卡
    const existingCheckIn = await db.checkIn.findFirst({
      where: {
        userId,
        mealType,
        checkDate: today,
      },
    })

    if (existingCheckIn) {
      return NextResponse.json(
        { success: false, error: '该餐食类型今日已打卡' },
        { status: 400 }
      )
    }

    // 计算积分（基础积分 + 奖励）
    let points = 10 // 基础积分
    if (recipeId) points += 5 // 关联食谱额外积分

    // 创建打卡记录
    const checkIn = await db.checkIn.create({
      data: {
        userId,
        mealType,
        recipeId: recipeId || null,
        checkDate: today,
        checkTime: now,
        points,
        note: note || null,
      },
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // 更新用户积分
    await db.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: points,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: checkIn,
      message: `打卡成功，获得 ${points} 积分`,
    })
  } catch (error) {
    console.error('打卡失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
