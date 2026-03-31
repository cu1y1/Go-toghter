"use client"

import { useUserStore } from '@/store/user-store'
import { FetalMovementCounter } from '@/components/fetal-movement/fetal-movement-counter'
import { PrenatalReminder } from '@/components/health/prenatal-remoteer'
import { ContractionRecorder } from '@/components/health/contraction-recorder'
import { BabyGrowth } from '@/components/health/baby- growth'
import { RecipeRecommender } from '@/components/health/recipe-recommender'


export function HealthTab() {
  const { user } = useUserStore()
  const week = user?.pregnancyWeek || 20

  return (
    <div className="pb-20 p-4 space-y-4">
      <h1 className="text-2xl font-bold text-foreground">健康监测</h1>
      
      <BabyGrowth />
      <RecipeRecommender pregnancyWeek={week} />
      
      <FetalMovementCounter userId={user?.id || 'demo'} />
      <PrenatalReminder userId={user?.id || 'demo'} />
      <ContractionRecorder userId={user?.id || 'demo'} />
    </div>
  )
}