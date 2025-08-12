import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

// Airbnb-inspired color palette
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#E8484D',
  primaryLight: '#FFE8E9',
  secondary: '#00A699',
  secondaryLight: '#E0F7F5',
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  gray: '#EBEBEB',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  black: '#222222',
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
};

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
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPublished, setFilterPublished] = useState<boolean | null>(null);
  const [loadError, setLoadError] = useState('');

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setLoadError('');
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out after 15 seconds')), 15000)
      );
      
      const allCourses = await Promise.race([
        appwriteService.getAllCourses(),
        timeoutPromise
      ]);
      
      console.log('Courses fetched successfully:', allCourses?.length || 0);
      setCourses(allCourses || []);
      setFilteredCourses(allCourses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setLoadError(error.message || 'Failed to load courses. Please check your connection.');
      setCourses([]);
      setFilteredCourses([]);
      Alert.alert('Error', 'Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchQuery, filterPublished]);

  const filterCourses = () => {
    let filtered = [...courses];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query) ||
        course.level.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (filterPublished !== null) {
      filtered = filtered.filter(course => course.isPublished === filterPublished);
    }
    
    setFilteredCourses(filtered);
  };

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

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return airbnbColors.success;
      case 'intermediate': return airbnbColors.warning;
      case 'advanced': return airbnbColors.error;
      default: return airbnbColors.mediumGray;
    }
  };

  const renderCourseCard = (course: Course, index: number) => (
    <Animated.View
      key={course.$id}
      entering={FadeInUp.delay(index * 100).duration(600)}
      style={styles.courseCard}
    >
      <TouchableOpacity
        style={styles.courseContent}
        onPress={() => router.push(`/(admin)/(courses)/course-details?id=${course.$id}`)}
      >
        {/* Course Image */}
        <View style={styles.imageContainer}>
          {course.coverImage ? (
            <Image 
              source={{ uri: course.coverImage }} 
              style={styles.courseImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="book" size={32} color={airbnbColors.mediumGray} />
            </View>
          )}
          <View style={[styles.statusBadge, { 
            backgroundColor: course.isPublished ? airbnbColors.success : airbnbColors.warning 
          }]}>
            <Text style={styles.statusText}>
              {course.isPublished ? 'Published' : 'Draft'}
            </Text>
          </View>
        </View>

        {/* Course Details */}
        <View style={styles.courseDetails}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(course.level) + '20' }]}>
              <Text style={[styles.levelText, { color: getLevelColor(course.level) }]}>
                {course.level}
              </Text>
            </View>
          </View>
          
          <Text style={styles.courseDescription} numberOfLines={3}>
            {course.description}
          </Text>
          
          <View style={styles.courseMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={14} color={airbnbColors.mediumGray} />
              <Text style={styles.metaText}>{course.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color={airbnbColors.mediumGray} />
              <Text style={styles.metaText}>
                {new Date(course.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: airbnbColors.secondary + '15' }]}
          onPress={() => router.push(`/(admin)/(courses)/course-details?id=${course.$id}`)}
        >
          <Ionicons name="eye" size={16} color={airbnbColors.secondary} />
          <Text style={[styles.actionText, { color: airbnbColors.secondary }]}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: airbnbColors.primary + '15' }]}
          onPress={() => router.push(`/(admin)/(courses)/edit-course?id=${course.$id}`)}
        >
          <Ionicons name="pencil" size={16} color={airbnbColors.primary} />
          <Text style={[styles.actionText, { color: airbnbColors.primary }]}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: airbnbColors.error + '15' }]}
          onPress={() => handleDeleteCourse(course.$id, course.title)}
        >
          <Ionicons name="trash" size={16} color={airbnbColors.error} />
          <Text style={[styles.actionText, { color: airbnbColors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Display loading indicator
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title="Course Library"
        rightComponent={
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(admin)/(courses)/course-creator')}
          >
            <Ionicons name="add" size={20} color={airbnbColors.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <Animated.View 
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.headerSection}
          >
            <View style={styles.headerCard}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Course Library</Text>
                <Text style={styles.headerSubtitle}>
                  {courses.length} total courses • {filteredCourses.length} shown
                </Text>
              </View>
              <View style={styles.libraryIconContainer}>
                <Ionicons name="library" size={24} color={airbnbColors.primary} />
              </View>
            </View>
          </Animated.View>

          {/* Search & Filters Section */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.filtersSection}
          >
            <Text style={styles.sectionTitle}>Search & Filter</Text>
            <View style={styles.filtersCard}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={airbnbColors.mediumGray} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search courses by title, description, or level..."
                  placeholderTextColor={airbnbColors.mediumGray}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersScrollContent}
              >
                <TouchableOpacity
                  style={[styles.filterChip, filterPublished === null && styles.activeFilterChip]}
                  onPress={() => setFilterPublished(null)}
                >
                  <Text style={[styles.filterText, filterPublished === null && styles.activeFilterText]}>
                    All Courses
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterChip, filterPublished === true && styles.activeFilterChip]}
                  onPress={() => setFilterPublished(true)}
                >
                  <Text style={[styles.filterText, filterPublished === true && styles.activeFilterText]}>
                    Published
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterChip, filterPublished === false && styles.activeFilterChip]}
                  onPress={() => setFilterPublished(false)}
                >
                  <Text style={[styles.filterText, filterPublished === false && styles.activeFilterText]}>
                    Drafts
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Animated.View>

          {/* Courses Grid Section */}
          <Animated.View 
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.coursesSection}
          >
            <Text style={styles.sectionTitle}>Courses</Text>
            {loadError ? (
              <View style={styles.errorCard}>
                <Ionicons name="alert-circle" size={48} color={airbnbColors.error} />
                <Text style={styles.errorText}>{loadError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchCourses}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : filteredCourses.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="book-outline" size={48} color={airbnbColors.mediumGray} />
                <Text style={styles.emptyText}>
                  {searchQuery || filterPublished !== null ? 'No courses match your filters' : 'No courses found'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery || filterPublished !== null 
                    ? 'Try adjusting your search or filters' 
                    : 'Create your first course to get started'
                  }
                </Text>
                {!searchQuery && filterPublished === null && (
                  <TouchableOpacity 
                    style={styles.createButton}
                    onPress={() => router.push('/(admin)/(courses)/course-creator')}
                  >
                    <Ionicons name="add" size={20} color={airbnbColors.white} />
                    <Text style={styles.createButtonText}>Create Course</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.coursesGrid}>
                {filteredCourses.map((course, index) => renderCourseCard(course, index))}
              </View>
            )}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: airbnbColors.offWhite,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: airbnbColors.darkGray,
    fontWeight: '500',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: airbnbColors.lightGray,
  },

  // Header Section
  headerSection: {
    marginBottom: 24,
  },
  headerCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: airbnbColors.darkGray,
  },
  libraryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: airbnbColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },

  // Filters Section
  filtersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  filtersCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: airbnbColors.charcoal,
  },
  filtersScrollContent: {
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterChip: {
    backgroundColor: airbnbColors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: airbnbColors.darkGray,
  },
  activeFilterText: {
    color: airbnbColors.white,
  },

  // Courses Section
  coursesSection: {
    marginBottom: 24,
  },
  coursesGrid: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  courseContent: {
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  courseImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: airbnbColors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: airbnbColors.white,
  },
  courseDetails: {
    gap: 8,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  courseTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    lineHeight: 24,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  courseDescription: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    lineHeight: 20,
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: airbnbColors.mediumGray,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },

  // Empty/Error States
  emptyCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    marginTop: 4,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.white,
  },
  errorCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  errorText: {
    fontSize: 16,
    color: airbnbColors.error,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: airbnbColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.white,
  },
});