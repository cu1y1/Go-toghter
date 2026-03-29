import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/fetal-movements/[id] - 获取单条记录
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movement = await prisma.fetalMovement.findUnique({
      where: { id: params.id },
    })

    if (!movement) {
      return NextResponse. json({ success: false, error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: movement })
  } catch (error) {
    console.error('Error fetching fetal movement:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 })
  }
}

// DELETE /api/fetal-movements/[id] - 删除记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.fetalMovement.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting fetal movement:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 })
  }
}