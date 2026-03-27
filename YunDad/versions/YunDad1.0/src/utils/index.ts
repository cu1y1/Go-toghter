import { BABY_SIZE_DATA, LEVEL_CONFIG } from '../constants'

// 根据孕周计算宝宝大小（支持任意周数）
export function getBabySizeByWeek(week: number): { size: string; length: number; weight: number } {
  // 找到最近的两个数据点进行插值
  const sortedData = [...BABY_SIZE_DATA].sort((a, b) => a.week - b.week)
  
  // 如果小于最小周数
  if (week <= sortedData[0].week) {
    return {
      size: sortedData[0].size,
      length: sortedData[0].length,
      weight: sortedData[0].weight,
    }
  }
  
  // 如果大于最大周数
  if (week >= sortedData[sortedData.length - 1].week) {
    const last = sortedData[sortedData.length - 1]
    return {
      size: last.size,
      length: last.length,
      weight: last.weight,
    }
  }
  
  // 找到插值区间
  for (let i = 0; i < sortedData.length - 1; i++) {
    if (week >= sortedData[i].week && week < sortedData[i + 1].week) {
      const prev = sortedData[i]
      const next = sortedData[i + 1]
      const ratio = (week - prev.week) / (next.week - prev.week)
      
      return {
        size: ratio < 0.5 ? prev.size : next.size,
        length: Math.round((prev.length + (next.length - prev.length) * ratio) * 10) / 10,
        weight: Math.round(prev.weight + (next.weight - prev.weight) * ratio),
      }
    }
  }
  
  return { size: '未知', length: 0, weight: 0 }
}

// 根据积分计算用户等级
export function getLevelByPoints(points: number): { level: number; name: string; progress: number; nextLevel: number | null; pointsToNext: number } {
  for (let i = 0; i < LEVEL_CONFIG.length; i++) {
    const config = LEVEL_CONFIG[i]
    if (points >= config.minPoints && points < config.maxPoints) {
      const nextConfig = LEVEL_CONFIG[i + 1]
      const progress = nextConfig 
        ? ((points - config.minPoints) / (config.maxPoints - config.minPoints)) * 100 
        : 100
      return {
        level: config.level,
        name: config.name,
        progress: Math.min(progress, 100),
        nextLevel: nextConfig?.level || null,
        pointsToNext: nextConfig ? config.maxPoints - points : 0,
      }
    }
  }
  return {
    level: 6,
    name: '超级准妈',
    progress: 100,
    nextLevel: null,
    pointsToNext: 0,
  }
}

// 根据预产期计算孕周
export function calculatePregnancyWeek(dueDate: Date): number {
  const now = new Date()
  const diff = dueDate.getTime() - now.getTime()
  const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24))
  const weeksRemaining = daysRemaining / 7
  return Math.max(1, Math.min(42, Math.floor(40 - weeksRemaining)))
}

// 格式化日期
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
}

// 获取孕周显示（如"28周+3天"）
export function getPregnancyWeekDisplay(dueDate: Date): string {
  const now = new Date()
  const diff = dueDate.getTime() - now.getTime()
  const totalDays = Math.ceil((40 * 7 * 24 * 60 * 60 * 1000 - diff) / (1000 * 60 * 60 * 24))
  const weeks = Math.floor(totalDays / 7)
  const days = totalDays % 7
  return `${weeks}周+${days}天`
}

// 计算连续打卡天数
export function calculateStreak(checkIns: Date[]): number {
  if (checkIns.length === 0) return 0
  
  const sorted = [...checkIns].sort((a, b) => b.getTime() - a.getTime())
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  let currentDate = today
  
  for (const checkIn of sorted) {
    const checkInDate = new Date(checkIn)
    checkInDate.setHours(0, 0, 0, 0)
    
    const diffDays = Math.floor((currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0 || diffDays === 1) {
      streak++
      currentDate = checkInDate
    } else {
      break
    }
  }
  
  return streak
}
