import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
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

interface Lesson {
  $id: string;
  title: string;
  content: string;
  courseId: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LessonManagementScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(
    courseId as string | undefined
  );

  // Fetch all courses for the dropdown
  const fetchCourses = async () => {
    try {
      const allCourses = await appwriteService.getAllCourses();
      setCourses(allCourses);
      
      // If no courseId was passed and we have courses, select the first one
      if (!selectedCourseId && allCourses.length > 0) {
        setSelectedCourseId(allCourses[0].$id);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      Alert.alert('Error', 'Failed to load courses. Please try again.');
    }
  };

  // Fetch lessons for the selected course
  const fetchLessons = async (id?: string) => {
    if (!id) return;
    
    try {
      setLoading(true);
      const courseLessons = await appwriteService.getLessonsByCourse(id);
      setLessons(courseLessons);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      Alert.alert('Error', 'Failed to load lessons. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchLessons(selectedCourseId);
    }
  }, [selectedCourseId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLessons(selectedCourseId);
  };

  const handleDeleteLesson = async (lessonId: string, title: string) => {
    Alert.alert(
      'Delete Lesson',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Use the new deleteLesson function
              await appwriteService.deleteLesson(lessonId);
              setLessons(lessons.filter(lesson => lesson.$id !== lessonId));
              Alert.alert('Success', 'Lesson deleted successfully');
            } catch (error) {
              console.error('Failed to delete lesson:', error);
              Alert.alert('Error', 'Failed to delete lesson. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleTogglePublish = async (lesson: Lesson) => {
    try {
      // Use the updateLesson function
      const updatedLesson = await appwriteService.updateLesson(lesson.$id, {
        isPublished: !lesson.isPublished
      });
      
      setLessons(lessons.map(l => l.$id === lesson.$id ? updatedLesson : l));
      
      Alert.alert(
        'Success', 
        `Lesson ${lesson.isPublished ? 'unpublished' : 'published'} successfully`
      );
    } catch (error) {
      console.error('Failed to update lesson:', error);
      Alert.alert('Error', 'Failed to update lesson status. Please try again.');
    }
  };

  const renderLessonItem = ({ item }: { item: Lesson }) => (
    <Card style={styles.lessonCard}>
      <View style={styles.lessonHeader}>
        <View style={styles.lessonDetails}>
          <View style={styles.titleContainer}>
            <Text variant="h5" style={styles.lessonTitle}>{item.title}</Text>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.isPublished ? colors.status.success + '20' : colors.neutral.lightGray }
            ]}>
              <Text 
                variant="caption" 
                style={styles.statusText}
                color={item.isPublished ? colors.status.success : colors.neutral.darkGray}
              >
                {item.isPublished ? 'Published' : 'Draft'}
              </Text>
            </View>
          </View>
          <Text variant="body2" style={styles.lessonContent}>
            {item.content && item.content.length > 100 
              ? `${item.content.substring(0, 100)}...` 
              : item.content || 'No content available'}
          </Text>
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={16} color={colors.neutral.gray} />
              <Text variant="caption" color={colors.neutral.gray} style={styles.metaText}>
                Order: {item.order}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={colors.neutral.gray} />
              <Text variant="caption" color={colors.neutral.gray} style={styles.metaText}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.actionContainer}>
        <Button 
          title="Edit"
          variant="outline"
          onPress={() => router.push(`/(admin)/(courses)/edit-lesson?id=${item.$id}`)}
          leftIcon={<Ionicons name="pencil-outline" size={16} color={colors.primary.main} />}
          style={styles.actionButton}
        />
        <Button 
          title={item.isPublished ? "Unpublish" : "Publish"}
          variant="outline"
          onPress={() => handleTogglePublish(item)}
          leftIcon={<Ionicons 
            name={item.isPublished ? "eye-off-outline" : "eye-outline"} 
            size={16} 
            color={colors.secondary.main} 
          />}
          style={styles.actionButton}
        />
        <Button 
          title="Delete"
          variant="outline"
          onPress={() => handleDeleteLesson(item.$id, item.title)}
          leftIcon={<Ionicons name="trash-outline" size={16} color={colors.status.error} />}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  // Dropdown for selecting a course
  const renderCourseSelector = () => (
    <View style={styles.courseSelector}>
      <Text variant="subtitle1">Select Course:</Text>
      <View style={styles.courseOptions}>
        {courses.map(course => (
          <TouchableOpacity
            key={course.$id}
            style={[
              styles.courseOption,
              selectedCourseId === course.$id && styles.selectedCourseOption
            ]}
            onPress={() => setSelectedCourseId(course.$id)}
          >
            <Text 
              variant="button"
              color={selectedCourseId === course.$id ? colors.neutral.white : colors.neutral.text}
            >
              {course.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      );
    }

    if (!selectedCourseId) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.neutral.lightGray} />
          <Text style={styles.emptyText}>No course selected</Text>
          <Text style={styles.emptySubtext}>Please select a course to manage lessons</Text>
        </View>
      );
    }

    if (lessons.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.neutral.lightGray} />
          <Text style={styles.emptyText}>No lessons found</Text>
          <Button 
            title="Create New Lesson" 
            onPress={() => router.push(`/(admin)/(courses)/create-lesson?courseId=${selectedCourseId}`)}
            style={styles.createButton}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={lessons}
        renderItem={renderLessonItem}
        keyExtractor={item => item.$id}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Lesson Management"
        leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
        onLeftIconPress={() => router.back()}
        rightComponent={
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {}}
          >
            <Ionicons name="notifications-outline" size={24} color="#333333" />
          </TouchableOpacity>
        }
      />
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text variant="h4" style={styles.pageTitle}>Lesson Management</Text>
            <Text variant="body2" style={styles.pageSubtitle}>
              Create and manage lessons for your courses
            </Text>
          </View>
          
          {renderCourseSelector()}
          
          <View style={styles.actionHeader}>
            <View style={{ flex: 1 }} />
            {selectedCourseId && (
              <Button
                title="+ New Lesson"
                onPress={() => router.push(`/(admin)/(courses)/create-lesson?courseId=${selectedCourseId}`)}
              />
            )}
          </View>
          
          {renderContent()}
        </View>
      </View>
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
    flex: 1,
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
  courseSelector: {
    marginBottom: spacing.md,
  },
  courseOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  courseOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.lightGray,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedCourseOption: {
    backgroundColor: colors.primary.main,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  listContainer: {
    paddingBottom: spacing.xxl,
  },
  lessonCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  lessonHeader: {
    flexDirection: 'row',
  },
  lessonDetails: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  lessonTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  lessonContent: {
    marginVertical: spacing.sm,
    color: colors.neutral.darkGray,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontWeight: typography.fontWeights.medium as any,
  },
  metaContainer: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metaText: {
    marginLeft: spacing.xs,
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingTop: spacing.md,
  },
  actionButton: {
    marginRight: spacing.sm,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    color: colors.neutral.darkGray,
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.neutral.darkGray,
    marginTop: spacing.md,
    fontSize: typography.fontSizes.lg,
  },
  emptySubtext: {
    color: colors.neutral.gray,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  createButton: {
    marginTop: spacing.md,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
  },
});