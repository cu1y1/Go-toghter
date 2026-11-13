'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, Flame, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Recipe {
  id: string
  name: string
  image: string
  rating: number
  cookTime: number // 分钟
  calories: number
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

interface RecommendedRecipesProps {
  recipes: Recipe[]
  onRecipeClick?: (recipeId: string) => void
}

const difficultyLabels: Record<Recipe['difficulty'], string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

const difficultyColors: Record<Recipe['difficulty'], string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700'
}

export function RecommendedRecipes({ recipes, onRecipeClick }: RecommendedRecipesProps) {
  return (
    <Card className="bg-white border-orange-100 shadow-md overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="text-xl">📖</span>
            推荐食谱
          </CardTitle>
          <button className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium">
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="px-5 pb-4">
        {/* 横向滚动的食谱卡片 */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => onRecipeClick?.(recipe.id)}
              className="flex-shrink-0 w-36 cursor-pointer group"
            >
              {/* 图片 */}
              <div className="relative w-36 h-28 rounded-xl overflow-hidden mb-2.5 shadow-sm">
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* 难度标签 */}
                <Badge 
                  className={cn(
                    "absolute top-2 left-2 text-[10px] px-1.5 py-0 h-5 border-0",
                    difficultyColors[recipe.difficulty]
                  )}
                >
                  {difficultyLabels[recipe.difficulty]}
                </Badge>
              </div>
              
              {/* 名称 */}
              <h4 className="text-sm font-semibold text-gray-800 mb-1.5 truncate group-hover:text-orange-600 transition-colors">
                {recipe.name}
              </h4>
              
              {/* 评分 */}
              <div className="flex items-center gap-1 mb-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-gray-700">{recipe.rating.toFixed(1)}</span>
              </div>
              
              {/* 信息 */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{recipe.cookTime}分钟</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  <span>{recipe.calories}卡</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 模拟推荐食谱数据
export function getRecommendedRecipes(): Recipe[] {
  return [
    {
      id: '1',
      name: '番茄牛肉炖土豆',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      rating: 4.8,
      cookTime: 45,
      calories: 320,
      tags: ['补铁', '高蛋白'],
      difficulty: 'medium'
    },
    {
      id: '2',
      name: '清蒸鲈鱼',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
      rating: 4.9,
      cookTime: 25,
      calories: 180,
      tags: ['DHA', '低脂'],
      difficulty: 'easy'
    },
    {
      id: '3',
      name: '菠菜猪肝汤',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
      rating: 4.5,
      cookTime: 20,
      calories: 150,
      tags: ['补铁', '叶酸'],
      difficulty: 'easy'
    },
    {
      id: '4',
      name: '核桃芝麻糊',
      image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop',
      rating: 4.7,
      cookTime: 15,
      calories: 200,
      tags: ['DHA', '健脑'],
      difficulty: 'easy'
    },
    {
      id: '5',
      name: '红枣银耳羹',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      rating: 4.6,
      cookTime: 60,
      calories: 120,
      tags: ['补血', '养颜'],
      difficulty: 'easy'
    }
  ]
}
