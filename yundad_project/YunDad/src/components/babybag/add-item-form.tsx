'use client'

import { useState } from 'react'
import { useBabyBagStore, CategoryType, CATEGORY_CONFIG } from '@/store/babybag-store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'

export function AddItemForm() {
  const [itemName, setItemName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('other')
  const { addItem } = useBabyBagStore()

  const handleAddItem = () => {
    const trimmedName = itemName.trim()
    if (trimmedName) {
      addItem(trimmedName, selectedCategory)
      setItemName('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddItem()
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <Plus className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-medium text-gray-700">添加自定义物品</span>
      </div>

      <div className="flex flex-col gap-3">
        {/* 物品名称输入 */}
        <Input
          placeholder="输入物品名称..."
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="border-gray-200 focus:border-orange-300 focus:ring-orange-200"
        />

        {/* 分类选择和添加按钮 */}
        <div className="flex gap-2">
          <Select 
            value={selectedCategory} 
            onValueChange={(value) => setSelectedCategory(value as CategoryType)}
          >
            <SelectTrigger className="flex-1 border-gray-200 focus:ring-orange-200">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleAddItem}
            disabled={!itemName.trim()}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加
          </Button>
        </div>

        {/* 快捷标签 */}
        <div className="flex flex-wrap gap-2 pt-2">
          <span className="text-xs text-gray-400">快捷添加：</span>
          {['吸奶器', '产妇帽', '护腕'].map((item) => (
            <button
              key={item}
              onClick={() => {
                addItem(item, 'mom')
              }}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors"
            >
              + {item}
            </button>
          ))}
          {['婴儿毯', '口水巾', '护臀膏'].map((item) => (
            <button
              key={item}
              onClick={() => {
                addItem(item, 'baby')
              }}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors"
            >
              + {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
