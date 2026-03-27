'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Heart,
  Star,
  Clock,
  Users,
  Flame,
  Play,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { Recipe } from './recipe-card'
import { cn } from '@/lib/utils'

interface RecipeDetailProps {
  recipe: Recipe | null
  open: boolean
  onClose: () => void
  onFavoriteToggle: (id: string) => void
  onAddToMealPlan: (recipe: Recipe) => void
}

export function RecipeDetail({
  recipe,
  open,
  onClose,
  onFavoriteToggle,
  onAddToMealPlan,
}: RecipeDetailProps) {
  if (!recipe) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white">
        {/* 图片区域 */}
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white mb-2">{recipe.name}</h2>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{recipe.rating}</span>
                <span className="text-sm text-white/60">({recipe.reviewCount}评价)</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{recipe.cookTime}分钟</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onFavoriteToggle(recipe.id)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-colors"
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-colors',
                recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
              )}
            />
          </button>
          <Badge className="absolute top-4 left-4 bg-orange-500 text-white border-0">
            适合 {recipe.weekRange}
          </Badge>
        </div>

        <div className="p-6">
          {/* 描述 */}
          <p className="text-gray-600 mb-6">{recipe.description}</p>

          {/* 营养成分 */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            <NutritionItem
              icon={<Flame className="w-4 h-4 text-orange-500" />}
              label="热量"
              value={`${recipe.nutrition.calories}`}
              unit="kcal"
            />
            <NutritionItem
              icon={<div className="w-4 h-4 text-red-500 text-xs font-bold flex items-center justify-center">P</div>}
              label="蛋白质"
              value={`${recipe.nutrition.protein}`}
              unit="g"
            />
            <NutritionItem
              icon={<div className="w-4 h-4 text-yellow-500 text-xs font-bold flex items-center justify-center">C</div>}
              label="碳水"
              value={`${recipe.nutrition.carbs}`}
              unit="g"
            />
            <NutritionItem
              icon={<div className="w-4 h-4 text-blue-500 text-xs font-bold flex items-center justify-center">F</div>}
              label="脂肪"
              value={`${recipe.nutrition.fat}`}
              unit="g"
            />
            <NutritionItem
              icon={<div className="w-4 h-4 text-green-500 text-xs font-bold flex items-center justify-center">D</div>}
              label="纤维"
              value={`${recipe.nutrition.fiber}`}
              unit="g"
            />
          </div>

          <Separator className="my-6" />

          {/* 食材列表 */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">🥗</span>
              所需食材
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {recipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 rounded-lg px-3 py-2"
                >
                  <ChevronRight className="w-4 h-4 text-orange-400" />
                  {ingredient}
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* 做法步骤 */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="text-lg">👨‍🍳</span>
              做法步骤
            </h3>
            <div className="space-y-3">
              {recipe.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-medium">
                    {index + 1}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 视频教程 */}
          {recipe.videoUrl && (
            <>
              <Separator className="my-6" />
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-lg">📹</span>
                  视频教程
                </h3>
                <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator className="my-6" />

          {/* 底部按钮 */}
          <div className="flex gap-3">
            <Button
              onClick={() => onAddToMealPlan(recipe)}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-11 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加到饮食计划
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function NutritionItem({
  icon,
  label,
  value,
  unit,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
      {icon}
      <span className="text-xs text-gray-500 mt-1">{label}</span>
      <span className="text-sm font-semibold text-gray-800">
        {value}
        <span className="text-xs font-normal text-gray-500">{unit}</span>
      </span>
    </div>
  )
}
