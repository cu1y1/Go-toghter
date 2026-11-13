'use client'

import * as React from 'react'
import { RecipeCard, Recipe } from './recipe-card'
import { cn } from '@/lib/utils'

interface RecipeListProps {
  recipes: Recipe[]
  onFavoriteToggle: (id: string) => void
  onRecipeClick: (recipe: Recipe) => void
  className?: string
}

export function RecipeList({
  recipes,
  onFavoriteToggle,
  onRecipeClick,
  className,
}: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <div className="text-6xl mb-4">🍳</div>
        <p className="text-gray-500 text-center">暂无食谱</p>
        <p className="text-gray-400 text-sm text-center mt-1">试试其他分类或关键词</p>
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onFavoriteToggle={onFavoriteToggle}
          onClick={onRecipeClick}
        />
      ))}
    </div>
  )
}
