import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { api } from '../services/apiClient'

/** 登录会话（token 持久化在 AsyncStorage，重启 App 可恢复） */
export interface AuthUser {
  id: string
  email: string
  babyName?: string | null
  dueDate?: string | null
  pregnancyWeek?: number
  level?: number
  points?: number
  avatar?: string | null
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  setSession: (token: string, user: AuthUser) => void
  clearSession: () => void
  register: (info: {
    email: string
    password: string
    babyName?: string
    dueDate?: Date | null
    pregnancyWeek?: number
  }) => Promise<{ ok: boolean; error?: string }>
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  /** 用已存 token 拉取最新用户信息，失败返回 false（由调用方决定是否降级） */
  restore: () => Promise<boolean>
}

interface AuthResponse {
  token: string
  user: AuthUser
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),

      register: async (info) => {
        const res = await api<AuthResponse>('/api/auth', {
          method: 'POST',
          body: JSON.stringify({
            action: 'register',
            email: info.email,
            password: info.password,
            babyName: info.babyName,
            dueDate: info.dueDate ? info.dueDate.toISOString() : null,
            pregnancyWeek: info.pregnancyWeek,
          }),
        })
        if (res.success && res.data?.token && res.data?.user) {
          set({ token: res.data.token, user: res.data.user })
          return { ok: true }
        }
        return { ok: false, error: res.error || '注册失败' }
      },

      login: async (email, password) => {
        const res = await api<AuthResponse>('/api/auth', {
          method: 'POST',
          body: JSON.stringify({ action: 'login', email, password }),
        })
        if (res.success && res.data?.token && res.data?.user) {
          set({ token: res.data.token, user: res.data.user })
          return { ok: true }
        }
        return { ok: false, error: res.error || '登录失败' }
      },

      restore: async () => {
        if (!get().token) return false
        const res = await api<AuthUser>('/api/auth')
        if (res.success && res.data) {
          set({ user: res.data })
          return true
        }
        return false
      },
    }),
    {
      name: 'pregdad-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
