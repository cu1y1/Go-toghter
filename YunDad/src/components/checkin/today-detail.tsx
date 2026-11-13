'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Clock, ChefHat, Plus } from 'lucide-react'
import { MEAL_TYPES } from '@/lib/constants'

// 打卡记录类型
export interface CheckInRecord {
  mealType: keyof typeof MEAL_TYPES
  recipeName: string
  checkInTime?: string
  completed: boolean
  points: number
}

interface TodayDetailProps {
  records: CheckInRecord[]
  onCheckIn: (mealType: keyof typeof MEAL_TYPES) => void
  onAddMeal?: (mealType: keyof typeof MEAL_TYPES) => void
  selectedDate?: Date
}

// 餐次时间状态
function getMealStatus(mealType: keyof typeof MEAL_TYPES): 'past' | 'current' | 'future' {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTime = currentHour * 60 + currentMinute
  
  // 时间范围映射
  const timeRanges: Record<keyof typeof MEAL_TYPES, { start: number; end: number }> = {
    breakfast: { start: 7 * 60, end: 9 * 60 },
    lunch: { start: 11 * 60 + 30, end: 13 * 60 },
    dinner: { start: 18 * 60, end: 19 * 60 + 30 },
    snack_morning: { start: 10 * 60, end: 10 * 60 + 30 },
    snack_afternoon: { start: 15 * 60, end: 15 * 60 + 30 },
    snack_evening: { start: 20 * 60, end: 20 * 60 + 30 },
  }
  
  const range = timeRanges[mealType]
  
  if (currentTime > range.end) return 'past'
  if (currentTime >= range.start && currentTime <= range.end) return 'current'
  return 'future'
}

export function TodayDetail({ 
  records, 
  onCheckIn,
  onAddMeal,
  selectedDate 
}: TodayDetailProps) {
  const isToday = !selectedDate || 
    (selectedDate.toDateString() === new Date().toDateString())
  
  // 获取餐次记录
  const getMealRecord = (mealType: keyof typeof MEAL_TYPES) => {
    return records.find(r => r.mealType === mealType)
  }
  
  // 完成统计
  const completedCount = records.filter(r => r.completed).length
  const totalPoints = records.filter(r => r.completed).reduce((sum, r) => sum + r.points, 0)
  
  return (
    <Card className="bg-white border-orange-100 shadow-lg">
      <CardContent className="p-4">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full" />
            <h3 className="text-base font-bold text-gray-800">
              {isToday ? '今日打卡' : '打卡详情'}
            </h3>
          </div>
          
          {/* 完成统计 */}
          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary"
              className="bg-orange-100 text-orange-600 border-0"
            >
              <Check className="w-3 h-3 mr-1" />
              {completedCount}/{Object.keys(MEAL_TYPES).length}
            </Badge>
            <Badge 
              variant="secondary"
              className="bg-amber-100 text-amber-600 border-0"
            >
              +{totalPoints} 积分
            </Badge>
          </div>
        </div>
        
        {/* 餐次列表 */}
        <div className="space-y-3">
          {(Object.keys(MEAL_TYPES) as Array<keyof typeof MEAL_TYPES>).map(mealType => {
            const mealInfo = MEAL_TYPES[mealType]
            const record = getMealRecord(mealType)
            const status = isToday ? getMealStatus(mealType) : 'past'
            const isCompleted = record?.completed
            
            return (
              <div
                key={mealType}
                className={`
                  relative rounded-2xl p-4 transition-all duration-200
                  ${isCompleted 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100' 
                    : status === 'current'
                      ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 shadow-sm'
                      : 'bg-gray-50 border border-gray-100'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* 图标 */}
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                    ${isCompleted 
                      ? 'bg-green-100' 
                      : status === 'current'
                        ? 'bg-orange-100'
                        : 'bg-gray-100'
                    }
                  `}>
                    {mealInfo.icon}
                  </div>
                  
                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${
                        isCompleted ? 'text-green-700' : 'text-gray-800'
                      }`}>
                        {mealInfo.name}
                      </span>
                      {status === 'current' && !isCompleted && (
                        <Badge className="bg-orange-500 text-white text-xs border-0 animate-pulse">
                          进行中
                        </Badge>
                      )}
                      {isCompleted && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* 时间 */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Clock className="w-3 h-3" />
                      <span>{mealInfo.time}</span>
                    </div>
                    
                    {/* 食谱信息 */}
                    {isCompleted && record ? (
                      <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 truncate">
                          {record.recipeName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {record.checkInTime}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400">
                        {status === 'past' ? '已过打卡时间' : '待打卡'}
                      </div>
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  {!isCompleted && status !== 'past' && isToday && (
                    <Button
                      size="sm"
                      onClick={() => onCheckIn(mealType)}
                      className={`
                        h-9 px-4 shrink-0
                        ${status === 'current'
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }
                      `}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      打卡
                    </Button>
                  )}
                  
                  {/* 添加食谱按钮 */}
                  {isCompleted && record && onAddMeal && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAddMeal(mealType)}
                      className="h-9 px-3 shrink-0 text-green-600 hover:bg-green-50"
                    >
                      查看
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* 全部完成提示 */}
        {completedCount === Object.keys(MEAL_TYPES).length && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-green-700">
                  恭喜完成今日所有打卡！
                </div>
                <div className="text-xs text-green-600">
                  获得 {totalPoints} 积分，继续保持！
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TodayDetail
