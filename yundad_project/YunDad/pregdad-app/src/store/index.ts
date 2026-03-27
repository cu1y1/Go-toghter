import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, MealType, CheckInRecord, BabyBagItem, Recipe } from '../types'
import { DEFAULT_BABY_BAG_ITEMS } from '../constants'

// 用户状态
interface UserState {
  user: User | null
  isLoggedIn: boolean
  setUser: (user: User | null) => void
  updateUser: (data: Partial<User>) => void
  updatePoints: (points: number) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),
      updatePoints: (points) => set((state) => ({
        user: state.user ? { ...state.user, points: state.user.points + points } : null
      })),
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: 'pregdad-user',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = localStorage.getItem(name)
          return value
        },
        setItem: (name, value) => {
          localStorage.setItem(name, value)
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      })),
    }
  )
)

// 打卡状态
interface CheckInState {
  todayCheckIns: CheckInRecord[]
  monthlyCheckIns: CheckInRecord[]
  setTodayCheckIns: (checkIns: CheckInRecord[]) => void
  addCheckIn: (checkIn: CheckInRecord) => void
  toggleCheckIn: (mealType: MealType) => void
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      todayCheckIns: [],
      monthlyCheckIns: [],
      setTodayCheckIns: (checkIns) => set({ todayCheckIns: checkIns }),
      addCheckIn: (checkIn) => set((state) => ({
        todayCheckIns: [...state.todayCheckIns, checkIn],
        monthlyCheckIns: [...state.monthlyCheckIns, checkIn],
      })),
      toggleCheckIn: (mealType) => set((state) => {
        const existing = state.todayCheckIns.find(c => c.mealType === mealType)
        if (existing) {
          return {
            todayCheckIns: state.todayCheckIns.map(c =>
              c.mealType === mealType ? { ...c, points: c.points > 0 ? 0 : 10 } : c
            )
          }
        }
        return state
      }),
    }),
    {
      name: 'pregdad-checkin',
    }
  )
)

// 待产包状态
interface BabyBagState {
  items: BabyBagItem[]
  toggleItem: (id: string) => void
  addItem: (item: BabyBagItem) => void
  removeItem: (id: string) => void
  getProgress: () => { prepared: number; total: number }
}

const initialItems: BabyBagItem[] = Object.entries(DEFAULT_BABY_BAG_ITEMS).flatMap(([categoryId, items]) =>
  items.map((name, index) => ({
    id: `${categoryId}-${index}`,
    categoryId,
    name,
    isDefault: true,
    isPrepared: false,
    isCustom: false,
    sortOrder: index,
  }))
)

export const useBabyBagStore = create<BabyBagState>()(
  persist(
    (set, get) => ({
      items: initialItems,
      toggleItem: (id) => set((state) => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, isPrepared: !item.isPrepared } : item
        )
      })),
      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, isCustom: true, sortOrder: state.items.length }]
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      getProgress: () => {
        const items = get().items
        return {
          prepared: items.filter(i => i.isPrepared).length,
          total: items.length,
        }
      },
    }),
    {
      name: 'pregdad-babybag',
    }
  )
)

// 收藏状态
interface FavoriteState {
  favorites: string[]
  addFavorite: (recipeId: string) => void
  removeFavorite: (recipeId: string) => void
  isFavorite: (recipeId: string) => boolean
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (recipeId) => set((state) => ({
        favorites: [...state.favorites, recipeId]
      })),
      removeFavorite: (recipeId) => set((state) => ({
        favorites: state.favorites.filter(id => id !== recipeId)
      })),
      isFavorite: (recipeId) => get().favorites.includes(recipeId),
    }),
    {
      name: 'pregdad-favorites',
    }
  )
)
