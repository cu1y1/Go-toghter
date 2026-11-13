import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 更新物品状态
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    const { id } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { isPrepared, name, description } = body

    // 检查物品是否存在且属于用户或是默认物品
    const existingItem = await db.babyBagItem.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { isDefault: true },
        ],
      },
    })

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: '物品不存在或无权修改' },
        { status: 404 }
      )
    }

    const updateData: {
      isPrepared?: boolean
      name?: string
      description?: string | null
    } = {}

    if (isPrepared !== undefined) updateData.isPrepared = isPrepared
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description

    // 只有自定义物品才能修改名称和描述
    if ((name || description) && existingItem.isDefault) {
      return NextResponse.json(
        { success: false, error: '默认物品不能修改名称和描述' },
        { status: 400 }
      )
    }

    const item = await db.babyBagItem.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: item,
      message: '更新成功',
    })
  } catch (error) {
    console.error('更新物品状态失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除物品
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = request.headers.get('x-user-id')
    const { id } = await params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    // 检查物品是否存在且属于用户
    const existingItem = await db.babyBagItem.findFirst({
      where: {
        id,
        userId,
        isDefault: false, // 不能删除默认物品
      },
    })

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: '物品不存在、无权删除或为默认物品' },
        { status: 404 }
      )
    }

    await db.babyBagItem.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: '删除成功',
    })
  } catch (error) {
    console.error('删除物品失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
