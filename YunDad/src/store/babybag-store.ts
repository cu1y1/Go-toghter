import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  hospitalBagItems, 
  getSeasonByDate, 
  getCurrentSeason,
  type Season,
  type DeliveryMethod,
  type ItemPriority,
  type BagItemData,
  CATEGORY_LABELS
} from '@/lib/hospital-bag-data'

// ============================================
// 类型定义
// ============================================

// 物品分类（兼容旧版 + 新增 dad）
export type CategoryType = 'documents' | 'mom' | 'baby' | 'dad' | 'other'

// 扩展分类配置（兼容旧版 + 新增 dad）
export const CATEGORY_CONFIG: Record<CategoryType, { label: string; icon: string; emoji: string }> = {
  documents: { label: '证件类', icon: 'file-text', emoji: '📄' },
  mom: { label: '妈妈用品', icon: 'user', emoji: '👩' },
  baby: { label: '宝宝用品', icon: 'baby', emoji: '👶' },
  dad: { label: '爸爸陪护', icon: 'user-check', emoji: '👨' },
  other: { label: '其他用品', icon: 'package', emoji: '🎒' },
}

// 物品接口（扩展版）
export interface BagItem {
  id: string
  name: string
  category: CategoryType
  checked: boolean
  isCustom: boolean
  priority?: ItemPriority        // 优先级：essential/recommended/optional
  note?: string                  // 说明
  tags?: {                       // 标签
    seasons?: Season[]
    delivery?: DeliveryMethod[]
  }
  quantity?: number
}

// ============================================
// 数据转换：将增强数据转换为 Store 格式
// ============================================

function convertToBagItem(item: BagItemData): BagItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    checked: false,
    isCustom: false,
    priority: item.priority,
    note: item.note,
    tags: item.tags as BagItem['tags'],
    quantity: item.quantity,
  }
}

// 获取增强版默认物品列表
function getEnhancedDefaultItems(): BagItem[] {
  return hospitalBagItems.map(convertToBagItem)
}

// ============================================
// 用户画像接口
// ============================================

export interface UserProfile {
  dueDate?: string
  deliveryMethod?: DeliveryMethod
  hospitalDays?: number
}

// ============================================
// Store 状态接口
// ============================================

interface BabyBagState {
  items: BagItem[]
  userProfile: UserProfile
  showOnlyRecommended: boolean   // 只显示推荐物品
  selectedSeason: Season | null  // 选中的季节（用于预览）
  
  // 操作方法
  toggleItem: (id: string) => void
  addItem: (name: string, category: CategoryType) => void
  removeItem: (id: string) => void
  checkItem: (id: string, checked: boolean) => void
  resetItems: () => void
  checkAllByCategory: (category: CategoryType) => void
  
  // 用户画像
  setUserProfile: (profile: Partial<UserProfile>) => void
  setSelectedSeason: (season: Season | null) => void
  setShowOnlyRecommended: (show: boolean) => void
  
  // 智能推荐
  getFilteredItems: () => BagItem[]
  getRecommendedItems: () => BagItem[]
  getSmartRecommendations: () => { essential: BagItem[], recommended: BagItem[], optional: BagItem[] }
  
  // 计算属性
  getProgress: () => { checked: number; total: number; percentage: number }
  getItemsByCategory: (category: CategoryType) => BagItem[]
  getCategoryProgress: (category: CategoryType) => { checked: number; total: number }
  getSeasonInfo: () => { current: Season; dueDateSeason: Season | null; daysUntil: number | null }
}

