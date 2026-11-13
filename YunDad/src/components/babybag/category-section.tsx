'use client'

import { useBabyBagStore } from '@/store/babybag-store'
import { BABY_BAG_CATEGORIES } from '@/lib/constants'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2, CheckCircle2 } from 'lucide-react'

interface CategorySectionProps {
  category: string
}

// 分类图标组件
function CategoryIcon({ category }: { category: string }) {
  const config = BABY_BAG_CATEGORIES.find(cat => cat.id === category)
  return <span className="text-lg">{config?.icon || '📦'}</span>
}

export function CategorySection({ category }: CategorySectionProps) {
  const { getItemsByCategory, getCategoryProgress, toggleItem, deleteItem } = useBabyBagStore()
  const items = getItemsByCategory(category)
  const { prepared, total } = getCategoryProgress(category)
  const config = BABY_BAG_CATEGORIES.find(cat => cat.id === category)

  if (items.length === 0) return null

  const allChecked = prepared === total
  const percentage = total > 0 ? Math.round((prepared / total) * 100) : 0

  return (
    <AccordionItem 
      value={category} 
      className="border-none rounded-xl overflow-hidden bg-white shadow-sm mb-3"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-orange-50/50 transition-colors">
        <div className="flex items-center gap-3 w-full pr-4">
          <CategoryIcon category={category} />
          <span className="font-semibold text-gray-800">{config?.name || '其他'}</span>
          
          {/* 进度标签 */}
          <div className="ml-auto flex items-center gap-2">
            {allChecked ? (
              <div className="flex items-center gap-1 bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">已完成</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                <span className="text-xs font-medium">{prepared}/{total}</span>
              </div>
            )}
          </div>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-0 pb-0">
        {/* 小进度条 */}
        <div className="px-4 pb-2">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                allChecked 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                  : 'bg-gradient-to-r from-orange-400 to-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* 物品列表 */}
        <div className="divide-y divide-gray-50">
          {items.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                item.isPrepared ? 'bg-green-50/50' : 'hover:bg-gray-50'
              }`}
            >
              <Checkbox
                id={item.id}
                checked={item.isPrepared}
                onCheckedChange={() => toggleItem('current-user-id', item.id)}
                className={`data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 ${
                  item.isPrepared ? 'ring-2 ring-orange-200' : ''
                }`}
              />
              
              <label 
                htmlFor={item.id} 
                className={`flex-1 text-sm cursor-pointer transition-all ${
                  item.isPrepared 
                    ? 'text-gray-400 line-through' 
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </label>
              
              {/* 自定义物品标签 */}
              {!item.isDefault && (
                <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                  自定义
                </span>
              )}
              
              {/* 删除按钮 */}
              {!item.isDefault && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50"
                  onClick={() => deleteItem('current-user-id', item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

// 所有分类列表组件
export function CategoryList() {
  const categories = BABY_BAG_CATEGORIES.map(cat => cat.id)

  return (
    <Accordion type="multiple" defaultValue={categories} className="w-full">
      {BABY_BAG_CATEGORIES.map((category) => (
        <CategorySection key={category.id} category={category.id} />
      ))}
    </Accordion>
  )
}
