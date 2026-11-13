import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '../services/apiClient'

export type MealType =
  | 'breakfast'
  | 'snack_morning'
  | 'lunch'
  | 'snack_afternoon'
  | 'dinner'
  | 'snack_evening'

export interface CheckInRecord {
  id: string
  mealType: string
  points: number
  note?: string | null
  recipe?: { id: string; name: string; image: string | null } | null
  checkDate?: string
}

export interface TodayData {
  date: string
  checkIns: CheckInRecord[]
  stats: {
    total: number
    totalPoints: number
    checkedMeals: string[]
    uncheckedMeals: string[]
  }
}

export interface MonthlyStats {
  year: number
  month: number
  dailyStats: Record<string, { count: number; points: number; mealTypes: string[] }>
  summary: {
    totalCheckIns: number
    totalPoints: number
    totalDays: number
    avgPerDay: number
    consecutiveDays: number
  }
}

interface CheckInState {
  todayCheckins: TodayData | null
  monthlyStats: MonthlyStats | null
  loading: boolean
  error: string | null
  selectedDate: string | null
  selectedMonth: number
  selectedYear: number
  setSelectedDate: (d: string | null) => void
  setSelectedMonth: (m: number) => void
  setSelectedYear: (y: number) => void
  /** 拉取今日打卡（userId 参数仅为兼容旧调用签名，服务端以 token 为准） */
  getTodayCheckins: (userId?: string) => Promise<void>
  /** 拉取月度统计（默认当年当月） */
  getMonthlyStats: (userId?: string, year?: number, month?: number) => Promise<void>
  /** 打卡；成功后自动刷新今日与月度数据 */
  checkIn: (userId: string | undefined, mealType: MealType, recipeId?: string) => Promise<boolean>
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      todayCheckins: null,
      monthlyStats: null,
      loading: false,
      error: null,
      selectedDate: null,
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),

      setSelectedDate: (d) => set({ selectedDate: d }),
      setSelectedMonth: (m) => set({ selectedMonth: m }),
      setSelectedYear: (y) => set({ selectedYear: y }),

      getTodayCheckins: async () => {
        set({ loading: true, error: null })
        const res = await api<TodayData>('/api/checkin/today')
        if (res.success && res.data) {
          set({ todayCheckins: res.data, loading: false })
        } else {
          set({ error: res.error || '获取今日打卡失败', loading: false })
        }
      },

      getMonthlyStats: async (_userId?: string, year?: number, month?: number) => {
        const now = new Date()
        const y = year ?? get().selectedYear ?? now.getFullYear()
        const m = month ?? get().selectedMonth ?? now.getMonth() + 1
        set({ loading: true, error: null })
        const res = await api<MonthlyStats>(`/api/checkin/monthly?year=${y}&month=${m}`)
        if (res.success && res.data) {
          set({ monthlyStats: res.data, loading: false })
        } else {
          set({ error: res.error || '获取月度统计失败', loading: false })
        }
      },

      checkIn: async (_userId, mealType, recipeId) => {
        set({ loading: true, error: null })
        const res = await api<CheckInRecord>('/api/checkin', {
          method: 'POST',
          body: JSON.stringify({ mealType, recipeId }),
        })
        if (res.success) {
          set({ loading: false })
          // 刷新今日 + 月度
          await get().getTodayCheckins()
          await get().getMonthlyStats()
          return true
        }
        set({ error: res.error || '打卡失败', loading: false })
        return false
      },
    }),
    {
      name: 'pregdad-checkin',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化用户选择，接口数据不落盘
      partialize: (state) => ({
        selectedDate: state.selectedDate,
        selectedMonth: state.selectedMonth,
        selectedYear: state.selectedYear,
      }),
    }
  )
)
