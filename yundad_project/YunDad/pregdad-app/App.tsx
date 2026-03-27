import React, { useState, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import { HomeScreen } from './src/screens/HomeScreen'
import { RecipeScreen } from './src/screens/RecipeScreen'
import { CheckInScreen } from './src/screens/CheckInScreen'
import { BabyBagScreen } from './src/screens/BabyBagScreen'
import { ProfileScreen } from './src/screens/ProfileScreen'
import { Onboarding } from './src/screens/Onboarding'
import { useUserStore } from './src/store'
import { COLORS } from './src/constants'

const Tab = createBottomTabNavigator()

// 自定义TabBar图标
const TabBarIcon = ({ name, color, size }: { name: string; color: string; size: number }) => {
  return <Ionicons name={name as any} size={size} color={color} />
}

// 底部Tab导航
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '首页',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Recipe"
        component={RecipeScreen}
        options={{
          tabBarLabel: '食谱',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="restaurant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{
          tabBarLabel: '打卡',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="checkmark-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="BabyBag"
        component={BabyBagScreen}
        options={{
          tabBarLabel: '待产包',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="bag-check" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: '我的',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

// 启动画面
const SplashScreen = () => (
  <LinearGradient
    colors={['#F97316', '#F59E0B']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.splash}
  >
    <Text style={styles.splashIcon}>👶</Text>
    <Text style={styles.splashTitle}>孕爸爸</Text>
    <Text style={styles.splashSubtitle}>专业的孕期陪伴助手</Text>
    <ActivityIndicator color={COLORS.white} size="large" style={styles.splashLoader} />
  </LinearGradient>
)

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const { isLoggedIn, setUser } = useUserStore()

  // 模拟启动加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // 显示启动画面
  if (isLoading) {
    return <SplashScreen />
  }

  // 显示引导流程
  if (!isLoggedIn) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar style="auto" />
          <Onboarding onComplete={() => {}} />
        </SafeAreaView>
      </SafeAreaProvider>
    )
  }

  // 显示主应用
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="auto" />
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 6,
    height: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  tabBarItem: {
    paddingTop: 4,
  },
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  splashLoader: {
    marginTop: 40,
  },
})
