'use client'

import * as React from 'react'
import { SearchBar } from './search-bar'
import { CategoryTabs, MealCategory } from './category-tabs'
import { RecipeList } from './recipe-list'
import { RecipeDetail } from './recipe-detail'
import { FavoriteSection } from './favorite-section'
import { Recipe } from './recipe-card'
import { cn } from '@/lib/utils'
import { useMealPlanStore, type MealType } from '@/store/meal-store'

// 示例食谱数据
const sampleRecipes: Recipe[] = [
  {
    id: '1',
    name: '红枣枸杞粥',
    description: '滋补养颜，补血益气的经典粥品，特别适合孕期女性食用，有助于补充铁质和维生素。',
    image: '/images/recipe-1.jpg',
    rating: 4.8,
    reviewCount: 256,
    cookTime: 30,
    weekRange: '1-40周',
    category: 'breakfast',
    ingredients: ['红枣 10颗', '枸杞 15g', '大米 100g', '冰糖 适量', '清水 800ml'],
    steps: [
      '将大米淘洗干净，用清水浸泡30分钟',
      '红枣洗净去核，枸杞用温水泡软',
      '将大米放入锅中，加入清水，大火煮开',
      '转小火慢煮20分钟，期间搅拌几次',
      '加入红枣和枸杞，继续煮10分钟',
      '最后加入冰糖调味，即可出锅',
    ],
    nutrition: {
      calories: 180,
      protein: 4.5,
      carbs: 38,
      fat: 0.5,
      fiber: 2.1,
    },
    isFavorite: false,
  },
  {
    id: '2',
    name: '清蒸鲈鱼',
    description: '鲜嫩可口的清蒸鲈鱼，富含优质蛋白质和DHA，有助于胎儿大脑发育。',
    image: '/images/recipe-2.jpg',
    rating: 4.9,
    reviewCount: 189,
    cookTime: 25,
    weekRange: '1-40周',
    category: 'lunch',
    ingredients: ['鲈鱼 1条', '生姜 适量', '小葱 2根', '蒸鱼豉油 2勺', '料酒 1勺', '植物油 适量'],
    steps: [
      '鲈鱼处理干净，在鱼身两面划几刀',
      '鱼身抹上少许料酒，腌制10分钟去腥',
      '生姜切丝，小葱切段备用',
      '将鱼放入蒸锅，大火蒸10-12分钟',
      '出锅后撒上葱姜丝，淋上热油',
      '最后浇上蒸鱼豉油即可',
    ],
    nutrition: {
      calories: 120,
      protein: 22,
      carbs: 2,
      fat: 3,
      fiber: 0.3,
    },
    isFavorite: false,
  },
  {
    id: '3',
    name: '番茄牛腩煲',
    description: '酸甜开胃的番茄牛腩，富含铁质和蛋白质，适合孕期补充营养。',
    image: '/images/recipe-3.jpg',
    rating: 4.7,
    reviewCount: 312,
    cookTime: 60,
    weekRange: '13-40周',
    category: 'dinner',
    ingredients: ['牛腩 500g', '番茄 3个', '土豆 1个', '洋葱 半个', '番茄酱 2勺', '盐 适量', '八角 2个'],
    steps: [
      '牛腩切块，冷水下锅焯水去血沫',
      '番茄切块，土豆切块，洋葱切丝',
      '锅中放油，爆香洋葱和番茄',
      '加入牛腩翻炒，加入番茄酱和八角',
      '加入适量清水，大火烧开后转小火炖40分钟',
      '加入土豆块，继续炖15分钟，调味出锅',
    ],
    nutrition: {
      calories: 280,
      protein: 18,
      carbs: 22,
      fat: 14,
      fiber: 3.5,
    },
    isFavorite: false,
  },
  {
    id: '4',
    name: '核桃燕麦酸奶杯',
    description: '营养丰富的加餐小食，富含钙质和优质脂肪，简单快手。',
    image: '/images/recipe-4.jpg',
    rating: 4.6,
    reviewCount: 145,
    cookTime: 5,
    weekRange: '1-40周',
    category: 'morning_snack',
    ingredients: ['希腊酸奶 200g', '即食燕麦 30g', '核桃仁 20g', '蜂蜜 1勺', '蓝莓 适量'],
    steps: [
      '准备一个透明玻璃杯',
      '底部铺一层燕麦',
      '倒入一层酸奶',
      '撒上核桃碎',
      '再铺一层酸奶',
      '顶部装饰蓝莓，淋上蜂蜜即可',
    ],
    nutrition: {
      calories: 220,
      protein: 12,
      carbs: 25,
      fat: 8,
      fiber: 3.2,
    },
    isFavorite: false,
  },
  {
    id: '5',
    name: '银耳莲子汤',
    description: '清润滋补的养生汤品，有助于缓解孕期干燥，美容养颜。',
    image: '/images/recipe-5.jpg',
    rating: 4.8,
    reviewCount: 198,
    cookTime: 45,
    weekRange: '1-40周',
    category: 'afternoon_snack',
    ingredients: ['银耳 20g', '莲子 30g', '红枣 8颗', '枸杞 10g', '冰糖 适量', '清水 1000ml'],
    steps: [
      '银耳提前用温水泡发，撕成小朵',
      '莲子去芯，红枣洗净',
      '将银耳、莲子、红枣放入锅中',
      '加入清水，大火煮开',
      '转小火慢炖30分钟至银耳出胶',
      '加入枸杞和冰糖，再煮5分钟即可',
    ],
    nutrition: {
      calories: 150,
      protein: 3.5,
      carbs: 32,
      fat: 0.5,
      fiber: 4.8,
    },
    isFavorite: false,
  },
  {
    id: '6',
    name: '牛奶炖蛋',
    description: '嫩滑香甜的炖蛋，富含优质蛋白质和钙质，是完美的晚间加餐。',
    image: '/images/recipe-6.jpg',
    rating: 4.7,
    reviewCount: 167,
    cookTime: 20,
    weekRange: '1-40周',
    category: 'evening_snack',
    ingredients: ['鸡蛋 2个', '纯牛奶 200ml', '白糖 15g', '香草精 几滴'],
    steps: [
      '鸡蛋打散，加入白糖搅拌均匀',
      '慢慢加入牛奶，边加边搅拌',
      '加入几滴香草精，过滤蛋液',
      '倒入蒸碗中，盖上保鲜膜',
      '蒸锅水开后，放入蒸碗',
      '中火蒸12-15分钟即可',
    ],
    nutrition: {
      calories: 180,
      protein: 10,
      carbs: 18,
      fat: 8,
      fiber: 0,
    },
    isFavorite: false,
  },
  {
    id: '7',
    name: '菠菜猪肝粥',
    description: '补铁补血的营养粥，特别适合孕期预防贫血。',
    image: '/images/recipe-7.jpg',
    rating: 4.5,
    reviewCount: 134,
    cookTime: 35,
    weekRange: '1-40周',
    category: 'breakfast',
    ingredients: ['大米 80g', '猪肝 100g', '菠菜 100g', '生姜 适量', '盐 适量', '料酒 1勺'],
    steps: [
      '大米淘洗干净，浸泡30分钟',
      '猪肝切薄片，用料酒和姜丝腌制去腥',
      '菠菜洗净焯水，切段备用',
      '大米加水煮开，转小火煮25分钟',
      '加入猪肝片，快速搅散',
      '最后加入菠菜，调味即可出锅',
    ],
    nutrition: {
      calories: 200,
      protein: 15,
      carbs: 28,
      fat: 4,
      fiber: 2.5,
    },
    isFavorite: false,
  },
  {
    id: '8',
    name: '豆腐鲫鱼汤',
    description: '鲜美滋补的汤品，富含蛋白质和钙质，有助于胎儿骨骼发育。',
    image: '/images/recipe-8.jpg',
    rating: 4.9,
    reviewCount: 223,
    cookTime: 40,
    weekRange: '1-40周',
    category: 'lunch',
    ingredients: ['鲫鱼 1条', '豆腐 200g', '生姜 适量', '小葱 适量', '盐 适量', '植物油 适量'],
    steps: [
      '鲫鱼处理干净，两面划刀',
      '豆腐切块，生姜切片',
      '锅中放油，将鲫鱼两面煎至金黄',
      '加入开水和姜片，大火煮开',
      '放入豆腐块，转中火煮20分钟',
      '汤汁奶白后调味，撒上葱花即可',
    ],
    nutrition: {
      calories: 180,
      protein: 25,
      carbs: 5,
      fat: 8,
      fiber: 1.2,
    },
    isFavorite: false,
  },
]

