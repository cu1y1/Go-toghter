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
export const MEAL_TYPES: Record<string, { name: string; icon: string; time: string }> = {
  breakfast: { name: '早餐', icon: '🌅', time: '07:00-09:00' },
  lunch: { name: '午餐', icon: '☀️', time: '11:30-13:00' },
  dinner: { name: '晚餐', icon: '🌙', time: '18:00-19:30' },
  snack_morning: { name: '上午加餐', icon: '🍎', time: '10:00' },
  snack_afternoon: { name: '下午加餐', icon: '🥛', time: '15:00' },
  snack_evening: { name: '晚间加餐', icon: '🍪', time: '20:00' },
}

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
  mom: ['换洗衣物', '卫生巾', '洗漱用品', '拖鞋', '哺乳文胸', '吸奶器', '产妇卫生纸', '一次性内裤'],
  baby: ['新生儿衣物', '尿不湿', '奶瓶', '小罐奶粉', '湿纸巾', '婴儿毯', '婴儿帽', '袜子'],
  others: ['手机充电器', '充电宝', '耳机', '零食', '书籍/平板'],
}

// 主题色
export const COLORS = {
  primary: '#F97316',      // 橙色
  primaryLight: '#FDBA74',
  primaryDark: '#EA580C',
  secondary: '#FBBF24',    // 琥珀色
  background: '#FFFBEB',   // 浅橙背景
  white: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
  textMuted: '#9CA3AF',
  success: '#10B981',
  error: '#EF4444',
  card: '#FFFFFF',
  border: '#F3F4F6',
}

// 孕期阶段
export const PREGNANCY_STAGES = [
  { id: 'early', name: '孕早期', weeks: '1-12周', description: '补充叶酸，注意休息' },
  { id: 'middle', name: '孕中期', weeks: '13-27周', description: '营养均衡，适量运动' },
  { id: 'late', name: '孕晚期', weeks: '28-40周', description: '准备待产，注意胎动' },
]

// 每日小贴士
export const DAILY_TIPS = [
  { week: 4, content: '孕早期要开始补充叶酸了，预防胎儿神经管畸形', category: '营养' },
  { week: 8, content: '孕吐是正常现象，少食多餐可以缓解不适', category: '健康' },
  { week: 12, content: '孕早期即将结束，可以开始适度运动了', category: '运动' },
  { week: 16, content: '现在可以感受到胎动了，多和宝宝说话吧', category: '亲子' },
  { week: 20, content: '补充钙质很重要，每天喝杯牛奶', category: '营养' },
  { week: 24, content: '糖筛检查很重要，注意控制糖分摄入', category: '健康' },
  { week: 28, content: '进入孕晚期，开始准备待产包吧', category: '准备' },
  { week: 32, content: '胎位逐渐固定，保持良好心态', category: '健康' },
  { week: 36, content: '随时可能发动，保持联系畅通', category: '准备' },
  { week: 40, content: '预产期到了，放松心情等待宝宝到来', category: '准备' },
]
