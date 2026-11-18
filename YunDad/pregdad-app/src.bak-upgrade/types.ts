// 共享类型定义（与后端 prisma schema 对齐）
// 注：src/types.d.ts 是 expo-status-bar 的环境声明，与此文件共存

export type MealType =
  | 'breakfast'
  | 'snack_morning'
  | 'lunch'
  | 'snack_afternoon'
  | 'dinner'
  | 'snack_evening'

export interface User {
  id: string
  email?: string | null
  babyName?: string | null
  dueDate?: string | Date | null
  pregnancyWeek: number
  avatar?: string | null
  level: number
  points: number
  createdAt?: Date | string
  deliveryMethod?: 'natural' | 'cesarean' | 'undecided' | null
  hospitalType?: 'single' | 'double' | 'multi' | null
  hospitalDays?: number
}

export interface CheckInRecord {
  id: string
  mealType: string
  points: number
  note?: string | null
  recipe?: { id: string; name: string; image: string | null } | null
  checkDate?: string
}

export interface BabyBagItem {
  id: string
  categoryId: string
  name: string
  description?: string | null
  isDefault: boolean
  isPrepared: boolean
  userId?: string
  sortOrder?: number
}

export interface RecipeNutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
}

export interface Recipe {
  id: string
  name: string
  description: string
  image: string | null
  mealType: MealType | string
  ingredients: string[]
  steps: string[]
  nutrition: RecipeNutrition
  suitableWeeks: string
  tags: string[]
  rating: number
  reviewCount?: number
  cookTime?: number
  isFavorite?: boolean
}
