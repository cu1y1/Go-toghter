import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tab类型定义
export type TabType = 'home' | 'recipe' | 'checkin' | 'babybag' | 'health' | 'profile' | 'onboarding'

// Tab导航配置
export const TAB_CONFIG: Record<TabType, { label: string; icon: string }> = {
  home: { label: '首页', icon: 'home' },
  recipe: { label: '食谱', icon: 'utensils' },
  checkin: { label: '打卡', icon: 'check-circle' },
  babybag: { label: '待产包', icon: 'package' },
  health: { label: '健康', icon: 'heart' },
  profile: { label: '我的', icon: 'person' },
  onboarding: { label: '引导', icon: 'sparkles' },
}

// Tab导航状态接口
interface TabState {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  getTabConfig: (tab: TabType) => { label: string; icon: string }
}

// Tab导航状态Store
export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      activeTab: 'home',
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      getTabConfig: (tab) => TAB_CONFIG[tab],
    }),
    {
      name: 'pregdad-tab-storage',
    }
  )
)
