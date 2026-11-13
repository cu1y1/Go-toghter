import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取食谱详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const recipe = await db.recipe.findUnique({
      where: { id },
      include: {
        _count: {
          select: { favorites: true },
        },
      },
    })

    if (!recipe) {
      return NextResponse.json(
        { success: false, error: '食谱不存在' },
        { status: 404 }
      )
    }

    // 解析JSON字段
    const recipeDetail = {
      ...recipe,
      ingredients: recipe.ingredients ? JSON.parse(recipe.ingredients) : [],
      steps: recipe.steps ? JSON.parse(recipe.steps) : [],
      nutrition: recipe.nutrition ? JSON.parse(recipe.nutrition) : null,
      tags: recipe.tags ? JSON.parse(recipe.tags) : [],
      favoriteCount: recipe._count.favorites,
    }

    return NextResponse.json({
      success: true,
      data: recipeDetail,
    })
  } catch (error) {
    console.error('获取食谱详情失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
