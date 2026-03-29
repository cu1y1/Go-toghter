"use client"

import { useState } from 'react'
import { BabyInfoCard } from './baby-info-card'
import { TodayMealPlan } from './today-meal-plan'
import { DailyTipCard, getTipsByWeek } from './daily-tip-card'
import { RecommendedRecipes, getRecommendedRecipes } from './recommended-recipes'
import { MEAL_TYPES } from '@/lib/constants'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserStore } from '@/store/user-store'
import { Skeleton } from '@/components/ui/skeleton'

export function HomeTab() {
  const { user } = useUserStore()
  const isLoading = !user
  
  const userInfo = {
    babyName: user?.babyName || '小宝贝',
    currentWeek: user?.pregnancyWeek || 20,
    points: user?.points || 180,
    dueDate: user?.dueDate ? new Date(user.dueDate) : new Date(Date.now() + 140 * 24 * 60 * 60 * 1e3)
  }
  
  const [mealStatus] = useState(() => 
    Object.keys(MEAL_TYPES).map(type => ({
      type: type as keyof typeof MEAL_TYPES,
      completed: false,
      points: 10
    }))
  )
  const [todayPoints, setTodayPoints] = useState(0)
  const tips = getTipsByWeek(userInfo.currentWeek)
  const recipes = getRecommendedRecipes()

  const handleCheckIn = (mealType: keyof typeof MEAL_TYPES) => {
    setTodayPoints(prev => prev + 10)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 dark:from-orange-950 dark:via-gray-900 dark:to-amber-950">
        <ScrollArea className="h-screen">
          <div className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-24">
            <Skeleton className="h-20 mx-auto w-48" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 dark:from-orange-950 dark:via-gray-900 dark:to-amber-950">
      <ScrollArea className="h-screen">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-24">
          <div className="text-center py-2">
            <h1 className="text-xl font-bold text-foreground">你好，准妈妈 👋</h1>
            <p className="text-sm text-muted-foreground mt-1">今天是宝宝陪伴你的第 {userInfo.currentWeek * 7} 天</p>
          </div>
          
          <BabyInfoCard {...userInfo} />
          <TodayMealPlan mealStatus={mealStatus} todayPoints={todayPoints} onCheckIn={handleCheckIn} />
          {tips.length > 0 && <DailyTipCard tip={tips[0]} onViewDetail={() => {}} />}
          <RecommendedRecipes recipes={recipes} onRecipeClick={() => {}} />
          
          <div className="h-4" />
        </div>
      </ScrollArea>
    </div>
  )
}