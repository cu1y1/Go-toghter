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
import { getLevelByPoints } from '../utils'

const APP_VERSION = '1.0.0'

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateUser } = useUserStore()
  const { favorites } = useFavoriteStore()
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
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
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
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 用户卡片 */}
        <Card style={styles.userCard}>
          <View style={styles.userTop}>
            <TouchableOpacity style={styles.avatarContainer}>
              {userInfo.avatar ? (
                <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={32} color={COLORS.white} />
                </View>
              )}
              <View style={styles.avatarBadge}>
                <Ionicons name="camera" size={12} color={COLORS.white} />
              </View>
            </TouchableOpacity>
            
            <View style={styles.userInfo}>
              <Text style={styles.babyName}>{userInfo.babyName}</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv.{levelInfo.level} {levelInfo.name}</Text>
              </View>
              <Text style={styles.pointsText}>积分: {userInfo.points}</Text>
            </View>
          </View>

          <View style={styles.userStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>孕{userInfo.pregnancyWeek}周</Text>
              <Text style={styles.statLabel}>当前孕周</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDueDate(userInfo.dueDate)}</Text>
              <Text style={styles.statLabel}>预产期</Text>
            </View>
          </View>

          <View style={styles.levelProgress}>
            <Text style={styles.levelProgressText}>
              再获得 {levelInfo.pointsToNext} 积分升级
            </Text>
            <ProgressBar progress={levelInfo.progress} height={4} />
          </View>
        </Card>

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
              {item.badge !== undefined && item.badge > 0 && (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* 设置菜单 */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>设置</Text>
          {settingItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => !item.hasSwitch && handleMenuPress(item.id)}
              activeOpacity={item.hasSwitch ? 1 : 0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.hasSwitch ? (
                <Switch
                  value={darkMode}
                  onValueChange={(value) => {
                    setDarkMode(value)
                    Alert.alert(value ? '深色模式已开启' : '深色模式已关闭')
                  }}
                  trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                  thumbColor={darkMode ? COLORS.primary : '#f4f3f4'}
                />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 退出登录 */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>

        {/* 版本信息 */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>孕爸爸 v{APP_VERSION}</Text>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} 孕爸爸 All Rights Reserved
          </Text>
        </View>

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
  userCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
  },
  userTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  babyName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  levelText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  pointsText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  userStats: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  levelProgress: {
  },
  levelProgressText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
    padding: 14,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  menuBadge: {
    backgroundColor: COLORS.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  menuBadgeText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },
  logoutText: {
    fontSize: 15,
    color: COLORS.error,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  copyrightText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
})
