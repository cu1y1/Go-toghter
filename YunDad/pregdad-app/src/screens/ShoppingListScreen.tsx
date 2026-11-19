import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants'
import { useBabyBagStore } from '../store/babybag-store'
import { useAuthStore } from '../store/auth-store'
import { BabyBagItem } from '../store/babybag-store'

interface JdGoods {
  skuId: string
  name: string
  price: number
  commissionRate?: string
  shortUrl?: string
}

/**
 * 一键采购清单（CPS分佣 · 京东联盟）
 * - 勾选未备齐物品 → 匹配候选商品 → 展示佣金比例 → 跳转京东短链
 * - 真实转化链路：用户下单 → 联盟结算佣金 → y总账户
 */
export const ShoppingListScreen: React.FC = () => {
  const userId = useAuthStore((s) => s.user?.id)
  const { items, stats, loading, getBabyBagItems } = useBabyBagStore()
  const [matched, setMatched] = useState<Record<string, JdGoods | null>>({})
  const [searching, setSearching] = useState(false)
  const [budget, setBudget] = useState('')
  const [keyword, setKeyword] = useState('')

  React.useEffect(() => {
    getBabyBagItems()
  }, [getBabyBagItems])

  const unpacked = items.filter((i) => !i.isPrepared)

  // 匹配商品：MVP阶段按关键词聚合查询（后续接京东联盟API按SKU精准匹配+查佣金）
  const matchGoods = async () => {
    if (unpacked.length === 0) {
      Alert.alert('太棒了', '待产包已全部备齐，无需采购')
      return
    }
    setSearching(true)
    try {
      // TODO(需app_key+secret): 调 /api/shopping/match → jd.union.open.goods.query + 佣金查询
      // 当前阶段：生成按类目聚合的京东搜索短链(含推广位子站ID后续补充)
      const result: Record<string, JdGoods | null> = {}
      for (const it of unpacked.slice(0, 20)) {
        result[it.id] = {
          skuId: '',
          name: it.name,
          price: 0,
          commissionRate: '约2%-10%(以京东实时为准)',
          shortUrl: `https://so.m.jd.com/ware/search.action?keyword=${encodeURIComponent(it.name)}`,
        }
      }
      setMatched(result)
      Alert.alert('已生成', `为 ${unpacked.length} 件未备物品匹配了京东搜索入口\n（API精准比价+佣金率展示在联盟审核通过后上线）`)
    } finally {
      setSearching(false)
    }
  }

  const openGoods = (g: JdGoods) => {
    if (!g.shortUrl) return
    Alert.alert('打开京东', `商品：${g.name}\n预计佣金：${g.commissionRate ?? '待查'}\n\n（正式版将直接唤起京东App并携带推广参数）`, [
      { text: '取消', style: 'cancel' },
      { text: '知道了' },
    ])
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>一键采购清单</Text>
        <Text style={styles.subtitle}>按待产包缺口智能生成，比价+佣金透明展示</Text>

        {/* 预算参考 */}
        <View style={styles.budgetCard}>
          <Ionicons name="calculator" size={18} color={COLORS.primary} />
          <Text style={styles.budgetLabel}>预算参考（可选填）</Text>
          <TextInput
            style={styles.budgetInput}
            placeholder="如 2000"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
          />
          <Text style={styles.budgetUnit}>元</Text>
        </View>

        {/* 生成按钮 */}
        <TouchableOpacity style={styles.genBtn} onPress={matchGoods} disabled={searching}>
          {searching ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="cart" size={18} color={COLORS.white} />
              <Text style={styles.genBtnText}>生成采购清单（{unpacked.length} 件未备）</Text>
            </>
          )}
        </TouchableOpacity>

        {/* 自定义补充采购 */}
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            placeholder="补充要买的物品…"
            placeholderTextColor={COLORS.textMuted}
            value={keyword}
            onChangeText={setKeyword}
          />
          <TouchableOpacity
            style={styles.customBtn}
            onPress={() => {
              if (!keyword.trim()) return
              setMatched((m: Record<string, JdGoods | null>) => ({
                ...m,
                [`custom-${keyword}`]: {
                  skuId: '',
                  name: keyword.trim(),
                  price: 0,
                  commissionRate: '约2%-10%',
                  shortUrl: `https://so.m.jd.com/ware/search.action?keyword=${encodeURIComponent(keyword.trim())}`,
                },
              }))
              setKeyword('')
            }}
          >
            <Text style={styles.customBtnText}>加入</Text>
          </TouchableOpacity>
        </View>

        {/* 清单 */}
        {Object.entries(matched).map(([k, g]) =>
          g ? (
            <TouchableOpacity key={k} style={styles.itemCard} onPress={() => openGoods(g)} activeOpacity={0.8}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{g.name}</Text>
                <Text style={styles.itemRate}>佣金 {g.commissionRate}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : null
        )}

        {Object.keys(matched).length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>点击上方按钮，按待产包缺口生成采购清单</Text>
          </View>
        )}

        <Text style={styles.note}>
          提示：通过清单跳转京东下单，本服务可能获得联盟返佣，你的价格不受影响。省心备产，顺手支持我们。
        </Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, marginBottom: 16 },
  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  budgetLabel: { fontSize: 13, color: COLORS.text, flex: 1 },
  budgetInput: {
    width: 80,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'right',
  },
  budgetUnit: { fontSize: 13, color: COLORS.textMuted },
  genBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 12,
  },
  genBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 15 },
  customRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  customBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBtnText: { color: COLORS.white, fontWeight: '600' },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  itemRate: { fontSize: 11, color: COLORS.primary, marginTop: 2 },
  emptyBox: { alignItems: 'center', marginTop: 32, paddingHorizontal: 24 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, marginTop: 8, textAlign: 'center' },
  note: { fontSize: 11, color: COLORS.textMuted, marginTop: 16, lineHeight: 16 },
})
