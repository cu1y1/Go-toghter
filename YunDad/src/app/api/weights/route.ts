import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUserId, unauthorized } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/weights?week=16 - 体重记录列表（可选按孕周过滤）
export async function GET(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const weekParam = request.nextUrl.searchParams.get('week')
    const where: Record<string, unknown> = { userId }
    if (weekParam && !isNaN(Number(weekParam))) {
      where.week = Number(weekParam)
    }

    const records = await prisma.weightRecord.findMany({
      where,
      orderBy: { recordDate: 'asc' },
    })

    // 附带BMI基准信息（孕前体重+身高）
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { heightCm: true, prePregnancyWeight: true },
    })

    let preBMI: number | null = null
    if (user?.heightCm && user?.prePregnancyWeight && user.heightCm > 0) {
      preBMI = Number((user.prePregnancyWeight / Math.pow(user.heightCm / 100, 2)).toFixed(1))
    }

    return NextResponse.json({ success: true, data: { list: records, preBMI, profile: user } })
  } catch (error) {
    console.error('获取体重记录失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// POST /api/weights - 记录体重（同日重复记录则覆盖更新）
// body: { weightKg: number, recordDate?: string(YYYY-MM-DD), note?: string }
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const body = await request.json()
    const weightKg = Number(body.weightKg)
    if (!weightKg || weightKg < 30 || weightKg > 200) {
      return NextResponse.json({ success: false, error: '体重需在30-200kg之间' }, { status: 400 })
    }

    // recordDate 缺省今天（本地时区按 UTC+8 归一）
    const now = new Date()
    let recordDate: Date
    if (body.recordDate) {
      recordDate = new Date(`${body.recordDate}T00:00:00+08:00`)
      if (isNaN(recordDate.getTime())) {
        return NextResponse.json({ success: false, error: '日期格式应为YYYY-MM-DD' }, { status: 400 })
      }
    } else {
      const utc8 = new Date(now.getTime() + 8 * 3600 * 1000)
      recordDate = new Date(utc8.toISOString().slice(0, 10) + 'T00:00:00+08:00')
    }

    // 计算孕周（基于预产期倒推：孕40周=预产日）
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dueDate: true, pregnancyWeek: true },
    })
    let week: number | null = null
    if (user?.dueDate) {
      const due = new Date(user.dueDate)
      const daysToDue = Math.round((due.getTime() - recordDate.getTime()) / 86400000)
      // 受孕约在孕2周，距预产期天数 → 孕周
      week = Math.max(1, Math.min(42, 40 - Math.floor(daysToDue / 7)))
    } else {
      week = user?.pregnancyWeek ?? null
    }

    const record = await prisma.weightRecord.upsert({
      where: { userId_recordDate: { userId, recordDate } },
      create: {
        userId,
        weightKg,
        recordDate,
        week,
        note: typeof body.note === 'string' ? body.note : null,
      },
      update: {
        weightKg,
        week,
        note: typeof body.note === 'string' ? body.note : null,
      },
    })

    return NextResponse.json({ success: true, data: record })
  } catch (error) {
    console.error('记录体重失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
