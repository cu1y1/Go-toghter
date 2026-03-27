'use client'

import { useTabStore, TabType } from '@/store/tab-store'
import { BottomNav } from './bottom-nav'
import { HomeTab } from '@/components/home'
import { RecipeTab } from '@/components/recipe'
import { CheckInTab } from '@/components/checkin'
import { BabyBagTab } from '@/components/babybag'
import { ProfileTab } from '@/components/profile'

// Tab内容映射
const tabContent: Record<TabType, React.FC> = {
  home: HomeTab,
  recipe: RecipeTab,
  checkin: CheckInTab,
  babybag: BabyBagTab,
  profile: ProfileTab,
}

export function MainLayout() {
  const { activeTab } = useTabStore()
  const Content = tabContent[activeTab]

  return (
    <div className="min-h-screen bg-background">
      {/* 主内容区域 */}
      <main className="pb-20 min-h-screen scrollbar-thin">
        <Content />
      </main>
      
      {/* 底部导航 */}
      <BottomNav />
    </div>
  )
}
