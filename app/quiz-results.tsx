import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { borderRadius, colors, spacing, typography } from '../components/ui/theme';
import Text from '../components/ui/Typography';

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

  useEffect(() => {
    // Generate feedback message based on score
    const scoreNum = parseInt(score as string, 10);
    if (scoreNum >= 90) {
      setFeedbackMessage("Excellent work! You've mastered this vocabulary.");
    } else if (scoreNum >= 70) {
      setFeedbackMessage("Good job! You have a strong grasp of this vocabulary.");
    } else if (scoreNum >= 50) {
      setFeedbackMessage("Not bad. With a bit more practice, you'll improve your vocabulary skills.");
    } else {
      setFeedbackMessage("Keep practicing! Vocabulary takes time to master.");
    }
  }, [score]);

  // Convert params to numbers for calculations
  const scoreNum = parseInt(score as string, 10);
  const totalQuestionsNum = parseInt(totalQuestions as string, 10);
  const correctAnswersNum = parseInt(correctAnswers as string, 10);
  const timeTakenNum = parseInt(timeTaken as string, 10);
  
  // Calculate additional stats
  const averageTimePerQuestion = totalQuestionsNum > 0 ? Math.round((timeTakenNum / totalQuestionsNum) * 10) / 10 : 0;
  const incorrectAnswers = totalQuestionsNum - correctAnswersNum;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/(quiz)')}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral.darkGray} />
        </TouchableOpacity>
        <Text variant="h5" style={styles.headerTitle}>Quiz Results</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.scoreCard}>
            <View style={styles.scoreCircleContainer}>
              <View style={styles.scoreCircle}>
                <Text variant="h1" style={styles.scoreText}>{scoreNum}%</Text>
              </View>
            </View>
            
            <Text variant="h6" style={styles.feedbackMessage}>
              {feedbackMessage}
            </Text>
          </Card>
          
          <Card style={styles.statsCard}>
            <Text variant="subtitle1" style={styles.cardTitle}>Statistics</Text>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="caption" style={styles.statLabel}>Total Questions</Text>
                <Text variant="h5" style={styles.statValue}>{totalQuestionsNum}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="caption" style={styles.statLabel}>Correct Answers</Text>
                <Text variant="h5" style={[styles.statValue, styles.correctValue]}>
                  {correctAnswersNum}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="caption" style={styles.statLabel}>Incorrect</Text>
                <Text variant="h5" style={[styles.statValue, styles.incorrectValue]}>
                  {incorrectAnswers}
                </Text>
              </View>
            </View>
            
            <View style={styles.timeStats}>
              <View style={styles.timeStatItem}>
                <Ionicons name="time-outline" size={20} color={colors.secondary.main} />
                <Text variant="body2" style={styles.timeStatLabel}>
                  Total time: <Text style={styles.timeStatValue}>{timeTakenNum}s</Text>
                </Text>
              </View>
              
              <View style={styles.timeStatItem}>
                <Ionicons name="stopwatch-outline" size={20} color={colors.secondary.main} />
                <Text variant="body2" style={styles.timeStatLabel}>
                  Avg time per question: <Text style={styles.timeStatValue}>{averageTimePerQuestion}s</Text>
                </Text>
              </View>
            </View>
          </Card>
          
          <View style={styles.visualStats}>
            <Card style={[styles.visualStatCard, { backgroundColor: colors.status.success + '20' }]}>
              <Text variant="subtitle2" style={styles.visualStatLabel}>Correct</Text>
              <View style={styles.visualBarContainer}>
                <View 
                  style={[
                    styles.visualBar, 
                    { 
                      width: `${(correctAnswersNum / totalQuestionsNum) * 100}%`,
                      backgroundColor: colors.status.success 
                    }
                  ]} 
                />
              </View>
              <Text variant="h6" style={[styles.visualStatValue, { color: colors.status.success }]}>
                {correctAnswersNum}/{totalQuestionsNum}
              </Text>
            </Card>
            
            <Card style={[styles.visualStatCard, { backgroundColor: colors.status.error + '20' }]}>
              <Text variant="subtitle2" style={styles.visualStatLabel}>Incorrect</Text>
              <View style={styles.visualBarContainer}>
                <View 
                  style={[
                    styles.visualBar, 
                    { 
                      width: `${(incorrectAnswers / totalQuestionsNum) * 100}%`,
                      backgroundColor: colors.status.error 
                    }
                  ]} 
                />
              </View>
              <Text variant="h6" style={[styles.visualStatValue, { color: colors.status.error }]}>
                {incorrectAnswers}/{totalQuestionsNum}
              </Text>
            </Card>
          </View>
          
          <View style={styles.actions}>
            <Button
              title="Try Again"
              variant="primary"
              onPress={() => router.replace('/quiz-interface')}
              style={styles.actionButton}
              leftIcon={<Ionicons name="refresh" size={18} color="white" />}
            />
            
            <Button
              title="Browse Quizzes"
              variant="outline"
              onPress={() => router.replace('/(tabs)/(quiz)')}
              style={styles.actionButton}
              leftIcon={<Ionicons name="grid-outline" size={18} color={colors.primary.main} />}
            />
          </View>

          <View style={styles.suggestionsContainer}>
            <Text variant="subtitle1" style={styles.suggestionsTitle}>
              Suggested Actions
            </Text>
            
            <View style={styles.suggestionCards}>
              <TouchableOpacity 
                style={styles.suggestionCard}
                onPress={() => router.push('/(tabs)/(learning)')}
              >
                <Ionicons name="book-outline" size={24} color={colors.primary.main} />
                <Text variant="body2" style={styles.suggestionText}>Review Lessons</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.suggestionCard}
                onPress={() => router.push('/(tabs)/(quiz)/categories?category=vocabulary')}
              >
                <Ionicons name="repeat" size={24} color={colors.secondary.main} />
                <Text variant="body2" style={styles.suggestionText}>More Vocabulary</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.suggestionCard}
                onPress={() => router.push('/(tabs)/(profile)/stats')}
              >
                <Ionicons name="stats-chart" size={24} color={colors.accent} />
                <Text variant="body2" style={styles.suggestionText}>View All Stats</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const scoreCircleSize = Math.min(width * 0.4, 150);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    textAlign: 'center',
  },
  placeholder: {
    width: 24, // Same size as the back button icon
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  scoreCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  scoreCircleContainer: {
    marginVertical: spacing.md,
  },
  scoreCircle: {
    width: scoreCircleSize,
    height: scoreCircleSize,
    borderRadius: scoreCircleSize / 2,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    color: colors.neutral.white,
    fontWeight: typography.fontWeights.bold,
  },
  feedbackMessage: {
    textAlign: 'center',
    marginVertical: spacing.md,
    color: colors.neutral.text,
  },
  statsCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  cardTitle: {
    marginBottom: spacing.md,
    color: colors.neutral.darkGray,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: colors.neutral.darkGray,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontWeight: typography.fontWeights.bold,
  },
  correctValue: {
    color: colors.status.success,
  },
  incorrectValue: {
    color: colors.status.error,
  },
  timeStats: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingTop: spacing.md,
  },
  timeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeStatLabel: {
    color: colors.neutral.darkGray,
    marginLeft: spacing.sm,
  },
  timeStatValue: {
    fontWeight: typography.fontWeights.bold,
    color: colors.secondary.main,
  },
  visualStats: {
    marginBottom: spacing.lg,
  },
  visualStatCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visualStatLabel: {
    width: 70,
    color: colors.neutral.darkGray,
  },
  visualBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: borderRadius.full,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  visualBar: {
    height: '100%',
  },
  visualStatValue: {
    width: 50,
    textAlign: 'right',
    fontWeight: typography.fontWeights.bold,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 0.48,
  },
  suggestionsContainer: {
    marginBottom: spacing.xl,
  },
  suggestionsTitle: {
    marginBottom: spacing.md,
    color: colors.neutral.darkGray,
  },
  suggestionCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  suggestionCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestionText: {
    marginTop: spacing.sm,
    textAlign: 'center',
    color: colors.neutral.text,
  },
});