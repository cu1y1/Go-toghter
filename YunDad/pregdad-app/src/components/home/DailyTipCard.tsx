import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '../../constants'

export interface DailyTip {
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

const categoryColors: Record<DailyTip['category'], { start: string; end: string; border: string }> = {
  nutrition: { start: '#F0FDF4', end: '#ECFDF5', border: '#BBF7D0' },
  exercise: { start: '#EFF6FF', end: '#F0F9FF', border: '#BFDBFE' },
  health: { start: '#FFF1F2', end: '#FFF1F2', border: '#FECDD3' },
  mood: { start: '#FAF5FF', end: '#F5F3FF', border: '#DDD6FE' },
  preparation: { start: '#FFFBEB', end: '#FEFCE8', border: '#FDE68A' }
}

export function DailyTipCard({ tip, onViewDetail }: DailyTipCardProps) {
  const colors = categoryColors[tip.category]

  return (
    <View style={[styles.card, { backgroundColor: colors.start, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.categoryIcon}>{categoryIcons[tip.category]}</Text>
          <Text style={styles.categoryLabel}>{categoryLabels[tip.category]}</Text>
        </View>
        <View style={styles.weekBadge}>
          <Ionicons name="book-outline" size={12} color="#9CA3AF" />
          <Text style={styles.weekText}>第{tip.week}周</Text>
        </View>
      </View>

      <Text style={styles.title}>{tip.title}</Text>
      <Text style={styles.content} numberOfLines={2}>{tip.content}</Text>

      <TouchableOpacity style={styles.detailButton} onPress={onViewDetail} activeOpacity={0.7}>
        <View style={styles.detailButtonLeft}>
          <Ionicons name="bulb" size={14} color="#F59E0B" />
          <Text style={styles.detailButtonText}>查看详情</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  )
}

export function getTipsByWeek(week: number): DailyTip[] {
  const allTips: DailyTip[] = [
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

  if (week <= 12) {
    return allTips.filter(tip => tip.week <= 12)
  } else if (week <= 27) {
    return allTips.filter(tip => tip.week > 12 && tip.week <= 27)
  } else {
    return allTips.filter(tip => tip.week > 27)
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  weekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  weekText: {
    fontSize: 11,
    color: '#6B7280',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
    marginBottom: 14,
  },
  detailButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  detailButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
})
