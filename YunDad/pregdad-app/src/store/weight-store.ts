import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../services/apiClient'

export interface WeightRecord {
  id: string
  weightKg: number
  recordDate: string
  week?: number | null
  note?: string | null
}

export interface WeightProfile {
  heightCm?: number | null
  prePregnancyWeight?: number | null
}

interface WeightState {
  records: WeightRecord[]
  profile: WeightProfile
  preBMI: number | null
  loading: boolean
  fetchWeights: () => Promise<boolean>
  addWeight: (weightKg: number, recordDate?: string, note?: string) => Promise<boolean>
  updateWeight: (id: string, weightKg: number, note?: string) => Promise<boolean>
  deleteWeight: (id: string) => Promise<boolean>
  saveProfile: (heightCm?: number, prePregnancyWeight?: number) => Promise<boolean>
  // 本地计算：IOM 2009 增重建议（按孕前BMI分类）
  getGainAdvice: () => { range: [number, number]; label: string; currentGain: number | null }
  getCurveData: () => { date: string; weight: number; week?: number | null }[]
}

// IOM 2009 孕期增重建议（kg）——按孕前BMI
function iomRange(bmi: number | null): { range: [number, number]; label: string } {
  if (bmi === null) return { range: [11.5, 16], label: '正常（按默认BMI推算）' }
  if (bmi < 18.5) return { range: [12.5, 18], label: '偏瘦' }
  if (bmi < 25) return { range: [11.5, 16], label: '正常' }
  if (bmi < 30) return { range: [7, 11.5], label: '超重' }
  return { range: [5, 9], label: '肥胖' }
}

export const useWeightStore = create<WeightState>()(
  persist(
    (set, get) => ({
      records: [],
      profile: {},
      preBMI: null,
      loading: false,

      fetchWeights: async () => {
        set({ loading: true })
        try {
          const res = await apiGet<{ list: WeightRecord[]; preBMI: number | null; profile: WeightProfile }>(
            '/api/weights'
          )
          const d = res.data
          set({
            records: d?.list ?? [],
            preBMI: d?.preBMI ?? null,
            profile: d?.profile ?? {},
            loading: false,
          })
          return true
        } catch {
          set({ loading: false })
          return false
        }
      },

      addWeight: async (weightKg, recordDate, note) => {
        try {
          await apiPost<WeightRecord>('/api/weights', { weightKg, recordDate, note })
          await get().fetchWeights()
          return true
        } catch {
          return false
        }
      },

      updateWeight: async (id, weightKg, note) => {
        try {
          await apiPatch<WeightRecord>(`/api/weights/${id}`, { weightKg, note })
          await get().fetchWeights()
          return true
        } catch {
          return false
        }
      },

      deleteWeight: async (id) => {
        try {
          await apiDelete(`/api/weights/${id}`)
          set((s) => ({ records: s.records.filter((r) => r.id !== id) }))
          return true
        } catch {
          return false
        }
      },

      saveProfile: async (heightCm, prePregnancyWeight) => {
        try {
          const u = await apiPut<WeightProfile>('/api/weights/profile', { heightCm, prePregnancyWeight })
          // 重新拉取以刷新preBMI
          await get().fetchWeights()
          set({ profile: { ...get().profile, ...u } })
          return true
        } catch {
          return false
        }
      },

      getGainAdvice: () => {
        const { preBMI, records } = get()
        const { range, label } = iomRange(preBMI)
        const first = records[0]
        const last = records[records.length - 1]
        const currentGain =
          first && last && first.id !== last.id ? Number((last.weightKg - first.weightKg).toFixed(1)) : null
        return { range, label, currentGain }
      },

      getCurveData: () => {
        return get().records.map((r) => ({
          date: typeof r.recordDate === 'string' ? r.recordDate.slice(0, 10) : String(r.recordDate),
          weight: r.weightKg,
          week: r.week,
        }))
      },
    }),
    {
      name: 'pregdad-weights',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ profile: s.profile, preBMI: s.preBMI }) as never,
    }
  )
)
