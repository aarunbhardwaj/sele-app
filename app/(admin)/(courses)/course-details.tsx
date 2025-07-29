import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { borderRadius, colors, spacing, typography } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

interface Course {
  $id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  estimatedDuration: string;
  totalLessons: number;
  isPublished: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  $id: string;
  title: string;
  description: string;
  content: string;
  courseId: string;
  order: number;
  isPublished: boolean;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export default function CourseDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  // Active tab state (lessons, quizzes, materials, etc.)
  const [activeTab, setActiveTab] = useState('lessons');
  
  useEffect(() => {
    if (id) {
      fetchCourseData(id as string);
      fetchLessons(id as string);
    } else {
      Alert.alert('Error', 'Course ID not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [id]);
  
  const fetchCourseData = async (courseId: string) => {
    try {
      const courseData = await appwriteService.getCourseById(courseId);
      setCourse(courseData as Course);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      Alert.alert('Error', 'Failed to load course data', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLessons = async (courseId: string) => {
    try {
      // Modified to fetch all lessons, not just published ones
      const response = await appwriteService.getLessonsByCourse(courseId);
      setLessons(response);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      Alert.alert('Error', 'Failed to load lessons');
    }
  };
  
  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
          onPress={() => setActiveTab('lessons')}
        >
          <Text 
            variant="subtitle2" 
            color={activeTab === 'lessons' ? colors.primary.main : colors.neutral.darkGray}
          >
            Lessons
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'quizzes' && styles.activeTab]}
          onPress={() => setActiveTab('quizzes')}
        >
          <Text 
            variant="subtitle2" 
            color={activeTab === 'quizzes' ? colors.primary.main : colors.neutral.darkGray}
          >
            Quizzes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'materials' && styles.activeTab]}
          onPress={() => setActiveTab('materials')}
        >
          <Text 
            variant="subtitle2" 
            color={activeTab === 'materials' ? colors.primary.main : colors.neutral.darkGray}
          >
            Materials
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text 
            variant="subtitle2" 
            color={activeTab === 'analytics' ? colors.primary.main : colors.neutral.darkGray}
          >
            Analytics
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderLessons = () => {
    if (lessons.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={colors.neutral.lightGray} />
          <Text style={styles.emptyText}>No lessons found</Text>
          <Button 
            title="Add First Lesson" 
            onPress={() => router.push(`/(admin)/(courses)/create-lesson?courseId=${id}`)}
            style={styles.emptyButton}
          />
        </View>
      );
    }
    
    return (
      <View>
        <View style={styles.sectionHeader}>
          <Text variant="h6">Lessons ({lessons.length})</Text>
          <Button 
            title="+ Add Lesson" 
            variant="outline"
            size="small"
            onPress={() => router.push(`/(admin)/(courses)/create-lesson?courseId=${id}`)}
          />
        </View>
        
        {lessons.map((lesson, index) => (
          <Card key={lesson.$id} style={styles.lessonCard}>
            <View style={styles.lessonHeader}>
              <View style={styles.lessonOrder}>
                <Text style={styles.orderNumber}>{lesson.order || index + 1}</Text>
              </View>
              <View style={styles.lessonDetails}>
                <View style={styles.lessonTitleContainer}>
                  <Text variant="subtitle1" style={styles.lessonTitle}>
                    {lesson.title}
                  </Text>
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
                
                <Text variant="body2" style={styles.lessonDescription} numberOfLines={2}>
                  {lesson.description || 'No description available'}
                </Text>
                
                <View style={styles.lessonMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.neutral.gray} />
                    <Text variant="caption" color={colors.neutral.gray} style={styles.metaText}>
                      {lesson.duration} min
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.neutral.gray} />
                    <Text variant="caption" color={colors.neutral.gray} style={styles.metaText}>
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.lessonActions}>
              <TouchableOpacity 
                style={styles.lessonIconButton}
                onPress={() => router.push(`/(admin)/(courses)/edit-lesson?id=${lesson.$id}`)}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.primary.main} />
                <Text variant="caption" style={styles.lessonIconButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.lessonIconButton}
                onPress={() => {
                  // Handle viewing the lesson
                  Alert.alert('View Lesson', 'View lesson functionality will be implemented soon.');
                }}
              >
                <Ionicons name="eye-outline" size={18} color={colors.secondary.main} />
                <Text variant="caption" style={styles.lessonIconButtonText}>View</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.lessonIconButton}
                onPress={() => {
                  Alert.alert(
                    'Delete Lesson',
                    'Are you sure you want to delete this lesson?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await appwriteService.deleteLesson(lesson.$id);
                            // Refresh the lessons list
                            fetchLessons(id as string);
                            Alert.alert('Success', 'Lesson deleted successfully');
                          } catch (error) {
                            console.error('Failed to delete lesson:', error);
                            Alert.alert('Error', 'Failed to delete lesson');
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                <Text variant="caption" style={styles.lessonIconButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>
    );
  };
  
  const renderQuizzes = () => (
    <View style={styles.emptyState}>
      <Ionicons name="help-circle-outline" size={64} color={colors.neutral.lightGray} />
      <Text style={styles.emptyText}>No quizzes available yet</Text>
      <Text style={styles.emptySubtext}>
        Quizzes for this course will appear here once created
      </Text>
      <Button 
        title="Create Quiz" 
        onPress={() => Alert.alert('Coming Soon', 'Quiz creation will be available in a future update')}
        style={styles.emptyButton}
      />
    </View>
  );
  
  const renderMaterials = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-outline" size={64} color={colors.neutral.lightGray} />
      <Text style={styles.emptyText}>No additional materials yet</Text>
      <Text style={styles.emptySubtext}>
        Upload PDFs, worksheets, and other course materials
      </Text>
      <Button 
        title="Upload Material" 
        onPress={() => Alert.alert('Coming Soon', 'Material uploads will be available in a future update')}
        style={styles.emptyButton}
      />
    </View>
  );
  
  const renderAnalytics = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bar-chart-outline" size={64} color={colors.neutral.lightGray} />
      <Text style={styles.emptyText}>Analytics Coming Soon</Text>
      <Text style={styles.emptySubtext}>
        Student progress and engagement metrics will be available here
      </Text>
    </View>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="Course Details"
          leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
          onLeftIconPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!course) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="Course Details"
          leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
          onLeftIconPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Course not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Course Details"
        leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
        onLeftIconPress={() => router.back()}
      />
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <Card style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <View style={styles.courseImageContainer}>
                {course.imageUrl ? (
                  <Image 
                    source={{ uri: course.imageUrl }} 
                    style={styles.courseImage} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="book-outline" size={40} color={colors.neutral.lightGray} />
                  </View>
                )}
              </View>
              
              <View style={styles.courseInfo}>
                <Text variant="h4" style={styles.courseTitle}>{course.title}</Text>
                <View style={styles.courseMetaRow}>
                  <View style={styles.metaBadge}>
                    <Text variant="caption" style={styles.metaBadgeText}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Text variant="caption" style={styles.metaBadgeText}>
                      {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: course.isPublished ? colors.status.success + '20' : colors.neutral.lightGray }
                  ]}>
                    <Text 
                      variant="caption" 
                      style={styles.statusText}
                      color={course.isPublished ? colors.status.success : colors.neutral.darkGray}
                    >
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.courseActions}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => router.push(`/(admin)/(courses)/edit-course?id=${course.$id}`)}
              >
                <Ionicons name="pencil-outline" size={20} color={colors.primary.main} />
                <Text variant="caption" style={styles.iconButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={async () => {
                  try {
                    const updatedCourse = await appwriteService.updateCourse(course.$id, {
                      isPublished: !course.isPublished
                    });
                    setCourse({
                      ...course,
                      isPublished: !course.isPublished
                    });
                    Alert.alert(
                      'Success', 
                      `Course ${course.isPublished ? 'unpublished' : 'published'} successfully`
                    );
                  } catch (error) {
                    console.error('Failed to update course:', error);
                    Alert.alert('Error', 'Failed to update course status');
                  }
                }}
              >
                <Ionicons 
                  name={course.isPublished ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={course.isPublished ? colors.secondary.main : colors.secondary.main} 
                />
                <Text variant="caption" style={styles.iconButtonText}>
                  {course.isPublished ? "Unpublish" : "Publish"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => router.push(`/(admin)/(courses)/lessons?courseId=${course.$id}`)}
              >
                <Ionicons name="list-outline" size={20} color={colors.primary.dark} />
                <Text variant="caption" style={styles.iconButtonText}>Lessons</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.courseDescription}>
              <Text variant="subtitle1">Description</Text>
              <Text variant="body2" style={styles.descriptionText}>
                {course.description}
              </Text>
            </View>
            
            <View style={styles.courseStats}>
              <View style={styles.statItem}>
                <Text variant="h6">{course.totalLessons}</Text>
                <Text variant="caption" color={colors.neutral.darkGray}>Lessons</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="h6">{course.estimatedDuration || 'N/A'}</Text>
                <Text variant="caption" color={colors.neutral.darkGray}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="h6">0</Text>
                <Text variant="caption" color={colors.neutral.darkGray}>Students</Text>
              </View>
            </View>
          </Card>
          
          {renderTabs()}
          
          <View style={styles.tabContent}>
            {activeTab === 'lessons' && renderLessons()}
            {activeTab === 'quizzes' && renderQuizzes()}
            {activeTab === 'materials' && renderMaterials()}
            {activeTab === 'analytics' && renderAnalytics()}
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
  courseCard: {
    padding: spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  courseImageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    marginBottom: spacing.xs,
    color: colors.primary.main,
  },
  courseMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  courseActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    marginRight: spacing.xs,
    flex: 1,
    minWidth: 70,
  },
  iconButtonText: {
    marginTop: 4,
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.text,
    textAlign: 'center',
  },
  courseDescription: {
    marginBottom: spacing.md,
  },
  descriptionText: {
    marginTop: spacing.xs,
    color: colors.neutral.darkGray,
  },
  courseStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingTop: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  activeTab: {
    backgroundColor: colors.primary.light + '20',
  },
  tabContent: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lessonCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  lessonHeader: {
    flexDirection: 'row',
  },
  lessonOrder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary.light + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  orderNumber: {
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary.main,
  },
  lessonDetails: {
    flex: 1,
  },
  lessonTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  lessonTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  lessonDescription: {
    color: colors.neutral.darkGray,
    marginBottom: spacing.xs,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metaText: {
    marginLeft: 2,
  },
  lessonActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingTop: spacing.sm,
  },
  lessonIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  lessonIconButtonText: {
    marginLeft: spacing.xs,
    color: colors.primary.main,
    ...typography.caption,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    color: colors.neutral.darkGray,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    textAlign: 'center',
    color: colors.neutral.gray,
    marginBottom: spacing.md,
  },
  emptyButton: {
    marginTop: spacing.sm,
  },
});