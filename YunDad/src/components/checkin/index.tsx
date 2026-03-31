'use client'

import { useState, useMemo, useCallback } from 'react'
import { LevelCard } from './level-card'
import { CalendarView } from './calendar-view'
import { MonthlyStats } from './monthly-stats'
import { TodayDetail, CheckInRecord } from './today-detail'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MEAL_TYPES, LEVEL_CONFIG } from '@/lib/constants'
import { useTabStore } from '@/store/tab-store'
import { getDaysInMonth, format, subDays, addDays } from 'date-fns'

// 打卡日期记录类型
interface CalendarCheckInRecord {
  date: Date
  count: number
}

// 用户信息类型
interface UserInfo {
  level: number
  points: number
}

// 食谱名称模拟数据
const RECIPE_NAMES: Record<keyof typeof MEAL_TYPES, string[]> = {
  breakfast: ['燕麦粥配水果', '全麦面包+鸡蛋', '小米粥+馒头', '豆浆油条'],
  lunch: ['番茄炒蛋盖饭', '清蒸鱼+蔬菜', '红烧肉盖饭', '蔬菜沙拉'],
  dinner: ['排骨汤+米饭', '清炒时蔬', '红烧牛肉面', '家常豆腐'],
  snack_morning: ['酸奶+坚果', '水果拼盘', '牛奶饼干'],
  snack_afternoon: ['红枣枸杞茶', '核桃仁', '水果沙拉'],
  snack_evening: ['热牛奶', '小米粥', '燕麦片'],
}

// 随机选择食谱
function getRandomRecipe(mealType: keyof typeof MEAL_TYPES): string {
  const recipes = RECIPE_NAMES[mealType]
  return recipes[Math.floor(Math.random() * recipes.length)]
}

export function CheckInTab() {
  // 用户信息
  const [userInfo, setUserInfo] = useState<UserInfo>({
    level: 3,
    points: 180
  })
  
  // 当前选中的日期
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  // 今日打卡记录
  const [todayRecords, setTodayRecords] = useState<CheckInRecord[]>(() => 
    (Object.keys(MEAL_TYPES) as Array<keyof typeof MEAL_TYPES>).map(mealType => ({
      mealType,
      recipeName: getRandomRecipe(mealType),
      checkInTime: undefined,
      completed: false,
      points: 10
    }))
  )
  
  // 模拟打卡历史数据（过去30天）
  const checkedDates = useMemo<CalendarCheckInRecord[]>(() => {
    const records: CalendarCheckInRecord[] = []
    const today = new Date()
    
    // 生成过去30天的模拟打卡数据
    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i)
      // 随机决定是否打卡（周末概率低一点）
      const dayOfWeek = date.getDay()
      const checkInChance = dayOfWeek === 0 || dayOfWeek === 6 ? 0.5 : 0.8
      
      if (Math.random() < checkInChance) {
        records.push({
          date,
          count: Math.floor(Math.random() * 4) + 1 // 1-4次打卡
        })
      }
    }
    
    return records
  }, [])
  
  // 本月统计
  const monthlyStats = useMemo(() => {
    const today = new Date()
    const daysInMonth = getDaysInMonth(today)
    
    // 计算本月打卡天数
    const thisMonthRecords = checkedDates.filter(record => 
      record.date.getMonth() === today.getMonth() &&
      record.date.getFullYear() === today.getFullYear()
    )
    
    // 计算连续打卡天数
    let streak = 0
    const sortedDates = [...checkedDates]
      .filter(r => r.date <= today)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = subDays(today, i)
      const hasRecord = sortedDates.some(r => 
        format(r.date, 'yyyy-MM-dd') === format(expectedDate, 'yyyy-MM-dd')
      )
      if (hasRecord) {
        streak++
      } else {
        break
      }
    }
    
    return {
      checkedDays: thisMonthRecords.length,
      totalCheckIns: thisMonthRecords.reduce((sum, r) => sum + r.count, 0),
      streak,
      daysInMonth
    }
  }, [checkedDates])
  
  // 处理打卡
  const handleCheckIn = useCallback((mealType: keyof typeof MEAL_TYPES) => {
    setTodayRecords(prev => 
      prev.map(record => 
        record.mealType === mealType 
          ? { 
              ...record, 
              completed: true,
              checkInTime: format(new Date(), 'HH:mm')
            }
          : record
      )
    )
    
    // 增加积分
    setUserInfo(prev => {
      const newPoints = prev.points + 10
      // 检查是否升级
      const newLevel = LEVEL_CONFIG.find(
        l => newPoints >= l.minPoints && newPoints < l.maxPoints
      )?.level || prev.level
      
      return {
        points: newPoints,
        level: newLevel
      }
    })
  }, [])
  
  // 处理日期选择
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])
  
  // 处理添加餐食
  const handleAddMeal = useCallback((mealType: keyof typeof MEAL_TYPES) => {
    # 跳转到食谱页面
    setActiveTab('recipe')
  
  // 获取选中日期的打卡记录
  const selectedDateRecords = useMemo(() => {
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    
    if (isToday) {
      return todayRecords
    }
    
    // 查找历史记录
    const record = checkedDates.find(r => 
      format(r.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    )
    
    if (!record) {
      return (Object.keys(MEAL_TYPES) as Array<keyof typeof MEAL_TYPES>).map(mealType => ({
        mealType,
        recipeName: getRandomRecipe(mealType),
        checkInTime: undefined,
        completed: false,
        points: 10
      }))
    }
    
    // 模拟历史打卡记录
    const mealTypes = Object.keys(MEAL_TYPES) as Array<keyof typeof MEAL_TYPES>
    const completedMeals = mealTypes.slice(0, record.count)
    
    return mealTypes.map((mealType, index) => ({
      mealType,
      recipeName: getRandomRecipe(mealType),
      checkInTime: completedMeals.includes(mealType) 
        ? `${MEAL_TYPES[mealType].time.split('-')[0]}:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}`
        : undefined,
      completed: completedMeals.includes(mealType),
      points: 10
    }))
  }, [selectedDate, todayRecords, checkedDates])
  
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
          <LevelCard 
            level={userInfo.level}
            points={userInfo.points}
          />
          
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
            selectedDate={selectedDate}
          />
          
          {/* 今日打卡详情 */}
          <TodayDetail 
            records={selectedDateRecords}
            onCheckIn={handleCheckIn}
            onAddMeal={handleAddMeal}
            selectedDate={selectedDate}
          />
          
          {/* 底部留白 */}
          <div className="h-4" />
        </div>
      </ScrollArea>
    </div>
  )
}

export default CheckInTab
