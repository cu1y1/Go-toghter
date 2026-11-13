import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 收藏食谱
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
    const { recipeId } = body

    if (!recipeId) {
      return NextResponse.json(
        { success: false, error: '食谱ID不能为空' },
        { status: 400 }
      )
    }

    // 检查食谱是否存在
    const recipe = await db.recipe.findUnique({
      where: { id: recipeId },
    })

    if (!recipe) {
      return NextResponse.json(
        { success: false, error: '食谱不存在' },
        { status: 404 }
      )
    }

    // 检查是否已收藏
    const existingFavorite = await db.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    })

    if (existingFavorite) {
      return NextResponse.json(
        { success: false, error: '已收藏该食谱' },
        { status: 400 }
      )
    }

    // 创建收藏
    const favorite = await db.favorite.create({
      data: {
        userId,
        recipeId,
      },
    })

    return NextResponse.json({
      success: true,
      data: favorite,
      message: '收藏成功',
    })
  } catch (error) {
    console.error('收藏食谱失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const recipeId = searchParams.get('recipeId')

    if (!recipeId) {
      return NextResponse.json(
        { success: false, error: '食谱ID不能为空' },
        { status: 400 }
      )
    }

    // 删除收藏
    const favorite = await db.favorite.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: favorite,
      message: '取消收藏成功',
    })
  } catch (error) {
    console.error('取消收藏失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误或收藏不存在' },
      { status: 500 }
    )
  }
}
