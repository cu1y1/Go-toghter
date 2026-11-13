import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BabyBagService } from '@/services/babybag-service'
import type { BabyBagCategory, BabyBagItem, BabyBagStats } from '@/services/babybag-service'

// 计算统计数据
function calculateStats(items: BabyBagItem[]): BabyBagStats {
  const total = items.length
  const prepared = items.filter(item => item.isPrepared).length
  return {
    total,
    prepared,
    progress: total > 0 ? Math.round((prepared / total) * 100) : 0
  }
}

// 待产包状态接口
interface BabyBagState {
  // 状态数据
  categories: BabyBagCategory[]
  items: BabyBagItem[]
  stats: BabyBagStats
  loading: boolean
  error: string | null
  expandedCategories: string[]
  
  // 操作方法
  getBabyBagItems: (userId: string) => Promise<boolean>
  addItem: (userId: string, categoryId: string, name: string, description?: string) => Promise<boolean>
  updateItem: (userId: string, itemId: string, data: { isPrepared?: boolean; name?: string; description?: string }) => Promise<boolean>
  deleteItem: (userId: string, itemId: string) => Promise<boolean>
  toggleItem: (userId: string, itemId: string) => Promise<boolean>
  toggleCategory: (categoryId: string) => void
  resetError: () => void
  resetState: () => void
  
  // 计算属性
  getItemsByCategory: (categoryId: string) => BabyBagItem[]
  getCategoryProgress: (categoryId: string) => { prepared: number; total: number }
  getTotalProgress: () => { prepared: number; total: number; progress: number }
}

// 待产包状态Store
export const useBabyBagStore = create<BabyBagState>()(
  persist(
    (set, get) => ({
      // 初始状态
      categories: [],
      items: [],
      stats: {
        total: 0,
        prepared: 0,
        progress: 0
      },
      loading: false,
      error: null,
      expandedCategories: ['documents', 'mom', 'baby', 'other'],
      
      // 获取待产包物品
      getBabyBagItems: async (userId: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await BabyBagService.getBabyBagItems(userId)
          
          if (response.success && response.data) {
            const { categories, stats } = response.data
            const items = categories.flatMap(category => category.items)
            
            set({
              categories,
              items,
              stats,
              loading: false
            })
            return true
          } else {
            set({ error: response.error || '获取待产包物品失败', loading: false })
            return false
          }
        } catch (error) {
          console.error('获取待产包物品失败:', error)
          set({ error: '网络错误，请稍后重试', loading: false })
          return false
        }
      },
      
      // 添加物品 - 优化：使用局部更新而非重新获取整个列表
      addItem: async (userId: string, categoryId: string, name: string, description?: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await BabyBagService.addItem(userId, { categoryId, name, description })
          
          if (response.success && response.data) {
            // 局部更新：直接添加到本地状态，而不重新获取整个列表
            const newItem = response.data
            set((state) => {
              const newItems = [...state.items, newItem]
              return {
                items: newItems,
                stats: calculateStats(newItems),
                loading: false
              }
            })
            return true
          } else {
            set({ error: response.error || '添加物品失败', loading: false })
            return false
          }
        } catch (error) {
          console.error('添加物品失败:', error)
          set({ error: '网络错误，请稍后重试', loading: false })
          return false
        }
      },
      
      // 更新物品 - 优化：使用局部更新而非重新获取整个列表
      updateItem: async (userId: string, itemId: string, data: { isPrepared?: boolean; name?: string; description?: string }) => {
        set({ loading: true, error: null })
        
        try {
          const response = await BabyBagService.updateItem(userId, itemId, data)
          
          if (response.success && response.data) {
            // 局部更新：直接更新本地状态，而不重新获取整个列表
            const updatedItem = response.data
            set((state) => {
              const newItems = state.items.map(item => 
                item.id === itemId ? { ...item, ...updatedItem } : item
              )
              return {
                items: newItems,
                stats: calculateStats(newItems),
                loading: false
              }
            })
            return true
          } else {
            set({ error: response.error || '更新物品失败', loading: false })
            return false
          }
        } catch (error) {
          console.error('更新物品失败:', error)
          set({ error: '网络错误，请稍后重试', loading: false })
          return false
        }
      },
      
      // 删除物品 - 优化：使用局部更新而非重新获取整个列表
      deleteItem: async (userId: string, itemId: string) => {
        set({ loading: true, error: null })
        
        try {
          const response = await BabyBagService.deleteItem(userId, itemId)
          
          if (response.success) {
            // 局部更新：直接从本地状态删除，而不重新获取整个列表
            set((state) => {
              const newItems = state.items.filter(item => item.id !== itemId)
              return {
                items: newItems,
                stats: calculateStats(newItems),
                loading: false
              }
            })
            return true
          } else {
            set({ error: response.error || '删除物品失败', loading: false })
            return false
          }
        } catch (error) {
          console.error('删除物品失败:', error)
          set({ error: '网络错误，请稍后重试', loading: false })
          return false
        }
      },
      
      // 切换物品状态
      toggleItem: async (userId: string, itemId: string) => {
        const item = get().items.find(i => i.id === itemId)
        if (!item) {
          set({ error: '物品不存在' })
          return false
        }
        
        return get().updateItem(userId, itemId, { isPrepared: !item.isPrepared })
      },
      
      // 切换分类展开状态
      toggleCategory: (categoryId: string) => {
        set((state) => ({
          expandedCategories: state.expandedCategories.includes(categoryId)
            ? state.expandedCategories.filter(id => id !== categoryId)
            : [...state.expandedCategories, categoryId]
        }))
      },
      
      // 重置错误
      resetError: () => {
        set({ error: null })
      },
      
      // 重置状态
      resetState: () => {
        set({
          categories: [],
          items: [],
          stats: {
            total: 0,
            prepared: 0,
            progress: 0
          },
          loading: false,
          error: null,
          expandedCategories: ['documents', 'mom', 'baby', 'other'],
        })
      },
      
      // 按分类获取物品
      getItemsByCategory: (categoryId: string) => {
        return get().items.filter(item => item.categoryId === categoryId)
      },
      
      // 获取分类进度
      getCategoryProgress: (categoryId: string) => {
        const items = get().getItemsByCategory(categoryId)
        const total = items.length
        const prepared = items.filter(item => item.isPrepared).length
        return { prepared, total }
      },
      
      // 获取总进度
      getTotalProgress: () => {
        const { stats } = get()
        return {
          prepared: stats.prepared,
          total: stats.total,
          progress: stats.progress
        }
      },
    }),
    {
      name: 'pregdad-babybag-storage',
      partialize: (state) => ({
        expandedCategories: state.expandedCategories,
      }),
    }
  )
)
