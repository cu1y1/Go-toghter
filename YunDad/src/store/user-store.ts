import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 分娩方式类型
export type DeliveryMethod = 'natural' | 'cesarean' | 'undecided'
// 医院病房类型
export type HospitalType = 'single' | 'double' | 'multi'

// 用户信息类型定义
export interface UserInfo {
  id: string
  babyName: string
  dueDate: string
  pregnancyWeek: number
  deliveryMethod: DeliveryMethod      // 分娩方式
  hospitalType: HospitalType          // 医院病房类型
  hospitalDays: number                // 计划住院天数
  level: number
  points: number
  avatar: string | null
}

// 用户状态接口
interface UserState {
  user: UserInfo | null
  setUser: (user: UserInfo | null) => void
  updateUser: (updates: Partial<UserInfo>) => void
  updatePoints: (points: number) => void
  updatePregnancyWeek: (week: number) => void
  isLoggedIn: boolean
  setIsLoggedIn: (status: boolean) => void
  logout: () => void
}

// 用户状态Store
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      
      setUser: (user) => set({ 
        user, 
        isLoggedIn: !!user 
      }),
      
      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...updates } 
          })
        }
      },
      
      updatePoints: (points) => {
        const currentUser = get().user
        if (currentUser) {
          set({ 
            user: { ...currentUser, points } 
          })
        }
      },
      
      updatePregnancyWeek: (week) => {
        const currentUser = get().user
        if (currentUser) {
          set({ 
            user: { ...currentUser, pregnancyWeek: week } 
          })
        }
      },
      
      setIsLoggedIn: (status) => set({ isLoggedIn: status }),
      
      logout: () => set({ 
        user: null, 
        isLoggedIn: false 
      }),
    }),
    {
      name: 'pregdad-user-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isLoggedIn: state.isLoggedIn 
      }),
    }
  )
)