// 生成唯一ID
const generateId = () => `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// 智能筛选物品
function filterItems(
  items: BagItem[], 
  options: {
    season?: Season | null
    delivery?: DeliveryMethod
    priority?: ItemPriority
  }
): BagItem[] {
  return items.filter(item => {
    // 优先级筛选
    if (options.priority && item.priority && item.priority !== options.priority) {
      return false
    }
    
    // 季节筛选 - 只筛选季节特定物品，通用物品始终显示
    if (options.season && item.tags?.seasons?.length) {
      if (!item.tags.seasons.includes(options.season)) {
        // 排除不匹配季节的物品
        return false
      }
    }
    
    // 分娩方式筛选
    if (options.delivery && item.tags?.delivery?.length) {
      if (!item.tags.delivery.includes(options.delivery) && !item.tags.delivery.includes('undecided')) {
        return false
      }
    }
    
    return true
  })
}

// ============================================
// Store 实现
// ============================================

export const useBabyBagStore = create<BabyBagState>()(
  persist(
    (set, get) => ({
      items: getEnhancedDefaultItems(),
      userProfile: {},
      showOnlyRecommended: false,
      selectedSeason: null,
      
      // 切换物品勾选状态
      toggleItem: (id) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        ),
      })),
      
      // 勾选/取消勾选指定物品
      checkItem: (id, checked) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, checked } : item
        ),
      })),
      
      // 添加自定义物品
      addItem: (name, category) => set((state) => ({
        items: [
          ...state.items,
          {
            id: generateId(),
            name,
            category,
            checked: false,
            isCustom: true,
            priority: 'optional',
          },
        ],
      })),
      
      // 删除物品（仅自定义物品）
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      
      // 重置所有物品状态
      resetItems: () => set((state) => ({
        items: state.items.map((item) => ({ ...item, checked: false })),
      })),
      
      // 全选某分类
      checkAllByCategory: (category) => set((state) => ({
        items: state.items.map((item) =>
          item.category === category ? { ...item, checked: true } : item
        ),
      })),
      
      // 设置用户画像
      setUserProfile: (profile) => set((state) => ({
        userProfile: { ...state.userProfile, ...profile },
      })),
      
      // 设置选中的季节（用于预览）
      setSelectedSeason: (season) => set({ selectedSeason: season }),
      
      // 设置是否只显示推荐
      setShowOnlyRecommended: (show) => set({ showOnlyRecommended: show }),
      
      // 获取筛选后的物品列表
      getFilteredItems: () => {
        const state = get()
        const { season, delivery } = getSeasonFromProfile(state.userProfile)
        
        return filterItems(state.items, {
          season: state.selectedSeason || season,
          delivery: state.userProfile.deliveryMethod || delivery,
        })
      },
      
      // 获取推荐物品列表
      getRecommendedItems: () => {
        const state = get()
        const filtered = state.getFilteredItems()
        return filtered.filter(item => item.priority === 'essential' || item.priority === 'recommended')
      },
      
      // 获取智能推荐分组
      getSmartRecommendations: () => {
        const filtered = get().getFilteredItems()
        return {
          essential: filtered.filter(item => item.priority === 'essential'),
          recommended: filtered.filter(item => item.priority === 'recommended'),
          optional: filtered.filter(item => item.priority === 'optional'),
        }
      },
      
      // 计算进度
      getProgress: () => {
        const { items } = get()
        // 只计算筛选后的物品
        const filtered = get().getFilteredItems()
        const total = filtered.length
        const checked = filtered.filter((item) => item.checked).length
        const percentage = total > 0 ? Math.round((checked / total) * 100) : 0
        return { checked, total, percentage }
      },
      
      // 按分类获取物品
      getItemsByCategory: (category) => {
        const filtered = get().getFilteredItems()
        return filtered.filter((item) => item.category === category)
      },
      
      // 分类进度
      getCategoryProgress: (category) => {
        const items = get().getItemsByCategory(category)
        const total = items.length
        const checked = items.filter((item) => item.checked).length
        return { checked, total }
      },
      
      // 获取季节信息
      getSeasonInfo: () => {
        const current = getCurrentSeason()
        const { dueDate, deliveryMethod } = get().userProfile
        
        let dueDateSeason: Season | null = null
        let daysUntil: number | null = null
        
        if (dueDate) {
          const due = new Date(dueDate)
          dueDateSeason = getSeasonByDate(due)
          daysUntil = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        }
        
        return { current, dueDateSeason, daysUntil }
      },
    }),
    {
      name: 'pregdad-babybag-storage',
      partialize: (state) => ({
        items: state.items,
        userProfile: state.userProfile,
      }),
    }
  )
)

// 从用户画像获取季节和默认分娩方式
function getSeasonFromProfile(profile: UserProfile): { 
  season: Season | null
  delivery: DeliveryMethod | undefined 
} {
  if (profile.dueDate) {
    return {
      season: getSeasonByDate(new Date(profile.dueDate)),
      delivery: profile.deliveryMethod,
    }
  }
  return {
    season: getCurrentSeason(),
    delivery: profile.deliveryMethod,
  }
}

// 导出标签配置（供UI使用）
export { CATEGORY_ LABELS }