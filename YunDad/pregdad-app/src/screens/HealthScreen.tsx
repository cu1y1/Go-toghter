import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useUserStore } from '../store'
import { BabyGrowthCard } from '../components/health/BabyGrowthCard'
import { FetalMovementCounter } from '../components/health/FetalMovementCounter'
import { PrenatalReminderCard } from '../components/health/PrenatalReminderCard'
import { ContractionRecorderCard } from '../components/health/ContractionRecorderCard'

const calculateCurrentWeek = (dueDate: Date | string): number => {
  if (!dueDate) return 20
  const due = dueDate instanceof Date ? dueDate : new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  const diffWeeks = Math.round(diffTime / (1000 * 60 * 60 * 24 * 7))
  return Math.max(1, Math.min(40, 40 - diffWeeks))
}

export function HealthScreen() {
  const { user, isLoggedIn } = useUserStore()
  const week = user?.dueDate ? calculateCurrentWeek(user.dueDate) : (user?.pregnancyWeek ?? 20)

  if (!isLoggedIn || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>请先设置孕期信息</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <Text style={styles.title}>健康监测</Text>
      
      <BabyGrowthCard />
      
      <FetalMovementCounter userId={user?.id} />
      
      <PrenatalReminderCard userId={user?.id} />
      
      <ContractionRecorderCard userId={user?.id} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
})
