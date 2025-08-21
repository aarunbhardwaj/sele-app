import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  updatedAt: string;
  answers: {
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    questionText?: string;
    options?: {
      id: string;
      text: string;
      isCorrect: boolean;
    }[];
  }[];
  timeSpent?: number;
  userName?: string;
  quizTitle?: string;
}

interface User {
  $id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
}

interface Quiz {
  $id: string;
  title: string;
  description: string;
  questions: {
    id: string;
    text: string;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
    }[];
  }[];
}

export default function AttemptDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAttemptDetails() {
      if (!id) {
        setError('No attempt ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get the attempt details
        const attemptData = await quizService.getQuizAttemptById(id);
        
        if (!attemptData) {
          setError('Quiz attempt not found');
          setLoading(false);
          return;
        }
        
        // Get user data
        let userData = null;
        try {
          userData = await authService.getUserById(attemptData.userId);
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
        
        // Get quiz data
        let quizData = null;
        try {
          quizData = await quizService.getQuiz(attemptData.quizId);
        } catch (error) {
          console.error('Error fetching quiz details:', error);
        }
        
        // Enhance answer data with question and option details
        const enhancedAnswers = attemptData.answers.map((answer) => {
          const question = quizData?.questions.find(q => q.id === answer.questionId);
          return {
            ...answer,
            questionText: question?.text || 'Unknown question',
            options: question?.options || []
          };
        });
        
        setAttempt({
          ...attemptData,
          answers: enhancedAnswers,
          userName: userData ? userData.name : 'Unknown User',
          quizTitle: quizData ? quizData.title : 'Unknown Quiz'
        });
        setUser(userData);
        setQuiz(quizData);
        
      } catch (error) {
        console.error('Error fetching attempt details:', error);
        setError('Failed to load attempt details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAttemptDetails();
  }, [id]);

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
  
  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={[airbnbColors.primary, airbnbColors.primaryDark]} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Typography style={styles.headerTitle}>Attempt Details</Typography>
            <Typography style={styles.headerSubtitle}>
              Quiz attempt performance analysis
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
          <Typography>Loading attempt details...</Typography>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Typography color="error">{error}</Typography>
          <Button 
            onPress={() => router.back()}
            style={{backgroundColor: airbnbColors.primary}}
          >
            Go Back
          </Button>
        </View>
      ) : attempt ? (
        <ScrollView style={styles.content}>
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Typography variant="h2" style={styles.quizTitle}>{attempt.quizTitle}</Typography>
                <View style={styles.userInfo}>
                  <Ionicons name="person" size={16} color={colors.neutral.darkGray} />
                  <Typography style={styles.userName}>{attempt.userName}</Typography>
                </View>
              </View>
              <View style={[
                styles.scoreContainer, 
                { 
                  backgroundColor: calculatePercentage(attempt.score, attempt.totalQuestions) >= 70 
                    ? airbnbColors.secondary 
                    : calculatePercentage(attempt.score, attempt.totalQuestions) >= 50
                      ? '#FFC107'
                      : airbnbColors.primary 
                }
              ]}>
                <Typography style={styles.scoreText}>
                  {attempt.score}/{attempt.totalQuestions}
                </Typography>
                <Typography style={styles.percentageText}>
                  {calculatePercentage(attempt.score, attempt.totalQuestions)}%
                </Typography>
              </View>
            </View>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={20} color={colors.neutral.darkGray} />
                <View>
                  <Typography style={styles.detailLabel}>Date Taken</Typography>
                  <Typography style={styles.detailValue}>{formatDate(attempt.createdAt)}</Typography>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color={colors.neutral.darkGray} />
                <View>
                  <Typography style={styles.detailLabel}>Time Spent</Typography>
                  <Typography style={styles.detailValue}>{formatTimeSpent(attempt.timeSpent)}</Typography>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons 
                  name={attempt.completed ? "checkmark-circle-outline" : "time-outline"} 
                  size={20} 
                  color={attempt.completed ? airbnbColors.secondary : '#FFC107'} 
                />
                <View>
                  <Typography style={styles.detailLabel}>Status</Typography>
                  <Typography 
                    style={[
                      styles.detailValue, 
                      {color: attempt.completed ? airbnbColors.secondary : '#FFC107'}
                    ]}
                  >
                    {attempt.completed ? 'Completed' : 'In Progress'}
                  </Typography>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons 
                  name="bar-chart-outline" 
                  size={20} 
                  color={colors.neutral.darkGray} 
                />
                <View>
                  <Typography style={styles.detailLabel}>Result</Typography>
                  <Typography 
                    style={[
                      styles.detailValue, 
                      {
                        color: calculatePercentage(attempt.score, attempt.totalQuestions) >= 70 
                          ? airbnbColors.secondary 
                          : calculatePercentage(attempt.score, attempt.totalQuestions) >= 50
                            ? '#FFC107'
                            : airbnbColors.primary
                      }
                    ]}
                  >
                    {calculatePercentage(attempt.score, attempt.totalQuestions) >= 70 
                      ? 'Excellent' 
                      : calculatePercentage(attempt.score, attempt.totalQuestions) >= 50
                        ? 'Good'
                        : 'Needs Improvement'}
                  </Typography>
                </View>
              </View>
            </View>
          </Card>
          
          <Typography variant="h2" style={styles.sectionTitle}>
            Question Analysis
          </Typography>
          
          {attempt.answers.map((answer, index) => (
            <Card key={answer.questionId} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <Typography variant="h3" style={styles.questionNumber}>Question {index + 1}</Typography>
                <View style={[
                  styles.answerStatus, 
                  { 
                    backgroundColor: answer.isCorrect 
                      ? airbnbColors.secondary 
                      : airbnbColors.primary
                  }
                ]}>
                  <Typography style={styles.answerStatusText}>
                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                  </Typography>
                </View>
              </View>
              
              <Typography style={styles.questionText}>{answer.questionText}</Typography>
              
              <View style={styles.optionsContainer}>
                {answer.options?.map((option) => (
                  <TouchableOpacity 
                    key={option.id}
                    style={[
                      styles.optionItem,
                      option.id === answer.selectedOptionId && option.isCorrect && styles.correctSelectedOption,
                      option.id === answer.selectedOptionId && !option.isCorrect && styles.incorrectSelectedOption,
                      option.id !== answer.selectedOptionId && option.isCorrect && styles.correctOption,
                    ]}
                    disabled={true}
                  >
                    <View style={styles.optionContent}>
                      <Typography 
                        style={[
                          styles.optionText,
                          option.id === answer.selectedOptionId && option.isCorrect && styles.correctSelectedOptionText,
                          option.id === answer.selectedOptionId && !option.isCorrect && styles.incorrectSelectedOptionText,
                          option.id !== answer.selectedOptionId && option.isCorrect && styles.correctOptionText,
                        ]}
                      >
                        {option.text}
                      </Typography>
                      
                      {option.id === answer.selectedOptionId && (
                        <Ionicons 
                          name={option.isCorrect ? "checkmark-circle" : "close-circle"} 
                          size={20} 
                          color={option.isCorrect ? airbnbColors.secondary : airbnbColors.primary} 
                        />
                      )}
                      
                      {option.id !== answer.selectedOptionId && option.isCorrect && (
                        <Ionicons 
                          name="checkmark-circle-outline" 
                          size={20} 
                          color={airbnbColors.secondary} 
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              
              {!answer.isCorrect && (
                <View style={styles.feedbackContainer}>
                  <Typography style={styles.feedbackTitle}>Explanation:</Typography>
                  <Typography style={styles.feedbackText}>
                    The correct answer is highlighted. This question tests your understanding of this concept.
                  </Typography>
                </View>
              )}
            </Card>
          ))}
          
          <View style={styles.actionButtons}>
            <Button 
              onPress={() => router.back()}
              style={styles.backToListButton}
            >
              <Ionicons name="arrow-back-outline" size={18} color={airbnbColors.primary} style={{marginRight: 4}} />
              <Typography style={{color: airbnbColors.primary}}>Back to List</Typography>
            </Button>
            
            <Button 
              onPress={() => router.push(`/admin/users/user-profile?id=${attempt.userId}`)}
              style={styles.viewUserButton}
            >
              <Typography style={{color: colors.neutral.white}}>View User Profile</Typography>
              <Ionicons name="person-outline" size={18} color={colors.neutral.white} style={{marginLeft: 4}} />
            </Button>
          </View>
        </ScrollView>
      ) : null}
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
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.neutral.white,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  quizTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.neutral.text,
    marginBottom: spacing.xs,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.darkGray,
    marginLeft: spacing.xs,
  },
  scoreContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    alignItems: 'center',
  },
  scoreText: {
    color: 'white',
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.lg,
  },
  percentageText: {
    color: 'white',
    fontSize: typography.fontSizes.sm,
    opacity: 0.9,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderColor: colors.neutral.lightGray,
    paddingTop: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    width: '50%',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  detailLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
    marginLeft: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.neutral.text,
    marginLeft: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.neutral.text,
    marginVertical: spacing.lg,
  },
  questionCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.neutral.white,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  questionNumber: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.neutral.text,
  },
  answerStatus: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  answerStatusText: {
    color: 'white',
    fontWeight: typography.fontWeights.medium,
    fontSize: typography.fontSizes.sm,
  },
  questionText: {
    fontSize: typography.fontSizes.md,
    marginBottom: spacing.md,
    color: colors.neutral.darkGray,
  },
  optionsContainer: {
    marginBottom: spacing.md,
  },
  optionItem: {
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    backgroundColor: colors.neutral.white,
  },
  correctSelectedOption: {
    borderColor: airbnbColors.secondary,
    backgroundColor: 'rgba(0, 166, 153, 0.1)',
  },
  incorrectSelectedOption: {
    borderColor: airbnbColors.primary,
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
  },
  correctOption: {
    borderColor: airbnbColors.secondary,
    borderStyle: 'dashed',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
  },
  correctSelectedOptionText: {
    color: airbnbColors.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  incorrectSelectedOptionText: {
    color: airbnbColors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  correctOptionText: {
    color: airbnbColors.secondary,
  },
  feedbackContainer: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
  feedbackTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  feedbackText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xl,
  },
  backToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 90, 95, 0.1)',
  },
  viewUserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    backgroundColor: airbnbColors.primary,
  },
});