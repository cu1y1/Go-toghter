import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 餐食类型
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

// 餐食类型标签
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
}

// 食谱信息
export interface Recipe {
  id: string
  name: string
  description: string
  image: string
  calories: number
  protein: number
  carbs: number
  fat: number
  tags: string[]
  ingredients: string[]
  steps: string[]
}

// 今日饮食计划项
export interface MealPlanItem {
  id: string
  mealType: MealType
  recipe: Recipe | null
  isCompleted: boolean
  scheduledTime?: string
}

// 打卡记录项
export interface CheckInItem {
  id: string
  mealType: MealType
  completed: boolean
  completedAt?: string
}

// 月度统计
export interface MonthlyStats {
  totalDays: number
  totalCheckIns: number
  streak: number
  maxStreak: number
  breakfastRate: number
  lunchRate: number
  dinnerRate: number
  snackRate: number
}

// 饮食计划状态接口
interface MealPlanState {
  todayPlans: MealPlanItem[]
  setTodayPlans: (plans: MealPlanItem[]) => void
  addPlan: (plan: MealPlanItem) => void
  removePlan: (id: string) => void
  updatePlan: (id: string, updates: Partial<MealPlanItem>) => void
  toggleComplete: (id: string) => void
  clearPlans: () => void
}

// 打卡状态接口
interface CheckInState {
  todayCheckIns: CheckInItem[]
  monthlyStats: MonthlyStats
  setTodayCheckIns: (checkIns: CheckInItem[]) => void
  updateCheckIn: (id: string, completed: boolean) => void
  setMonthlyStats: (stats: MonthlyStats) => void
  toggleCheckIn: (mealType: MealType) => void
  resetTodayCheckIns: () => void
}

// 默认月度统计
const defaultMonthlyStats: MonthlyStats = {
  totalDays: 0,
  totalCheckIns: 0,
  streak: 0,
  maxStreak: 0,
  breakfastRate: 0,
  lunchRate: 0,
  dinnerRate: 0,
  snackRate: 0,
}

// 饮食计划Store
export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set, get) => ({
      todayPlans: [],
      
      setTodayPlans: (plans) => set({ todayPlans: plans }),
      
      addPlan: (plan) => set((state) => ({
        todayPlans: [...state.todayPlans, plan]
      })),
      
      removePlan: (id) => set((state) => ({
        todayPlans: state.todayPlans.filter((p) => p.id !== id)
      })),
      
      updatePlan: (id, updates) => set((state) => ({
        todayPlans: state.todayPlans.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      toggleComplete: (id) => set((state) => ({
        todayPlans: state.todayPlans.map((p) =>
          p.id === id ? { ...p, isCompleted: !p.isCompleted } : p
        )
      })),
      
      clearPlans: () => set({ todayPlans: [] }),
    }),
    {
      name: 'pregdad-meal-plan-storage',
    }
  )
)

// 打卡Store
export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      todayCheckIns: [],
      monthlyStats: defaultMonthlyStats,
      
      setTodayCheckIns: (checkIns) => set({ todayCheckIns: checkIns }),
      
      updateCheckIn: (id, completed) => set((state) => ({
        todayCheckIns: state.todayCheckIns.map((c) =>
          c.id === id 
            ? { 
                ...c, 
                completed, 
                completedAt: completed ? new Date().toISOString() : undefined 
              } 
            : c
        )
      })),
      
      setMonthlyStats: (stats) => set({ monthlyStats: stats }),
      
      toggleCheckIn: (mealType) => {
        const state = get()
        const existingIndex = state.todayCheckIns.findIndex(
          (c) => c.mealType === mealType
        )
        
        if (existingIndex >= 0) {
          const checkIn = state.todayCheckIns[existingIndex]
          set({
            todayCheckIns: state.todayCheckIns.map((c, index) =>
              index === existingIndex
                ? {
                    ...c,
                    completed: !c.completed,
                    completedAt: !c.completed ? new Date().toISOString() : undefined,
                  }
                : c
            ),
          })
        } else {
          set({
            todayCheckIns: [
              ...state.todayCheckIns,
              {
                id: `${mealType}-${Date.now()}`,
                mealType,
                completed: true,
                completedAt: new Date().toISOString(),
              },
            ],
          })
        }
      },
      
      resetTodayCheckIns: () => set({ todayCheckIns: [] }),
    }),
    {
      name: 'pregdad-checkin-storage',
    }
  )
)

// 辅助函数：初始化今日打卡
export const initializeTodayCheckIns = (): CheckInItem[] => {
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
  return mealTypes.map((mealType, index) => ({
    id: `checkin-${mealType}-${new Date().toDateString()}`,
    mealType,
    completed: false,
  }))
}
