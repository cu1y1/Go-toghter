import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants'
import { useWeightStore } from '../../store/weight-store'

// 体重卡片：今日体重记录 + 增重趋势简表（MVP不引SVG库，用数值+进度条表达曲线）
export default function WeightCard() {
  const { records, preBMI, loading, fetchWeights, addWeight, getGainAdvice } = useWeightStore()
  const [weightInput, setWeightInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchWeights()
  }, [fetchWeights])

  const todayKey = new Date().toISOString().slice(0, 10)
  const todayRecord = records.find((r) => String(r.recordDate).slice(0, 10) === todayKey)
  const advice = getGainAdvice()
  const latest = records[records.length - 1]

  const submit = useCallback(async () => {
    const w = Number(weightInput)
    if (!w || w < 30 || w > 200) {
      setMsg('请输入30-200之间的体重')
      return
    }
    setSubmitting(true)
    setMsg(null)
    const ok = await addWeight(w)
    setSubmitting(false)
    if (ok) {
      setWeightInput('')
      setMsg(todayRecord ? '已更新今日体重' : '记录成功')
      setTimeout(() => setMsg(null), 2500)
    } else {
      setMsg('记录失败，请检查网络')
    }
  }, [weightInput, todayRecord, addWeight])

  // 最近7条趋势
  const recent = records.slice(-7)
  const gainColor = advice.currentGain === null ? COLORS.textLight : advice.currentGain > advice.range[1] ? COLORS.error : advice.currentGain < advice.range[0] ? COLORS.secondary : COLORS.success

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="scale-outline" size={20} color={COLORS.primary} />
        <Text style={styles.title}>体重记录</Text>
        {preBMI !== null && <Text style={styles.bmiTag}>孕前BMI {preBMI}</Text>}
      </View>

      {/* 增重建议 */}
      <View style={styles.adviceBox}>
        <Text style={styles.adviceLabel}>
          孕前{advice.label} · 建议总增重 {advice.range[0]}-{advice.range[1]}kg
        </Text>
        <Text style={[styles.adviceValue, { color: gainColor }]}>
          {advice.currentGain === null ? '记录2天以上看增重' : `已增重 ${advice.currentGain > 0 ? '+' : ''}${advice.currentGain}kg`}
        </Text>
      </View>

      {/* 今日输入 */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={todayRecord ? `今日已记 ${todayRecord.weightKg}kg，可更新` : '输入今日体重 (kg)'}
          placeholderTextColor={COLORS.textLight}
          keyboardType="decimal-pad"
          value={weightInput}
          onChangeText={setWeightInput}
        />
        <TouchableOpacity style={styles.btn} onPress={submit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.btnText}>{todayRecord ? '更新' : '记录'}</Text>
          )}
        </TouchableOpacity>
      </View>
      {!!msg && <Text style={styles.msg}>{msg}</Text>}

      {/* 最近趋势（数值曲线） */}
      {recent.length >= 2 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trendScroll}>
          {recent.map((r) => {
            const min = Math.min(...recent.map((x) => x.weightKg))
            const max = Math.max(...recent.map((x) => x.weightKg))
            const span = Math.max(max - min, 0.5)
            const heightPct = 20 + ((r.weightKg - min) / span) * 60
            return (
              <View key={r.id} style={styles.trendItem}>
                <View style={styles.trendBars}>
                  <View style={[styles.trendBar, { height: heightPct }]} />
                </View>
                <Text style={styles.trendWeight}>{r.weightKg}</Text>
                <Text style={styles.trendDate}>{String(r.recordDate).slice(5, 10)}</Text>
              </View>
            )
          })}
        </ScrollView>
      )}

      {loading && records.length === 0 && <ActivityIndicator style={styles.loading} color={COLORS.primary} />}
      {records.length === 0 && !loading && (
        <Text style={styles.empty}>每天晨起空腹称重最准，坚持记录生成增重曲线</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginLeft: 8, flex: 1 },
  bmiTag: { fontSize: 12, color: COLORS.primary, backgroundColor: COLORS.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  adviceBox: { backgroundColor: COLORS.background || '#F7F8FA', borderRadius: 12, padding: 12, marginBottom: 12 },
  adviceLabel: { fontSize: 12, color: COLORS.textLight, marginBottom: 4 },
  adviceValue: { fontSize: 18, fontWeight: '700' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: COLORS.border || '#E5E6EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: COLORS.text, marginRight: 8 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 11 },
  btnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  msg: { fontSize: 12, color: COLORS.success, marginTop: 6 },
  trendScroll: { marginTop: 12 },
  trendItem: { alignItems: 'center', marginRight: 18 },
  trendBars: { height: 80, justifyContent: 'flex-end' },
  trendBar: { width: 22, backgroundColor: COLORS.primary, borderRadius: 6, opacity: 0.75 },
  trendWeight: { fontSize: 11, color: COLORS.text, marginTop: 4, fontWeight: '600' },
  trendDate: { fontSize: 10, color: COLORS.textLight },
  loading: { marginTop: 12 },
  empty: { fontSize: 12, color: COLORS.textLight, textAlign: 'center', marginTop: 8 },
})
