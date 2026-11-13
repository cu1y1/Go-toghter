'use client'

import { Button } from '@/components/ui/button'
import { Confetti } from './confetti'
import { useUserStore } from '@/store/user-store'

interface CompleteStepProps {
  onComplete: () => void
  babyName: string
}

export function CompleteStep({ onComplete, babyName }: CompleteStepProps) {
  const { user } = useUserStore()

  const displayBabyName = babyName || '宝宝'

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 relative overflow-hidden animate-fade-in">
      {/* Confetti Effect */}
      <Confetti />

      {/* Success Icon */}
      <div className="relative mb-8 animate-bounce-in">
        <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-200">
          <span className="text-6xl">🎉</span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-scale-in">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Congratulations */}
      <h1 className="text-3xl font-bold text-gray-800 mb-3 animate-slide-up text-center">
        恭喜设置完成！
      </h1>

      <p className="text-gray-500 text-center mb-8 animate-slide-up-delay-1 max-w-xs">
        {displayBabyName ? (
          <>
            从今天起，我们将陪伴您和
            <span className="text-orange-500 font-semibold">{displayBabyName}</span>
            一起度过这段美好的孕期旅程
          </>
        ) : (
          <>从今天起，我们将陪伴您一起度过这段美好的孕期旅程</>
        )}
      </p>

      {/* Feature Highlights */}
      <div className="w-full max-w-sm space-y-3 mb-10 animate-fade-in-delay">
        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">✅</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">每日打卡记录</p>
            <p className="text-xs text-gray-500">记录您和宝宝每一天的变化</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">🍲</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">科学营养食谱</p>
            <p className="text-xs text-gray-500">根据孕期阶段推荐健康食谱</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">🎒</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">待产清单提醒</p>
            <p className="text-xs text-gray-500">帮助您做好充分准备</p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <Button
        onClick={onComplete}
        className="w-full max-w-sm h-14 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white rounded-2xl text-lg font-medium shadow-xl shadow-orange-200 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-300 animate-slide-up-delay-2"
      >
        开始体验
      </Button>

      {/* User Info Summary */}
      {user && (
        <div className="mt-6 text-center text-sm text-gray-400 animate-fade-in-delay">
          <p>预产期: {user.dueDate || '未设置'} · 孕周: {user.pregnancyWeek || '未设置'}周</p>
        </div>
      )}
    </div>
  )
}
