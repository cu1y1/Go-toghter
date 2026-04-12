"use client"

import { useUserStore } from '@/store/user-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { weeklyProgress } from '@/lib/weekly-data'

const calculateCurrentWeek = (dueDate: Date | string): number => {
  if (!dueDate) return 20
  const due = dueDate instanceof Date ? dueDate : new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7))
  return Math.max(1, Math.min(40, 40 - diffWeeks))
}

export function BabyGrowth() {
  const { user } = useUserStore()
  const currentWeek = user?.dueDate ? calculateCurrentWeek(user.dueDate) : (user?.pregnancyWeek ?? 20)

  const currentData = weeklyProgress.find(w => w.week === currentWeek) || weeklyProgress[19]
  const nextWeek = weeklyProgress.find(w => w.week === currentWeek + 1)

  // 计算进度百分比
  const progressPercent = Math.min((currentWeek / 40) * 100, 100)

  // 获取水果尺寸对应的 emoji
  const getSizeEmoji = (size: string) => {
    const sizeMap: Record<string, string> = {
      "小嫩芽": "🌱", "芝麻": "⚫", "小扁豆": "🫘", "蓝莓": "🫐", "覆盆子": "🍇",
      "葡萄": "🍇", "金桔": "🍊", "无花果": "🍈", "李子": "🫐", "豌豆荚": "🫛",
      "柠檬": "🍋", "苹果": "🍎", "牛油果": "🥑", "萝卜": "🥕", "甜椒": "🫑",
      "芒果": "🥭", "香蕉": "🍌", "胡萝卜": "🥕", "木瓜": "🍈", "火龙果": "🔥",
      "椰子": "🥥", "花椰菜": "🥦", "生菜": "🥬", "花菜": "🥦", "茄子": "🍆",
      "西兰花": "🥦", "南瓜": "🎃", "卷心菜": "🥬", "菠萝": "🍍", "哈密瓜": "🍈",
      "甜瓜": "🍈", "西瓜": "🍉",
    }
    return sizeMap[size] || "👶"
  }

  if (!currentWeek) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="text-4xl mb-2">👶</div>
          <p className="text-gray-500">请先在个人资料中设置预产期</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          宝宝成长 👶
          <Badge variant="outline">孕{currentWeek}周</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-12 text-gray-500 mb-1">
            <span>孕早期</span>
            <span>孕中期</span>
            <span>孕晚期</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-500 mt-1">
            已完成 {Math.round(progressPercent)}%
          </div>
        </div>

        {/* 当前大小 */}
        <div className="text-center py-4 bg-gradient-to-b from-pink-50 to-purple-50 rounded-xl mb-4">
          <div className="text-6xl mb-2">{getSizeEmoji(currentData.size)}</div>
          <div className="text-2xl font-bold text-purple-600">{currentData.size}</div>
          <div className="text-gray-500">
            身长约 {currentData.length} cm · 体重约 {currentData.weight} g
          </div>
        </div>

        {/* 发育特征 */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">本周发育</div>
          <div className="p-3 bg-pink-50 rounded-lg text-sm text-gray-600">
            {currentData.description}
          </div>
        </div>

        {/* 下周预告 */}
        {nextWeek && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">下周预告</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getSizeEmoji(nextWeek.size)}</span>
              <div>
                <div className="text-sm font-medium">孕{nextWeek.week}周: {nextWeek.size}</div>
                <div className="text-xs text-gray-500">{nextWeek.description}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}