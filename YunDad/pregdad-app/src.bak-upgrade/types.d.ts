declare module 'expo-status-bar' {
  import { Component } from 'react'
  interface StatusBarProps {
    style?: 'auto' | 'light' | 'dark'
    animated?: boolean
    backgroundColor?: string
  }
  export class StatusBar extends Component<StatusBarProps> {}
}

declare module '@expo/vector-icons' {
  import { Component } from 'react'
  interface IconProps {
    name: string
    size?: number
    color?: string
    style?: any
  }
  const Ionicons: React.ComponentType<IconProps>
  export { Ionicons }
}

declare module 'expo-linear-gradient' {
  import { Component, ViewStyle } from 'react-native'
  interface LinearGradientProps {
    colors: string[]
    start?: { x: number; y: number }
    end?: { x: number; y: number }
    locations?: number[]
    style?: ViewStyle
    children?: React.ReactNode
  }
  export class LinearGradient extends Component<LinearGradientProps> {}
}

declare module '../../../../src/lib/weekly-data' {
  export const weeklyProgress: Array<{
    week: number
    size: string
    length: number
    weight: number
    description: string
  }>
}
