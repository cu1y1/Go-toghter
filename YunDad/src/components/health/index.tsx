"use client"

import { useUserStore } from '@/store/user-store'
import { FetalMovementCounter } from '@/components/fetal-movement/fetal-movement-counter'
import { PrenatalReminder } from '@/components/health/prenatal-reminder'
import { ContractionRecorder } from '@/components/health/contraction-recorder'
import { BabyGrowth } from '@/components/health/baby-growth'
import { RecipeRecommender } from '@/components/health/recipe-recommender'


const calculateCurrentWeek = (dueDate: Date | string): number => {
  if (!dueDate) return 20
  const due = dueDate instanceof Date ? dueDate : new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7))
  return Math.max(1, Math.min(40, 40 - diffWeeks))
}

export function HealthTab() {
  const { user, isLoggedIn } = useUserStore()
  const week = user?.dueDate ? calculateCurrentWeek(user.dueDate) : (user?.pregnancyWeek ?? 20)

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">请先设置孕期信息</p>
      </div>
    )
  }

  return (
    <div className="pb-20 p-4 space-y-4">
      <h1 className="text-2xl font-bold text-foreground">健康监测</h1>
      
      <BabyGrowth />
      <RecipeRecommender pregnancyWeek={week} />
      
      <FetalMovementCounter userId={user?.id} />
      <PrenatalReminder userId={user?.id} />
      <ContractionRecorder userId={user?.id} />
    </div>
  )
}