import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取今日饮食计划
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
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const planDate = new Date(dateStr)

    // 设置日期为当天的开始时间
    const startOfDay = new Date(planDate)
    startOfDay.setHours(0, 0, 0, 0)

    // 设置日期为当天的结束时间
    const endOfDay = new Date(planDate)
    endOfDay.setHours(23, 59, 59, 999)

    // 获取当天的饮食计划
    const mealPlans = await db.mealPlan.findMany({
      where: {
        userId,
        planDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { createdAt: 'asc' },
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
          },
        },
      },
    })

    // 按餐食类型分组
    const mealTypeMap: Record<string, typeof mealPlans> = {
      breakfast: [],
      snack_morning: [],
      lunch: [],
      snack_afternoon: [],
      dinner: [],
      snack_evening: [],
    }

    mealPlans.forEach((plan) => {
      if (mealTypeMap[plan.mealType]) {
        mealTypeMap[plan.mealType].push(plan)
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        date: dateStr,
        mealPlans: mealTypeMap,
        rawList: mealPlans,
        stats: {
          total: mealPlans.length,
          completed: mealPlans.filter((p) => p.isCompleted).length,
        },
      },
    })
  } catch (error) {
    console.error('获取饮食计划失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 添加饮食计划
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
    const { recipeId, mealType, planDate } = body

    if (!recipeId || !mealType || !planDate) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
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

    // 检查该日期该餐食类型是否已有计划
    const existingPlan = await db.mealPlan.findFirst({
      where: {
        userId,
        mealType,
        planDate: new Date(planDate),
      },
    })

    if (existingPlan) {
      return NextResponse.json(
        { success: false, error: '该餐食时间已有计划' },
        { status: 400 }
      )
    }

    const mealPlan = await db.mealPlan.create({
      data: {
        userId,
        recipeId,
        mealType,
        planDate: new Date(planDate),
        isCompleted: false,
      },
      include: {
        recipe: {
          select: {
            id: true,
            name: true,
            image: true,
            mealType: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: mealPlan,
      message: '添加饮食计划成功',
    })
  } catch (error) {
    console.error('添加饮食计划失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}

// 删除饮食计划
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
    const planId = searchParams.get('id')

    if (!planId) {
      return NextResponse.json(
        { success: false, error: '计划ID不能为空' },
        { status: 400 }
      )
    }

    // 验证计划是否属于该用户
    const existingPlan = await db.mealPlan.findFirst({
      where: { id: planId, userId },
    })

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: '饮食计划不存在或无权删除' },
        { status: 404 }
      )
    }

    await db.mealPlan.delete({
      where: { id: planId },
    })

    return NextResponse.json({
      success: true,
      message: '删除饮食计划成功',
    })
  } catch (error) {
    console.error('删除饮食计划失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
