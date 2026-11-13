'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BabyNameStepProps {
  onNext: () => void
  onSkip: () => void
  initialValue: string
  onValueChange: (value: string) => void
}

export function BabyNameStep({ 
  onNext, 
  onSkip, 
  initialValue, 
  onValueChange 
}: BabyNameStepProps) {
  const [name, setName] = useState(initialValue)

  const handleNext = () => {
    onValueChange(name)
    onNext()
  }

  return (
    <div className="flex flex-col min-h-[70vh] px-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mt-8 mb-8">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
          <span className="text-4xl">👶</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          给未来宝宝起个昵称吧
        </h2>
        <p className="text-gray-500 text-sm">
          让我们更亲近地称呼您的小宝贝
        </p>
      </div>

      {/* Input */}
      <div className="space-y-4 mb-8 animate-slide-up">
        <div className="space-y-2">
          <Label htmlFor="babyName" className="text-gray-700 font-medium">
            宝宝昵称
          </Label>
          <Input
            id="babyName"
            type="text"
            placeholder="例如：小豆豆、小糖果..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-200 text-lg"
            maxLength={10}
          />
          <p className="text-xs text-gray-400 text-right">
            {name.length}/10
          </p>
        </div>
      </div>

      {/* Popular Names Suggestions */}
      <div className="mb-auto animate-fade-in-delay">
        <p className="text-sm text-gray-500 mb-3">热门昵称推荐</p>
        <div className="flex flex-wrap gap-2">
          {['小豆豆', '小糖果', '小星星', '小苹果', '小糯米'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setName(suggestion)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                name === suggestion
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-3 mt-8 pb-4">
        <Button
          onClick={handleNext}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-lg font-medium shadow-lg shadow-orange-200 transition-all duration-300"
        >
          下一步
        </Button>
        <Button
          onClick={onSkip}
          variant="ghost"
          className="w-full h-10 text-gray-400 hover:text-gray-600"
        >
          暂时跳过
        </Button>
      </div>
    </div>
  )
}
