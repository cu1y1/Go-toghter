import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUserId, unauthorized } from '@/lib/auth'

const prisma = new PrismaClient()

// PUT /api/weights/profile - 设置身高/孕前体重（BMI与增重曲线基准）
// body: { heightCm?: number, prePregnancyWeight?: number }
export async function PUT(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (body.heightCm !== undefined) {
      const h = Number(body.heightCm)
      if (!h || h < 100 || h > 250) {
        return NextResponse.json({ success: false, error: '身高需在100-250cm之间' }, { status: 400 })
      }
      data.heightCm = h
    }
    if (body.prePregnancyWeight !== undefined) {
      const w = Number(body.prePregnancyWeight)
      if (!w || w < 30 || w > 200) {
        return NextResponse.json({ success: false, error: '体重需在30-200kg之间' }, { status: 400 })
      }
      data.prePregnancyWeight = w
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, heightCm: true, prePregnancyWeight: true },
    })
    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('更新体重档案失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
