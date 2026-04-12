import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取每日小贴士
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pregnancyWeek = searchParams.get('week')

    let tips: { id: string; content: string; category: string | null; weekRange: string | null; createdAt: Date }[] = []

    if (pregnancyWeek) {
      const week = parseInt(pregnancyWeek, 10)
      tips = await db.dailyTip.findMany({
        where: {
          weekRange: {
            contains: week.toString(),
          },
        },
        take: 5,
      })
    }

    if (tips.length === 0) {
      tips = await db.dailyTip.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      })
    }

    const todayTip = tips.length > 0 
      ? tips[Math.floor(Math.random() * tips.length)] 
      : null

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
