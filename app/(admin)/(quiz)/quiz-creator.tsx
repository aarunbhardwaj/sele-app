import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import Papa from 'papaparse';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

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

const { width } = Dimensions.get('window');

interface DocumentPickerAsset {
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
}

interface Question {
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const difficultyOptions = [
  { value: "beginner", label: "Beginner", icon: "leaf-outline", color: airbnbColors.secondary },
  { value: "intermediate", label: "Intermediate", icon: "trending-up-outline", color: "#F59E0B" },
  { value: "advanced", label: "Advanced", icon: "flash-outline", color: airbnbColors.primary },
  { value: "mixed", label: "Mixed", icon: "shuffle-outline", color: "#8B5CF6" }
];

const categoryOptions = [
  { value: "vocabulary", label: "Vocabulary", icon: "library-outline", color: airbnbColors.primary },
  { value: "grammar", label: "Grammar", icon: "construct-outline", color: airbnbColors.secondary },
  { value: "general", label: "General", icon: "globe-outline", color: airbnbColors.primaryLight }
];

export default function QuizCreatorScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvFile, setCsvFile] = useState<DocumentPickerAsset | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Quiz form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [category, setCategory] = useState('vocabulary');
  const [timeLimit, setTimeLimit] = useState('60');
  const [passScore, setPassScore] = useState('70');
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
        return;
      }

      const file = result.assets[0] as DocumentPickerAsset;
      setCsvFile(file);
      Alert.alert('Success', 'CSV file selected: ' + file.name);
    } catch (error) {
      console.error('Error picking CSV file:', error);
      Alert.alert('Error', 'Failed to select CSV file');
    } finally {
      setCsvLoading(false);
    }
  };

  const parseCsv = async (fileUri: string): Promise<Question[]> => {
    try {
      let fileContent: string;
      
      if (Platform.OS === 'web') {
        if (fileUri.startsWith('data:')) {
          const base64Data = fileUri.split(',')[1];
          fileContent = atob(base64Data);
        } else if (fileUri.startsWith('blob:')) {
          const response = await fetch(fileUri);
          fileContent = await response.text();
        } else {
          const response = await fetch(fileUri);
          fileContent = await response.text();
        }
      } else {
        fileContent = await FileSystem.readAsStringAsync(fileUri);
      }
      
      if (!fileContent || fileContent.trim() === '') {
        throw new Error('CSV file is empty');
      }
      
      return new Promise((resolve, reject) => {
        Papa.parse(fileContent, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors && results.errors.length > 0) {
              reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
              return;
            }
            
            if (!results.data || results.data.length === 0) {
              reject(new Error('No valid questions found in CSV file'));
              return;
            }
            
            try {
              const questions = (results.data as any[]).map((row, index) => {
                let questionText: string, options: string[], correctAnswer: string, explanation: string;
                
                if (row.text && row.options) {
                  questionText = row.text;
                  options = row.options.split(';').map((opt: string) => opt.trim()).filter((opt: string) => opt !== '');
                  correctAnswer = row.correctOption;
                  explanation = row.explanation || '';
                } 
                else if (row.question) {
                  questionText = row.question;
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
                else {
                  throw new Error(`Row ${index + 1}: Unrecognized CSV format.`);
                }
                
                if (!questionText || questionText.trim() === '') {
                  throw new Error(`Row ${index + 1}: Question text is missing`);
                }
                
                if (!options || options.length < 2) {
                  throw new Error(`Row ${index + 1}: At least 2 options required`);
                }
                
                if (!correctAnswer || correctAnswer.trim() === '') {
                  throw new Error(`Row ${index + 1}: Correct answer is missing`);
                }
                
                let correctAnswerText = correctAnswer.trim();
                if (/^[0-3]$/.test(correctAnswerText)) {
                  const answerIndex = parseInt(correctAnswerText, 10);
                  if (answerIndex >= 0 && answerIndex < options.length) {
                    correctAnswerText = options[answerIndex];
                  }
                }
                
                if (!options.includes(correctAnswerText)) {
                  throw new Error(`Row ${index + 1}: Correct answer doesn't match any option`);
                }
                
                return {
                  text: questionText.trim(),
                  options: options,
                  correctAnswer: correctAnswerText,
                  explanation: explanation ? explanation.trim() : ''
                };
              });
              
              resolve(questions);
            } catch (error) {
              reject(error);
            }
          },
          error: (error) => {
            reject(new Error('Failed to parse CSV file: ' + (error as Error).message));
          }
        });
      });
    } catch (error) {
      throw new Error('Failed to read CSV file: ' + (error as Error).message);
    }
  };

  const handleCreateQuiz = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const quizData: any = {
        title,
        description,
        difficulty,
        category,
        timeLimit: parseInt(timeLimit, 10),
        passScore: parseInt(passScore, 10),
        isPublished
      };
      
      if (courseId) {
        quizData.courseId = courseId;
      }
      
      const newQuiz = await appwriteService.createQuiz(quizData);
      
      if (csvImportMode && csvFile) {
        try {
          const questions = await parseCsv(csvFile.uri);
          const createdQuestions = [];
          
          for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
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
          }
          
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
          Alert.alert(
            'Partial Success',
            `Quiz "${newQuiz.title}" was created successfully, but there was an error importing questions from CSV: ${(csvError as Error).message}`,
            [
              {
                text: 'Add Questions Manually',
                onPress: () => router.push({
                  pathname: '/(admin)/(quiz)/question-editor',
                  params: { quizId: newQuiz.$id }
                })
              }
            ]
          );
        }
      } else {
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
      Alert.alert('Error', 'Failed to create quiz: ' + ((error as Error).message || error));
    } finally {
      setLoading(false);
    }
  };

  const createSampleCsv = async () => {
    try {
      const csvContent = 
`question,option1,option2,option3,option4,correctAnswer,explanation
What is the capital of France?,Paris,London,Berlin,Madrid,Paris,Paris is the capital and most populous city of France.
What does "Hello" mean in Spanish?,Hola,Adios,Gracias,Buenos dias,Hola,Hola is the Spanish word for Hello.
Which planet is closest to the sun?,Venus,Mercury,Earth,Mars,Mercury,Mercury is the closest planet to the sun in our solar system.`;
      
      const fileUri = FileSystem.cacheDirectory + 'sample_questions.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Download Sample CSV',
          UTI: 'public.comma-separated-values-text'
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create sample CSV file');
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
        </View>
        <Text style={styles.stepLabel}>Basic Info</Text>
      </View>
      <View style={styles.stepConnector} />
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
        </View>
        <Text style={styles.stepLabel}>Settings</Text>
      </View>
      <View style={styles.stepConnector} />
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep >= 3 && styles.stepCircleActive]}>
          <Text style={[styles.stepNumber, currentStep >= 3 && styles.stepNumberActive]}>3</Text>
        </View>
        <Text style={styles.stepLabel}>Questions</Text>
      </View>
    </View>
  );

  const renderCategoryGrid = () => (
    <View style={styles.categoryGrid}>
      {categoryOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.categoryCard,
            category === option.value && styles.categoryCardActive
          ]}
          onPress={() => setCategory(option.value)}
        >
          <View style={[styles.categoryIcon, { backgroundColor: option.color + '15' }]}>
            <Ionicons name={option.icon as any} size={24} color={option.color} />
          </View>
          <Text style={[
            styles.categoryLabel,
            category === option.value && styles.categoryLabelActive
          ]}>
            {option.label}
          </Text>
          {category === option.value && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark-circle" size={20} color={airbnbColors.primary} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDifficultyCards = () => (
    <View style={styles.difficultyCards}>
      {difficultyOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.difficultyCard,
            difficulty === option.value && styles.difficultyCardActive
          ]}
          onPress={() => setDifficulty(option.value)}
        >
          <View style={[styles.difficultyIcon, { backgroundColor: option.color + '15' }]}>
            <Ionicons name={option.icon as any} size={20} color={option.color} />
          </View>
          <Text style={[
            styles.difficultyLabel,
            difficulty === option.value && styles.difficultyLabelActive
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCsvUpload = () => (
    <View style={styles.csvSection}>
      <LinearGradient
        colors={csvImportMode ? [airbnbColors.primary, airbnbColors.primaryDark] : ['#F8FAFC', '#F1F5F9']}
        style={styles.csvCard}
      >
        <View style={styles.csvHeader}>
          <View style={styles.csvTitleContainer}>
            <View style={[styles.csvIconContainer, { backgroundColor: csvImportMode ? 'rgba(255,255,255,0.2)' : airbnbColors.primary + '15' }]}>
              <Ionicons name="document-text-outline" size={24} color={csvImportMode ? colors.neutral.white : airbnbColors.primary} />
            </View>
            <View>
              <Text style={[styles.csvTitle, { color: csvImportMode ? colors.neutral.white : colors.neutral.text }]}>
                CSV Import
              </Text>
              <Text style={[styles.csvSubtitle, { color: csvImportMode ? 'rgba(255,255,255,0.8)' : colors.neutral.gray }]}>
                Bulk import questions from file
              </Text>
            </View>
          </View>
          <Switch
            value={csvImportMode}
            onValueChange={setCsvImportMode}
            trackColor={{ false: '#E2E8F0', true: 'rgba(255,255,255,0.3)' }}
            thumbColor={csvImportMode ? colors.neutral.white : airbnbColors.primary}
          />
        </View>

        {csvImportMode && (
          <View style={styles.csvContent}>
            <View style={styles.csvFileUpload}>
              <TouchableOpacity
                style={styles.fileSelectButton}
                onPress={pickCsvFile}
                disabled={csvLoading}
              >
                <Ionicons name="cloud-upload-outline" size={20} color={airbnbColors.primary} />
                <Text style={styles.fileSelectText}>
                  {csvLoading ? 'Loading...' : 'Select CSV File'}
                </Text>
              </TouchableOpacity>
              
              {csvFile && (
                <View style={styles.selectedFileInfo}>
                  <Ionicons name="document" size={16} color={airbnbColors.primary} />
                  <Text style={styles.selectedFileName}>{csvFile.name}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={styles.sampleCsvButton}
              onPress={createSampleCsv}
            >
              <Ionicons name="download-outline" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.sampleCsvText}>Download Sample Template</Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>
      
      {errors.csvFile ? (
        <Text style={styles.errorText}>{errors.csvFile}</Text>
      ) : null}
    </View>
  );
  
  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={styles.headerContainer}>
        <PreAuthHeader 
          title="Create Quiz"
          onLeftIconPress={() => router.back()}
        />
      </SafeAreaView>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 80 } // Tab bar height + extra padding
          ]}
        >
          {/* Hero Section */}
          <LinearGradient 
            colors={[airbnbColors.primary, airbnbColors.primaryDark]} 
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Create New Quiz</Text>
              <Text style={styles.heroSubtitle}>
                Design engaging language assessments with our intuitive quiz builder
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.contentContainer}>
            {/* Step Indicator */}
            {renderStepIndicator()}
            
            {/* Basic Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quiz Information</Text>
              <View style={styles.formCard}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Quiz Title *</Text>
                  <TextInput 
                    style={[styles.input, errors.title ? styles.inputError : null]}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter an engaging quiz title"
                    placeholderTextColor={colors.neutral.gray}
                  />
                  {errors.title ? (
                    <Text style={styles.errorText}>{errors.title}</Text>
                  ) : null}
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description *</Text>
                  <TextInput 
                    style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Describe what this quiz covers and its learning objectives"
                    placeholderTextColor={colors.neutral.gray}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  {errors.description ? (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Category Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Text style={styles.sectionSubtitle}>Choose the primary focus of your quiz</Text>
              {renderCategoryGrid()}
            </View>

            {/* Difficulty Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Difficulty Level</Text>
              <Text style={styles.sectionSubtitle}>Select the appropriate challenge level</Text>
              {renderDifficultyCards()}
            </View>

            {/* Quiz Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quiz Settings</Text>
              <View style={styles.formCard}>
                <View style={styles.settingsRow}>
                  <View style={styles.settingItem}>
                    <Text style={styles.label}>Time Limit (seconds)</Text>
                    <TextInput 
                      style={[styles.input, styles.numberInput, errors.timeLimit ? styles.inputError : null]}
                      value={timeLimit}
                      onChangeText={setTimeLimit}
                      placeholder="60"
                      placeholderTextColor={colors.neutral.gray}
                      keyboardType="numeric"
                    />
                    {errors.timeLimit ? (
                      <Text style={styles.errorText}>{errors.timeLimit}</Text>
                    ) : (
                      <Text style={styles.helperText}>0 for no time limit</Text>
                    )}
                  </View>

                  <View style={styles.settingItem}>
                    <Text style={styles.label}>Pass Score (%)</Text>
                    <TextInput 
                      style={[styles.input, styles.numberInput, errors.passScore ? styles.inputError : null]}
                      value={passScore}
                      onChangeText={setPassScore}
                      placeholder="70"
                      placeholderTextColor={colors.neutral.gray}
                      keyboardType="numeric"
                    />
                    {errors.passScore ? (
                      <Text style={styles.errorText}>{errors.passScore}</Text>
                    ) : (
                      <Text style={styles.helperText}>Minimum score to pass</Text>
                    )}
                  </View>
                </View>

                <View style={styles.publishToggle}>
                  <View style={styles.publishInfo}>
                    <Text style={styles.publishTitle}>Publish Immediately</Text>
                    <Text style={styles.publishSubtitle}>
                      Make this quiz available to students right away
                    </Text>
                  </View>
                  <Switch
                    value={isPublished}
                    onValueChange={setIsPublished}
                    trackColor={{ false: '#E2E8F0', true: airbnbColors.primaryLight }}
                    thumbColor={isPublished ? airbnbColors.primary : '#6B7280'}
                  />
                </View>
              </View>
            </View>

            {/* CSV Upload Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add Questions</Text>
              <Text style={styles.sectionSubtitle}>Choose how you want to add questions to your quiz</Text>
              {renderCsvUpload()}
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.createButton, loading && styles.createButtonDisabled]}
                onPress={handleCreateQuiz}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.neutral.white} />
                ) : (
                  <Ionicons name="add-circle" size={20} color={colors.neutral.white} />
                )}
                <Text style={styles.createButtonText}>
                  {loading ? 'Creating...' : 'Create Quiz'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  headerContainer: {
    backgroundColor: colors.neutral.white,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },

  // Content
  contentContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: airbnbColors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: colors.neutral.white,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.neutral.gray,
    fontWeight: '500',
  },
  stepConnector: {
    width: 40,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: spacing.sm,
  },

  // Sections
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.neutral.gray,
    marginBottom: spacing.lg,
  },

  // Form Elements
  formCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.neutral.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: airbnbColors.primary,
    backgroundColor: airbnbColors.primary + '10',
  },
  textArea: {
    height: 100,
    paddingTop: spacing.md,
  },
  numberInput: {
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: airbnbColors.primary,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: colors.neutral.gray,
    marginTop: spacing.xs,
  },

  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - spacing.lg * 2 - spacing.md * 2) / 3,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  categoryCardActive: {
    borderColor: airbnbColors.primary,
    backgroundColor: airbnbColors.primary + '05',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral.darkGray,
    textAlign: 'center',
  },
  categoryLabelActive: {
    color: airbnbColors.primary,
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Difficulty Cards
  difficultyCards: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  difficultyCard: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  difficultyCardActive: {
    borderColor: airbnbColors.primary,
    backgroundColor: airbnbColors.primary + '05',
  },
  difficultyIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  difficultyLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral.darkGray,
  },
  difficultyLabelActive: {
    color: airbnbColors.primary,
    fontWeight: '600',
  },

  // Settings
  settingsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  settingItem: {
    flex: 1,
  },
  publishToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  publishInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  publishTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  publishSubtitle: {
    fontSize: 12,
    color: colors.neutral.gray,
  },

  // CSV Section
  csvSection: {
    marginBottom: spacing.lg,
  },
  csvCard: {
    borderRadius: 16,
    padding: spacing.lg,
  },
  csvHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  csvTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  csvIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  csvTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  csvSubtitle: {
    fontSize: 12,
  },
  csvContent: {
    gap: spacing.md,
  },
  csvFileUpload: {
    gap: spacing.sm,
  },
  fileSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  fileSelectText: {
    fontSize: 14,
    fontWeight: '500',
    color: airbnbColors.primary,
    marginLeft: spacing.sm,
  },
  selectedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  selectedFileName: {
    fontSize: 12,
    color: colors.neutral.white,
    marginLeft: spacing.sm,
    flex: 1,
  },
  sampleCsvButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  sampleCsvText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: spacing.xs,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.darkGray,
  },
  createButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: airbnbColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
    marginLeft: spacing.sm,
  },
});