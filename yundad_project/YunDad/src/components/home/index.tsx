'use client'

import { useState, useCallback } from 'react'
import { BabyInfoCard } from './baby-info-card'
import { TodayMealPlan } from './today-meal-plan'
import { DailyTipCard, getTipsByWeek } from './daily-tip-card'
import { RecommendedRecipes, getRecommendedRecipes } from './recommended-recipes'
import { MEAL_TYPES } from '@/lib/constants'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserStore } from '@/store/user-store'

export function HomeTab() {
  // 从全局状态获取用户信息
  const { user } = useUserStore()
  
  // 默认用户数据
  const defaultUserInfo = {
    babyName: '小宝贝',
    currentWeek: 20,
    points: 180,
    dueDate: new Date(Date.now() + 140 * 24 * 60 * 60 * 1000) // 默认20周后
  }
  
  // 使用用户数据或默认数据
  const userInfo = {
    babyName: user?.babyName || defaultUserInfo.babyName,
    currentWeek: user?.pregnancyWeek || defaultUserInfo.currentWeek,
    points: user?.points || defaultUserInfo.points,
    dueDate: user?.dueDate ? new Date(user.dueDate) : defaultUserInfo.dueDate
  }
  
  // 今日餐食打卡状态
  const [mealStatus, setMealStatus] = useState(() => 
    Object.keys(MEAL_TYPES).map(type => ({
      type: type as keyof typeof MEAL_TYPES,
      completed: false,
      points: 10
    }))
  )
  
  // 今日积分
  const [todayPoints, setTodayPoints] = useState(0)
  
  // 获取小贴士
  const tips = getTipsByWeek(userInfo.currentWeek)
  
  // 获取推荐食谱
  const recipes = getRecommendedRecipes()
  
  // 打卡处理
  const handleCheckIn = useCallback((mealType: keyof typeof MEAL_TYPES) => {
    setMealStatus(prev => 
      prev.map(meal => 
        meal.type === mealType 
          ? { ...meal, completed: true }
          : meal
      )
    )
    setTodayPoints(prev => prev + 10)
  }, [])
  
  // 查看小贴士详情
  const handleViewTipDetail = useCallback((tipId: string) => {
    console.log('查看小贴士详情:', tipId)
    // TODO: 跳转到小贴士详情页或打开弹窗
  }, [])
  
  // 点击食谱
  const handleRecipeClick = useCallback((recipeId: string) => {
    console.log('查看食谱详情:', recipeId)
    // TODO: 跳转到食谱详情页
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50">
      {/* 滚动内容区域 */}
      <ScrollArea className="h-screen">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-24">
          {/* 欢迎语 */}
          <div className="text-center py-2">
            <h1 className="text-xl font-bold text-gray-800">
              你好，准妈妈 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              今天是宝宝陪伴你的第 {userInfo.currentWeek * 7} 天
            </p>
          </div>
          
          {/* 宝宝信息卡片 */}
          <BabyInfoCard 
            babyName={userInfo.babyName}
            currentWeek={userInfo.currentWeek}
            points={userInfo.points}
            dueDate={userInfo.dueDate}
          />
          
          {/* 今日饮食计划 */}
          <TodayMealPlan 
            mealStatus={mealStatus}
            todayPoints={todayPoints}
            onCheckIn={handleCheckIn}
          />
          
          {/* 每日小贴士 */}
          {tips.length > 0 && (
            <div className="space-y-4">
              <DailyTipCard 
                tip={tips[0]}
                onViewDetail={() => handleViewTipDetail(tips[0].id)}
              />
            </div>
          )}
          
          {/* 推荐食谱 */}
          <RecommendedRecipes 
            recipes={recipes}
            onRecipeClick={handleRecipeClick}
          />
          
          {/* 底部留白 */}
          <div className="h-4" />
        </div>
      </ScrollArea>
    </div>
  )
}

// 默认导出
export default HomeTab
