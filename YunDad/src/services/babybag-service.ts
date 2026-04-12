// 待产包服务层 - 封装所有 API 调用逻辑

// 错误类型枚举
export enum ServiceErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// 服务错误类
export class ServiceError extends Error {
  type: ServiceErrorType
  originalError?: unknown

  constructor(type: ServiceErrorType, message: string, originalError?: unknown) {
    super(message)
    this.name = 'ServiceError'
    this.type = type
    this.originalError = originalError
  }
}

export interface BabyBagCategory {
  id: string
  name: string
  icon: string
  sortOrder: number
  items: BabyBagItem[]
}

export interface BabyBagItem {
  id: string
  categoryId: string
  name: string
  description: string | null
  isDefault: boolean
  isPrepared: boolean
  userId: string | null
  sortOrder: number
  category?: {
    id: string
    name: string
    icon: string
  }
}

export interface BabyBagStats {
  total: number
  prepared: number
  progress: number
}

interface BabyBagResponse {
  categories: BabyBagCategory[]
  stats: BabyBagStats
}

interface AddItemRequest {
  categoryId: string
  name: string
  description?: string
}

interface UpdateItemRequest {
  isPrepared?: boolean
  name?: string
  description?: string
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 获取 API 基础 URL
function getApiBaseUrl(): string {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL
  }
  // 开发环境默认值
  if (typeof window !== 'undefined') {
    // 浏览器环境使用相对路径
    return ''
  }
  // React Native 或服务器环境
  return 'http://localhost:3000'
}

// 通用请求处理
async function fetchApi<T>(
  url: string,
  options: RequestInit = {},
  userId: string
): Promise<ApiResponse<T>> {
  try {
    const apiBaseUrl = getApiBaseUrl()
    const fullUrl = url.startsWith('/') ? `${apiBaseUrl}${url}` : url

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
      'x-user-id': userId,
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    })

    // 处理 HTTP 状态码
    if (!response.ok) {
      let errorType = ServiceErrorType.SERVER_ERROR
      let errorMessage = '服务器错误，请稍后重试'

      switch (response.status) {
        case 401:
          errorType = ServiceErrorType.AUTH_ERROR
          errorMessage = '未授权，请重新登录'
          break
        case 404:
          errorType = ServiceErrorType.NOT_FOUND
          errorMessage = '资源不存在'
          break
        case 400:
          errorType = ServiceErrorType.VALIDATION_ERROR
          errorMessage = '请求参数错误'
          break
        case 500:
          errorType = ServiceErrorType.SERVER_ERROR
          errorMessage = '服务器内部错误'
          break
      }

      throw new ServiceError(errorType, errorMessage)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ServiceError) {
      console.error(`API 请求错误 [${error.type}]:`, error.message)
      return {
        success: false,
        error: error.message,
      }
    }

    // 网络错误
    console.error('网络请求失败:', error)
    return {
      success: false,
      error: '网络连接失败，请检查网络后重试',
    }
  }
}

/**
 * 待产包服务类
 */
export class BabyBagService {
  /**
   * 获取待产包物品
   * @param userId 用户ID
   * @returns 待产包物品和统计数据
   */
  static async getBabyBagItems(userId: string): Promise<ApiResponse<BabyBagResponse>> {
    return await fetchApi<BabyBagResponse>('/api/babybag', {}, userId)
  }

  /**
   * 添加自定义物品
   * @param userId 用户ID
   * @param data 物品数据
   * @returns 添加的物品
   */
  static async addItem(userId: string, data: AddItemRequest): Promise<ApiResponse<BabyBagItem>> {
    return await fetchApi<BabyBagItem>(
      '/api/babybag',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      userId
    )
  }

  /**
   * 更新物品
   * @param userId 用户ID
   * @param itemId 物品ID
   * @param data 更新数据
   * @returns 更新后的物品
   */
  static async updateItem(userId: string, itemId: string, data: UpdateItemRequest): Promise<ApiResponse<BabyBagItem>> {
    return await fetchApi<BabyBagItem>(
      `/api/babybag/${itemId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      userId
    )
  }

  /**
   * 删除物品
   * @param userId 用户ID
   * @param itemId 物品ID
   * @returns 删除结果
   */
  static async deleteItem(userId: string, itemId: string): Promise<ApiResponse<void>> {
    return await fetchApi<void>(
      `/api/babybag/${itemId}`,
      {
        method: 'DELETE',
      },
      userId
    )
  }
}
