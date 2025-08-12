import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

const quizCategories = [
  { 
    id: '1', 
    title: 'Grammar', 
    subtitle: 'Master language rules',
    icon: 'school-outline', 
    color: airbnbColors.purple,
    lightColor: '#F3F4F6',
    quizCount: 24,
    difficulty: 'Beginner to Advanced'
  },
  { 
    id: '2', 
    title: 'Vocabulary', 
    subtitle: 'Expand your word bank',
    icon: 'book-outline', 
    color: airbnbColors.green,
    lightColor: '#ECFDF5',
    quizCount: 18,
    difficulty: 'All Levels'
  },
  { 
    id: '3', 
    title: 'Pronunciation', 
    subtitle: 'Perfect your accent',
    icon: 'mic-outline', 
    color: airbnbColors.orange,
    lightColor: '#FFFBEB',
    quizCount: 12,
    difficulty: 'Intermediate'
  },
  { 
    id: '4', 
    title: 'Conversation', 
    subtitle: 'Practice real dialogues',
    icon: 'chatbubbles-outline', 
    color: airbnbColors.blue,
    lightColor: '#EFF6FF',
    quizCount: 15,
    difficulty: 'Intermediate to Advanced'
  },
];

const recentQuizzes = [
  {
    id: '1',
    title: 'Present Perfect Tense',
    category: 'Grammar',
    score: 85,
    totalQuestions: 20,
    completedAt: '2 hours ago',
    difficulty: 'Intermediate'
  },
  {
    id: '2',
    title: 'Business Vocabulary',
    category: 'Vocabulary',
    score: 92,
    totalQuestions: 15,
    completedAt: '1 day ago',
    difficulty: 'Advanced'
  },
];

