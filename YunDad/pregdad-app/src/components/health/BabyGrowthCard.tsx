import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useUserStore } from '../../store'
import { weeklyProgress } from '../../../../src/lib/weekly-data'

const calculateCurrentWeek = (dueDate: Date | string): number => {
  if (!dueDate) return 20
  const due = dueDate instanceof Date ? dueDate : new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7))
  return Math.max(1, Math.min(40, 40 - diffWeeks))
}

const getSizeEmoji = (size: string) => {
  const sizeMap: Record<string, string> = {
    "小嫩芽": "🌱", "芝麻": "⚫", "小扁豆": "🫘", "蓝莓": "🫐", "覆盆子": "🍇",
    "葡萄": "🍇", "金桔": "🍊", "无花果": "🍈", "李子": "🫐", "豌豆荚": "🫛",
    "柠檬": "🍋", "苹果": "🍎", "牛油果": "🥑", "萝卜": "🥕", "甜椒": "🫑",
    "芒果": "🥭", "香蕉": "🍌", "胡萝卜": "🥕", "木瓜": "🍈", "火龙果": "🔥",
    "椰子": "🥥", "花椰菜": "🥦", "生菜": "🥬", "花菜": "🥦", "茄子": "🍆",
    "西兰花": "🥦", "南瓜": "🎃", "卷心菜": "🥬", "菠萝": "🍍", "哈密瓜": "🍈",
    "甜瓜": "🍈", "西瓜": "🍉",
  }
  return sizeMap[size] || "👶"
}

export function BabyGrowthCard() {
  const { user } = useUserStore()
  const currentWeek = user?.dueDate ? calculateCurrentWeek(user.dueDate) : (user?.pregnancyWeek ?? 20)

  if (!currentWeek) {
    return (
      <View style={styles.card}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emoji}>👶</Text>
          <Text style={styles.emptyText}>请先在个人资料中设置预产期</Text>
        </View>
      </View>
    )
  }

  const currentData = weeklyProgress.find((w: { week: number }) => w.week === currentWeek) || weeklyProgress[19]
  const nextWeek = weeklyProgress.find((w: { week: number }) => w.week === currentWeek + 1)
  const progressPercent = Math.min((currentWeek / 40) * 100, 100)

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>宝宝成长 👶</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>孕{currentWeek}周</Text>
        </View>
      </View>

      {/* 进度条 */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>孕早期</Text>
          <Text style={styles.progressLabel}>孕中期</Text>
          <Text style={styles.progressLabel}>孕晚期</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View 
            style={[styles.progressBar, { width: `${progressPercent}%` }]} 
          />
        </View>
        <Text style={styles.progressText}>已完成 {Math.round(progressPercent)}%</Text>
      </View>

      {/* 当前大小 */}
      <View style={styles.sizeSection}>
        <Text style={styles.sizeEmoji}>{getSizeEmoji(currentData.size)}</Text>
        <Text style={styles.sizeText}>{currentData.size}</Text>
        <Text style={styles.sizeDetail}>
          身长约 {currentData.length} cm · 体重约 {currentData.weight} g
        </Text>
      </View>

      {/* 发育特征 */}
      <View style={styles.developmentSection}>
        <Text style={styles.sectionTitle}>本周发育</Text>
        <View style={styles.descriptionBox}>
          <Text style={styles.description}>{currentData.description}</Text>
        </View>
      </View>

      {/* 下周预告 */}
      {nextWeek && (
        <View style={styles.nextWeekSection}>
          <Text style={styles.nextWeekLabel}>下周预告</Text>
          <View style={styles.nextWeekContent}>
            <Text style={styles.nextWeekEmoji}>{getSizeEmoji(nextWeek.size)}</Text>
            <View>
              <Text style={styles.nextWeekTitle}>孕{nextWeek.week}周: {nextWeek.size}</Text>
              <Text style={styles.nextWeekDesc}>{nextWeek.description}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: '#888',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
  },
  sizeSection: {
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  sizeEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  sizeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 4,
  },
  sizeDetail: {
    fontSize: 14,
    color: '#666',
  },
  developmentSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  descriptionBox: {
    backgroundColor: '#FFF0F5',
    borderRadius: 8,
    padding: 12,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  nextWeekSection: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
  },
  nextWeekLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 6,
  },
  nextWeekContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextWeekEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  nextWeekTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  nextWeekDesc: {
    fontSize: 11,
    color: '#888',
  },
})
