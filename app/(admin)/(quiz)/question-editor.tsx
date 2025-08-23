import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
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

// Airbnb Colors (matching lesson-view.tsx and quiz-list.tsx)
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

// Airbnb Typography
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

// Airbnb Spacing
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
}

interface Question {
  $id: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

interface AirbnbTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  variant?: 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'small';
  color?: string;
  numberOfLines?: number;
  [key: string]: any;
}

function QuestionEditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { quizId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  
  // Question form state
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState('1');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  // Errors state
  const [errors, setErrors] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: ''
  });

  // Create Airbnb-style Text component
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

  const fetchQuizData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get quiz data
      const quizData = await appwriteService.getQuizById(quizId);
      setQuiz(quizData);
      
      // Get questions for this quiz
      const quizQuestions = await appwriteService.getQuestionsByQuiz(quizId);
      setQuestions(quizQuestions);
    } catch (error) {
      console.error('Failed to fetch quiz data:', error);
      Alert.alert('Error', 'Failed to load quiz data: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (!quizId) {
      Alert.alert('Error', 'Quiz ID not provided');
      router.back();
      return;
    }
    
    fetchQuizData();
  }, [quizId, fetchQuizData]);

  const validateQuestionForm = () => {
    let isValid = true;
    const newErrors = {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: ''
    };
    
    if (!questionText.trim()) {
      newErrors.questionText = 'Question text is required';
      isValid = false;
    }
    
    // Check if at least two options are filled
    const filledOptions = options.filter(option => option.trim() !== '');
    if (filledOptions.length < 2) {
      newErrors.options[0] = 'At least two options are required';
      isValid = false;
    }
    
    // Check if options are filled
    options.forEach((option, index) => {
      if (index <= 1 && !option.trim()) {
        newErrors.options[index] = 'This option is required';
        isValid = false;
      }
    });
    
    // Check if correct answer is selected and valid
    if (correctAnswer === null || correctAnswer === undefined || 
        correctAnswer < 0 || correctAnswer >= options.length || 
        !options[correctAnswer]?.trim()) {
      newErrors.correctAnswer = 'Valid correct answer must be selected';
      isValid = false;
    }
    
    // Validate points
    if (!points.trim() || isNaN(Number(points)) || Number(points) <= 0) {
      newErrors.points = 'Points must be a positive number';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const resetQuestionForm = () => {
    setQuestionText('');
    setQuestionType('multiple-choice');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setExplanation('');
    setPoints('1');
    setEditingQuestion(null);
    setErrors({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: ''
    });
  };
  
  const handleSaveQuestion = async () => {
    if (!validateQuestionForm()) {
      return;
    }
    
    setLoadingQuestion(true);
    
    try {
      const questionData = {
        quizId,
        text: questionText,
        type: questionType,
        options: options.filter(option => option.trim() !== ''),
        correctAnswer,
        explanation,
        points: Number(points)
      };
      
      let updatedQuestion;
      
      if (editingQuestion) {
        // Update existing question
        updatedQuestion = await appwriteService.updateQuestion(editingQuestion.$id, questionData);
        
        // Update questions list
        setQuestions(questions.map(q => 
          q.$id === editingQuestion.$id ? updatedQuestion : q
        ));
        
        Alert.alert('Success', 'Question updated successfully!');
      } else {
        // Create new question
        const newQuestion = await appwriteService.createQuestion(questionData);
        
        // Add to questions list
        setQuestions([...questions, newQuestion]);
        
        Alert.alert('Success', 'Question added successfully!');
      }
      
      // Reset form
      resetQuestionForm();
    } catch (error) {
      console.error('Failed to save question:', error);
      Alert.alert(
        'Error',
        'Failed to save question: ' + (error.message || error),
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingQuestion(false);
    }
  };
  
  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionText(question.text);
    setQuestionType(question.type);
    
    // Ensure options array has 4 items
    const fullOptions = [...question.options];
    while (fullOptions.length < 4) {
      fullOptions.push('');
    }
    setOptions(fullOptions);
    
    setCorrectAnswer(question.correctAnswer);
    setExplanation(question.explanation || '');
    setPoints(question.points.toString());
  };
  
  const handleDeleteQuestion = async (question: Question) => {
    Alert.alert(
      'Delete Question',
      `Are you sure you want to delete this question? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await appwriteService.deleteQuestion(question.$id);
              setQuestions(questions.filter(q => q.$id !== question.$id));
              Alert.alert('Success', 'Question deleted successfully');
            } catch (error) {
              console.error('Failed to delete question:', error);
              Alert.alert('Error', 'Failed to delete question: ' + (error.message || error));
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const handleUpdateOption = (text: string, index: number) => {
    const newOptions = [...options];
    newOptions[index] = text;
    setOptions(newOptions);
    
    // Clear error for this option if set
    if (errors.options[index]) {
      const newErrors = { ...errors };
      newErrors.options[index] = '';
      setErrors(newErrors);
    }
  };

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

  const getQuizProgressStats = () => {
    const totalQuestions = questions.length;
    const hasCorrectAnswers = questions.filter(q => q.correctAnswer !== undefined).length;
    const hasExplanations = questions.filter(q => q.explanation && q.explanation.trim()).length;
    
    return {
      total: totalQuestions,
      complete: hasCorrectAnswers,
      withExplanations: hasExplanations,
      completionRate: totalQuestions > 0 ? (hasCorrectAnswers / totalQuestions) * 100 : 0
    };
  };

  const renderQuizHeader = () => {
    if (!quiz) return null;
    
    const stats = getQuizProgressStats();
    
    return (
      <View style={styles.quizHeader}>
        <View style={styles.quizHeaderContent}>
          {/* Quiz Title and Description */}
          <View style={styles.quizTitleSection}>
            <AirbnbText variant="title" style={styles.quizTitle}>
              {quiz.title}
            </AirbnbText>
            <AirbnbText variant="body" style={styles.quizDescription}>
              {quiz.description}
            </AirbnbText>
          </View>

          {/* Quiz Meta Information */}
          <View style={styles.quizMeta}>
            <View style={[styles.metaChip, { backgroundColor: getCategoryColor(quiz.category) + '20' }]}>
              <Ionicons name="library-outline" size={14} color={getCategoryColor(quiz.category)} />
              <AirbnbText variant="small" style={[styles.metaText, { color: getCategoryColor(quiz.category) }]}>
                {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
              </AirbnbText>
            </View>
            <View style={[styles.metaChip, { backgroundColor: getDifficultyColor(quiz.difficulty) + '20' }]}>
              <Ionicons name="trending-up-outline" size={14} color={getDifficultyColor(quiz.difficulty)} />
              <AirbnbText variant="small" style={[styles.metaText, { color: getDifficultyColor(quiz.difficulty) }]}>
                {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
              </AirbnbText>
            </View>
            <View style={[styles.metaChip, { backgroundColor: airbnbColors.mediumGray + '20' }]}>
              <Ionicons name="time-outline" size={14} color={airbnbColors.mediumGray} />
              <AirbnbText variant="small" style={[styles.metaText, { color: airbnbColors.mediumGray }]}>
                {quiz.timeLimit > 0 ? `${quiz.timeLimit}m` : 'No limit'}
              </AirbnbText>
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <AirbnbText variant="subtitle" style={styles.progressTitle}>Quiz Progress</AirbnbText>
              <AirbnbText variant="subtitle" style={[styles.progressPercentage, { color: airbnbColors.primary }]}>
                {Math.round(stats.completionRate)}%
              </AirbnbText>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stats.completionRate}%` }]} />
            </View>
            <View style={styles.progressStats}>
              <AirbnbText variant="caption" style={styles.progressStat}>
                {stats.total} Questions
              </AirbnbText>
              <AirbnbText variant="caption" style={styles.progressStat}>
                {stats.withExplanations} Explanations
              </AirbnbText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderQuestionForm = () => (
    <View style={styles.formSection}>
      <View style={styles.formHeader}>
        <AirbnbText variant="title" style={styles.formTitle}>
          {editingQuestion ? 'Edit Question' : 'Add New Question'}
        </AirbnbText>
        {editingQuestion && (
          <TouchableOpacity
            style={styles.cancelEditButton}
            onPress={resetQuestionForm}
          >
            <Ionicons name="close" size={20} color={airbnbColors.mediumGray} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.formCard}>
        {/* Question Text Input */}
        <View style={styles.inputGroup}>
          <AirbnbText variant="body" style={styles.inputLabel}>Question Text *</AirbnbText>
          <TextInput 
            style={[styles.textInput, styles.textArea, errors.questionText ? styles.inputError : null]}
            value={questionText}
            onChangeText={setQuestionText}
            placeholder="What would you like to ask?"
            placeholderTextColor={airbnbColors.mediumGray}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {errors.questionText && (
            <AirbnbText variant="small" style={styles.errorText}>{errors.questionText}</AirbnbText>
          )}
        </View>
        
        {/* Answer Options */}
        <View style={styles.inputGroup}>
          <AirbnbText variant="body" style={styles.inputLabel}>Answer Options *</AirbnbText>
          <AirbnbText variant="caption" style={styles.inputHelper}>
            Add at least two options and select the correct answer
          </AirbnbText>
          
          {options.map((option, index) => (
            <View key={index} style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.optionSelector,
                  correctAnswer === index && styles.optionSelectorActive
                ]}
                onPress={() => setCorrectAnswer(index)}
              >
                <View style={[
                  styles.optionSelectorInner,
                  correctAnswer === index && styles.optionSelectorInnerActive
                ]}>
                  {correctAnswer === index && (
                    <Ionicons name="checkmark" size={14} color={airbnbColors.white} />
                  )}
                </View>
                <AirbnbText variant="caption" style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </AirbnbText>
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.textInput, 
                  styles.optionInput,
                  errors.options[index] ? styles.inputError : null
                ]}
                value={option}
                onChangeText={(text) => handleUpdateOption(text, index)}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                placeholderTextColor={airbnbColors.mediumGray}
              />
            </View>
          ))}
          
          {(errors.options[0] || errors.correctAnswer) && (
            <AirbnbText variant="small" style={styles.errorText}>
              {errors.options[0] || errors.correctAnswer}
            </AirbnbText>
          )}
        </View>
        
        {/* Explanation Input */}
        <View style={styles.inputGroup}>
          <AirbnbText variant="body" style={styles.inputLabel}>Explanation (Optional)</AirbnbText>
          <TextInput 
            style={[styles.textInput, styles.textArea]}
            value={explanation}
            onChangeText={setExplanation}
            placeholder="Explain why this answer is correct..."
            placeholderTextColor={airbnbColors.mediumGray}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        
        {/* Points Input */}
        <View style={styles.inputGroup}>
          <AirbnbText variant="body" style={styles.inputLabel}>Points *</AirbnbText>
          <TextInput 
            style={[styles.textInput, styles.pointsInput, errors.points ? styles.inputError : null]}
            value={points}
            onChangeText={setPoints}
            placeholder="1"
            placeholderTextColor={airbnbColors.mediumGray}
            keyboardType="numeric"
          />
          {errors.points && (
            <AirbnbText variant="small" style={styles.errorText}>{errors.points}</AirbnbText>
          )}
        </View>
        
        {/* Form Actions */}
        <View style={styles.formActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={resetQuestionForm}
          >
            <AirbnbText variant="body" style={styles.cancelButtonText}>Cancel</AirbnbText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, loadingQuestion && styles.saveButtonDisabled]}
            onPress={handleSaveQuestion}
            disabled={loadingQuestion}
          >
            {loadingQuestion ? (
              <ActivityIndicator size="small" color={airbnbColors.white} />
            ) : (
              <Ionicons name="checkmark" size={20} color={airbnbColors.white} />
            )}
            <AirbnbText variant="body" style={styles.saveButtonText}>
              {editingQuestion ? 'Update' : 'Add Question'}
            </AirbnbText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  const renderQuestionItem = (question: Question, index: number) => (
    <View key={question.$id} style={styles.questionCard}>
      {/* Question Header */}
      <View style={styles.questionCardHeader}>
        <View style={styles.questionNumberBadge}>
          <AirbnbText variant="small" style={styles.questionNumber}>Q{index + 1}</AirbnbText>
        </View>
        <View style={styles.questionActions}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => handleEditQuestion(question)}
          >
            <Ionicons name="create-outline" size={18} color={airbnbColors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => handleDeleteQuestion(question)}
          >
            <Ionicons name="trash-outline" size={18} color={airbnbColors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Question Text */}
      <AirbnbText variant="body" style={styles.questionText}>{question.text}</AirbnbText>
      
      {/* Options List */}
      <View style={styles.optionsList}>
        {question.options.map((option, optIndex) => (
          <View key={`${question.$id}-option-${optIndex}`} style={styles.optionItem}>
            <View style={[
              styles.optionBadge, 
              optIndex === question.correctAnswer && styles.correctOptionBadge
            ]}>
              <AirbnbText variant="small" style={[
                styles.optionBadgeText,
                optIndex === question.correctAnswer && styles.correctOptionBadgeText
              ]}>
                {String.fromCharCode(65 + optIndex)}
              </AirbnbText>
            </View>
            <AirbnbText variant="caption" style={[
              styles.optionText,
              optIndex === question.correctAnswer && styles.correctOptionText
            ]}>
              {option}
            </AirbnbText>
            {optIndex === question.correctAnswer && (
              <Ionicons name="checkmark-circle" size={16} color={airbnbColors.success} />
            )}
          </View>
        ))}
      </View>
      
      {/* Explanation */}
      {question.explanation && (
        <View style={styles.explanationCard}>
          <View style={styles.explanationHeader}>
            <Ionicons name="bulb-outline" size={16} color={airbnbColors.warning} />
            <AirbnbText variant="caption" style={styles.explanationLabel}>Explanation</AirbnbText>
          </View>
          <AirbnbText variant="caption" style={styles.explanationText}>{question.explanation}</AirbnbText>
        </View>
      )}
      
      {/* Question Footer */}
      <View style={styles.questionFooter}>
        <View style={styles.pointsBadge}>
          <Ionicons name="trophy-outline" size={14} color={airbnbColors.warning} />
          <AirbnbText variant="small" style={styles.pointsText}>
            {question.points} point{question.points !== 1 ? 's' : ''}
          </AirbnbText>
        </View>
      </View>
    </View>
  );

  const renderQuestionsList = () => {
    const stats = getQuizProgressStats();
    
    return (
      <View style={styles.questionsSection}>
        <View style={styles.questionsHeader}>
          <View>
            <AirbnbText variant="title" style={styles.questionsTitle}>Questions</AirbnbText>
            <AirbnbText variant="caption" style={styles.questionsSubtitle}>
              {stats.total} question{stats.total !== 1 ? 's' : ''} added
            </AirbnbText>
          </View>
          {questions.length > 0 && (
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => router.push('/(admin)/(quiz)')}
            >
              <Ionicons name="checkmark-circle" size={20} color={airbnbColors.white} />
              <AirbnbText variant="caption" style={styles.doneButtonText}>Done</AirbnbText>
            </TouchableOpacity>
          )}
        </View>
        
        {questions.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateCard}>
              <Ionicons name="help-circle-outline" size={64} color={airbnbColors.lightGray} />
              <AirbnbText variant="subtitle" style={styles.emptyStateTitle}>No questions yet</AirbnbText>
              <AirbnbText variant="body" style={styles.emptyStateSubtitle}>
                Start building your quiz by adding your first question above
              </AirbnbText>
            </View>
          </View>
        ) : (
          <View style={styles.questionsList}>
            {questions.map((question, index) => 
              renderQuestionItem(question, index)
            )}
          </View>
        )}
      </View>
    );
  };

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
          <AirbnbText variant="subtitle" style={styles.headerTitle}>Question Editor</AirbnbText>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <AirbnbText style={styles.loadingText}>Loading quiz data...</AirbnbText>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={airbnbColors.dark} />
        </TouchableOpacity>
        <AirbnbText variant="subtitle" style={styles.headerTitle}>Question Editor</AirbnbText>
        <View style={styles.headerRight} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 }
          ]}
        >
          {renderQuizHeader()}
          
          <View style={styles.content}>
            {renderQuestionForm()}
            {renderQuestionsList()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
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

  // Quiz Header
  quizHeader: {
    backgroundColor: airbnbColors.white,
    paddingHorizontal: airbnbSpacing.lg,
    paddingVertical: airbnbSpacing.xl,
    marginBottom: airbnbSpacing.md,
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
  quizHeaderContent: {
    gap: airbnbSpacing.lg,
  },
  quizTitleSection: {
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: airbnbTypography.sizes.xxxl,
    fontWeight: airbnbTypography.weights.bold,
    color: airbnbColors.dark,
    textAlign: 'center',
    marginBottom: airbnbSpacing.sm,
  },
  quizDescription: {
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.mediumGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: airbnbSpacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: airbnbSpacing.sm,
    paddingVertical: airbnbSpacing.xs,
    borderRadius: 16,
    gap: 4,
  },
  metaText: {
    fontSize: airbnbTypography.sizes.sm,
    fontWeight: airbnbTypography.weights.medium,
  },
  progressSection: {
    backgroundColor: airbnbColors.superLightGray,
    borderRadius: 16,
    padding: airbnbSpacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: airbnbSpacing.sm,
  },
  progressTitle: {
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
  },
  progressPercentage: {
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.bold,
  },
  progressBar: {
    height: 8,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 4,
    marginBottom: airbnbSpacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: airbnbColors.primary,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    fontSize: airbnbTypography.sizes.sm,
    color: airbnbColors.mediumGray,
  },

  // Content
  content: {
    padding: airbnbSpacing.lg,
    gap: airbnbSpacing.xl,
  },

  // Form Section
  formSection: {
    gap: airbnbSpacing.md,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: airbnbTypography.sizes.xxl,
    fontWeight: airbnbTypography.weights.bold,
    color: airbnbColors.dark,
  },
  cancelEditButton: {
    padding: airbnbSpacing.sm,
    borderRadius: 20,
    backgroundColor: airbnbColors.superLightGray,
  },
  formCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 20,
    padding: airbnbSpacing.lg,
    gap: airbnbSpacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Input Styles
  inputGroup: {
    gap: airbnbSpacing.sm,
  },
  inputLabel: {
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
  },
  inputHelper: {
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.mediumGray,
  },
  textInput: {
    backgroundColor: airbnbColors.superLightGray,
    borderWidth: 1,
    borderColor: airbnbColors.border,
    borderRadius: 12,
    paddingHorizontal: airbnbSpacing.md,
    paddingVertical: airbnbSpacing.md,
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.dark,
    fontFamily: airbnbTypography.fontFamily,
  },
  textArea: {
    height: 100,
    paddingTop: airbnbSpacing.md,
    textAlignVertical: 'top',
  },
  pointsInput: {
    width: 80,
    textAlign: 'center',
  },
  inputError: {
    borderColor: airbnbColors.error,
    backgroundColor: airbnbColors.error + '10',
  },
  errorText: {
    fontSize: airbnbTypography.sizes.sm,
    color: airbnbColors.error,
    marginTop: 4,
  },

  // Option Styles
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: airbnbSpacing.sm,
    marginBottom: airbnbSpacing.sm,
  },
  optionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: airbnbSpacing.xs,
  },
  optionSelectorInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: airbnbColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionSelectorInnerActive: {
    backgroundColor: airbnbColors.primary,
    borderColor: airbnbColors.primary,
  },
  optionLetter: {
    fontSize: airbnbTypography.sizes.md,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.mediumGray,
    minWidth: 20,
  },
  optionInput: {
    flex: 1,
  },

  // Form Actions
  formActions: {
    flexDirection: 'row',
    gap: airbnbSpacing.md,
    paddingTop: airbnbSpacing.md,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.superLightGray,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: airbnbSpacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: airbnbColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.mediumGray,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: airbnbColors.primary,
    paddingVertical: airbnbSpacing.md,
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
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.white,
  },

  // Questions Section
  questionsSection: {
    gap: airbnbSpacing.lg,
  },
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionsTitle: {
    fontSize: airbnbTypography.sizes.xxl,
    fontWeight: airbnbTypography.weights.bold,
    color: airbnbColors.dark,
  },
  questionsSubtitle: {
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.mediumGray,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.success,
    paddingVertical: airbnbSpacing.sm,
    paddingHorizontal: airbnbSpacing.md,
    borderRadius: 20,
    gap: airbnbSpacing.xs,
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
  doneButtonText: {
    fontSize: airbnbTypography.sizes.md,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.white,
  },

  // Question Cards
  questionsList: {
    gap: airbnbSpacing.md,
  },
  questionCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: airbnbSpacing.lg,
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
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: airbnbSpacing.md,
  },
  questionNumberBadge: {
    backgroundColor: airbnbColors.primary,
    paddingHorizontal: airbnbSpacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionNumber: {
    fontSize: airbnbTypography.sizes.sm,
    fontWeight: airbnbTypography.weights.bold,
    color: airbnbColors.white,
  },
  questionActions: {
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
  questionText: {
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.dark,
    lineHeight: 24,
    marginBottom: airbnbSpacing.md,
  },

  // Options List
  optionsList: {
    gap: airbnbSpacing.sm,
    marginBottom: airbnbSpacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: airbnbSpacing.sm,
  },
  optionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: airbnbColors.superLightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctOptionBadge: {
    backgroundColor: airbnbColors.success,
  },
  optionBadgeText: {
    fontSize: airbnbTypography.sizes.sm,
    fontWeight: airbnbTypography.weights.bold,
    color: airbnbColors.mediumGray,
  },
  correctOptionBadgeText: {
    color: airbnbColors.white,
  },
  optionText: {
    flex: 1,
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.dark,
  },
  correctOptionText: {
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.success,
  },

  // Explanation
  explanationCard: {
    backgroundColor: airbnbColors.warning + '10',
    borderRadius: 12,
    padding: airbnbSpacing.md,
    marginBottom: airbnbSpacing.md,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: airbnbSpacing.xs,
    marginBottom: airbnbSpacing.xs,
  },
  explanationLabel: {
    fontSize: airbnbTypography.sizes.md,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.warning,
  },
  explanationText: {
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.dark,
    lineHeight: 20,
  },

  // Question Footer
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    fontSize: airbnbTypography.sizes.sm,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.warning,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
  },
  emptyStateCard: {
    borderRadius: 20,
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
    fontSize: airbnbTypography.sizes.xl,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.mediumGray,
    textAlign: 'center',
    marginTop: airbnbSpacing.md,
    marginBottom: airbnbSpacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});

// Make sure the export is at the bottom as well
export default QuestionEditorScreen;