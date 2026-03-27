'use client'

import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 animate-fade-in">
      {/* Logo */}
      <div className="relative w-32 h-32 mb-8 animate-scale-in">
        <Image
          src="/logo-pregdad.png"
          alt="孕爸爸"
          fill
          className="object-contain rounded-3xl shadow-lg"
          priority
        />
      </div>

      {/* App Name */}
      <h1 className="text-4xl font-bold text-orange-500 mb-4 animate-slide-up">
        孕爸爸
      </h1>

      {/* Welcome Message */}
      <p className="text-gray-600 text-center text-lg mb-2 animate-slide-up-delay-1">
        您的贴心孕期助手
      </p>
      <p className="text-gray-500 text-center text-base mb-12 animate-slide-up-delay-2 max-w-xs">
        陪伴您和宝宝的每一个美好时刻，记录这段特别的旅程
      </p>

      {/* Features Preview */}
      <div className="grid grid-cols-3 gap-6 mb-12 w-full max-w-sm animate-fade-in-delay">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-2">
            <span className="text-2xl">📅</span>
          </div>
          <span className="text-xs text-gray-600">每日打卡</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-2">
            <span className="text-2xl">🍲</span>
          </div>
          <span className="text-xs text-gray-600">营养食谱</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-2">
            <span className="text-2xl">🎒</span>
          </div>
          <span className="text-xs text-gray-600">待产清单</span>
        </div>
      </div>

      {/* Start Button */}
      <Button
        onClick={onNext}
        className="w-full max-w-sm h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-lg font-medium shadow-lg shadow-orange-200 transition-all duration-300 hover:shadow-xl hover:shadow-orange-300 animate-slide-up-delay-3"
      >
        开始使用
      </Button>
    </div>
  )
}
