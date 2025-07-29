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

export default function CreateLessonScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const [loading, setLoading] = useState(false);
  const [courseName, setCourseName] = useState('');
  
  // Lesson form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('');
  const [duration, setDuration] = useState('15');
  const [isPublished, setIsPublished] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    description: '',
    order: '',
    duration: ''
  });
  
  useEffect(() => {
    // Fetch the course title to display which course we're adding a lesson to
    if (courseId) {
      fetchCourseTitle(courseId as string);
    } else {
      Alert.alert('Error', 'Course ID not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [courseId]);
  
  const fetchCourseTitle = async (id: string) => {
    try {
      const courseData = await appwriteService.getCourseById(id);
      if (courseData) {
        setCourseName(courseData.title);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      content: '',
      description: '',
      order: '',
      duration: ''
    };
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
      isValid = false;
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    
    if (order && isNaN(Number(order))) {
      newErrors.order = 'Order must be a valid number';
      isValid = false;
    }

    if (!duration.trim()) {
      newErrors.duration = 'Duration is required';
      isValid = false;
    } else if (isNaN(Number(duration))) {
      newErrors.duration = 'Duration must be a valid number';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleCreateLesson = async () => {
    if (!validateForm() || !courseId) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare lesson data
      const lessonData = {
        title,
        content,
        description,
        courseId: courseId as string,
        order: order ? parseInt(order, 10) : undefined,
        duration: duration ? parseInt(duration, 10) : undefined,
        isPublished
      };
      
      // Create lesson using appwrite service
      const newLesson = await appwriteService.createLesson(lessonData);
      
      Alert.alert(
        'Success', 
        'Lesson created successfully!',
        [
          {
            text: 'OK',
            // Redirect back to course details instead of lesson management
            onPress: () => router.push(`/(admin)/(courses)/course-details?id=${courseId}`)
          }
        ]
      );
    } catch (error) {
      console.error('Failed to create lesson:', error);
      Alert.alert(
        'Error',
        'Failed to create lesson: ' + (error.message || error),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Create Lesson"
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
              <Text variant="h4" style={styles.pageTitle}>Create New Lesson</Text>
              <Text variant="body2" style={styles.pageSubtitle}>
                {courseName ? `For course: ${courseName}` : 'Add a lesson to this course'}
              </Text>
            </View>
            
            <Card style={styles.formCard}>
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Lesson Title *</Text>
                <TextInput 
                  style={[styles.input, errors.title ? styles.inputError : null]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter lesson title"
                  placeholderTextColor={colors.neutral.gray}
                />
                {errors.title ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.title}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Content *</Text>
                <TextInput 
                  style={[styles.input, styles.textArea, errors.content ? styles.inputError : null]}
                  value={content}
                  onChangeText={setContent}
                  placeholder="Enter lesson content"
                  placeholderTextColor={colors.neutral.gray}
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                />
                {errors.content ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.content}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Description *</Text>
                <TextInput 
                  style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter lesson description"
                  placeholderTextColor={colors.neutral.gray}
                  multiline
                  numberOfLines={10}
                  textAlignVertical="top"
                />
                {errors.description ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.description}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Order (optional)</Text>
                <TextInput 
                  style={[styles.input, errors.order ? styles.inputError : null]}
                  value={order}
                  onChangeText={setOrder}
                  placeholder="Enter lesson order number"
                  placeholderTextColor={colors.neutral.gray}
                  keyboardType="numeric"
                />
                {errors.order ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.order}
                  </Text>
                ) : (
                  <Text variant="caption" color={colors.neutral.darkGray} style={styles.helperText}>
                    Leave blank to automatically assign the next order number
                  </Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Duration (minutes) *</Text>
                <TextInput 
                  style={[styles.input, errors.duration ? styles.inputError : null]}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="Enter duration in minutes (e.g., 15)"
                  placeholderTextColor={colors.neutral.gray}
                  keyboardType="numeric"
                />
                {errors.duration ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.duration}
                  </Text>
                ) : (
                  <Text variant="caption" color={colors.neutral.darkGray} style={styles.helperText}>
                    Enter the duration in minutes (numbers only)
                  </Text>
                )}
              </View>
              
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
                  title={loading ? 'Creating...' : 'Create Lesson'}
                  onPress={handleCreateLesson}
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
  textArea: {
    height: 200,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  helperText: {
    marginTop: spacing.xs,
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
});