import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取收藏列表
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // 获取总数
    const total = await db.favorite.count({
      where: { userId },
    })

    // 获取收藏列表
    const favorites = await db.favorite.findMany({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        recipe: {
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
          },
        },
      },
    })

    const list = favorites.map((fav) => ({
      id: fav.id,
      recipe: fav.recipe,
      createdAt: fav.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: {
        list,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
