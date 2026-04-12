import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../../constants'

export interface Recipe {
  id: string
  name: string
  image: string
  rating: number
  cookTime: number
  calories: number
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

interface RecommendedRecipesProps {
  recipes: Recipe[]
  onRecipeClick?: (recipeId: string) => void
  onViewAll?: () => void
}

const difficultyLabels: Record<Recipe['difficulty'], string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

const difficultyColors: Record<Recipe['difficulty'], { bg: string; text: string }> = {
  easy: { bg: '#D1FAE5', text: '#065F46' },
  medium: { bg: '#FEF3C7', text: '#92400E' },
  hard: { bg: '#FEE2E2', text: '#991B1B' }
}

export function RecommendedRecipes({ recipes, onRecipeClick, onViewAll }: RecommendedRecipesProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>📖</Text>
          <Text style={styles.title}>推荐食谱</Text>
        </View>
        <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>查看全部</Text>
          <Ionicons name="chevron-forward" size={16} color="#EA580C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recipes.map((recipe) => (
          <TouchableOpacity
            key={recipe.id}
            style={styles.recipeCard}
            onPress={() => onRecipeClick?.(recipe.id)}
            activeOpacity={0.8}
          >
            <View style={styles.imageContainer}>
              <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyColors[recipe.difficulty].bg }]}>
                <Text style={[styles.difficultyText, { color: difficultyColors[recipe.difficulty].text }]}>
                  {difficultyLabels[recipe.difficulty]}
                </Text>
              </View>
            </View>

            <View style={styles.recipeInfo}>
              <Text style={styles.recipeName} numberOfLines={1}>{recipe.name}</Text>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FBBF24" />
                <Text style={styles.ratingText}>{recipe.rating.toFixed(1)}</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                  <Text style={styles.metaText}>{recipe.cookTime}分钟</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="flame-outline" size={12} color="#9CA3AF" />
                  <Text style={styles.metaText}>{recipe.calories}卡</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

export function getRecommendedRecipes(): Recipe[] {
  return [
    {
      id: '1',
      name: '番茄牛肉炖土豆',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
      rating: 4.8,
      cookTime: 45,
      calories: 320,
      tags: ['补铁', '高蛋白'],
      difficulty: 'medium'
    },
    {
      id: '2',
      name: '清蒸鲈鱼',
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
      rating: 4.9,
      cookTime: 25,
      calories: 180,
      tags: ['DHA', '低脂'],
      difficulty: 'easy'
    },
    {
      id: '3',
      name: '菠菜猪肝汤',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
      rating: 4.5,
      cookTime: 20,
      calories: 150,
      tags: ['补铁', '叶酸'],
      difficulty: 'easy'
    },
    {
      id: '4',
      name: '核桃芝麻糊',
      image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop',
      rating: 4.7,
      cookTime: 15,
      calories: 200,
      tags: ['DHA', '健脑'],
      difficulty: 'easy'
    },
    {
      id: '5',
      name: '红枣银耳羹',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      rating: 4.6,
      cookTime: 60,
      calories: 120,
      tags: ['补血', '养颜'],
      difficulty: 'easy'
    }
  ]
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    color: '#EA580C',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  recipeCard: {
    width: 144,
    marginRight: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 112,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  recipeInfo: {
    paddingHorizontal: 4,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
})
