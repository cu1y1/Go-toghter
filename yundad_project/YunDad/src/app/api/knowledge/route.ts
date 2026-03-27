import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取知识文章列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const where: {
      category?: string
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' }
        content?: { contains: string; mode: 'insensitive' }
        tags?: { contains: string; mode: 'insensitive' }
      }>
    } = {}

    // 分类筛选
    if (category) {
      where.category = category
    }

    // 搜索功能
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 获取总数
    const total = await db.knowledge.count({ where })

    // 获取分页数据
    const knowledgeList = await db.knowledge.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        category: true,
        tags: true,
        suitableWeeks: true,
        viewCount: true,
        createdAt: true,
        content: true, // 包含内容用于预览
      },
    })

    // 处理数据，生成预览
    const list = knowledgeList.map((item) => ({
      ...item,
      tags: item.tags ? JSON.parse(item.tags) : [],
      preview: item.content.length > 100 ? item.content.slice(0, 100) + '...' : item.content,
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
    console.error('获取知识文章列表失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