export function RecipeTab() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<MealCategory>('all')
  const [recipes, setRecipes] = React.useState<Recipe[]>(sampleRecipes)
  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  // 获取收藏的食谱
  const favorites = recipes.filter((recipe) => recipe.isFavorite)

  // 过滤食谱
  const filteredRecipes = React.useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCategory = activeCategory === 'all' || recipe.category === activeCategory
      const matchesSearch =
        searchQuery === '' ||
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [recipes, activeCategory, searchQuery])

  // 切换收藏状态
  const handleFavoriteToggle = (id: string) => {
    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
      )
    )
    // 同时更新选中的食谱
    if (selectedRecipe?.id === id) {
      setSelectedRecipe((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null)
    }
  }

  // 点击食谱卡片
  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setIsDetailOpen(true)
  }

  // 添加到饮食计划
  const handleAddToMealPlan = (recipe: Recipe) => {
    const { addPlan } = useMealPlanStore.getState()
    addPlan({
      id: Date.now().toString(),
      mealType: recipe.category as MealType || 'lunch',
      recipe: {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        image: recipe.image,
        calories: recipe.nutrition?.calories || 0,
        protein: recipe.nutrition?.protein || 0,
        carbs: recipe.nutrition?.carbs || 0,
        fat: recipe.nutrition?.fat || 0,
        tags: recipe.tags || [],
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
      },
      isCompleted: false,
    })
    setIsDetailOpen(false)
  }

  return (
    <div className="flex flex-col h-full bg-orange-50/30">
      {/* 顶部搜索栏 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          className="max-w-md mx-auto"
        />
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* 分类标签 */}
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          className="mb-4"
        />

        {/* 收藏区域 */}
        <FavoriteSection
          favorites={favorites}
          onRecipeClick={handleRecipeClick}
          onFavoriteToggle={handleFavoriteToggle}
        />

        {/* 食谱列表标题 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">
            {activeCategory === 'all' ? '全部食谱' : getCategoryName(activeCategory)}
          </h2>
          <span className="text-sm text-gray-500">
            共 {filteredRecipes.length} 道食谱
          </span>
        </div>

        {/* 食谱列表 */}
        <RecipeList
          recipes={filteredRecipes}
          onFavoriteToggle={handleFavoriteToggle}
          onRecipeClick={handleRecipeClick}
        />
      </div>

      {/* 食谱详情弹窗 */}
      <RecipeDetail
        recipe={selectedRecipe}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onFavoriteToggle={handleFavoriteToggle}
        onAddToMealPlan={handleAddToMealPlan}
      />
    </div>
  )
}

// 获取分类名称
function getCategoryName(category: MealCategory): string {
  const names: Record<MealCategory, string> = {
    all: '全部食谱',
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    morning_snack: '上午加餐',
    afternoon_snack: '下午加餐',
    evening_snack: '晚间加餐',
  }
  return names[category]
}
