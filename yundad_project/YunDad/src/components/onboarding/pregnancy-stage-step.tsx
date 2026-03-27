'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PREGNANCY_STAGES } from '@/lib/constants'
import { Check } from 'lucide-react'

interface PregnancyStageStepProps {
  onNext: () => void
  onSkip: () => void
  initialValue: string
  onValueChange: (value: string) => void
}

const STAGE_OPTIONS = [
  {
    id: 'early',
    name: PREGNANCY_STAGES.early.name,
    weeks: `${PREGNANCY_STAGES.early.weeks[0]}-${PREGNANCY_STAGES.early.weeks[1]}周`,
    description: PREGNANCY_STAGES.early.description,
    icon: '🌱',
    color: 'bg-green-100 text-green-600 border-green-200',
    selectedColor: 'bg-green-500 text-white border-green-500',
    tips: ['注意补充叶酸', '避免剧烈运动', '定期产检']
  },
  {
    id: 'middle',
    name: PREGNANCY_STAGES.middle.name,
    weeks: `${PREGNANCY_STAGES.middle.weeks[0]}-${PREGNANCY_STAGES.middle.weeks[1]}周`,
    description: PREGNANCY_STAGES.middle.description,
    icon: '🌿',
    color: 'bg-orange-100 text-orange-600 border-orange-200',
    selectedColor: 'bg-orange-500 text-white border-orange-500',
    tips: ['注意营养均衡', '可以适量运动', '做好体重管理']
  },
  {
    id: 'late',
    name: PREGNANCY_STAGES.late.name,
    weeks: `${PREGNANCY_STAGES.late.weeks[0]}-${PREGNANCY_STAGES.late.weeks[1]}周`,
    description: PREGNANCY_STAGES.late.description,
    icon: '🌳',
    color: 'bg-purple-100 text-purple-600 border-purple-200',
    selectedColor: 'bg-purple-500 text-white border-purple-500',
    tips: ['准备待产包', '注意胎动', '保持良好心态']
  }
]

export function PregnancyStageStep({ 
  onNext, 
  onSkip, 
  initialValue, 
  onValueChange 
}: PregnancyStageStepProps) {
  const [selectedStage, setSelectedStage] = useState<string>(initialValue)

  const handleSelect = (stageId: string) => {
    setSelectedStage(stageId)
    onValueChange(stageId)
  }

  const handleNext = () => {
    onValueChange(selectedStage)
    onNext()
  }

  return (
    <div className="flex flex-col min-h-[70vh] px-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mt-8 mb-6">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
          <span className="text-4xl">🤰</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          选择当前孕期阶段
        </h2>
        <p className="text-gray-500 text-sm">
          不同阶段有不同的注意事项和营养建议
        </p>
      </div>

      {/* Stage Options */}
      <div className="space-y-4 mb-auto animate-slide-up">
        {STAGE_OPTIONS.map((stage, index) => (
          <div
            key={stage.id}
            onClick={() => handleSelect(stage.id)}
            className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 animate-slide-up ${
              selectedStage === stage.id
                ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100'
                : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Selected Indicator */}
            {selectedStage === stage.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-scale-in">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
                selectedStage === stage.id ? 'bg-orange-200' : 'bg-gray-100'
              }`}>
                {stage.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-lg font-semibold ${
                    selectedStage === stage.id ? 'text-orange-600' : 'text-gray-800'
                  }`}>
                    {stage.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedStage === stage.id ? 'bg-orange-200 text-orange-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {stage.weeks}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{stage.description}</p>
                
                {/* Tips */}
                <div className="flex flex-wrap gap-2">
                  {stage.tips.map((tip, tipIndex) => (
                    <span 
                      key={tipIndex}
                      className={`text-xs px-2 py-1 rounded-lg ${
                        selectedStage === stage.id 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {tip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="space-y-3 mt-8 pb-4">
        <Button
          onClick={handleNext}
          disabled={!selectedStage}
          className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-lg font-medium shadow-lg shadow-orange-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
