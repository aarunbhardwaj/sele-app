import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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
  
  // Video upload state
  const [video, setVideo] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  
  // Validation state
  const [errors, setErrors] = useState({
    title: '',
    content: '',
    description: '',
    order: '',
    duration: '',
    video: ''
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
      duration: '',
      video: ''
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
  
  const handlePickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true
      });
      
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setVideo(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to select video file');
    }
  };
  
  const handleUploadVideo = async () => {
    if (!video) return;
    
    setUploadingVideo(true);
    
    try {
      console.log('DEBUG: Starting video upload process');
      
      // Check if the file exists and is accessible
      const fileInfo = await FileSystem.getInfoAsync(video.uri);
      console.log('DEBUG: File info:', fileInfo);
      
      if (!fileInfo.exists) {
        throw new Error("File doesn't exist at the specified URI");
      }
      
      // Create a file object with the correct properties
      // The file name is important for content-type detection on server
      const fileObject = {
        name: video.name || `video_${Date.now()}.mp4`,
        type: video.mimeType || 'video/mp4',
        size: video.size,
        uri: video.uri
      };
      
      console.log('DEBUG: Sending file object to uploadMedia');
      const uploadResult = await appwriteService.uploadMedia(fileObject);
      
      if (uploadResult && uploadResult.$id) {
        setVideoId(uploadResult.$id);
        Alert.alert('Success', 'Video uploaded successfully');
      }
    } catch (error) {
      console.error('Failed to upload video:', error);
      Alert.alert('Error', 'Failed to upload video: ' + (error.message || error));
      setErrors(prev => ({...prev, video: 'Failed to upload video'}));
    } finally {
      setUploadingVideo(false);
    }
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
        isPublished,
        videoId: videoId || undefined  // Include video ID if available
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
              
              {/* Video Upload Section */}
              <View style={styles.formGroup}>
                <Text variant="subtitle1" style={styles.label}>Lesson Video</Text>
                <View style={styles.videoUploadContainer}>
                  <View style={styles.videoSelectionContainer}>
                    <TouchableOpacity 
                      style={styles.videoPickerButton}
                      onPress={handlePickVideo}
                      disabled={uploadingVideo}
                    >
                      <Ionicons name="videocam" size={24} color={colors.primary.main} />
                      <Text style={styles.videoPickerText}>
                        {video ? 'Change Video' : 'Select Video'}
                      </Text>
                    </TouchableOpacity>
                    
                    {video && (
                      <View style={styles.videoInfoContainer}>
                        <Ionicons name="document-attach" size={20} color={colors.neutral.darkGray} />
                        <Text variant="body2" style={styles.videoFileName} numberOfLines={1}>
                          {video.name || 'Video file'}
                        </Text>
                        <Text variant="caption" style={styles.videoFileSize}>
                          {video.size ? `${(video.size / 1024 / 1024).toFixed(2)} MB` : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {video && !videoId && (
                    <Button
                      title={uploadingVideo ? 'Uploading...' : 'Upload Video'}
                      variant="outline"
                      onPress={handleUploadVideo}
                      disabled={uploadingVideo || !video}
                      style={styles.uploadButton}
                      icon={uploadingVideo ? <ActivityIndicator size="small" color={colors.primary.main} /> : null}
                    />
                  )}
                  
                  {videoId && (
                    <View style={styles.uploadSuccessContainer}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                      <Text variant="body2" style={styles.uploadSuccessText}>
                        Video uploaded successfully
                      </Text>
                    </View>
                  )}
                </View>
                {errors.video ? (
                  <Text variant="caption" color={colors.status.error} style={styles.errorText}>
                    {errors.video}
                  </Text>
                ) : (
                  <Text variant="caption" color={colors.neutral.darkGray} style={styles.helperText}>
                    Upload a video file for this lesson (MP4, MOV, or WebM recommended)
                  </Text>
                )}
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
  videoUploadContainer: {
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
  },
  videoSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  videoPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  videoPickerText: {
    color: colors.primary.main,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  videoInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  videoFileName: {
    marginLeft: spacing.xs,
    color: colors.neutral.text,
    flex: 1,
  },
  videoFileSize: {
    color: colors.neutral.darkGray,
    marginLeft: spacing.xs,
  },
  uploadButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  uploadSuccessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  uploadSuccessText: {
    marginLeft: spacing.xs,
    color: colors.status.success,
  },
});