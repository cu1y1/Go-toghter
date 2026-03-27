'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight, Apple, Calendar, AlertCircle } from 'lucide-react'

interface KnowledgeLinkProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  bgColor: string
}

function KnowledgeLinkCard({ icon, title, description, color, bgColor }: KnowledgeLinkProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border-0 overflow-hidden group">
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

export function KnowledgeLinks() {
  const links = [
    {
      icon: <Apple className="w-5 h-5" />,
      title: '饮食禁忌',
      description: '孕期饮食注意事项',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: '产检时间表',
      description: '孕期检查时间安排',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      title: '孕期注意事项',
      description: '重要提醒与建议',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700">相关知识</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {links.map((link) => (
          <KnowledgeLinkCard key={link.title} {...link} />
        ))}
      </div>
    </div>
  )
}
