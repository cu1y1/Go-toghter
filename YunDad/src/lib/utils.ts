import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BABY_SIZE_DATA, LEVEL_CONFIG, MEAL_TYPES } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 宝宝大小数据类型
interface BabySize {
  size: string
  length: number
  weight: number
  week: number
}

// 用户等级信息类型
interface LevelInfo {
  level: number
  name: string
  progress: number
  currentPoints: number
  minPoints: number
  maxPoints: number | null
  pointsToNext: number | null
}

/**
 * 根据孕周计算宝宝大小（支持任意周数插值）
 * @param week 孕周数（1-40）
 * @returns 宝宝大小信息
 */
export function getBabySizeByWeek(week: number): BabySize {
  // 限制周数范围
  const clampedWeek = Math.max(4, Math.min(40, week))
  
  // 找到最近的两个数据点
  let lowerBound = BABY_SIZE_DATA[0]
  let upperBound = BABY_SIZE_DATA[BABY_SIZE_DATA.length - 1]
  
  for (let i = 0; i < BABY_SIZE_DATA.length - 1; i++) {
    if (BABY_SIZE_DATA[i].week <= clampedWeek && BABY_SIZE_DATA[i + 1].week >= clampedWeek) {
      lowerBound = BABY_SIZE_DATA[i]
      upperBound = BABY_SIZE_DATA[i + 1]
      break
    }
  }
  
  // 如果正好是某个数据点
  if (lowerBound.week === clampedWeek) {
    return { ...lowerBound }
  }
  if (upperBound.week === clampedWeek) {
    return { ...upperBound }
  }
  
  // 线性插值计算
  const ratio = (clampedWeek - lowerBound.week) / (upperBound.week - lowerBound.week)
  
  const interpolatedLength = Math.round(
    (lowerBound.length + (upperBound.length - lowerBound.length) * ratio) * 10
  ) / 10
  
  const interpolatedWeight = Math.round(
    lowerBound.weight + (upperBound.weight - lowerBound.weight) * ratio
  )
  
  return {
    week: clampedWeek,
    size: ratio < 0.5 ? lowerBound.size : upperBound.size,
    length: interpolatedLength,
    weight: interpolatedWeight,
  }
}

/**
 * 根据积分计算用户等级
 * @param points 用户当前积分
 * @returns 等级信息
 */
export function getLevelByPoints(points: number): LevelInfo {
  let currentLevel = LEVEL_CONFIG[0]
  let nextLevel: typeof LEVEL_CONFIG[number] | null = null

  for (let i = 0; i < LEVEL_CONFIG.length; i++) {
    if (points >= LEVEL_CONFIG[i].minPoints && points < LEVEL_CONFIG[i].maxPoints) {
      currentLevel = LEVEL_CONFIG[i]
      nextLevel = LEVEL_CONFIG[i + 1] ?? null
      break
    }
    if (LEVEL_CONFIG[i].maxPoints === Infinity) {
      currentLevel = LEVEL_CONFIG[i]
      nextLevel = null
      break
    }
  }
  
  // 计算进度
  let progress = 100
  let pointsToNext: number | null = null
  
  if (nextLevel) {
    const rangePoints = currentLevel.maxPoints - currentLevel.minPoints
    const earnedPoints = points - currentLevel.minPoints
    progress = Math.min(100, Math.round((earnedPoints / rangePoints) * 100))
    pointsToNext = nextLevel.minPoints - points
  }
  
  return {
    level: currentLevel.level,
    name: currentLevel.name,
    progress,
    currentPoints: points,
    minPoints: currentLevel.minPoints,
    maxPoints: nextLevel ? currentLevel.maxPoints : null as number | null,
    pointsToNext,
  }
}

/**
 * 计算孕周（根据预产期）
 * @param dueDate 预产期日期
 * @returns 当前孕周数
 */
export function calculatePregnancyWeek(dueDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 预产期是40周，计算距离预产期还有多少天
  const dueDateOnly = new Date(dueDate)
  dueDateOnly.setHours(0, 0, 0, 0)
  
  const diffTime = dueDateOnly.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  // 40周 = 280天
  const totalDays = 280
  const daysPassed = totalDays - diffDays
  
  // 计算周数
  const week = Math.floor(daysPassed / 7)
  
  // 确保在合理范围内
  return Math.max(0, Math.min(42, week))
}

