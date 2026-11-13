import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取知识详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const knowledge = await db.knowledge.findUnique({
      where: { id },
    })

    if (!knowledge) {
      return NextResponse.json(
        { success: false, error: '文章不存在' },
        { status: 404 }
      )
    }

    // 增加浏览次数
    await db.knowledge.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    // 解析JSON字段
    const knowledgeDetail = {
      ...knowledge,
      tags: knowledge.tags ? JSON.parse(knowledge.tags) : [],
    }

    return NextResponse.json({
      success: true,
      data: knowledgeDetail,
    })
  } catch (error) {
    console.error('获取知识详情失败:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
