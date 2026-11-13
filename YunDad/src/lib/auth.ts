import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual, randomUUID } from 'crypto'

/**
 * 轻量鉴权（零新增依赖）：
 * - token = base64url(payload).hmac-sha256(payload)
 * - 密码 = 加盐 HMAC（s1$<salt>$<hex>），不存明文
 * 生产部署必须设置 AUTH_SECRET 环境变量（不落库、不入仓）
 */
const SECRET = process.env.AUTH_SECRET || 'yundad-dev-secret-change-in-production'
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30 // 30 天

function base64url(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function signPayload(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('base64url')
}

/** 签发 token */
export function createToken(userId: string): string {
  const payload = base64url(
    Buffer.from(
      JSON.stringify({
        uid: userId,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
        jti: randomUUID(),
      })
    )
  )
  return `${payload}.${signPayload(payload)}`
}

/** 校验 token，合法返回 userId，否则 null */
export function verifyToken(token: string | null | undefined): string | null {
  if (!token) return null
  const raw = token.startsWith('Bearer ') ? token.slice(7) : token
  const dot = raw.lastIndexOf('.')
  if (dot <= 0) return null
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  const expected = signPayload(payload)
  if (sig.length !== expected.length) return null
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data?.uid || typeof data.exp !== 'number') return null
    if (data.exp < Math.floor(Date.now() / 1000)) return null
    return String(data.uid)
  } catch {
    return null
  }
}

/** 从请求头解析 Bearer token 并校验，返回 userId 或 null */
export function getAuthUserId(request: NextRequest | Request): string | null {
  return verifyToken(request.headers.get('authorization'))
}

/** 401 统一响应 */
export function unauthorized(): NextResponse {
  return NextResponse.json({ success: false, error: '未登录或登录已过期' }, { status: 401 })
}

/** 403 统一响应（资源不属于该用户） */
export function forbidden(): NextResponse {
  return NextResponse.json({ success: false, error: '无权访问该资源' }, { status: 403 })
}

/** 密码哈希：s1$<salt>$<hmac> */
export function hashPassword(password: string, salt = randomUUID()): string {
  const digest = createHmac('sha256', salt).update(password).digest('hex')
  return `s1$${salt}$${digest}`
}

/** 校验密码 */
export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored) return false
  const parts = stored.split('$')
  if (parts.length !== 3 || parts[0] !== 's1') return false
  const digest = createHmac('sha256', parts[1]).update(password).digest('hex')
  if (digest.length !== parts[2].length) return false
  return timingSafeEqual(Buffer.from(digest), Buffer.from(parts[2]))
}
