'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, ChevronRight, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DailyTip {
  id: string
  title: string
  content: string
  category: 'nutrition' | 'exercise' | 'health' | 'mood' | 'preparation'
  week: number
}

interface DailyTipCardProps {
  tip: DailyTip
  onViewDetail?: () => void
}

const categoryIcons: Record<DailyTip['category'], string> = {
  nutrition: '🥗',
  exercise: '🧘',
  health: '💊',
  mood: '😊',
  preparation: '📝'
}

const categoryLabels: Record<DailyTip['category'], string> = {
  nutrition: '营养建议',
  exercise: '运动指南',
  health: '健康提醒',
  mood: '心理健康',
  preparation: '待产准备'
}

const categoryColors: Record<DailyTip['category'], string> = {
  nutrition: 'from-green-50 to-emerald-50 border-green-100',
  exercise: 'from-blue-50 to-cyan-50 border-blue-100',
  health: 'from-pink-50 to-rose-50 border-pink-100',
  mood: 'from-purple-50 to-violet-50 border-purple-100',
  preparation: 'from-amber-50 to-yellow-50 border-amber-100'
}

export function DailyTipCard({ tip, onViewDetail }: DailyTipCardProps) {
  return (
    <Card className={cn(
      "bg-gradient-to-br border shadow-md overflow-hidden",
      categoryColors[tip.category]
    )}>
      <CardContent className="p-4">
        {/* 头部标签 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{categoryIcons[tip.category]}</span>
            <span className="text-sm font-medium text-gray-600">
              {categoryLabels[tip.category]}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 bg-white/60 rounded-full">
            <BookOpen className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">第{tip.week}周</span>
          </div>
        </div>
        
        {/* 标题 */}
        <h3 className="text-base font-bold text-gray-800 mb-2">
          {tip.title}
        </h3>
        
        {/* 内容 */}
        <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
          {tip.content}
        </p>
        
        {/* 查看详情按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewDetail}
          className="w-full h-8 bg-white/50 hover:bg-white/80 text-gray-700 border border-gray-200/50 justify-between group"
        >
          <span className="flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            查看详情
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  )
}

// 根据孕周获取小贴士
export function getTipsByWeek(week: number): DailyTip[] {
  const allTips: DailyTip[] = [
    // 孕早期 (1-12周)
    {
      id: '1',
      title: '叶酸补充很重要',
      content: '孕早期是胎儿神经管发育的关键时期，建议每天补充400-600微克叶酸，可以有效预防神经管畸形。多吃深绿色蔬菜、豆类和坚果。',
      category: 'nutrition',
      week: 8
    },
    {
      id: '2',
      title: '缓解早孕反应',
      content: '晨起时先吃几块苏打饼干，少量多餐，避免空腹。可以尝试含姜片或柠檬水缓解恶心感。保持室内通风，避免油腻气味。',
      category: 'health',
      week: 8
    },
    // 孕中期 (13-27周)
    {
      id: '3',
      title: '补铁关键期',
      content: '孕中期开始，铁需求量增加。多吃瘦肉、动物肝脏、菠菜等富含铁的食物。搭配富含维生素C的水果，促进铁的吸收。',
      category: 'nutrition',
      week: 20
    },
    {
      id: '4',
      title: '孕期运动建议',
      content: '可以选择散步、孕妇瑜伽、游泳等低强度运动。每次运动30分钟左右，避免剧烈运动和过度疲劳。运动前后注意补充水分。',
      category: 'exercise',
      week: 20
    },
    // 孕晚期 (28-40周)
    {
      id: '5',
      title: '关注胎动变化',
      content: '孕晚期要每天数胎动，正常胎动每小时3-5次。如果胎动明显减少或异常频繁，应及时就医检查。建议早中晚各数一小时。',
      category: 'health',
      week: 32
    },
    {
      id: '6',
      title: '待产包准备清单',
      content: '现在可以开始准备待产包了！包括：证件类（身份证、医保卡）、妈妈用品（换洗衣物、卫生巾）、宝宝用品（新生儿衣物、尿不湿）等。',
      category: 'preparation',
      week: 32
    },
    {
      id: '7',
      title: '缓解水肿小技巧',
      content: '孕晚期容易出现下肢水肿。睡觉时可以将脚垫高，避免长时间站立，穿着舒适的鞋子。适当按摩腿部，促进血液循环。',
      category: 'health',
      week: 36
    },
    {
      id: '8',
      title: '产前心理调适',
      content: '临近预产期，可能会感到紧张焦虑。可以多和家人沟通，学习分娩知识，参加孕妇课堂。保持积极乐观的心态，相信自己和宝宝。',
      category: 'mood',
      week: 36
    }
  ]
  
  // 根据当前周数返回最相关的小贴士（返回2-3条）
  if (week <= 12) {
    return allTips.filter(tip => tip.week <= 12)
  } else if (week <= 27) {
    return allTips.filter(tip => tip.week > 12 && tip.week <= 27)
  } else {
    return allTips.filter(tip => tip.week > 27)
  }
}
