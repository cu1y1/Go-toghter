'use client'

import { useMemo, useCallback, useEffect } from 'react'
import { useUserStore } from '@/store/user-store'
import { useCheckInStore, MealType } from '@/store/checkin-store'
import { LevelCard } from './level-card'
import { CalendarView } from './calendar-view'
import { MonthlyStats } from './monthly-stats'
import { TodayDetail, CheckInRecord } from './today-detail'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MEAL_TYPES, LEVEL_CONFIG } from '@/lib/constants'
import { useTabStore } from '@/store/tab-store'
import { format } from 'date-fns'

export function CheckInTab() {
  const { user, updatePoints, isLoggedIn } = useUserStore()
  const setActiveTab = useTabStore((s) => s.setActiveTab)
  
  // 使用共享的打卡状态管理
  const {
    todayCheckins,
    monthlyStats: storeMonthlyStats,
    loading,
    error,
    selectedDate: storeSelectedDate,
    checkIn,
    getTodayCheckins,
    getMonthlyStats,
    setSelectedDate
  } = useCheckInStore()
  
  // 从后端获取打卡数据
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id || !isLoggedIn) return
      
      // 获取今日打卡记录
      await getTodayCheckins(user.id)
      
      // 获取本月统计
      await getMonthlyStats(user.id)
    }
    
    fetchData()
  }, [user?.id, isLoggedIn, getTodayCheckins, getMonthlyStats])
  
  // 转换今日打卡记录为 UI 需要的格式
  const todayRecords = useMemo(() => {
    if (!todayCheckins) {
      return (Object.keys(MEAL_TYPES) as Array<keyof typeof MEAL_TYPES>).map(mealType => ({
        mealType,
        recipeName: '',
        checkInTime: undefined,
        completed: false,
        points: 10
      }))
    }
    
    return (Object.keys(MEAL_TYPES) as Array<keyof typeof MEAL_TYPES>).map(mealType => {
      const checkIn = todayCheckins.checkIns.find((c) => c.mealType === mealType)
      return {
        mealType,
        recipeName: checkIn?.recipe?.name || '',
        checkInTime: checkIn ? format(new Date(checkIn.checkTime), 'HH:mm') : undefined,
        completed: !!checkIn,
        points: checkIn?.points || 10
      }
    })
  }, [todayCheckins])
  
  // 转换月度统计数据
  const monthlyStats = useMemo(() => {
    if (!storeMonthlyStats) {
      return {
        checkedDays: 0,
        totalCheckIns: 0,
        streak: 0,
        daysInMonth: new Date().getDate()
      }
    }
    
    return {
      checkedDays: storeMonthlyStats.summary.totalDays,
      totalCheckIns: storeMonthlyStats.summary.totalCheckIns,
      streak: storeMonthlyStats.summary.consecutiveDays,
      daysInMonth: new Date(storeMonthlyStats.year, storeMonthlyStats.month, 0).getDate()
    }
  }, [storeMonthlyStats])
  
  // 转换打卡日期数据
  const checkedDates = useMemo(() => {
    if (!storeMonthlyStats) return []
    
    return Object.keys(storeMonthlyStats.dailyStats).map(dateStr => ({
      date: new Date(dateStr),
      count: storeMonthlyStats.dailyStats[dateStr].count
    }))
  }, [storeMonthlyStats])
  
  // 处理打卡
  const handleCheckIn = useCallback(async (mealType: keyof typeof MEAL_TYPES) => {
    if (!user?.id) return
    
    const success = await checkIn(user.id, mealType as MealType)
    
    if (success && todayCheckins) {
      // 更新用户积分
      const totalPoints = todayCheckins.checkIns.reduce((sum, c) => sum + c.points, 0)
      updatePoints(totalPoints)
    } else if (error) {
      alert(error || '打卡失败')
    }
  }, [user, checkIn, todayCheckins, error, updatePoints])
  
  // 处理日期选择
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date.toISOString().split('T')[0])
  }, [setSelectedDate])
  
  // 处理添加餐食 - 跳转食谱页
  const handleAddMeal = useCallback((mealType: keyof typeof MEAL_TYPES) => {
    setActiveTab('recipe')
  }, [setActiveTab])
  
  // 获取选中日期的打卡记录（今日或历史）
  const selectedDateRecords = useMemo(() => {
    const isToday = storeSelectedDate === new Date().toISOString().split('T')[0]
    
    if (isToday) {
      return todayRecords
    }
    
    // 历史日期 - 暂时显示空状态
    return []
  }, [storeSelectedDate, todayRecords])

  // 未登录时显示提示
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">👶</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">欢迎使用孕爸爸</h2>
          <p className="text-gray-500 mb-4">请先设置您的孕期信息，开始健康打卡</p>
          <button 
            onClick={() => setActiveTab('onboarding')}
            className="px-6 py-3 bg-orange-500 text-white rounded-full font-medium"
          >
            立即开始
          </button>
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50">
      <ScrollArea className="h-screen">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-24">
          {/* 页面标题 */}
          <div className="text-center py-2">
            <h1 className="text-xl font-bold text-gray-800">
              打卡记录 📋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              记录每日饮食，积累健康积分
            </p>
          </div>
          
          {/* 等级进度卡片 */}
          {user && (
            <LevelCard 
              level={user.level}
              points={user.points}
            />
          )}
          
          {/* 月度统计 */}
          <MonthlyStats 
            checkedDays={monthlyStats.checkedDays}
            totalCheckIns={monthlyStats.totalCheckIns}
            streak={monthlyStats.streak}
            daysInMonth={monthlyStats.daysInMonth}
          />
          
          {/* 日历视图 */}
          <CalendarView 
            checkedDates={checkedDates}
            onDateSelect={handleDateSelect}
            selectedDate={new Date(storeSelectedDate)}
          />
          
          {/* 今日打卡详情 */}
          <TodayDetail 
            records={selectedDateRecords}
            onCheckIn={handleCheckIn}
            onAddMeal={handleAddMeal}
            selectedDate={new Date(storeSelectedDate)}
          />
          
          {/* 底部留白 */}
          <div className="h-4" />
        </div>
      </ScrollArea>
    </div>
  )
}

export default CheckInTab
