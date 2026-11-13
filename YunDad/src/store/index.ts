// 孕爸爸App - 全局状态管理
// 使用 Zustand 进行状态管理

// 用户状态
export { 
  useUserStore,
  type UserInfo,
} from './user-store'

// Tab导航状态
export { 
  useTabStore, 
  type TabType,
  TAB_CONFIG,
} from './tab-store'

// 饮食计划和打卡状态
export { 
  useMealPlanStore, 
  useCheckInStore,
  initializeTodayCheckIns,
  type MealType,
  type Recipe,
  type MealPlanItem,
  type CheckInItem,
  type MonthlyStats,
  MEAL_TYPE_LABELS,
} from './meal-store'

// Store 使用示例:
// 
// // 用户状态
// const { user, setUser, updatePoints, isLoggedIn } = useUserStore()
// 
// // Tab导航
// const { activeTab, setActiveTab } = useTabStore()
// 
// // 饮食计划
// const { todayPlans, setTodayPlans, toggleComplete } = useMealPlanStore()
// 
// // 打卡状态
// const { todayCheckIns, monthlyStats, toggleCheckIn } = useCheckInStore()
