import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { borderRadius, colors, spacing, typography } from '../components/ui/theme';
import Text from '../components/ui/Typography';
import appwriteService from '../services/appwrite';

// Mock quiz data
const MOCK_QUIZ = {
  id: '1',
  title: 'React Basics Quiz',
  description: 'Test your knowledge of React fundamentals',
  questions: [
    {
      id: 'q1',
      text: 'What is JSX?',
      options: [
        { id: 'a', text: 'A JavaScript XML syntax extension' },
        { id: 'b', text: 'A new programming language' },
        { id: 'c', text: 'A database query language' },
        { id: 'd', text: 'A styling framework' },
      ],
      correctAnswer: 'a',
    },
    {
      id: 'q2',
      text: 'Which hook is used to perform side effects in a function component?',
      options: [
        { id: 'a', text: 'useState' },
        { id: 'b', text: 'useContext' },
        { id: 'c', text: 'useEffect' },
        { id: 'd', text: 'useReducer' },
      ],
      correctAnswer: 'c',
    },
    {
      id: 'q3',
      text: 'What is the virtual DOM in React?',
      options: [
        { id: 'a', text: 'A complete copy of the actual DOM' },
        { id: 'b', text: 'A lightweight JavaScript representation of the DOM' },
        { id: 'c', text: 'A browser extension for React' },
        { id: 'd', text: 'A special HTML syntax' },
      ],
      correctAnswer: 'b',
    },
  ],
};

