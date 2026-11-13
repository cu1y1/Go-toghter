import { API_BASE_URL } from '../config'
import { useAuthStore } from '../store/auth-store'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * 统一请求封装：
 * - 自动拼 API_BASE_URL（解决 RN 相对路径 fetch 不可用）
 * - 自动携带 Bearer token（解决零鉴权）
 * - 401 时清空本地会话，让用户重新登录
 */
export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = useAuthStore.getState().token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
    let json: ApiResponse<T>
    try {
      json = await res.json()
    } catch {
      json = { success: false, error: `HTTP ${res.status}` }
    }
    if (res.status === 401) {
      useAuthStore.getState().clearSession()
    }
    return json
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '网络请求失败'
    return { success: false, error: msg }
  }
}

export const apiGet = <T = unknown>(path: string) => api<T>(path)

export const apiPost = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) })

export const apiPut = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) })

export const apiPatch = <T = unknown>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) })

export const apiDelete = <T = unknown>(path: string) =>
  api<T>(path, { method: 'DELETE' })
