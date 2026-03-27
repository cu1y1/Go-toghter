'use client'

import { useState } from 'react'
import { WelcomeStep } from './welcome-step'
import { BabyNameStep } from './baby-name-step'
import { DueDateStep } from './due-date-step'
import { PregnancyStageStep } from './pregnancy-stage-step'
import { CompleteStep } from './complete-step'
import { useUserStore } from '@/store/user-store'

interface OnboardingData {
  babyName: string
  dueDate: string
  pregnancyStage: string
}

const TOTAL_STEPS = 5

export function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    babyName: '',
    dueDate: '',
    pregnancyStage: '',
  })
  const { setUser, setIsLoggedIn } = useUserStore()

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1))
  }

  const handleSkip = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1))
  }

  const handleComplete = () => {
    // Create user with collected data
    const pregnancyStageToWeek: Record<string, number> = {
      early: 6,  // mid-point of 1-12 weeks
      middle: 20, // mid-point of 13-27 weeks
      late: 34,   // mid-point of 28-40 weeks
    }

    const user = {
      id: `user_${Date.now()}`,
      babyName: data.babyName,
      dueDate: data.dueDate,
      pregnancyWeek: data.pregnancyStage 
        ? pregnancyStageToWeek[data.pregnancyStage] || 1 
        : 1,
      level: 1,
      points: 0,
      avatar: null,
    }

    setUser(user)
    setIsLoggedIn(true)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />
      case 1:
        return (
          <BabyNameStep
            onNext={handleNext}
            onSkip={handleSkip}
            initialValue={data.babyName}
            onValueChange={(value) => setData((prev) => ({ ...prev, babyName: value }))}
          />
        )
      case 2:
        return (
          <DueDateStep
            onNext={handleNext}
            onSkip={handleSkip}
            initialValue={data.dueDate}
            onValueChange={(value) => setData((prev) => ({ ...prev, dueDate: value }))}
          />
        )
      case 3:
        return (
          <PregnancyStageStep
            onNext={handleNext}
            onSkip={handleSkip}
            initialValue={data.pregnancyStage}
            onValueChange={(value) => setData((prev) => ({ ...prev, pregnancyStage: value }))}
          />
        )
      case 4:
        return (
          <CompleteStep
            onComplete={handleComplete}
            babyName={data.babyName}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Step Indicator */}
      {currentStep > 0 && currentStep < 4 && (
        <div className="pt-4 px-6">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: TOTAL_STEPS - 1 }).map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index < currentStep
                      ? 'bg-orange-500 w-4'
                      : index === currentStep - 1
                        ? 'bg-orange-500 w-6'
                        : 'bg-gray-200'
                  }`}
                />
                {index < TOTAL_STEPS - 2 && (
                  <div
                    className={`w-8 h-0.5 transition-all duration-300 ${
                      index < currentStep - 1 ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-2">
            第 {currentStep} 步，共 {TOTAL_STEPS - 1} 步
          </p>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 flex flex-col">
        {renderStep()}
      </div>
    </div>
  )
}
