import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUserId, unauthorized, forbidden } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/contractions - 获取宫缩记录
export async function GET(request: NextRequest) {
  const userId = getAuthUserId(request)
  if (!userId) return unauthorized()

  const { searchParams } = new URL(request.url)
  const today = searchParams.get('today')

  try {
    const where: any = {}
    
    where.userId = userId
    
    if (today === 'true') {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)
      where.recordDate = { gte: startOfDay, lte: endOfDay }
    }

    const contractions = await prisma.contraction.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: 50,
    })

    return NextResponse.json({ success: true, data: contractions })
  } catch (error) {
    console.error('Error fetching contractions:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 })
  }
}

// POST /api/contractions - 创建宫缩记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const { startTime, endTime, frequency, duration, interval, intensity, notes, isCompleted } = body

    if (!startTime) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const contraction = await prisma.contraction.create({
      data: {
        userId,
        recordDate: new Date(startTime),
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        frequency: frequency || 0,
        duration: duration || 0,
        interval: interval || 0,
        intensity: intensity || 'mild',
        notes,
        isCompleted: isCompleted || false,
      },
    })

    return NextResponse.json({ success: true, data: contraction })
  } catch (error) {
    console.error('Error creating contraction:', error)
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 })
  }
}