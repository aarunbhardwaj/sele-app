import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Text } from '../../../components/ui/Typography';
import { useAuth } from '../../../services/AuthContext';

// Airbnb-inspired color palette
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#E8484D',
  primaryLight: '#FFE8E9',
  secondary: '#00A699',
  secondaryLight: '#E0F7F5',
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  gray: '#EBEBEB',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  black: '#222222',
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
  purple: '#8B5CF6',
  blue: '#3B82F6',
  green: '#10B981',
  orange: '#F59E0B',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Enhanced quiz categories with more details
const QUIZ_CATEGORIES = [
  { 
    id: '1', 
    title: 'Grammar Fundamentals', 
    description: 'Master the building blocks of English grammar with comprehensive exercises',
    count: 24,
    difficulty: 'Beginner',
    icon: 'school-outline',
    color: airbnbColors.purple,
    lightColor: '#F3F4F6',
    estimatedTime: '15-20 min',
    topics: ['Tenses', 'Articles', 'Prepositions', 'Sentence Structure']
  },
  { 
    id: '2', 
    title: 'Advanced Grammar', 
    description: 'Complex grammatical structures and advanced language patterns',
    count: 18,
    difficulty: 'Advanced',
    icon: 'library-outline',
    color: airbnbColors.error,
    lightColor: '#FEF2F2',
    estimatedTime: '20-25 min',
    topics: ['Subjunctive Mood', 'Complex Conditionals', 'Advanced Clauses']
  },
  { 
    id: '3', 
    title: 'Business Vocabulary', 
    description: 'Essential vocabulary for professional and business contexts',
    count: 15,
    difficulty: 'Intermediate',
    icon: 'briefcase-outline',
    color: airbnbColors.blue,
    lightColor: '#EFF6FF',
    estimatedTime: '10-15 min',
    topics: ['Finance', 'Marketing', 'Management', 'Presentations']
  },
  { 
    id: '4', 
    title: 'Everyday Vocabulary', 
    description: 'Common words and phrases for daily conversations',
    count: 20,
    difficulty: 'Beginner',
    icon: 'chatbubbles-outline',
    color: airbnbColors.green,
    lightColor: '#ECFDF5',
    estimatedTime: '8-12 min',
    topics: ['Food & Dining', 'Travel', 'Shopping', 'Family']
  },
  { 
    id: '5', 
    title: 'Pronunciation Practice', 
    description: 'Improve your accent and speaking clarity with audio exercises',
    count: 12,
    difficulty: 'Intermediate',
    icon: 'mic-outline',
    color: airbnbColors.orange,
    lightColor: '#FFFBEB',
    estimatedTime: '12-18 min',
    topics: ['Phonetics', 'Word Stress', 'Intonation', 'Connected Speech']
  },
  { 
    id: '6', 
    title: 'Reading Comprehension', 
    description: 'Enhance your reading skills with diverse texts and exercises',
    count: 16,
    difficulty: 'All Levels',
    icon: 'book-outline',
    color: airbnbColors.secondary,
    lightColor: '#E0F7F5',
    estimatedTime: '15-25 min',
    topics: ['Short Stories', 'News Articles', 'Academic Texts', 'Poetry']
  },
];

const filterOptions = [
  { id: 'all', name: 'All Categories', icon: 'grid-outline' },
  { id: 'beginner', name: 'Beginner', icon: 'star-outline' },
  { id: 'intermediate', name: 'Intermediate', icon: 'star-half-outline' },
  { id: 'advanced', name: 'Advanced', icon: 'star' },
];

