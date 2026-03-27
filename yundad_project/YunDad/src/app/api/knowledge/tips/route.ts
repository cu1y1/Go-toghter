import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取每日小贴士
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pregnancyWeek = searchParams.get('week')

    // 根据孕周获取小贴士
    let tips = []

    if (pregnancyWeek) {
      const week = parseInt(pregnancyWeek, 10)
      // 尝试匹配当前孕周的小贴士
      tips = await db.dailyTip.findMany({
        where: {
          weekRange: {
            contains: week.toString(),
          },
        },
        take: 5,
      })
    }

    // 如果没有找到匹配的小贴士，获取通用小贴士
    if (tips.length === 0) {
      tips = await db.dailyTip.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      })
    }

    // 随机选择一条作为今日小贴士
    const todayTip = tips.length > 0 
      ? tips[Math.floor(Math.random() * tips.length)] 
      : null

    // 如果数据库中没有小贴士，返回默认小贴士
    const defaultTip = {
      id: 'default',
      content: '孕期保持良好的心情对宝宝发育很重要哦！每天可以听一些轻柔的音乐，适当散步，保持愉快的心情。',
      weekRange: null,
      category: 'general',
    }

    return NextResponse.json({
      success: true,
      data: todayTip || defaultTip,
      relatedTips: tips.slice(0, 3),
    })
  } catch (error) {
    console.error('获取每日小贴士失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
