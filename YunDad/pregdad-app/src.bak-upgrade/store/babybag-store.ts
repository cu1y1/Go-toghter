import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGet, apiPost, apiPut, apiDelete } from '../services/apiClient'

export interface BabyBagItem {
  id: string
  categoryId: string
  name: string
  description: string | null
  isDefault: boolean
  isPrepared: boolean
  userId: string | null
  sortOrder: number
  category?: { id: string; name: string; icon: string }
}

export interface BabyBagCategory {
  id: string
  name: string
  icon: string
  sortOrder: number
  items: BabyBagItem[]
}

export interface BabyBagStats {
  total: number
  prepared: number
  progress: number
}

function calculateStats(items: BabyBagItem[]): BabyBagStats {
  const total = items.length
  const prepared = items.filter((item) => item.isPrepared).length
  return { total, prepared, progress: total > 0 ? Math.round((prepared / total) * 100) : 0 }
}

interface BabyBagState {
  categories: BabyBagCategory[]
  items: BabyBagItem[]
  stats: BabyBagStats
  loading: boolean
  error: string | null
  expandedCategories: string[]
  getBabyBagItems: (userId?: string) => Promise<boolean>
  addItem: (userId: string | undefined, categoryId: string, name: string, description?: string) => Promise<boolean>
  updateItem: (userId: string | undefined, itemId: string, data: { isPrepared?: boolean; name?: string; description?: string }) => Promise<boolean>
  deleteItem: (userId: string | undefined, itemId: string) => Promise<boolean>
  toggleItem: (userId: string | undefined, itemId: string) => Promise<boolean>
  toggleCategory: (categoryId: string) => void
  resetError: () => void
  resetState: () => void
  getItemsByCategory: (categoryId: string) => BabyBagItem[]
  getCategoryProgress: (categoryId: string) => { prepared: number; total: number }
  getTotalProgress: () => { prepared: number; total: number; progress: number }
}

/** 服务器版待产包 store（userId 仅兼容旧签名，服务端以 token 为准） */
export const useBabyBagStore = create<BabyBagState>()(
  persist(
    (set, get) => ({
      categories: [],
      items: [],
      stats: { total: 0, prepared: 0, progress: 0 },
      loading: false,
      error: null,
      expandedCategories: ['documents', 'mom', 'baby', 'other'],

      getBabyBagItems: async () => {
        set({ loading: true, error: null })
        try {
          const res = await apiGet<{ categories: BabyBagCategory[]; stats: BabyBagStats }>('/api/babybag')
          if (res.success && res.data) {
            const items = res.data.categories.flatMap((c) => c.items)
            set({ categories: res.data.categories, items, stats: res.data.stats, loading: false })
            return true
          }
          set({ error: res.error || '获取待产包物品失败', loading: false })
          return false
        } catch (error) {
          console.error('获取待产包物品失败:', error)
          set({ error: '网络错误，请稍后重试', loading: false })
          return false
        }
      },

      addItem: async (_userId, categoryId, name, description) => {
        set({ loading: true, error: null })
        try {
          const res = await apiPost<BabyBagItem>('/api/babybag', { categoryId, name, description })
          if (res.success && res.data) {
            const newItems = [...get().items, res.data]
            set({ items: newItems, stats: calculateStats(newItems), loading: false })
            return true
          }
          set({ error: res.error || '添加物品失败', loading: false })
          return false
        } catch (error) {
          console.error('添加物品失败:', error)
          set({ error: '网络错误，请稍后重试', loading: false })
          return false
        }
      },

      updateItem: async (_userId, itemId, data) => {
        set({ loading: true, error: null })
        try {
          const res = await apiPut<BabyBagItem>(`/api/babybag/${itemId}`, data)
          if (res.success && res.data) {
            const newItems = get().items.map((item) =>
              item.id === itemId ? { ...item, ...res.data! } : item
            )
            set({ items: newItems, stats: calculateStats(newItems), loading: false })
            return true
          }
          set({ error: res.error || '更新物品失败', loading: false })
          return false
        } catch (error) {
          console.error('更新物品失败:', error)
          set({ error: '网络错误，请稍后重试', loading: false })
          return false
        }
      },

      deleteItem: async (_userId, itemId) => {
        set({ loading: true, error: null })
        try {
          const res = await apiDelete(`/api/babybag/${itemId}`)
          if (res.success) {
            const newItems = get().items.filter((item) => item.id !== itemId)
            set({ items: newItems, stats: calculateStats(newItems), loading: false })
            return true
          }
          set({ error: res.error || '删除物品失败', loading: false })
          return false
        } catch (error) {
          console.error('删除物品失败:', error)
          set({ error: '网络错误，请稍后重试', loading: false })
          return false
        }
      },

      toggleItem: async (_userId, itemId) => {
        const item = get().items.find((i) => i.id === itemId)
        if (!item) {
          set({ error: '物品不存在' })
          return false
        }
        return get().updateItem(_userId, itemId, { isPrepared: !item.isPrepared })
      },

      toggleCategory: (categoryId) => {
        set((state) => ({
          expandedCategories: state.expandedCategories.includes(categoryId)
            ? state.expandedCategories.filter((id) => id !== categoryId)
            : [...state.expandedCategories, categoryId],
        }))
      },

      resetError: () => set({ error: null }),
      resetState: () =>
        set({
          categories: [],
          items: [],
          stats: { total: 0, prepared: 0, progress: 0 },
          loading: false,
          error: null,
          expandedCategories: ['documents', 'mom', 'baby', 'other'],
        }),

      getItemsByCategory: (categoryId) => get().items.filter((item) => item.categoryId === categoryId),

      getCategoryProgress: (categoryId) => {
        const items = get().getItemsByCategory(categoryId)
        return {
          prepared: items.filter((item) => item.isPrepared).length,
          total: items.length,
        }
      },

      getTotalProgress: () => {
        const { stats } = get()
        return { prepared: stats.prepared, total: stats.total, progress: stats.progress }
      },
    }),
    {
      name: 'pregdad-babybag-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ expandedCategories: state.expandedCategories }),
    }
  )
)
