import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

// Mock quiz history data
const quizHistory = [
  {
    id: '1',
    title: 'Present Perfect Tense',
    category: 'Grammar',
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    timeSpent: 12,
    completedAt: '2 hours ago',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    difficulty: 'Intermediate',
    categoryColor: airbnbColors.purple,
    status: 'completed'
  },
  {
    id: '2',
    title: 'Business Vocabulary',
    category: 'Vocabulary',
    score: 92,
    totalQuestions: 15,
    correctAnswers: 14,
    timeSpent: 8,
    completedAt: '1 day ago',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    difficulty: 'Advanced',
    categoryColor: airbnbColors.green,
    status: 'completed'
  },
  {
    id: '3',
    title: 'Conditional Sentences',
    category: 'Grammar',
    score: 78,
    totalQuestions: 25,
    correctAnswers: 19,
    timeSpent: 18,
    completedAt: '2 days ago',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    difficulty: 'Advanced',
    categoryColor: airbnbColors.purple,
    status: 'completed'
  },
  {
    id: '4',
    title: 'Pronunciation Basics',
    category: 'Pronunciation',
    score: 65,
    totalQuestions: 18,
    correctAnswers: 12,
    timeSpent: 15,
    completedAt: '3 days ago',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    difficulty: 'Beginner',
    categoryColor: airbnbColors.orange,
    status: 'completed'
  },
  {
    id: '5',
    title: 'Daily Conversations',
    category: 'Conversation',
    score: 88,
    totalQuestions: 20,
    correctAnswers: 18,
    timeSpent: 14,
    completedAt: '5 days ago',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    difficulty: 'Intermediate',
    categoryColor: airbnbColors.blue,
    status: 'completed'
  },
  {
    id: '6',
    title: 'Academic Writing',
    category: 'Writing',
    score: 0,
    totalQuestions: 22,
    correctAnswers: 0,
    timeSpent: 0,
    completedAt: '',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000),
    difficulty: 'Advanced',
    categoryColor: airbnbColors.secondary,
    status: 'abandoned'
  },
];

const filterOptions = [
  { id: 'all', name: 'All Quizzes', icon: 'grid-outline' },
  { id: 'completed', name: 'Completed', icon: 'checkmark-circle-outline' },
  { id: 'high-score', name: 'High Score (80%+)', icon: 'trophy-outline' },
  { id: 'recent', name: 'This Week', icon: 'time-outline' },
];

