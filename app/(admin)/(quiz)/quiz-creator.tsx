import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
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

const difficultyOptions = ["beginner", "intermediate", "advanced", "mixed"];
const categoryOptions = ["grammar", "vocabulary", "speaking", "writing", "reading", "listening", "general"];

export default function QuizCreatorScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  
  // Quiz form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [category, setCategory] = useState('vocabulary'); // Default to vocabulary
  const [timeLimit, setTimeLimit] = useState('60'); // Default to 60 seconds for vocabulary quiz
  const [passScore, setPassScore] = useState('70'); // Default passing score is 70%
  const [isPublished, setIsPublished] = useState(false);
  const [csvImportMode, setCsvImportMode] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    timeLimit: '',
    passScore: '',
    category: '',
    csvFile: ''
  });
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      description: '',
      timeLimit: '',
      passScore: '',
      category: '',
      csvFile: ''
    };
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    
    if (isNaN(Number(timeLimit)) || Number(timeLimit) < 0) {
      newErrors.timeLimit = 'Time limit must be a valid number (0 for no limit)';
      isValid = false;
    }

    if (isNaN(Number(passScore)) || Number(passScore) < 0 || Number(passScore) > 100) {
      newErrors.passScore = 'Pass score must be a valid percentage (0-100)';
      isValid = false;
    }

    if (!category.trim()) {
      newErrors.category = 'Category is required';
      isValid = false;
    }

    if (csvImportMode && !csvFile) {
      newErrors.csvFile = 'Please select a CSV file';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const pickCsvFile = async () => {
    try {
      setCsvLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        // User cancelled the picker
        return;
      }

      const file = result.assets[0];
      setCsvFile(file);
      Alert.alert('Success', 'CSV file selected: ' + file.name);
    } catch (error) {
      console.error('Error picking CSV file:', error);
      Alert.alert('Error', 'Failed to select CSV file');
    } finally {
      setCsvLoading(false);
    }
  };

  const parseCsv = async (fileUri) => {
    try {
      // In a real app, you'd implement proper CSV parsing here
      // For demonstration, we'll create sample questions
      
      // Mock parsed questions (in production you'd actually parse the CSV)
      const mockQuestions = [
        {
          text: "What is the meaning of 'apple'?",
          options: ["A fruit", "A vegetable", "A car", "A computer"],
          correctAnswer: "A fruit",
          explanation: "An apple is a round fruit with red, green, or yellow skin and firm white flesh"
        },
        {
          text: "What is the meaning of 'book'?",
          options: ["A vehicle", "A written work", "A food", "A place"],
          correctAnswer: "A written work",
          explanation: "A book is a written or printed work consisting of pages bound together"
        },
        {
          text: "What is the meaning of 'car'?",
          options: ["A fruit", "A building", "A vehicle", "A tool"],
          correctAnswer: "A vehicle",
          explanation: "A car is a road vehicle with an engine, four wheels, and seats for a small number of people"
        }
      ];
      
      return mockQuestions;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error('Failed to parse CSV file');
    }
  };
  
  const handleCreateQuiz = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create quiz data object
      const quizData = {
        title,
        description,
        difficulty,
        category,
        timeLimit: parseInt(timeLimit, 10),
        passScore: parseInt(passScore, 10),
        isPublished
      };
      
      // Add courseId if it was passed as a parameter
      if (courseId) {
        quizData.courseId = courseId;
      }
      
      // Create quiz using appwrite service
      const newQuiz = await appwriteService.createQuiz(quizData);
      
      // If we're in CSV import mode, parse the CSV and create questions
      if (csvImportMode && csvFile) {
        try {
          const questions = await parseCsv(csvFile.uri);
          
          // Create questions in the database
          for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            await appwriteService.createQuestion({
              quizId: newQuiz.$id,
              text: question.text,
              type: 'multiple-choice',
              options: question.options,
              correctAnswer: question.correctAnswer,
              explanation: question.explanation,
              points: 1,
              order: i + 1
            });
          }
          
          Alert.alert(
            'Success', 
            `Quiz created with ${questions.length} questions from CSV!`,
            [
              {
                text: 'View Quiz',
                onPress: () => router.push({
                  pathname: '/(admin)/(quiz)/question-editor',
                  params: { quizId: newQuiz.$id }
                })
              },
              {
                text: 'Back to Quiz List',
                onPress: () => router.push('/(admin)/(quiz)')
              }
            ]
          );
        } catch (error) {
          console.error('Failed to import CSV:', error);
          Alert.alert(
            'Warning',
            'Quiz created but failed to import questions from CSV. You can add questions manually.',
            [
              {
                text: 'Add Questions',
                onPress: () => router.push({
                  pathname: '/(admin)/(quiz)/question-editor',
                  params: { quizId: newQuiz.$id }
                })
              }
            ]
          );
        }
      } else {
        // Standard quiz creation flow
        Alert.alert(
          'Success', 
          'Quiz created successfully!',
          [
            {
              text: 'Add Questions',
              onPress: () => router.push({
                pathname: '/(admin)/(quiz)/question-editor',
                params: { quizId: newQuiz.$id }
              })
            },
            {
              text: 'Back to Quiz List',
              onPress: () => router.push('/(admin)/(quiz)')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Failed to create quiz:', error);
      Alert.alert(
        'Error',
        'Failed to create quiz: ' + (error.message || error),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  const renderDifficultySelection = () => (
    <View style={styles.optionsSelector}>
      {difficultyOptions.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            difficulty === option && styles.selectedOption
          ]}
          onPress={() => setDifficulty(option)}
        >
          <Text 
            variant="button" 
            color={difficulty === option ? colors.neutral.white : colors.neutral.text}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCategorySelection = () => (
    <View style={styles.optionsSelector}>
      {categoryOptions.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            category === option && styles.selectedOption
          ]}
          onPress={() => setCategory(option)}
        >
          <Text 
            variant="button" 
            color={category === option ? colors.neutral.white : colors.neutral.text}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCsvUpload = () => (
    <View style={styles.csvSection}>
      <View style={styles.csvHeader}>
        <Text variant="h6" style={styles.csvTitle}>CSV Upload</Text>
        <Switch
          value={csvImportMode}
          onValueChange={setCsvImportMode}
          trackColor={{ false: colors.neutral.lightGray, true: colors.primary.light }}
          thumbColor={csvImportMode ? colors.primary.main : colors.neutral.white}
        />
      </View>

      {csvImportMode && (
        <View style={styles.csvContent}>
          <Text variant="body2" style={styles.csvDescription}>
            Upload a CSV file with vocabulary questions in the following format:
          </Text>
          <Text style={styles.csvFormat}>
            question,option1,option2,option3,option4,correctAnswer,explanation
          </Text>
          <View style={styles.csvFileSelection}>
            <Text style={styles.selectedFile}>
              {csvFile ? csvFile.name : 'No file selected'}
            </Text>
            <Button
              title={csvLoading ? "Loading..." : "Select CSV"}
              onPress={pickCsvFile}
              disabled={csvLoading}
              variant="outline"
              size="small"
            />
          </View>
          {errors.csvFile ? (
            <Text variant="caption" color={colors.status.error} style={styles.errorText}>
              {errors.csvFile}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Create Quiz"
        leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
        onLeftIconPress={() => router.back()}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text variant="h4" style={styles.pageTitle}>Create New Quiz</Text>
              <Text variant="body2" style={styles.pageSubtitle}>
                Fill out the form below to create a new quiz. You can add questions manually or import them from a CSV file.
              </Text>
            </View>
            
            <Card style={styles.formCard}>
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Quiz Title *</Text>
                <TextInput 
                  style={[styles.input, errors.title ? styles.inputError : null]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter quiz title"
                  placeholderTextColor={colors.neutral.gray}
                />
                {errors.title ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.title}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Description *</Text>
                <TextInput 
                  style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter quiz description"
                  placeholderTextColor={colors.neutral.gray}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
                {errors.description ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.description}
                  </Text>
                ) : null}
              </View>

              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Category *</Text>
                {renderCategorySelection()}
                {errors.category ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.category}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Difficulty Level *</Text>
                {renderDifficultySelection()}
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Time Limit (seconds) *</Text>
                <TextInput 
                  style={[styles.input, errors.timeLimit ? styles.inputError : null]}
                  value={timeLimit}
                  onChangeText={setTimeLimit}
                  placeholder="Enter time limit (0 for no limit)"
                  placeholderTextColor={colors.neutral.gray}
                  keyboardType="numeric"
                />
                {errors.timeLimit ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.timeLimit}
                  </Text>
                ) : (
                  <Text variant="caption" style={styles.helperText}>
                    Enter time in seconds (0 for no time limit)
                  </Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Pass Score (%) *</Text>
                <TextInput 
                  style={[styles.input, errors.passScore ? styles.inputError : null]}
                  value={passScore}
                  onChangeText={setPassScore}
                  placeholder="Enter passing score percentage"
                  placeholderTextColor={colors.neutral.gray}
                  keyboardType="numeric"
                />
                {errors.passScore ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.passScore}
                  </Text>
                ) : null}
              </View>

              {/* CSV Upload Section */}
              {renderCsvUpload()}
              
              <View style={styles.switchContainer}>
                <Text variant="subtitle1">Publish immediately</Text>
                <Switch
                  value={isPublished}
                  onValueChange={setIsPublished}
                  trackColor={{ false: colors.neutral.lightGray, true: colors.primary.light }}
                  thumbColor={isPublished ? colors.primary.main : colors.neutral.white}
                />
              </View>
              
              <View style={styles.formActions}>
                <Button 
                  title="Cancel"
                  variant="outline"
                  onPress={() => router.back()}
                  style={styles.actionButton}
                />
                <Button 
                  title={loading ? 'Creating...' : 'Create Quiz'}
                  onPress={handleCreateQuiz}
                  disabled={loading}
                  style={styles.actionButton}
                  icon={loading ? <ActivityIndicator size="small" color={colors.neutral.white} /> : null}
                />
              </View>
            </Card>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerContainer: {
    marginBottom: spacing.md,
  },
  pageTitle: {
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    color: colors.neutral.darkGray,
  },
  formCard: {
    padding: spacing.lg,
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
  },
  helperText: {
    marginTop: spacing.xs,
    color: colors.neutral.gray,
  },
  textArea: {
    height: 120,
    paddingTop: spacing.sm,
  },
  optionsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  option: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.lightGray,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedOption: {
    backgroundColor: colors.primary.main,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  csvSection: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  csvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: csvImportMode => csvImportMode ? spacing.md : 0,
  },
  csvTitle: {
    color: colors.secondary.main,
  },
  csvContent: {
    marginTop: spacing.sm,
  },
  csvDescription: {
    marginBottom: spacing.sm,
  },
  csvFormat: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: colors.neutral.lightGray + '30',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.md,
  },
  csvFileSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedFile: {
    flex: 1,
    marginRight: spacing.sm,
    color: colors.neutral.darkGray,
    fontSize: typography.fontSizes.sm,
  },
});