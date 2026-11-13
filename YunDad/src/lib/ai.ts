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
  error?: string
}

const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
// 免费档模型：glm-4-flash（智谱宣布免费）；备选 glm-4-flash-250414
const GLM_MODEL = process.env.AI_MODEL || 'glm-4-flash'

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

// 调用 GLM（OpenAI 兼容协议）
async function glmChat(messages: AiChatMessage[], maxTokens: number): Promise<AiResult> {
  const key = process.env.AI_API_KEY
  if (!key) return { ok: false, content: '', mode: 'mock', error: 'AI_API_KEY 未配置' }
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    const res = await fetch(GLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GLM_MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: 0.6,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) {
      return { ok: false, content: '', mode: 'glm', error: `GLM HTTP ${res.status}` }
    }
    const json = await res.json()
    const content = json?.choices?.[0]?.message?.content
    if (!content) return { ok: false, content: '', mode: 'glm', error: 'GLM 返回为空' }
    return {
      ok: true,
      content,
      mode: 'glm',
      usage: json?.usage,
    }
  } catch (error) {
    return { ok: false, content: '', mode: 'glm', error: error instanceof Error ? error.message : 'AI 调用失败' }
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
  options: { maxTokens?: number; systemPrompt?: string } = {}
): Promise<AiResult> {
  const mode = getAiMode()
  const full: AiChatMessage[] = [
    { role: 'system', content: options.systemPrompt ?? YUNDAD_SYSTEM_PROMPT },
    ...messages.slice(-10), // 上下文最多10条，控制免费档token
  ]
  if (mode === 'mock') return mockChat(messages)
  return glmChat(full, options.maxTokens ?? 1024)
}

// 产检单解读专用 prompt（结构化输出）
export const REPORT_PROMPT = `请解读这份产检报告单。输出格式：
【报告概览】一两句概括
【关键指标】逐项列出：指标名 | 数值 | 一般参考范围 | 是否在常见范围内
【建议关注】2-3条
【就医提示】出现什么情况应立即就医
要求：口语化，让准爸爸能看懂；不诊断疾病；结尾加"以上仅供参考，具体请遵医嘱。"`