export default function QuizCategoriesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { initial } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return airbnbColors.green;
      case 'intermediate':
        return airbnbColors.orange;
      case 'advanced':
        return airbnbColors.error;
      default:
        return airbnbColors.mediumGray;
    }
  };

  const filteredCategories = QUIZ_CATEGORIES.filter(category => {
    const matchesSearch = category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    
    return matchesSearch && category.difficulty.toLowerCase() === selectedFilter;
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/quiz-interface?categoryId=${categoryId}`);
  };

  const renderFilterButton = ({ item }: { item: typeof filterOptions[0] }) => (
    <TouchableOpacity 
      key={item.id}
      style={[
        styles.filterButton,
        selectedFilter === item.id ? styles.filterButtonActive : styles.filterButtonInactive
      ]}
      onPress={() => setSelectedFilter(item.id)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={item.icon} 
        size={16} 
        color={selectedFilter === item.id ? airbnbColors.white : airbnbColors.darkGray} 
      />
      <Text 
        variant="body2" 
        style={[
          styles.filterButtonText,
          { color: selectedFilter === item.id ? airbnbColors.white : airbnbColors.darkGray }
        ] as any}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item, index }: { item: typeof QUIZ_CATEGORIES[0]; index: number }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item.id)}
      activeOpacity={0.8}
    >
      <Card style={[styles.categoryCard, { backgroundColor: item.lightColor }]}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.categoryBadges}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
                {item.difficulty}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.categoryContent}>
          <Text variant="h6" style={styles.categoryTitle}>{item.title}</Text>
          <Text variant="body2" style={styles.categoryDescription}>{item.description}</Text>
          
          <View style={styles.categoryMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="book" size={14} color={airbnbColors.mediumGray} />
              <Text variant="caption" style={styles.metaText}>{item.count} quizzes</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color={airbnbColors.mediumGray} />
              <Text variant="caption" style={styles.metaText}>{item.estimatedTime}</Text>
            </View>
          </View>
          
          <View style={styles.topicsContainer}>
            <Text variant="caption" style={styles.topicsLabel}>Topics:</Text>
            <View style={styles.topicsList}>
              {item.topics.slice(0, 3).map((topic, idx) => (
                <View key={idx} style={styles.topicTag}>
                  <Text variant="caption" style={styles.topicText}>{topic}</Text>
                </View>
              ))}
              {item.topics.length > 3 && (
                <View style={styles.topicTag}>
                  <Text variant="caption" style={styles.topicText}>+{item.topics.length - 3}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.categoryFooter}>
          <Button
            title="Start Quiz"
            variant="outline"
            onPress={() => handleCategoryPress(item.id)}
            style={[styles.startButton, { borderColor: item.color }]}
            textStyle={{ color: item.color }}
            leftIcon={<Ionicons name="play" size={16} color={item.color} />}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={airbnbColors.charcoal} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text variant="h4" style={styles.headerTitle}>Quiz Categories</Text>
              <Text variant="body2" style={styles.headerSubtitle}>
                Choose your learning focus
              </Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profileImageContainer}>
                <Text style={styles.profileInitial}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={airbnbColors.mediumGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories, topics..."
              placeholderTextColor={airbnbColors.mediumGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={airbnbColors.mediumGray} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filters */}
          <View style={styles.filtersSection}>
            <FlatList
              data={filterOptions}
              renderItem={renderFilterButton}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
            />
          </View>

          {/* Categories List */}
          <FlatList
            data={filteredCategories}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[airbnbColors.primary]}
                tintColor={airbnbColors.primary}
              />
            }
            contentContainerStyle={styles.categoriesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={airbnbColors.mediumGray} />
                <Text variant="h6" style={styles.emptyStateTitle}>No categories found</Text>
                <Text variant="body2" style={styles.emptyStateText}>
                  Try adjusting your search or filter criteria
                </Text>
                <Button
                  title="Clear Filters"
                  variant="outline"
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedFilter('all');
                  }}
                  style={styles.emptyStateButton}
                />
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  container: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: airbnbColors.offWhite,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.xl,
  },
  headerSubtitle: {
    color: airbnbColors.darkGray,
    marginTop: spacing.xs,
  },
  profileButton: {
    padding: spacing.xs,
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: airbnbColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: airbnbColors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: airbnbColors.charcoal,
    fontSize: typography.fontSizes.md,
  },
  filtersSection: {
    marginBottom: spacing.lg,
  },
  filtersContent: {
    paddingRight: spacing.lg,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    marginRight: spacing.sm,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: airbnbColors.primary,
  },
  filterButtonInactive: {
    backgroundColor: airbnbColors.white,
  },
  filterButtonText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  categoriesList: {
    paddingBottom: 100, // Increased from spacing.xxl to ensure content is fully visible
  },
  categoryItem: {
    marginBottom: spacing.lg,
  },
  categoryCard: {
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadges: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  categoryContent: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
  },
  categoryDescription: {
    color: airbnbColors.darkGray,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  categoryMeta: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  metaText: {
    color: airbnbColors.mediumGray,
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.xs,
  },
  topicsContainer: {
    marginTop: spacing.sm,
  },
  topicsLabel: {
    color: airbnbColors.mediumGray,
    marginBottom: spacing.xs,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicTag: {
    backgroundColor: airbnbColors.lightGray,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  topicText: {
    color: airbnbColors.darkGray,
    fontSize: typography.fontSizes.xs,
  },
  categoryFooter: {
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
    paddingTop: spacing.md,
  },
  startButton: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    color: airbnbColors.charcoal,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  emptyStateText: {
    color: airbnbColors.mediumGray,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  emptyStateButton: {
    marginTop: spacing.sm,
  },
});