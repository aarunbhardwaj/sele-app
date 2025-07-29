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

const levelOptions = ["beginner", "intermediate", "advanced", "all levels"];

export default function EditCourseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Course form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('beginner');
  const [duration, setDuration] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [tags, setTags] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    duration: ''
  });
  
  // Fetch course data when component mounts
  useEffect(() => {
    if (id) {
      fetchCourseData(id);
    } else {
      setLoading(false);
      Alert.alert('Error', 'Course ID not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [id]);
  
  const fetchCourseData = async (courseId: string) => {
    try {
      const courseData = await appwriteService.getCourseById(courseId);
      
      // Populate form with course data
      setTitle(courseData.title);
      setDescription(courseData.description);
      setLevel(courseData.level || 'beginner');
      setDuration(courseData.duration);
      setIsPublished(courseData.isPublished);
      
      // Convert tags array to comma-separated string
      if (courseData.tags && Array.isArray(courseData.tags)) {
        setTags(courseData.tags.join(', '));
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      Alert.alert('Error', 'Failed to load course data', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      title: '',
      description: '',
      duration: ''
    };
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (description.length < 20) {
      newErrors.description = 'Description should be at least 20 characters';
      isValid = false;
    }
    
    if (!duration.trim()) {
      newErrors.duration = 'Duration is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleUpdateCourse = async () => {
    if (!validateForm() || !id) {
      return;
    }
    
    setSaving(true);
    
    try {
      // Format tags as array
      const tagsArray = tags
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];
      
      // Create course data object
      const courseData = {
        title,
        description,
        level,
        duration,
        isPublished,
        tags: tagsArray,
      };
      
      // Update course using appwrite service
      await appwriteService.updateCourse(id, courseData);
      
      Alert.alert(
        'Success', 
        'Course updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(admin)/(courses)/course-library')
          }
        ]
      );
    } catch (error) {
      console.error('Failed to update course:', error);
      Alert.alert(
        'Error',
        'Failed to update course. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };
  
  const renderLevelSelection = () => (
    <View style={styles.levelSelector}>
      {levelOptions.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.levelOption,
            level === option && styles.selectedLevelOption
          ]}
          onPress={() => setLevel(option)}
        >
          <Text 
            variant="button" 
            color={level === option ? colors.neutral.white : colors.neutral.text}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="Edit Course"
          leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
          onLeftIconPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading course data...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Edit Course"
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
              <Text variant="h4" style={styles.pageTitle}>Edit Course</Text>
              <Text variant="body2" style={styles.pageSubtitle}>
                Update the course information below
              </Text>
            </View>
            
            <Card style={styles.formCard}>
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Course Title</Text>
                <TextInput 
                  style={[styles.input, errors.title ? styles.inputError : null]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter course title"
                  placeholderTextColor={colors.neutral.gray}
                />
                {errors.title ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.title}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Description</Text>
                <TextInput 
                  style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter course description"
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
                <Text variant="subtitle1" style={styles.label}>Course Level</Text>
                {renderLevelSelection()}
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Duration</Text>
                <TextInput 
                  style={[styles.input, errors.duration ? styles.inputError : null]}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="e.g. 4 weeks, 10 hours, etc."
                  placeholderTextColor={colors.neutral.gray}
                />
                {errors.duration ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.duration}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Tags (comma separated)</Text>
                <TextInput 
                  style={styles.input}
                  value={tags}
                  onChangeText={setTags}
                  placeholder="e.g. grammar, vocabulary, beginner"
                  placeholderTextColor={colors.neutral.gray}
                />
              </View>
              
              <View style={styles.switchContainer}>
                <Text variant="subtitle1">Published</Text>
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
                  title={saving ? 'Saving...' : 'Update Course'}
                  onPress={handleUpdateCourse}
                  disabled={saving}
                  style={styles.actionButton}
                  icon={saving ? <ActivityIndicator size="small" color={colors.neutral.white} /> : null}
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
  textArea: {
    height: 120,
    paddingTop: spacing.sm,
  },
  levelSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  levelOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.lightGray,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedLevelOption: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.neutral.darkGray,
    marginTop: spacing.md,
  },
});