import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 物品分类
export type CategoryType = 'documents' | 'mom' | 'baby' | 'other'

// 分类配置
export const CATEGORY_CONFIG: Record<CategoryType, { label: string; icon: string; emoji: string }> = {
  documents: { label: '证件类', icon: 'file-text', emoji: '📄' },
  mom: { label: '妈妈用品', icon: 'user', emoji: '👩' },
  baby: { label: '宝宝用品', icon: 'baby', emoji: '👶' },
  other: { label: '其他用品', icon: 'package', emoji: '🎒' },
}

// 物品接口
export interface BagItem {
  id: string
  name: string
  category: CategoryType
  checked: boolean
  isCustom: boolean // 是否为自定义物品
}

// 预设物品数据
const DEFAULT_ITEMS: BagItem[] = [
  // 证件类
  { id: 'doc-1', name: '身份证', category: 'documents', checked: false, isCustom: false },
  { id: 'doc-2', name: '医保卡', category: 'documents', checked: false, isCustom: false },
  { id: 'doc-3', name: '产检本', category: 'documents', checked: false, isCustom: false },
  { id: 'doc-4', name: '准生证', category: 'documents', checked: false, isCustom: false },
  { id: 'doc-5', name: '银行卡', category: 'documents', checked: false, isCustom: false },
  { id: 'doc-6', name: '现金', category: 'documents', checked: false, isCustom: false },
  
  // 妈妈用品
  { id: 'mom-1', name: '换洗衣物', category: 'mom', checked: false, isCustom: false },
  { id: 'mom-2', name: '卫生巾', category: 'mom', checked: false, isCustom: false },
  { id: 'mom-3', name: '洗漱用品', category: 'mom', checked: false, isCustom: false },
  { id: 'mom-4', name: '拖鞋', category: 'mom', checked: false, isCustom: false },
  { id: 'mom-5', name: '哺乳内衣', category: 'mom', checked: false, isCustom: false },
  { id: 'mom-6', name: '防溢乳垫', category: 'mom', checked: false, isCustom: false },
  { id: 'mom-7', name: '产后护理垫', category: 'mom', checked: false, isCustom: false },
  { id: 'mom-8', name: '保暖外套', category: 'mom', checked: false, isCustom: false },
  
  // 宝宝用品
  { id: 'baby-1', name: '新生儿衣物', category: 'baby', checked: false, isCustom: false },
  { id: 'baby-2', name: '尿不湿', category: 'baby', checked: false, isCustom: false },
  { id: 'baby-3', name: '奶瓶', category: 'baby', checked: false, isCustom: false },
  { id: 'baby-4', name: '小罐奶粉', category: 'baby', checked: false, isCustom: false },
  { id: 'baby-5', name: '包被', category: 'baby', checked: false, isCustom: false },
  { id: 'baby-6', name: '湿纸巾', category: 'baby', checked: false, isCustom: false },
  { id: 'baby-7', name: '婴儿帽子', category: 'baby', checked: false, isCustom: false },
  { id: 'baby-8', name: '小袜子', category: 'baby', checked: false, isCustom: false },
  
  // 其他用品
  { id: 'other-1', name: '手机充电器', category: 'other', checked: false, isCustom: false },
  { id: 'other-2', name: '充电宝', category: 'other', checked: false, isCustom: false },
  { id: 'other-3', name: '零食', category: 'other', checked: false, isCustom: false },
  { id: 'other-4', name: '吸管杯', category: 'other', checked: false, isCustom: false },
  { id: 'other-5', name: '纸巾', category: 'other', checked: false, isCustom: false },
]

// Store状态接口
interface BabyBagState {
  items: BagItem[]
  
  // 操作方法
  toggleItem: (id: string) => void
  addItem: (name: string, category: CategoryType) => void
  removeItem: (id: string) => void
  
  // 计算属性
  getProgress: () => { checked: number; total: number; percentage: number }
  getItemsByCategory: (category: CategoryType) => BagItem[]
  getCategoryProgress: (category: CategoryType) => { checked: number; total: number }
}

// 生成唯一ID
const generateId = () => `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// 待产包Store
export const useBabyBagStore = create<BabyBagState>()(
  persist(
    (set, get) => ({
      items: DEFAULT_ITEMS,
      
      toggleItem: (id) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        ),
      })),
      
      addItem: (name, category) => set((state) => ({
        items: [
          ...state.items,
          {
            id: generateId(),
            name,
            category,
            checked: false,
            isCustom: true,
          },
        ],
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      
      getProgress: () => {
        const { items } = get()
        const total = items.length
        const checked = items.filter((item) => item.checked).length
        const percentage = total > 0 ? Math.round((checked / total) * 100) : 0
        return { checked, total, percentage }
      },
      
      getItemsByCategory: (category) => {
        return get().items.filter((item) => item.category === category)
      },
      
      getCategoryProgress: (category) => {
        const items = get().items.filter((item) => item.category === category)
        const total = items.length
        const checked = items.filter((item) => item.checked).length
        return { checked, total }
      },
    }),
    {
      name: 'pregdad-babybag-storage',
    }
  )
)
