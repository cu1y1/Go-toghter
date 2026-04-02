// 打卡服务层 - 封装所有 API 调用逻辑

interface CheckInRequest {
  mealType: string
  recipeId?: string
  note?: string
}

interface CheckInResponse {
  id: string
  userId: string
  mealType: string
  recipeId: string | null
  checkDate: string
  checkTime: string
  points: number
  note: string | null
  recipe?: {
    id: string
    name: string
    image: string
  }
}

interface TodayCheckinsResponse {
  date: string
  checkIns: CheckInResponse[]
  stats: {
    total: number
    totalPoints: number
    checkedMeals: string[]
    uncheckedMeals: string[]
  }
}

interface DailyStats {
  count: number
  points: number
  mealTypes: string[]
}

interface MonthlyStatsResponse {
  year: number
  month: number
  dailyStats: Record<string, DailyStats>
  summary: {
    totalCheckIns: number
    totalPoints: number
    totalDays: number
    avgPerDay: number
    consecutiveDays: number
  }
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * 打卡服务类
 */
export class CheckInService {
  /**
   * 打卡
   * @param userId 用户ID
   * @param data 打卡数据
   * @returns 打卡结果
   */
  static async checkIn(userId: string, data: CheckInRequest): Promise<ApiResponse<CheckInResponse>> {
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(data)
      })
      
      return await response.json()
    } catch (error) {
      console.error('打卡失败:', error)
      return {
        success: false,
        error: '网络错误，请稍后重试'
      }
    }
  }

  /**
   * 获取今日打卡记录
   * @param userId 用户ID
   * @param date 日期（可选，默认今天）
   * @returns 今日打卡记录
   */
  static async getTodayCheckins(userId: string, date?: string): Promise<ApiResponse<TodayCheckinsResponse>> {
    try {
      const url = date ? `/api/checkin/today?date=${date}` : '/api/checkin/today'
      const response = await fetch(url, {
        headers: {
          'x-user-id': userId
        }
      })
      
      return await response.json()
    } catch (error) {
      console.error('获取今日打卡记录失败:', error)
      return {
        success: false,
        error: '网络错误，请稍后重试'
      }
    }
  }

  /**
   * 获取月度打卡统计
   * @param userId 用户ID
   * @param year 年份（可选，默认今年）
   * @param month 月份（可选，默认本月）
   * @returns 月度打卡统计
   */
  static async getMonthlyStats(userId: string, year?: number, month?: number): Promise<ApiResponse<MonthlyStatsResponse>> {
    try {
      let url = '/api/checkin/monthly'
      const params = new URLSearchParams()
      
      if (year) params.append('year', year.toString())
      if (month) params.append('month', month.toString())
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url, {
        headers: {
          'x-user-id': userId
        }
      })
      
      return await response.json()
    } catch (error) {
      console.error('获取月度打卡统计失败:', error)
      return {
        success: false,
        error: '网络错误，请稍后重试'
      }
    }
  }
}
