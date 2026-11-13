'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Crown, Star, TrendingUp } from 'lucide-react'
import { LEVEL_CONFIG } from '@/lib/constants'

interface LevelCardProps {
  level: number
  points: number
}

// 获取等级配置
function getLevelInfo(level: number, points: number) {
  const currentLevelConfig = LEVEL_CONFIG.find(l => l.level === level) || LEVEL_CONFIG[0]
  const nextLevelConfig = LEVEL_CONFIG.find(l => l.level === level + 1)
  
  // 计算当前等级进度
  const currentLevelMin = currentLevelConfig.minPoints
  const nextLevelMin = nextLevelConfig?.minPoints || currentLevelConfig.maxPoints
  const progressInLevel = points - currentLevelMin
  const pointsNeededForLevel = nextLevelMin - currentLevelMin
  const progressPercent = Math.min(100, Math.round((progressInLevel / pointsNeededForLevel) * 100))
  
  return {
    name: currentLevelConfig.name,
    currentLevelMin,
    nextLevelMin,
    pointsToNext: nextLevelConfig ? nextLevelMin - points : null,
    progress: progressPercent,
    isMaxLevel: level === 6
  }
}

// 等级图标配置
const levelIcons: Record<number, { icon: React.ReactNode; gradient: string }> = {
  1: { 
    icon: <Star className="w-5 h-5" />, 
    gradient: 'from-gray-400 to-gray-500' 
  },
  2: { 
    icon: <Star className="w-5 h-5" />, 
    gradient: 'from-green-400 to-green-500' 
  },
  3: { 
    icon: <Star className="w-5 h-5" />, 
    gradient: 'from-blue-400 to-blue-500' 
  },
  4: { 
    icon: <Crown className="w-5 h-5" />, 
    gradient: 'from-purple-400 to-purple-500' 
  },
  5: { 
    icon: <Crown className="w-5 h-5" />, 
    gradient: 'from-orange-400 to-orange-500' 
  },
  6: { 
    icon: <Crown className="w-5 h-5" />, 
    gradient: 'from-amber-400 to-yellow-500' 
  },
}

export function LevelCard({ level, points }: LevelCardProps) {
  const levelInfo = getLevelInfo(level, points)
  const iconConfig = levelIcons[level] || levelIcons[1]
  
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 border-orange-100 shadow-lg">
      {/* 装饰背景 */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-200/30 to-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <CardContent className="p-4 relative z-10">
        {/* 头部：等级信息 */}
        <div className="flex items-center gap-4">
          {/* 等级徽章 */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${iconConfig.gradient} flex items-center justify-center shadow-lg text-white`}>
            {iconConfig.icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold text-gray-800">Lv.{level}</span>
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-0 text-xs"
              >
                {levelInfo.name}
              </Badge>
            </div>
            
            {/* 积分显示 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">当前积分</span>
              <span className="text-lg font-bold text-orange-600">{points}</span>
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
          </div>
        </div>
        
        {/* 等级进度条 */}
        {!levelInfo.isMaxLevel && levelInfo.pointsToNext !== null && (
          <div className="mt-4 pt-3 border-t border-orange-100/50">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-500">升级进度</span>
              <span className="text-orange-600 font-medium">
                还需 <span className="font-bold">{levelInfo.pointsToNext}</span> 积分升级
              </span>
            </div>
            <Progress 
              value={levelInfo.progress} 
              className="h-2.5 bg-orange-100"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Lv.{level}</span>
              <span>Lv.{level + 1}</span>
            </div>
          </div>
        )}
        
        {/* 满级显示 */}
        {levelInfo.isMaxLevel && (
          <div className="mt-4 pt-3 border-t border-orange-100/50">
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <Crown className="w-5 h-5" />
              <span className="font-bold">恭喜达成最高等级！</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default LevelCard
