// 用户类型
export interface User {
  id: string
  babyName: string
  dueDate: Date
  pregnancyWeek: number
  level: number
  points: number
  avatar: string | null
  createdAt: Date
}

// 食谱类型
export interface Recipe {
  id: string
  name: string
  description: string
  image: string
  mealType: MealType
  ingredients: string[]
  steps: string[]
  videoUrl?: string
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
  }
  suitableWeeks: string
  tags: string[]
  rating: number
  reviewCount: number
  cookTime: number
  isFavorite: boolean
}

// 餐食类型
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack_morning' | 'snack_afternoon' | 'snack_evening'

// 饮食计划类型
export interface MealPlan {
  id: string
  userId: string
  recipeId: string
  mealType: MealType
  planDate: Date
  isCompleted: boolean
  recipe?: Recipe
}

// 打卡记录类型
export interface CheckInRecord {
  id: string
  userId: string
  mealType: MealType
  recipeId?: string
  checkDate: Date
  checkTime: string
  points: number
  note?: string
  recipeName?: string
}

// 待产包物品类型
export interface BabyBagItem {
  id: string
  categoryId: string
  name: string
  description?: string
  isDefault: boolean
  isPrepared: boolean
  isCustom: boolean
  sortOrder: number
}

// 知识文章类型
export interface Knowledge {
  id: string
  title: string
  content: string
  category: 'taboo' | 'knowledge' | 'nutrition' | 'faq'
  tags: string[]
  suitableWeeks?: string
  viewCount: number
}

// 每日小贴士类型
export interface DailyTip {
  id: string
  content: string
  weekRange: string
  category: string
}

// 导航Tab类型
export type TabType = 'home' | 'recipe' | 'checkin' | 'babybag' | 'profile'
