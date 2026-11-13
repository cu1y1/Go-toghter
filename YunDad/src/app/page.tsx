'use client'

import { useUserStore } from '@/store/user-store'
import { Onboarding } from '@/components/onboarding'
import { MainLayout } from '@/components/layout/main-layout'

export default function Home() {
  const { isLoggedIn } = useUserStore()

  // 如果用户未登录，显示引导流程
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-white">
        <Onboarding />
      </main>
    )
  }

  // 用户已登录，显示主应用
  return (
    <main className="min-h-screen bg-white">
      <MainLayout />
    </main>
  )
}
