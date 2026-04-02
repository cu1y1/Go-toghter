'use client'

import { useBabyBagStore } from '@/store/babybag-store'
import { Progress } from '@/components/ui/progress'
import { Package, CheckCircle2 } from 'lucide-react'

export function ProgressHeader() {
  const { getTotalProgress } = useBabyBagStore()
  const { prepared, total, progress } = getTotalProgress()

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 shadow-sm border border-orange-100">
      {/* 标题区域 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
          <Package className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">待产包准备</h2>
          <p className="text-xs text-gray-500">为宝宝到来做好准备</p>
        </div>
      </div>

      {/* 进度信息 */}
      <div className="bg-white/60 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700">准备进度</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-orange-500">{prepared}</span>
            <span className="text-sm text-gray-400">/</span>
            <span className="text-sm text-gray-500">{total}</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="relative">
          <Progress 
            value={progress} 
            className="h-3 bg-orange-100 rounded-full overflow-hidden"
          />
          <div 
            className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${progress}%`,
              backgroundSize: '200% 100%',
              animation: progress > 0 ? 'shimmer 2s infinite' : 'none'
            }}
          />
        </div>

        {/* 百分比显示 */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">
            {progress === 100 ? '🎉 已全部准备完成！' : '继续加油准备吧~'}
          </span>
          <span className="text-sm font-semibold text-orange-500">{progress}%</span>
        </div>
      </div>

      {/* 内联样式 */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
