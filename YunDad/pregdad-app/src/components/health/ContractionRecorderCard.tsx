import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

interface Contraction {
  id: string
  frequency: number
  duration: number
  intensity: string
  startTime: string
}

interface ContractionRecorderCardProps {
  userId: string
}

export function ContractionRecorderCard({ userId }: ContractionRecorderCardProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [contractions, setContractions] = useState<number[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [todayContractions, setTodayContractions] = useState<Contraction[]>([])
  const [intensity, setIntensity] = useState('mild')
  const [loading, setLoading] = useState(true)

  const fetchToday = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/contractions?userId=${userId}&today=true`)
      const data = await res.json()
      if (data.success) {
        setTodayContractions(data.data)
      }
    } catch (e) {
      console.error('Failed to fetch contractions:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchToday()
  }, [userId])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRecording) {
      interval = setInterval(() => {
        setElapsedTime(p => p + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const startRecording = () => {
    setIsRecording(true)
    setStartTime(new Date())
    setContractions([])
    setElapsedTime(0)
  }

  const recordContraction = () => {
    setContractions(prev => [...prev, Date.now()])
  }

  const stopRecording = async () => {
    if (!startTime) return
    
    const intervals = contractions.length > 1 
      ? contractions.slice(1).map((t, i) => t - contractions[i]) 
      : []
    const avgInterval = intervals.length > 0 
      ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length / 1e3) 
      : 0

    try {
      const res = await fetch('/api/contractions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          startTime: startTime.toISOString(),
          endTime: new Date().toISOString(),
          frequency: contractions.length,
          duration: elapsedTime,
          interval: avgInterval,
          intensity,
          isCompleted: true
        })
      })
      const data = await res.json()
      if (data.success) {
        setTodayContractions([data.data, ...todayContractions])
      }
    } catch (e) {
      console.error('Failed to save contraction:', e)
    }

    setIsRecording(false)
    setStartTime(null)
    setContractions([])
    setElapsedTime(0)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const intensityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    mild: { label: '轻微', color: '#2E7D32', bgColor: '#E8F5E9' },
    moderate: { label: '中等', color: '#F57F17', bgColor: '#FFF8E1' },
    strong: { label: '强烈', color: '#C62828', bgColor: '#FFEBEE' }
  }

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* 主卡片 */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>宫缩记录</Text>
          <Text style={styles.subtitle}>今日宫缩: {todayContractions.length} 次</Text>
        </View>

        <View style={styles.content}>
          {!isRecording ? (
            <View style={styles.idleContainer}>
              <Text style={styles.idleText}>记录宫缩情况</Text>
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
              <Text style={styles.timerText}>记录时长: {formatTime(elapsedTime)}</Text>
              <Text style={styles.countText}>{contractions.length}</Text>
              <Text style={styles.countLabel}>次宫缩</Text>
              
              <TouchableOpacity 
                onPress={recordContraction} 
                style={styles.recordButton}
                activeOpacity={0.8}
              >
                <Text style={styles.recordButtonText}>有宫缩</Text>
              </TouchableOpacity>

              {/* 强度选择 */}
              <View style={styles.intensityRow}>
                {(Object.keys(intensityConfig) as Array<'mild' | 'moderate' | 'strong'>).map(i => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setIntensity(i)}
                    style={[
                      styles.intensityButton,
                      intensity === i && { backgroundColor: intensityConfig[i].bgColor }
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.intensityButtonText,
                      intensity === i && { color: intensityConfig[i].color }
                    ]}>
                      {intensityConfig[i].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

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

      {/* 今日记录 */}
      {todayContractions.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.historyTitle}>今日记录</Text>
          {todayContractions.slice(0, 5).map(c => (
            <View key={c.id} style={styles.historyItem}>
              <Text style={styles.historyCount}>
                {c.frequency} 次 <Text style={styles.historyDuration}>· {formatTime(c.duration)}</Text>
              </Text>
              <View style={[
                styles.intensityBadge,
                { backgroundColor: intensityConfig[c.intensity]?.bgColor || '#f0f0f0' }
              ]}>
                <Text style={[
                  styles.intensityBadgeText,
                  { color: intensityConfig[c.intensity]?.color || '#666' }
                ]}>
                  {intensityConfig[c.intensity]?.label || c.intensity}
                </Text>
              </View>
            </View>
          ))}
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
  loadingText: {
    textAlign: 'center',
    paddingVertical: 24,
    color: '#888',
  },
  idleContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  idleText: {
    fontSize: 15,
    color: '#888',
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#9C27B0',
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
    marginBottom: 10,
  },
  countText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 4,
  },
  countLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  recordButton: {
    backgroundColor: '#9C27B0',
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 12,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 12,
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  intensityButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
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
  },
  intensityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  intensityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
})