export default function QuizHistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return airbnbColors.success;
    if (score >= 60) return airbnbColors.orange;
    return airbnbColors.error;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const calculateStats = () => {
    const completedQuizzes = quizHistory.filter(quiz => quiz.status === 'completed');
    const totalScore = completedQuizzes.reduce((sum, quiz) => sum + quiz.score, 0);
    const averageScore = completedQuizzes.length > 0 ? Math.round(totalScore / completedQuizzes.length) : 0;
    const totalTime = completedQuizzes.reduce((sum, quiz) => sum + quiz.timeSpent, 0);
    const highScores = completedQuizzes.filter(quiz => quiz.score >= 80).length;
    
    return {
      totalCompleted: completedQuizzes.length,
      averageScore,
      totalTime,
      highScores,
      completionRate: Math.round((completedQuizzes.length / quizHistory.length) * 100)
    };
  };

  const stats = calculateStats();

  const filteredHistory = quizHistory.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (selectedFilter) {
      case 'completed':
        return matchesSearch && quiz.status === 'completed';
      case 'high-score':
        return matchesSearch && quiz.score >= 80;
      case 'recent':
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return matchesSearch && quiz.date > weekAgo;
      default:
        return matchesSearch;
    }
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleQuizPress = (quiz: typeof quizHistory[0]) => {
    if (quiz.status === 'completed') {
      router.push(`/quiz-results?id=${quiz.id}`);
    } else {
      router.push(`/quiz-interface?id=${quiz.id}&resume=true`);
    }
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

  const renderQuizItem = ({ item }: { item: typeof quizHistory[0] }) => (
    <TouchableOpacity 
      style={styles.quizItem}
      onPress={() => handleQuizPress(item)}
      activeOpacity={0.8}
    >
      <Card style={styles.quizCard}>
        <View style={styles.quizHeader}>
          <View style={styles.quizInfo}>
            <View style={styles.quizTitleRow}>
              <Text variant="subtitle1" style={styles.quizTitle}>{item.title}</Text>
              {item.status === 'abandoned' && (
                <View style={styles.abandonedBadge}>
                  <Text style={styles.abandonedText}>Incomplete</Text>
                </View>
              )}
            </View>
            <View style={styles.quizMeta}>
              <View style={[styles.categoryBadge, { backgroundColor: item.categoryColor + '20' }]}>
                <Text style={[styles.categoryText, { color: item.categoryColor }]}>{item.category}</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
                  {item.difficulty}
                </Text>
              </View>
            </View>
          </View>
          
          {item.status === 'completed' && (
            <View style={styles.scoreContainer}>
              <Text variant="h5" style={[styles.scoreText, { color: getScoreColor(item.score) }]}>
                {item.score}%
              </Text>
              <Text variant="caption" style={styles.scoreLabel}>Score</Text>
            </View>
          )}
        </View>
        
        <View style={styles.quizStats}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Ionicons name="help-circle-outline" size={14} color={airbnbColors.mediumGray} />
              <Text variant="caption" style={styles.statText}>
                {item.status === 'completed' ? `${item.correctAnswers}/${item.totalQuestions}` : `${item.totalQuestions} questions`}
              </Text>
            </View>
            
            {item.status === 'completed' && (
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color={airbnbColors.mediumGray} />
                <Text variant="caption" style={styles.statText}>{item.timeSpent} min</Text>
              </View>
            )}
            
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={14} color={airbnbColors.mediumGray} />
              <Text variant="caption" style={styles.statText}>{formatDate(item.date)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.quizActions}>
          {item.status === 'completed' ? (
            <TouchableOpacity style={styles.actionButton} onPress={() => handleQuizPress(item)}>
              <Text style={styles.actionButtonText}>View Results</Text>
              <Ionicons name="arrow-forward" size={14} color={airbnbColors.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.actionButton} onPress={() => handleQuizPress(item)}>
              <Text style={styles.actionButtonText}>Resume Quiz</Text>
              <Ionicons name="play" size={14} color={airbnbColors.primary} />
            </TouchableOpacity>
          )}
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
              <Text variant="h4" style={styles.headerTitle}>Quiz History</Text>
              <Text variant="body2" style={styles.headerSubtitle}>
                Track your learning progress
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
          {/* Stats Overview */}
          <Card style={styles.statsCard}>
            <Text variant="h6" style={styles.statsTitle}>Your Performance</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statColumn}>
                <Text variant="h5" style={[styles.statNumber, { color: airbnbColors.primary }]}>
                  {stats.totalCompleted}
                </Text>
                <Text variant="caption" style={styles.statLabel}>Completed</Text>
              </View>
              
              <View style={styles.statColumn}>
                <Text variant="h5" style={[styles.statNumber, { color: airbnbColors.success }]}>
                  {stats.averageScore}%
                </Text>
                <Text variant="caption" style={styles.statLabel}>Avg. Score</Text>
              </View>
              
              <View style={styles.statColumn}>
                <Text variant="h5" style={[styles.statNumber, { color: airbnbColors.orange }]}>
                  {stats.totalTime}
                </Text>
                <Text variant="caption" style={styles.statLabel}>Total Hours</Text>
              </View>
              
              <View style={styles.statColumn}>
                <Text variant="h5" style={[styles.statNumber, { color: airbnbColors.blue }]}>
                  {stats.highScores}
                </Text>
                <Text variant="caption" style={styles.statLabel}>High Scores</Text>
              </View>
            </View>
          </Card>

          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={airbnbColors.mediumGray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search quiz history..."
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

          {/* Quiz History List */}
          <FlatList
            data={filteredHistory}
            renderItem={renderQuizItem}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[airbnbColors.primary]}
                tintColor={airbnbColors.primary}
              />
            }
            contentContainerStyle={styles.historyList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={64} color={airbnbColors.mediumGray} />
                <Text variant="h6" style={styles.emptyStateTitle}>No quiz history found</Text>
                <Text variant="body2" style={styles.emptyStateText}>
                  {searchQuery || selectedFilter !== 'all' 
                    ? "Try adjusting your search or filter criteria"
                    : "Start taking quizzes to see your progress here"
                  }
                </Text>
                <Button
                  title={searchQuery || selectedFilter !== 'all' ? "Clear Filters" : "Take Your First Quiz"}
                  variant="outline"
                  onPress={() => {
                    if (searchQuery || selectedFilter !== 'all') {
                      setSearchQuery('');
                      setSelectedFilter('all');
                    } else {
                      router.push('/(tabs)/(quiz)/categories');
                    }
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
  statsCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statsTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statColumn: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.xl,
  },
  statLabel: {
    color: airbnbColors.mediumGray,
    marginTop: spacing.xs,
    fontSize: typography.fontSizes.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  historyList: {
    paddingBottom: 100, // Increased from spacing.xxl to ensure content is fully visible
  },
  quizItem: {
    marginBottom: spacing.md,
  },
  quizCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quizTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.semibold,
    flex: 1,
  },
  abandonedBadge: {
    backgroundColor: airbnbColors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: spacing.sm,
  },
  abandonedText: {
    color: airbnbColors.warning,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  quizMeta: {
    flexDirection: 'row',
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    textTransform: 'uppercase',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontWeight: typography.fontWeights.bold,
  },
  scoreLabel: {
    color: airbnbColors.mediumGray,
    fontSize: typography.fontSizes.xs,
  },
  quizStats: {
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    color: airbnbColors.mediumGray,
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.xs,
  },
  quizActions: {
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: airbnbColors.primaryLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  actionButtonText: {
    color: airbnbColors.primary,
    fontWeight: typography.fontWeights.semibold,
    marginRight: spacing.xs,
    fontSize: typography.fontSizes.sm,
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