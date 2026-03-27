'use client'

import { ProgressHeader } from './progress-header'
import { CategoryList } from './category-section'
import { AddItemForm } from './add-item-form'
import { KnowledgeLinks } from './knowledge-links'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Package } from 'lucide-react'

export function BabyBagTab() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
      {/* 头部标题 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-orange-100">
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              待产包
            </span>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="p-4 space-y-4 pb-8">
          {/* 准备进度 */}
          <ProgressHeader />

          {/* 添加物品表单 */}
          <AddItemForm />

          {/* 分类物品列表 */}
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">物品清单</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <CategoryList />
          </div>

          {/* 知识链接入口 */}
          <KnowledgeLinks />
        </div>
      </ScrollArea>
    </div>
  )
}

export { ProgressHeader } from './progress-header'
export { CategoryList, CategorySection } from './category-section'
export { AddItemForm } from './add-item-form'
export { KnowledgeLinks } from './knowledge-links'