export default function QuizIndex() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalCompleted: 47,
    averageScore: 86,
    streak: 5,
    weeklyGoal: 10,
    weeklyProgress: 7
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

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

  const renderCategoryCard = ({ item, index }: { item: typeof quizCategories[0]; index: number }) => (
    <TouchableOpacity 
      key={item.id}
      style={[styles.categoryCard, { marginRight: index === quizCategories.length - 1 ? spacing.lg : spacing.md }]}
      onPress={() => router.push(`/(tabs)/(quiz)/categories?initial=${item.id}`)}
      activeOpacity={0.8}
    >
      <Card style={[styles.categoryCardContent, { backgroundColor: item.lightColor }]}>
        <View style={[styles.categoryIconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={28} color={item.color} />
        </View>
        
        <View style={styles.categoryInfo}>
          <Text variant="subtitle1" style={styles.categoryTitle}>{item.title}</Text>
          <Text variant="caption" style={styles.categorySubtitle}>{item.subtitle}</Text>
          
          <View style={styles.categoryMeta}>
            <View style={styles.categoryMetaItem}>
              <Ionicons name="book" size={12} color={airbnbColors.mediumGray} />
              <Text variant="caption" style={styles.categoryMetaText}>{item.quizCount} quizzes</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
                {item.difficulty.split(' ')[0]}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderRecentQuiz = ({ item }: { item: typeof recentQuizzes[0] }) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.recentQuizCard}
      onPress={() => router.push(`/quiz-results?id=${item.id}`)}
      activeOpacity={0.8}
    >
      <Card style={styles.recentQuizContent}>
        <View style={styles.recentQuizHeader}>
          <View style={styles.recentQuizInfo}>
            <Text variant="subtitle2" style={styles.recentQuizTitle}>{item.title}</Text>
            <Text variant="caption" style={styles.recentQuizCategory}>{item.category}</Text>
          </View>
          <View style={styles.recentQuizScore}>
            <Text variant="h6" style={[styles.scoreText, { color: item.score >= 80 ? airbnbColors.success : item.score >= 60 ? airbnbColors.orange : airbnbColors.error }]}>
              {item.score}%
            </Text>
          </View>
        </View>
        
        <View style={styles.recentQuizFooter}>
          <Text variant="caption" style={styles.recentQuizMeta}>
            {item.totalQuestions} questions • {item.completedAt}
          </Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
              {item.difficulty}
            </Text>
          </View>
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
            <View>
              <Text variant="h3" style={styles.headerTitle}>Quiz Center</Text>
              <Text variant="body2" style={styles.headerSubtitle}>
                Challenge yourself and track progress
              </Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profileImageContainer}>
                <Text style={styles.profileInitial}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[airbnbColors.primary]}
              tintColor={airbnbColors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Stats Overview */}
            <View style={styles.statsSection}>
              <Card style={styles.statsCard}>
                <View style={styles.statsHeader}>
                  <Text variant="h5" style={styles.sectionTitle}>Your Progress</Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/(quiz)/history')}>
                    <Text variant="body2" style={styles.seeAllText}>View all</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text variant="h4" style={[styles.statNumber, { color: airbnbColors.primary }]}>
                      {userStats.totalCompleted}
                    </Text>
                    <Text variant="caption" style={styles.statLabel}>Completed</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text variant="h4" style={[styles.statNumber, { color: airbnbColors.success }]}>
                      {userStats.averageScore}%
                    </Text>
                    <Text variant="caption" style={styles.statLabel}>Avg. Score</Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text variant="h4" style={[styles.statNumber, { color: airbnbColors.orange }]}>
                      {userStats.streak}
                    </Text>
                    <Text variant="caption" style={styles.statLabel}>Day Streak</Text>
                  </View>
                </View>
                
                {/* Weekly Goal Progress */}
                <View style={styles.goalSection}>
                  <View style={styles.goalHeader}>
                    <Text variant="subtitle2" style={styles.goalTitle}>Weekly Goal</Text>
                    <Text variant="caption" style={styles.goalProgress}>
                      {userStats.weeklyProgress}/{userStats.weeklyGoal} quizzes
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${(userStats.weeklyProgress / userStats.weeklyGoal) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              </Card>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <Text variant="h5" style={styles.sectionTitle}>Quick Start</Text>
              
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={[styles.quickActionCard, { backgroundColor: airbnbColors.primaryLight }]}
                  onPress={() => router.push('/(tabs)/(quiz)/interface?mode=practice')}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: airbnbColors.primary + '20' }]}>
                    <Ionicons name="flash" size={24} color={airbnbColors.primary} />
                  </View>
                  <Text variant="subtitle2" style={styles.quickActionTitle}>Practice Quiz</Text>
                  <Text variant="caption" style={styles.quickActionSubtitle}>Random questions</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.quickActionCard, { backgroundColor: airbnbColors.secondaryLight }]}
                  onPress={() => router.push('/(tabs)/(quiz)/interface?mode=timed')}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: airbnbColors.secondary + '20' }]}>
                    <Ionicons name="timer" size={24} color={airbnbColors.secondary} />
                  </View>
                  <Text variant="subtitle2" style={styles.quickActionTitle}>Timed Challenge</Text>
                  <Text variant="caption" style={styles.quickActionSubtitle}>Beat the clock</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.categoriesSection}>
              <View style={styles.sectionHeader}>
                <Text variant="h5" style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/(quiz)/categories')}>
                  <Text variant="body2" style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScrollView}
                contentContainerStyle={styles.categoriesContent}
              >
                {quizCategories.map((item, index) => renderCategoryCard({ item, index }))}
              </ScrollView>
            </View>

            {/* Recent Quizzes */}
            {recentQuizzes.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeader}>
                  <Text variant="h5" style={styles.sectionTitle}>Recent Activity</Text>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/(quiz)/history')}>
                    <Text variant="body2" style={styles.seeAllText}>View history</Text>
                  </TouchableOpacity>
                </View>
                
                {recentQuizzes.map((item) => renderRecentQuiz({ item }))}
              </View>
            )}

            {/* Call to Action */}
            <View style={styles.ctaSection}>
              <Card style={[styles.ctaCard, { backgroundColor: airbnbColors.primary }]}>
                <View style={styles.ctaContent}>
                  <View style={styles.ctaText}>
                    <Text variant="h6" style={styles.ctaTitle}>Ready for a challenge?</Text>
                    <Text variant="body2" style={styles.ctaSubtitle}>
                      Test your knowledge across all categories
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.ctaButton}
                    onPress={() => router.push('/(tabs)/(quiz)/categories')}
                  >
                    <Text variant="button" style={styles.ctaButtonText}>Start Quiz</Text>
                    <Ionicons name="arrow-forward" size={16} color={airbnbColors.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            </View>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.xxl,
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 100, // Increased from spacing.xxl (48) to ensure CTA card is fully visible
  },
  sectionTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  seeAllText: {
    color: airbnbColors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.xxl,
  },
  statLabel: {
    color: airbnbColors.mediumGray,
    marginTop: spacing.xs,
    fontSize: typography.fontSizes.xs,
  },
  goalSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  goalTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.medium,
  },
  goalProgress: {
    color: airbnbColors.mediumGray,
  },
  progressBarContainer: {
    marginTop: spacing.xs,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: airbnbColors.primary,
    borderRadius: 3,
  },
  quickActionsSection: {
    marginBottom: spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.semibold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  quickActionSubtitle: {
    color: airbnbColors.mediumGray,
    textAlign: 'center',
    fontSize: typography.fontSizes.xs,
  },
  categoriesSection: {
    marginBottom: spacing.xl,
  },
  categoriesScrollView: {
    marginTop: spacing.md,
  },
  categoriesContent: {
    paddingRight: spacing.lg,
  },
  categoryCard: {
    width: 200,
  },
  categoryCardContent: {
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  categorySubtitle: {
    color: airbnbColors.mediumGray,
    marginBottom: spacing.md,
    fontSize: typography.fontSizes.sm,
  },
  categoryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryMetaText: {
    color: airbnbColors.mediumGray,
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.xs,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  recentSection: {
    marginBottom: spacing.xl,
  },
  recentQuizCard: {
    marginBottom: spacing.md,
  },
  recentQuizContent: {
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recentQuizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  recentQuizInfo: {
    flex: 1,
  },
  recentQuizTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.xs,
  },
  recentQuizCategory: {
    color: airbnbColors.primary,
    fontSize: typography.fontSizes.xs,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeights.semibold,
  },
  recentQuizScore: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.lg,
  },
  recentQuizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentQuizMeta: {
    color: airbnbColors.mediumGray,
    fontSize: typography.fontSizes.xs,
  },
  ctaSection: {
    marginTop: spacing.lg,
  },
  ctaCard: {
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    color: airbnbColors.white,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  ctaSubtitle: {
    color: airbnbColors.white,
    opacity: 0.9,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: airbnbColors.primary,
    fontWeight: typography.fontWeights.semibold,
    marginRight: spacing.xs,
  },
});