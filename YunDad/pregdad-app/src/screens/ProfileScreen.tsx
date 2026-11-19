import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants'
import { Card, ProgressBar } from '../components/common'
import { useUserStore, useFavoriteStore } from '../store'
import { useAuthStore } from '../store/auth-store'
import { useBabyBagStore } from '../store/babybag-store'
import { getLevelByPoints } from '../utils'
import { PartnerPanel } from '../components/partner/PartnerPanel'

const APP_VERSION = '1.0.0'

/**
 * 「我的」页（五页签版）
 * - 原独立「家庭」Tab 的绑定功能收编为 PartnerPanel 区块
 * - 待产包入口（Tab 已瘦身移除，从页签改入口卡）
 */
export const ProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useUserStore()
  const { favorites } = useFavoriteStore()
  const babybag = useBabyBagStore()
  const authUser = useAuthStore((s) => s.user)
  const [darkMode, setDarkMode] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // 用户数据
  const userInfo = {
    avatar: user?.avatar,
    babyName: user?.babyName || '小宝贝',
    dueDate: user?.dueDate ? new Date(user.dueDate) : new Date(Date.now() + 140 * 24 * 60 * 60 * 1000),
    pregnancyWeek: user?.pregnancyWeek || 20,
    points: user?.points || 180,
    level: user?.level || 3,
  }

  const levelInfo = getLevelByPoints(userInfo.points)

  // 格式化预产期
  const formatDueDate = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}年${month}月${day}日`
  }

  // 菜单项点击
  const handleMenuPress = useCallback((id: string) => {
    switch (id) {
      case 'favorites':
        Alert.alert('我的收藏', `您已收藏 ${favorites.length} 个食谱`)
        break
      case 'profile':
        Alert.alert('个人资料', '编辑功能开发中...')
        break
      case 'reminder':
        Alert.alert('每日提醒', '提醒设置功能开发中...')
        break
      case 'contact':
        Alert.alert('联系我们', '客服邮箱：support@pregdad.com')
        break
      case 'rating':
        Alert.alert('感谢支持', '您的支持是我们前进的动力！')
        break
      case 'about':
        Alert.alert('关于孕爸爸', `版本 ${APP_VERSION}\n\n专业的孕期陪伴助手`)
        break
    }
  }, [favorites.length])

  // 退出登录
  const handleLogout = useCallback(() => {
    Alert.alert(
      '确认退出',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '退出', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    )
  }, [logout])

  // 菜单配置
  const menuItems = [
    { 
      id: 'favorites', 
      icon: 'heart', 
      label: '我的收藏', 
      badge: favorites.length,
      color: '#EF4444'
    },
    { id: 'profile', icon: 'person', label: '个人资料', color: COLORS.primary },
    { id: 'reminder', icon: 'notifications', label: '每日提醒', color: '#FBBF24' },
  ]

  const settingItems = [
    { id: 'darkmode', icon: 'moon', label: '深色模式', hasSwitch: true, color: '#6366F1' },
    { id: 'contact', icon: 'mail', label: '联系我们', color: COLORS.success },
    { id: 'rating', icon: 'star', label: '给个好评', color: '#FBBF24' },
    { id: 'about', icon: 'information-circle', label: '关于我们', color: COLORS.textLight },
  ]

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 用户卡片 */}
        <View style={styles.userCard}>
          <TouchableOpacity style={styles.avatarContainer}>
            {userInfo.avatar ? (
              <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={32} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.babyName}>{userInfo.babyName}的爸爸</Text>
          <Text style={styles.dueDate}>预产期：{formatDueDate(userInfo.dueDate)}</Text>

          {/* 等级与进度 */}
          <View style={styles.levelSection}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv.{userInfo.level}</Text>
            </View>
            <View style={styles.levelProgressBox}>
              <ProgressBar progress={levelInfo.progress} color={COLORS.white} height={6} />
              <Text style={styles.levelPoints}>{userInfo.points} 积分</Text>
            </View>
          </View>
        </View>

        {/* 家庭绑定（原独立Tab收编） */}
        <PartnerPanel />

        {/* 待产包入口（原独立Tab收编） */}
        <TouchableOpacity
          style={styles.babybagEntry}
          activeOpacity={0.85}
          onPress={() => Alert.alert('待产包', '待产包已移至「首页」快捷入口，即将以新交互回归')}
        >
          <View style={styles.babybagIconBox}>
            <Ionicons name="bag-check" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.babybagInfo}>
            <Text style={styles.babybagTitle}>待产包</Text>
            <Text style={styles.babybagSub}>
              已备 {babybag.stats.prepared}/{babybag.stats.total} 项 · 点此查看清单
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* 功能菜单 */}
        <View style={styles.menuSection}>
          {menuItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {!!item.badge && item.badge > 0 && (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* 设置 */}
        <View style={styles.menuSection}>
          {settingItems.map(item => (
            <View key={item.id} style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.hasSwitch ? (
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ true: COLORS.primary, false: COLORS.border }}
                />
              ) : (
                <TouchableOpacity onPress={() => handleMenuPress(item.id)}>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* 退出登录 */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>孕爸爸 v{APP_VERSION}</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  userCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: { marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  avatarPlaceholder: { backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  babyName: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  dueDate: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
    gap: 12,
  },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  levelText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  levelProgressBox: { flex: 1 },
  levelPoints: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 4, textAlign: 'right' },
  babybagEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  babybagIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  babybagInfo: { flex: 1 },
  babybagTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  babybagSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  menuSection: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  menuBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  menuBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: '600' },
  logoutBtn: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
  versionText: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12 },
})
