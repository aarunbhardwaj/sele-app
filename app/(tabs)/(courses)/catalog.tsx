import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Text } from '../../../components/ui/Typography';
import { useAuth } from '../../../services/AuthContext';
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

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Course categories for filtering
const categories = [
  { id: 'all', name: 'All Courses', icon: 'book' as const },
  { id: 'pronunciation', name: 'Pronunciation', icon: 'mic' as const },
  { id: 'grammar', name: 'Grammar', icon: 'school' as const },
  { id: 'vocabulary', name: 'Vocabulary', icon: 'text' as const },
  { id: 'conversation', name: 'Conversation', icon: 'chatbubbles' as const },
  { id: 'business', name: 'Business', icon: 'briefcase' as const },
];

// Level colors for difficulty badges
const levelColors = {
  beginner: airbnbColors.success,
  intermediate: airbnbColors.warning,
  advanced: airbnbColors.error,
} as const;

// Define Course interface based on Appwrite document structure
interface Course {
  $id: string;
  title: string;
  description?: string;
  level?: string;
  category?: string;
  totalLessons?: number;
  estimatedDuration?: string;
  isPublished?: boolean;
  imageUrl?: string;
  createdAt?: string;
  $createdAt?: string;
}

export default function CoursesCatalogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize filtered courses to prevent unnecessary re-renders
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           course.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedCategory === 'all') return matchesSearch;
      
      // Match category with course category or level
      const categoryName = categories.find(cat => cat.id === selectedCategory)?.name.toLowerCase();
      return matchesSearch && (
        course.category?.toLowerCase().includes(categoryName || '') ||
        course.level?.toLowerCase().includes(categoryName || '')
      );
    });
  }, [courses, searchQuery, selectedCategory]);

  // Fetch courses from Appwrite
  const fetchCourses = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);
      
      // Fetch all published courses
      const allCourses = await appwriteService.getAllCourses([
        // Add query filters for published courses if needed
      ]);
      
      // Filter only published courses and safely cast to Course interface
      const publishedCourses = allCourses.filter(course => course.isPublished).map(course => ({
        $id: course.$id,
        title: course.title || 'Untitled Course',
        description: course.description,
        level: course.level,
        category: course.category,
        totalLessons: course.totalLessons,
        estimatedDuration: course.estimatedDuration,
        isPublished: course.isPublished,
        imageUrl: course.imageUrl,
        createdAt: course.createdAt,
        $createdAt: course.$createdAt,
      })) as Course[];
      
      // Sort courses by creation date (newest first)
      const sortedCourses = publishedCourses.sort((a, b) => 
        new Date(b.createdAt || b.$createdAt || '').getTime() - new Date(a.createdAt || a.$createdAt || '').getTime()
      );
      
      setCourses(sortedCourses);
      
      // Set featured courses (first 3 courses or courses with special criteria)
      setFeaturedCourses(sortedCourses.slice(0, 3));
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses(false);
  }, [fetchCourses]);

  const getDifficultyColor = useCallback((level: string | undefined): string => {
    const normalizedLevel = level?.toLowerCase() as keyof typeof levelColors;
    return levelColors[normalizedLevel] || levelColors.beginner;
  }, []);

  const formatDuration = useCallback((duration: string | undefined): string => {
    if (!duration) return '4 weeks';
    return duration;
  }, []);

  // Simplified course card without complex animations
  const renderCourseCard = useCallback(({ item, index }: { item: Course; index: number }) => (
    <View style={styles.courseCard} key={item.$id}>
      <TouchableOpacity 
        onPress={() => router.push(`/(tabs)/(courses)/details?id=${item.$id}`)}
        activeOpacity={0.8}
      >
        <Card style={styles.courseCardContent}>
          <View style={styles.imageContainer}>
            <Image 
              source={item.imageUrl ? { uri: item.imageUrl } : require('../../../assets/images/app-logo.png')} 
              style={styles.courseImage} 
              resizeMode="cover" 
            />
            <View style={[styles.levelBadge, { backgroundColor: getDifficultyColor(item.level) + '20' }]}>
              <Text style={[styles.levelText, { color: getDifficultyColor(item.level) }] as any}>
                {item.level ? (item.level.charAt(0).toUpperCase() + item.level.slice(1)) : 'Beginner'}
              </Text>
            </View>
          </View>
          
          <View style={styles.courseContent}>
            <View style={styles.courseHeader}>
              <Text variant="caption" style={styles.categoryText}>{item.category || 'General'}</Text>
              <View style={styles.durationContainer}>
                <Ionicons name="time-outline" size={12} color={airbnbColors.mediumGray} />
                <Text variant="caption" style={styles.durationText}>{formatDuration(item.estimatedDuration)}</Text>
              </View>
            </View>
            
            <Text variant="subtitle1" style={styles.courseTitle} numberOfLines={2}>
              {item.title}
            </Text>
            
            <Text variant="body2" style={styles.courseDescription} numberOfLines={3}>
              {item.description || 'Enhance your English skills with this comprehensive course.'}
            </Text>
            
            <View style={styles.courseFooter}>
              <View style={styles.lessonsInfo}>
                <Ionicons name="play-circle-outline" size={16} color={airbnbColors.primary} />
                <Text variant="caption" style={styles.lessonsText}>
                  {item.totalLessons || 0} lessons
                </Text>
              </View>
              
              <TouchableOpacity style={styles.enrollButton}>
                <Text variant="button" style={styles.enrollButtonText}>Start Learning</Text>
                <Ionicons name="arrow-forward" size={16} color={airbnbColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </View>
  ), [router, getDifficultyColor, formatDuration]);

  // Simplified category button without complex animations
  const renderCategoryButton = useCallback(({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity 
      key={item.id}
      style={[
        styles.categoryButton,
        selectedCategory === item.id ? styles.categoryButtonActive : styles.categoryButtonInactive
      ]}
      onPress={() => setSelectedCategory(item.id)}
      activeOpacity={0.7}
    >
      <Ionicons 
        name={item.icon} 
        size={16} 
        color={selectedCategory === item.id ? airbnbColors.white : airbnbColors.darkGray} 
      />
      <Text 
        variant="body2" 
        style={[
          styles.categoryButtonText,
          { color: selectedCategory === item.id ? airbnbColors.white : airbnbColors.darkGray }
        ] as any}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <Text variant="body1" style={styles.loadingText}>Loading courses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="h3" style={styles.headerTitle}>Explore Courses</Text>
              <Text variant="body2" style={styles.headerSubtitle}>
                Discover your perfect learning path
              </Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <View style={styles.profileImageContainer}>
                <Text style={styles.profileInitial}>{user?.email?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[airbnbColors.primary]}
              tintColor={airbnbColors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={airbnbColors.mediumGray} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search courses, topics..."
                placeholderTextColor={airbnbColors.mediumGray}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={airbnbColors.mediumGray} />
                </TouchableOpacity>
              )}
            </View>

            {/* Categories */}
            <View style={styles.categoriesSection}>
              <Text variant="h5" style={styles.sectionTitle}>Categories</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScrollView}
                contentContainerStyle={styles.categoriesContent}
              >
                {categories.map((item) => renderCategoryButton({ item }))}
              </ScrollView>
            </View>

            {/* Error State */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={24} color={airbnbColors.error} />
                <Text variant="body1" style={styles.errorText}>{error}</Text>
                <Button
                  title="Try Again"
                  onPress={() => fetchCourses()}
                  style={styles.retryButton}
                />
              </View>
            )}

            {/* Featured Courses */}
            {!error && selectedCategory === 'all' && searchQuery === '' && featuredCourses.length > 0 && (
              <View style={styles.featuredSection}>
                <View style={styles.sectionHeader}>
                  <Text variant="h5" style={styles.sectionTitle}>Featured Courses</Text>
                  <TouchableOpacity onPress={() => setSelectedCategory('all')}>
                    <Text variant="body2" style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                </View>
                
                {featuredCourses.map((item, index) => renderCourseCard({ item, index }))}
              </View>
            )}

            {/* All Courses or Filtered Courses */}
            {!error && (
              <View style={styles.coursesSection}>
                <View style={styles.sectionHeader}>
                  <Text variant="h5" style={styles.sectionTitle}>
                    {selectedCategory === 'all' && searchQuery === '' ? 'All Courses' : 'Courses'}
                    {filteredCourses.length > 0 && (
                      <Text variant="body2" style={styles.courseCount}> ({filteredCourses.length})</Text>
                    )}
                  </Text>
                </View>
                
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((item, index) => renderCourseCard({ item, index }))
                ) : !loading && (
                  <View style={styles.emptyState}>
                    <Ionicons name="book-outline" size={64} color={airbnbColors.mediumGray} />
                    <Text variant="h6" style={styles.emptyStateTitle}>No courses found</Text>
                    <Text variant="body2" style={styles.emptyStateText}>
                      {searchQuery ? "Try adjusting your search terms" : "No courses available in this category"}
                    </Text>
                    <Button
                      title="View All Courses"
                      variant="outline"
                      onPress={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      style={styles.emptyStateButton}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  container: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: airbnbColors.offWhite,
  },
  loadingText: {
    marginTop: spacing.md,
    color: airbnbColors.darkGray,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: airbnbColors.offWhite,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.xxl,
  },
  headerSubtitle: {
    color: airbnbColors.darkGray,
    marginTop: spacing.xs,
  },
  profileButton: {
    padding: spacing.xs,
  },
  profileImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: airbnbColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: airbnbColors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: airbnbColors.charcoal,
    fontSize: typography.fontSizes.md,
  },
  categoriesSection: {
    marginBottom: spacing.xl,
  },
  categoriesScrollView: {
    marginTop: spacing.md,
  },
  categoriesContent: {
    paddingRight: spacing.lg,
  },
  sectionTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.lg,
  },
  courseCount: {
    color: airbnbColors.mediumGray,
    fontWeight: typography.fontWeights.regular,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    marginRight: spacing.sm,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonActive: {
    backgroundColor: airbnbColors.primary,
  },
  categoryButtonInactive: {
    backgroundColor: airbnbColors.white,
  },
  categoryButtonText: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  featuredSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  seeAllText: {
    color: airbnbColors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  courseCard: {
    marginBottom: spacing.lg,
  },
  courseCardContent: {
    overflow: 'hidden',
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: airbnbColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
  },
  featuredText: {
    color: airbnbColors.white,
    marginLeft: 4,
    fontSize: 10,
    fontWeight: typography.fontWeights.semibold,
  },
  levelBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.semibold,
  },
  courseContent: {
    padding: spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryText: {
    color: airbnbColors.primary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    textTransform: 'uppercase',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    color: airbnbColors.mediumGray,
    marginLeft: 4,
    fontSize: typography.fontSizes.xs,
  },
  courseTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  courseDescription: {
    color: airbnbColors.darkGray,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonsText: {
    color: airbnbColors.darkGray,
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.xs,
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.primaryLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  enrollButtonText: {
    color: airbnbColors.primary,
    marginRight: spacing.xs,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
  },
  coursesSection: {
    marginBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyStateTitle: {
    color: airbnbColors.charcoal,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  emptyStateText: {
    color: airbnbColors.mediumGray,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  emptyStateButton: {
    marginTop: spacing.sm,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: airbnbColors.error,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
});