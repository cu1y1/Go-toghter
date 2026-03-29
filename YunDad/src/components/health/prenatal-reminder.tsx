"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { CardSkeleton, ErrorMessage } from '@/lib/use-async'
import { toast } from 'sonner'

interface PrenatalVisit {
  id: string
  userId: string
  visitDate: string
  week: number
  hospital?: string
  doctor?: string
  isCompleted: boolean
}

export function PrenatalReminder({ userId }: { userId: string }) {
  const [visits, setVisits] = useState<PrenatalVisit[]>([])
  const [upcomingVisits, setUpcomingVisits] = useState<PrenatalVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ visitDate: '', week: '', hospital: '', doctor: '', nextVisitDate: '' })

  const fetchVisits = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/visits?userId=${userId}`)
      const data = await res.json()
      if (data.success) {
        setVisits(data.data)
        setUpcomingVisits(data.data.filter((v: PrenatalVisit) => new Date(v.visitDate) >= new Date() && !v.isCompleted))
      } else throw new Error(data.error)
    } catch (err: any) { setError(err.message || '加载失败') }
    finally { setLoading(false) }
  }, [userId])

  useEffect(() => { fetchVisits() }, [fetchVisits])

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/prenatal-visits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, userId, week: parseInt(formData.week) }) })
      const data = await res.json()
      if (data.success) {
        setVisits([data.data, ...visits])
        if (new Date(data.data.visitDate) >= new Date()) setUpcomingVisits([data.data, ...upcomingVisits])
        setIsDialogOpen(false); setFormData({ visitDate: '', week: '', hospital: '', doctor: '', nextVisitDate: '' })
        toast.success('添加成功')
      } else throw new Error(data.error)
    } catch (err: any) { toast.error(err.message || '添加失败') }
  }

  const markCompleted = async (id: string) => {
    try {
      await fetch(`/api/prenatal-visits/${id}`, { method: 'PATCH', body: JSON.stringify({ isCompleted: true }) })
      setVisits(visits.map(v => v.id === id ? { ...v, isCompleted: true } : v))
      setUpcomingVisits(upcomingVisits.filter(v => v.id !== id))
      toast.success('已完成产检')
    } catch (err) { toast.error('操作失败') }
  }

  const getDaysUntil = (date: string) => Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1e3 * 60 * 60 * 24))

  if (loading) return <CardSkeleton />
  if (error) return <Card><ErrorMessage message={error} onRetry={fetchVisits} /></Card>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">产检提醒</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingVisits.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground"><p>暂无 upcoming 产检</p></div>
          ) : (
            <div className="space-y-2">
              {upcomingVisits.slice(0, 3).map(visit => {
                const days = getDaysUntil(visit.visitDate)
                return (
                  <div key={visit.id} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-2xl">
                    <div>
                      <p className="font-medium">{visit.hospital || '产检'}</p>
                      <p className="text-sm text-muted-foreground">{new Date(visit.visitDate).toLocaleDateString('zh- CN')} · 孕{visit.week}周</p>
                    </div>
                    <div className="text-right">
                      {days <= 7 ? <Badge variant="destructive">{days}天后</Badge> : <Badge>{days}天后</Badge>}
                      <button onClick={() => markCompleted(visit.id)} className="block text-xs text-green-600 mt-1">已完成</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild><Button className="w-full">添加产检记录</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>添加产检记录</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>产检日期</Label><Input type="date" value={formData.visitDate} onChange={e => setFormData({...formData, visitDate: e.target.value})} /></div>
            <div><Label>孕周</Label><Input type="number" value={formData.week} onChange={e => setFormData({...formData, week: e.target.value})} placeholder="如: 24" /></div>
            <div><Label>医院</Label><Input value={formData.hospital} onChange={e => setFormData({...formData, hospital: e.target.value})} placeholder="如: 第一医院" /></div>
            <div><Label>医生</Label><Input value={formData.doctor} onChange={e => setFormData({...formData, doctor: e.target.value})} placeholder="可选" /></div>
            <div><Label>下次产检日期</Label><Input type="date" value={formData.nextVisitDate} onChange={e => setFormData({...formData, nextVisitDate: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSubmit}>保存</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}