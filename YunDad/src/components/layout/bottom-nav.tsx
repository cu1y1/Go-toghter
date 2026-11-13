"use client"

import { useTabStore, TabType } from '@/store/tab-store'
import { 
  Home, 
  Utensils, 
  CheckCircle, 
  Package, 
  Heart,
  User  
} from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<TabType, React.ComponentType<{ className?: string }>> = {
  home: Home,
  recipe: Utensils,
  checkin: CheckCircle,
  babybag: Package,
  health: Heart,
  profile: User,
}

const tabs: { key: TabType; label: string }[] = [
  { key: 'home', label: '首页' },
  { key: 'recipe', label: '食谱' },
  { key: 'checkin', label: '打卡' },
  { key: 'babybag', label: '待产包' },
  { key: 'health', label: '健康' },
  { key: 'profile', label: '我的' },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useTabStore()

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-background/95 backdrop-blur-sm",
      "border-t border-border/50",
      "nav-shadow",
      "safe-area-bottom",
      "tap-highlight"
    )}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const Icon = iconMap[tab.key]
          const isActive = activeTab === tab.key
          
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex flex-col items-center justify-center",
                "flex-1 py-2 px-1",
                "transition-all duration-200 ease-out",
                "rounded-lg",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "tap-highlight"
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={cn(
                "relative flex items-center justify-center",
                "w-10 h-10 rounded-full",
                "transition-all duration-200 ease-out",
                isActive && "bg-primary/10"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive 
                    ? "text-primary stroke-[2.5]" 
                    : "text-muted-foreground stroke-[1.5]"
                )} />
                {isActive && (
                  <span className={cn(
                    "absolute -bottom-1 left-1/2 -translate-x-1/2",
                    "w-1.5 h-1.5 rounded-full bg-primary",
                    "animate-in zoom-in duration-200"
                  )} />
                )}
              </div>
              <span className={cn(
                "mt-0.5 text-xs font-medium",
                "transition-colors duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
