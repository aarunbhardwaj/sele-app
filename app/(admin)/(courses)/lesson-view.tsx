import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { borderRadius, colors, spacing, typography } from '../../../components/ui/theme';
import { Text } from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

interface Lesson {
  $id: string;
  title: string;
  description: string;
  content: string;
  courseId: string;
  order: number;
  isPublished: boolean;
  duration: number;
  videoId?: string;
  mediaUrl?: string;
  mediaUrls?: string | string[]; // Updated to handle both string and array of strings
  createdAt: string;
  updatedAt: string;
}

export default function LessonViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const lessonId = params.id as string;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);
  
  const fetchLessonData = useCallback(async (lessonId: string) => {
    try {
      setLoading(true);
      const lessonData = await appwriteService.getLessonById(lessonId);
      
      if (lessonData) {
        // Use type assertion with unknown as intermediate step to satisfy TypeScript
        setLesson(lessonData as unknown as Lesson);
        
        // Fetch course title
        if (lessonData.courseId) {
          const courseData = await appwriteService.getCourseById(lessonData.courseId);
          if (courseData) {
            setCourseTitle(courseData.title);
          }
        }
        
        // Check for video URL in different possible fields
        if (lessonData.mediaUrls) {
          // First priority: use mediaUrls field (the correct field name in schema)
          console.log('Using stored mediaUrls:', lessonData.mediaUrls);
          
          // Handle the case where mediaUrls is an array of strings
          if (Array.isArray(lessonData.mediaUrls) && lessonData.mediaUrls.length > 0) {
            // Get the first URL in the array and remove any mode=admin parameters
            let url = lessonData.mediaUrls[0];
            // Remove mode=admin from the URL as it requires special permissions
            url = url.replace(/(\?|&)mode=admin/, '');
            setVideoUrl(url);
          } else {
            // If it's a string, clean and use it directly
            let url = lessonData.mediaUrls as string;
            url = url.replace(/(\?|&)mode=admin/, '');
            setVideoUrl(url);
          }
        } else if (lessonData.mediaUrl) {
          // Second priority: fallback to mediaUrl for backward compatibility
          console.log('Using stored mediaUrl:', lessonData.mediaUrl);
          let url = lessonData.mediaUrl;
          url = url.replace(/(\?|&)mode=admin/, '');
          setVideoUrl(url);
        } else if (lessonData.videoId) {
          // Last resort: generate URL from videoId if available
          try {
            // Make sure the getFilePreview doesn't include mode=admin
            const videoPreview = appwriteService.getFilePreview(lessonData.videoId);
            console.log('Video URL from videoId:', videoPreview);
            setVideoUrl(videoPreview);
          } catch (error) {
            console.error('Failed to get video preview:', error);
          }
        } else {
          console.log('No video information found for this lesson');
        }
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      Alert.alert('Error', 'Failed to load lesson data', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  // Load video when videoUrl changes
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      // Reset video states when URL changes
      setVideoLoaded(false);
      setVideoError(null);
      setIsPlaying(false);
    }
  }, [videoUrl]);
  
  useEffect(() => {
    if (lessonId) {
      fetchLessonData(lessonId);
    } else {
      Alert.alert('Error', 'Lesson ID not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [lessonId, router, fetchLessonData]);
  
  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    
    try {
      // Try to load the video first if it's not already loaded
      if (!videoLoaded) {
        console.log("Attempting to load video before playing...");
        try {
          await videoRef.current.loadAsync({ uri: videoUrl as string }, {}, false);
          setVideoLoaded(true);
          console.log("Video loaded successfully");
        } catch (loadError) {
          console.error("Failed to load video:", loadError);
          setVideoError("Failed to load video");
          return;
        }
      }
      
      const status = await videoRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await videoRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          await videoRef.current.playAsync();
          setIsPlaying(true);
        }
      } else {
        console.log('Video is not loaded yet');
        
        // Try to load and play in one step
        try {
          await videoRef.current.loadAsync(
            { uri: videoUrl as string },
            { shouldPlay: true },
            false
          );
          setIsPlaying(true);
          setVideoLoaded(true);
        } catch (error) {
          console.error('Error loading video:', error);
          setVideoError("Failed to load video: " + ((error as Error)?.message || "Unknown error"));
        }
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
      setVideoError("Playback error: " + ((error as Error)?.message || "Unknown error"));
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="Lesson View"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="Lesson View"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Lesson not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Lesson"
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Breadcrumb navigation */}
          <TouchableOpacity 
            style={styles.breadcrumbs}
            onPress={() => router.push({
              pathname: '/(admin)/(courses)/course-details',
              params: { id: lesson.courseId }
            })}
          >
            <Ionicons name="chevron-back" size={16} color={colors.primary.main} />
            <Text variant="caption" color={colors.primary.main}>
              Back to {courseTitle}
            </Text>
          </TouchableOpacity>
          
          {/* Video player section (if video exists) */}
          {videoUrl ? (
            <Card style={styles.videoCard}>
              <View style={styles.videoContainer}>
                {Platform.OS === 'web' ? (
                  // Web-specific video player
                  <video 
                    src={videoUrl} 
                    controls 
                    autoPlay={false}
                    style={{ width: '100%', height: 220, borderRadius: 8 }}
                    poster={require('../../../assets/images/app-logo.png')}
                  />
                ) : (
                  // Using Expo's AV Video component for mobile
                  <View style={styles.videoWrapper}>
                    <Video
                      ref={videoRef}
                      source={{ uri: videoUrl }}
                      style={styles.videoPlayer}
                      resizeMode={ResizeMode.CONTAIN}
                      useNativeControls={true}
                      shouldPlay={false}
                      isLooping={false}
                      isMuted={false}
                      positionMillis={0}
                      posterSource={require('../../../assets/images/app-logo.png')}
                      posterStyle={{ resizeMode: 'cover' }}
                      onFullscreenUpdate={status => {
                        console.log('Fullscreen status:', status);
                      }}
                      onReadyForDisplay={() => {
                        console.log('Video ready for display');
                        setVideoLoaded(true);
                      }}
                      onError={(error) => {
                        console.error('Video playback error:', error);
                        setVideoError(`Error playing video: ${error}`);
                      }}
                      onLoad={() => {
                        console.log('Video loaded successfully');
                        setVideoLoaded(true);
                        setVideoError(null);
                      }}
                      onPlaybackStatusUpdate={(status) => {
                        if ('isLoaded' in status && status.isLoaded) {
                          setIsBuffering(status.isBuffering);
                          setIsPlaying(status.isPlaying);
                        }
                      }}
                    />
                    
                    {isBuffering && (
                      <View style={styles.bufferingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                      </View>
                    )}
                    
                    {/* Custom play button overlay */}
                    {!isPlaying && !videoError && (
                      <TouchableOpacity 
                        style={styles.playButton}
                        onPress={handlePlayPause}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="play-circle" size={60} color="white" />
                      </TouchableOpacity>
                    )}
                    
                    {/* Error message overlay */}
                    {videoError && (
                      <View style={styles.errorOverlay}>
                        <Ionicons name="alert-circle" size={40} color={colors.status.error} />
                        <Text style={styles.errorOverlayText}>
                          {videoError}
                        </Text>
                        <TouchableOpacity
                          style={styles.retryButton}
                          onPress={() => {
                            setVideoError(null);
                            if (videoRef.current) {
                              videoRef.current.loadAsync(
                                { uri: videoUrl as string },
                                { shouldPlay: false },
                                false
                              ).catch(err => {
                                console.error("Retry load failed:", err);
                                setVideoError("Failed to load video after retry");
                              });
                            }
                          }}
                        >
                          <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </Card>
          ) : (
            <Card style={styles.videoCard}>
              <View style={styles.noVideoContainer}>
                <Ionicons name="videocam-off-outline" size={40} color={colors.neutral.gray} />
                <Text variant="subtitle1" style={styles.noVideoText}>
                  No video available for this lesson
                </Text>
                <Text variant="caption" style={styles.noVideoSubtext}>
                  This lesson contains text content only
                </Text>
              </View>
            </Card>
          )}
          
          {/* Lesson details */}
          <Card style={styles.lessonCard}>
            <View style={styles.lessonHeader}>
              <View style={styles.lessonMetaRow}>
                <View style={styles.metaBadge}>
                  <Text variant="caption" style={styles.metaBadgeText}>
                    Lesson {lesson.order}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: lesson.isPublished ? colors.status.success + '20' : colors.neutral.lightGray }
                ]}>
                  <Text 
                    variant="caption" 
                    style={styles.statusText}
                    color={lesson.isPublished ? colors.status.success : colors.neutral.darkGray}
                  >
                    {lesson.isPublished ? 'Published' : 'Draft'}
                  </Text>
                </View>
              </View>
              
              <Text variant="h4" style={styles.lessonTitle}>{lesson.title}</Text>
              
              <View style={styles.metaContainer}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={16} color={colors.neutral.gray} />
                  <Text variant="caption" color={colors.neutral.gray} style={styles.metaText}>
                    {lesson.duration} min
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.neutral.gray} />
                  <Text variant="caption" color={colors.neutral.gray} style={styles.metaText}>
                    {new Date(lesson.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.sectionDivider} />
            
            <View style={styles.descriptionContainer}>
              <Text variant="subtitle1" style={styles.sectionTitle}>Description</Text>
              <Text variant="body1" style={styles.descriptionText}>
                {lesson.description}
              </Text>
            </View>
            
            <View style={styles.sectionDivider} />
            
            <View style={styles.contentSection}>
              <Text variant="subtitle1" style={styles.sectionTitle}>Lesson Content</Text>
              <Text variant="body1" style={styles.contentText}>
                {lesson.content}
              </Text>
            </View>
          </Card>
          
          {/* Action buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity 
              style={[styles.customButton, styles.outlineButton, styles.actionButton]}
              onPress={() => router.push({
                pathname: '/(admin)/(courses)/edit-lesson',
                params: { id: lesson.$id }
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="pencil-outline" size={20} color={colors.primary.main} style={{ marginRight: 8 }} />
                <Text style={{ color: colors.primary.main, fontWeight: 'bold' }}>Edit Lesson</Text>
              </View>
            </TouchableOpacity>
            
            <Button 
              title="Back to Course"
              variant="primary"
              onPress={() => router.push({
                pathname: '/(admin)/(courses)/course-details',
                params: { id: lesson.courseId }
              })}
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
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
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
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
  errorText: {
    color: colors.status.error,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  videoCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
    padding: 0,
  },
  videoContainer: {
    width: '100%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  videoWrapper: {
    height: 220,
    backgroundColor: '#000',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
  },
  videoFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  videoLink: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  videoLinkText: {
    marginTop: spacing.sm,
    color: colors.neutral.white,
    fontWeight: typography.fontWeights.medium as any,
    textAlign: 'center',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  noVideoContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  noVideoText: {
    marginTop: spacing.sm,
    color: colors.neutral.darkGray,
    textAlign: 'center',
  },
  noVideoSubtext: {
    color: colors.neutral.gray,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  lessonCard: {
    padding: spacing.lg,
  },
  lessonHeader: {
    marginBottom: spacing.md,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  metaBadge: {
    backgroundColor: colors.primary.light + '30',
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaBadgeText: {
    color: colors.primary.main,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontWeight: typography.fontWeights.medium as any,
  },
  lessonTitle: {
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metaText: {
    marginLeft: spacing.xs,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.neutral.lightGray,
    marginVertical: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    color: colors.neutral.text,
    fontWeight: typography.fontWeights.medium as any,
  },
  descriptionContainer: {
    marginBottom: spacing.md,
  },
  descriptionText: {
    color: colors.neutral.darkGray,
    lineHeight: 22,
  },
  contentSection: {
    marginBottom: spacing.lg,
  },
  contentText: {
    color: colors.neutral.text,
    lineHeight: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: spacing.md,
  },
  errorOverlayText: {
    color: colors.neutral.white,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: typography.fontWeights.medium as any,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  retryButtonText: {
    color: colors.neutral.white,
    fontWeight: typography.fontWeights.medium as any,
  },
  customButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary.main,
    backgroundColor: colors.neutral.white,
    elevation: 2,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outlineButton: {
    backgroundColor: colors.neutral.white,
  },
});