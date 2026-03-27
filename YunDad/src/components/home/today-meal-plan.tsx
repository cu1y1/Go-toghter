'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MEAL_TYPES } from '@/lib/constants'
import { CheckCircle, Circle, Star, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MealStatus {
  type: keyof typeof MEAL_TYPES
  completed: boolean
  points: number
}

interface TodayMealPlanProps {
  mealStatus: MealStatus[]
  todayPoints: number
  onCheckIn: (mealType: keyof typeof MEAL_TYPES) => void
}

export function TodayMealPlan({ mealStatus, todayPoints, onCheckIn }: TodayMealPlanProps) {
  // 按顺序显示的餐食类型
  const mealOrder: (keyof typeof MEAL_TYPES)[] = [
    'breakfast',
    'snack_morning',
    'lunch',
    'snack_afternoon',
    'dinner',
    'snack_evening'
  ]
  
  // 计算完成数量
  const completedCount = mealStatus.filter(m => m.completed).length
  const totalMeals = mealStatus.length
  
  return (
    <Card className="bg-white border-orange-100 shadow-md overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            今日饮食计划
          </CardTitle>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-orange-600">+{todayPoints} 积分</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-5 pb-4">
        {/* 进度指示 */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50 rounded-xl">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">今日进度</span>
              <span className="font-medium text-orange-600">{completedCount}/{totalMeals}</span>
            </div>
            <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalMeals) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* 餐食卡片网格 */}
        <div className="grid grid-cols-3 gap-3">
          {mealOrder.map((mealType) => {
            const meal = MEAL_TYPES[mealType]
            const status = mealStatus.find(m => m.type === mealType)
            const isCompleted = status?.completed || false
            
            return (
              <button
                key={mealType}
                onClick={() => !isCompleted && onCheckIn(mealType)}
                disabled={isCompleted}
                className={cn(
                  "relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200",
                  isCompleted 
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm" 
                    : "bg-white border-orange-100 hover:border-orange-300 hover:shadow-md active:scale-95 cursor-pointer"
                )}
              >
                {/* 完成标记 */}
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                
                {/* 图标 */}
                <div className={cn(
                  "text-2xl mb-1.5 transition-transform",
                  !isCompleted && "hover:scale-110"
                )}>
                  {meal.icon}
                </div>
                
                {/* 餐食名称 */}
                <div className={cn(
                  "text-xs font-medium mb-0.5",
                  isCompleted ? "text-green-700" : "text-gray-700"
                )}>
                  {meal.name}
                </div>
                
                {/* 时间 */}
                <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
                  <Clock className="w-2.5 h-2.5" />
                  {meal.time}
                </div>
                
                {/* 积分 */}
                {!isCompleted && (
                  <div className="mt-1.5 text-[10px] text-orange-500 font-medium">
                    +{status?.points || 10}分
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        {/* 全部完成提示 */}
        {completedCount === totalMeals && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 text-center">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">太棒了！今日饮食已全部打卡完成</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
