import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/fetal-movements - 获取胎动记录
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const date = searchParams.get('date')

  try {
    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    
    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      where.createdAt = {
        gte: startDate,
        lt: endDate,
      }
    }

    const movements = await db.fetalMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ success: true, data: movements })
  } catch (error) {
    console.error('Error fetching fetal movements:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch movements' }, { status: 500 })
  }
}

// POST /api/fetal-movements - 创建胎动记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, movements, duration, notes } = body

    if (!userId || !movements) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const movement = await db.fetalMovement.create({
      data: {
        userId,
        movements: Number(movements),
        duration: Number(duration) || 0,
        notes: notes || '',
      },
    })

    return NextResponse.json({ success: true, data: movement })
  } catch (error) {
    console.error('Error creating fetal movement:', error)
    return NextResponse.json({ success: false, error: 'Failed to create movement' }, { status: 500 })
  }
}