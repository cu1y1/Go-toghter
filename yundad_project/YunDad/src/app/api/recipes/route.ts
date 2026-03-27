import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取食谱列表（支持分类筛选、搜索）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mealType = searchParams.get('mealType')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const isRecommended = searchParams.get('isRecommended')

    const where: {
      mealType?: string
      isRecommended?: boolean
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' }
        description?: { contains: string; mode: 'insensitive' }
        tags?: { contains: string; mode: 'insensitive' }
      }>
    } = {}

    // 按餐食类型筛选
    if (mealType) {
      where.mealType = mealType
    }

    // 按是否推荐筛选
    if (isRecommended === 'true') {
      where.isRecommended = true
    }

    // 搜索功能
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 获取总数
    const total = await db.recipe.count({ where })

    // 获取分页数据
    const recipes = await db.recipe.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { isRecommended: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        mealType: true,
        nutrition: true,
        tags: true,
        rating: true,
        isRecommended: true,
        suitableWeeks: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        list: recipes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('获取食谱列表失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
