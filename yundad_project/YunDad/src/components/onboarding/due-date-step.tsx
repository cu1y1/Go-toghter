'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, addDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { CalendarIcon, ChevronDown } from 'lucide-react'

interface DueDateStepProps {
  onNext: () => void
  onSkip: () => void
  initialValue: string
  onValueChange: (value: string) => void
}

export function DueDateStep({ 
  onNext, 
  onSkip, 
  initialValue, 
  onValueChange 
}: DueDateStepProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialValue ? new Date(initialValue) : undefined
  )
  const [showWeekInput, setShowWeekInput] = useState(false)
  const [pregnancyWeek, setPregnancyWeek] = useState<string>('')
  const [popoverOpen, setPopoverOpen] = useState(false)

  // 计算预产期（从孕周推算）
  const calculateDueDate = (week: number) => {
    const remainingWeeks = 40 - week
    const dueDate = addDays(new Date(), remainingWeeks * 7)
    return dueDate
  }

  const handleWeekSubmit = () => {
    const week = parseInt(pregnancyWeek)
    if (week >= 1 && week <= 40) {
      const dueDate = calculateDueDate(week)
      setSelectedDate(dueDate)
      onValueChange(format(dueDate, 'yyyy-MM-dd'))
      onNext()
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      onValueChange(format(date, 'yyyy-MM-dd'))
    }
    setPopoverOpen(false)
  }

  const handleNext = () => {
    if (selectedDate) {
      onValueChange(format(selectedDate, 'yyyy-MM-dd'))
    }
    onNext()
  }

  return (
    <div className="flex flex-col min-h-[70vh] px-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mt-8 mb-8">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
          <span className="text-4xl">📅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          选择预产期
        </h2>
        <p className="text-gray-500 text-sm">
          帮助我们为您提供更精准的孕期指导
        </p>
      </div>

      {/* Date Picker */}
      <div className="space-y-4 mb-6 animate-slide-up">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-full h-14 justify-between rounded-xl text-lg font-normal ${
                selectedDate ? 'text-gray-800' : 'text-gray-400'
              }`}
            >
              {selectedDate ? (
                <span className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-orange-500" />
                  {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  点击选择预产期
                </span>
              )}
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 280)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6 animate-fade-in-delay">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-gray-400 text-sm">或者</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Know Pregnancy Week Option */}
      <div className="mb-auto animate-slide-up-delay">
        <button
          onClick={() => setShowWeekInput(!showWeekInput)}
          className="w-full p-4 bg-orange-50 rounded-xl flex items-center justify-between group transition-all duration-200 hover:bg-orange-100"
        >
          <span className="text-orange-600 font-medium">我已经知道孕周</span>
          <ChevronDown 
            className={`w-5 h-5 text-orange-400 transition-transform duration-200 ${
              showWeekInput ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showWeekInput && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl animate-slide-down">
            <p className="text-sm text-gray-600 mb-3">输入您目前的孕周数</p>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={pregnancyWeek}
                  onChange={(e) => setPregnancyWeek(e.target.value)}
                  placeholder="如：12"
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-lg"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  周
                </span>
              </div>
              <Button
                onClick={handleWeekSubmit}
                disabled={!pregnancyWeek || parseInt(pregnancyWeek) < 1 || parseInt(pregnancyWeek) > 40}
                className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
              >
                确认
              </Button>
            </div>
            {pregnancyWeek && parseInt(pregnancyWeek) >= 1 && parseInt(pregnancyWeek) <= 40 && (
              <p className="text-sm text-gray-500 mt-3">
                预计预产期：{format(calculateDueDate(parseInt(pregnancyWeek)), 'yyyy年MM月dd日', { locale: zhCN })}
              </p>
            )}
          </div>
        )}
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
