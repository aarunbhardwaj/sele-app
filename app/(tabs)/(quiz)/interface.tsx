import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Text } from '../../../components/ui/Typography';
import appwriteService from '../../../services/appwrite';

// Types
interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  passScore: number;
  questions: Question[];
}

interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeTaken: number;
  answers: {
    questionId: string;
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

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

// Mock quiz data
const MOCK_QUIZ = {
  id: '1',
  title: 'Vocabulary Practice',
  description: 'Test your vocabulary knowledge',
  timeLimit: 10,
  passScore: 70,
  questions: [
    {
      id: 'q1',
      text: 'What is the meaning of "extraordinary"?',
      options: [
        'Very unusual or remarkable',
        'Ordinary and common',
        'Related to extraterrestrial life',
        'Outside of normal boundaries'
      ],
      correctAnswer: 'Very unusual or remarkable',
      explanation: 'Extraordinary means very unusual or remarkable, going beyond what is normal or expected.',
      points: 10
    },
    {
      id: 'q2',
      text: 'Which word means "to make something less severe"?',
      options: [
        'Aggravate',
        'Mitigate',
        'Accelerate',
        'Terminate'
      ],
      correctAnswer: 'Mitigate',
      explanation: 'Mitigate means to make something less severe, serious, or painful.',
      points: 10
    },
    {
      id: 'q3',
      text: 'What does "ubiquitous" mean?',
      options: [
        'Rare and hard to find',
        'Present everywhere',
        'Ancient and old',
        'Mysterious and unknown'
      ],
      correctAnswer: 'Present everywhere',
      explanation: 'Ubiquitous means present, appearing, or found everywhere; omnipresent.',
      points: 10
    },
    {
      id: 'q4',
      text: 'Which word means "showing great care and attention to detail"?',
      options: [
        'Careless',
        'Meticulous',
        'Hasty',
        'Approximate'
      ],
      correctAnswer: 'Meticulous',
      explanation: 'Meticulous means showing great attention to detail; very careful and precise.',
      points: 10
    },
    {
      id: 'q5',
      text: 'What does "ephemeral" mean?',
      options: [
        'Lasting forever',
        'Very large',
        'Lasting for a very short time',
        'Extremely beautiful'
      ],
      correctAnswer: 'Lasting for a very short time',
      explanation: 'Ephemeral means lasting for a very short time; transitory.',
      points: 10
    },
  ],
};

const { width } = Dimensions.get('window');

export default function QuizInterfaceScreen() {
  const { quizId, mode } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [results, setResults] = useState<QuizResult>({
    totalQuestions: 0,
    correctAnswers: 0,
    score: 0,
    timeTaken: 0,
    answers: []
  });
  const [showFeedback, setShowFeedback] = useState(false);

  // Animation values
  const timerAnimation = useRef(new Animated.Value(1)).current;
  const questionAnimation = useRef(new Animated.Value(1)).current;
  const optionAnimations = useRef<Animated.Value[]>([]).current;
  const feedbackAnimation = useRef(new Animated.Value(0)).current;
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  const quizStartTime = useRef(Date.now());

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      // Use mock data for timed challenge/vocabulary practice
      if (!quizId || mode === 'practice' || mode === 'timed') {
        setQuiz(MOCK_QUIZ);
        setQuestions(MOCK_QUIZ.questions);
        setTimeRemaining(MOCK_QUIZ.timeLimit);
        setLoading(false);
        setTimerActive(true);
        return;
      }
      
      // Fetch real quiz data from Appwrite
      const quizData = await appwriteService.getQuizById(quizId);
      const questionsData = await appwriteService.getQuestionsByQuiz(quizId);
      
      setQuiz(quizData);
      setQuestions(questionsData);
      setTimeRemaining(quizData.timeLimit || 10);
      setLoading(false);
      setTimerActive(true);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      // Fallback to mock data
      setQuiz(MOCK_QUIZ);
      setQuestions(MOCK_QUIZ.questions);
      setTimeRemaining(MOCK_QUIZ.timeLimit);
      setLoading(false);
      setTimerActive(true);
    }
  };

  // Start timer when quiz is loaded
  useEffect(() => {
    if (!loading && timeRemaining > 0 && timerActive) {
      startTimer();
      
      Animated.timing(timerAnimation, {
        toValue: 0,
        duration: timeRemaining * 1000,
        useNativeDriver: false
      }).start();
    }
    
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [loading, currentQuestionIndex, timerActive]);

  // Initialize option animations
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && currentQuestion.options) {
        optionAnimations.length = currentQuestion.options.length;
        for (let i = 0; i < currentQuestion.options.length; i++) {
          if (!optionAnimations[i]) {
            optionAnimations[i] = new Animated.Value(0);
          }
        }
        
        // Animate options in
        Animated.stagger(100, 
          optionAnimations.map(anim => 
            Animated.spring(anim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 8
            })
          )
        ).start();
      }
    }
  }, [currentQuestionIndex, questions]);

  const startTimer = () => {
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerInterval.current);
          handleTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswerValue = currentQuestion.correctAnswer;
    const isCorrect = selectedAnswer === correctAnswerValue;
    
    setResults(prev => ({
      ...prev,
      answers: [
        ...prev.answers,
        {
          questionId: currentQuestion.id,
          question: currentQuestion.text,
          selectedAnswer: selectedAnswer || 'None (time expired)',
          correctAnswer: correctAnswerValue,
          isCorrect: isCorrect
        }
      ]
    }));
    
    moveToNextQuestion();
  };

  const handleSelectAnswer = (option: string) => {
    if (selectedAnswer) return; // Prevent multiple selections
    
    setSelectedAnswer(option);
    setShowFeedback(true);
    
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswerValue = currentQuestion.correctAnswer;
    const isCorrect = option === correctAnswerValue;
    
    if (isCorrect) {
      setScore(prevScore => prevScore + (currentQuestion.points || 10));
      setCorrectAnswers(prev => prev + 1);
    }
    
    setResults(prev => ({
      ...prev,
      answers: [
        ...prev.answers,
        {
          questionId: currentQuestion.id,
          question: currentQuestion.text,
          selectedAnswer: option,
          correctAnswer: correctAnswerValue,
          isCorrect: isCorrect
        }
      ]
    }));
    
    // Stop the timer
    setTimerActive(false);
    clearInterval(timerInterval.current);
    
    // Animate feedback
    Animated.spring(feedbackAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8
    }).start();
    
    // Wait for feedback, then move to next question
    setTimeout(() => {
      moveToNextQuestion();
    }, 2500);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Reset animations
      setSelectedAnswer(null);
      setShowFeedback(false);
      feedbackAnimation.setValue(0);
      optionAnimations.forEach(anim => anim.setValue(0));
      
      // Animate question transition
      Animated.sequence([
        Animated.timing(questionAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(questionAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimerActive(true);
      setTimeRemaining(quiz.timeLimit || 10);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const timeTaken = Math.floor((Date.now() - quizStartTime.current) / 1000);
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    
    setResults(prev => ({
      ...prev,
      totalQuestions: questions.length,
      correctAnswers: correctAnswers,
      score: finalScore,
      timeTaken: timeTaken
    }));
    
    setQuizCompleted(true);
  };

  const handleFinishQuiz = () => {
    router.replace({
      pathname: '/(tabs)/(quiz)/results',
      params: {
        score: results.score,
        totalQuestions: results.totalQuestions,
        correctAnswers: results.correctAnswers,
        timeTaken: results.timeTaken,
        quizTitle: quiz?.title || 'Quiz'
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <Animated.View style={[styles.loadingSpinner, {
              transform: [{
                rotate: timerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }]
            }]}>
              <Ionicons name="school" size={48} color={airbnbColors.primary} />
            </Animated.View>
            <Text variant="h5" style={styles.loadingTitle}>Preparing your quiz...</Text>
            <Text variant="body2" style={styles.loadingSubtitle}>Get ready to challenge yourself!</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (quizCompleted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.completedContainer}>
          <Card style={styles.completedCard}>
            <View style={styles.completedHeader}>
              <View style={styles.celebrationIcon}>
                <Ionicons name="trophy" size={48} color={airbnbColors.primary} />
              </View>
              <Text variant="h3" style={styles.completedTitle}>Quiz Complete!</Text>
              <Text variant="body1" style={styles.completedSubtitle}>
                {mode === 'timed' ? 'Timed Challenge' : 'Vocabulary Practice'} finished
              </Text>
            </View>
            
            <View style={styles.quickResults}>
              <View style={styles.quickResultItem}>
                <Text variant="h2" style={[styles.quickResultValue, { color: airbnbColors.primary }]}>
                  {results.score}%
                </Text>
                <Text variant="caption" style={styles.quickResultLabel}>Score</Text>
              </View>
              
              <View style={styles.quickResultDivider} />
              
              <View style={styles.quickResultItem}>
                <Text variant="h2" style={[styles.quickResultValue, { color: airbnbColors.success }]}>
                  {results.correctAnswers}/{results.totalQuestions}
                </Text>
                <Text variant="caption" style={styles.quickResultLabel}>Correct</Text>
              </View>
            </View>
            
            <Text variant="body1" style={styles.resultMessage}>
              {results.score >= (quiz?.passScore || 70) ? 
                "🎉 Excellent work! You've mastered this vocabulary." : 
                "📚 Good effort! Keep practicing to improve your skills."}
            </Text>
            
            <View style={styles.completedActions}>
              <Button
                title="View Full Results"
                variant="primary"
                onPress={handleFinishQuiz}
                style={styles.primaryAction}
                leftIcon={<Ionicons name="analytics" size={18} color={airbnbColors.white} />}
              />
              
              <View style={styles.secondaryActions}>
                <TouchableOpacity 
                  style={styles.secondaryAction}
                  onPress={() => router.replace('/(tabs)/(quiz)/interface?mode=' + mode)}
                >
                  <Ionicons name="refresh" size={20} color={airbnbColors.primary} />
                  <Text style={styles.secondaryActionText}>Try Again</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.secondaryAction}
                  onPress={() => router.replace('/(tabs)/(quiz)')}
                >
                  <Ionicons name="home" size={20} color={airbnbColors.primary} />
                  <Text style={styles.secondaryActionText}>Back to Quizzes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  
  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Ionicons name="help-circle-outline" size={64} color={airbnbColors.mediumGray} />
            <Text variant="h5" style={styles.emptyTitle}>No Questions Available</Text>
            <Text style={styles.emptyMessage}>
              This quiz doesn't have any questions yet. Please try again later.
            </Text>
            <Button
              title="Back to Quizzes"
              variant="outline"
              onPress={() => router.back()}
              style={styles.emptyButton}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }
  
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const getTimerColor = () => {
    const percentage = timeRemaining / (quiz?.timeLimit || 10);
    if (percentage > 0.6) return airbnbColors.success;
    if (percentage > 0.3) return airbnbColors.warning;
    return airbnbColors.error;
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={airbnbColors.charcoal} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text variant="subtitle1" style={styles.quizMode}>
              {mode === 'timed' ? 'Timed Challenge' : 'Vocabulary Practice'}
            </Text>
            <Text variant="h5" style={styles.quizTitle}>{quiz?.title}</Text>
          </View>
          
          <View style={styles.progressInfo}>
            <Text variant="caption" style={styles.progressText}>
              {currentQuestionIndex + 1} of {totalQuestions}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { width: `${progress}%` }
              ]} 
            />
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <View style={styles.timerContent}>
            <Ionicons name="time" size={20} color={getTimerColor()} />
            <Text style={[styles.timerText, { color: getTimerColor() }]}>
              {timeRemaining}s remaining
            </Text>
          </View>
          <View style={styles.timerBarContainer}>
            <Animated.View 
              style={[
                styles.timerBar,
                {
                  width: timerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: getTimerColor()
                }
              ]} 
            />
          </View>
        </View>

        {/* Question */}
        <Animated.View 
          style={[
            styles.questionContainer,
            {
              opacity: questionAnimation,
              transform: [{
                translateY: questionAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0]
                })
              }]
            }
          ]}
        >
          <Card style={styles.questionCard}>
            <Text variant="h5" style={styles.questionText}>{currentQuestion.text}</Text>
            
            <View style={styles.optionsContainer}>
              {currentQuestion.options?.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showCorrect = selectedAnswer && isCorrect;
                const showIncorrect = selectedAnswer && isSelected && !isCorrect;
                
                return (
                  <Animated.View
                    key={index}
                    style={{
                      opacity: optionAnimations[index] || 1,
                      transform: [{
                        translateX: (optionAnimations[index] || new Animated.Value(1)).interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0]
                        })
                      }]
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        isSelected && styles.selectedOption,
                        showCorrect && styles.correctOption,
                        showIncorrect && styles.incorrectOption,
                      ]}
                      onPress={() => handleSelectAnswer(option)}
                      disabled={selectedAnswer !== null}
                    >
                      <Text 
                        style={[
                          styles.optionText,
                          isSelected && styles.selectedOptionText,
                          showCorrect && styles.correctOptionText,
                          showIncorrect && styles.incorrectOptionText,
                        ]}
                      >
                        {option}
                      </Text>
                      
                      <View style={styles.optionIndicator}>
                        {showCorrect && (
                          <View style={styles.correctIndicator}>
                            <Ionicons name="checkmark" size={20} color={airbnbColors.white} />
                          </View>
                        )}
                        {showIncorrect && (
                          <View style={styles.incorrectIndicator}>
                            <Ionicons name="close" size={20} color={airbnbColors.white} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </Card>
        </Animated.View>

        {/* Feedback */}
        {showFeedback && (
          <Animated.View 
            style={[
              styles.feedbackContainer,
              {
                opacity: feedbackAnimation,
                transform: [{
                  translateY: feedbackAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0]
                  })
                }]
              }
            ]}
          >
            <Card style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <View style={[
                  styles.feedbackIcon,
                  { backgroundColor: selectedAnswer === currentQuestion.correctAnswer ? airbnbColors.success : airbnbColors.error }
                ]}>
                  <Ionicons 
                    name={selectedAnswer === currentQuestion.correctAnswer ? "checkmark" : "close"} 
                    size={24} 
                    color={airbnbColors.white} 
                  />
                </View>
                <Text style={[
                  styles.feedbackText,
                  { color: selectedAnswer === currentQuestion.correctAnswer ? airbnbColors.success : airbnbColors.error }
                ]}>
                  {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Incorrect!"}
                </Text>
              </View>
              
              {currentQuestion.explanation && (
                <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              )}
            </Card>
          </Animated.View>
        )}

        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreItem}>
            <Text variant="caption" style={styles.scoreLabel}>Score</Text>
            <Text variant="h6" style={[styles.scoreValue, { color: airbnbColors.primary }]}>
              {Math.round((correctAnswers / Math.max(currentQuestionIndex, 1)) * 100)}%
            </Text>
          </View>
          
          <View style={styles.scoreItem}>
            <Text variant="caption" style={styles.scoreLabel}>Streak</Text>
            <Text variant="h6" style={[styles.scoreValue, { color: airbnbColors.success }]}>
              {correctAnswers}/{currentQuestionIndex + (selectedAnswer ? 1 : 0)}
            </Text>
          </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: airbnbColors.white,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  closeButton: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  quizMode: {
    color: airbnbColors.primary,
    textTransform: 'uppercase',
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  quizTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold,
  },
  progressInfo: {
    alignItems: 'flex-end',
  },
  progressText: {
    color: airbnbColors.mediumGray,
    fontWeight: typography.fontWeights.medium,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: airbnbColors.white,
  },
  progressBar: {
    height: 4,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: airbnbColors.primary,
    borderRadius: 2,
  },
  timerContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: airbnbColors.white,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  timerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  timerText: {
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.md,
  },
  timerBarContainer: {
    height: 6,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    borderRadius: 3,
  },
  questionContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  questionCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: spacing.xl,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  questionText: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xl,
    lineHeight: 28,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: 12,
    backgroundColor: airbnbColors.lightGray,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 60,
  },
  selectedOption: {
    borderColor: airbnbColors.primary,
    backgroundColor: airbnbColors.primaryLight,
  },
  correctOption: {
    borderColor: airbnbColors.success,
    backgroundColor: airbnbColors.success,
  },
  incorrectOption: {
    borderColor: airbnbColors.error,
    backgroundColor: airbnbColors.error,
  },
  optionText: {
    fontSize: typography.fontSizes.md,
    color: airbnbColors.charcoal,
    flex: 1,
    fontWeight: typography.fontWeights.medium,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: airbnbColors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
  correctOptionText: {
    color: airbnbColors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  incorrectOptionText: {
    color: airbnbColors.white,
    fontWeight: typography.fontWeights.semibold,
  },
  optionIndicator: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: airbnbColors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incorrectIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: airbnbColors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
  },
  feedbackCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    padding: spacing.lg,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  feedbackIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  feedbackText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  explanationText: {
    fontSize: typography.fontSizes.sm,
    color: airbnbColors.darkGray,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: airbnbColors.white,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: airbnbColors.mediumGray,
    marginBottom: spacing.xs,
    fontSize: typography.fontSizes.xs,
  },
  scoreValue: {
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: airbnbColors.offWhite,
  },
  loadingContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingSpinner: {
    marginBottom: spacing.lg,
  },
  loadingTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
  },
  loadingSubtitle: {
    color: airbnbColors.mediumGray,
    textAlign: 'center',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  completedCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 20,
    padding: spacing.xl,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  completedHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: airbnbColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  completedTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  completedSubtitle: {
    color: airbnbColors.mediumGray,
    textAlign: 'center',
  },
  quickResults: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 12,
  },
  quickResultItem: {
    alignItems: 'center',
  },
  quickResultDivider: {
    width: 1,
    height: 40,
    backgroundColor: airbnbColors.mediumGray,
    marginHorizontal: spacing.xl,
  },
  quickResultValue: {
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  quickResultLabel: {
    color: airbnbColors.mediumGray,
    textTransform: 'uppercase',
    fontSize: typography.fontSizes.xs,
  },
  resultMessage: {
    textAlign: 'center',
    color: airbnbColors.darkGray,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  completedActions: {
    gap: spacing.lg,
  },
  primaryAction: {
    backgroundColor: airbnbColors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 12,
  },
  secondaryActionText: {
    color: airbnbColors.primary,
    fontWeight: typography.fontWeights.semibold,
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    color: airbnbColors.mediumGray,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  emptyButton: {
    alignSelf: 'stretch',
  },
});