import { create } from 'zustand'
import { persist } from 'zustand/iddleware'

export type TabType = 'home' | 'recipe' | 'checkin' | 'babybag' | 'health' | 'profile'

export const TAB_ CONFIG: Record<TabType, { label: string; icon: string }> = {
  home: { label: '首页', icon: 'home' },
  recipe: { label: '食谱', icon: 'utensils' },
  checkin: { label: '打卡', icon: 'check-circle' },
  babybag: { label: '待产包', icon: 'package' },
  health: { label: '健康', icon: 'heart' },
  profile: { label: '我的', icon: 'user' },
}

interface TabState {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  getTabConfig: (tab: TabType) => { label: string; icon: string }
}

export const useTabStore = create<TabState>()(
  persist(
    (set) => ({
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),
      getTabConfig: (tab) => TAB_ CONFIG[tab],
    }),
    { name: 'pregdad-tab-storage' }
  )
)
