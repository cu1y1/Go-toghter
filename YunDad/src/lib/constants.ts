// 孕期宝宝大小参考表（支持任意周数插值）
export const BABY_SIZE_DATA = [
  { week: 4, size: '芝麻种子', length: 0.1, weight: 0 },
  { week: 8, size: '覆盆子', length: 1.6, weight: 1 },
  { week: 12, size: '青柠', length: 5.4, weight: 14 },
  { week: 16, size: '牛油果', length: 11.6, weight: 100 },
  { week: 20, size: '香蕉', length: 16.4, weight: 300 },
  { week: 24, size: '玉米棒', length: 21, weight: 540 },
  { week: 28, size: '菜花', length: 25, weight: 1000 },
  { week: 32, size: '西葫芦', length: 28, weight: 1700 },
  { week: 36, size: '罗马生菜', length: 32, weight: 2600 },
  { week: 40, size: '西瓜', length: 35, weight: 3400 },
]

// 用户等级配置
export const LEVEL_CONFIG = [
  { level: 1, name: '孕期小白', minPoints: 0, maxPoints: 50 },
  { level: 2, name: '孕期新手', minPoints: 50, maxPoints: 150 },
  { level: 3, name: '孕期达人', minPoints: 150, maxPoints: 300 },
  { level: 4, name: '孕期专家', minPoints: 300, maxPoints: 500 },
  { level: 5, name: '孕期大师', minPoints: 500, maxPoints: 800 },
  { level: 6, name: '超级准妈', minPoints: 800, maxPoints: Infinity },
]

// 积分规则
export const POINTS_RULES = {
  checkIn: 10,           // 每次打卡
  dailyComplete: 20,     // 每日全部完成
  weeklyStreak: 50,      // 连续7天
  favorite: 2,           // 收藏食谱
  viewKnowledge: 5,      // 查看知识
}

// 餐食类型
export const MEAL_TYPES = {
  breakfast: { name: '早餐', icon: '🌅', time: '07:00-09:00' },
  lunch: { name: '午餐', icon: '☀️', time: '11:30-13:00' },
  dinner: { name: '晚餐', icon: '🌙', time: '18:00-19:30' },
  snack_morning: { name: '上午加餐', icon: '🍎', time: '10:00' },
  snack_afternoon: { name: '下午加餐', icon: '🥛', time: '15:00' },
  snack_evening: { name: '晚间加餐', icon: '🍪', time: '20:00' },
} as const

// 待产包分类
export const BABY_BAG_CATEGORIES = [
  { id: 'documents', name: '证件类', icon: '📄' },
  { id: 'mom', name: '妈妈用品', icon: '👩' },
  { id: 'baby', name: '宝宝用品', icon: '👶' },
  { id: 'others', name: '其他用品', icon: '🎒' },
]

// 待产包默认物品
export const DEFAULT_BABY_BAG_ITEMS: Record<string, string[]> = {
  documents: ['身份证', '医保卡', '产检本', '准生证', '银行卡', '现金'],
  mom: ['换洗衣物', '卫生巾', '洗漱用品', '拖鞋', '哺乳文胸', '吸奶器', '产妇卫生纸', '一次性内裤', '出院服', '保温杯', '吸管', '护肤品'],
  baby: ['新生儿衣物', '尿不湿', '奶瓶', '小罐奶粉', '湿纸巾', '婴儿毯', '婴儿帽', '袜子', '口水巾', '护臀膏'],
  others: ['手机充电器', '充电宝', '耳机', '零食', '书籍/平板', '相机', '家属换洗衣物'],
}

// 孕期阶段划分
export const PREGNANCY_STAGES = {
  early: { name: '孕早期', weeks: [1, 12], description: '胎儿器官发育关键期' },
  middle: { name: '孕中期', weeks: [13, 27], description: '胎儿快速发育期' },
  late: { name: '孕晚期', weeks: [28, 40], description: '胎儿成熟期' },
} as const

// 营养素推荐摄入量（孕期）
export const NUTRITION_RECOMMENDATIONS = {
  folicAcid: { name: '叶酸', daily: 600, unit: 'μg', importance: 'high' },
  iron: { name: '铁', daily: 27, unit: 'mg', importance: 'high' },
  calcium: { name: '钙', daily: 1000, unit: 'mg', importance: 'high' },
  protein: { name: '蛋白质', daily: 71, unit: 'g', importance: 'high' },
  dha: { name: 'DHA', daily: 200, unit: 'mg', importance: 'medium' },
  vitaminD: { name: '维生素D', daily: 15, unit: 'μg', importance: 'medium' },
  iodine: { name: '碘', daily: 220, unit: 'μg', importance: 'medium' },
}

// 每日任务配置
export const DAILY_TASKS = {
  checkIn: { name: '每日打卡', points: 10, icon: '✅' },
  water: { name: '喝水提醒', points: 5, icon: '💧', target: 8 },
  exercise: { name: '适量运动', points: 10, icon: '🏃' },
  mood: { name: '记录心情', points: 5, icon: '😊' },
  knowledge: { name: '学习知识', points: 5, icon: '📚' },
}

// 孕期常见症状
export const PREGNANCY_SYMPTOMS = [
  { week: [4, 12], symptoms: ['恶心呕吐', '疲劳乏力', '乳房胀痛', '尿频'] },
  { week: [13, 27], symptoms: ['腰酸背痛', '便秘', '腿抽筋', '皮肤瘙痒'] },
  { week: [28, 40], symptoms: ['水肿', '呼吸困难', '失眠', '假性宫缩'] },
]

// 产检时间表
export const CHECKUP_SCHEDULE = [
  { week: 6, name: '初次产检', items: ['B超确认宫内孕', '血常规', '尿常规'] },
  { week: 12, name: 'NT检查', items: ['NT测量', '早期唐筛'] },
  { week: 16, name: '中期唐筛', items: ['唐氏筛查', '血常规'] },
  { week: 20, name: '大排畸', items: ['四维B超', '胎儿系统筛查'] },
  { week: 24, name: '糖耐量测试', items: ['OGTT', '血常规'] },
  { week: 28, name: '常规产检', items: ['血压', '体重', '宫高腹围'] },
  { week: 30, name: '常规产检', items: ['胎心监护', '尿常规'] },
  { week: 32, name: '胎位检查', items: ['B超', '胎位确认'] },
  { week: 34, name: '常规产检', items: ['胎心监护', '血常规'] },
  { week: 36, name: '产前评估', items: ['B超', '骨盆测量'] },
  { week: 37, name: '每周产检', items: ['胎心监护', '血压'] },
  { week: 38, name: '每周产检', items: ['胎心监护', '宫颈评估'] },
  { week: 39, name: '每周产检', items: ['胎心监护', '临产评估'] },
  { week: 40, name: '预产期', items: ['胎心监护', '分娩准备'] },
]
