// AI 服务层：GLM 智谱（免费档）适配
// 模式：AI_MODE=mock（默认，零成本）| glm（真实调用，需 AI_API_KEY，须经主人批准）
// 医疗合规：所有输出必须由调用方附加"仅供参考，不构成医疗建议"免责声明；不做诊断性表述

export type AiMode = 'mock' | 'glm'

export interface AiChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AiResult {
  ok: boolean
  content: string
  mode: AiMode
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
  sources?: Array<{ title: string; link: string; media?: string; publish_date?: string }>
  error?: string
}

const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
// 模型：默认 glm-5.3-flash（最新普惠档，¥0.8/2.8 每百万token，限流10次/时/用户下月成本≈¥3-5，经y总批准 2026-11-16）
// 备选：glm-4.7-flash（完全免费，200K 上下文；4.5-flash 将于2026-01-30下线，官方指定路由至此）
const GLM_MODEL = process.env.AI_MODEL || 'glm-5.3-flash'
// glm-5 系列为“始终思考”模型：用 low 档控制成本与延迟；设 AI_THINKING_EFFORT=off 可关闭注入
const GLM_THINKING_EFFORT = process.env.AI_THINKING_EFFORT || 'low'

export function getAiMode(): AiMode {
  const key = process.env.AI_API_KEY
  const mode = process.env.AI_MODE
  if (mode === 'glm' && key) return 'glm'
  return 'mock'
}

function mockChat(messages: AiChatMessage[]): AiResult {
  const last = messages[messages.length - 1]?.content ?? ''
  const isB超 = /b超|b 超|超声|产检单|报告单/.test(last)
  const content = isB超
    ? '【模拟模式】这份产检单的关键指标已识别（接入真实 AI 后将逐项解读）：胎儿数据、羊水指数、胎心率、脐血流。一般关注点：1) 指标是否在孕周正常范围；2) 医生结论栏的提示词。请以产检医生当面解释为准。'
    : '【模拟模式】这是 AI 问答的占位回复。接入 GLM 免费档后（AI_MODE=glm + AI_API_KEY），我将基于孕产知识库回答：孕期营养、爸爸陪产技巧、待产准备、产检流程等问题。'
  return { ok: true, content, mode: 'mock' }
}

// 调用 GLM（OpenAI 兼容协议）；enableWebSearch 时启用智谱内置 web_search 工具（免费可用）
async function glmChat(messages: AiChatMessage[], maxTokens: number, enableWebSearch = false): Promise<AiResult> {
  const key = process.env.AI_API_KEY
  if (!key) return { ok: false, content: '', mode: 'mock', error: 'AI_API_KEY 未配置' }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 45000)
    const body: Record<string, unknown> = {
      model: GLM_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.6,
    }
    // glm-5.* 始终思考模型：必须显式传 thinking，否则报 1210；effort=low 控制成本
    if (GLM_THINKING_EFFORT !== 'off' && /^glm-5\./.test(GLM_MODEL)) {
      body.thinking = { type: 'enabled', clear_thinking: false, effort: GLM_THINKING_EFFORT }
    }
    // 联网搜索：智谱内置 web_search 工具，返回带来源链接的实时信息
    if (enableWebSearch) {
      body.tools = [{ type: 'web_search', web_search: { enable: true, search_result: true } }]
    }
    const res = await fetch(GLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) {
      return { ok: false, content: '', mode: 'glm', error: `GLM HTTP ${res.status}` }
    }
    const json = await res.json()
    const content = json?.choices?.[0]?.message?.content
    if (!content) return { ok: false, content: '', mode: 'glm', error: 'GLM 返回为空' }
    // 提取 web_search 引用来源（title/link/media/publish_date）
    const rawSources: Array<Record<string, string>> = Array.isArray(json?.web_search) ? json.web_search : []
    const sources = rawSources
      .filter(s => s && (s.link || s.url))
      .slice(0, 5)
      .map(s => ({ title: (s.title || '来源').slice(0, 60), link: s.link || s.url, media: s.media || undefined, publish_date: s.publish_date || undefined }))
    return {
      ok: true,
      content,
      mode: 'glm',
      usage: json?.usage,
      sources: sources.length ? sources : undefined,
    }
  } catch (error) {
    return { ok: false, content: '', mode: 'glm', error: error instanceof Error ? error.message : 'AI 调用失败' }
  }
}

// 产检单拍照识删：glm-4.5v 视觉模型提取报告单文字（实测支持 base64 dataURL；外链图会报 1210）
export async function glmVision(imageDataUrl: string, prompt: string): Promise<{ ok: boolean; text: string; error?: string }> {
  const key = process.env.AI_API_KEY
  if (!key) return { ok: false, text: '', error: 'AI_API_KEY 未配置' }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 60000)
    const body = {
      model: 'glm-4.5v',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageDataUrl } },
            { type: 'text', text: prompt },
          ],
        },
      ],
      max_tokens: 2048,
      temperature: 0.3,
    }
    const res = await fetch(GLM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return { ok: false, text: '', error: `GLM vision HTTP ${res.status}` }
    const json = await res.json()
    const text = json?.choices?.[0]?.message?.content
    if (!text) return { ok: false, text: '', error: 'GLM vision 返回为空' }
    return { ok: true, text }
  } catch (error) {
    return { ok: false, text: '', error: error instanceof Error ? error.message : '视觉识别失败' }
  }
}

const YUNDAD_SYSTEM_PROMPT = `你是"孕爸爸"App 的 AI 助手，服务对象是孕期准爸爸。职责：
1. 解答孕期常识、陪产技巧、待产准备、产检流程、营养搭配；
2. 帮助解读产检报告单中的常见指标（只能解释指标含义与一般参考范围，不做诊断）；
3. 鼓励爸爸参与孕产照护，语气温暖专业。
硬性规则：
- 不做任何医疗诊断，不推荐具体药物与剂量；
- 涉及异常指标、腹痛出血等紧急情况，必须建议立即就医；
- 回答末尾固定加一句："以上仅供参考，具体请遵医嘱。"`

export async function aiChat(
  messages: AiChatMessage[],
  options: { maxTokens?: number; systemPrompt?: string; enableWebSearch?: boolean } = {}
): Promise<AiResult> {
  const mode = getAiMode()
  const full: AiChatMessage[] = [
    { role: 'system', content: options.systemPrompt ?? YUNDAD_SYSTEM_PROMPT },
    ...messages.slice(-10), // 上下文最多10条，控制免费档token
  ]
  if (mode === 'mock') return mockChat(messages)
  return glmChat(full, options.maxTokens ?? 1024, options.enableWebSearch ?? false)
}

// 产检单解读专用 prompt（结构化输出）
export const REPORT_PROMPT = `请解读这份产检报告单。输出格式：
【报告概览】一两句概括
【关键指标】逐项列出：指标名 | 数值 | 一般参考范围 | 是否在常见范围内
【建议关注】2-3条
【就医提示】出现什么情况应立即就医
要求：口语化，让准爸爸能看懂；不诊断疾病；结尾加"以上仅供参考，具体请遵医嘱。"`
