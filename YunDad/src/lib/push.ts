// 服务端推送发送器（Expo Push API）
// 合规说明：仅发送用户已注册token、enabled=true的设备；提醒类内容，不含营销（免骚扰）
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

interface PushMessage {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default' | null
  channelId?: string
}

export async function sendPush(message: PushMessage): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify({
        to: message.to,
        title: message.title,
        body: message.body,
        data: message.data ?? {},
        sound: message.sound ?? 'default',
        ...(message.channelId ? { channelId: message.channelId } : {}),
      }),
    })
    const json = await res.json()
    // Expo 返回 { data: { status: 'ok' } } 或 { data: { status: 'error', message } }
    if (json?.data?.status === 'ok') return { ok: true }
    return { ok: false, error: json?.data?.message ?? 'push failed' }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'network error' }
  }
}

// 批量发送（产检提醒/每日提醒用），并发受限，单次≤100条（Expo API限制）
export async function sendPushBatch(messages: PushMessage[]): Promise<{ sent: number; failed: number }> {
  const chunk = messages.slice(0, 100)
  const results = await Promise.all(chunk.map(m => sendPush(m)))
  return {
    sent: results.filter(r => r.ok).length,
    failed: results.filter(r => !r.ok).length,
  }
}

// 向用户全部启用设备推送
export async function pushToUser(
  prisma: { pushToken: { findMany: Function } },
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<number> {
  const tokens = await prisma.pushToken.findMany({
    where: { userId, enabled: true },
    select: { token: true },
  })
  if (!tokens.length) return 0
  const r = await sendPushBatch(tokens.map(t => ({ to: t.token, title, body, data })))
  return r.sent
}
