import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 今日打卡记录
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const checkDate = new Date(dateStr)
    checkDate.setHours(0, 0, 0, 0)

    // 获取当日打卡记录
    const checkIns = await db.checkIn.findMany({
      where: {
        userId,
        checkDate,
      },
      orderBy: { checkTime: 'asc' },
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

    // 计算统计数据
    const totalPoints = checkIns.reduce((sum, c) => sum + c.points, 0)
    const mealTypes = ['breakfast', 'snack_morning', 'lunch', 'snack_afternoon', 'dinner', 'snack_evening']
    const checkedTypes = checkIns.map((c) => c.mealType)
    const uncheckedMeals = mealTypes.filter((m) => !checkedTypes.includes(m))

    return NextResponse.json({
      success: true,
      data: {
        date: dateStr,
        checkIns,
        stats: {
          total: checkIns.length,
          totalPoints,
          checkedMeals: checkedTypes,
          uncheckedMeals,
        },
      },
    })
  } catch (error) {
    console.error('获取今日打卡记录失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
