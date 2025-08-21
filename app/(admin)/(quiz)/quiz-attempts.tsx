import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { colors, spacing, typography } from '../../../components/ui/theme';
import { Typography } from '../../../components/ui/Typography';
import { authService } from '../../../services/appwrite/auth-service';
import { quizService } from '../../../services/appwrite/quiz-service';

// Airbnb color palette
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#FF3347',
  primaryLight: '#FF8589',
  secondary: '#00A699',
  secondaryDark: '#008F85',
  secondaryLight: '#57C1BA',
  neutral: colors.neutral,
  accent: colors.accent,
  status: colors.status
};

interface QuizAttempt {
  $id: string;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  completed: boolean;
  createdAt: string;
  userName?: string;
  quizTitle?: string;
  answers?: any[];
  timeSpent?: number;
}

export default function QuizAttemptsScreen() {
  const [loading, setLoading] = useState(true);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchQuizAttempts() {
      try {
        setLoading(true);
        // Specifically fetch from 'quiz_attempts' collection
        const attempts = await quizService.getQuizAttempts();
        
        // Fetch additional user and quiz information for each attempt
        const enhancedAttempts = await Promise.all(
          attempts.map(async (attempt) => {
            try {
              // Get user details
              const userData = await authService.getUserById(attempt.userId);
              
              // Get quiz details
              const quizData = await quizService.getQuiz(attempt.quizId);
              
              return {
                ...attempt,
                userName: userData ? `${userData.name}` : 'Unknown User',
                quizTitle: quizData ? quizData.title : 'Unknown Quiz'
              };
            } catch (error) {
              console.error('Error fetching details for attempt:', error);
              return {
                ...attempt,
                userName: 'Unknown User',
                quizTitle: 'Unknown Quiz'
              };
            }
          })
        );
        
        setQuizAttempts(enhancedAttempts);
      } catch (error) {
        console.error('Error fetching quiz attempts:', error);
        setError('Failed to load quiz attempts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchQuizAttempts();
  }, []);

  // Format date for better readability
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate percentage score
  const calculatePercentage = (score: number, total: number) => {
    return total > 0 ? Math.round((score / total) * 100) : 0;
  };

  // Format time spent
  const formatTimeSpent = (seconds?: number) => {
    if (!seconds) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  const renderScoreColor = (percentage: number) => {
    if (percentage >= 80) return airbnbColors.secondary; // Green for high scores
    if (percentage >= 60) return '#FFC107'; // Yellow for medium scores
    return airbnbColors.primary; // Red for low scores
  };

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={[airbnbColors.primary, airbnbColors.primaryDark]} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Typography style={styles.headerTitle}>Quiz Attempts</Typography>
            <Typography style={styles.headerSubtitle}>
              Review and analyze student quiz performance
            </Typography>
          </View>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <Typography>Loading quiz attempts...</Typography>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Typography color="error">{error}</Typography>
          <Button 
            onPress={() => router.reload()}
            style={{backgroundColor: airbnbColors.primary}}
          >
            Retry
          </Button>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <Card style={[styles.statCard, {borderColor: airbnbColors.primary}]}>
              <Ionicons name="document-text-outline" size={28} color={airbnbColors.primary} />
              <Typography variant="h2" style={styles.statValue}>{quizAttempts.length}</Typography>
              <Typography style={styles.statLabel}>Total Attempts</Typography>
            </Card>
            <Card style={[styles.statCard, {borderColor: airbnbColors.secondary}]}>
              <Ionicons name="checkmark-circle-outline" size={28} color={airbnbColors.secondary} />
              <Typography variant="h2" style={styles.statValue}>
                {quizAttempts.filter(attempt => attempt.completed).length}
              </Typography>
              <Typography style={styles.statLabel}>Completed</Typography>
            </Card>
            <Card style={[styles.statCard, {borderColor: airbnbColors.primaryLight}]}>
              <Ionicons name="star-outline" size={28} color={airbnbColors.primaryLight} />
              <Typography variant="h2" style={styles.statValue}>
                {quizAttempts.length > 0 
                  ? `${Math.round(quizAttempts.reduce((acc, curr) => 
                      acc + calculatePercentage(curr.score, curr.totalQuestions), 0
                    ) / quizAttempts.length)}%`
                  : 'N/A'
                }
              </Typography>
              <Typography style={styles.statLabel}>Avg. Score</Typography>
            </Card>
          </View>

          <View style={styles.listHeader}>
            <Typography style={styles.listTitle}>Recent Attempts</Typography>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => router.reload()}
            >
              <Ionicons name="refresh" size={18} color={airbnbColors.primary} />
              <Typography style={[styles.refreshText, {color: airbnbColors.primary}]}>Refresh</Typography>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.attemptsList}>
            {quizAttempts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={airbnbColors.primary} style={{marginBottom: 16}} />
                <Typography variant="h3" style={{marginBottom: 8}}>No quiz attempts found</Typography>
                <Typography style={{textAlign: 'center', maxWidth: '80%'}}>
                  Quiz attempts will appear here once users start taking quizzes.
                </Typography>
              </View>
            ) : (
              quizAttempts.map(attempt => (
                <Card key={attempt.$id} style={styles.attemptCard}>
                  <View style={styles.attemptHeader}>
                    <View>
                      <Typography variant="h3" style={styles.quizTitle}>{attempt.quizTitle}</Typography>
                      <Typography style={styles.userName}>{attempt.userName}</Typography>
                    </View>
                    <View style={[
                      styles.scoreContainer, 
                      { backgroundColor: renderScoreColor(calculatePercentage(attempt.score, attempt.totalQuestions)) }
                    ]}>
                      <Typography style={styles.scoreText}>
                        {attempt.score}/{attempt.totalQuestions}
                      </Typography>
                    </View>
                  </View>
                  
                  <View style={styles.attemptDetails}>
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={16} color={colors.neutral.darkGray} />
                        <Typography style={styles.detailText}>{formatDate(attempt.createdAt)}</Typography>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={16} color={colors.neutral.darkGray} />
                        <Typography style={styles.detailText}>{formatTimeSpent(attempt.timeSpent)}</Typography>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name={attempt.completed ? "checkmark-circle-outline" : "time-outline"} 
                                  size={16} 
                                  color={attempt.completed ? airbnbColors.secondary : '#FFC107'} />
                        <Typography style={[styles.detailText, {
                          color: attempt.completed ? airbnbColors.secondary : '#FFC107'
                        }]}>
                          {attempt.completed ? 'Completed' : 'In Progress'}
                        </Typography>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="bar-chart-outline" size={16} color={colors.neutral.darkGray} />
                        <Typography style={styles.detailText}>
                          {calculatePercentage(attempt.score, attempt.totalQuestions)}% Score
                        </Typography>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.actionContainer}>
                    <Link href={`/admin/quiz/attempt-details?id=${attempt.$id}`} asChild>
                      <Button style={styles.viewButton}>
                        <Typography style={styles.viewButtonText}>View Details</Typography>
                        <Ionicons name="arrow-forward" size={16} color={airbnbColors.primary} />
                      </Button>
                    </Link>
                  </View>
                </Card>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.heading,
    fontWeight: typography.fontWeights.bold,
    color: colors.neutral.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.md,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    marginHorizontal: 5,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    backgroundColor: colors.neutral.white,
  },
  statValue: {
    fontSize: typography.fontSizes.heading,
    fontWeight: typography.fontWeights.bold,
    marginVertical: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  listTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.neutral.text,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
  },
  refreshText: {
    marginLeft: 4,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  attemptsList: {
    flex: 1,
  },
  attemptCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.neutral.white,
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  quizTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.neutral.text,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
  },
  scoreContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  scoreText: {
    color: 'white',
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
  },
  attemptDetails: {
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: spacing.sm,
  },
  detailText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
  },
  viewButtonText: {
    color: airbnbColors.primary,
    marginRight: spacing.xs,
    fontWeight: typography.fontWeights.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    marginVertical: spacing.xl,
  },
});