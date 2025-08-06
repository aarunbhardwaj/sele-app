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

export default function EditLessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [courseName, setCourseName] = useState('');
  const [courseId, setCourseId] = useState('');
  
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
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  
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
    if (id) {
      fetchLessonData(id as string);
    } else {
      Alert.alert('Error', 'Lesson ID not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [id]);
  
  const fetchLessonData = async (lessonId: string) => {
    try {
      setInitialLoading(true);
      const lessonData = await appwriteService.getLessonById(lessonId);
      
      if (lessonData) {
        // Set form fields from lesson data
        setTitle(lessonData.title || '');
        setContent(lessonData.content || '');
        setDescription(lessonData.description || '');
        setOrder(lessonData.order?.toString() || '');
        setDuration(lessonData.duration?.toString() || '15');
        setIsPublished(lessonData.isPublished || false);
        setCourseId(lessonData.courseId);
        
        // Set video information if available
        if (lessonData.videoId) {
          setVideoId(lessonData.videoId);
        }
        
        if (lessonData.mediaUrl) {
          setMediaUrl(lessonData.mediaUrl);
        }
        
        // Fetch course name
        if (lessonData.courseId) {
          const courseData = await appwriteService.getCourseById(lessonData.courseId);
          if (courseData) {
            setCourseName(courseData.title);
          }
        }
      } else {
        Alert.alert('Error', 'Lesson not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      Alert.alert('Error', 'Failed to load lesson data', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setInitialLoading(false);
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
        setMediaUrl(uploadResult.url); // Set the media URL here
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
  
  const handleUpdateLesson = async () => {
    if (!validateForm() || !id || !courseId) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare lesson data with the correct field name "mediaUrls" instead of "mediaUrl"
      const lessonData = {
        title,
        content,
        description,
        courseId,
        order: order ? parseInt(order, 10) : undefined,
        duration: duration ? parseInt(duration, 10) : undefined,
        isPublished,
        mediaUrls: mediaUrl || undefined // Using the correct field name "mediaUrls"
      };
      
      console.log('Updating lesson with data:', lessonData);
      
      // Update lesson using appwrite service
      await appwriteService.updateLesson(id as string, lessonData);
      
      Alert.alert(
        'Success', 
        'Lesson updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.push(`/(admin)/(courses)/lesson-view?id=${id}`)
          }
        ]
      );
    } catch (error) {
      console.error('Failed to update lesson:', error);
      Alert.alert(
        'Error',
        'Failed to update lesson: ' + (error.message || error),
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="Edit Lesson"
          leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
          onLeftIconPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading lesson data...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Edit Lesson"
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
              <Text variant="h4" style={styles.pageTitle}>Edit Lesson</Text>
              <Text variant="body2" style={styles.pageSubtitle}>
                {courseName ? `Course: ${courseName}` : 'Loading course...'}
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
                        {videoId ? 'Change Video' : 'Select Video'}
                      </Text>
                    </TouchableOpacity>
                    
                    {videoId && !video && (
                      <View style={styles.videoInfoContainer}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                        <Text variant="body2" style={styles.videoFileName} numberOfLines={1}>
                          Current video
                        </Text>
                      </View>
                    )}
                    
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
                  
                  {video && (
                    <Button
                      title={uploadingVideo ? 'Uploading...' : 'Upload Video'}
                      variant="outline"
                      onPress={handleUploadVideo}
                      disabled={uploadingVideo || !video}
                      style={styles.uploadButton}
                      icon={uploadingVideo ? <ActivityIndicator size="small" color={colors.primary.main} /> : null}
                    />
                  )}
                  
                  {videoId && !video && (
                    <View style={styles.uploadSuccessContainer}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.status.success} />
                      <Text variant="body2" style={styles.uploadSuccessText}>
                        Video already uploaded
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
                    The order number determines where this lesson appears in the course
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
                  title={loading ? 'Updating...' : 'Update Lesson'}
                  onPress={handleUpdateLesson}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.neutral.darkGray,
  },
});