'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useUserStore } from '@/store/user-store'
import { LevelCard } from './level-card'
import { CalendarView } from './calendar-view'
import { MonthlyStats } from './monthly-stats'
import { TodayDetail, CheckInRecord } from './today-detail'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MEAL_TYPES, LEVEL_CONFIG } from '@/lib/constants'
import { useTabStore } from '@/store/tab-store'
import { getDaysInMonth, format, subDays } from 'date-fns'

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

export function CheckInTab() {
  const { user, updatePoints, isLoggedIn } = useUserStore()
  const setActiveTab = useTabStore((s) => s.setActiveTab)
  
  // 用户信息 - 从 store 获取，无默认值
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  
  // 当前选中的日期
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  
  // 今日打卡记录 - 从 API 获取
  const [todayRecords, setTodayRecords] = useState<CheckInRecord[]>([])
  
  // 打卡历史数据 - 从 API 获取
  const [checkedDates, setCheckedDates] = useState<CalendarCheckInRecord[]>([])
  
  // 加载状态
  const [loading, setLoading] = useState(true)
  
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

  // 从后端获取打卡数据
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        
        // 获取用户信息
        const userRes = await fetch('/api/user', {
          headers: { 'x-user-id': user.id }
        })
        const userData = await userRes.json()
        if (userData.success) {
          setUserInfo({ level: userData.data.level, points: userData.data.points })
        }
        
        // 获取今日打卡
        const todayRes = await fetch('/api/checkin/today', {
          headers: { 'x-user-id': user.id }
        })
        const todayData = await todayRes.json()
        if (todayData.success) {
          // 转换为 UI 需要的格式
          const records = (Object.keys(MEAL_TYPES) as Array<keyof typeof MEAL_TYPES>).map(mealType => {
            const checkIn = todayData.data?.find((c: any) => c.mealType === mealType)
            return {
              mealType,
              recipeName: checkIn?.recipe?.name || '',
              checkInTime: checkIn ? format(new Date(checkIn.checkTime), 'HH:mm') : undefined,
              completed: !!checkIn,
              points: checkIn?.points || 10
            }
          })
          setTodayRecords(records)
        }
        
        // 获取本月数据
        const monthRes = await fetch('/api/checkin/monthly', {
          headers: { 'x-user-id': user.id }
        })
        const monthData = await monthRes.json()
        if (monthData.success && monthData.data) {
          const records = (monthData.data.checkIns || []).map((c: any) => ({
            date: new Date(c.checkDate),
            count: 1
          }))
          setCheckedDates(records)
        }
      } catch (err) {
        console.error('获取打卡数据失败:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [user?.id])
  
  // 本月统计 - 从已加载数据计算
  const monthlyStats = useMemo(() => {
    const today = new Date()
    const daysInMonth = getDaysInMonth(today)
    
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
  const handleCheckIn = useCallback(async (mealType: keyof typeof MEAL_TYPES) => {
    if (!user?.id) return
    
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ mealType })
      })
      const data = await res.json()
      
      if (data.success) {
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
        
        // 更新积分
        const newPoints = (userInfo?.points || 0) + (data.data?.points || 10)
        const newLevel = LEVEL_CONFIG.find(
          l => newPoints >= l.minPoints && newPoints < l.maxPoints
        )?.level || (userInfo?.level || 1)
        
        setUserInfo({ points: newPoints, level: newLevel })
        updatePoints(newPoints)
      } else {
        alert(data.error || '打卡失败')
      }
    } catch (err) {
      console.error('打卡失败:', err)
      alert('网络错误，请稍后重试')
    }
  }, [user, userInfo, updatePoints])
  
  // 处理日期选择
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])
  
  // 处理添加餐食 - 跳转食谱页
  const handleAddMeal = useCallback((mealType: keyof typeof MEAL_TYPES) => {
    setActiveTab('recipe')
  }, [setActiveTab])
  
  // 获取选中日期的打卡记录（今日或历史）
  const selectedDateRecords = useMemo(() => {
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    
    if (isToday) {
      return todayRecords.length > 0 ? todayRecords : (Object.keys(MEAL_TYPES) as Array<keyof typeof MEAL_TYPES>).map(mealType => ({
        mealType,
        recipeName: '',
        checkInTime: undefined,
        completed: false,
        points: 10
      }))
    }
    
    // 历史日期 - 暂时显示空状态
    return []
  }, [selectedDate, todayRecords])
  
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
          {userInfo && (
            <LevelCard 
              level={userInfo.level}
              points={userInfo.points}
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
