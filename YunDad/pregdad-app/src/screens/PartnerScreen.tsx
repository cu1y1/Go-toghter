import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants'
import { apiPost } from '../services/apiClient'

interface BindStatus {
  bound: boolean
  partnerId?: string
}

// 家庭绑定页：生成/输入 8 位邀请码，绑定准爸妈
export default function PartnerScreen() {
  const [status, setStatus] = useState<BindStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [inputCode, setInputCode] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiPost<BindStatus>('/api/partner/bind', { action: 'status' })
      setStatus(res.data ?? { bound: false })
    } catch {
      setStatus({ bound: false })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const doCreate = useCallback(async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await apiPost<{ code: string; expiresAt: string }>('/api/partner/bind', { action: 'create' })
      if (res.success && res.data) {
        setCode(res.data.code)
        setExpiresAt(res.data.expiresAt)
      } else {
        setMsg(res.error ?? '生成失败，请重试')
      }
    } finally {
      setBusy(false)
    }
  }, [])

  const doJoin = useCallback(async () => {
    if (!/^\d{8}$/.test(inputCode)) {
      setMsg('请输入 8 位数字邀请码')
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const res = await apiPost<{ partnerId: string }>('/api/partner/bind', { action: 'join', code: inputCode })
      if (res.success) {
        setMsg('绑定成功！')
        setInputCode('')
        setCode(null)
        await load()
      } else {
        setMsg(res.error ?? '绑定失败，请重试')
      }
    } finally {
      setBusy(false)
    }
  }, [inputCode, load])

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (status?.bound) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.boundCard}>
          <Ionicons name="heart" size={44} color={COLORS.primary} />
          <Text style={styles.boundTitle}>已与另一半绑定</Text>
          <Text style={styles.boundSub}>你们的打卡、产检提醒将同步可见{'\n'}（对方动态展示二期上线）</Text>
        </View>
        <Text style={styles.disclaimer}>如需更换绑定对象，请联系客服处理（MVP 阶段暂不支持解绑）。</Text>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>家庭绑定</Text>
      <Text style={styles.subtitle}>邀请另一半加入，一起迎接宝宝</Text>

      {/* 生成邀请码 */}
      <View style={styles.card}>
        <Ionicons name="person-add-outline" size={22} color={COLORS.primary} />
        <Text style={styles.cardTitle}>我是准爸爸/准妈妈（生成码）</Text>
        {code ? (
          <View style={styles.codeBox}>
            <Text style={styles.code}>{code}</Text>
            <Text style={styles.codeHint}>10 分钟内有效，请让对方在 App 输入</Text>
          </View>
        ) : (
          <>
            <Text style={styles.cardDesc}>生成 8 位邀请码，分享给另一半</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={doCreate} disabled={busy}>
              {busy ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.primaryBtnText}>生成邀请码</Text>}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 输入邀请码 */}
      <View style={styles.card}>
        <Ionicons name="key-outline" size={22} color={COLORS.secondary} />
        <Text style={styles.cardTitle}>我有邀请码（输入绑定）</Text>
        <TextInput
          style={styles.input}
          placeholder="输入对方给您的 8 位数字"
          placeholderTextColor={COLORS.textMuted}
          keyboardType="number-pad"
          maxLength={8}
          value={inputCode}
          onChangeText={(t) => setInputCode(t.replace(/[^0-9]/g, ''))}
        />
        <TouchableOpacity style={[styles.secondaryBtn, busy && styles.btnDisabled]} onPress={doJoin} disabled={busy}>
          <Text style={styles.secondaryBtnText}>立即绑定</Text>
        </TouchableOpacity>
      </View>

      {!!msg && <Text style={[styles.msg, msg.includes('成功') ? styles.msgOk : styles.msgErr]}>{msg}</Text>}
      <Text style={styles.disclaimer}>邀请码 10 分钟有效且仅可使用一次；绑定后双方可互见打卡与提醒（二期）。</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textMuted, marginTop: 6, marginBottom: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 18, marginBottom: 14 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 8, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: COLORS.textMuted, marginBottom: 14 },
  codeBox: { alignItems: 'center', paddingVertical: 10 },
  code: { fontSize: 32, fontWeight: '800', letterSpacing: 6, color: COLORS.primary },
  codeHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 18, letterSpacing: 4, color: COLORS.text, marginBottom: 12, textAlign: 'center' },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  primaryBtnText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  secondaryBtn: { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.secondary, borderRadius: 12, paddingVertical: 11, alignItems: 'center' },
  secondaryBtnText: { color: COLORS.secondary, fontSize: 15, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },
  msg: { fontSize: 13, textAlign: 'center', marginTop: 6 },
  msgOk: { color: COLORS.success },
  msgErr: { color: COLORS.error },
  boundCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 30, alignItems: 'center', marginTop: 40 },
  boundTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 14 },
  boundSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  disclaimer: { fontSize: 11, color: COLORS.textMuted, marginTop: 16, lineHeight: 17 },
})
