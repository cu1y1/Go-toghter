import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, BABY_BAG_CATEGORIES, DEFAULT_BABY_BAG_ITEMS } from '../constants'
import { Card, ProgressBar } from '../components/common'
import { useBabyBagStore } from '../store'
import { BabyBagItem } from '../types'

export const BabyBagScreen: React.FC = () => {
  const { items, toggleItem, addItem, removeItem, getProgress } = useBabyBagStore()
  const [expandedCategory, setExpandedCategory] = useState<string | null>('documents')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('mom')

  const progress = getProgress()
  const progressPercent = progress.total > 0 ? (progress.prepared / progress.total * 100) : 0

  // 切换分类展开
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId)
  }, [])

  // 添加自定义物品
  const handleAddItem = useCallback(() => {
    if (!newItemName.trim()) {
      Alert.alert('提示', '请输入物品名称')
      return
    }

    const newItem: BabyBagItem = {
      id: `custom-${Date.now()}`,
      categoryId: newItemCategory,
      name: newItemName.trim(),
      isDefault: false,
      isPrepared: false,
      isCustom: true,
      sortOrder: 999,
    }

    addItem(newItem)
    setNewItemName('')
    setShowAddForm(false)
    Alert.alert('成功', '物品已添加')
  }, [newItemName, newItemCategory, addItem])

  // 删除物品
  const handleRemoveItem = useCallback((item: BabyBagItem) => {
    Alert.alert(
      '确认删除',
      `确定要删除"${item.name}"吗？`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: () => removeItem(item.id)
        }
      ]
    )
  }, [removeItem])

  // 获取分类图标
  const getCategoryIcon = (categoryId: string) => {
    const cat = BABY_BAG_CATEGORIES.find(c => c.id === categoryId)
    return cat?.icon || '📦'
  }

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const cat = BABY_BAG_CATEGORIES.find(c => c.id === categoryId)
    return cat?.name || '其他'
  }

  // 获取分类进度
  const getCategoryProgress = (categoryId: string) => {
    const categoryItems = items.filter(i => i.categoryId === categoryId)
    const prepared = categoryItems.filter(i => i.isPrepared).length
    return { prepared, total: categoryItems.length }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 标题 */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="bag-check" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.title}>待产包清单</Text>
        </View>

        {/* 进度卡片 */}
        <Card style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={styles.progressLabel}>准备进度</Text>
            <Text style={styles.progressValue}>
              {progress.prepared}/{progress.total} 件
            </Text>
          </View>
          <ProgressBar progress={progressPercent} height={10} />
          <Text style={styles.progressHint}>
            {progressPercent === 100 
              ? '🎉 太棒了！待产包已准备完毕' 
              : `还需准备 ${progress.total - progress.prepared} 件物品`
            }
          </Text>
        </Card>

        {/* 添加物品按钮 */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add-circle" size={20} color={COLORS.primary} />
          <Text style={styles.addButtonText}>添加自定义物品</Text>
        </TouchableOpacity>

        {/* 添加物品表单 */}
        {showAddForm && (
          <Card style={styles.addForm}>
            <Text style={styles.formTitle}>添加物品</Text>
            <TextInput
              style={styles.input}
              placeholder="输入物品名称"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <Text style={styles.formLabel}>选择分类</Text>
            <View style={styles.categoryChips}>
              {BABY_BAG_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    newItemCategory === cat.id && styles.categoryChipActive
                  ]}
                  onPress={() => setNewItemCategory(cat.id)}
                >
                  <Text style={styles.categoryChipIcon}>{cat.icon}</Text>
                  <Text style={[
                    styles.categoryChipText,
                    newItemCategory === cat.id && styles.categoryChipTextActive
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddForm(false)
                  setNewItemName('')
                }}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleAddItem}
              >
                <Text style={styles.confirmButtonText}>添加</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* 分类列表 */}
        {BABY_BAG_CATEGORIES.map(category => {
          const categoryItems = items.filter(i => i.categoryId === category.id)
          const catProgress = getCategoryProgress(category.id)
          const isExpanded = expandedCategory === category.id
          const isComplete = catProgress.prepared === catProgress.total && catProgress.total > 0

          return (
            <View key={category.id} style={styles.categorySection}>
              <TouchableOpacity
                style={[
                  styles.categoryHeader,
                  isComplete && styles.categoryHeaderComplete
                ]}
                onPress={() => toggleCategory(category.id)}
                activeOpacity={0.8}
              >
                <View style={styles.categoryHeaderLeft}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryProgress}>
                    {catProgress.prepared}/{catProgress.total}
                  </Text>
                </View>
                <View style={styles.categoryHeaderRight}>
                  {isComplete && (
                    <View style={styles.completeBadge}>
                      <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                      <Text style={styles.completeText}>已完成</Text>
                    </View>
                  )}
                  <Ionicons 
                    name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={COLORS.textLight} 
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.itemList}>
                  {categoryItems.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.itemRow,
                        item.isPrepared && styles.itemRowPrepared
                      ]}
                      onPress={() => toggleItem(item.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.checkboxContainer}>
                        <Ionicons 
                          name={item.isPrepared ? 'checkbox' : 'square-outline'} 
                          size={22} 
                          color={item.isPrepared ? COLORS.success : COLORS.textMuted} 
                        />
                      </View>
                      <Text style={[
                        styles.itemName,
                        item.isPrepared && styles.itemNamePrepared
                      ]}>
                        {item.name}
                      </Text>
                      {item.isCustom && (
                        <TouchableOpacity
                          onPress={() => handleRemoveItem(item)}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )
        })}

        {/* 知识入口 */}
        <Card style={styles.knowledgeCard}>
          <Text style={styles.knowledgeTitle}>💡 相关知识</Text>
          <TouchableOpacity style={styles.knowledgeItem}>
            <Ionicons name="warning" size={18} color={COLORS.error} />
            <Text style={styles.knowledgeItemText}>孕期饮食禁忌</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.knowledgeItem}>
            <Ionicons name="calendar" size={18} color={COLORS.primary} />
            <Text style={styles.knowledgeItemText}>产检时间表</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.knowledgeItem}>
            <Ionicons name="book" size={18} color={COLORS.success} />
            <Text style={styles.knowledgeItemText}>孕期注意事项</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },
  progressHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  addForm: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 12,
  },
  formLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryChipText: {
    fontSize: 13,
    color: COLORS.text,
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  formButtons: {
    flexDirection: 'row',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 12,
    marginHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.white,
  },
  categoryHeaderComplete: {
    backgroundColor: COLORS.success + '10',
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryProgress: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  completeText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
  },
  itemList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemRowPrepared: {
    backgroundColor: COLORS.success + '5',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  itemNamePrepared: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  deleteButton: {
    padding: 4,
  },
  knowledgeCard: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  knowledgeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  knowledgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  knowledgeItemText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 10,
  },
})
