import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Text } from '../../../components/ui/Typography';

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

const { width } = Dimensions.get('window');

export default function QuizResultsScreen() {
  const {
    score = '0',
    totalQuestions = '0',
    correctAnswers = '0',
    timeTaken = '0',
    quizId = '',
    quizTitle = 'Quiz Results'
  } = useLocalSearchParams();

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [performanceLevel, setPerformanceLevel] = useState('');
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Convert score to number for animations and feedback
    const scoreNum = parseInt(score as string, 10);
    
    // Generate performance level and feedback
    if (scoreNum >= 90) {
      setPerformanceLevel('Outstanding');
      setFeedbackMessage("🎉 Outstanding performance! You've truly mastered this vocabulary. Your dedication shows!");
    } else if (scoreNum >= 80) {
      setPerformanceLevel('Excellent');
      setFeedbackMessage("🌟 Excellent work! You have a strong command of this vocabulary. Keep up the great work!");
    } else if (scoreNum >= 70) {
      setPerformanceLevel('Good');
      setFeedbackMessage("👏 Good job! You're on the right track. A bit more practice will make you even better.");
    } else if (scoreNum >= 50) {
      setPerformanceLevel('Fair');
      setFeedbackMessage("📚 Fair attempt! Don't worry, vocabulary mastery takes time. Keep practicing!");
    } else {
      setPerformanceLevel('Needs Improvement');
      setFeedbackMessage("💪 Keep going! Every expert was once a beginner. Practice makes perfect!");
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(scoreAnim, {
        toValue: scoreNum,
        duration: 1500,
        useNativeDriver: false,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [score]);

  // Convert params to numbers for calculations
  const scoreNum = parseInt(score as string, 10);
  const totalQuestionsNum = parseInt(totalQuestions as string, 10);
  const correctAnswersNum = parseInt(correctAnswers as string, 10);
  const timeTakenNum = parseInt(timeTaken as string, 10);
  
  // Calculate additional stats
  const averageTimePerQuestion = totalQuestionsNum > 0 ? Math.round((timeTakenNum / totalQuestionsNum) * 10) / 10 : 0;
  const incorrectAnswers = totalQuestionsNum - correctAnswersNum;
  const accuracy = totalQuestionsNum > 0 ? Math.round((correctAnswersNum / totalQuestionsNum) * 100) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return airbnbColors.success;
    if (score >= 80) return airbnbColors.blue;
    if (score >= 70) return airbnbColors.orange;
    if (score >= 50) return airbnbColors.warning;
    return airbnbColors.error;
  };

  const getPerformanceBadgeColor = (level: string) => {
    switch (level) {
      case 'Outstanding': return airbnbColors.success;
      case 'Excellent': return airbnbColors.blue;
      case 'Good': return airbnbColors.orange;
      case 'Fair': return airbnbColors.warning;
      default: return airbnbColors.error;
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/(quiz)')}
          >
            <Ionicons name="arrow-back" size={24} color={airbnbColors.charcoal} />
          </TouchableOpacity>
          <Text variant="h5" style={styles.headerTitle}>Quiz Results</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              // Share results functionality
              console.log('Share results');
            }}
          >
            <Ionicons name="share-outline" size={24} color={airbnbColors.charcoal} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Score Card */}
          <Animated.View 
            style={[
              styles.mainScoreContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Card style={styles.mainScoreCard}>
              <View style={styles.celebrationHeader}>
                <View style={[styles.celebrationIcon, { backgroundColor: getScoreColor(scoreNum) + '20' }]}>
                  <Ionicons 
                    name={scoreNum >= 70 ? "trophy" : "medal"} 
                    size={40} 
                    color={getScoreColor(scoreNum)} 
                  />
                </View>
                <View style={[styles.performanceBadge, { backgroundColor: getPerformanceBadgeColor(performanceLevel) + '20' }]}>
                  <Text style={[styles.performanceBadgeText, { color: getPerformanceBadgeColor(performanceLevel) }]}>
                    {performanceLevel}
                  </Text>
                </View>
              </View>

              <View style={styles.scoreDisplay}>
                <Animated.Text style={[styles.mainScore, { color: getScoreColor(scoreNum) }]}>
                  {Math.round(scoreNum)}%
                </Animated.Text>
                <Text variant="body1" style={styles.scoreSubtitle}>Final Score</Text>
              </View>
              
              <Text variant="body1" style={styles.feedbackMessage}>
                {feedbackMessage}
              </Text>

              {/* Quick Stats Row */}
              <View style={styles.quickStatsRow}>
                <View style={styles.quickStat}>
                  <Text variant="h6" style={[styles.quickStatValue, { color: airbnbColors.success }]}>
                    {correctAnswersNum}
                  </Text>
                  <Text variant="caption" style={styles.quickStatLabel}>Correct</Text>
                </View>
                
                <View style={styles.quickStatDivider} />
                
                <View style={styles.quickStat}>
                  <Text variant="h6" style={[styles.quickStatValue, { color: airbnbColors.error }]}>
                    {incorrectAnswers}
                  </Text>
                  <Text variant="caption" style={styles.quickStatLabel}>Incorrect</Text>
                </View>
                
                <View style={styles.quickStatDivider} />
                
                <View style={styles.quickStat}>
                  <Text variant="h6" style={[styles.quickStatValue, { color: airbnbColors.blue }]}>
                    {formatTime(timeTakenNum)}
                  </Text>
                  <Text variant="caption" style={styles.quickStatLabel}>Time</Text>
                </View>
              </View>
            </Card>
          </Animated.View>

          {/* Detailed Statistics */}
          <Card style={styles.statsCard}>
            <Text variant="h6" style={styles.sectionTitle}>Detailed Analysis</Text>
            
            {/* Progress Bars */}
            <View style={styles.progressSection}>
              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text variant="body2" style={styles.progressLabel}>Accuracy</Text>
                  <Text variant="subtitle2" style={[styles.progressValue, { color: airbnbColors.success }]}>
                    {accuracy}%
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <Animated.View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${accuracy}%`]
                        }),
                        backgroundColor: airbnbColors.success 
                      }
                    ]} 
                  />
                </View>
              </View>

              <View style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text variant="body2" style={styles.progressLabel}>Speed</Text>
                  <Text variant="subtitle2" style={[styles.progressValue, { color: airbnbColors.blue }]}>
                    {averageTimePerQuestion}s/question
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <Animated.View 
                    style={[
                      styles.progressBar, 
                      { 
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${Math.min((15 - averageTimePerQuestion) / 15 * 100, 100)}%`]
                        }),
                        backgroundColor: airbnbColors.blue 
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <View style={[styles.statIcon, { backgroundColor: airbnbColors.primary + '20' }]}>
                  <Ionicons name="checkmark-circle" size={24} color={airbnbColors.primary} />
                </View>
                <Text variant="h5" style={styles.statNumber}>{correctAnswersNum}/{totalQuestionsNum}</Text>
                <Text variant="caption" style={styles.statLabel}>Questions Answered Correctly</Text>
              </View>

              <View style={styles.statBox}>
                <View style={[styles.statIcon, { backgroundColor: airbnbColors.orange + '20' }]}>
                  <Ionicons name="time" size={24} color={airbnbColors.orange} />
                </View>
                <Text variant="h5" style={styles.statNumber}>{formatTime(timeTakenNum)}</Text>
                <Text variant="caption" style={styles.statLabel}>Total Time Spent</Text>
              </View>
            </View>
          </Card>

          {/* Performance Insights */}
          <Card style={styles.insightsCard}>
            <Text variant="h6" style={styles.sectionTitle}>Performance Insights</Text>
            
            <View style={styles.insightsList}>
              {scoreNum >= 80 && (
                <View style={styles.insightItem}>
                  <View style={[styles.insightIcon, { backgroundColor: airbnbColors.success + '20' }]}>
                    <Ionicons name="trending-up" size={20} color={airbnbColors.success} />
                  </View>
                  <Text style={styles.insightText}>Strong vocabulary foundation demonstrated</Text>
                </View>
              )}
              
              {averageTimePerQuestion <= 8 && (
                <View style={styles.insightItem}>
                  <View style={[styles.insightIcon, { backgroundColor: airbnbColors.blue + '20' }]}>
                    <Ionicons name="flash" size={20} color={airbnbColors.blue} />
                  </View>
                  <Text style={styles.insightText}>Quick thinking and good recall speed</Text>
                </View>
              )}
              
              {scoreNum < 70 && (
                <View style={styles.insightItem}>
                  <View style={[styles.insightIcon, { backgroundColor: airbnbColors.orange + '20' }]}>
                    <Ionicons name="book" size={20} color={airbnbColors.orange} />
                  </View>
                  <Text style={styles.insightText}>Review vocabulary definitions and practice more</Text>
                </View>
              )}
              
              {averageTimePerQuestion > 12 && (
                <View style={styles.insightItem}>
                  <View style={[styles.insightIcon, { backgroundColor: airbnbColors.warning + '20' }]}>
                    <Ionicons name="stopwatch" size={20} color={airbnbColors.warning} />
                  </View>
                  <Text style={styles.insightText}>Practice timed exercises to improve speed</Text>
                </View>
              )}
            </View>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title="Practice Again"
              variant="primary"
              onPress={() => router.replace('/(tabs)/(quiz)/interface?mode=practice')}
              style={styles.primaryButton}
              leftIcon={<Ionicons name="refresh" size={18} color={airbnbColors.white} />}
            />
            
            <View style={styles.secondaryButtons}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.replace('/(tabs)/(quiz)/interface?mode=timed')}
              >
                <Ionicons name="timer" size={20} color={airbnbColors.primary} />
                <Text style={styles.secondaryButtonText}>Timed Challenge</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => router.replace('/(tabs)/(quiz)/categories')}
              >
                <Ionicons name="library" size={20} color={airbnbColors.primary} />
                <Text style={styles.secondaryButtonText}>More Quizzes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Suggestions */}
          <Card style={styles.suggestionsCard}>
            <Text variant="h6" style={styles.sectionTitle}>Continue Learning</Text>
            
            <View style={styles.suggestionsList}>
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => router.push('/(tabs)/(learning)')}
              >
                <View style={styles.suggestionContent}>
                  <View style={[styles.suggestionIcon, { backgroundColor: airbnbColors.green + '20' }]}>
                    <Ionicons name="book-outline" size={24} color={airbnbColors.green} />
                  </View>
                  <View style={styles.suggestionInfo}>
                    <Text variant="subtitle2" style={styles.suggestionTitle}>Review Lessons</Text>
                    <Text variant="caption" style={styles.suggestionDesc}>
                      Strengthen your foundation with interactive lessons
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => router.push('/(tabs)/(quiz)/history')}
              >
                <View style={styles.suggestionContent}>
                  <View style={[styles.suggestionIcon, { backgroundColor: airbnbColors.purple + '20' }]}>
                    <Ionicons name="analytics-outline" size={24} color={airbnbColors.purple} />
                  </View>
                  <View style={styles.suggestionInfo}>
                    <Text variant="subtitle2" style={styles.suggestionTitle}>View Progress</Text>
                    <Text variant="caption" style={styles.suggestionDesc}>
                      Track your learning journey and achievements
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.suggestionItem}
                onPress={() => router.push('/(tabs)/(quiz)/categories')}
              >
                <View style={styles.suggestionContent}>
                  <View style={[styles.suggestionIcon, { backgroundColor: airbnbColors.orange + '20' }]}>
                    <Ionicons name="library-outline" size={24} color={airbnbColors.orange} />
                  </View>
                  <View style={styles.suggestionInfo}>
                    <Text variant="subtitle2" style={styles.suggestionTitle}>Explore Categories</Text>
                    <Text variant="caption" style={styles.suggestionDesc}>
                      Discover new topics and expand your knowledge
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
              </TouchableOpacity>
            </View>
          </Card>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: airbnbColors.white,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold,
  },
  shareButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  mainScoreContainer: {
    marginBottom: spacing.xl,
  },
  mainScoreCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  performanceBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  performanceBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    textTransform: 'uppercase',
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  mainScore: {
    fontSize: 48,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  scoreSubtitle: {
    color: airbnbColors.mediumGray,
    fontWeight: typography.fontWeights.medium,
  },
  feedbackMessage: {
    textAlign: 'center',
    color: airbnbColors.darkGray,
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  quickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 12,
    width: '100%',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: airbnbColors.mediumGray,
    marginHorizontal: spacing.xl,
  },
  quickStatValue: {
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs / 2,
  },
  quickStatLabel: {
    color: airbnbColors.mediumGray,
    fontSize: typography.fontSizes.xs,
    textTransform: 'uppercase',
  },
  statsCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.lg,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressItem: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    color: airbnbColors.darkGray,
    fontWeight: typography.fontWeights.medium,
  },
  progressValue: {
    fontWeight: typography.fontWeights.semibold,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 0.48,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statNumber: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    color: airbnbColors.mediumGray,
    textAlign: 'center',
    fontSize: typography.fontSizes.xs,
  },
  insightsCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  insightsList: {
    gap: spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  insightText: {
    flex: 1,
    color: airbnbColors.darkGray,
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
  },
  actionsContainer: {
    marginBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: airbnbColors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: airbnbColors.lightGray,
  },
  secondaryButtonText: {
    color: airbnbColors.primary,
    fontWeight: typography.fontWeights.semibold,
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.sm,
  },
  suggestionsCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  suggestionsList: {
    gap: spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 12,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs / 2,
  },
  suggestionDesc: {
    color: airbnbColors.mediumGray,
    fontSize: typography.fontSizes.xs,
    lineHeight: 16,
  },
});