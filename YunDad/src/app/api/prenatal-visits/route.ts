import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/prenatal-visits - 获取产检记录
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const upcoming = searchParams.get('upcoming')

  try {
    const where: any = {}
    
    if (userId) where.userId = userId
    if (upcoming === 'true') {
      where.visitDate = { gte: new Date() }
      where.isCompleted = false
    }

    const visits = await prisma.prenatalVisit.findMany({
      where,
      orderBy: { visitDate: 'asc' },
      take: 50,
    })

    return NextResponse.json({ success: true, data: visits })
  } catch (error) {
    console.error('Error fetching prenatal visits:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 })
  }
}

// POST /api/prenatal-visits - 创建产检记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, visitDate, week, hospital, department, doctor, purpose, result, nextVisitDate, notes } = body

    if (!userId || !visitDate) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const visit = await prisma.prenatalVisit.create({
      data: {
        userId,
        visitDate: new Date(visitDate),
        week: week || 0,
        hospital,
        department,
        doctor,
        purpose,
        result,
        nextVisitDate: nextVisitDate ? new Date(nextVisitDate) : null,
        notes,
      },
    })

    return NextResponse.json({ success: true, data: visit })
  } catch (error) {
    console.error('Error creating prenatal visit:', error)
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 500 })
  }
}