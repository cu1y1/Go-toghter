import React, { useEffect, useRef, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
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
  const listRef = useRef<ScrollView>(null)

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

  const doReport = useCallback(async () => {
    if (reportSending || reportText.trim().length < 10) return
    setReportSending(true)
    setReportResult(null)
    try {
      const { apiPost } = await import('../services/apiClient')
      const res = await apiPost<{ content: string | null }>('/api/ai/report', { reportText })
      setReportResult(res.success && res.data?.content ? res.data.content : `解读失败：${res.error ?? '未知错误'}`)
    } catch {
      setReportResult('网络不太顺畅，请重试。')
    } finally {
      setReportSending(false)
    }
  }, [reportText, reportSending])

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
          <TextInput
            style={styles.reportInput}
            multiline
            placeholder="粘贴产检报告单文字（B超/血检等），至少10字"
            placeholderTextColor={COLORS.textMuted}
            value={reportText}
            onChangeText={setReportText}
          />
          <TouchableOpacity style={[styles.sendBtn, reportSending && styles.sendBtnDisabled]} onPress={doReport} disabled={reportSending}>
            {reportSending ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.sendBtnText}>解读</Text>}
          </TouchableOpacity>
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
