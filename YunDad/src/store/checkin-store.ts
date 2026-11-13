import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CheckInService } from '@/services/checkin-service'
import type { CheckInResponse, TodayCheckinsResponse, MonthlyStatsResponse } from '@/services/checkin-service'

// 餐食类型
export type MealType = 'breakfast' | 'snack_morning' | 'lunch' | 'snack_afternoon' | 'dinner' | 'snack_evening'

// 打卡状态接口
interface CheckInState {
  // 状态数据
  todayCheckins: TodayCheckinsResponse | null
  monthlyStats: MonthlyStatsResponse | null
  loading: boolean
  error: string | null
  selectedDate: string
  selectedMonth: number
  selectedYear: number
  
  // 操作方法
  checkIn: (userId: string, mealType: MealType, recipeId?: string, note?: string) => Promise<boolean>
  getTodayCheckins: (userId: string, date?: string) => Promise<boolean>
  getMonthlyStats: (userId: string, year?: number, month?: number) => Promise<boolean>
  setSelectedDate: (date: string) => void
  setSelectedMonth: (month: number) => void
  setSelectedYear: (year: number) => void
  resetError: () => void
  resetState: () => void
}

// 打卡状态Store
export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      // 初始状态
      todayCheckins: null,
      monthlyStats: null,
      loading: false,
      error: null,
      selectedDate: new Date().toISOString().split('T')[0],
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
      
      // 打卡
      checkIn: async (userId: string, mealType: MealType, recipeId?: string, note?: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await CheckInService.checkIn(userId, { mealType, recipeId, note })
          
          if (response.success) {
            // 重新获取今日打卡记录
            await get().getTodayCheckins(userId)
            return true
          } else {
            set({ error: response.error || '打卡失败' })
            return false
          }
        } catch (error) {
          console.error('打卡失败:', error)
          set({ error: '网络错误，请稍后重试' })
          return false
        } finally {
          set({ loading: false })
        }
      },
      
      // 获取今日打卡记录
      getTodayCheckins: async (userId: string, date?: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await CheckInService.getTodayCheckins(userId, date)
          
          if (response.success && response.data) {
            set({ 
              todayCheckins: response.data,
              selectedDate: response.data.date
            })
            return true
          } else {
            set({ error: response.error || '获取打卡记录失败' })
            return false
          }
        } catch (error) {
          console.error('获取今日打卡记录失败:', error)
          set({ error: '网络错误，请稍后重试' })
          return false
        } finally {
          set({ loading: false })
        }
      },
      
      // 获取月度打卡统计
      getMonthlyStats: async (userId: string, year?: number, month?: number) => {
        set({ loading: true, error: null })
        
        try {
          const response = await CheckInService.getMonthlyStats(userId, year, month)
          
          if (response.success && response.data) {
            set({ 
              monthlyStats: response.data,
              selectedYear: response.data.year,
              selectedMonth: response.data.month
            })
            return true
          } else {
            set({ error: response.error || '获取月度统计失败' })
            return false
          }
        } catch (error) {
          console.error('获取月度打卡统计失败:', error)
          set({ error: '网络错误，请稍后重试' })
          return false
        } finally {
          set({ loading: false })
        }
      },
      
      // 设置选中日期
      setSelectedDate: (date: string) => {
        set({ selectedDate: date })
      },
      
      // 设置选中月份
      setSelectedMonth: (month: number) => {
        set({ selectedMonth: month })
      },
      
      // 设置选中年份
      setSelectedYear: (year: number) => {
        set({ selectedYear: year })
      },
      
      // 重置错误
      resetError: () => {
        set({ error: null })
      },
      
      // 重置状态
      resetState: () => {
        set({
          todayCheckins: null,
          monthlyStats: null,
          loading: false,
          error: null,
          selectedDate: new Date().toISOString().split('T')[0],
          selectedMonth: new Date().getMonth() + 1,
          selectedYear: new Date().getFullYear(),
        })
      },
    }),
    {
      name: 'pregdad-checkin-storage',
      partialize: (state) => ({
        selectedDate: state.selectedDate,
        selectedMonth: state.selectedMonth,
        selectedYear: state.selectedYear,
      }),
    }
  )
)
