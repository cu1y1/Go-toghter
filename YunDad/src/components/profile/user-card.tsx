'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  Calendar, 
  Baby,
  Camera,
  Sparkles
} from 'lucide-react'
import { getLevelByPoints, formatDate } from '@/lib/utils'

interface UserCardProps {
  // 用户头像URL
  avatar: string | null
  // 宝宝昵称
  babyName: string
  // 预产期
  dueDate: Date
  // 当前孕周
  pregnancyWeek: number
  // 用户积分
  points: number
  // 用户等级
  level: number
  // 点击头像更换回调
  onAvatarClick?: () => void
}

export function UserCard({
  avatar,
  babyName,
  dueDate,
  pregnancyWeek,
  points,
  level,
  onAvatarClick
}: UserCardProps) {
  // 获取等级信息
  const levelInfo = getLevelByPoints(points)
  
  // 格式化预产期显示
  const dueDateDisplay = formatDate(dueDate, 'YYYY年MM月DD日')
  
  // 计算孕期进度（0-100%）
  const progressPercent = Math.min(100, Math.round((pregnancyWeek / 40) * 100))
  
  // 计算距离预产期天数
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDateOnly = new Date(dueDate)
  dueDateOnly.setHours(0, 0, 0, 0)
  const diffTime = dueDateOnly.getTime() - today.getTime()
  const daysToDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  // 获取等级图标颜色
  const getLevelColor = (lvl: number) => {
    if (lvl >= 8) return 'from-purple-500 to-pink-500'
    if (lvl >= 5) return 'from-orange-500 to-amber-500'
    return 'from-orange-400 to-amber-400'
  }
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 shadow-lg">
      {/* 装饰背景 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 装饰圆圈 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 right-0 w-24 h-24 bg-white/5 rounded-full transform translate-x-1/2" />
        
        {/* 星星装饰 */}
        <Sparkles className="absolute top-4 right-8 w-6 h-6 text-white/30" />
        <Sparkles className="absolute bottom-12 left-6 w-4 h-4 text-white/20" />
      </div>
      
      <div className="relative z-10 p-5">
        {/* 顶部：头像和基本信息 */}
        <div className="flex items-center gap-4">
          {/* 头像区域 */}
          <button 
            onClick={onAvatarClick}
            className="relative group"
            aria-label="更换头像"
          >
            <Avatar className="w-20 h-20 border-4 border-white/30 shadow-lg ring-2 ring-white/50">
              <AvatarImage src={avatar || undefined} alt={babyName} />
              <AvatarFallback className="bg-white/20 text-white text-xl">
                <Baby className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            {/* 相机图标 */}
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-orange-500" />
            </div>
          </button>
          
          {/* 用户信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white truncate">{babyName}</h2>
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-0 text-xs px-2 py-0.5"
              >
                Lv.{level}
              </Badge>
            </div>
            
            {/* 等级称号 */}
            <div className="flex items-center gap-1.5 mb-2">
              <Crown className="w-4 h-4 text-amber-200" />
              <span className="text-sm text-white/90 font-medium">{levelInfo.name}</span>
            </div>
            
            {/* 积分 */}
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-xs">积分</span>
              <span className="text-white font-bold text-lg">{points.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* 分隔线 */}
        <div className="my-4 h-px bg-white/20" />
        
        {/* 孕周信息 */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            {/* 当前孕周 */}
            <div>
              <div className="text-white/70 text-xs mb-1">当前孕周</div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{pregnancyWeek}</span>
                <span className="text-white/80 text-sm">周</span>
              </div>
            </div>
            
            {/* 预产期 */}
            <div className="text-right">
              <div className="flex items-center gap-1 text-white/70 text-xs mb-1">
                <Calendar className="w-3 h-3" />
                <span>预产期</span>
              </div>
              <div className="text-white font-medium text-sm">{dueDateDisplay}</div>
              <div className="text-white/70 text-xs mt-0.5">
                还有 {daysToDue} 天
              </div>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-white/70">
              <span>孕期进度</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-200 to-yellow-300 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* 等级进度 */}
        {levelInfo.pointsToNext && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
              <span>距离 Lv.{level + 1} 还需要</span>
              <span className="text-white font-medium">{levelInfo.pointsToNext} 积分</span>
            </div>
            <Progress 
              value={levelInfo.progress} 
              className="h-1.5 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-amber-200 [&>div]:to-yellow-300"
            />
          </div>
        )}
      </div>
    </div>
  )
}
