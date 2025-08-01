import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { borderRadius, colors, spacing, typography } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

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
  const [correctAnswer, setCorrectAnswer] = useState(0); // Index of correct answer
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
    
    // Scroll to top to show the form
    // This would need a ref to the ScrollView
  };
  
  const handleDeleteQuestion = async (question) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this question?',
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
  
  const renderQuestionItem = ({ item, index }) => (
    <Card style={styles.questionCard}>
      <View style={styles.questionCardHeader}>
        <Text variant="h6" style={styles.questionNumber}>Question {index + 1}</Text>
        <View style={styles.questionActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleEditQuestion(item)}
          >
            <Ionicons name="create-outline" size={22} color={colors.primary.main} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleDeleteQuestion(item)}
          >
            <Ionicons name="trash-outline" size={22} color={colors.status.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text variant="body1" style={styles.questionText}>{item.text}</Text>
      
      <View style={styles.optionsList}>
        {item.options.map((option, optIndex) => (
          <View key={optIndex} style={styles.optionItem}>
            <View style={[
              styles.optionIndicator, 
              optIndex === item.correctAnswer && styles.correctOptionIndicator
            ]}>
              <Text style={styles.optionLetter}>
                {String.fromCharCode(65 + optIndex)}
              </Text>
            </View>
            <Text variant="body2" style={styles.optionText}>{option}</Text>
          </View>
        ))}
      </View>
      
      {item.explanation ? (
        <View style={styles.explanationContainer}>
          <Text variant="subtitle2" style={styles.explanationLabel}>Explanation:</Text>
          <Text variant="body2" style={styles.explanationText}>{item.explanation}</Text>
        </View>
      ) : null}
      
      <View style={styles.questionFooter}>
        <Text variant="caption" style={styles.pointsText}>
          Points: {item.points}
        </Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text variant="body1" style={styles.loadingText}>Loading quiz data...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title={quiz ? `Edit Quiz: ${quiz.title}` : 'Question Editor'}
        leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
        onLeftIconPress={() => router.back()}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={100}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            {quiz && (
              <View style={styles.quizInfoContainer}>
                <Text variant="h4" style={styles.quizTitle}>{quiz.title}</Text>
                <Text variant="body2" style={styles.quizDescription}>
                  {quiz.description}
                </Text>
                <View style={styles.quizMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="school-outline" size={16} color={colors.neutral.darkGray} />
                    <Text variant="caption" style={styles.metaText}>
                      {quiz.category.charAt(0).toUpperCase() + quiz.category.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="trending-up-outline" size={16} color={colors.neutral.darkGray} />
                    <Text variant="caption" style={styles.metaText}>
                      {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color={colors.neutral.darkGray} />
                    <Text variant="caption" style={styles.metaText}>
                      {quiz.timeLimit > 0 ? `${quiz.timeLimit} min` : 'No time limit'}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            
            <Card style={styles.formCard}>
              <Text variant="h5" style={styles.formTitle}>
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </Text>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Question Text *</Text>
                <TextInput 
                  style={[styles.input, styles.textArea, errors.questionText ? styles.inputError : null]}
                  value={questionText}
                  onChangeText={setQuestionText}
                  placeholder="Enter question text"
                  placeholderTextColor={colors.neutral.gray}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {errors.questionText ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.questionText}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Options *</Text>
                <Text variant="caption" style={styles.helperText}>
                  Add at least two options and select the correct answer
                </Text>
                
                {options.map((option, index) => (
                  <View key={index} style={styles.optionInputContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionRadio,
                        correctAnswer === index && styles.optionRadioSelected
                      ]}
                      onPress={() => setCorrectAnswer(index)}
                    >
                      <Text 
                        style={[
                          styles.optionRadioText,
                          correctAnswer === index && styles.optionRadioTextSelected
                        ]}
                      >
                        {String.fromCharCode(65 + index)}
                      </Text>
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.input, 
                        styles.optionInput,
                        errors.options[index] ? styles.inputError : null
                      ]}
                      value={option}
                      onChangeText={(text) => handleUpdateOption(text, index)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      placeholderTextColor={colors.neutral.gray}
                    />
                  </View>
                ))}
                
                {errors.options[0] ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.options[0]}
                  </Text>
                ) : null}
                
                {errors.correctAnswer ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.correctAnswer}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Explanation (Optional)</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]}
                  value={explanation}
                  onChangeText={setExplanation}
                  placeholder="Explanation for the correct answer"
                  placeholderTextColor={colors.neutral.gray}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Points *</Text>
                <TextInput 
                  style={[styles.input, errors.points ? styles.inputError : null]}
                  value={points}
                  onChangeText={setPoints}
                  placeholder="Points for this question"
                  placeholderTextColor={colors.neutral.gray}
                  keyboardType="numeric"
                />
                {errors.points ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.points}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.formActions}>
                <Button 
                  title="Cancel"
                  variant="outline"
                  onPress={resetQuestionForm}
                  style={styles.actionButton}
                />
                <Button 
                  title={loadingQuestion ? 'Saving...' : (editingQuestion ? 'Update Question' : 'Add Question')}
                  onPress={handleSaveQuestion}
                  disabled={loadingQuestion}
                  style={styles.actionButton}
                  icon={loadingQuestion ? <ActivityIndicator size="small" color={colors.neutral.white} /> : null}
                />
              </View>
            </Card>
            
            <View style={styles.questionListContainer}>
              <View style={styles.questionListHeader}>
                <Text variant="h5">Questions ({questions.length})</Text>
                {questions.length > 0 && (
                  <TouchableOpacity 
                    style={styles.backToQuizButton}
                    onPress={() => router.push('/(admin)/(quiz)')}
                  >
                    <Text variant="button" color={colors.primary.main}>
                      Done
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {questions.length === 0 ? (
                <Card style={styles.emptyStateCard}>
                  <Ionicons name="help-circle-outline" size={48} color={colors.neutral.lightGray} />
                  <Text variant="body1" style={styles.emptyStateText}>
                    No questions added yet
                  </Text>
                  <Text variant="body2" style={styles.emptyStateSubtext}>
                    Create your first question using the form above
                  </Text>
                </Card>
              ) : (
                questions.map((question, index) => 
                  renderQuestionItem({ item: question, index })
                )
              )}
            </View>
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
    backgroundColor: colors.neutral.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.neutral.darkGray,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  quizInfoContainer: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizTitle: {
    color: colors.neutral.text,
    marginBottom: spacing.xs,
  },
  quizDescription: {
    color: colors.neutral.darkGray,
    marginBottom: spacing.md,
  },
  quizMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  metaText: {
    color: colors.neutral.darkGray,
    marginLeft: spacing.xs,
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  formTitle: {
    color: colors.primary.main,
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.neutral.text,
  },
  input: {
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.neutral.text,
    fontSize: typography.fontSizes.md,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    marginTop: spacing.xs,
    fontSize: typography.fontSizes.sm,
  },
  helperText: {
    marginBottom: spacing.sm,
    color: colors.neutral.gray,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  optionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  optionRadio: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    backgroundColor: colors.neutral.white,
  },
  optionRadioSelected: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  optionRadioText: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.darkGray,
    fontWeight: 'bold',
  },
  optionRadioTextSelected: {
    color: colors.neutral.white,
  },
  optionInput: {
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  actionButton: {
    marginLeft: spacing.sm,
    minWidth: 120,
  },
  questionListContainer: {
    marginTop: spacing.lg,
  },
  questionListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  questionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  questionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
    paddingBottom: spacing.sm,
  },
  questionNumber: {
    color: colors.primary.main,
  },
  questionActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: spacing.sm,
  },
  questionText: {
    marginBottom: spacing.md,
  },
  optionsList: {
    marginVertical: spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  correctOptionIndicator: {
    backgroundColor: colors.primary.main,
  },
  optionLetter: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.white,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
  },
  explanationContainer: {
    backgroundColor: colors.neutral.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  explanationLabel: {
    marginBottom: 4,
    color: colors.neutral.darkGray,
  },
  explanationText: {
    fontStyle: 'italic',
    color: colors.neutral.text,
  },
  questionFooter: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  pointsText: {
    color: colors.neutral.darkGray,
  },
  emptyStateCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: spacing.sm,
    color: colors.neutral.darkGray,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    marginTop: spacing.xs,
    color: colors.neutral.gray,
    textAlign: 'center',
  },
  backToQuizButton: {
    padding: spacing.sm,
  },
});

// Make sure the export is at the bottom as well
export default QuestionEditorScreen;