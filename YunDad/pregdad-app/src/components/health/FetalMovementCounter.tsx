import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'

interface FetalMovement {
  id: string
  userId: string
  count: number
  duration: number
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
    let interval: ReturnType<typeof setInterval>
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
    <View style={styles.container}>
      {/* 主卡片 */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>胎动计数器</Text>
          <Text style={styles.subtitle}>今日累计: {todayTotal} 次</Text>
        </View>

        <View style={styles.content}>
          {!isRecording ? (
            <View style={styles.idleContainer}>
              <Text style={styles.idleText}>点击开始记录胎动</Text>
              <TouchableOpacity 
                onPress={startRecording} 
                style={styles.startButton}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>开始记录</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.recordingContainer}>
              <Text style={styles.timerText}>计时: {formatTime(elapsedTime)}</Text>
              <Text style={styles.countText}>{count}</Text>
              <Text style={styles.countLabel}>次胎动</Text>
              
              <TouchableOpacity 
                onPress={incrementCount} 
                style={styles.countButton}
                activeOpacity={0.8}
              >
                <Text style={styles.countButtonText}>感受到胎动 点这里</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={stopRecording} 
                style={styles.stopButton}
                activeOpacity={0.8}
              >
                <Text style={styles.stopButtonText}>完成记录</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* 历史记录 */}
      {history.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.historyTitle}>最近记录</Text>
          <ScrollView style={styles.historyList}>
            {history.slice(0, 5).map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View>
                  <Text style={styles.historyCount}>{item.count} 次</Text>
                  <Text style={styles.historyDuration}>{item.duration} 分钟</Text>
                </View>
                <View style={styles.historyDateBadge}>
                  <Text style={styles.historyDateText}>
                    {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
  },
  content: {},
  idleContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  idleText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  timerText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
  },
  countText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
  },
  countLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  countButton: {
    backgroundColor: '#4CAF50',
    width: '100%',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 16,
  },
  countButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
  },
  stopButtonText: {
    color: '#666',
    fontSize: 15,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  historyCount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  historyDuration: {
    fontSize: 13,
    color: '#888',
    marginLeft: 8,
  },
  historyDateBadge: {
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyDateText: {
    fontSize: 11,
    color: '#666',
  },
})
