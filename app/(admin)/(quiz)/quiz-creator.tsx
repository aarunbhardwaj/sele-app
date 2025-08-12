import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Papa from 'papaparse';
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
      console.log('Reading CSV file from:', fileUri);
      
      let fileContent;
      
      // Check if we're on web platform
      if (Platform.OS === 'web') {
        // For web, the fileUri is actually a data URL or blob URL
        // We need to fetch it or read it differently
        if (fileUri.startsWith('data:')) {
          // It's a data URL, decode the base64 content
          const base64Data = fileUri.split(',')[1];
          fileContent = atob(base64Data);
        } else if (fileUri.startsWith('blob:')) {
          // It's a blob URL, fetch it
          const response = await fetch(fileUri);
          fileContent = await response.text();
        } else {
          // Try to read it as a regular file for web
          const response = await fetch(fileUri);
          fileContent = await response.text();
        }
      } else {
        // For native platforms, use FileSystem
        const FileSystem = require('expo-file-system');
        fileContent = await FileSystem.readAsStringAsync(fileUri);
      }
      
      if (!fileContent || fileContent.trim() === '') {
        throw new Error('CSV file is empty');
      }
      
      // Parse the CSV content using PapaParse
      return new Promise((resolve, reject) => {
        Papa.parse(fileContent, {
          header: true, // Treat the first row as headers
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              console.error('CSV parsing errors:', results.errors);
              reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
              return;
            }
            
            if (!results.data || results.data.length === 0) {
              reject(new Error('No valid questions found in CSV file'));
              return;
            }
            
            try {
              // Map CSV data to question format
              const questions = results.data.map((row, index) => {
                console.log(`Processing row ${index + 1}:`, row);
                
                // Handle different CSV formats
                let questionText, options, correctAnswer, explanation;
                
                // Check if it's the new format (text, options, correctOption)
                if (row.text && row.options) {
                  questionText = row.text;
                  // Parse semicolon-separated options
                  options = row.options.split(';').map(opt => opt.trim()).filter(opt => opt !== '');
                  correctAnswer = row.correctOption;
                  explanation = row.explanation || '';
                } 
                // Check if it's the old format (question, option1, option2, etc.)
                else if (row.question) {
                  questionText = row.question;
                  // Collect all options from the row (option1, option2, etc.)
                  options = [];
                  for (let i = 1; i <= 4; i++) {
                    const optionKey = `option${i}`;
                    if (row[optionKey] && row[optionKey].trim() !== '') {
                      options.push(row[optionKey].trim());
                    }
                  }
                  correctAnswer = row.correctAnswer;
                  explanation = row.explanation || '';
                }
                // If neither format is detected, throw an error
                else {
                  console.error('Unrecognized CSV format for row:', row);
                  throw new Error(`Row ${index + 1}: Unrecognized CSV format. Expected either 'text' or 'question' column.`);
                }
                
                // Validate the question data
                if (!questionText || questionText.trim() === '') {
                  throw new Error(`Row ${index + 1}: Question text is missing or empty`);
                }
                
                if (!options || options.length < 2) {
                  throw new Error(`Row ${index + 1}: Question "${questionText}" needs at least 2 options. Found: ${options ? options.length : 0}`);
                }
                
                if (!correctAnswer || correctAnswer.trim() === '') {
                  throw new Error(`Row ${index + 1}: Question "${questionText}" is missing a correct answer`);
                }
                
                // Handle correctAnswer that might be an index (0, 1, 2, 3)
                let correctAnswerText = correctAnswer.trim();
                if (/^[0-3]$/.test(correctAnswerText)) {
                  const index = parseInt(correctAnswerText, 10);
                  if (index >= 0 && index < options.length) {
                    correctAnswerText = options[index];
                  } else {
                    throw new Error(`Row ${index + 1}: Question "${questionText}" has an invalid correct answer index: ${index}`);
                  }
                }
                
                // Check if correctAnswer exists in options
                if (!options.includes(correctAnswerText)) {
                  console.log(`Options for question "${questionText}":`, options);
                  console.log(`Looking for correct answer:`, correctAnswerText);
                  throw new Error(`Row ${index + 1}: Question "${questionText}" has a correct answer "${correctAnswerText}" that doesn't match any option. Available options: ${options.join(', ')}`);
                }
                
                return {
                  text: questionText.trim(),
                  options: options,
                  correctAnswer: correctAnswerText,
                  explanation: explanation ? explanation.trim() : ''
                };
              });
              
              console.log(`Successfully parsed ${questions.length} questions from CSV`);
              resolve(questions);
            } catch (error) {
              console.error('Error processing CSV data:', error);
              reject(error);
            }
          },
          error: (error) => {
            console.error('CSV parsing failed:', error);
            reject(new Error('Failed to parse CSV file: ' + error.message));
          }
        });
      });
    } catch (error) {
      console.error('Error reading CSV file:', error);
      throw new Error('Failed to read CSV file: ' + error.message);
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
      
      console.log('Creating quiz with data:', JSON.stringify(quizData, null, 2));
      
      // Create quiz using appwrite service - this must succeed first
      const newQuiz = await appwriteService.createQuiz(quizData);
      
      console.log('Quiz created successfully:', newQuiz.$id);
      
      // If we're in CSV import mode, parse the CSV and create questions
      if (csvImportMode && csvFile) {
        console.log('Starting CSV import for quiz:', newQuiz.$id);
        
        try {
          const questions = await parseCsv(csvFile.uri);
          console.log(`Parsed ${questions.length} questions from CSV`);
          
          // Create questions in the database sequentially to avoid race conditions
          const createdQuestions = [];
          for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            console.log(`Creating question ${i + 1}/${questions.length}:`, question.text.substring(0, 50) + '...');
            
            try {
              const createdQuestion = await appwriteService.createQuestion({
                quizId: newQuiz.$id,
                text: question.text,
                type: 'multiple-choice',
                options: question.options,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                points: 1,
                order: i + 1
              });
              createdQuestions.push(createdQuestion);
              console.log(`Question ${i + 1} created successfully`);
            } catch (questionError) {
              console.error(`Failed to create question ${i + 1}:`, questionError);
              throw new Error(`Failed to create question ${i + 1}: ${questionError.message}`);
            }
          }
          
          console.log(`Successfully created ${createdQuestions.length} questions`);
          
          Alert.alert(
            'Success', 
            `Quiz created with ${createdQuestions.length} questions from CSV!`,
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
        } catch (csvError) {
          console.error('Failed to import CSV:', csvError);
          Alert.alert(
            'Partial Success',
            `Quiz "${newQuiz.title}" was created successfully, but there was an error importing questions from CSV: ${csvError.message}\n\nYou can add questions manually using the question editor.`,
            [
              {
                text: 'Add Questions Manually',
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
            Upload a CSV file with questions. Supports two formats:
          </Text>
          
          <Text variant="caption" style={styles.csvNote}>
            <Text style={{ fontWeight: 'bold' }}>Format 1 (Simple):</Text>
          </Text>
          <Text style={styles.csvFormat}>
            question,option1,option2,option3,option4,correctAnswer,explanation
          </Text>
          
          <Text variant="caption" style={styles.csvNote}>
            <Text style={{ fontWeight: 'bold' }}>Format 2 (Advanced):</Text>
          </Text>
          <Text style={styles.csvFormat}>
            text,options,correctOption,explanation
          </Text>
          
          <Text variant="caption" style={styles.csvNote}>
            Notes: 
            - Format 1: Separate columns for each option (option1, option2, etc.)
            - Format 2: Semicolon-separated options in one column (e.g., "option1;option2;option3")
            - The correctAnswer/correctOption must exactly match one of the options
            - Alternatively, it can be 0, 1, 2, or 3 to indicate the option index
            - First row must be the header row
            - At least 2 options required per question
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
          
          <TouchableOpacity 
            style={styles.sampleCsvLink}
            onPress={createSampleCsv}
          >
            <Text variant="caption" color={colors.primary.main}>
              Download Sample CSV Template
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const createSampleCsv = async () => {
    try {
      // Create a sample CSV content
      const csvContent = 
`question,option1,option2,option3,option4,correctAnswer,explanation
What is the capital of France?,Paris,London,Berlin,Madrid,Paris,Paris is the capital and most populous city of France.
What does "Hello" mean in Spanish?,Hola,Adios,Gracias,Buenos dias,Hola,Hola is the Spanish word for Hello.
Which planet is closest to the sun?,Venus,Mercury,Earth,Mars,Mercury,Mercury is the closest planet to the sun in our solar system.`;
      
      // Create a temporary file in the app's cache directory
      const fileUri = FileSystem.cacheDirectory + 'sample_questions.csv';
      
      // Write the CSV content to the file
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      // Share the file with the user
      await FileSystem.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Download Sample CSV',
        UTI: 'public.comma-separated-values-text'
      });
      
    } catch (error) {
      console.error('Error creating sample CSV:', error);
      Alert.alert('Error', 'Failed to create sample CSV file');
    }
  };
  
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
  csvNote: {
    marginBottom: spacing.md,
    color: colors.neutral.darkGray,
    fontSize: typography.fontSizes.sm,
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
  sampleCsvLink: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
});