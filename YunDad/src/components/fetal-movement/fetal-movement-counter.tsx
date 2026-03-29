"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface FetalMovement {
  id: string
  userId: string
  count: number
  duration: number // 分钟
  notes: string
  createdAt: string
}

interface FetalMovementCounterProps {
  userId: string
}

export function FetalMovementCounter({ userId }: FetalMovementCounterProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [count, setCount] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [history, setHistory] = useState<FetalMovement[]>([])
  const [todayTotal, setTodayTotal] = useState(0)

  // 获取历史记录
  useEffect(() => {
    fetch(`/api/fetal-movements?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHistory(data.data)
          // 计算今日总计
          const today = new Date().toDateString()
          const todayMovements = data.data.filter(
            (m: FetalMovement) => new Date(m.createdAt).toDateString() === today
          )
          setTodayTotal(todayMovements.reduce((sum: number, m: FetalMovement) => sum + m.count, 0))
        }
      })
  }, [userId])

  // 计时器
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        if (startTime) {
          setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording, startTime])

  const startRecording = () => {
    setIsRecording(true)
    setCount(0)
    setStartTime(new Date())
    setElapsedTime(0)
  }

  const incrementCount = () => {
    setCount(prev => prev + 1)
  }

  const stopRecording = async () => {
    setIsRecording(false)
    
    const movement = {
      userId,
      count,
      duration: Math.ceil(elapsedTime / 60),
      notes: '',
    }

    try {
      const res = await fetch('/api/fetal-movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movement),
      })
      const data = await res.json()
      if (data.success) {
        setHistory(prev => [data.data, ...prev])
        setTodayTotal(prev => prev + count)
      }
    } catch (error) {
      console.error('Failed to save movement:', error)
    }

    setCount(0)
    setStartTime(null)
    setElapsedTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">胎动计数器</CardTitle>
          <p className="text-sm text-gray-500">今日累计: {todayTotal} 次</p>
        </CardHeader>
        <CardContent>
          {!isRecording ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">点击开始记录胎动</p>
              <Button onClick={startRecording} size="lg" className="bg-green-500 hover:bg-green-600">
                开始记录
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-2">计时: {formatTime(elapsedTime)}</p>
              <div className="text-6xl font-bold text-green-600 mb-4">{count}</div>
              <p className="text-sm text-gray-500 mb-4">次胎动</p>
              <Button 
                onClick={incrementCount} 
                size="lg" 
                className="bg-green-500 hover:bg-green-600 w-full h-16 text-xl mb-4"
              >
                感受到胎动 点这里
              </Button>
              <Button onClick={stopRecording} variant="outline" className="w-full">
                完成记录
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 历史记录 */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近记录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{item.count} 次</span>
                  <span className="text-gray-500 text-sm ml-2">{item.duration} 分钟</span>
                </div>
                <Badge variant="outline">
                  {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}