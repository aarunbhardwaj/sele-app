import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import appwriteService from '../../../services/appwrite';

// Airbnb Colors (matching lesson-view.tsx)
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#E1474C',
  secondary: '#00A699',
  tertiary: '#FC642D',
  dark: '#484848',
  mediumGray: '#767676',
  lightGray: '#EBEBEB',
  superLightGray: '#F7F7F7',
  white: '#FFFFFF',
  black: '#222222',
  success: '#008A05',
  warning: '#FFB400',
  error: '#C13515',
  background: '#FDFDFD',
  border: '#DDDDDD',
};

// Airbnb Typography (matching lesson-view.tsx)
const airbnbTypography = {
  fontFamily: Platform.OS === 'ios' ? 'Circular' : 'CircularStd',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 32,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Airbnb Spacing (matching lesson-view.tsx)
const airbnbSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

interface Quiz {
  $id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  timeLimit: number;
  passScore: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  questionCount?: number;
}

interface AirbnbTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  variant?: 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'small';
  color?: string;
  numberOfLines?: number;
  [key: string]: any;
}

export default function QuizListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      // Fix: Use correct service method name
      const quizData = await appwriteService.getAllQuizzes();
      
      // Enhance quiz data with question counts
      const enhancedQuizzes = await Promise.all(
        quizData.map(async (quiz) => {
          try {
            const questions = await appwriteService.getQuestionsByQuiz(quiz.$id);
            return { ...quiz, questionCount: questions.length };
          } catch (error) {
            console.warn(`Failed to fetch questions for quiz ${quiz.$id}:`, error);
            return { ...quiz, questionCount: 0 };
          }
        })
      );
      
      setQuizzes(enhancedQuizzes);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      Alert.alert('Error', 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchQuizzes();
    setRefreshing(false);
  }, [fetchQuizzes]);

  const deleteQuiz = async (quizId: string) => {
    try {
      await appwriteService.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(quiz => quiz.$id !== quizId));
      Alert.alert('Success', 'Quiz deleted successfully');
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      Alert.alert('Error', 'Failed to delete quiz');
    }
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    Alert.alert(
      'Delete Quiz',
      `Are you sure you want to delete "${quiz.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteQuiz(quiz.$id)
        }
      ]
    );
  };

  const getFilteredQuizzes = () => {
    let filtered = quizzes;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(quiz => {
        switch (selectedFilter) {
          case 'published':
            return quiz.isPublished;
          case 'draft':
            return !quiz.isPublished;
          case 'beginner':
          case 'intermediate':
          case 'advanced':
            return quiz.difficulty === selectedFilter;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredQuizzes = getFilteredQuizzes();

  const filterOptions = [
    { key: 'all', label: 'All', count: quizzes.length },
    { key: 'published', label: 'Published', count: quizzes.filter(q => q.isPublished).length },
    { key: 'draft', label: 'Draft', count: quizzes.filter(q => !q.isPublished).length },
    { key: 'beginner', label: 'Beginner', count: quizzes.filter(q => q.difficulty === 'beginner').length },
    { key: 'intermediate', label: 'Intermediate', count: quizzes.filter(q => q.difficulty === 'intermediate').length },
    { key: 'advanced', label: 'Advanced', count: quizzes.filter(q => q.difficulty === 'advanced').length },
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      vocabulary: airbnbColors.secondary,
      grammar: airbnbColors.success,
      speaking: airbnbColors.error,
      writing: airbnbColors.tertiary,
      reading: '#06B6D4',
      listening: '#84CC16',
      general: airbnbColors.mediumGray
    };
    return colors[category] || airbnbColors.mediumGray;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: airbnbColors.success,
      intermediate: airbnbColors.warning,
      advanced: airbnbColors.error,
      mixed: airbnbColors.tertiary
    };
    return colors[difficulty] || airbnbColors.mediumGray;
  };

  // Create Airbnb-style Text component (matching lesson-view.tsx)
  const AirbnbText = ({ children, style = {}, variant = 'body', color = airbnbColors.dark, ...props }: AirbnbTextProps) => {
    const getTextStyle = (): TextStyle => {
      switch (variant) {
        case 'hero':
          return { fontSize: airbnbTypography.sizes.huge, fontWeight: airbnbTypography.weights.bold };
        case 'title':
          return { fontSize: airbnbTypography.sizes.xxxl, fontWeight: airbnbTypography.weights.semibold };
        case 'subtitle':
          return { fontSize: airbnbTypography.sizes.xl, fontWeight: airbnbTypography.weights.medium };
        case 'body':
          return { fontSize: airbnbTypography.sizes.lg, fontWeight: airbnbTypography.weights.regular };
        case 'caption':
          return { fontSize: airbnbTypography.sizes.md, fontWeight: airbnbTypography.weights.regular };
        case 'small':
          return { fontSize: airbnbTypography.sizes.sm, fontWeight: airbnbTypography.weights.regular };
        default:
          return { fontSize: airbnbTypography.sizes.lg, fontWeight: airbnbTypography.weights.regular };
      }
    };

    return (
      <Animated.Text
        style={[
          {
            color,
            fontFamily: airbnbTypography.fontFamily,
            ...getTextStyle(),
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Animated.Text>
    );
  };

  const renderSearchAndFilters = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={airbnbColors.mediumGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search quizzes..."
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

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filterOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterChip,
              selectedFilter === option.key && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(option.key)}
          >
            <AirbnbText 
              style={[
                styles.filterChipText,
                selectedFilter === option.key && styles.filterChipTextActive
              ]}
              variant="small"
            >
              {option.label}
            </AirbnbText>
            <View style={[
              styles.filterCount,
              selectedFilter === option.key && styles.filterCountActive
            ]}>
              <AirbnbText 
                style={[
                  styles.filterCountText,
                  selectedFilter === option.key && styles.filterCountTextActive
                ]}
                variant="small"
              >
                {option.count}
              </AirbnbText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuizCard = (quiz: Quiz) => (
    <TouchableOpacity
      key={quiz.$id}
      style={styles.quizCard}
      onPress={() => router.push({
        pathname: '/(admin)/(quiz)/question-editor',
        params: { quizId: quiz.$id }
      })}
      activeOpacity={0.8}
    >
      {/* Quiz Header */}
      <View style={styles.quizCardHeader}>
        <View style={styles.quizTitleSection}>
          <AirbnbText variant="subtitle" style={styles.quizTitle}>
            {quiz.title}
          </AirbnbText>
          <View style={styles.quizMeta}>
            <View style={[styles.categoryChip, { backgroundColor: getCategoryColor(quiz.category) + '20' }]}>
              <AirbnbText 
                style={[styles.categoryText, { color: getCategoryColor(quiz.category) }]}
                variant="small"
              >
                {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
              </AirbnbText>
            </View>
            <View style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(quiz.difficulty) + '20' }]}>
              <AirbnbText 
                style={[styles.difficultyText, { color: getDifficultyColor(quiz.difficulty) }]}
                variant="small"
              >
                {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
              </AirbnbText>
            </View>
          </View>
        </View>
        
        <View style={styles.quizActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={(e) => {
              e.stopPropagation();
              router.push({
                pathname: '/(admin)/(quiz)/question-editor',
                params: { quizId: quiz.$id }
              });
            }}
          >
            <Ionicons name="create-outline" size={18} color={airbnbColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteQuiz(quiz);
            }}
          >
            <Ionicons name="trash-outline" size={18} color={airbnbColors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quiz Description */}
      <AirbnbText variant="body" style={styles.quizDescription} numberOfLines={2}>
        {quiz.description}
      </AirbnbText>

      {/* Quiz Stats */}
      <View style={styles.quizStats}>
        <View style={styles.statItem}>
          <Ionicons name="help-circle-outline" size={16} color={airbnbColors.mediumGray} />
          <AirbnbText variant="caption" style={styles.statText}>
            {quiz.questionCount || 0} questions
          </AirbnbText>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color={airbnbColors.mediumGray} />
          <AirbnbText variant="caption" style={styles.statText}>
            {quiz.timeLimit > 0 ? `${quiz.timeLimit}m` : 'No limit'}
          </AirbnbText>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy-outline" size={16} color={airbnbColors.mediumGray} />
          <AirbnbText variant="caption" style={styles.statText}>
            {quiz.passScore}% pass
          </AirbnbText>
        </View>
      </View>

      {/* Quiz Footer */}
      <View style={styles.quizFooter}>
        <View style={styles.statusSection}>
          <View style={[
            styles.statusBadge,
            quiz.isPublished ? styles.publishedBadge : styles.draftBadge
          ]}>
            <View style={[
              styles.statusDot,
              quiz.isPublished ? styles.publishedDot : styles.draftDot
            ]} />
            <AirbnbText
              variant="small"
              style={[
                styles.statusText,
                quiz.isPublished ? styles.publishedText : styles.draftText
              ]}
            >
              {quiz.isPublished ? 'Published' : 'Draft'}
            </AirbnbText>
          </View>
        </View>

        <View style={styles.viewButton}>
          <AirbnbText variant="caption" style={styles.viewButtonText}>
            Edit Quiz
          </AirbnbText>
          <Ionicons name="arrow-forward" size={14} color={airbnbColors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateCard}>
        <Ionicons name="library-outline" size={64} color={airbnbColors.lightGray} />
        <AirbnbText variant="title" style={styles.emptyStateTitle}>
          {searchQuery ? 'No quizzes found' : 'No quizzes yet'}
        </AirbnbText>
        <AirbnbText variant="body" style={styles.emptyStateSubtitle}>
          {searchQuery 
            ? `No quizzes match "${searchQuery}". Try adjusting your search terms.`
            : 'Get started by creating your first language assessment quiz'
          }
        </AirbnbText>
        {!searchQuery && (
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => router.push('/(admin)/(quiz)/quiz-creator')}
          >
            <Ionicons name="add" size={20} color={airbnbColors.white} />
            <AirbnbText variant="body" style={styles.createFirstButtonText}>
              Create Your First Quiz
            </AirbnbText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={airbnbColors.dark} />
          </TouchableOpacity>
          <AirbnbText variant="subtitle" style={styles.headerTitle}>Quiz Library</AirbnbText>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <AirbnbText style={styles.loadingText}>Loading quizzes...</AirbnbText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header - Always visible */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={airbnbColors.dark} />
        </TouchableOpacity>
        <AirbnbText variant="subtitle" style={styles.headerTitle}>Quiz Library</AirbnbText>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => router.push('/(admin)/(quiz)/quiz-creator')}
        >
          <Ionicons name="add" size={20} color={airbnbColors.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 }
        ]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[airbnbColors.primary]}
            tintColor={airbnbColors.primary}
          />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <AirbnbText variant="title" style={[styles.statNumber, { color: airbnbColors.primary }]}>
                {quizzes.length}
              </AirbnbText>
              <AirbnbText variant="caption" style={styles.statLabel}>Total Quizzes</AirbnbText>
            </View>
            <View style={styles.statCard}>
              <AirbnbText variant="title" style={[styles.statNumber, { color: airbnbColors.success }]}>
                {quizzes.filter(q => q.isPublished).length}
              </AirbnbText>
              <AirbnbText variant="caption" style={styles.statLabel}>Published</AirbnbText>
            </View>
            <View style={styles.statCard}>
              <AirbnbText variant="title" style={[styles.statNumber, { color: airbnbColors.warning }]}>
                {quizzes.filter(q => !q.isPublished).length}
              </AirbnbText>
              <AirbnbText variant="caption" style={styles.statLabel}>Drafts</AirbnbText>
            </View>
          </View>
        </View>

        {/* Search and Filters */}
        {renderSearchAndFilters()}

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <AirbnbText variant="subtitle" style={styles.resultsTitle}>
            {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </AirbnbText>
        </View>

        {/* Quiz List */}
        {filteredQuizzes.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.quizzesList}>
            {filteredQuizzes.map(renderQuizCard)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: airbnbColors.background,
  },
  container: {
    flex: 1,
    backgroundColor: airbnbColors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: airbnbSpacing.xl,
  },
  loadingText: {
    marginTop: airbnbSpacing.md,
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.mediumGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: airbnbSpacing.md,
    paddingHorizontal: airbnbSpacing.lg,
    backgroundColor: airbnbColors.white,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.border,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: airbnbSpacing.sm,
    borderRadius: 20,
    backgroundColor: airbnbColors.white,
  },
  headerTitle: {
    fontSize: airbnbTypography.sizes.xl,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
  },
  headerAction: {
    padding: airbnbSpacing.sm,
    borderRadius: 20,
    backgroundColor: airbnbColors.superLightGray,
  },
  statsSection: {
    paddingHorizontal: airbnbSpacing.lg,
    paddingVertical: airbnbSpacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: airbnbColors.white,
    paddingVertical: airbnbSpacing.lg,
    paddingHorizontal: airbnbSpacing.md,
    borderRadius: 12,
    marginHorizontal: airbnbSpacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  statNumber: {
    fontSize: airbnbTypography.sizes.xxxl,
    fontWeight: airbnbTypography.weights.bold,
    marginBottom: airbnbSpacing.xs,
  },
  statLabel: {
    fontSize: airbnbTypography.sizes.sm,
    color: airbnbColors.mediumGray,
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: airbnbSpacing.lg,
    paddingBottom: airbnbSpacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    paddingHorizontal: airbnbSpacing.md,
    paddingVertical: airbnbSpacing.sm,
    marginBottom: airbnbSpacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.dark,
    marginLeft: airbnbSpacing.sm,
    fontFamily: airbnbTypography.fontFamily,
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingRight: airbnbSpacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.white,
    borderRadius: 20,
    paddingVertical: airbnbSpacing.sm,
    paddingHorizontal: airbnbSpacing.md,
    marginRight: airbnbSpacing.sm,
    borderWidth: 1,
    borderColor: airbnbColors.border,
  },
  filterChipActive: {
    backgroundColor: airbnbColors.primary,
    borderColor: airbnbColors.primary,
  },
  filterChipText: {
    fontSize: airbnbTypography.sizes.md,
    fontWeight: airbnbTypography.weights.medium,
    color: airbnbColors.mediumGray,
    marginRight: airbnbSpacing.xs,
  },
  filterChipTextActive: {
    color: airbnbColors.white,
  },
  filterCount: {
    backgroundColor: airbnbColors.superLightGray,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterCountText: {
    fontSize: airbnbTypography.sizes.xs,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.mediumGray,
  },
  filterCountTextActive: {
    color: airbnbColors.white,
  },
  resultsHeader: {
    paddingHorizontal: airbnbSpacing.lg,
    paddingVertical: airbnbSpacing.md,
  },
  resultsTitle: {
    fontSize: airbnbTypography.sizes.xl,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
  },
  quizzesList: {
    paddingHorizontal: airbnbSpacing.lg,
    gap: airbnbSpacing.lg,
  },
  quizCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    padding: airbnbSpacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quizCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: airbnbSpacing.md,
  },
  quizTitleSection: {
    flex: 1,
    marginRight: airbnbSpacing.md,
  },
  quizTitle: {
    fontSize: airbnbTypography.sizes.xl,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    marginBottom: airbnbSpacing.sm,
    lineHeight: 24,
  },
  quizMeta: {
    flexDirection: 'row',
    gap: airbnbSpacing.sm,
  },
  categoryChip: {
    paddingHorizontal: airbnbSpacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: airbnbTypography.sizes.xs,
    fontWeight: airbnbTypography.weights.semibold,
  },
  difficultyChip: {
    paddingHorizontal: airbnbSpacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: airbnbTypography.sizes.xs,
    fontWeight: airbnbTypography.weights.semibold,
  },
  quizActions: {
    flexDirection: 'row',
    gap: airbnbSpacing.sm,
  },
  editButton: {
    padding: airbnbSpacing.sm,
    borderRadius: 20,
    backgroundColor: airbnbColors.primary + '15',
  },
  deleteButton: {
    padding: airbnbSpacing.sm,
    borderRadius: 20,
    backgroundColor: airbnbColors.error + '15',
  },
  quizDescription: {
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.mediumGray,
    lineHeight: 20,
    marginBottom: airbnbSpacing.md,
  },
  quizStats: {
    flexDirection: 'row',
    gap: airbnbSpacing.lg,
    marginBottom: airbnbSpacing.md,
    paddingVertical: airbnbSpacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: airbnbColors.superLightGray,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: airbnbTypography.sizes.sm,
    color: airbnbColors.mediumGray,
    fontWeight: airbnbTypography.weights.medium,
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusSection: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: airbnbSpacing.sm,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
    alignSelf: 'flex-start',
  },
  publishedBadge: {
    backgroundColor: airbnbColors.success + '20',
  },
  draftBadge: {
    backgroundColor: airbnbColors.warning + '20',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  publishedDot: {
    backgroundColor: airbnbColors.success,
  },
  draftDot: {
    backgroundColor: airbnbColors.warning,
  },
  statusText: {
    fontSize: airbnbTypography.sizes.xs,
    fontWeight: airbnbTypography.weights.semibold,
  },
  publishedText: {
    color: airbnbColors.success,
  },
  draftText: {
    color: airbnbColors.warning,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: airbnbTypography.sizes.md,
    fontWeight: airbnbTypography.weights.medium,
    color: airbnbColors.primary,
  },
  emptyStateContainer: {
    paddingHorizontal: airbnbSpacing.lg,
    alignItems: 'center',
  },
  emptyStateCard: {
    borderRadius: 24,
    padding: airbnbSpacing.xxl,
    alignItems: 'center',
    width: '100%',
    backgroundColor: airbnbColors.white,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyStateTitle: {
    fontSize: airbnbTypography.sizes.xxl,
    fontWeight: airbnbTypography.weights.bold,
    color: airbnbColors.mediumGray,
    textAlign: 'center',
    marginTop: airbnbSpacing.lg,
    marginBottom: airbnbSpacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.mediumGray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: airbnbSpacing.xl,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.primary,
    paddingVertical: airbnbSpacing.md,
    paddingHorizontal: airbnbSpacing.xl,
    borderRadius: 12,
    gap: airbnbSpacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  createFirstButtonText: {
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.white,
  },
});