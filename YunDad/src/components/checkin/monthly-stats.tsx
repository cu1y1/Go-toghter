'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays, Flame, Trophy, Target } from 'lucide-react'

interface MonthlyStatsProps {
  // 本月打卡天数
  checkedDays: number
  // 本月总打卡次数
  totalCheckIns: number
  // 连续打卡天数
  streak: number
  // 本月总天数（用于计算完成率）
  daysInMonth?: number
}

export function MonthlyStats({ 
  checkedDays, 
  totalCheckIns, 
  streak,
  daysInMonth = 30 
}: MonthlyStatsProps) {
  // 计算打卡率
  const completionRate = Math.round((checkedDays / daysInMonth) * 100)
  
  // 统计项配置
  const stats = [
    {
      icon: <CalendarDays className="w-5 h-5" />,
      label: '已打卡天数',
      value: checkedDays,
      unit: '天',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100'
    },
    {
      icon: <Target className="w-5 h-5" />,
      label: '打卡次数',
      value: totalCheckIns,
      unit: '次',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100'
    },
    {
      icon: <Flame className="w-5 h-5" />,
      label: '连续打卡',
      value: streak,
      unit: '天',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      highlight: streak >= 7 // 连续7天高亮
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: '完成率',
      value: completionRate,
      unit: '%',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100'
    }
  ]
  
  return (
    <Card className="bg-white border-orange-100 shadow-lg">
      <CardContent className="p-4">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full" />
          <h3 className="text-base font-bold text-gray-800">本月统计</h3>
        </div>
        
        {/* 统计网格 */}
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bgColor} rounded-2xl p-3 text-center transition-transform hover:scale-105 ${
                stat.highlight ? 'ring-2 ring-orange-300 ring-offset-1' : ''
              }`}
            >
              {/* 图标 */}
              <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <span className={stat.color}>
                  {stat.icon}
                </span>
              </div>
              
              {/* 数值 */}
              <div className="flex items-baseline justify-center gap-0.5">
                <span className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-xs text-gray-500">
                  {stat.unit}
                </span>
              </div>
              
              {/* 标签 */}
              <div className="text-xs text-gray-500 mt-1 truncate">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        
        {/* 连续打卡激励文案 */}
        {streak >= 7 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              <span className="text-sm text-orange-600 font-medium">
                太棒了！连续打卡 {streak} 天，继续保持！
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MonthlyStats
