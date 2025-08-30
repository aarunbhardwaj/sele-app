import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import appwriteService from '../../../services/appwrite';

// Airbnb Colors
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#E1474C',
  secondary: '#00A699',
  tertiary: '#FC642D',
  dark: '#484848',
  mediumGray: '#767676',
  lightGray: '#EBEBEB',
  superLightGray: '#F7F7F7',
  white: '#FFFFFF',
  black: '#222222',
  success: '#008A05',
  warning: '#FFB400',
  error: '#C13515',
  background: '#FDFDFD',
  border: '#DDDDDD',
};

// Airbnb Typography
const airbnbTypography = {
  fontFamily: Platform.OS === 'ios' ? 'Circular' : 'CircularStd',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 32,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Airbnb Spacing
const airbnbSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

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
  mediaUrls?: string | string[];
  createdAt: string;
  updatedAt: string;
}

interface AirbnbTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  variant?: 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'small';
  color?: string;
  numberOfLines?: number;
  [key: string]: any;
}

export default function LessonViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const lessonId = params.id as string;
  const insets = useSafeAreaInsets();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  // Create video player instance - always create with null first, then update
  const player = useVideoPlayer(null, (player) => {
    if (player) {
      player.muted = false;
      player.loop = false;
    }
  });

  // Update player source when videoUrl changes
  useEffect(() => {
    if (player && videoUrl) {
      try {
        console.log('Loading video URL:', videoUrl);
        setVideoError(null);
        setIsVideoReady(false);
        
        // Replace the player source
        player.replace({ uri: videoUrl });
        
        // Add listeners for player events
        const statusListener = player.addListener('statusChange', (status) => {
          console.log('Video status changed:', status);
          if (status.status === 'error') {
            setVideoError('Failed to load video');
            setIsVideoReady(false);
          } else if (status.status === 'readyToPlay') {
            setIsVideoReady(true);
            setVideoError(null);
          }
        });

        return () => {
          statusListener?.remove();
        };
      } catch (error) {
        console.error('Error setting up video player:', error);
        setVideoError('Failed to initialize video player');
      }
    } else if (player && !videoUrl) {
      // Clear the player if no video URL
      setIsVideoReady(false);
      setVideoError(null);
    }
  }, [videoUrl, player]);

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
            if (url && typeof url === 'string') {
              url = url.replace(/(\?|&)mode=admin/, '');
              setVideoUrl(url);
            }
          } else if (typeof lessonData.mediaUrls === 'string' && lessonData.mediaUrls.trim()) {
            // If it's a string, clean and use it directly
            let url = lessonData.mediaUrls;
            url = url.replace(/(\?|&)mode=admin/, '');
            setVideoUrl(url);
          }
        } else if (lessonData.mediaUrl) {
          // Second priority: fallback to mediaUrl for backward compatibility
          console.log('Using stored mediaUrl:', lessonData.mediaUrl);
          if (typeof lessonData.mediaUrl === 'string' && lessonData.mediaUrl.trim()) {
            let url = lessonData.mediaUrl;
            url = url.replace(/(\?|&)mode=admin/, '');
            setVideoUrl(url);
          }
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
  
  useEffect(() => {
    if (lessonId) {
      fetchLessonData(lessonId);
    } else {
      Alert.alert('Error', 'Lesson ID not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [lessonId, router, fetchLessonData]);
  
  // Create Airbnb-style Text component
  const AirbnbText = ({ children, style = {}, variant = 'body', color = airbnbColors.dark, ...props }: AirbnbTextProps) => {
    const getTextStyle = (): TextStyle => {
      switch (variant) {
        case 'hero':
          return { fontSize: airbnbTypography.sizes.huge, fontWeight: airbnbTypography.weights.bold };
        case 'title':
          return { fontSize: airbnbTypography.sizes.xxxl, fontWeight: airbnbTypography.weights.semibold };
        case 'subtitle':
          return { fontSize: airbnbTypography.sizes.xl, fontWeight: airbnbTypography.weights.regular };
        case 'body':
          return { fontSize: airbnbTypography.sizes.lg, fontWeight: airbnbTypography.weights.regular };
        case 'caption':
          return { fontSize: airbnbTypography.sizes.md, fontWeight: airbnbTypography.weights.regular };
        case 'small':
          return { fontSize: airbnbTypography.sizes.sm, fontWeight: airbnbTypography.weights.regular };
        default:
          return { fontSize: airbnbTypography.sizes.lg, fontWeight: airbnbTypography.weights.regular };
      }
    };

    return (
      <Animated.Text
        style={[
          {
            color,
            fontFamily: airbnbTypography.fontFamily,
            ...getTextStyle(),
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Animated.Text>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Airbnb-style Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={airbnbColors.dark} />
          </TouchableOpacity>
          <AirbnbText variant="subtitle" style={styles.headerTitle}>Lesson</AirbnbText>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <AirbnbText style={styles.loadingText}>Loading lesson...</AirbnbText>
        </View>
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={airbnbColors.dark} />
          </TouchableOpacity>
          <AirbnbText variant="subtitle" style={styles.headerTitle}>Lesson</AirbnbText>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <AirbnbText style={styles.errorText}>Lesson not found</AirbnbText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header - Always visible */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={airbnbColors.dark} />
        </TouchableOpacity>
        <AirbnbText variant="subtitle" style={styles.headerTitle} numberOfLines={1}>
          {lesson ? lesson.title : 'Lesson'}
        </AirbnbText>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => router.push({
            pathname: '/(admin)/(courses)/edit-lesson',
            params: { id: lesson.$id }
          })}
        >
          <Ionicons name="pencil" size={20} color={airbnbColors.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 } // Add safe area + tab bar height
        ]}
      >
        {/* Breadcrumb */}
        <TouchableOpacity
          style={styles.breadcrumb}
          onPress={() => router.push({
            pathname: '/(admin)/(courses)/course-details',
            params: { id: lesson.courseId }
          })}
        >
          <Ionicons name="chevron-back" size={16} color={airbnbColors.mediumGray} />
          <AirbnbText variant="small" color={airbnbColors.mediumGray} style={styles.breadcrumbText}>
            {courseTitle}
          </AirbnbText>
        </TouchableOpacity>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.lessonBadges}>
            <View style={styles.orderBadge}>
              <AirbnbText variant="small" color={airbnbColors.primary} style={styles.badgeText}>
                Lesson {lesson.order}
              </AirbnbText>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: lesson.isPublished ? airbnbColors.success : airbnbColors.lightGray }
            ]}>
              <AirbnbText
                variant="small"
                color={lesson.isPublished ? airbnbColors.white : airbnbColors.mediumGray}
                style={styles.badgeText}
              >
                {lesson.isPublished ? '✓ Published' : 'Draft'}
              </AirbnbText>
            </View>
          </View>

          <AirbnbText variant="hero" style={styles.lessonTitle}>
            {lesson.title}
          </AirbnbText>

          <View style={styles.lessonMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={airbnbColors.mediumGray} />
              <AirbnbText variant="caption" color={airbnbColors.mediumGray} style={styles.metaText}>
                {lesson.duration} minutes
              </AirbnbText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={airbnbColors.mediumGray} />
              <AirbnbText variant="caption" color={airbnbColors.mediumGray} style={styles.metaText}>
                {new Date(lesson.createdAt).toLocaleDateString()}
              </AirbnbText>
            </View>
          </View>
        </View>

        {/* Video Section */}
        {videoUrl ? (
          <View style={styles.videoSection}>
            <View style={styles.videoContainer}>
              {Platform.OS === 'web' ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay={false}
                  style={{ width: '100%', height: 240, borderRadius: 12 }}
                  poster={require('../../../assets/images/app-logo.png')}
                />
              ) : (
                <View style={styles.videoWrapper}>
                  <VideoView
                    player={player}
                    style={styles.videoPlayer}
                    allowsFullscreen
                    allowsPictureInPicture
                    contentFit="contain"
                  />

                  {/* Loading indicator when video is not ready */}
                  {!isVideoReady && !videoError && (
                    <View style={styles.videoLoading}>
                      <ActivityIndicator size="large" color={airbnbColors.white} />
                      <AirbnbText variant="body" color={airbnbColors.white} style={styles.loadingMessage}>
                        Loading video...
                      </AirbnbText>
                    </View>
                  )}

                  {/* Video error overlay */}
                  {videoError && (
                    <View style={styles.videoError}>
                      <Ionicons name="alert-circle" size={48} color={airbnbColors.error} />
                      <AirbnbText variant="body" color={airbnbColors.white} style={styles.errorMessage}>
                        {videoError}
                      </AirbnbText>
                      <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => {
                          setVideoError(null);
                          setIsVideoReady(false);
                          // Retry by forcing a re-replace of the video source
                          if (player && videoUrl) {
                            player.replace({ uri: videoUrl });
                          }
                        }}
                      >
                        <AirbnbText variant="caption" color={airbnbColors.white}>
                          Retry Video
                        </AirbnbText>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Video info overlay */}
                  {isVideoReady && !videoError && (
                    <View style={styles.videoInfo}>
                      <View style={styles.videoInfoBadge}>
                        <Ionicons name="play" size={12} color={airbnbColors.white} />
                        <AirbnbText variant="small" color={airbnbColors.white} style={styles.videoInfoText}>
                          Ready to play
                        </AirbnbText>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
            
            {/* Video details */}
            <View style={styles.videoDetails}>
              <AirbnbText variant="caption" color={airbnbColors.mediumGray}>
                Video URL: {videoUrl.length > 50 ? `${videoUrl.substring(0, 50)}...` : videoUrl}
              </AirbnbText>
            </View>
          </View>
        ) : (
          <View style={styles.noVideoSection}>
            <View style={styles.noVideoContainer}>
              <Ionicons name="videocam-off" size={48} color={airbnbColors.lightGray} />
              <AirbnbText variant="subtitle" style={styles.noVideoTitle}>
                No video available
              </AirbnbText>
              <AirbnbText variant="caption" color={airbnbColors.mediumGray} style={styles.noVideoSubtitle}>
                This lesson contains text content only
              </AirbnbText>
            </View>
          </View>
        )}

        {/* Content Sections */}
        <View style={styles.contentSection}>
          {/* Description */}
          <View style={styles.section}>
            <AirbnbText variant="title" style={styles.sectionTitle}>
              About this lesson
            </AirbnbText>
            <AirbnbText variant="body" style={styles.descriptionText}>
              {lesson.description}
            </AirbnbText>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Content */}
          <View style={styles.section}>
            <AirbnbText variant="title" style={styles.sectionTitle}>
              Lesson content
            </AirbnbText>
            <AirbnbText variant="body" style={styles.contentText}>
              {lesson.content}
            </AirbnbText>
          </View>
        </View>

        {/* Compact Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.compactButton, styles.primaryButton]}
            onPress={() => router.push({
              pathname: '/(admin)/(courses)/edit-lesson',
              params: { id: lesson.$id }
            })}
          >
            <Ionicons name="pencil" size={16} color={airbnbColors.white} style={styles.compactButtonIcon} />
            <AirbnbText variant="caption" color={airbnbColors.white} style={styles.compactButtonText}>
              Edit
            </AirbnbText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.compactButton, styles.secondaryButton]}
            onPress={() => router.push({
              pathname: '/(admin)/(courses)/course-details',
              params: { id: lesson.courseId }
            })}
          >
            <Ionicons name="arrow-back" size={16} color={airbnbColors.dark} style={styles.compactButtonIcon} />
            <AirbnbText variant="caption" color={airbnbColors.dark} style={styles.compactButtonText}>
              Back to Course
            </AirbnbText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: airbnbColors.background,
  },
  container: {
    flex: 1,
    backgroundColor: airbnbColors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: airbnbSpacing.xl,
  },
  loadingText: {
    marginTop: airbnbSpacing.md,
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.mediumGray,
  },
  errorText: {
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.error,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: airbnbSpacing.md,
    paddingHorizontal: airbnbSpacing.lg,
    backgroundColor: airbnbColors.white,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.border,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: airbnbSpacing.sm,
    borderRadius: 20,
    backgroundColor: airbnbColors.white,
  },
  headerTitle: {
    fontSize: airbnbTypography.sizes.xl,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
  },
  headerAction: {
    padding: airbnbSpacing.sm,
    borderRadius: 20,
    backgroundColor: airbnbColors.superLightGray,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: airbnbSpacing.sm,
    paddingHorizontal: airbnbSpacing.lg,
    marginHorizontal: airbnbSpacing.lg,
    marginTop: airbnbSpacing.md,
    backgroundColor: airbnbColors.superLightGray,
    borderRadius: 8,
  },
  breadcrumbText: {
    marginLeft: airbnbSpacing.xs,
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.mediumGray,
  },
  heroSection: {
    padding: airbnbSpacing.lg,
    marginHorizontal: airbnbSpacing.lg,
    marginVertical: airbnbSpacing.md,
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  lessonBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: airbnbSpacing.md,
  },
  orderBadge: {
    backgroundColor: airbnbColors.primary + '15',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: airbnbSpacing.sm,
    marginRight: airbnbSpacing.sm,
  },
  statusBadge: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: airbnbSpacing.sm,
  },
  badgeText: {
    fontSize: airbnbTypography.sizes.sm,
    fontWeight: airbnbTypography.weights.medium,
  },
  lessonTitle: {
    fontSize: airbnbTypography.sizes.huge,
    fontWeight: airbnbTypography.weights.bold,
    color: airbnbColors.dark,
    marginBottom: airbnbSpacing.md,
    lineHeight: 38,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: airbnbSpacing.lg,
    marginBottom: airbnbSpacing.xs,
  },
  metaText: {
    marginLeft: airbnbSpacing.xs,
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.mediumGray,
  },
  videoSection: {
    marginHorizontal: airbnbSpacing.lg,
    marginBottom: airbnbSpacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  videoContainer: {
    width: '100%',
    height: 240,
    backgroundColor: airbnbColors.black,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: airbnbSpacing.lg,
  },
  loadingMessage: {
    marginTop: airbnbSpacing.sm,
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.white,
  },
  videoError: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: airbnbSpacing.lg,
  },
  errorMessage: {
    textAlign: 'center',
    marginVertical: airbnbSpacing.md,
    fontSize: airbnbTypography.sizes.md,
  },
  retryButton: {
    backgroundColor: airbnbColors.primary,
    paddingVertical: airbnbSpacing.sm,
    paddingHorizontal: airbnbSpacing.lg,
    borderRadius: 8,
  },
  videoInfo: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: airbnbSpacing.lg,
  },
  videoInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.success,
    paddingVertical: 4,
    paddingHorizontal: airbnbSpacing.sm,
    borderRadius: 16,
  },
  videoInfoText: {
    marginLeft: airbnbSpacing.xs,
    fontSize: airbnbTypography.sizes.sm,
    fontWeight: airbnbTypography.weights.medium,
    color: airbnbColors.white,
  },
  videoDetails: {
    backgroundColor: airbnbColors.white,
    padding: airbnbSpacing.md,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
  },
  noVideoSection: {
    marginHorizontal: airbnbSpacing.lg,
    marginBottom: airbnbSpacing.md,
    padding: airbnbSpacing.xl,
    backgroundColor: airbnbColors.superLightGray,
    borderRadius: 12,
    alignItems: 'center',
  },
  noVideoContainer: {
    alignItems: 'center',
  },
  noVideoTitle: {
    marginTop: airbnbSpacing.md,
    fontSize: airbnbTypography.sizes.xl,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    textAlign: 'center',
  },
  noVideoSubtitle: {
    marginTop: airbnbSpacing.xs,
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.mediumGray,
    textAlign: 'center',
  },
  contentSection: {
    marginHorizontal: airbnbSpacing.lg,
    marginBottom: airbnbSpacing.md,
    padding: airbnbSpacing.lg,
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  section: {
    marginBottom: airbnbSpacing.lg,
  },
  sectionTitle: {
    fontSize: airbnbTypography.sizes.xxl,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    marginBottom: airbnbSpacing.md,
  },
  descriptionText: {
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.dark,
    lineHeight: 24,
  },
  contentText: {
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.dark,
    lineHeight: 26,
  },
  divider: {
    height: 1,
    backgroundColor: airbnbColors.border,
    marginVertical: airbnbSpacing.lg,
  },
  actionsSection: {
    flexDirection: 'row',
    marginHorizontal: airbnbSpacing.lg,
    marginBottom: airbnbSpacing.xl,
    gap: airbnbSpacing.md,
  },
  compactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: airbnbSpacing.sm,
    paddingHorizontal: airbnbSpacing.md,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  primaryButton: {
    backgroundColor: airbnbColors.primary,
  },
  secondaryButton: {
    backgroundColor: airbnbColors.white,
    borderWidth: 1,
    borderColor: airbnbColors.border,
  },
  compactButtonIcon: {
    marginRight: airbnbSpacing.xs,
  },
  compactButtonText: {
    fontSize: airbnbTypography.sizes.md,
    fontWeight: airbnbTypography.weights.medium,
  },
});