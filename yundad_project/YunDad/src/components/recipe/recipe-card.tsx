'use client'

import * as React from 'react'
import { Heart, Star, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface Recipe {
  id: string
  name: string
  description: string
  image: string
  rating: number
  reviewCount: number
  cookTime: number
  weekRange: string
  category: string
  ingredients: string[]
  steps: string[]
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  videoUrl?: string
  isFavorite: boolean
}

interface RecipeCardProps {
  recipe: Recipe
  onFavoriteToggle: (id: string) => void
  onClick: (recipe: Recipe) => void
  className?: string
}

export function RecipeCard({
  recipe,
  onFavoriteToggle,
  onClick,
  className,
}: RecipeCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-orange-100 bg-white',
        className
      )}
      onClick={() => onClick(recipe)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavoriteToggle(recipe.id)
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-colors"
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-colors',
              recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
            )}
          />
        </button>
        <Badge className="absolute bottom-3 left-3 bg-orange-500 text-white border-0">
          适合 {recipe.weekRange}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
          {recipe.name}
        </h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">
              {recipe.rating}
            </span>
            <span className="text-xs text-gray-400">
              ({recipe.reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{recipe.cookTime}分钟</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
