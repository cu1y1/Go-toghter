"use client"
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton, ErrorMessage } from '@/lib/use-async'
import { toast } from 'sonner'

interface Contraction { id: string; frequency: number; duration: number; intensity: string; startTime: string }

export function ContractionRecorder({ userId }: { userId: string }) {
  const [isRecording, setIsRecording] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [contractions, setContractions] = useState<number[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [todayContractions, setTodayContractions] = useState<Contraction[]>([])
  const [intensity, setIntensity] = useState('mild')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchToday = async () => { setLoading(true); setError(null); try { const res = await fetch(`/api/contractions?userId=${userId}&today= true`); const data = await res.json(); if(data.success) setTodayContractions(data.data); else throw new Error(data.error) } catch(e:any){ setError(e.message) } finally{ setLoading(false) } }
  useEffect(() => { fetchToday() }, [userId])

  useEffect(() => { if(isRecording){ timerRef.current = setInterval(()=>setElapsedTime(p=>p+1),1000) } else { if(timerRef.current) clearInterval(timerRef.current) } return()=>{ if(timerRef.current) clearInterval(timerRef.current) } }, [isRecording])

  const startRecording = () => { setIsRecording(true); setStartTime(new Date()); setContractions([]); setElapsedTime(0) }
  const recordContraction = () => setContractions(prev => [...prev, Date.now()])
  
  const stopRecording = async () => { if(!startTime) return; const intervals = contractions.length>1?contractions.slice(1).map((t,i)=>t-contractions[i]):[]; const avgInterval=intervals.length>0?Math.round(intervals.reduce((a,b)=>a+b,0)/intervals.length/1e3):0; try{ const res=await fetch('/api/contractions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userId,startTime:startTime.toISOString(),endTime:new Date().toISOString(),frequency:contractions.length,duration:elapsedTime,interval:avgInterval,intensity,isCompleted:true})}); const data=await res.json(); if(data.success){setTodayContractions([data.data,...todayContractions]); toast.success('已保存')}else throw new Error(data.error) }catch(e){toast.error('保存失败')} setIsRecording(false); setStartTime(null); setContractions([]); setElapsedTime(0) }
  const formatTime = (s:number)=>`${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`
  const intensityColor:Record<string,string> = {mild:'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',moderate:'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',strong:'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'}

  if(loading) return <CardSkeleton />
  if(error) return <Card><ErrorMessage message={error} onRetry={fetchToday}/></Card>

  return (<div className="space-y-4">
    <Card><CardHeader className="pb-2"><CardTitle className="text-lg">宫缩记录</CardTitle><p className="text-sm text-muted-foreground">今日宫缩: {todayContractions.length} 次</p></CardHeader>
      <CardContent>{!isRecording? <div className="text-center py-6"><p className="text-muted-foreground mb-4">记录宫缩情况</p><Button onClick={startRecording} size="lg" className="bg-purple-500 hover:bg-purple-600">开始记录</Button></div>:
        <div className="text-center py-4"><p className="text-sm text-muted-foreground">记录时长: {formatTime(elapsedTime)}</p><div className="text-5xl font-bold text-purple-600 my-4">{contractions.length}</div><p className="text-sm text-muted-foreground mb-4">次宫缩</p><Button onClick={recordContraction} size="lg" className="bg-purple-500 hover:bg-purple-600 w-full h-14 text-lg mb-3">有宫缩</Button><div className="flex gap-2 mb-3">{(['mild','moderate','strong'] as const).map(i=><button key={i} onClick={()=>setIntensity(i)} className={`flex-1 py-2 rounded text-sm ${intensity===i?intensityColor[i]:'bg-muted'}`}>{i==='mild'?'轻微':i==='moderate'?'中等':'强烈'}</button>)}</div><Button onClick={stopRecording} variant="outline" className="w-full">完成记录</Button></div>}</CardContent></Card>
    {todayContractions.length>0 && <Card><CardHeader><CardTitle className="text-base">今日记录</CardTitle></CardHeader><CardContent className="space-y-2">{todayContractions.slice(0,5).map(c=><div key={c.id} className="flex justify-between items-center p-2 bg-muted rounded"><span className="font-medium">{c.frequency} 次 <span className="text-muted-foreground text-sm">· {formatTime(c.duration)}</span></span><Badge className={intensityColor[c.intensity]}>{c.intensity==='mild'?'轻微':c.intensity==='moderate'?'中等':'强烈'}</Badge></div>)}</CardContent></Card>}</div>)
}