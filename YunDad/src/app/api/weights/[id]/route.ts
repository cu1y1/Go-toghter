import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUserId, unauthorized, forbidden } from '@/lib/auth'

const prisma = new PrismaClient()

// PATCH /api/weights/[id] - 更新体重记录（体重值/备注）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const { id } = await params
    const existing = await prisma.weightRecord.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const data: Record<string, unknown> = {}
    if (body.weightKg !== undefined) {
      const w = Number(body.weightKg)
      if (!w || w < 30 || w > 200) {
        return NextResponse.json({ success: false, error: '体重需在30-200kg之间' }, { status: 400 })
      }
      data.weightKg = w
    }
    if (typeof body.note === 'string') data.note = body.note

    const updated = await prisma.weightRecord.update({ where: { id }, data })
    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('更新体重记录失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// DELETE /api/weights/[id] - 删除体重记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const { id } = await params
    const existing = await prisma.weightRecord.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    await prisma.weightRecord.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除体重记录失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
