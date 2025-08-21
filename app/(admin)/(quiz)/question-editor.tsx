import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
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

function QuestionEditorScreen() {
  const router = useRouter();
  const { quizId } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  
  // Question form state
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState('1');
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  // Errors state
  const [errors, setErrors] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: ''
  });

  // Load quiz and questions
  useEffect(() => {
    if (!quizId) {
      Alert.alert('Error', 'Quiz ID not provided');
      router.back();
      return;
    }
    
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
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
  };
  
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
  
  const handleEditQuestion = (question) => {
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
  
  const handleDeleteQuestion = async (question) => {
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
  
  const handleUpdateOption = (text, index) => {
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
      <LinearGradient 
        colors={['#667eea', '#764ba2']} 
        style={styles.quizHeader}
      >
        <View style={styles.quizHeaderContent}>
          <View style={styles.quizTitleSection}>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <Text style={styles.quizDescription}>
              {quiz.description}
            </Text>
          </View>

          <View style={styles.quizMeta}>
            <View style={styles.metaChip}>
              <Ionicons name="library-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.metaText}>
                {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="trending-up-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.metaText}>
                {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
              </Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.metaText}>
                {quiz.timeLimit > 0 ? `${quiz.timeLimit}s` : 'No limit'}
              </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Quiz Progress</Text>
              <Text style={styles.progressPercentage}>{Math.round(stats.completionRate)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stats.completionRate}%` }]} />
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.progressStat}>{stats.total} Questions</Text>
              <Text style={styles.progressStat}>{stats.withExplanations} Explanations</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderQuestionForm = () => (
    <View style={styles.formSection}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          {editingQuestion ? 'Edit Question' : 'Add New Question'}
        </Text>
        {editingQuestion && (
          <TouchableOpacity
            style={styles.cancelEditButton}
            onPress={resetQuestionForm}
          >
            <Ionicons name="close" size={20} color={colors.neutral.gray} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Question Text *</Text>
          <TextInput 
            style={[styles.textInput, styles.textArea, errors.questionText ? styles.inputError : null]}
            value={questionText}
            onChangeText={setQuestionText}
            placeholder="What would you like to ask?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          {errors.questionText && (
            <Text style={styles.errorText}>{errors.questionText}</Text>
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Answer Options *</Text>
          <Text style={styles.inputHelper}>
            Add at least two options and select the correct answer
          </Text>
          
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
                    <Ionicons name="checkmark" size={14} color={colors.neutral.white} />
                  )}
                </View>
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + index)}
                </Text>
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
                placeholderTextColor="#9CA3AF"
              />
            </View>
          ))}
          
          {(errors.options[0] || errors.correctAnswer) && (
            <Text style={styles.errorText}>
              {errors.options[0] || errors.correctAnswer}
            </Text>
          )}
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Explanation (Optional)</Text>
          <TextInput 
            style={[styles.textInput, styles.textArea]}
            value={explanation}
            onChangeText={setExplanation}
            placeholder="Explain why this answer is correct..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Points *</Text>
          <TextInput 
            style={[styles.textInput, styles.pointsInput, errors.points ? styles.inputError : null]}
            value={points}
            onChangeText={setPoints}
            placeholder="1"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
          {errors.points && (
            <Text style={styles.errorText}>{errors.points}</Text>
          )}
        </View>
        
        <View style={styles.formActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={resetQuestionForm}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.saveButton, loadingQuestion && styles.saveButtonDisabled]}
            onPress={handleSaveQuestion}
            disabled={loadingQuestion}
          >
            {loadingQuestion ? (
              <ActivityIndicator size="small" color={colors.neutral.white} />
            ) : (
              <Ionicons name="checkmark" size={20} color={colors.neutral.white} />
            )}
            <Text style={styles.saveButtonText}>
              {editingQuestion ? 'Update' : 'Add Question'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
  
  const renderQuestionItem = (question, index) => (
    <View key={question.$id} style={styles.questionCard}>
      <View style={styles.questionCardHeader}>
        <View style={styles.questionNumberBadge}>
          <Text style={styles.questionNumber}>Q{index + 1}</Text>
        </View>
        <View style={styles.questionActions}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => handleEditQuestion(question)}
          >
            <Ionicons name="create-outline" size={18} color="#667eea" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={() => handleDeleteQuestion(question)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.questionText}>{question.text}</Text>
      
      <View style={styles.optionsList}>
        {question.options.map((option, optIndex) => (
          <View key={`${question.$id}-option-${optIndex}`} style={styles.optionItem}>
            <View style={[
              styles.optionBadge, 
              optIndex === question.correctAnswer && styles.correctOptionBadge
            ]}>
              <Text style={[
                styles.optionBadgeText,
                optIndex === question.correctAnswer && styles.correctOptionBadgeText
              ]}>
                {String.fromCharCode(65 + optIndex)}
              </Text>
            </View>
            <Text style={[
              styles.optionText,
              optIndex === question.correctAnswer && styles.correctOptionText
            ]}>
              {option}
            </Text>
            {optIndex === question.correctAnswer && (
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            )}
          </View>
        ))}
      </View>
      
      {question.explanation && (
        <View style={styles.explanationCard}>
          <View style={styles.explanationHeader}>
            <Ionicons name="bulb-outline" size={16} color="#F59E0B" />
            <Text style={styles.explanationLabel}>Explanation</Text>
          </View>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
      
      <View style={styles.questionFooter}>
        <View style={styles.pointsBadge}>
          <Ionicons name="trophy-outline" size={14} color="#F59E0B" />
          <Text style={styles.pointsText}>{question.points} point{question.points !== 1 ? 's' : ''}</Text>
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
            <Text style={styles.questionsTitle}>Questions</Text>
            <Text style={styles.questionsSubtitle}>
              {stats.total} question{stats.total !== 1 ? 's' : ''} added
            </Text>
          </View>
          {questions.length > 0 && (
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => router.push('/(admin)/(quiz)')}
            >
              <Ionicons name="checkmark-circle" size={20} color={colors.neutral.white} />
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {questions.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#F3F4F6', '#E5E7EB']}
              style={styles.emptyStateCard}
            >
              <Ionicons name="help-circle-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No questions yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Start building your quiz by adding your first question above
              </Text>
            </LinearGradient>
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Loading quiz data...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Question Editor"
        onLeftIconPress={() => router.back()}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  // Quiz Header
  quizHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  quizHeaderContent: {
    gap: spacing.lg,
  },
  quizTitleSection: {
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  quizDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  quizMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  progressSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.white,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.neutral.white,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Content
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },

  // Form Section
  formSection: {
    gap: spacing.md,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  cancelEditButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  formCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    gap: spacing.lg,
  },

  // Input Styles
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  inputHelper: {
    fontSize: 14,
    color: '#6B7280',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  pointsInput: {
    width: 80,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },

  // Option Styles
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  optionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  optionSelectorInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionSelectorInnerActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 20,
  },
  optionInput: {
    flex: 1,
  },

  // Form Actions
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea',
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },

  // Questions Section
  questionsSection: {
    gap: spacing.lg,
  },
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  questionsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    gap: spacing.xs,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.white,
  },

  // Question Cards
  questionsList: {
    gap: spacing.md,
  },
  questionCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  questionNumberBadge: {
    backgroundColor: '#667eea',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.white,
  },
  questionActions: {
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
  questionText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: spacing.md,
  },

  // Options List
  optionsList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctOptionBadge: {
    backgroundColor: '#10B981',
  },
  optionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  correctOptionBadgeText: {
    color: colors.neutral.white,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  correctOptionText: {
    fontWeight: '600',
    color: '#10B981',
  },

  // Explanation
  explanationCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  explanationText: {
    fontSize: 14,
    color: '#92400E',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
  },
  emptyStateCard: {
    borderRadius: 20,
    padding: spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});

// Make sure the export is at the bottom as well
export default QuestionEditorScreen;