'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface CheckInRecord {
  date: Date
  count: number // 当天打卡次数
}

interface CalendarViewProps {
  checkedDates: CheckInRecord[]
  onDateSelect?: (date: Date) => void
  selectedDate?: Date
}

// 周几名称
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView({ checkedDates, onDateSelect, selectedDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // 生成日历数据
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
    
    const days: Date[] = []
    let day = startDate
    
    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }
    
    return days
  }, [currentMonth])
  
  // 检查某天是否有打卡记录
  const getCheckInInfo = (date: Date): CheckInRecord | undefined => {
    return checkedDates.find(record => isSameDay(record.date, date))
  }
  
  // 上一月
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }
  
  // 下一月
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }
  
  // 回到今天
  const goToToday = () => {
    setCurrentMonth(new Date())
    onDateSelect?.(new Date())
  }
  
  // 点击日期
  const handleDateClick = (date: Date) => {
    onDateSelect?.(date)
  }
  
  return (
    <Card className="bg-white border-orange-100 shadow-lg overflow-hidden">
      {/* 日历头部 */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 border-b border-orange-100">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevMonth}
            className="h-8 w-8 hover:bg-orange-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </Button>
          
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-800">
              {format(currentMonth, 'yyyy年M月', { locale: zhCN })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-7 text-xs border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              今天
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={nextMonth}
            className="h-8 w-8 hover:bg-orange-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3">
        {/* 星期头部 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day, index) => (
            <div
              key={day}
              className={`text-center text-xs font-medium py-2 ${
                index === 0 ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 日期格子 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            const checkInInfo = getCheckInInfo(date)
            const isCurrentMonth = isSameMonth(date, currentMonth)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isTodayDate = isToday(date)
            const isSunday = index % 7 === 0
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`
                  relative aspect-square flex flex-col items-center justify-center rounded-xl
                  transition-all duration-200 tap-highlight
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isSelected 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : isTodayDate
                      ? 'bg-orange-100 text-orange-600'
                      : 'hover:bg-orange-50'
                  }
                  ${isSunday && !isSelected ? 'text-red-500' : ''}
                `}
              >
                {/* 日期数字 */}
                <span className={`text-sm font-medium ${isSelected ? 'text-white' : ''}`}>
                  {format(date, 'd')}
                </span>
                
                {/* 打卡标记 */}
                {checkInInfo && isCurrentMonth && (
                  <div className="absolute bottom-1 flex items-center gap-0.5">
                    {checkInInfo.count >= 3 ? (
                      // 3次及以上显示勾选
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-white/30' : 'bg-orange-500'
                      }`}>
                        <Check className={`w-2.5 h-2.5 ${isSelected ? 'text-white' : 'text-white'}`} />
                      </div>
                    ) : (
                      // 显示圆点表示打卡次数
                      <div className="flex gap-0.5">
                        {[...Array(Math.min(checkInInfo.count, 3))].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              isSelected ? 'bg-white/70' : 'bg-orange-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        {/* 图例说明 */}
        <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-xs text-gray-500">已打卡</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs text-gray-500">完成度高</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-lg bg-orange-100" />
            <span className="text-xs text-gray-500">今天</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CalendarView