/**
 * 根据末次月经计算预产期
 * @param lastPeriodDate 末次月经日期
 * @returns 预产期
 */
export function calculateDueDate(lastPeriodDate: Date): Date {
  const dueDate = new Date(lastPeriodDate)
  dueDate.setMonth(dueDate.getMonth() + 9)
  dueDate.setDate(dueDate.getDate() + 7)
  return dueDate
}

/**
 * 格式化日期
 * @param date 日期对象
 * @param format 格式字符串 (YYYY=年, MM=月, DD=日, HH=时, mm=分, ss=秒)
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 获取相对时间描述
 * @param date 日期对象
 * @returns 相对时间描述（如：刚刚、5分钟前、昨天等）
 */
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffSeconds < 60) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  return formatDate(date, 'MM-DD')
}

/**
 * 获取今天的餐食类型顺序
 * @returns 餐食类型key数组，按时间顺序排列
 */
export function getTodayMealOrder(): string[] {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const currentTime = hours * 60 + minutes // 转换为分钟数
  
  // 定义各餐食的时间点（分钟）
  const mealTimes: { key: string; start: number; end: number }[] = [
    { key: 'breakfast', start: 7 * 60, end: 9 * 60 },
    { key: 'snack_morning', start: 10 * 60, end: 10 * 60 + 30 },
    { key: 'lunch', start: 11 * 60 + 30, end: 13 * 60 },
    { key: 'snack_afternoon', start: 15 * 60, end: 15 * 60 + 30 },
    { key: 'dinner', start: 18 * 60, end: 19 * 60 + 30 },
    { key: 'snack_evening', start: 20 * 60, end: 20 * 60 + 30 },
  ]
  
  // 返回按时间顺序排列的餐食类型
  return mealTimes.map(m => m.key)
}

/**
 * 获取当前应该进行的餐食类型
 * @returns 当前餐食类型的key
 */
export function getCurrentMealType(): string {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const currentTime = hours * 60 + minutes
  
  // 定义各餐食的时间范围（分钟）
  const mealTimes: { key: string; start: number; end: number }[] = [
    { key: 'breakfast', start: 7 * 60, end: 9 * 60 },
    { key: 'snack_morning', start: 9 * 60 + 1, end: 11 * 60 - 1 },
    { key: 'lunch', start: 11 * 60, end: 13 * 60 },
    { key: 'snack_afternoon', start: 13 * 60 + 1, end: 18 * 60 - 1 },
    { key: 'dinner', start: 18 * 60, end: 20 * 60 },
    { key: 'snack_evening', start: 20 * 60 + 1, end: 22 * 60 },
  ]
  
  for (const meal of mealTimes) {
    if (currentTime >= meal.start && currentTime <= meal.end) {
      return meal.key
    }
  }
  
  // 默认返回早餐
  return 'breakfast'
}

/**
 * 判断某个餐食时间是否已过
 * @param mealType 餐食类型
 * @returns 是否已过
 */
export function isMealTimePassed(mealType: string): boolean {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const currentTime = hours * 60 + minutes
  
  const meal = MEAL_TYPES[mealType as keyof typeof MEAL_TYPES]
  if (!meal) return false
  
  // 解析时间范围
  const timeParts = meal.time.split('-')
  const endTime = timeParts[timeParts.length - 1]
  const [endHour, endMin] = endTime.split(':').map(Number)
  const endMinutes = endHour * 60 + endMin
  
  return currentTime > endMinutes
}

/**
 * 计算两个日期之间的天数差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 天数差（绝对值）
 */
export function getDaysDiff(date1: Date, date2: Date): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  d1.setHours(0, 0, 0, 0)
  d2.setHours(0, 0, 0, 0)
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 检查是否是今天
 * @param date 日期
 * @returns 是否是今天
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/**
 * 获取孕周和天的组合显示
 * @param dueDate 预产期
 * @returns 如 "28周+3天"
 */
export function getPregnancyWeekDisplay(dueDate: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dueDateOnly = new Date(dueDate)
  dueDateOnly.setHours(0, 0, 0, 0)
  
  const diffTime = dueDateOnly.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const totalDays = 280
  const daysPassed = totalDays - diffDays
  
  const weeks = Math.floor(daysPassed / 7)
  const days = daysPassed % 7
  
  return `${weeks}周+${days}天`
}
