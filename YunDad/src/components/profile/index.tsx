'use client'

import { useState, useCallback } from 'react'
import { UserCard } from './user-card'
import { MenuList } from './menu-list'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUserStore } from '@/store/user-store'
import { useToast } from '@/hooks/use-toast'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// 版本信息
const APP_VERSION = '1.0.0'
const COPYRIGHT_YEAR = new Date().getFullYear()

export function ProfileTab() {
  // 用户状态
  const { user, logout, updateUser } = useUserStore()
  const { toast } = useToast()
  
  // 深色模式状态（本地状态，实际应用中可能需要全局管理）
  const [darkMode, setDarkMode] = useState(false)
  
  // 退出确认弹窗
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  
  // 模拟收藏数量
  const favoriteCount = 12
  
  // 默认用户数据（如果没有登录）
  const defaultUser = {
    avatar: null,
    babyName: '小宝贝',
    dueDate: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000), // 默认预产期：3个月后
    pregnancyWeek: 12,
    points: 520,
    level: 3
  }
  
  // 使用用户数据或默认数据
  const userData = user ? {
    avatar: user.avatar,
    babyName: user.babyName || defaultUser.babyName,
    dueDate: new Date(user.dueDate || defaultUser.dueDate),
    pregnancyWeek: user.pregnancyWeek || defaultUser.pregnancyWeek,
    points: user.points || defaultUser.points,
    level: user.level || defaultUser.level
  } : defaultUser
  
  // 点击头像更换
  const handleAvatarClick = useCallback(() => {
    // 创建文件选择器
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // 将文件转换为base64 URL
        const reader = new FileReader()
        reader.onload = (e) => {
          const avatarUrl = e.target?.result as string
          if (user) {
            updateUser({ avatar: avatarUrl })
          }
          toast({
            title: '头像更新成功',
            description: '您的头像已成功更换',
          })
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }, [user, updateUser, toast])
  
  // 深色模式切换
  const handleDarkModeChange = useCallback((checked: boolean) => {
    setDarkMode(checked)
    // 这里可以添加实际的深色模式切换逻辑
    document.documentElement.classList.toggle('dark', checked)
    toast({
      title: checked ? '深色模式已开启' : '深色模式已关闭',
      description: '主题设置已更新',
    })
  }, [toast])
  
  // 菜单项点击
  const handleMenuItemClick = useCallback((id: string) => {
    switch (id) {
      case 'favorites':
        toast({
          title: '我的收藏',
          description: '收藏功能开发中...',
        })
        break
      case 'profile':
        toast({
          title: '个人资料编辑',
          description: '编辑功能开发中...',
        })
        break
      case 'reminder':
        toast({
          title: '每日提醒设置',
          description: '提醒设置功能开发中...',
        })
        break
      case 'contact':
        toast({
          title: '联系我们',
          description: '客服邮箱：support@pregdad.com',
        })
        break
      case 'rating':
        toast({
          title: '感谢支持',
          description: '您的支持是我们前进的动力！',
        })
        break
      case 'about':
        toast({
          title: '关于孕爸爸',
          description: `版本 ${APP_VERSION} - 专业的孕期陪伴助手`,
        })
        break
      default:
        break
    }
  }, [toast])
  
  // 退出登录
  const handleLogout = useCallback(() => {
    setShowLogoutDialog(true)
  }, [])
  
  // 确认退出
  const confirmLogout = useCallback(() => {
    logout()
    setShowLogoutDialog(false)
    toast({
      title: '已退出登录',
      description: '期待您的再次使用',
    })
  }, [logout, toast])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50">
      <ScrollArea className="h-screen">
        <div className="max-w-lg mx-auto px-4 py-5 space-y-5 pb-24">
          {/* 页面标题 */}
          <div className="text-center py-2">
            <h1 className="text-xl font-bold text-gray-800">我的</h1>
          </div>
          
          {/* 用户信息卡片 */}
          <UserCard
            avatar={userData.avatar}
            babyName={userData.babyName}
            dueDate={userData.dueDate}
            pregnancyWeek={userData.pregnancyWeek}
            points={userData.points}
            level={userData.level}
            onAvatarClick={handleAvatarClick}
          />
          
          {/* 功能菜单列表 */}
          <MenuList
            favoriteCount={favoriteCount}
            darkMode={darkMode}
            onDarkModeChange={handleDarkModeChange}
            onItemClick={handleMenuItemClick}
            onLogout={handleLogout}
          />
          
          {/* 底部版本信息 */}
          <div className="text-center py-6 space-y-2">
            <p className="text-xs text-gray-400">
              孕爸爸 v{APP_VERSION}
            </p>
            <p className="text-xs text-gray-300">
              © {COPYRIGHT_YEAR} 孕爸爸 All Rights Reserved
            </p>
          </div>
          
          {/* 底部留白 */}
          <div className="h-4" />
        </div>
      </ScrollArea>
      
      {/* 退出确认弹窗 */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-[300px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">确认退出</DialogTitle>
            <DialogDescription className="text-center pt-2">
              确定要退出登录吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:flex-col sm:space-x-0">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => setShowLogoutDialog(false)}
            >
              取消
            </Button>
            <Button
              className="flex-1 rounded-full bg-orange-500 hover:bg-orange-600"
              onClick={confirmLogout}
            >
              确认退出
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// 默认导出
export default ProfileTab
