import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 月度打卡统计
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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString(), 10)
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString(), 10)

    // 计算月份的开始和结束日期
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    // 获取月度打卡记录
    const checkIns = await db.checkIn.findMany({
      where: {
        userId,
        checkDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { checkDate: 'asc' },
    })

    // 按日期分组统计
    const dailyStats: Record<string, { count: number; points: number; mealTypes: string[] }> = {}

    checkIns.forEach((checkIn) => {
      const dateKey = checkIn.checkDate.toISOString().split('T')[0]
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { count: 0, points: 0, mealTypes: [] }
      }
      dailyStats[dateKey].count += 1
      dailyStats[dateKey].points += checkIn.points
      dailyStats[dateKey].mealTypes.push(checkIn.mealType)
    })

    // 计算月度统计
    const totalPoints = checkIns.reduce((sum, c) => sum + c.points, 0)
    const totalDays = Object.keys(dailyStats).length
    const avgPerDay = totalDays > 0 ? (checkIns.length / totalDays).toFixed(1) : '0'

    // 计算打卡连续天数
    const sortedDates = Object.keys(dailyStats).sort().reverse()
    let consecutiveDays = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sortedDates.length; i++) {
      const checkDate = new Date(sortedDates[i])
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)

      if (checkDate.toDateString() === expectedDate.toDateString()) {
        consecutiveDays++
      } else {
        break
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        year,
        month,
        dailyStats,
        summary: {
          totalCheckIns: checkIns.length,
          totalPoints,
          totalDays,
          avgPerDay: parseFloat(avgPerDay),
          consecutiveDays,
        },
      },
    })
  } catch (error) {
    console.error('获取月度打卡统计失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
