import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { colors, spacing } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

const { width } = Dimensions.get('window');

export default function QuizListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const quizData = await appwriteService.getQuizzes();
      setQuizzes(quizData);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      Alert.alert('Error', 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchQuizzes();
    setRefreshing(false);
  };

  const deleteQuiz = async (quizId) => {
    try {
      await appwriteService.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(quiz => quiz.$id !== quizId));
      Alert.alert('Success', 'Quiz deleted successfully');
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      Alert.alert('Error', 'Failed to delete quiz');
    }
  };

  const handleDeleteQuiz = (quiz) => {
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

  const getCategoryColor = (category) => {
    const colors = {
      vocabulary: '#667eea',
      grammar: '#10B981',
      speaking: '#EF4444',
      writing: '#8B5CF6',
      reading: '#06B6D4',
      listening: '#84CC16',
      general: '#6B7280'
    };
    return colors[category] || '#6B7280';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: '#10B981',
      intermediate: '#F59E0B',
      advanced: '#EF4444',
      mixed: '#8B5CF6'
    };
    return colors[difficulty] || '#6B7280';
  };

  const renderSearchAndFilters = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search quizzes..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
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
            <Text style={[
              styles.filterChipText,
              selectedFilter === option.key && styles.filterChipTextActive
            ]}>
              {option.label}
            </Text>
            <View style={[
              styles.filterCount,
              selectedFilter === option.key && styles.filterCountActive
            ]}>
              <Text style={[
                styles.filterCountText,
                selectedFilter === option.key && styles.filterCountTextActive
              ]}>
                {option.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuizCard = (quiz) => (
    <View key={quiz.$id} style={styles.quizCard}>
      <View style={styles.quizCardHeader}>
        <View style={styles.quizTitleSection}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <View style={styles.quizMeta}>
            <View style={[styles.categoryChip, { backgroundColor: getCategoryColor(quiz.category) + '15' }]}>
              <Text style={[styles.categoryText, { color: getCategoryColor(quiz.category) }]}>
                {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
              </Text>
            </View>
            <View style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(quiz.difficulty) + '15' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(quiz.difficulty) }]}>
                {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.quizActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push({
              pathname: '/(admin)/(quiz)/question-editor',
              params: { quizId: quiz.$id }
            })}
          >
            <Ionicons name="create-outline" size={18} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteQuiz(quiz)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.quizDescription} numberOfLines={2}>
        {quiz.description}
      </Text>

      <View style={styles.quizStats}>
        <View style={styles.statItem}>
          <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.statText}>{quiz.questionCount || 0} questions</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.statText}>
            {quiz.timeLimit > 0 ? `${quiz.timeLimit}s` : 'No limit'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="trophy-outline" size={16} color="#6B7280" />
          <Text style={styles.statText}>{quiz.passScore}% pass</Text>
        </View>
      </View>

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
            <Text style={[
              styles.statusText,
              quiz.isPublished ? styles.publishedText : styles.draftText
            ]}>
              {quiz.isPublished ? 'Published' : 'Draft'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push({
            pathname: '/(admin)/(quiz)/question-editor',
            params: { quizId: quiz.$id }
          })}
        >
          <Text style={styles.viewButtonText}>Edit Quiz</Text>
          <Ionicons name="arrow-forward" size={14} color="#667eea" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <LinearGradient
        colors={['#F3F4F6', '#E5E7EB']}
        style={styles.emptyStateCard}
      >
        <Ionicons name="library-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyStateTitle}>
          {searchQuery ? 'No quizzes found' : 'No quizzes yet'}
        </Text>
        <Text style={styles.emptyStateSubtitle}>
          {searchQuery 
            ? `No quizzes match "${searchQuery}". Try adjusting your search terms.`
            : 'Get started by creating your first language assessment quiz'
          }
        </Text>
        {!searchQuery && (
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => router.push('/(admin)/(quiz)/quiz-creator')}
          >
            <Ionicons name="add" size={20} color={colors.neutral.white} />
            <Text style={styles.createFirstButtonText}>Create Your First Quiz</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader title="Quiz Library" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading quizzes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Quiz Library"
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(admin)/(quiz)/quiz-creator')}
          >
            <Ionicons name="add" size={24} color="#667eea" />
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Header Stats */}
        <LinearGradient 
          colors={['#667eea', '#764ba2']} 
          style={styles.headerSection}
        >
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{quizzes.length}</Text>
              <Text style={styles.statLabel}>Total Quizzes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{quizzes.filter(q => q.isPublished).length}</Text>
              <Text style={styles.statLabel}>Published</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{quizzes.filter(q => !q.isPublished).length}</Text>
              <Text style={styles.statLabel}>Drafts</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderSearchAndFilters()}

          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''}
              {searchQuery && ` for "${searchQuery}"`}
            </Text>
          </View>

          {filteredQuizzes.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.quizzesList}>
              {filteredQuizzes.map(renderQuizCard)}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: '#6B7280',
  },

  // Header Section
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  // Search Section
  searchSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: spacing.sm,
  },
  filtersContainer: {
    maxHeight: 50,
  },
  filtersContent: {
    paddingRight: spacing.lg,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginRight: spacing.xs,
  },
  filterChipTextActive: {
    color: colors.neutral.white,
  },
  filterCount: {
    backgroundColor: '#F3F4F6',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterCountTextActive: {
    color: colors.neutral.white,
  },

  // Results Header
  resultsHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },

  // Quiz Cards
  quizzesList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  quizCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  quizCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  quizTitleSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  quizMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quizActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  deleteButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
  },
  quizDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  quizStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
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
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
    alignSelf: 'flex-start',
  },
  publishedBadge: {
    backgroundColor: '#ECFDF5',
  },
  draftBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  publishedDot: {
    backgroundColor: '#10B981',
  },
  draftDot: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  publishedText: {
    color: '#065F46',
  },
  draftText: {
    color: '#92400E',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },

  // Empty State
  emptyStateContainer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  emptyStateCard: {
    borderRadius: 24,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    gap: spacing.sm,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },

  // Header Button
  addButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
});