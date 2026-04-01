"use client"

import { useState, useCallback } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseAsyncOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useAsync<T>(initialData: T | null = null) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (promise: Promise<any>, options?: UseAsyncOptions) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await promise
      const data = response.json ? await response.json() : response
      
      if (data.success === false) {
        throw new Error(data.error || '请求失败')
      }
      
      setState({ data, loading: false, error: null })
      options?.onSuccess?.(data)
      return data
    } catch (err: any) {
      const error = err.message || '网络错误，请稍后重试'
      setState(prev => ({ ...prev, loading: false, error }))
      options?.onError?.(error)
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}

// 通用加载骨架
export function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4">
      <div className="h-4 bg-muted rounded w-1/3" />
      <div className="h-20 bg-muted rounded" />
    </div>
  )
}

// 通用错误提示
export function ErrorMessage({ 
  message, 
  onRetry 
}: { 
  message: string 
  onRetry?: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <span className="text-3xl mb-2">⚠️</span>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 text-sm text-primary hover:underline"
        >
          点击重试
        </button>
      )}
    </div>
  )
}

// 通用空状态
export function EmptyState({ 
  message = "暂无数据",
  icon = "📭"
}: { 
  message?: string
  icon?: string 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <span className="text-3xl mb-2">{icon}</span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}