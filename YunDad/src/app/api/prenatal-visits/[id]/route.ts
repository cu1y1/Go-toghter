import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUserId, unauthorized } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/prenatal-visits/[id] - 获取单条记录
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const { id } = await params
    const visit = await prisma.prenatalVisit.findFirst({
      where: { id, userId },
    })

    if (!visit) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: visit })
  } catch (error) {
    console.error('Error fetching prenatal visit:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 })
  }
}

// PATCH /api/prenatal-visits/[id] - 更新记录（标记完成等）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const { id } = await params
    const existing = await prisma.prenatalVisit.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    const body = await request.json()
    const data: Record<string, unknown> = {}
    if (typeof body.isCompleted === 'boolean') data.isCompleted = body.isCompleted
    if (typeof body.notes === 'string') data.notes = body.notes

    const updated = await prisma.prenatalVisit.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Error updating prenatal visit:', error)
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE /api/prenatal-visits/[id] - 删除记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const { id } = await params
    const existing = await prisma.prenatalVisit.findFirst({ where: { id, userId } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    }

    await prisma.prenatalVisit.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prenatal visit:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 })
  }
}
