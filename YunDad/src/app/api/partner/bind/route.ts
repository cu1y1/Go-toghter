// 准爸妈绑定：8位数字邀请码方案
// 流程：任一方生成邀请码(10分钟有效) → 对方输入码 → 建立 Couple 关系（数据库层硬约束一人一条）
// 数据模型：BindCode（邀请码 pending→bound）+ Couple（绑定关系，@@unique 防一人多绑）

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId, unauthorized } from '@/lib/auth'
import { db } from '@/lib/db'

const TTL_MINUTES = 10

function expired(d: Date): boolean {
  return new Date(d).getTime() < Date.now()
}

// POST /api/partner/bind - { action: 'create' | 'join' | 'status' | 'unbind' }
export async function POST(request: NextRequest) {
  try {
    const userId = getAuthUserId(request)
    if (!userId) return unauthorized()

    const body = await request.json()
    const action = body.action

    // ---------- 查询绑定状态 ----------
    if (action === 'status') {
      const couple = await db.couple.findFirst({
        where: { status: 'active', OR: [{ partnerAId: userId }, { partnerBId: userId }] },
        orderBy: { createdAt: 'desc' },
      })
      if (!couple) return NextResponse.json({ success: true, data: { bound: false } })
      const partnerId = couple.partnerAId === userId ? couple.partnerBId : couple.partnerAId
      return NextResponse.json({ success: true, data: { bound: true, partnerId, boundAt: couple.createdAt } })
    }

    // ---------- 生成邀请码 ----------
    if (action === 'create') {
      // 已绑定则不允许再生成
      const existed = await db.couple.findFirst({
        where: { status: 'active', OR: [{ partnerAId: userId }, { partnerBId: userId }] },
      })
      if (existed) {
        return NextResponse.json({ success: false, error: '您已绑定另一半，无需再生成邀请码' }, { status: 409 })
      }
      // 未过期的 pending 码复用
      const pending = await db.bindCode.findFirst({
        where: { creatorId: userId, status: 'pending', expiresAt: { gt: new Date() } },
      })
      if (pending) {
        return NextResponse.json({
          success: true,
          data: { code: pending.code, expiresAt: pending.expiresAt, ttlMinutes: TTL_MINUTES },
        })
      }
      // 旧 pending 码作废（一人一条 pending 的硬约束）
      await db.bindCode.updateMany({ where: { creatorId: userId, status: 'pending' }, data: { status: 'expired' } })
      // 生成8位数字码，唯一冲突重试
      for (let i = 0; i < 5; i++) {
        const code = String(Math.floor(10000000 + Math.random() * 90000000))
        try {
          const row = await db.bindCode.create({
            data: {
              code,
              creatorId: userId,
              expiresAt: new Date(Date.now() + TTL_MINUTES * 60 * 1000),
            },
          })
          return NextResponse.json({
            success: true,
            data: { code: row.code, expiresAt: row.expiresAt, ttlMinutes: TTL_MINUTES },
          })
        } catch { /* code 冲突重试 */ }
      }
      return NextResponse.json({ success: false, error: '生成邀请码失败，请重试' }, { status: 500 })
    }

    // ---------- 输码绑定 ----------
    if (action === 'join') {
      const code = typeof body.code === 'string' ? body.code.trim() : ''
      if (!/^\d{8}$/.test(code)) {
        return NextResponse.json({ success: false, error: '邀请码为8位数字' }, { status: 400 })
      }
      const row = await db.bindCode.findUnique({ where: { code } })
      if (!row) return NextResponse.json({ success: false, error: '邀请码不存在' }, { status: 404 })
      if (row.status !== 'pending') {
        return NextResponse.json({ success: false, error: '该邀请码已被使用' }, { status: 409 })
      }
      if (expired(row.expiresAt)) {
        return NextResponse.json({ success: false, error: '邀请码已过期，请让对方重新生成' }, { status: 410 })
      }
      if (row.creatorId === userId) {
        return NextResponse.json({ success: false, error: '不能绑定自己' }, { status: 400 })
      }
      // 双方任一已有有效绑定则拒绝
      const busy = await db.couple.findFirst({
        where: {
          status: 'active',
          OR: [{ partnerAId: userId }, { partnerBId: userId }, { partnerAId: row.creatorId }, { partnerBId: row.creatorId }],
        },
      })
      if (busy) {
        const busyIsCreator = busy.partnerAId === row.creatorId || busy.partnerBId === row.creatorId
        return NextResponse.json(
          { success: false, error: busyIsCreator ? '对方已绑定另一半' : '您已绑定另一半' },
          { status: 409 }
        )
      }
      // 事务：码置 bound + 建立 Couple
      await db.$transaction([
        db.bindCode.update({ where: { id: row.id }, data: { status: 'bound', partnerId: userId } }),
        db.couple.create({ data: { partnerAId: row.creatorId, partnerBId: userId } }),
      ])
      return NextResponse.json({ success: true, data: { partnerId: row.creatorId, boundAt: new Date().toISOString() } })
    }

    // ---------- 解绑（双向确认一期简化为单方解绑，关系作废） ----------
    if (action === 'unbind') {
      const couple = await db.couple.findFirst({
        where: { status: 'active', OR: [{ partnerAId: userId }, { partnerBId: userId }] },
      })
      if (!couple) return NextResponse.json({ success: false, error: '当前无绑定关系' }, { status: 404 })
      await db.couple.update({ where: { id: couple.id }, data: { status: 'dissolved' } })
      return NextResponse.json({ success: true, data: { unbound: true } })
    }

    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 })
  } catch (error) {
    console.error('准爸妈绑定失败:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
