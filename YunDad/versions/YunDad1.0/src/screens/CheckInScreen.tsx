import React, { useState, useMemo, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, MEAL_TYPES, LEVEL_CONFIG } from '../constants'
import { Card, ProgressBar } from '../components/common'
import { useUserStore } from '../store'
import { getLevelByPoints } from '../utils'

const { width } = Dimensions.get('window')

// 等级图标配置
const LEVEL_ICONS: Record<number, { icon: string; gradient: string[] }> = {
  1: { icon: '🌱', gradient: ['#A8E6CF', '#56AB91'] },
  2: { icon: '🌿', gradient: ['#88D8B0', '#5DB075'] },
  3: { icon: '🌳', gradient: ['#6ECB63', '#4E944F'] },
  4: { icon: '🏆', gradient: ['#FFD93D', '#F5A623'] },
  5: { icon: '👑', gradient: ['#FF6B6B', '#EE5A5A'] },
  6: { icon: '💎', gradient: ['#9B59B6', '#8E44AD'] },
}

// 生成模拟打卡数据
const generateMockCheckIns = () => {
  const checkIns: { date: Date; count: number }[] = []
  const today = new Date()
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dayOfWeek = date.getDay()
    const checkInChance = dayOfWeek === 0 || dayOfWeek === 6 ? 0.5 : 0.8
    
    if (Math.random() < checkInChance) {
      checkIns.push({
        date,
        count: Math.floor(Math.random() * 4) + 1
      })
    }
  }
  
  return checkIns
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export const CheckInScreen: React.FC = () => {
  const { user } = useUserStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [todayCheckIns, setTodayCheckIns] = useState<Record<string, boolean>>({})
  
  // 用户数据
  const userInfo = {
    level: user?.level || 3,
    points: user?.points || 180,
  }
  
  const levelInfo = getLevelByPoints(userInfo.points)
  const levelIconConfig = LEVEL_ICONS[levelInfo.level] || LEVEL_ICONS[1]
  
  // 模拟打卡历史
  const checkInHistory = useMemo(() => generateMockCheckIns(), [])
  
  // 本月统计
  const monthlyStats = useMemo(() => {
    const today = new Date()
    const thisMonthRecords = checkInHistory.filter(record => 
      record.date.getMonth() === today.getMonth() &&
      record.date.getFullYear() === today.getFullYear()
    )
    
    // 计算连续打卡
    let streak = 0
    const sortedDates = [...checkInHistory]
      .filter(r => r.date <= today)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      
      const hasRecord = sortedDates.some(r => 
        r.date.toDateString() === expectedDate.toDateString()
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
      daysInMonth: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(),
    }
  }, [checkInHistory])
  
  // 打卡处理
  const handleCheckIn = useCallback((mealType: string) => {
    if (!todayCheckIns[mealType]) {
      setTodayCheckIns(prev => ({ ...prev, [mealType]: true }))
    }
  }, [todayCheckIns])
  
  // 获取日历数据
  const getCalendarData = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startWeekday = firstDay.getDay()
    
    const days: { date: Date; isCurrentMonth: boolean; checkInCount: number }[] = []
    
    // 上个月的日期
    for (let i = startWeekday - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({
        date,
        isCurrentMonth: false,
        checkInCount: checkInHistory.find(c => c.date.toDateString() === date.toDateString())?.count || 0
      })
    }
    
    // 当月日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      days.push({
        date,
        isCurrentMonth: true,
        checkInCount: checkInHistory.find(c => c.date.toDateString() === date.toDateString())?.count || 0
      })
    }
    
    // 下个月的日期
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        isCurrentMonth: false,
        checkInCount: checkInHistory.find(c => c.date.toDateString() === date.toDateString())?.count || 0
      })
    }
    
    return days
  }, [currentMonth, checkInHistory])
  
  // 切换月份
  const changeMonth = (delta: number) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + delta)
    setCurrentMonth(newMonth)
  }
  
  // 判断是否今天
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  // 判断是否选中
  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }
  
  const mealOrder = ['breakfast', 'snack_morning', 'lunch', 'snack_afternoon', 'dinner', 'snack_evening']

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>打卡记录 📋</Text>
          <Text style={styles.subtitle}>记录每日饮食，积累健康积分</Text>
        </View>

        {/* 等级进度卡片 */}
        <Card style={styles.levelCard}>
          <View style={styles.levelTop}>
            <View style={[styles.levelIconContainer, { backgroundColor: levelIconConfig.gradient[0] }]}>
              <Text style={styles.levelIcon}>{levelIconConfig.icon}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Lv.{levelInfo.level} {levelInfo.name}</Text>
              <Text style={styles.levelPoints}>当前积分: {userInfo.points}</Text>
            </View>
          </View>
          <View style={styles.levelProgress}>
            <Text style={styles.levelProgressText}>
              再获得 {levelInfo.pointsToNext} 积分升级
            </Text>
            <ProgressBar progress={levelInfo.progress} height={6} />
          </View>
        </Card>

        {/* 本月统计 */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{monthlyStats.checkedDays}</Text>
            <Text style={styles.statLabel}>打卡天数</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-done" size={20} color={COLORS.success} />
            <Text style={styles.statValue}>{monthlyStats.totalCheckIns}</Text>
            <Text style={styles.statLabel}>打卡次数</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={20} color="#EF4444" />
            <Text style={styles.statValue}>{monthlyStats.streak}</Text>
            <Text style={styles.statLabel}>连续打卡</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={20} color="#FBBF24" />
            <Text style={styles.statValue}>
              {Math.round(monthlyStats.checkedDays / monthlyStats.daysInMonth * 100)}%
            </Text>
            <Text style={styles.statLabel}>完成率</Text>
          </View>
        </View>

        {/* 日历视图 */}
        <Card style={styles.calendarCard}>
          {/* 月份切换 */}
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {currentMonth.getFullYear()}年 {MONTHS[currentMonth.getMonth()]}
            </Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* 星期头 */}
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day, idx) => (
              <Text 
                key={day} 
                style={[
                  styles.weekdayText,
                  idx === 0 && styles.weekdayTextRed
                ]}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* 日期网格 */}
          <View style={styles.dateGrid}>
            {getCalendarData.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.dateCell,
                  !item.isCurrentMonth && styles.dateCellOtherMonth,
                  isToday(item.date) && styles.dateCellToday,
                  isSelected(item.date) && styles.dateCellSelected,
                ]}
                onPress={() => setSelectedDate(item.date)}
              >
                <Text style={[
                  styles.dateText,
                  !item.isCurrentMonth && styles.dateTextOtherMonth,
                  isToday(item.date) && styles.dateTextToday,
                  isSelected(item.date) && styles.dateTextSelected,
                ]}>
                  {item.date.getDate()}
                </Text>
                {item.checkInCount > 0 && (
                  <View style={styles.checkInDots}>
                    {[...Array(Math.min(item.checkInCount, 3))].map((_, i) => (
                      <View key={i} style={styles.checkInDot} />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* 今日打卡详情 */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>今日打卡</Text>
          
          {mealOrder.map(mealType => {
            const meal = MEAL_TYPES[mealType]
            const completed = todayCheckIns[mealType]
            
            return (
              <TouchableOpacity
                key={mealType}
                style={[
                  styles.mealItem,
                  completed && styles.mealItemCompleted
                ]}
                onPress={() => handleCheckIn(mealType)}
                activeOpacity={0.8}
              >
                <Text style={styles.mealIcon}>{meal.icon}</Text>
                <View style={styles.mealInfo}>
                  <Text style={[
                    styles.mealName,
                    completed && styles.mealNameCompleted
                  ]}>
                    {meal.name}
                  </Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
                {completed ? (
                  <View style={styles.completedTag}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                    <Text style={styles.completedText}>已完成</Text>
                  </View>
                ) : (
                  <View style={styles.checkInButton}>
                    <Text style={styles.checkInButtonText}>打卡</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 4,
  },
  levelCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  levelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelIcon: {
    fontSize: 24,
  },
  levelInfo: {
    marginLeft: 12,
    flex: 1,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  levelPoints: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  levelProgress: {
    marginTop: 4,
  },
  levelProgressText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  calendarCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  weekdayTextRed: {
    color: '#EF4444',
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  dateCellOtherMonth: {
    opacity: 0.3,
  },
  dateCellToday: {
    backgroundColor: COLORS.primary + '20',
  },
  dateCellSelected: {
    backgroundColor: COLORS.primary,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  dateTextOtherMonth: {
    color: COLORS.textMuted,
  },
  dateTextToday: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dateTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  checkInDots: {
    flexDirection: 'row',
    marginTop: 2,
  },
  checkInDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginHorizontal: 1,
  },
  todaySection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mealItemCompleted: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success,
  },
  mealIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  mealNameCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  mealTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  checkInButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  checkInButtonText: {
    fontSize: 13,
    color: COLORS.white,
    fontWeight: '600',
  },
})
