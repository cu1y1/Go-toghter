// 增强版待产包数据 - 支持多维度标签
// 标签系统：season(季节)、delivery(分娩方式)、required(必选/推荐/可选)

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type DeliveryMethod = 'natural' | 'cesarean' | 'undecided'
export type ItemPriority = 'essential' | 'recommended' | 'optional'

export interface BagItemData {
  id: string
  name: string
  category: 'documents' | 'mom' | 'baby' | 'dad' | 'other'
  priority: ItemPriority
  tags: {
    seasons?: Season[]           // 适用季节
    delivery?: DeliveryMethod[]  // 适用分娩方式
    hospitalDays?: number[]      // 适用住院天数
  }
  quantity?: number               // 建议数量
  note?: string                   // 说明/使用时机
}

// 根据预产期获取季节
export function getSeasonByDate(date: Date): Season {
  const month = date.getMonth() + 1 // 1-12
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

// 根据当前日期获取季节
export function getCurrentSeason(): Season {
  return getSeasonByDate(new Date())
}

// 待产包完整数据
export const hospitalBagItems: BagItemData[] = [
  // ========== 证件类 (全部必选) ==========
  { id: 'doc-1', name: '身份证', category: 'documents', priority: 'essential', tags: {} },
  { id: 'doc-2', name: '医保卡', category: 'documents', priority: 'essential', tags: {} },
  { id: 'doc-3', name: '产检手册/母子健康手册', category: 'documents', priority: 'essential', tags: {} },
  { id: 'doc-4', name: '准生证/生育登记', category: 'documents', priority: 'essential', tags: {} },
  { id: 'doc-5', name: '银行卡', category: 'documents', priority: 'essential', tags: {} },
  { id: 'doc-6', name: '现金（零钱）', category: 'documents', priority: 'essential', tags: {}, quantity: 500 },
  { id: 'doc-7', name: '结婚证', category: 'documents', priority: 'recommended', tags: {} },
  { id: 'doc-8', name: '产检报告单', category: 'documents', priority: 'recommended', tags: {} },

  // ========== 妈妈用品 - 通用必选 ==========
  { id: 'mom-1', name: '换洗衣物（出院）', category: 'mom', priority: 'essential', tags: { seasons: ['spring', 'summer', 'autumn', 'winter'] }, quantity: 1 },
  { id: 'mom-2', name: '哺乳家居服', category: 'mom', priority: 'essential', tags: { seasons: ['spring', 'summer', 'autumn', 'winter'] }, quantity: 2 },
  { id: 'mom-3', name: '哺乳内衣', category: 'mom', priority: 'essential', tags: {}, quantity: 2 },
  { id: 'mom-4', name: '一次性内裤', category: 'mom', priority: 'essential', tags: {}, quantity: 10 },
  { id: 'mom-5', name: '卫生巾/安心裤', category: 'mom', priority: 'essential', tags: {}, quantity: 2 },
  { id: 'mom-6', name: '产褥垫', category: 'mom', priority: 'essential', tags: {}, quantity: 2 },
  { id: 'mom-7', name: '防溢乳垫', category: 'mom', priority: 'recommended', tags: {}, quantity: 1 },
  { id: 'mom-8', name: '吸奶器', category: 'mom', priority: 'recommended', tags: {} },
  { id: 'mom-9', name: '乳头霜', category: 'mom', priority: 'recommended', tags: {} },
  { id: 'mom-10', name: '洗漱用品（牙刷牙膏毛巾）', category: 'mom', priority: 'essential', tags: {} },
  { id: 'mom-11', name: '护肤品', category: 'mom', priority: 'optional', tags: {} },
  { id: 'mom-12', name: '拖鞋', category: 'mom', priority: 'essential', tags: {} },
  { id: 'mom-13', name: '吸管杯/吸管', category: 'mom', priority: 'essential', tags: {} },
  { id: 'mom-14', name: '餐具（饭盒筷子）', category: 'mom', priority: 'essential', tags: {} },
  { id: 'mom-15', name: '手机充电器', category: 'mom', priority: 'essential', tags: {} },

  // ========== 妈妈用品 - 分娩方式特定 ==========
  // 顺产
  { id: 'mom-nat-1', name: '会阴冷敷垫', category: 'mom', priority: 'recommended', tags: { delivery: ['natural'] }, quantity: 4 },
  { id: 'mom-nat-2', name: '会阴清洗器', category: 'mom', priority: 'recommended', tags: { delivery: ['natural'] } },
  { id: 'mom-nat-3', name: '红糖/巧克力', category: 'mom', priority: 'recommended', tags: { delivery: ['natural'] } },
  // 剖宫产
  { id: 'mom-cs-1', name: '束腹带', category: 'mom', priority: 'essential', tags: { delivery: ['cesarean'] } },
  { id: 'mom-cs-2', name: '伤口防水贴', category: 'mom', priority: 'essential', tags: { delivery: ['cesarean'] }, quantity: 3 },
  { id: 'mom-cs-3', name: '去疤产品', category: 'mom', priority: 'optional', tags: { delivery: ['cesarean'] } },
  { id: 'mom-cs-4', name: '陈皮/萝卜汤（帮助排气）', category: 'mom', priority: 'recommended', tags: { delivery: ['cesarean'] } },

  // ========== 妈妈用品 - 季节特定 ==========
  // 夏季
  { id: 'mom-sum-1', name: '透气哺乳吊带', category: 'mom', priority: 'recommended', tags: { seasons: ['summer'] }, quantity: 2 },
  { id: 'mom-sum-2', name: '凉席/冰垫', category: 'mom', priority: 'optional', tags: { seasons: ['summer'] } },
  { id: 'mom-sum-3', name: '痱子粉/液', category: 'mom', priority: 'optional', tags: { seasons: ['summer'] } },
  { id: 'mom-sum-4', name: '小风扇', category: 'mom', priority: 'optional', tags: { seasons: ['summer'] } },
  // 冬季
  { id: 'mom-win-1', name: '保暖外套', category: 'mom', priority: 'essential', tags: { seasons: ['winter'] } },
  { id: 'mom-win-2', name: '暖宝宝', category: 'mom', priority: 'recommended', tags: { seasons: ['winter'] }, quantity: 5 },
  { id: 'mom-win-3', name: '润唇膏', category: 'mom', priority: 'optional', tags: { seasons: ['winter'] } },
  { id: 'mom-win-4', name: '保湿霜', category: 'mom', priority: 'optional', tags: { seasons: ['winter'] } },
  // 春季
  { id: 'mom-spr-1', name: '口罩', category: 'mom', priority: 'recommended', tags: { seasons: ['spring'] }, quantity: 10 },
  { id: 'mom-spr-2', name: '薄款哺乳披肩', category: 'mom', priority: 'optional', tags: { seasons: ['spring'] } },
  // 秋季
  { id: 'mom-aut-1', name: '针织开衫', category: 'mom', priority: 'recommended', tags: { seasons: ['autumn'] } },

  // ========== 宝宝用品 - 通用必选 ==========
  { id: 'baby-1', name: '新生儿连体衣', category: 'baby', priority: 'essential', tags: { seasons: ['spring', 'summer', 'autumn', 'winter'] }, quantity: 2 },
  { id: 'baby-2', name: '纸尿裤', category: 'baby', priority: 'essential', tags: {}, quantity: 30 },
  { id: 'baby-3', name: '包被/抱毯', category: 'baby', priority: 'essential', tags: { seasons: ['spring', 'summer', 'autumn', 'winter'] } },
  { id: 'baby-4', name: '婴儿湿巾', category: 'baby', priority: 'essential', tags: {}, quantity: 1 },
  { id: 'baby-5', name: '婴儿棉柔巾', category: 'baby', priority: 'recommended', tags: {}, quantity: 1 },
  { id: 'baby-6', name: '婴儿帽子', category: 'baby', priority: 'essential', tags: {} },
  { id: 'baby-7', name: '婴儿袜子', category: 'baby', priority: 'essential', tags: {}, quantity: 2 },
  { id: 'baby-8', name: '奶瓶', category: 'baby', priority: 'recommended', tags: {}, quantity: 2 },
  { id: 'baby-9', name: '小罐奶粉', category: 'baby', priority: 'recommended', tags: {} },
  { id: 'baby-10', name: '奶瓶清洗剂', category: 'baby', priority: 'optional', tags: {} },
  { id: 'baby-11', name: '奶瓶刷', category: 'baby', priority: 'optional', tags: {} },

  // ========== 宝宝用品 - 季节特定 ==========
  // 夏季
  { id: 'baby-sum-1', name: '婴儿蚊帐', category: 'baby', priority: 'recommended', tags: { seasons: ['summer'] } },
  { id: 'baby-sum-2', name: '护臀膏', category: 'baby', priority: 'essential', tags: { seasons: ['summer'] } },
  { id: 'baby-sum-3', name: '婴儿沐浴露', category: 'baby', priority: 'recommended', tags: { seasons: ['summer'] } },
  { id: 'baby-sum-4', name: '短袖连体衣', category: 'baby', priority: 'recommended', tags: { seasons: ['summer'] }, quantity: 2 },
  // 冬季
  { id: 'baby-win-1', name: '加厚连体服', category: 'baby', priority: 'essential', tags: { seasons: ['winter'] }, quantity: 2 },
  { id: 'baby-win-2', name: '婴儿手套', category: 'baby', priority: 'recommended', tags: { seasons: ['winter'] } },
  { id: 'baby-win-3', name: '婴儿围巾', category: 'baby', priority: 'optional', tags: { seasons: ['winter'] } },
  { id: 'baby-win-4', name: '润肤霜', category: 'baby', priority: 'recommended', tags: { seasons: ['winter'] } },
  // 春季
  { id: 'baby-spr-1', name: '薄款连体衣', category: 'baby', priority: 'recommended', tags: { seasons: ['spring'] }, quantity: 2 },
  { id: 'baby-spr-2', name: '纱布巾/口水巾', category: 'baby', priority: 'recommended', tags: { seasons: ['spring'] }, quantity: 3 },
  // 秋季
  { id: 'baby-aut-1', name: '夹棉连体衣', category: 'baby', priority: 'recommended', tags: { seasons: ['autumn'] }, quantity: 2 },

  // ========== 爸爸/陪产用品 ==========
  { id: 'dad-1', name: '换洗衣物', category: 'dad', priority: 'essential', tags: {}, quantity: 1 },
  { id: 'dad-2', name: '拖鞋', category: 'dad', priority: 'essential', tags: {} },
  { id: 'dad-3', name: '薄毯子', category: 'dad', priority: 'recommended', tags: {} },
  { id: 'dad-4', name: '充电宝', category: 'dad', priority: 'essential', tags: {}, quantity: 1 },
  { id: 'dad-5', name: '手机充电器', category: 'dad', priority: 'essential', tags: {} },
  { id: 'dad-6', name: '零钱', category: 'dad', priority: 'recommended', tags: {} },
  { id: 'dad-7', name: '简单洗漱包', category: 'dad', priority: 'recommended', tags: {} },
  { id: 'dad-8', name: '压缩饼干/巧克力', category: 'dad', priority: 'recommended', tags: {} },
  { id: 'dad-9', name: '折叠椅/瑜伽垫', category: 'dad', priority: 'optional', tags: {} },
  { id: 'dad-10', name: '耳塞/眼罩', category: 'dad', priority: 'optional', tags: {} },

  // ========== 其他用品 ==========
  { id: 'other-1', name: '口罩', category: 'other', priority: 'recommended', tags: { seasons: ['spring'] }, quantity: 10 },
  { id: 'other-2', name: '纸巾/湿纸巾', category: 'other', priority: 'essential', tags: {}, quantity: 2 },
  { id: 'other-3', name: '垃圾袋', category: 'other', priority: 'recommended', tags: {} },
  { id: 'other-4', name: '记事本/笔', category: 'other', priority: 'optional', tags: {} },
  { id: 'other-5', name: '眼镜/隐形眼镜', category: 'other', priority: 'optional', tags: {} },
  { id: 'other-6', name: '紧急联系人卡片', category: 'other', priority: 'essential', tags: {} },
]

// 根据用户画像筛选物品
export function filterItemsByProfile(
  items: BagItemData[],
  options: {
    season?: Season
    delivery?: DeliveryMethod
    hospitalDays?: number
  }
): BagItemData[] {
  return items.filter(item => {
    // 季节筛选
    if (options.season && item.tags.seasons?.length) {
      if (!item.tags.seasons.includes(options.season) && !item.tags.seasons.includes('spring' as any)) {
        // 如果没有指定季节标签，或者不是通用品，则需要匹配
        const hasSeasonTag = item.tags.seasons.length > 0
        // 通用季节标签（所有季节都适用）会被包含
      }
    }
    
    // 分娩方式筛选
    if (options.delivery && item.tags.delivery?.length) {
      if (!item.tags.delivery.includes(options.delivery) && !item.tags.delivery.includes('undecided')) {
        return false
      }
    }
    
    // 住院天数筛选（可选功能）
    if (options.hospitalDays && item.tags.hospitalDays?.length) {
      if (!item.tags.hospitalDays.includes(options.hospitalDays)) {
        return false
      }
    }
    
    return true
  })
}

// 获取推荐物品（根据优先级）
export function getRecommendedItems(
  items: BagItemData[],
  priority?: ItemPriority
): BagItemData[] {
  if (priority) {
    return items.filter(item => item.priority === priority)
  }
  return items
}

// 分类配置
export const CATEGORY_LABELS: Record<BagItemData['category'], { label: string; emoji: string }> = {
  documents: { label: '证件类', emoji: '📄' },
  mom: { label: '妈妈用品', emoji: '👩' },
  baby: { label: '宝宝用品', emoji: '👶' },
  dad: { label: '爸爸陪护', emoji: '👨' },
  other: { label: '其他用品', emoji: '🎒' },
}