// 准爸妈绑定：8位数字邀请码方案（最简可用）
// 流程：爸爸生成邀请码(10分钟有效) → 妈妈小程序/端输入码 → 绑定为夫妻关系
// MVP 先做单端模型：绑定关系存 BindCode 表，妈妈端 App 版二期跟进（微信小程序端需单独审核）

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getAuthUserId, unauthorized } from '@/lib/auth'

const prisma = new PrismaClient()

// 确保表存在（免 migration 阻塞）
async function ensureTable() {
  await prisma.$executeRawUnsafe(
    `CREATE TABLE IF NOT EXISTS BindCode (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE,
      creatorId TEXT,
      partnerId TEXT,
      status TEXT DEFAULT 'pending',
      expiresAt DATETIME,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  )
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS idx_bindcode_creator ON BindCode(creatorId)`).catch(() => {})
}

// POST /api/partner/bind - { action: 'create' | 'join' | 'status' }
// create: 生成我的邀请码；join: { code } 输入对方邀请码绑定；status: 查询绑定状态
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()
    await ensureTable()

    const body = await request.json()
    const action = body.action

    if (action === 'create') {
      // 已有未过期码则复用
      const existing = await prisma.$queryRawUnsafe<Array<{ code: string; expiresAt: Date }>>(
        `SELECT code, expiresAt FROM BindCode WHERE creatorId = ? AND status = 'pending' AND expiresAt > datetime('now') LIMIT 1`,
        userId
      )
      if (existing.length) {
        return NextResponse.json({ success: true, data: { code: existing[0].code, expiresAt: existing[0].expiresAt } })
      }
      // 生成8位数字码，冲突重试
      for (let i = 0; i < 5; i++) {
        const code = String(Math.floor(10000000 + Math.random() * 90000000))
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
        try {
          await prisma.$executeRawUnsafe(
            `INSERT INTO BindCode (id, code, creatorId, status, expiresAt) VALUES (?, ?, ?, 'pending', ?)`,
            `bc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, code, userId, expiresAt.toISOString()
          )
          return NextResponse.json({ success: true, data: { code, expiresAt, ttlMinutes: 10 } })
        } catch { /* code冲突重试 */ }
      }
      return NextResponse.json({ success: false, error: '生成邀请码失败，请重试' }, { status: 500 })
    }

    if (action === 'join') {
      const code = typeof body.code === 'string' ? body.code.trim() : ''
      if (!/^\d{8}$/.test(code)) {
        return NextResponse.json({ success: false, error: '邀请码为8位数字' }, { status: 400 })
      }
      const rows = await prisma.$queryRawUnsafe<Array<{ id: string; creatorId: string; status: string; expiresAt: Date }>>(
        `SELECT id, creatorId, status, expiresAt FROM BindCode WHERE code = ? LIMIT 1`,
        code
      )
      if (!rows.length) return NextResponse.json({ success: false, error: '邀请码不存在' }, { status: 404 })
      const row = rows[0]
      if (new Date(row.expiresAt).getTime() < Date.now()) {
        return NextResponse.json({ success: false, error: '邀请码已过期，请让对方重新生成' }, { status: 410 })
      }
      if (row.creatorId === userId) {
        return NextResponse.json({ success: false, error: '不能绑定自己' }, { status: 400 })
      }
      if (row.status === 'bound') {
        return NextResponse.json({ success: false, error: '该邀请码已被使用' }, { status: 409 })
      }
      // 绑定：双向记录（partnerId 记对方；creator 的码置 bound）
      await prisma.$executeRawUnsafe(
        `UPDATE BindCode SET status = 'bound', partnerId = ? WHERE id = ?`,
        userId, row.id
      )
      // 把对方的绑定信息也记一条（反向查询用）
      await prisma.$executeRawUnsafe(
        `INSERT OR REPLACE INTO BindCode (id, code, creatorId, partnerId, status, expiresAt, createdAt)
         VALUES (?, ?, ?, ?, 'bound', ?, CURRENT_TIMESTAMP)`,
        `bc_rev_${row.id}`, code, userId, row.creatorId, row.expiresAt
      )
      return NextResponse.json({ success: true, data: { partnerId: row.creatorId, boundAt: new Date().toISOString() } })
    }

    if (action === 'status') {
      const rows = await prisma.$queryRawUnsafe<Array<{ creatorId: string; partnerId: string | null; status: string }>>(
        `SELECT creatorId, partnerId, status FROM BindCode WHERE (creatorId = ? OR partnerId = ?) AND status = 'bound' ORDER BY createdAt DESC LIMIT 1`,
        userId, userId
      )
      if (!rows.length) return NextResponse.json({ success: true, data: { bound: false } })
      const r = rows[0]
      return NextResponse.json({
        success: true,
        data: { bound: true, partnerId: r.creatorId === userId ? r.partnerId : r.creatorId },
      })
    }

    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 })
  } catch (error) {
    console.error('准爸妈绑定失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
