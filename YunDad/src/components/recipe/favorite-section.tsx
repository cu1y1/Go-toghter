'use client'

import * as React from 'react'
import { Heart } from 'lucide-react'
import { Recipe } from './recipe-card'
import { cn } from '@/lib/utils'

interface FavoriteSectionProps {
  favorites: Recipe[]
  onRecipeClick: (recipe: Recipe) => void
  onFavoriteToggle: (id: string) => void
  className?: string
}

export function FavoriteSection({
  favorites,
  onRecipeClick,
  onFavoriteToggle,
  className,
}: FavoriteSectionProps) {
  if (favorites.length === 0) return null

  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        <h2 className="font-semibold text-gray-900">我的收藏</h2>
        <span className="text-sm text-gray-500">({favorites.length})</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {favorites.map((recipe) => (
          <div
            key={recipe.id}
            className="flex-shrink-0 w-32 cursor-pointer group"
            onClick={() => onRecipeClick(recipe)}
          >
            <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFavoriteToggle(recipe.id)
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 shadow-sm"
              >
                <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              </button>
            </div>
            <p className="text-sm font-medium text-gray-800 line-clamp-1">
              {recipe.name}
            </p>
            <p className="text-xs text-gray-500">{recipe.cookTime}分钟</p>
          </div>
        ))}
      </div>
    </div>
  )
}
