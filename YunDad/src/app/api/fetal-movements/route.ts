import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/fetal-movements - 获取胎动记录列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    const whereClause: any = { userId }
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      whereClause.recordDate = {
        gte: startOfDay,
        lte: endOfDay
      }
    }

    const movements = await prisma.fetalMovement.findMany({
      where: whereClause,
      orderBy: { recordDate: 'desc' }
    })

    return NextResponse.json({ success: true, data: movements })
  } catch (error) {
    console.error('Error fetching fetal movements:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 })
  }
}

// POST /api/fetal-movements - 新增胎动记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { movements: count, duration, notes, userId } = body

    if (!userId || count === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const movement = await prisma.fetalMovement.create({
      data: {
        movements: count,
        duration: duration ?? null,
        notes: notes ?? null,
        userId,
        recordDate: new Date()
      }
    })

    return NextResponse.json({ success: true, data: movement }, { status: 201 })
  } catch (error) {
    console.error('Error creating fetal movement:', error)
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 })
  }
}