export default function QuizInterfaceScreen() {
  const { quizId, mode } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [results, setResults] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    score: 0,
    timeTaken: 0,
    answers: []
  });

  // Animation for timer
  const timerAnimation = useRef(new Animated.Value(1)).current;
  const timerInterval = useRef(null);
  const quizStartTime = useRef(Date.now());

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      
      // If no quizId, use demo data
      if (!quizId) {
        // Mock quiz data for vocabulary practice
        const mockQuiz = {
          $id: 'demo-quiz',
          title: 'Vocabulary Practice',
          description: 'Test your vocabulary knowledge',
          timeLimit: 10, // 10 seconds per question
          passScore: 70
        };
        
        const mockQuestions = [
          {
            $id: 'q1',
            text: 'What is the meaning of "apple"?',
            type: 'multiple-choice',
            options: ["A fruit", "A vegetable", "A car", "A computer"],
            correctAnswer: "A fruit",
            explanation: "An apple is a round fruit with red, green, or yellow skin and firm white flesh",
            points: 10
          },
          {
            $id: 'q2',
            text: 'What is the meaning of "book"?',
            type: 'multiple-choice',
            options: ["A vehicle", "A written work", "A food", "A place"],
            correctAnswer: "A written work",
            explanation: "A book is a written or printed work consisting of pages bound together",
            points: 10
          },
          {
            $id: 'q3',
            text: 'What is the meaning of "car"?',
            type: 'multiple-choice',
            options: ["A fruit", "A building", "A vehicle", "A tool"],
            correctAnswer: "A vehicle",
            explanation: "A car is a road vehicle with an engine, four wheels, and seats for a small number of people",
            points: 10
          }
        ];
        
        setQuiz(mockQuiz);
        setQuestions(mockQuestions);
        setTimeRemaining(mockQuiz.timeLimit);
        setLoading(false);
        setTimerActive(true);
        return;
      }
      
      // Fetch real quiz data from Appwrite
      const quizData = await appwriteService.getQuizById(quizId);
      const questionsData = await appwriteService.getQuestionsByQuiz(quizId);
      
      setQuiz(quizData);
      setQuestions(questionsData);
      
      // Check if there are any questions
      if (questionsData.length === 0) {
        // No questions available
        setLoading(false);
        // Don't start the timer for a quiz with no questions
        setTimerActive(false);
        return;
      }
      
      setTimeRemaining(quizData.timeLimit);
      setLoading(false);
      setTimerActive(true);
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      // Fallback to demo data
      fetchQuizData();
    }
  };

  // Start timer when quiz is loaded
  useEffect(() => {
    if (!loading && timeRemaining > 0 && timerActive) {
      startTimer();
      
      // Reset timer animation
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
    // Record the answer as incorrect if no answer selected
    const currentQuestion = questions[currentQuestionIndex];
    // Support both correctAnswer and correctOption field names
    const correctAnswerValue = currentQuestion.correctOption || currentQuestion.correctAnswer;
    const isCorrect = selectedAnswer === correctAnswerValue;
    
    // Store answer in results
    setResults(prev => ({
      ...prev,
      answers: [
        ...prev.answers,
        {
          questionId: currentQuestion.$id,
          question: currentQuestion.text,
          selectedAnswer: selectedAnswer || 'None (time expired)',
          correctAnswer: correctAnswerValue,
          isCorrect: isCorrect
        }
      ]
    }));
    
    // Auto-advance to next question
    moveToNextQuestion();
  };

  const handleSelectAnswer = (option) => {
    setSelectedAnswer(option);
    
    // Check if answer is correct
    const currentQuestion = questions[currentQuestionIndex];
    // Support both correctAnswer and correctOption field names
    const correctAnswerValue = currentQuestion.correctOption || currentQuestion.correctAnswer;
    const isCorrect = option === correctAnswerValue;
    
    if (isCorrect) {
      setScore(prevScore => prevScore + (currentQuestion.points || 10));
      setCorrectAnswers(prev => prev + 1);
    }
    
    // Store answer in results
    setResults(prev => ({
      ...prev,
      answers: [
        ...prev.answers,
        {
          questionId: currentQuestion.$id,
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
    
    // Wait a moment to show feedback, then move to next question
    setTimeout(() => {
      moveToNextQuestion();
    }, 1500);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimerActive(true);
      // Reset timer to quiz's time limit
      setTimeRemaining(quiz.timeLimit);
    } else {
      // Quiz completed
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
    
    // If logged in, record the quiz attempt
    const recordAttempt = async () => {
      try {
        const currentUser = await appwriteService.getCurrentUser();
        if (currentUser && quiz.$id !== 'demo-quiz') {
          await appwriteService.recordQuizAttempt(
            currentUser.$id,
            quiz.$id,
            {
              score: finalScore,
              totalQuestions: questions.length,
              correctAnswers: correctAnswers,
              timeSpent: timeTaken,
              answers: results.answers,
              passed: finalScore >= quiz.passScore,
              completedAt: new Date().toISOString()
            }
          );
        }
      } catch (error) {
        console.error('Failed to record quiz attempt:', error);
      }
    };
    
    recordAttempt();
  };

  const handleFinishQuiz = () => {
    // Navigate to results page with quiz results
    router.replace({
      pathname: '/quiz-results',
      params: {
        score: results.score,
        totalQuestions: results.totalQuestions,
        correctAnswers: results.correctAnswers,
        timeTaken: results.timeTaken
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <Card style={styles.completedCard}>
          <Text variant="h4" style={styles.completedTitle}>Quiz Completed!</Text>
          
          <View style={styles.resultSummary}>
            <View style={styles.resultItem}>
              <Text variant="h5" style={styles.resultValue}>{results.score}%</Text>
              <Text variant="caption" style={styles.resultLabel}>Score</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text variant="h5" style={styles.resultValue}>{results.correctAnswers}/{results.totalQuestions}</Text>
              <Text variant="caption" style={styles.resultLabel}>Correct</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text variant="h5" style={styles.resultValue}>{results.timeTaken}s</Text>
              <Text variant="caption" style={styles.resultLabel}>Time</Text>
            </View>
          </View>
          
          <Text variant="body1" style={styles.resultMessage}>
            {results.score >= quiz.passScore ? 
              "Great job! You passed the quiz." : 
              "Keep practicing to improve your score."}
          </Text>
          
          <Button
            title="See Detailed Results"
            variant="primary"
            fullWidth
            onPress={handleFinishQuiz}
            style={styles.seeResultsButton}
          />
          
          <Button
            title="Try Again"
            variant="outline"
            fullWidth
            onPress={() => router.replace('/quiz-interface')}
            style={[styles.seeResultsButton, {marginTop: spacing.md}]}
          />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text variant="button" style={styles.backButtonText}>
              Back to Quizzes
            </Text>
          </TouchableOpacity>
        </Card>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  
  // If no questions are available, show a message
  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
            <Ionicons name="close-outline" size={28} color={colors.neutral.darkGray} />
          </TouchableOpacity>
          <Text variant="h5" style={styles.quizTitle}>{quiz?.title || 'Quiz'}</Text>
        </View>
        
        <Card style={styles.emptyStateCard}>
          <Ionicons name="help-circle-outline" size={64} color={colors.primary.main} style={styles.emptyStateIcon} />
          <Text variant="h5" style={styles.emptyStateTitle}>No Questions Available</Text>
          <Text style={styles.emptyStateMessage}>
            This quiz doesn't have any questions yet. {mode === 'preview' ? 'Add questions to this quiz before previewing.' : 'Please check back later.'}
          </Text>
          
          {mode === 'preview' && (
            <Button
              title="Add Questions"
              variant="primary"
              fullWidth
              onPress={() => router.push({
                pathname: `/admin/quiz/edit`,
                params: { id: quizId, tab: 'questions' }
              })}
              style={styles.emptyStateButton}
            />
          )}
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text variant="button" style={styles.backButtonText}>
              Back to Quizzes
            </Text>
          </TouchableOpacity>
        </Card>
      </SafeAreaView>
    );
  }
  
  // Calculate progress
  const progress = (currentQuestionIndex / totalQuestions) * 100;

  // Calculate timer color based on time remaining
  const getTimerColor = () => {
    if (!quiz?.timeLimit) return colors.primary.main;
    if (timeRemaining > quiz.timeLimit * 0.6) return colors.status.success;
    if (timeRemaining > quiz.timeLimit * 0.3) return colors.status.warning;
    return colors.status.error;
  };

  // Guard against undefined current question
  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading question...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
          <Ionicons name="close-outline" size={28} color={colors.neutral.darkGray} />
        </TouchableOpacity>
        <Text variant="h5" style={styles.quizTitle}>{quiz?.title || 'Quiz'}</Text>
        <View style={styles.progressContainer}>
          <Text variant="caption" style={styles.progressText}>
            {currentQuestionIndex + 1}/{totalQuestions}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.timerContainer}>
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
        <Text style={[styles.timerText, { color: getTimerColor() }]}>
          {timeRemaining}s
        </Text>
      </View>

      <Card style={styles.questionCard}>
        <Text variant="h5" style={styles.questionText}>{currentQuestion.text}</Text>
        
        <View style={styles.optionsContainer}>
          {Array.isArray(currentQuestion.options) ? currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option && styles.selectedOption,
                selectedAnswer && option === currentQuestion.correctAnswer && styles.correctOption,
                selectedAnswer === option && option !== currentQuestion.correctAnswer && styles.incorrectOption,
              ]}
              onPress={() => handleSelectAnswer(option)}
              disabled={selectedAnswer !== null}
            >
              <Text 
                style={[
                  styles.optionText,
                  selectedAnswer === option && styles.selectedOptionText,
                  selectedAnswer && option === currentQuestion.correctAnswer && styles.correctOptionText,
                  selectedAnswer === option && option !== currentQuestion.correctAnswer && styles.incorrectOptionText,
                ]}
              >
                {option}
              </Text>
              {selectedAnswer && option === currentQuestion.correctAnswer && (
                <Ionicons name="checkmark-circle" size={24} color="white" style={styles.optionIcon} />
              )}
              {selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                <Ionicons name="close-circle" size={24} color="white" style={styles.optionIcon} />
              )}
            </TouchableOpacity>
          )) : (
            <Text style={styles.optionText}>No options available</Text>
          )}
        </View>
      </Card>

      {selectedAnswer && (
        <View style={styles.feedbackContainer}>
          <Text style={[
            styles.feedbackText, 
            selectedAnswer === currentQuestion.correctAnswer ? styles.correctFeedback : styles.incorrectFeedback
          ]}>
            {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Incorrect!"}
          </Text>
          {currentQuestion.explanation && (
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
          )}
        </View>
      )}

      <View style={styles.scoreContainer}>
        <Text variant="subtitle2" style={styles.scoreText}>Score: {score}</Text>
        <Text variant="subtitle2" style={styles.scoreText}>
          Correct: {correctAnswers}/{currentQuestionIndex + (selectedAnswer ? 1 : 0)}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.neutral.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.neutral.darkGray,
  },
  header: {
    marginBottom: spacing.md,
  },
  backIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    padding: spacing.xs,
  },
  quizTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressText: {
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
  },
  timerContainer: {
    height: 40,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  timerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: colors.primary.main,
  },
  timerText: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.neutral.darkGray,
  },
  questionCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  questionText: {
    marginBottom: spacing.lg,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    marginBottom: spacing.sm,
  },
  selectedOption: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.light + '20',
  },
  correctOption: {
    borderColor: colors.status.success,
    backgroundColor: colors.status.success,
  },
  incorrectOption: {
    borderColor: colors.status.error,
    backgroundColor: colors.status.error,
  },
  optionText: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: typography.fontWeights.bold,
    color: colors.primary.main,
  },
  correctOptionText: {
    fontWeight: typography.fontWeights.bold,
    color: colors.neutral.white,
  },
  incorrectOptionText: {
    fontWeight: typography.fontWeights.bold,
    color: colors.neutral.white,
  },
  optionIcon: {
    marginLeft: spacing.sm,
  },
  feedbackContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.neutral.white,
  },
  feedbackText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  correctFeedback: {
    color: colors.status.success,
  },
  incorrectFeedback: {
    color: colors.status.error,
  },
  explanationText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.sm,
  },
  scoreText: {
    color: colors.primary.main,
  },
  completedCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  completedTitle: {
    color: colors.primary.main,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  resultSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.xl,
  },
  resultItem: {
    alignItems: 'center',
  },
  resultValue: {
    color: colors.primary.main,
    fontWeight: typography.fontWeights.bold,
  },
  resultLabel: {
    color: colors.neutral.darkGray,
  },
  resultMessage: {
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.neutral.darkGray,
  },
  seeResultsButton: {
    width: '100%',
  },
  backButton: {
    marginTop: spacing.xl,
    padding: spacing.sm,
  },
  backButtonText: {
    color: colors.neutral.darkGray,
    textAlign: 'center',
  },
  emptyStateCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptyStateIcon: {
    marginBottom: spacing.md,
  },
  emptyStateTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.sm,
    color: colors.neutral.darkGray,
  },
  emptyStateMessage: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
    marginBottom: spacing.md,
  },
  emptyStateButton: {
    width: '100%',
  },
});