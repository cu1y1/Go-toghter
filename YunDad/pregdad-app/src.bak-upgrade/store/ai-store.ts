import { create } from 'zustand'
import { apiGet, apiPost } from '../services/apiClient'

export interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

interface AiState {
  messages: ChatMsg[]
  sending: boolean
  mode: 'mock' | 'glm'
  quotaUsed: number
  quotaLimit: number
  send: (text: string) => Promise<boolean>
  refreshMeta: () => Promise<void>
  clear: () => void
}

export const useAiStore = create<AiState>((set, get) => ({
  messages: [],
  sending: false,
  mode: 'mock',
  quotaUsed: 0,
  quotaLimit: 10,

  refreshMeta: async () => {
    try {
      const res = await apiGet<{ mode: 'mock' | 'glm'; quota: { used: number; limit: number } }>('/api/ai/chat')
      if (res.data) {
        set({ mode: res.data.mode, quotaUsed: res.data.quota.used, quotaLimit: res.data.quota.limit })
      }
    } catch { /* 静默 */ }
  },

  send: async (text) => {
    const trimmed = text.trim()
    if (!trimmed || get().sending) return false
    const history = [...get().messages, { role: 'user' as const, content: trimmed }]
    set({ messages: history, sending: true })
    try {
      const res = await apiPost<{ content: string | null; mode: 'mock' | 'glm'; quota: { used: number; limit: number } }>(
        '/api/ai/chat',
        { messages: history.slice(-10).map((m) => ({ role: m.role, content: m.content })) }
      )
      if (res.success && res.data?.content) {
        set({
          messages: [...history, { role: 'assistant', content: res.data.content }],
          sending: false,
          mode: res.data.mode,
          quotaUsed: res.data.quota.used,
          quotaLimit: res.data.quota.limit,
        })
        return true
      }
      set({
        messages: [...history, { role: 'assistant', content: `抱歉，我暂时答不上来（${res.error ?? '未知错误'}）。稍后再试试。` }],
        sending: false,
      })
      return false
    } catch {
      set({
        messages: [...history, { role: 'assistant', content: '网络不太顺畅，请检查连接后重试。' }],
        sending: false,
      })
      return false
    }
  },

  clear: () => set({ messages: [] }),
}))
