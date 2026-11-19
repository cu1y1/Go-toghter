import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { COLORS } from '../constants'
import { Card } from '../components/common'
import { useBabyBagStore } from '../store/babybag-store'
import { useAuthStore } from '../store/auth-store'

/**
 * 待产包页（Tab 收编版）
 * - 顶部显示整体准备进度
 * - 饮食计划 Tab 布局思路：分类横向切换 + 该分类物品列表
 * - 二期入口预留：AI 智能推荐 / 一键采购清单（CPS 分佣）
 */
export const BabyBagScreen: React.FC = () => {
  const navigation = useNavigation<any>()
  const userId = useAuthStore((s) => s.user?.id)
  const {
    categories,
    items,
    stats,
    loading,
    error,
    getBabyBagItems,
    toggleItem,
    addItem,
    deleteItem,
  } = useBabyBagStore()
  const [activeCat, setActiveCat] = useState<string | null>(null)

  React.useEffect(() => {
    getBabyBagItems()
  }, [getBabyBagItems])

  const currentCat = activeCat ?? categories[0]?.id ?? null
  const currentItems = currentCat ? items.filter((i) => i.categoryId === currentCat) : []

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>正在加载待产包…</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="cloud-offline" size={40} color={COLORS.textMuted} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => getBabyBagItems()}>
          <Text style={styles.retryText}>重试</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>待产包</Text>
        <Text style={styles.subtitle}>宝宝出生前的物资清单，一项项准备</Text>

        {/* 总进度 */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>准备进度</Text>
            <Text style={styles.progressValue}>
              {stats.prepared}/{stats.total}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${stats.total ? Math.round((stats.prepared / stats.total) * 100) : 0}%` },
              ]}
            />
          </View>
        </View>

        {/* 功能入口：一键采购(CPS已接) / AI智能推荐(二期) */}
        <View style={styles.soonRow}>
          <View style={[styles.soonCard, styles.soonDisabled]}>
            <Ionicons name="sparkles" size={18} color={COLORS.textMuted} />
            <Text style={styles.soonText}>AI 智能推荐 · 二期</Text>
          </View>
          <TouchableOpacity style={styles.soonCard} activeOpacity={0.8} onPress={() => navigation.navigate('ShoppingList')}>
            <Ionicons name="cart" size={18} color={COLORS.primary} />
            <Text style={[styles.soonText, { color: COLORS.primary, fontWeight: '600' }]}>一键采购清单</Text>
          </TouchableOpacity>
        </View>

        {/* 分类横向切换 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catBtn, currentCat === c.id && styles.catBtnActive]}
              onPress={() => setActiveCat(c.id)}
            >
              <Text style={[styles.catText, currentCat === c.id && styles.catTextActive]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 当前分类物品 */}
        {currentItems.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <TouchableOpacity
              style={styles.itemRow}
              onPress={() => toggleItem(userId, item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, item.isPrepared && styles.checkboxActive]}>
                {item.isPrepared && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, item.isPrepared && styles.itemNamePacked]}>
                  {item.name}
                </Text>
                {!!item.description && (
                  <Text style={styles.itemDesc} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => deleteItem(userId, item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          </Card>
        ))}

        {currentItems.length === 0 && (
          <Text style={styles.emptyText}>该分类还没有物品</Text>
        )}
      </ScrollView>

      {/* 添加物品 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          // 简易添加：后续迭代为表单弹层
          addItem(userId, currentCat ?? '', '新物品', '')
        }}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, marginBottom: 16 },
  loadingText: { color: COLORS.textMuted, marginTop: 12 },
  errorText: { color: COLORS.textMuted, marginTop: 12, marginBottom: 16 },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: { color: COLORS.white, fontWeight: '600' },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  progressValue: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  progressBar: { height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: COLORS.primary, borderRadius: 4 },
  soonRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  soonCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  soonDisabled: { opacity: 0.6 },
  soonText: { fontSize: 12, color: COLORS.textMuted },
  catRow: { marginBottom: 12 },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 13, color: COLORS.text },
  catTextActive: { color: COLORS.white, fontWeight: '600' },
  itemCard: { marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, color: COLORS.text, fontWeight: '500' },
  itemNamePacked: { color: COLORS.textMuted, textDecorationLine: 'line-through' },
  itemDesc: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 24 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
