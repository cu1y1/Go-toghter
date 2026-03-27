'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Heart, 
  UserCircle, 
  Bell, 
  Moon, 
  MessageCircle, 
  Star, 
  Info, 
  LogOut,
  ChevronRight,
  LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 菜单项类型
interface MenuItem {
  id: string
  icon: LucideIcon
  label: string
  badge?: number
  hasSwitch?: boolean
  switchValue?: boolean
  onClick?: () => void
  onSwitchChange?: (checked: boolean) => void
  danger?: boolean
}

interface MenuListProps {
  // 收藏数量
  favoriteCount: number
  // 深色模式状态
  darkMode: boolean
  // 深色模式切换回调
  onDarkModeChange: (checked: boolean) => void
  // 点击菜单项回调
  onItemClick: (id: string) => void
  // 退出登录回调
  onLogout: () => void
}

export function MenuList({
  favoriteCount,
  darkMode,
  onDarkModeChange,
  onItemClick,
  onLogout
}: MenuListProps) {
  // 菜单项配置
  const menuItems: MenuItem[] = [
    {
      id: 'favorites',
      icon: Heart,
      label: '我的收藏',
      badge: favoriteCount,
      onClick: () => onItemClick('favorites')
    },
    {
      id: 'profile',
      icon: UserCircle,
      label: '个人资料编辑',
      onClick: () => onItemClick('profile')
    },
    {
      id: 'reminder',
      icon: Bell,
      label: '每日提醒设置',
      onClick: () => onItemClick('reminder')
    },
    {
      id: 'darkmode',
      icon: Moon,
      label: '深色模式',
      hasSwitch: true,
      switchValue: darkMode,
      onSwitchChange: onDarkModeChange
    }
  ]
  
  const menuItems2: MenuItem[] = [
    {
      id: 'contact',
      icon: MessageCircle,
      label: '联系我们',
      onClick: () => onItemClick('contact')
    },
    {
      id: 'rating',
      icon: Star,
      label: '给个好评',
      onClick: () => onItemClick('rating')
    },
    {
      id: 'about',
      icon: Info,
      label: '关于我们',
      onClick: () => onItemClick('about')
    }
  ]
  
  // 渲染单个菜单项
  const renderMenuItem = (item: MenuItem, showBorder: boolean = true) => {
    const Icon = item.icon
    
    return (
      <div
        key={item.id}
        className={cn(
          "flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors",
          "hover:bg-gray-50 active:bg-gray-100",
          item.danger && "hover:bg-red-50 active:bg-red-100",
          !item.hasSwitch && "group"
        )}
        onClick={item.hasSwitch ? undefined : item.onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && item.onClick) {
            item.onClick()
          }
        }}
      >
        {/* 图标 */}
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center",
          "bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100",
          item.danger && "from-red-50 to-pink-50 border-red-100"
        )}>
          <Icon className={cn(
            "w-5 h-5",
            item.danger ? "text-red-500" : "text-orange-500"
          )} />
        </div>
        
        {/* 标签 */}
        <span className={cn(
          "flex-1 text-[15px] font-medium",
          item.danger ? "text-red-500" : "text-gray-700"
        )}>
          {item.label}
        </span>
        
        {/* 徽章 */}
        {item.badge !== undefined && item.badge > 0 && (
          <Badge 
            variant="default" 
            className="bg-orange-500 text-white text-xs min-w-[20px] h-5 rounded-full px-1.5"
          >
            {item.badge > 99 ? '99+' : item.badge}
          </Badge>
        )}
        
        {/* 开关 */}
        {item.hasSwitch && (
          <Switch
            checked={item.switchValue}
            onCheckedChange={item.onSwitchChange}
            className="data-[state=checked]:bg-orange-500"
          />
        )}
        
        {/* 箭头 */}
        {!item.hasSwitch && (
          <ChevronRight className={cn(
            "w-5 h-5 text-gray-300 transition-transform",
            "group-hover:text-gray-400 group-hover:translate-x-0.5"
          )} />
        )}
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* 第一组菜单 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {menuItems.map((item, index) => (
          <div key={item.id}>
            {index > 0 && <Separator className="mx-4" />}
            {renderMenuItem(item)}
          </div>
        ))}
      </div>
      
      {/* 第二组菜单 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {menuItems2.map((item, index) => (
          <div key={item.id}>
            {index > 0 && <Separator className="mx-4" />}
            {renderMenuItem(item)}
          </div>
        ))}
      </div>
      
      {/* 退出登录 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors",
            "hover:bg-red-50 active:bg-red-100 group"
          )}
          onClick={onLogout}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onLogout()
            }
          }}
        >
          {/* 图标 */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 border border-red-100">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          
          {/* 标签 */}
          <span className="flex-1 text-[15px] font-medium text-red-500">
            退出登录
          </span>
          
          {/* 箭头 */}
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  )
}
