import React, { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, PREGNANCY_STAGES } from '../constants'
import { useUserStore } from '../store'

const { width, height } = Dimensions.get('window')

interface OnboardingProps {
  onComplete: () => void
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [babyName, setBabyName] = useState('')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [pregnancyStage, setPregnancyStage] = useState<string | null>(null)
  const [knowPregnancyWeek, setKnowPregnancyWeek] = useState(false)
  const [pregnancyWeek, setPregnancyWeek] = useState('')
  
  const { setUser } = useUserStore()
  const scrollViewRef = useRef<ScrollView>(null)
  const fadeAnim = useRef(new Animated.Value(1)).current

  // 步骤配置
  const steps = [
    { title: '欢迎', subtitle: '开始您的孕期之旅' },
    { title: '宝宝昵称', subtitle: '给宝宝起个可爱的名字吧' },
    { title: '预产期', subtitle: '设置您的预产期' },
    { title: '孕期阶段', subtitle: '您现在处于哪个阶段？' },
    { title: '完成', subtitle: '准备开始使用孕爸爸' },
  ]

  // 下一步
  const nextStep = useCallback(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false })
    }
  }, [currentStep, steps.length, fadeAnim])

  // 上一步
  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  // 完成设置
  const handleComplete = useCallback(() => {
    // 计算孕周
    let week = 20
    if (knowPregnancyWeek && pregnancyWeek) {
      week = parseInt(pregnancyWeek) || 20
    } else if (pregnancyStage) {
      switch (pregnancyStage) {
        case 'early': week = 6; break
        case 'middle': week = 20; break
        case 'late': week = 34; break
      }
    }

    // 计算预产期
    let calculatedDueDate = dueDate
    if (!calculatedDueDate) {
      calculatedDueDate = new Date()
      calculatedDueDate.setDate(calculatedDueDate.getDate() + (40 - week) * 7)
    }

    // 设置用户信息
    setUser({
      id: `user-${Date.now()}`,
      babyName: babyName || '小宝贝',
      dueDate: calculatedDueDate,
      pregnancyWeek: week,
      level: 1,
      points: 0,
      avatar: null,
      createdAt: new Date(),
    })

    onComplete()
  }, [babyName, dueDate, pregnancyStage, knowPregnancyWeek, pregnancyWeek, setUser, onComplete])

  // 渲染步骤指示器
  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index === currentStep && styles.stepDotActive,
            index < currentStep && styles.stepDotCompleted,
          ]}
        >
          {index < currentStep && (
            <Ionicons name="checkmark" size={10} color={COLORS.white} />
          )}
        </View>
      ))}
    </View>
  )

  // 渲染欢迎页
  const renderWelcomeStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.welcomeIcon}>👶</Text>
      <Text style={styles.welcomeTitle}>欢迎使用孕爸爸</Text>
      <Text style={styles.welcomeDesc}>
        专业的孕期陪伴助手，为您和宝宝提供全方位的关爱
      </Text>
      
      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <Ionicons name="restaurant" size={24} color={COLORS.primary} />
          <Text style={styles.featureText}>科学饮食指导</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="calendar" size={24} color={COLORS.primary} />
          <Text style={styles.featureText}>每日打卡记录</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="bag-check" size={24} color={COLORS.primary} />
          <Text style={styles.featureText}>待产包清单</Text>
        </View>
      </View>
    </View>
  )

  // 渲染昵称步骤
  const renderNameStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepIcon}>💝</Text>
      <Text style={styles.stepTitle}>给宝宝起个昵称</Text>
      <Text style={styles.stepDesc}>
        这个昵称将在App中显示，让您的孕期更有陪伴感
      </Text>
      
      <TextInput
        style={styles.nameInput}
        placeholder="例如：小豆豆"
        placeholderTextColor={COLORS.textMuted}
        value={babyName}
        onChangeText={setBabyName}
        maxLength={10}
      />
      
      <View style={styles.nameSuggestions}>
        <Text style={styles.suggestionLabel}>热门昵称</Text>
        <View style={styles.suggestionChips}>
          {['小豆豆', '小糖果', '小星星', '小太阳'].map(name => (
            <TouchableOpacity
              key={name}
              style={[
                styles.suggestionChip,
                babyName === name && styles.suggestionChipActive
              ]}
              onPress={() => setBabyName(name)}
            >
              <Text style={[
                styles.suggestionChipText,
                babyName === name && styles.suggestionChipTextActive
              ]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )

  // 渲染预产期步骤
  const renderDueDateStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepIcon}>📅</Text>
      <Text style={styles.stepTitle}>您的预产期是？</Text>
      <Text style={styles.stepDesc}>
        我们将根据预产期为您提供个性化的孕期指导
      </Text>

      <TouchableOpacity 
        style={styles.datePickerButton}
        onPress={() => {/* TODO: 日期选择器 */}}
      >
        <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
        <Text style={styles.datePickerText}>
          {dueDate ? `${dueDate.getFullYear()}年${dueDate.getMonth() + 1}月${dueDate.getDate()}日` : '点击选择预产期'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.alternativeButton}
        onPress={() => setKnowPregnancyWeek(!knowPregnancyWeek)}
      >
        <Ionicons 
          name={knowPregnancyWeek ? 'checkbox' : 'square-outline'} 
          size={20} 
          color={COLORS.primary} 
        />
        <Text style={styles.alternativeText}>我已经知道孕周</Text>
      </TouchableOpacity>

      {knowPregnancyWeek && (
        <View style={styles.weekInputContainer}>
          <TextInput
            style={styles.weekInput}
            placeholder="输入孕周"
            placeholderTextColor={COLORS.textMuted}
            value={pregnancyWeek}
            onChangeText={setPregnancyWeek}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.weekLabel}>周</Text>
        </View>
      )}
    </View>
  )

  // 渲染孕期阶段步骤
  const renderStageStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepIcon}>🤰</Text>
      <Text style={styles.stepTitle}>选择孕期阶段</Text>
      <Text style={styles.stepDesc}>
        不同阶段有不同的注意事项和营养需求
      </Text>

      <View style={styles.stageList}>
        {PREGNANCY_STAGES.map(stage => (
          <TouchableOpacity
            key={stage.id}
            style={[
              styles.stageCard,
              pregnancyStage === stage.id && styles.stageCardActive
            ]}
            onPress={() => setPregnancyStage(stage.id)}
            activeOpacity={0.8}
          >
            <View style={styles.stageHeader}>
              <Text style={[
                styles.stageName,
                pregnancyStage === stage.id && styles.stageNameActive
              ]}>
                {stage.name}
              </Text>
              <Text style={styles.stageWeeks}>{stage.weeks}</Text>
            </View>
            <Text style={styles.stageDesc}>{stage.description}</Text>
            {pregnancyStage === stage.id && (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} style={styles.stageCheck} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  // 渲染完成步骤
  const renderCompleteStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.completeIcon}>🎉</Text>
      <Text style={styles.completeTitle}>设置完成！</Text>
      <Text style={styles.completeDesc}>
        恭喜您完成初始设置，开始您的孕期之旅吧！
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>您的设置</Text>
        <View style={styles.summaryItem}>
          <Ionicons name="heart" size={16} color={COLORS.primary} />
          <Text style={styles.summaryText}>宝宝昵称: {babyName || '小宝贝'}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="calendar" size={16} color={COLORS.primary} />
          <Text style={styles.summaryText}>
            孕期: {knowPregnancyWeek && pregnancyWeek ? `${pregnancyWeek}周` : 
              pregnancyStage === 'early' ? '孕早期' : 
              pregnancyStage === 'middle' ? '孕中期' : '孕晚期'}
          </Text>
        </View>
      </View>
    </View>
  )

  // 渲染当前步骤内容
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderWelcomeStep()
      case 1: return renderNameStep()
      case 2: return renderDueDateStep()
      case 3: return renderStageStep()
      case 4: return renderCompleteStep()
      default: return null
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#F97316', '#F59E0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* 步骤指示器 */}
        {renderStepIndicator()}

        {/* 内容区域 */}
        <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim }]}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {renderCurrentStep()}
          </ScrollView>
        </Animated.View>

        {/* 底部按钮 */}
        <View style={styles.buttonContainer}>
          {currentStep > 0 && currentStep < 4 && (
            <TouchableOpacity style={styles.backButton} onPress={prevStep}>
              <Ionicons name="chevron-back" size={20} color={COLORS.white} />
              <Text style={styles.backButtonText}>上一步</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < 4 ? (
            <TouchableOpacity 
              style={[
                styles.nextButton,
                currentStep === 0 && styles.nextButtonFull
              ]} 
              onPress={nextStep}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === 0 ? '开始使用' : '下一步'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
              <Text style={styles.completeButtonText}>开始体验</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 跳过按钮 */}
        {currentStep > 0 && currentStep < 4 && (
          <TouchableOpacity style={styles.skipButton} onPress={nextStep}>
            <Text style={styles.skipButtonText}>跳过</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: COLORS.white,
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.white,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  stepContent: {
    alignItems: 'center',
  },
  welcomeIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  welcomeDesc: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureList: {
    width: '100%',
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  stepIcon: {
    fontSize: 56,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  nameInput: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 24,
  },
  nameSuggestions: {
    width: '100%',
  },
  suggestionLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 10,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    marginBottom: 8,
  },
  suggestionChipActive: {
    backgroundColor: COLORS.primary,
  },
  suggestionChipText: {
    fontSize: 14,
    color: COLORS.text,
  },
  suggestionChipTextActive: {
    color: COLORS.white,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alternativeText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
  },
  weekInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  weekInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    marginRight: 12,
  },
  weekLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  stageList: {
    width: '100%',
  },
  stageCard: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stageCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  stageNameActive: {
    color: COLORS.primary,
  },
  stageWeeks: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  stageDesc: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  stageCheck: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  completeIcon: {
    fontSize: 72,
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  completeDesc: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
    backgroundColor: COLORS.white,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: COLORS.white,
    marginLeft: 4,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 24,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: 4,
  },
  completeButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  skipButton: {
    alignItems: 'center',
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  skipButtonText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
})
