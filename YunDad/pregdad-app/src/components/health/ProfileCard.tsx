import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants'
import { useWeightStore } from '../../store/weight-store'

// 孕前体型档案卡：身高 + 孕前体重 → BMI 分档，驱动增重建议范围
export default function ProfileCard() {
  const { profile, saveProfile } = useWeightStore()
  const [height, setHeight] = useState(profile?.heightCm ? String(profile.heightCm) : '')
  const [preW, setPreW] = useState(profile?.prePregnancyWeight ? String(profile.prePregnancyWeight) : '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const h = Number(height)
  const w = Number(preW)
  const bmi = h >= 100 && w >= 30 ? Number((w / Math.pow(h / 100, 2)).toFixed(1)) : null

  const submit = useCallback(async () => {
    if (!h || h < 100 || h > 250) { setMsg('身高 100-250cm'); return }
    if (!w || w < 30 || w > 200) { setMsg('体重 30-200kg'); return }
    setSaving(true)
    setMsg(null)
    const ok = await saveProfile(h, w)
    setSaving(false)
    setMsg(ok ? '已保存，增重建议已按孕前BMI校准' : '保存失败，请重试')
    if (ok) setTimeout(() => setMsg(null), 2500)
  }, [h, w, saveProfile])

  const bmiLabel = bmi === null ? '' : bmi < 18.5 ? '偏瘦' : bmi < 24 ? '正常' : bmi < 28 ? '超重' : '肥胖'

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="body-outline" size={20} color={COLORS.primary} />
        <Text style={styles.title}>孕前体型档案</Text>
        {bmi !== null && <Text style={styles.bmiTag}>{bmiLabel} · BMI {bmi}</Text>}
      </View>
      <Text style={styles.desc}>填写一次即可，增重建议范围将按 WHO/中国标准自动校准</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="身高 cm"
          placeholderTextColor={COLORS.textLight}
          keyboardType="number-pad"
          maxLength={3}
          value={height}
          onChangeText={(t) => setHeight(t.replace(/[^0-9]/g, ''))}
        />
        <TextInput
          style={styles.input}
          placeholder="孕前体重 kg"
          placeholderTextColor={COLORS.textLight}
          keyboardType="decimal-pad"
          value={preW}
          onChangeText={setPreW}
        />
        <TouchableOpacity style={[styles.btn, saving && styles.btnDisabled]} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.btnText}>保存</Text>}
        </TouchableOpacity>
      </View>
      {!!msg && <Text style={[styles.msg, msg.includes('失败') || msg.includes('cm') || msg.includes('kg') ? styles.msgErr : styles.msgOk]}>{msg}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginLeft: 6, flex: 1 },
  bmiTag: { fontSize: 11, color: COLORS.primary, backgroundColor: COLORS.primary + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  desc: { fontSize: 12, color: COLORS.textLight, marginTop: 6, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: COLORS.text, marginRight: 8 },
  btn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  msg: { fontSize: 12, marginTop: 8 },
  msgOk: { color: COLORS.success },
  msgErr: { color: COLORS.error },
})
