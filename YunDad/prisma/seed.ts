/**
 * 数据种子脚本 — 灌入食谱/知识/每日贴士/待产包默认数据
 * 用法: npx tsx prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const recipes = [
  { name: '红枣枸杞粥', description: '滋补养颜，补血益气的经典粥品，特别适合孕期女性食用，有助于补充铁质和维生素。', mealType: 'breakfast', ingredients: JSON.stringify(['红枣 10颗', '枸杞 15g', '大米 100g', '冰糖 适量', '清水 800ml']), steps: JSON.stringify(['将大米淘洗干净，用清水浸泡30分钟', '红枣洗净去核，枸杞用温水泡软', '将大米放入锅中，加入清水，大火煮开', '转小火慢煮20分钟，期间搅拌几次', '加入红枣和枸杞，继续煮10分钟', '最后加入冰糖调味，即可出锅']), nutrition: JSON.stringify({ calories: 180, protein: 4.5, carbs: 38, fat: 0.5, fiber: 2.1 }), suitableWeeks: '1-40', tags: JSON.stringify(['补血', '养颜', '早餐']), rating: 4.8, isRecommended: true },
  { name: '清蒸鲈鱼', description: '鲜嫩可口的清蒸鲈鱼，富含优质蛋白质和DHA，有助于胎儿大脑发育。', mealType: 'lunch', ingredients: JSON.stringify(['鲈鱼 1条', '生姜 适量', '小葱 2根', '蒸鱼豉油 2勺', '料酒 1勺', '植物油 适量']), steps: JSON.stringify(['鲈鱼处理干净，两面划刀', '用料酒、姜片腌制10分钟去腥', '盘底铺姜片葱段，放上鲈鱼', '水开后上锅蒸8-10分钟', '淋上蒸鱼豉油，撒葱花', '热油浇在葱丝上激发香味']), nutrition: JSON.stringify({ calories: 210, protein: 28, carbs: 2, fat: 9, fiber: 0 }), suitableWeeks: '13-40', tags: JSON.stringify(['高蛋白', 'DHA', '午餐']), rating: 4.9, isRecommended: true },
  { name: '番茄炒蛋', description: '家常经典菜，番茄红素与卵磷脂搭配，营养易吸收，开胃下饭。', mealType: 'dinner', ingredients: JSON.stringify(['番茄 2个', '鸡蛋 3个', '小葱 1根', '盐 适量', '糖 少许', '植物油 适量']), steps: JSON.stringify(['番茄切块，鸡蛋打散加少许盐', '热锅下油，倒入蛋液炒至凝固盛出', '锅中留底油，下番茄翻炒出汁', '加入糖和盐调味', '倒回鸡蛋翻炒均匀', '撒上葱花出锅']), nutrition: JSON.stringify({ calories: 190, protein: 12, carbs: 12, fat: 10, fiber: 1.5 }), suitableWeeks: '1-40', tags: JSON.stringify(['家常', '开胃', '晚餐']), rating: 4.7, isRecommended: true },
  { name: '核桃芝麻糊', description: '补脑佳品，富含α-亚麻酸和钙质，适合孕中晚期加餐。', mealType: 'snack_afternoon', ingredients: JSON.stringify(['核桃仁 50g', '黑芝麻 30g', '糯米 50g', '冰糖 适量', '清水 600ml']), steps: JSON.stringify(['核桃仁烤香，黑芝麻炒香', '糯米浸泡1小时', '所有材料放入破壁机', '加水打磨至细腻', '倒入锅中小火煮至浓稠', '加冰糖调味']), nutrition: JSON.stringify({ calories: 320, protein: 9, carbs: 30, fat: 18, fiber: 4 }), suitableWeeks: '13-40', tags: JSON.stringify(['补脑', '加餐', '钙质']), rating: 4.6, isRecommended: false },
  { name: '牛奶燕麦杯', description: '快手早餐，膳食纤维+钙质双补，缓解孕期便秘。', mealType: 'breakfast', ingredients: JSON.stringify(['即食燕麦 40g', '牛奶 250ml', '香蕉 1根', '蓝莓 适量', '坚果碎 适量']), steps: JSON.stringify(['燕麦用温牛奶浸泡5分钟', '香蕉切片铺底', '倒入燕麦牛奶', '摆上蓝莓和坚果碎', '微波炉加热1分钟即可']), nutrition: JSON.stringify({ calories: 280, protein: 11, carbs: 42, fat: 8, fiber: 6 }), suitableWeeks: '1-40', tags: JSON.stringify(['纤维', '补钙', '快手']), rating: 4.5, isRecommended: true },
  { name: '鲫鱼豆腐汤', description: '健脾利水，优质蛋白易吸收，孕晚期水肿妈妈的好选择。', mealType: 'dinner', ingredients: JSON.stringify(['鲫鱼 1条', '嫩豆腐 200g', '姜片 3片', '小葱 2根', '盐 适量']), steps: JSON.stringify(['鲫鱼煎至两面金黄', '加入开水大火煮10分钟', '汤色奶白后放入豆腐块', '转小火炖15分钟', '加盐调味撒葱花']), nutrition: JSON.stringify({ calories: 240, protein: 30, carbs: 4, fat: 11, fiber: 0.5 }), suitableWeeks: '28-40', tags: JSON.stringify(['利水', '高蛋白', '汤品']), rating: 4.8, isRecommended: true },
  { name: '杂粮饭团', description: '粗细搭配，B族维生素丰富，稳血糖，适合作为上午加餐。', mealType: 'snack_morning', ingredients: JSON.stringify(['杂粮米 100g', '海苔 2片', '肉松 适量', '黄瓜 半根']), steps: JSON.stringify(['杂粮米煮熟放凉', '黄瓜切条', '米饭压平包入黄瓜和肉松', '捏成饭团', '海苔片包裹固定']), nutrition: JSON.stringify({ calories: 260, protein: 8, carbs: 48, fat: 4, fiber: 3.5 }), suitableWeeks: '1-40', tags: JSON.stringify(['杂粮', '稳糖', '便携']), rating: 4.4, isRecommended: false },
  { name: '银耳莲子羹', description: '滋阴润燥，安神助眠，睡前一小碗，孕晚期睡不好试试它。', mealType: 'snack_evening', ingredients: JSON.stringify(['银耳 半朵', '莲子 20g', '红枣 5颗', '枸杞 10g', '冰糖 适量']), steps: JSON.stringify(['银耳泡发撕小朵', '莲子去芯，红枣去核', '所有材料加水炖40分钟', '至银耳出胶浓稠', '加冰糖枸杞稍煮']), nutrition: JSON.stringify({ calories: 150, protein: 3, carbs: 32, fat: 0.5, fiber: 2 }), suitableWeeks: '13-40', tags: JSON.stringify(['安神', '润燥', '晚间']), rating: 4.6, isRecommended: false },
]

const babybagCategories = [
  { name: '证件资料', icon: '📋', sortOrder: 1 },
  { name: '妈妈用品', icon: '👩', sortOrder: 2 },
  { name: '宝宝用品', icon: '👶', sortOrder: 3 },
  { name: '喂养用品', icon: '🍼', sortOrder: 4 },
  { name: '洗护用品', icon: '🧴', sortOrder: 5 },
  { name: '入院陪护', icon: '🏥', sortOrder: 6 },
]

const babybagItems = [
  // 证件资料
  { cat: '证件资料', name: '身份证（夫妻双方）', isDefault: true, sortOrder: 1 },
  { cat: '证件资料', name: '医保卡/社保卡', isDefault: true, sortOrder: 2 },
  { cat: '证件资料', name: '产检病历/建档手册', isDefault: true, sortOrder: 3 },
  { cat: '证件资料', name: '准生证/生育服务证', isDefault: true, sortOrder: 4 },
  // 妈妈用品
  { cat: '妈妈用品', name: '产妇卫生巾（计量型）', isDefault: true, sortOrder: 1 },
  { cat: '妈妈用品', name: '哺乳内衣 2-3件', isDefault: true, sortOrder: 2 },
  { cat: '妈妈用品', name: '一次性内裤', isDefault: true, sortOrder: 3 },
  { cat: '妈妈用品', name: '月子服/开襟睡衣', isDefault: true, sortOrder: 4 },
  { cat: '妈妈用品', name: '防溢乳垫', isDefault: true, sortOrder: 5 },
  { cat: '妈妈用品', name: '收腹带', isDefault: false, sortOrder: 6 },
  // 宝宝用品
  { cat: '宝宝用品', name: '新生儿衣服 3-4套', isDefault: true, sortOrder: 1 },
  { cat: '宝宝用品', name: '包被/抱毯 2条', isDefault: true, sortOrder: 2 },
  { cat: '宝宝用品', name: 'NB码纸尿裤 1包', isDefault: true, sortOrder: 3 },
  { cat: '宝宝用品', name: '婴儿帽/袜子', isDefault: true, sortOrder: 4 },
  { cat: '宝宝用品', name: '纱布巾 4-6条', isDefault: true, sortOrder: 5 },
  // 喂养用品
  { cat: '喂养用品', name: '奶瓶 1-2个', isDefault: true, sortOrder: 1 },
  { cat: '喂养用品', name: '奶粉（小罐备用）', isDefault: true, sortOrder: 2 },
  { cat: '喂养用品', name: '奶瓶刷/奶瓶夹', isDefault: true, sortOrder: 3 },
  // 洗护用品
  { cat: '洗护用品', name: '婴儿沐浴露/洗发水', isDefault: true, sortOrder: 1 },
  { cat: '洗护用品', name: '护臀霜', isDefault: true, sortOrder: 2 },
  { cat: '洗护用品', name: '湿巾（手口专用）', isDefault: true, sortOrder: 3 },
  { cat: '洗护用品', name: '棉柔巾', isDefault: true, sortOrder: 4 },
  // 入院陪护
  { cat: '入院陪护', name: '陪护折叠床/毯子', isDefault: true, sortOrder: 1 },
  { cat: '入院陪护', name: '保温杯/吸管杯', isDefault: true, sortOrder: 2 },
  { cat: '入院陪护', name: '充电宝/数据线', isDefault: true, sortOrder: 3 },
  { cat: '入院陪护', name: '零食/红牛（体力补充）', isDefault: false, sortOrder: 4 },
]

const knowledges = [
  { title: '孕早期：叶酸怎么补才对？', content: '孕早期（1-12周）是胎儿神经管发育关键期。每天补充0.4mg叶酸可降低70%神经管畸形风险。食补方面多吃深绿色蔬菜（菠菜、芦笋）、豆类、动物肝脏。注意：叶酸补剂建议从备孕期开始吃，持续到孕3个月末。孕妈如有流产史或家族史，需遵医嘱加大剂量。', category: 'knowledge', suitableWeeks: '1-12', tags: JSON.stringify(['叶酸', '孕早期']) },
  { title: '孕期感冒能不能吃药？', content: '孕期用药安全分级（FDA分类）中A/B级药物相对安全。普通感冒多休息多喝水，通常5-7天自愈；若发烧超过38.5℃、持续3天以上，或伴咳黄痰、呼吸急促，必须就医。对乙酰氨基酚（扑热息痛）是孕期相对安全的退烧药，但阿司匹林、布洛芬等禁用。切记：任何药物使用前咨询产科医生。', category: 'faq', suitableWeeks: '1-40', tags: JSON.stringify(['感冒', '用药安全']) },
  { title: '孕中期营养重点：铁和钙', content: '孕中期（13-27周）胎儿骨骼快速发育，每日需钙1000mg——相当于500ml牛奶+豆制品+绿叶菜。铁需求增加至25mg/天，缺铁易贫血、产后恢复慢。补铁推荐：每周2次动物肝脏（每次50g）、红肉每天1掌心；与维C同食（餐后一个橙子）可提升吸收率3倍。钙铁同补会互相干扰，建议错开：早餐补铁、睡前补钙。', category: 'nutrition', suitableWeeks: '13-27', tags: JSON.stringify(['补铁', '补钙']) },
  { title: '数胎动的正确方法', content: '孕28周起每天固定时间数胎动。方法一：每天早中晚各数1小时，3次相加×4≈12小时胎动数，≥30次为正常。方法二：晚饭后数1小时，≥3次为正常。警惕信号：12小时胎动<10次、胎动突然减少50%以上、剧烈躁动后突然静止——立即就医，不要等第二天产检。', category: 'knowledge', suitableWeeks: '28-40', tags: JSON.stringify(['胎动', '孕晚期']) },
  { title: '孕晚期见红了怎么办？', content: '见红是宫颈黏液栓脱落，粉红色或褐色分泌物，通常预示24-48小时内临产，不必慌张。但需区分：若出血量大（超过月经量）、鲜红色，可能是胎盘早剥或前置胎盘，立即平躺、呼叫120。见红后如无规律宫缩，可先洗澡吃好休息，等规律宫缩（5-6分钟一次）再入院。', category: 'knowledge', suitableWeeks: '28-40', tags: JSON.stringify(['临产', '见红']) },
  { title: '待产包什么时候开始准备？', content: '建议孕28-32周开始准备，32周前完成——因为约3%的宝宝会早产。证件类最先备齐（身份证、医保卡、产检手册），缺一样入院时都要折腾。药品营养品类遵医嘱，避免囤货浪费。衣物类全部清洗晾晒后再收纳。装包原则：按"妈妈用/宝宝用/陪护用"分袋，进产房那袋单独放最外层。', category: 'knowledge', suitableWeeks: '28-36', tags: JSON.stringify(['待产包']) },
]

const dailyTips = [
  { content: '孕期每天饮水1700-1900ml，羊水充足的秘密。', weekRange: '1-40', category: '饮食' },
  { content: '左侧卧能改善子宫供血，宝宝更舒服。', weekRange: '20-40', category: '睡眠' },
  { content: '散步是最适合孕妇的运动，每天30分钟。', weekRange: '13-36', category: '运动' },
  { content: '坚果当加餐，补脑又稳血糖，每天一小把。', weekRange: '13-40', category: '饮食' },
  { content: '数胎动从28周开始，每天固定时间更准。', weekRange: '28-40', category: '监测' },
  { content: '腿抽筋？睡前补钙+拉伸小腿试试。', weekRange: '20-40', category: '健康' },
  { content: '孕期体重每周称一次，固定时间晨起空腹。', weekRange: '13-40', category: '监测' },
  { content: '刷牙用软毛刷，孕期牙龈更敏感。', weekRange: '1-40', category: '健康' },
  { content: '呼吸练习从32周开始，顺产时你会感谢自己。', weekRange: '32-40', category: '准备' },
  { content: '防妊娠纹从20周开始按摩，橄榄油即可。', weekRange: '20-40', category: '护理' },
]

async function main() {
  console.log('开始灌入种子数据...')

  const recipeCount = await db.recipe.count()
  if (recipeCount === 0) {
    await db.recipe.createMany({ data: recipes as any })
    console.log(`食谱: +${recipes.length}`)
  } else {
    console.log(`食谱已有 ${recipeCount} 条, 跳过`)
  }

  const catCount = await db.babyBagCategory.count()
  if (catCount === 0) {
    for (const c of babybagCategories) {
      await db.babyBagCategory.create({ data: c as any })
    }
    const cats = await db.babyBagCategory.findMany()
    const catMap = new Map(cats.map(c => [c.name, c.id]))
    for (const item of babybagItems) {
      await db.babyBagItem.create({
        data: {
          categoryId: catMap.get(item.cat)!,
          name: item.name,
          isDefault: item.isDefault,
          sortOrder: item.sortOrder,
        },
      })
    }
    console.log(`待产包: +${babybagCategories.length} 分类 +${babybagItems.length} 物品`)
  } else {
    console.log(`待产包已有 ${catCount} 分类, 跳过`)
  }

  const kCount = await db.knowledge.count()
  if (kCount === 0) {
    await db.knowledge.createMany({ data: knowledges as any })
    console.log(`知识文章: +${knowledges.length}`)
  } else {
    console.log(`知识已有 ${kCount} 条, 跳过`)
  }

  const tipCount = await db.dailyTip.count()
  if (tipCount === 0) {
    await db.dailyTip.createMany({ data: dailyTips as any })
    console.log(`每日贴士: +${dailyTips.length}`)
  } else {
    console.log(`贴士已有 ${tipCount} 条, 跳过`)
  }

  console.log('种子数据完成 ✓')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
