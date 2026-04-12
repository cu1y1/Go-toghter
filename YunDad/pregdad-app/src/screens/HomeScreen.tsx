import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useUserStore } from '../store'
import { COLORS, MEAL_TYPES } from '../constants'
import { Card, Badge, ProgressBar } from '../components/common'
import { getBabySizeByWeek, getLevelByPoints } from '../utils'
import { DailyTipCard, getTipsByWeek } from '../components/home/DailyTipCard'
import { RecommendedRecipes, getRecommendedRecipes } from '../components/home/RecommendedRecipes'

const { width } = Dimensions.get('window')

export const HomeScreen: React.FC = () => {
  const { user } = useUserStore()
  const [todayPoints, setTodayPoints] = useState(0)
  const [mealStatus, setMealStatus] = useState<Record<string, boolean>>({
    breakfast: false,
    snack_morning: false,
    lunch: false,
    snack_afternoon: false,
    dinner: false,
    snack_evening: false,
  })

  // 默认用户数据
  const userInfo = {
    babyName: user?.babyName || '小宝贝',
    currentWeek: user?.pregnancyWeek || 20,
    points: user?.points || 180,
  }

  const babySize = getBabySizeByWeek(userInfo.currentWeek)
  const levelInfo = getLevelByPoints(userInfo.points)
  const tips = getTipsByWeek(userInfo.currentWeek)
  const recipes = getRecommendedRecipes()

  // 打卡处理
  const handleCheckIn = useCallback((mealType: string) => {
    if (!mealStatus[mealType]) {
      setMealStatus(prev => ({ ...prev, [mealType]: true }))
      setTodayPoints(prev => prev + 10)
    }
  }, [mealStatus])

  // 获取当前餐次状态
  const getMealCardStyle = (completed: boolean) => ({
    ...styles.mealCard,
    backgroundColor: completed ? COLORS.success + '10' : COLORS.white,
    borderColor: completed ? COLORS.success : COLORS.border,
  })

  const mealOrder = ['breakfast', 'snack_morning', 'lunch', 'snack_afternoon', 'dinner', 'snack_evening']

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 欢迎语 */}
        <View style={styles.header}>
          <Text style={styles.greeting}>你好，准妈妈 👋</Text>
          <Text style={styles.subGreeting}>
            今天是宝宝陪伴你的第 {userInfo.currentWeek * 7} 天
          </Text>
        </View>

        {/* 宝宝信息卡片 */}
        <LinearGradient
          colors={['#F97316', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.babyCard}
        >
          <View style={styles.babyCardTop}>
            <View style={styles.babyInfoLeft}>
              <Text style={styles.babyName}>{userInfo.babyName}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv.{levelInfo.level} {levelInfo.name}</Text>
              </View>
            </View>
            <View style={styles.babyInfoRight}>
              <Text style={styles.weekText}>孕{userInfo.currentWeek}周</Text>
              <Text style={styles.sizeText}>{babySize.size}大小</Text>
            </View>
          </View>

          <View style={styles.babyStats}>
            <View style={styles.statItem}>
              <Ionicons name="resize" size={16} color="#FFF" />
              <Text style={styles.statValue}>约{babySize.length}cm</Text>
              <Text style={styles.statLabel}>身长</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="fitness" size={16} color="#FFF" />
              <Text style={styles.statValue}>约{babySize.weight}g</Text>
              <Text style={styles.statLabel}>体重</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFF" />
              <Text style={styles.statValue}>{userInfo.points}</Text>
              <Text style={styles.statLabel}>积分</Text>
            </View>
          </View>

          {/* 孕期进度 */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>孕期进度</Text>
              <Text style={styles.progressValue}>{Math.round(userInfo.currentWeek / 40 * 100)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${userInfo.currentWeek / 40 * 100}%` }]} />
            </View>
          </View>

          {/* 等级进度 */}
          <View style={styles.levelProgress}>
            <Text style={styles.levelProgressText}>
              再获得 {levelInfo.pointsToNext} 积分升级到 Lv.{(levelInfo.level + 1)}
            </Text>
            <ProgressBar progress={levelInfo.progress} color="#FFF" height={4} />
          </View>
        </LinearGradient>

        {/* 今日饮食计划 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今日饮食计划</Text>
            <View style={styles.pointsBadge}>
              <Ionicons name="ribbon" size={14} color={COLORS.primary} />
              <Text style={styles.pointsText}>今日 {todayPoints} 积分</Text>
            </View>
          </View>

          <View style={styles.mealGrid}>
            {mealOrder.map((type) => {
              const meal = MEAL_TYPES[type]
              const completed = mealStatus[type]
              return (
                <TouchableOpacity
                  key={type}
                  style={getMealCardStyle(completed)}
                  onPress={() => handleCheckIn(type)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.mealIcon}>{meal.icon}</Text>
                  <Text style={[styles.mealName, completed && styles.mealNameCompleted]}>
                    {meal.name}
                  </Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                  {completed ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={styles.completedText}>+10</Text>
                    </View>
                  ) : (
                    <Text style={styles.pointsHint}>+10积分</Text>
                  )}
                </TouchableOpacity>
              )
            })}
          </View>

          {/* 完成进度 */}
          <View style={styles.dailyProgress}>
            <Text style={styles.dailyProgressText}>
              已完成 {Object.values(mealStatus).filter(Boolean).length}/6 餐
            </Text>
            <ProgressBar 
              progress={Object.values(mealStatus).filter(Boolean).length / 6 * 100} 
              height={6}
            />
          </View>
        </View>

        {/* 每日小贴士 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>每日小贴士</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tipsScroll}
          >
            {tips.map((tip) => (
              <DailyTipCard
                key={tip.id}
                tip={tip}
                onViewDetail={() => console.log('查看贴士详情:', tip.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* 推荐食谱 */}
        <RecommendedRecipes
          recipes={recipes}
          onRecipeClick={(id) => console.log('点击食谱:', id)}
          onViewAll={() => console.log('查看全部食谱')}
        />

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  babyCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  babyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  babyInfoLeft: {
    flex: 1,
  },
  babyName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  babyInfoRight: {
    alignItems: 'flex-end',
  },
  weekText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  sizeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  babyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  levelProgress: {
    marginTop: 4,
  },
  levelProgressText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  mealCard: {
    width: (width - 44) / 2,
    marginHorizontal: 6,
    marginBottom: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  mealName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  mealNameCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  mealTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: 4,
  },
  pointsHint: {
    fontSize: 11,
    color: COLORS.primary,
  },
  dailyProgress: {
    marginTop: 8,
  },
  dailyProgressText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 6,
  },
  tipsScroll: {
    paddingRight: 16,
  },
})
