import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS } from '../constants'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  onPress?: () => void
  gradient?: boolean
}

export const Card: React.FC<CardProps> = ({ children, style, onPress, gradient }) => {
  const content = (
    <View style={[styles.card, style]}>
      {children}
    </View>
  )

  if (gradient) {
    return (
      <LinearGradient
        colors={['#F97316', '#F59E0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, style]}
      >
        {children}
      </LinearGradient>
    )
  }

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

interface BadgeProps {
  text: string
  color?: string
  style?: ViewStyle
}

export const Badge: React.FC<BadgeProps> = ({ text, color = COLORS.primary, style }) => (
  <View style={[styles.badge, { backgroundColor: color + '20' }, style]}>
    <Text style={[styles.badgeText, { color }]}>{text}</Text>
  </View>
)

interface ProgressBarProps {
  progress: number
  color?: string
  height?: number
  style?: ViewStyle
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  color = COLORS.primary, 
  height = 8,
  style 
}) => (
  <View style={[styles.progressContainer, { height }, style]}>
    <View 
      style={[
        styles.progressFill, 
        { 
          width: `${Math.min(progress, 100)}%`, 
          backgroundColor: color,
          height 
        }
      ]} 
    />
  </View>
)

interface DividerProps {
  style?: ViewStyle
}

export const Divider: React.FC<DividerProps> = ({ style }) => (
  <View style={[styles.divider, style]} />
)

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: {
    text: string
    onPress: () => void
  }
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <View style={styles.emptyState}>
    {icon && <Text style={styles.emptyIcon}>{icon}</Text>}
    <Text style={styles.emptyTitle}>{title}</Text>
    {description && <Text style={styles.emptyDescription}>{description}</Text>}
    {action && (
      <TouchableOpacity style={styles.emptyAction} onPress={action.onPress}>
        <Text style={styles.emptyActionText}>{action.text}</Text>
      </TouchableOpacity>
    )}
  </View>
)

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyAction: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
})
