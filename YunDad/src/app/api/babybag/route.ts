import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取待产包物品
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    // 获取所有分类
    const categories = await db.babyBagCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          where: {
            OR: [
              { isDefault: true },
              { userId: userId || undefined },
            ],
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    // 统计数据
    let totalItems = 0
    let preparedItems = 0

    categories.forEach((category) => {
      totalItems += category.items.length
      preparedItems += category.items.filter((item) => item.isPrepared).length
    })

    return NextResponse.json({
      success: true,
      data: {
        categories,
        stats: {
          total: totalItems,
          prepared: preparedItems,
          progress: totalItems > 0 ? Math.round((preparedItems / totalItems) * 100) : 0,
        },
      },
    })
  } catch (error) {
    console.error('获取待产包物品失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 添加自定义物品
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { categoryId, name, description } = body

    if (!categoryId || !name) {
      return NextResponse.json(
        { success: false, error: '分类ID和物品名称不能为空' },
        { status: 400 }
      )
    }

    // 检查分类是否存在
    const category = await db.babyBagCategory.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { success: false, error: '分类不存在' },
        { status: 404 }
      )
    }

    // 获取当前最大排序值
    const maxSortOrder = await db.babyBagItem.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    })

    const item = await db.babyBagItem.create({
      data: {
        categoryId,
        name,
        description: description || null,
        isDefault: false,
        isPrepared: false,
        userId,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
      },
      include: {
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: item,
      message: '添加物品成功',
    })
  } catch (error) {
    console.error('添加物品失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
