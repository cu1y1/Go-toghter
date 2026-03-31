'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight, Apple, Calendar, AlertCircle, Loader2 } from 'lucide-react'

interface KnowledgeArticle {
  id: string
  title: string
  category: string
  preview: string
}

interface KnowledgeLinkProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  bgColor: string
  articleId?: string
}

function KnowledgeLinkCard({ icon, title, description, color, bgColor, articleId }: KnowledgeLinkProps) {
  const handleClick = () => {
    if (articleId) {
      // 跳转到知识文章页面
      window.location.href = `/knowledge/${articleId}`
    }
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-0 overflow-hidden group" 
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>
            <span className={color}>{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
            <p className="text-xs text-gray-400 truncate">{description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-orange-400 transition-colors" />
        </div>
      </CardContent>
    </Card>
  )
}

// 根据分类获取文章
async function fetchArticlesByCategory(category: string): Promise<KnowledgeArticle[]> {
  try {
    const res = await fetch(`/api/knowledge?category=${category}&limit=3`)
    const data = await res.json()
    if (data.success && data.data?.list) {
      return data.data.list
    }
    return []
  } catch (error) {
    console.error('获取知识文章失败:', error)
    return []
  }
}

export function KnowledgeLinks() {
  const [articles, setArticles] = useState<Record<string, KnowledgeArticle[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      setLoading(true)
      const categories = ['nutrition', 'knowledge', 'faq']
      const results: Record<string, KnowledgeArticle[]> = {}
      
      await Promise.all(
        categories.map(async (cat) => {
          results[cat] = await fetchArticlesByCategory(cat)
        })
      )
      
      setArticles(results)
      setLoading(false)
    }
    
    loadArticles()
  }, [])

  // 默认链接（当 API 无数据时使用）
  const defaultLinks = [
    { category: 'nutrition', title: '饮食禁忌', description: '孕期饮食注意事项', icon: Apple, color: 'text-green-500', bgColor: 'bg-green-50' },
    { category: 'knowledge', title: '产检时间表', description: '孕期检查时间安排', icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { category: 'faq', title: '孕期注意事项', description: '重要提醒与建议', icon: AlertCircle, color: 'text-purple-500', bgColor: 'bg-purple-50' },
  ]

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700">相关知识</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
          <span className="ml-2 text-sm text-gray-400">加载中...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
        {defaultLinks.map((link) => {
          const categoryArticles = articles[link.category] || []
          const firstArticle = categoryArticles[0]
          
          return (
            <KnowledgeLinkCard
              key={link.category}
              icon={<link.icon className="w-5 h-5" />}
              title={firstArticle?.title || link.title}
              description={firstArticle?.preview || link.description}
              color={link.color}
              bgColor={link.bgColor}
              articleId={firstArticle?.id}
            />
          )
        })}
      </div>
    )}
    </div>
  )
}