import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native'

interface PrenatalVisit {
  id: string
  userId: string
  visitDate: string
  week: number
  hospital?: string
  doctor?: string
  isCompleted: boolean
}

interface PrenatalReminderCardProps {
  userId: string
}

export function PrenatalReminderCard({ userId }: PrenatalReminderCardProps) {
  const [visits, setVisits] = useState<PrenatalVisit[]>([])
  const [upcomingVisits, setUpcomingVisits] = useState<PrenatalVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    visitDate: '',
    week: '',
    hospital: '',
    doctor: ''
  })

  const fetchVisits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/prenatal-visits?userId=${userId}`)
      const data = await res.json()
      if (data.success) {
        setVisits(data.data)
        setUpcomingVisits(
          data.data.filter((v: PrenatalVisit) => 
            new Date(v.visitDate) >= new Date() && !v.isCompleted
          )
        )
      }
    } catch (err) {
      console.error('Failed to fetch visits:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchVisits()
  }, [fetchVisits])

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/prenatal-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          week: parseInt(formData.week) || 0
        })
      })
      const data = await res.json()
      if (data.success) {
        setVisits([data.data, ...visits])
        if (new Date(data.data.visitDate) >= new Date()) {
          setUpcomingVisits([data.data, ...upcomingVisits])
        }
        setIsModalOpen(false)
        setFormData({ visitDate: '', week: '', hospital: '', doctor: '' })
      }
    } catch (err) {
      console.error('Failed to add visit:', err)
    }
  }

  const markCompleted = async (id: string) => {
    try {
      await fetch(`/api/prenatal-visits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true })
      })
      setVisits(visits.map(v => v.id === id ? { ...v, isCompleted: true } : v))
      setUpcomingVisits(upcomingVisits.filter(v => v.id !== id))
    } catch (err) {
      console.error('Failed to mark completed:', err)
    }
  }

  const getDaysUntil = (date: string) =>
    Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

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
          <Text style={styles.title}>产检提醒</Text>
        </View>

        <View style={styles.content}>
          {upcomingVisits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暂无即将到来的产检</Text>
            </View>
          ) : (
            upcomingVisits.slice(0, 3).map(visit => {
              const days = getDaysUntil(visit.visitDate)
              return (
                <View key={visit.id} style={styles.visitItem}>
                  <View>
                    <Text style={styles.hospitalName}>{visit.hospital || '产检'}</Text>
                    <Text style={styles.visitDate}>
                      {new Date(visit.visitDate).toLocaleDateString('zh-CN')} · 孕{visit.week}周
                    </Text>
                  </View>
                  <View style={styles.rightSection}>
                    <View style={[
                      styles.daysBadge,
                      days <= 7 && styles.daysBadgeUrgent
                    ]}>
                      <Text style={[
                        styles.daysText,
                        days <= 7 && styles.daysTextUrgent
                      ]}>
                        {days}天后
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => markCompleted(visit.id)}>
                      <Text style={styles.completedText}>已完成</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })
          )}
        </View>

        {/* 添加按钮 */}
        <TouchableOpacity 
          onPress={() => setIsModalOpen(true)}
          style={styles.addButton}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>添加产检记录</Text>
        </TouchableOpacity>
      </View>

      {/* 添加弹窗 */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加产检记录</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>产检日期</Text>
              <TextInput
                style={styles.input}
                value={formData.visitDate}
                onChangeText={(text) => setFormData({ ...formData, visitDate: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>孕周</Text>
              <TextInput
                style={styles.input}
                value={formData.week}
                onChangeText={(text) => setFormData({ ...formData, week: text })}
                placeholder="如: 24"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>医院</Text>
              <TextInput
                style={styles.input}
                value={formData.hospital}
                onChangeText={(text) => setFormData({ ...formData, hospital: text })}
                placeholder="如: 第一医院"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>医生</Text>
              <TextInput
                style={styles.input}
                value={formData.doctor}
                onChangeText={(text) => setFormData({ ...formData, doctor: text })}
                placeholder="可选"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => setIsModalOpen(false)}
                style={styles.cancelButton}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSubmit}
                style={styles.submitButton}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  content: {},
  loadingText: {
    textAlign: 'center',
    paddingVertical: 24,
    color: '#888',
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
  },
  visitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    marginBottom: 10,
  },
  hospitalName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  visitDate: {
    fontSize: 13,
    color: '#666',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  daysBadge: {
    backgroundColor: '#E8EAF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  daysBadgeUrgent: {
    backgroundColor: '#FFEBEE',
  },
  daysText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  daysTextUrgent: {
    color: '#C62828',
  },
  completedText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 13,
    backgroundColor: '#1976D2',
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
})
