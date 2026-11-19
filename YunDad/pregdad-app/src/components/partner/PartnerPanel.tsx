import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants'
import { apiPost } from '../../services/apiClient'

interface BindStatus {
  bound: boolean
  partner?: { id: string; nickname?: string; babyName?: string }
}

/**
 * 家庭绑定面板（原独立「家庭」Tab 收编进「我的」页）
 * 功能不变：生成邀请码 / 输码绑定 / 解绑
 */
export const PartnerPanel: React.FC = () => {
  const [status, setStatus] = useState<BindStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [inputCode, setInputCode] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = React.useCallback(async () => {
    try {
      const res = await fetchStatus()
      setStatus(res)
    } catch {
      setMsg('状态获取失败，请下拉重试')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  async function fetchStatus(): Promise<BindStatus> {
    const res = await apiPost<BindStatus>('/api/partner/bind', { action: 'status' })
    if (!res.success || !res.data) throw new Error(res.error ?? 'status failed')
    return res.data
  }

  const createCode = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await apiPost<{ code: string; expiresAt: string }>('/api/partner/bind', { action: 'create' })
      if (res.success && res.data) {
        setCode(res.data.code)
        setExpiresAt(res.data.expiresAt)
        setMsg('邀请码已生成，48小时内有效')
      } else {
        setMsg(res.error ?? '生成失败，请稍后重试')
      }
    } catch {
      setMsg('网络错误，请稍后重试')
    } finally {
      setBusy(false)
    }
  }

  const joinByCode = async () => {
    if (!inputCode.trim()) {
      setMsg('请输入对方的邀请码')
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      const res = await apiPost<{ partnerId: string }>('/api/partner/bind', { action: 'join', code: inputCode.trim() })
      if (res.success) {
        setInputCode('')
        await refresh()
        setMsg('绑定成功 🎉')
      } else {
        setMsg(res.error ?? '绑定失败，请核对邀请码')
      }
    } catch {
      setMsg('网络错误，请稍后重试')
    } finally {
      setBusy(false)
    }
  }

  const unbind = async () => {
    setBusy(true)
    setMsg(null)
    try {
      const res = await apiPost<{ unbound: boolean }>('/api/partner/bind', { action: 'unbind' })
      if (res.success) {
        await refresh()
        setMsg('已解除绑定')
      } else {
        setMsg(res.error ?? '解绑失败')
      }
    } catch {
      setMsg('网络错误，请稍后重试')
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="people" size={18} color={COLORS.primary} />
        <Text style={styles.title}>家庭绑定</Text>
        <Text style={styles.subtitle}>邀请另一半，一起迎接宝宝</Text>
      </View>

      {status?.bound && status.partner ? (
        <View style={styles.boundRow}>
          <View style={styles.partnerAvatar}>
            <Ionicons name="person" size={22} color={COLORS.white} />
          </View>
          <View style={styles.partnerInfo}>
            <Text style={styles.partnerName}>{status.partner.nickname || '伴侣'}</Text>
            <Text style={styles.partnerSub}>已绑定 · 数据互通中</Text>
          </View>
          <TouchableOpacity onPress={unbind} disabled={busy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.unbindText}>解绑</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.primaryBtn} onPress={createCode} disabled={busy}>
              <Ionicons name="qr-code" size={16} color={COLORS.white} />
              <Text style={styles.primaryBtnText}>生成邀请码</Text>
            </TouchableOpacity>
            <View style={styles.joinBox}>
              <TextInput
                style={styles.joinInput}
                placeholder="输入对方邀请码"
                placeholderTextColor={COLORS.textMuted}
                value={inputCode}
                onChangeText={setInputCode}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.joinBtn} onPress={joinByCode} disabled={busy}>
                <Text style={styles.joinBtnText}>绑定</Text>
              </TouchableOpacity>
            </View>
          </View>
          {!!code && (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>我的邀请码（48小时内有效）</Text>
              <Text selectable style={styles.codeValue}>{code}</Text>
              {expiresAt && <Text style={styles.codeExpires}>有效期至 {new Date(expiresAt).toLocaleString('zh-CN')}</Text>}
            </View>
          )}
        </View>
      )}

      {!!msg && <Text style={styles.msg}>{msg}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginLeft: 6 },
  subtitle: { fontSize: 12, color: COLORS.textMuted, marginLeft: 8, flex: 1 },
  boundRow: { flexDirection: 'row', alignItems: 'center' },
  partnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  partnerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  unbindText: { color: '#EF4444', fontSize: 13 },
  actionRow: { gap: 10 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  primaryBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  joinBox: { flexDirection: 'row', gap: 8 },
  joinInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  codeBox: {
    marginTop: 12,
    backgroundColor: COLORS.primary + '08',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  codeLabel: { fontSize: 11, color: COLORS.textMuted },
  codeValue: { fontSize: 22, fontWeight: '700', color: COLORS.primary, letterSpacing: 4, marginVertical: 4 },
  codeExpires: { fontSize: 10, color: COLORS.textMuted },
  msg: { fontSize: 12, color: COLORS.primary, marginTop: 8 },
})
