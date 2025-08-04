import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  duration: string;
  isPublished: boolean;
  coverImage?: string;
  tags?: string[];
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export default function CourseLibraryScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterPublished, setFilterPublished] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setLoadError('');
      
      // Add a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out after 15 seconds')), 15000)
      );
      
      // Race between the actual request and the timeout
      const allCourses = await Promise.race([
        appwriteService.getAllCourses(),
        timeoutPromise
      ]);
      
      console.log('Courses fetched successfully:', allCourses?.length || 0);
      setCourses(allCourses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setLoadError(error.message || 'Failed to load courses. Please check your connection.');
      setCourses([]);
      Alert.alert('Error', 'Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await appwriteService.deleteCourse(courseId);
              setCourses(courses.filter(course => course.$id !== courseId));
              Alert.alert('Success', 'Course deleted successfully');
            } catch (error) {
              console.error('Failed to delete course:', error);
              Alert.alert('Error', 'Failed to delete course. Please try again.');
            }
          }
        }
      ]
    );
  };

  const filteredCourses = filterPublished === null 
    ? courses 
    : courses.filter(course => course.isPublished === filterPublished);

  const renderCourseItem = ({ item }: { item: Course }) => (
    <Card style={styles.courseCard}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => router.push(`/(admin)/(courses)/course-details?id=${item.$id}`)}
      >
        <View style={styles.courseHeader}>
          <View style={styles.courseDetails}>
            <View style={styles.titleContainer}>
              <Text variant="h5" style={styles.courseTitle}>{item.title}</Text>
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
            <Text variant="subtitle2" color={colors.secondary.main}>{item.level}</Text>
            <Text variant="body2" style={styles.courseDescription}>
              {item.description.length > 100 
                ? `${item.description.substring(0, 100)}...` 
                : item.description}
            </Text>
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={colors.neutral.gray} />
                <Text variant="caption" color={colors.neutral.gray} style={styles.metaText}>
                  {item.duration}
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
          {item.coverImage ? (
            <Image 
              source={{ uri: item.coverImage }} 
              style={styles.courseThumbnail} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.courseThumbnailPlaceholder}>
              <Ionicons name="book-outline" size={32} color={colors.neutral.lightGray} />
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => router.push(`/(admin)/(courses)/course-details?id=${item.$id}`)}
        >
          <Ionicons name="eye-outline" size={20} color={colors.secondary.main} />
          <Text variant="caption" style={styles.iconButtonText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => router.push(`/(admin)/(courses)/edit-course?id=${item.$id}`)}
        >
          <Ionicons name="pencil-outline" size={20} color={colors.primary.main} />
          <Text variant="caption" style={styles.iconButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => handleDeleteCourse(item.$id, item.title)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.status.error} />
          <Text variant="caption" style={styles.iconButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      );
    }

    if (loadError) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.status.error} />
          <Text style={styles.errorText}>{loadError}</Text>
          <Button 
            title="Retry" 
            onPress={fetchCourses}
            style={styles.retryButton}
          />
        </View>
      );
    }

    if (courses.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="book-outline" size={64} color={colors.neutral.lightGray} />
          <Text style={styles.emptyText}>No courses found</Text>
          <Button 
            title="Create New Course" 
            onPress={() => router.push('/(admin)/(courses)/course-creator')}
            style={styles.createButton}
          />
        </View>
      );
    }

    return (
      <>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersScrollView}
        >
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                filterPublished === null && styles.activeFilter
              ]}
              onPress={() => setFilterPublished(null)}
            >
              <Text 
                variant="button" 
                color={filterPublished === null ? colors.neutral.white : colors.neutral.text}
              >
                All Courses
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.newCourseButton}
              onPress={() => router.push('/(admin)/(courses)/course-creator')}
            >
              <Ionicons name="add" size={18} color={colors.neutral.white} />
              <Text variant="button" color={colors.neutral.white}>New Course</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={item => item.$id}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Course Library"
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
            <Text variant="h4" style={styles.pageTitle}>Course Library</Text>
            <Text variant="body2" style={styles.pageSubtitle}>
              Manage all available courses. Create, edit or publish courses for students.
            </Text>
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
    marginBottom: spacing.lg,
  },
  pageTitle: {
    color: colors.primary.main,
    marginBottom: spacing.xs,
  },
  pageSubtitle: {
    color: colors.neutral.darkGray,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  filterButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.lightGray,
    marginRight: spacing.xs,
  },
  activeFilter: {
    backgroundColor: colors.primary.main,
  },
  listContainer: {
    paddingBottom: spacing.xxl,
  },
  courseCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  courseHeader: {
    flexDirection: 'row',
  },
  courseDetails: {
    flex: 1,
    marginRight: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  courseTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  courseDescription: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    color: colors.neutral.darkGray,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontWeight: typography.fontWeights.medium,
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
  courseThumbnail: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
  },
  courseThumbnailPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingTop: spacing.md,
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
    minWidth: 50,
  },
  iconButtonText: {
    marginTop: 4,
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.text,
    textAlign: 'center',
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
    marginVertical: spacing.md,
    fontSize: typography.fontSizes.lg,
  },
  createButton: {
    marginTop: spacing.md,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
  },
  filtersScrollView: {
    marginBottom: spacing.xs,
  },
  newCourseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    marginLeft: spacing.xs,
  },
  errorText: {
    color: colors.status.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
  },
});