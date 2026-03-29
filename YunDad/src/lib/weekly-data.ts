// 宝宝每周发育数据
export const weeklyProgress = [
  { week: 4, size: "罂粟籽", length: 0.2, weight: 0.1, description: "心脏开始跳动" },
  { week: 5, size: "芝麻", length: 0.4, weight: 0.1, description: "神经系统快速发展" },
  { week: 6, size: "小扁豆", length: 0.6, weight: 0.2, description: "面部特征形成" },
  { week: 7, size: "蓝莓", length: 1, weight: 0.4, description: "手臂和腿部开始生长" },
  { week: 8, size: "覆盆子", length: 1.6, weight: 1, description: "所有器官已形成" },
  { week: 9, size: "葡萄", length: 2.3, weight: 2, description: "从胚胎变为胎儿" },
  { week: 10, size: "金桔", length: 3.1, weight: 4, description: "指甲开始生长" },
  { week: 11, size: "无花果", length: 4, weight: 7, description: "可以做吸吮动作" },
  { week: 12, size: "李子", length: 5.4, weight: 14, description: "会握拳和踢腿" },
  { week: 13, size: "豌豆荚", length: 7.4, weight: 23, description: "指纹形成" },
  { week: 14, size: "柠檬", length: 8.7, weight: 43, description: "性别可识别" },
  { week: 15, size: "苹果", length: 10.1, weight: 70, description: "能听到声音" },
  { week: 16, size: "牛油果", length: 11.6, weight: 100, description: "面部表情丰富" },
  { week: 17, size: "萝卜", length: 13, weight: 140, description: "骨骼变硬" },
  { week: 18, size: "甜椒", length: 14.2, weight: 190, description: "有惊跳反射" },
  { week: 19, size: "芒果", length: 15.3, weight: 240, description: "皮肤形成" },
  { week: 20, size: "香蕉", length: 16.4, weight: 300, description: "可以吞咽" },
  { week: 21, size: "胡萝卜", length: 26.7, weight: 360, description: "有味觉" },
  { week: 22, size: "木瓜", length: 27.8, weight: 430, description: "皮肤有皱纹" },
  { week: 23, size: "火龙果", length: 28.9, weight: 500, description: "能分辨声音" },
  { week: 24, size: "椰子", length: 30, weight: 600, description: "肺部开始发育" },
  { week: 25, size: "花椰菜", length: 34.6, weight: 680, description: "鼻孔打开" },
  { week: 26, size: "生菜", length: 35.6, weight: 760, description: "眼睛开始睁开" },
  { week: 27, size: "花菜", length: 36.6, weight: 875, description: "有呼吸动作" },
  { week: 28, size: "茄子", length: 37.6, weight: 1000, description: "可以做梦" },
  { week: 29, size: "西兰花", length: 38.6, weight: 1150, description: "头部变大" },
  { week: 30, size: "南瓜", length: 39.9, weight: 1300, description: "肌肉发育" },
  { week: 31, size: "椰子", length: 41.1, weight: 1500, description: "肺部成熟" },
  { week: 32, size: "卷心菜", length: 42.4, weight: 1700, description: "皮肤变光滑" },
  { week: 33, size: "菠萝", length: 43.7, weight: 1900, description: "骨头变硬" },
  { week: 34, size: "哈密瓜", length: 45, weight: 2100, description: "中枢神经成熟" },
  { week: 35, size: "甜瓜", length: 46.2, weight: 2400, description: "肾脏成熟" },
  { week: 36, size: "生菜", length: 47.4, weight: 2600, description: "胎位固定" },
  { week: 37, size: "西瓜", length: 48.6, weight: 2900, description: "足月" },
  { week: 38, size: "西瓜", length: 49.8, weight: 3100, description: "各器官成熟" },
  { week: 39, size: "西瓜", length: 50.7, weight: 3300, description: "准备出生" },
  { week: 40, size: "西瓜", length: 51, weight: 3500, description: "足月成熟" },
]

export const foodNutrition: Record<string, {calories:number;protein:number;carbs:number;fiber:number;goodFor:string[]}> = {
  "苹果": { calories: 52, protein: 0.3, carbs: 14, fiber: 2.4, goodFor: ["维生素C", "膳食纤维"] },
  "香蕉": { calories: 89, protein: 1.1, carbs: 23, fiber: 2.6, goodFor: ["钾", "维生素B6"] },
  "橙子": { calories: 47, protein: 0.9, carbs: 12, fiber: 2.4, goodFor: ["维生素C", "叶酸"] },
  "蓝莓": { calories: 57, protein: 0.7, carbs: 14, fiber: 2.4, goodFor: ["抗氧化", "维生素K"] },
  "牛油果": { calories: 160, protein: 2, carbs: 9, fiber: 7, goodFor: ["不饱和脂肪酸", "叶酸"] },
  "三文鱼": { calories: 208, protein: 20, carbs: 0, fiber: 0, goodFor: ["DHA", "蛋白质"] },
  "鸡蛋": { calories: 155, protein: 13, carbs: 1.1, fiber: 0, goodFor: ["优质蛋白", "胆碱"] },
}

export const tabooFoods = [
  { name: "生鱼片", reason: "可能有寄生虫", severity: "high" },
  { name: "半熟牛排", reason: "可能有细菌", severity: "high" },
  { name: "酒", reason: "导致胎儿畸形", severity: "critical" },
  { name: "高汞鱼类", reason: "影响胎儿神经", severity: "high" },
]

export const hospitalBagList = {
  "证件": [
    { name: "身份证", required: true },
    { name: "医保卡", required: true },
    { name: "产检手册", required: true },
  ],
  "妈妈用品": [
    { name: "产褥垫", required: true, quantity: 2 },
    { name: "一次性内裤", required: true, quantity: 10 },
    { name: "卫生巾", required: true, quantity: 2 },
    { name: "哺乳内衣", required: true, quantity: 2 },
    { name: "吸管杯", required: true },
    { name: "拖鞋", required: true },
  ],
  "宝宝用品": [
    { name: "新生儿衣服", required: true, quantity: 2 },
    { name: "包被", required: true, quantity: 2 },
    { name: "纸尿裤", required: true, quantity: 30 },
    { name: "婴儿湿巾", required: true, quantity: 1 },
  ],
  "爸爸用品": [
    { name: "换洗衣服", required: true },
    { name: "充电器", required: true },
  ],
}