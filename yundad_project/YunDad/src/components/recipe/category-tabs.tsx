'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type MealCategory = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'morning_snack' | 'afternoon_snack' | 'evening_snack'

interface Category {
  id: MealCategory
  name: string
  icon: string
}

const categories: Category[] = [
  { id: 'all', name: '全部', icon: '🍽️' },
  { id: 'breakfast', name: '早餐', icon: '🌅' },
  { id: 'lunch', name: '午餐', icon: '☀️' },
  { id: 'dinner', name: '晚餐', icon: '🌙' },
  { id: 'morning_snack', name: '上午加餐', icon: '🍎' },
  { id: 'afternoon_snack', name: '下午加餐', icon: '🥛' },
  { id: 'evening_snack', name: '晚间加餐', icon: '🍪' },
]

interface CategoryTabsProps {
  activeCategory: MealCategory
  onCategoryChange: (category: MealCategory) => void
  className?: string
}

export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  className,
}: CategoryTabsProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
              activeCategory === category.id
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-orange-50 border border-orange-100'
            )}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
