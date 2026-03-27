import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Dimensions,
  FlatList,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../constants'
import { Card, Badge, EmptyState } from '../components/common'
import { SAMPLE_RECIPES, getRecipesByMealType, searchRecipes } from '../constants/recipes'
import { useFavoriteStore } from '../store'
import { Recipe, MealType } from '../types'

const { width, height } = Dimensions.get('window')

const CATEGORIES = [
  { id: 'all', name: '全部', icon: '🍽️' },
  { id: 'breakfast', name: '早餐', icon: '🌅' },
  { id: 'lunch', name: '午餐', icon: '☀️' },
  { id: 'dinner', name: '晚餐', icon: '🌙' },
  { id: 'snack_morning', name: '上午加餐', icon: '🍎' },
  { id: 'snack_afternoon', name: '下午加餐', icon: '🥛' },
  { id: 'snack_evening', name: '晚间加餐', icon: '🍪' },
]

export const RecipeScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoriteStore()

  // 过滤食谱
  const filteredRecipes = useMemo(() => {
    let recipes = activeCategory === 'all' 
      ? SAMPLE_RECIPES 
      : SAMPLE_RECIPES.filter(r => r.mealType === activeCategory)
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      recipes = recipes.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.ingredients.some(i => i.toLowerCase().includes(query))
      )
    }
    
    return recipes.map(r => ({ ...r, isFavorite: favorites.includes(r.id) }))
  }, [activeCategory, searchQuery, favorites])

  // 收藏的食谱
  const favoriteRecipes = useMemo(() => 
    SAMPLE_RECIPES.filter(r => favorites.includes(r.id)),
    [favorites]
  )

  // 切换收藏
  const toggleFavorite = useCallback((recipeId: string) => {
    if (favorites.includes(recipeId)) {
      removeFavorite(recipeId)
    } else {
      addFavorite(recipeId)
    }
  }, [favorites, addFavorite, removeFavorite])

  // 打开详情
  const openDetail = useCallback((recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setModalVisible(true)
  }, [])

  // 渲染食谱卡片
  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={() => openDetail(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item.id)}
      >
        <Ionicons 
          name={item.isFavorite ? 'heart' : 'heart-outline'} 
          size={20} 
          color={item.isFavorite ? COLORS.error : COLORS.white} 
        />
      </TouchableOpacity>
      <View style={styles.recipeContent}>
        <Text style={styles.recipeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.recipeDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.recipeMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FBBF24" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.cookTime}>{item.cookTime}分钟</Text>
          <Badge text={item.suitableWeeks} color={COLORS.primary} style={styles.weekBadge} />
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* 搜索栏 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索食谱、食材..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 分类标签 */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.categoryChipActive
              ]}
              onPress={() => setActiveCategory(cat.id)}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[
                styles.categoryText,
                activeCategory === cat.id && styles.categoryTextActive
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 收藏区域 */}
        {favoriteRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❤️ 我的收藏</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoriteScroll}
            >
              {favoriteRecipes.map(recipe => (
                <TouchableOpacity 
                  key={recipe.id}
                  style={styles.favoriteCard}
                  onPress={() => openDetail(recipe)}
                >
                  <Image source={{ uri: recipe.image }} style={styles.favoriteImage} />
                  <Text style={styles.favoriteName} numberOfLines={1}>{recipe.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 食谱列表 */}
        <View style={styles.section}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>
              {activeCategory === 'all' ? '全部食谱' : CATEGORIES.find(c => c.id === activeCategory)?.name}
            </Text>
            <Text style={styles.recipeCount}>{filteredRecipes.length} 道</Text>
          </View>

          {filteredRecipes.length > 0 ? (
            <View style={styles.recipeGrid}>
              {filteredRecipes.map(recipe => (
                <View key={recipe.id} style={styles.gridItem}>
                  {renderRecipeCard({ item: recipe })}
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="🍽️"
              title="暂无食谱"
              description="换个关键词试试吧"
            />
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 食谱详情弹窗 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedRecipe && (
              <>
                <Image 
                  source={{ uri: selectedRecipe.image }} 
                  style={styles.modalImage} 
                />
                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
                    <TouchableOpacity onPress={() => toggleFavorite(selectedRecipe.id)}>
                      <Ionicons 
                        name={selectedRecipe.isFavorite ? 'heart' : 'heart-outline'} 
                        size={24} 
                        color={selectedRecipe.isFavorite ? COLORS.error : COLORS.textLight} 
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.modalDesc}>{selectedRecipe.description}</Text>

                  <View style={styles.modalMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="star" size={14} color="#FBBF24" />
                      <Text style={styles.metaText}>{selectedRecipe.rating}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time" size={14} color={COLORS.textLight} />
                      <Text style={styles.metaText}>{selectedRecipe.cookTime}分钟</Text>
                    </View>
                    <Badge text={selectedRecipe.suitableWeeks} />
                  </View>

                  {/* 营养成分 */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionBoxTitle}>营养成分</Text>
                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedRecipe.nutrition.calories}</Text>
                        <Text style={styles.nutritionLabel}>卡路里</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedRecipe.nutrition.protein}g</Text>
                        <Text style={styles.nutritionLabel}>蛋白质</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedRecipe.nutrition.carbs}g</Text>
                        <Text style={styles.nutritionLabel}>碳水</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={styles.nutritionValue}>{selectedRecipe.nutrition.fat}g</Text>
                        <Text style={styles.nutritionLabel}>脂肪</Text>
                      </View>
                    </View>
                  </View>

                  {/* 食材列表 */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionBoxTitle}>所需食材</Text>
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <View key={idx} style={styles.ingredientItem}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                        <Text style={styles.ingredientText}>{ing}</Text>
                      </View>
                    ))}
                  </View>

                  {/* 做法步骤 */}
                  <View style={styles.sectionBox}>
                    <Text style={styles.sectionBoxTitle}>做法步骤</Text>
                    {selectedRecipe.steps.map((step, idx) => (
                      <View key={idx} style={styles.stepItem}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={{ height: 20 }} />
                </ScrollView>

                {/* 底部按钮 */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add-circle" size={20} color={COLORS.white} />
                    <Text style={styles.addButtonText}>添加到饮食计划</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recipeCount: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  favoriteScroll: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  favoriteCard: {
    width: 100,
    marginRight: 8,
  },
  favoriteImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 6,
  },
  favoriteName: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  recipeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  gridItem: {
    width: '50%',
    padding: 4,
  },
  recipeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeImage: {
    width: '100%',
    height: 120,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeContent: {
    padding: 12,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  recipeDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
    lineHeight: 18,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  cookTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  weekBadge: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalScroll: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  modalDesc: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 16,
  },
  modalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  sectionBox: {
    marginBottom: 20,
  },
  sectionBoxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  nutritionLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ingredientText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 22,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
