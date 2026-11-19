import React, { useEffect, useRef, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Linking, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants'
import { useAiStore } from '../store/ai-store'

const QUICK_QUESTIONS = [
  '孕吐严重怎么缓解？',
  '老婆孕20周该补什么？',
  '陪产假一般多少天？',
  '待产包要准备哪些？',
]

// AI 助手页：问答 + 产检单解读入口
export default function AiScreen() {
  const { messages, sending, mode, quotaUsed, quotaLimit, send, refreshMeta } = useAiStore()
  const [input, setInput] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportText, setReportText] = useState('')
  const [reportResult, setReportResult] = useState<string | null>(null)
  const [reportSending, setReportSending] = useState(false)
  const [reportImage, setReportImage] = useState<string | null>(null)
  const listRef = useRef<React.ElementRef<typeof ScrollView>>(null)

  useEffect(() => {
    refreshMeta()
  }, [refreshMeta])

  useEffect(() => {
    // 新消息滚动到底
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
  }, [messages.length, sending])

  const doSend = useCallback(async () => {
    const t = input
    setInput('')
    await send(t)
  }, [input, send])

  const pickReportImage = useCallback(async () => {
    try {
      const ImagePicker = await import('expo-image-picker')
      const perm = await ImagePicker.requestCameraPermissionsAsync()
      const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!perm.granted && !libPerm.granted) {
        setReportResult('需要相机/相册权限才能识别报告单，请在系统设置中开启。')
        return
      }
      const hasCam = perm.granted
      const result = hasCam
        ? await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true, allowsEditing: false })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.5, base64: true, allowsEditing: false })
      if (!result.canceled && result.assets?.[0]?.base64) {
        const asset = result.assets[0]
        const mime = asset.mimeType || 'image/jpeg'
        const dataUrl = `data:${mime};base64,${asset.base64}`
        setReportImage(dataUrl)
        setReportResult(null)
      }
    } catch {
      setReportResult('拍照组件加载失败，可改用手动输入报告文字。')
    }
  }, [])

  const doReport = useCallback(async () => {
    if (reportSending) return
    if (!reportImage && reportText.trim().length < 10) return
    setReportSending(true)
    setReportResult(null)
    try {
      const { apiPost } = await import('../services/apiClient')
      const payload = reportImage ? { image: reportImage } : { reportText }
      const res = await apiPost<{ content: string | null }>('/api/ai/report', payload)
      setReportResult(res.success && res.data?.content ? res.data.content : `解读失败：${res.error ?? '未知错误'}`)
    } catch {
      setReportResult('网络不太顺畅，请重试。')
    } finally {
      setReportSending(false)
    }
  }, [reportText, reportImage, reportSending])

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <Text style={styles.title}>AI 孕产助手</Text>
        <View style={styles.metaRow}>
          <Text style={[styles.modeTag, mode === 'glm' && styles.modeTagLive]}>{mode === 'glm' ? 'GLM 已接入' : '演示模式'}</Text>
          <Text style={styles.quota}>{quotaUsed}/{quotaLimit} 次/时</Text>
        </View>
      </View>

      <ScrollView ref={listRef} style={styles.flex} contentContainerStyle={styles.msgList}>
        {messages.length === 0 && (
          <View style={styles.welcome}>
            <Ionicons name="sparkles" size={36} color={COLORS.primary} />
            <Text style={styles.welcomeTitle}>你好，我是孕产助手</Text>
            <Text style={styles.welcomeSub}>孕期知识 · 陪产技巧 · 产检解读</Text>
            <View style={styles.quickBox}>
              {QUICK_QUESTIONS.map((q) => (
                <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => send(q)}>
                  <Text style={styles.quickText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
            <Text style={m.role === 'user' ? styles.msgUser : styles.msgAi}>{m.content}</Text>
            {m.role === 'assistant' && !!m.sources?.length && (
              <View style={styles.sourcesBox}>
                <Text style={styles.sourcesTitle}>参考来源（点击查看原文）</Text>
                {m.sources.slice(0, 3).map((s, si) => (
                  <TouchableOpacity key={si} onPress={() => Linking.openURL(s.link).catch(() => {})}>
                    <Text style={styles.sourceLink} numberOfLines={1}>
                      [{si + 1}] {s.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
        {sending && (
          <View style={[styles.bubble, styles.bubbleAi]}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </ScrollView>

      {/* 产检单解读入口 */}
      <TouchableOpacity style={styles.reportEntry} onPress={() => setReportOpen(!reportOpen)}>
        <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
        <Text style={styles.reportEntryText}>{reportOpen ? '收起产检单解读' : '解读产检报告单'}</Text>
      </TouchableOpacity>
      {reportOpen && (
        <View style={styles.reportBox}>
          <View style={styles.reportActions}>
            <TouchableOpacity style={styles.photoBtn} onPress={pickReportImage} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={16} color={COLORS.primary} />
              <Text style={styles.photoBtnText}>{reportImage ? '重拍' : '拍报告单'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendBtn, (reportSending || (!reportImage && reportText.trim().length < 10)) && styles.sendBtnDisabled]}
              onPress={doReport}
              disabled={reportSending || (!reportImage && reportText.trim().length < 10)}
            >
              {reportSending ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.sendBtnText}>解读</Text>}
            </TouchableOpacity>
          </View>
          {reportImage && (
            <View style={styles.previewWrap}>
              <Image source={{ uri: reportImage }} style={styles.previewImg} resizeMode="cover" />
              <TouchableOpacity style={styles.previewDel} onPress={() => { setReportImage(null); setReportResult(null) }}>
                <Ionicons name="close-circle" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
              <Text style={styles.previewHint}>已就绪，点击「解读」开始分析</Text>
            </View>
          )}
          <TextInput
            style={styles.reportInput}
            multiline
            placeholder="或粘贴产检报告单文字（B超/血检等）"
            placeholderTextColor={COLORS.textMuted}
            value={reportText}
            onChangeText={setReportText}
          />
          {!!reportResult && (
            <ScrollView style={styles.reportResult} maximumZoomScale={1}>
              <Text style={styles.reportResultText}>{reportResult}</Text>
            </ScrollView>
          )}
          <Text style={styles.disclaimer}>以上仅供参考，不构成医疗建议，具体请遵医嘱。</Text>
        </View>
      )}

      {/* 输入区 */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="输入你的问题…"
          placeholderTextColor={COLORS.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={doSend}
          returnKeyType="send"
        />
        <TouchableOpacity style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]} onPress={doSend} disabled={!input.trim() || sending}>
          <Ionicons name="send" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  modeTag: { fontSize: 11, color: COLORS.textMuted, backgroundColor: COLORS.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden', marginRight: 8 },
  modeTagLive: { color: COLORS.success, backgroundColor: COLORS.success + '18' },
  quota: { fontSize: 11, color: COLORS.textMuted },
  msgList: { padding: 16 },
  welcome: { alignItems: 'center', marginTop: 60 },
  welcomeTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  welcomeSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, marginBottom: 20 },
  quickBox: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  quickBtn: { backgroundColor: COLORS.white, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, margin: 5, borderWidth: 1, borderColor: COLORS.primary + '40' },
  quickText: { fontSize: 12, color: COLORS.primary },
  bubble: { maxWidth: '85%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  bubbleAi: { alignSelf: 'flex-start', backgroundColor: COLORS.white },
  msgUser: { color: COLORS.white, fontSize: 14, lineHeight: 20 },
  msgAi: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  sourcesBox: { marginTop: 8, paddingTop: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb' },
  sourcesTitle: { color: COLORS.textMuted, fontSize: 11, marginBottom: 2 },
  sourceLink: { color: COLORS.primary, fontSize: 12, lineHeight: 18 },
  reportActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.white,
  },
  photoBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  previewWrap: { marginBottom: 10, borderRadius: 12, overflow: 'hidden', backgroundColor: COLORS.border },
  previewImg: { width: '100%', height: 140 },
  previewDel: { position: 'absolute', top: 8, right: 8 },
  previewHint: { position: 'absolute', bottom: 6, left: 10, right: 10, fontSize: 11, color: COLORS.white, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
  reportEntry: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  reportEntryText: { fontSize: 13, color: COLORS.primary, marginLeft: 6 },
  reportBox: { backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  reportInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, fontSize: 13, color: COLORS.text, minHeight: 60, textAlignVertical: 'top', marginBottom: 8 },
  reportResult: { maxHeight: 160, backgroundColor: COLORS.background, borderRadius: 10, padding: 10, marginTop: 8 },
  reportResultText: { fontSize: 13, color: COLORS.text, lineHeight: 19 },
  disclaimer: { fontSize: 10, color: COLORS.textMuted, marginTop: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, fontSize: 14, color: COLORS.text, marginRight: 8 },
  sendBtn: { backgroundColor: COLORS.primary, borderRadius: 20, width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
})
