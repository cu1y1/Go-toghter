import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH /api/prenatal-visits/[id] - 更新产检记录
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const visit = await prisma.prenatalVisit.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json({ success: true, data: visit })
  } catch (error) {
    console.error('Error updating prenatal visit:', error)
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}