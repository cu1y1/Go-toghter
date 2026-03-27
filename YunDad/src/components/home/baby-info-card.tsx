'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Baby, Crown, Ruler, Weight } from 'lucide-react'
import { getBabySizeByWeek, getLevelByPoints } from '@/lib/utils'

interface BabyInfoCardProps {
  babyName: string
  currentWeek: number
  points: number
  dueDate: Date
}

export function BabyInfoCard({ babyName, currentWeek, points, dueDate }: BabyInfoCardProps) {
  const babySize = getBabySizeByWeek(currentWeek)
  const levelInfo = getLevelByPoints(points)
  
  // 计算孕期进度（0-100%）
  const progressPercent = Math.min(100, Math.round((currentWeek / 40) * 100))
  
  // 计算距离预产期天数
  const today = new Date()
  const diffTime = dueDate.getTime() - today.getTime()
  const daysToDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 border-orange-100 shadow-lg">
      {/* 装饰背景 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <CardContent className="p-5 relative z-10">
        {/* 头部：宝宝昵称和等级 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{babyName}</h2>
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-0 text-xs"
              >
                <Crown className="w-3 h-3 mr-1" />
                Lv.{levelInfo.level} {levelInfo.name}
              </Badge>
            </div>
          </div>
          
          {/* 积分信息 */}
          <div className="text-right">
            <div className="text-sm text-gray-500">积分</div>
            <div className="text-xl font-bold text-orange-600">{points}</div>
          </div>
        </div>
        
        {/* 孕周信息 */}
        <div className="bg-white/80 rounded-2xl p-4 mb-4 shadow-sm border border-orange-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-gray-500 mb-1">当前孕周</div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-orange-600">{currentWeek}</span>
                <span className="text-gray-600">周</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">距离预产期</div>
              <div className="text-lg font-semibold text-gray-700">{daysToDue} 天</div>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>孕期进度</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress 
              value={progressPercent} 
              className="h-2.5 bg-orange-100"
            />
          </div>
        </div>
        
        {/* 宝宝大小信息 */}
        <div className="grid grid-cols-3 gap-3">
          {/* 大小比喻 */}
          <div className="bg-gradient-to-br from-orange-100 to-amber-50 rounded-xl p-3 text-center border border-orange-100/50">
            <div className="text-2xl mb-1">🍈</div>
            <div className="text-xs text-gray-500 mb-1">大小比喻</div>
            <div className="text-sm font-semibold text-gray-800 truncate">{babySize.size}</div>
          </div>
          
          {/* 身长 */}
          <div className="bg-gradient-to-br from-orange-100 to-amber-50 rounded-xl p-3 text-center border border-orange-100/50">
            <Ruler className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <div className="text-xs text-gray-500 mb-1">预估身长</div>
            <div className="text-sm font-semibold text-gray-800">
              {babySize.length >= 10 
                ? `${(babySize.length / 10).toFixed(1)} cm` 
                : `${babySize.length} cm`}
            </div>
          </div>
          
          {/* 体重 */}
          <div className="bg-gradient-to-br from-orange-100 to-amber-50 rounded-xl p-3 text-center border border-orange-100/50">
            <Weight className="w-5 h-5 mx-auto mb-1 text-orange-500" />
            <div className="text-xs text-gray-500 mb-1">预估体重</div>
            <div className="text-sm font-semibold text-gray-800">
              {babySize.weight >= 1000 
                ? `${(babySize.weight / 1000).toFixed(2)} kg` 
                : `${babySize.weight} g`}
            </div>
          </div>
        </div>
        
        {/* 等级进度 */}
        {levelInfo.pointsToNext && (
          <div className="mt-4 pt-3 border-t border-orange-100/50">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>距离下一等级</span>
              <span>还需 {levelInfo.pointsToNext} 积分</span>
            </div>
            <Progress 
              value={levelInfo.progress} 
              className="h-1.5 bg-orange-100"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
