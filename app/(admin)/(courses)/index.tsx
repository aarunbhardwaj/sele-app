import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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

interface CourseFeatureCardProps {
  title: string;
  description: string;
  icon: any;
  route: string;
  color?: string;
  badge?: number | string;
}

// Feature Card Component with Airbnb styling
const CourseFeatureCard = ({ 
  title, 
  description, 
  icon, 
  route, 
  color = airbnbColors.primary,
  badge
}: CourseFeatureCardProps) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={styles.featureCard} 
      onPress={() => router.push(route as any)}
    >
      <View style={styles.featureCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
          {badge !== undefined && badge !== null && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{String(badge)}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{String(title)}</Text>
          <Text style={styles.cardDescription}>{String(description)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
    </TouchableOpacity>
  );
};

export default function CoursesIndexPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalLessons: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourseStats();
  }, []);

  const loadCourseStats = async () => {
    try {
      setLoading(true);
      const courses = await appwriteService.getAllCourses();
      
      const totalCourses = courses.length;
      const publishedCourses = courses.filter(course => course.isPublished).length;
      const draftCourses = totalCourses - publishedCourses;
      
      // Estimate total lessons (this would be more accurate with actual lesson data)
      const totalLessons = totalCourses * 5; // Assuming average 5 lessons per course
      
      setStats({
        totalCourses,
        publishedCourses,
        draftCourses,
        totalLessons
      });
    } catch (error) {
      console.error('Error loading course stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title="Course Management"
        showNotifications={true}
        showRefresh={true}
        onNotificationPress={() => console.log('Course notifications')}
        onRefreshPress={loadCourseStats}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Welcome Section */}
          <Animated.View 
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.welcomeSection}
          >
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeContent}>
                <Text style={styles.welcomeTitle}>Course Management</Text>
                <Text style={styles.welcomeSubtitle}>
                  Create, organize, and manage all educational content for your platform
                </Text>
              </View>
              <View style={styles.courseIconContainer}>
                <Ionicons name="library" size={24} color={airbnbColors.primary} />
              </View>
            </View>
          </Animated.View>

          {/* Stats Section */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.statsSection}
          >
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: airbnbColors.primary + '15' }]}>
                  <Ionicons name="library" size={20} color={airbnbColors.primary} />
                </View>
                <Text style={styles.statNumber}>{stats.totalCourses}</Text>
                <Text style={styles.statLabel}>Total Courses</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: airbnbColors.success + '15' }]}>
                  <Ionicons name="checkmark-circle" size={20} color={airbnbColors.success} />
                </View>
                <Text style={styles.statNumber}>{stats.publishedCourses}</Text>
                <Text style={styles.statLabel}>Published</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIconContainer, { backgroundColor: airbnbColors.warning + '15' }]}>
                  <Ionicons name="document-text" size={20} color={airbnbColors.warning} />
                </View>
                <Text style={styles.statNumber}>{stats.draftCourses}</Text>
                <Text style={styles.statLabel}>Drafts</Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick Actions Section */}
          <Animated.View 
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.menuCard}>
              <CourseFeatureCard
                title="Create New Course"
                description="Start building a new course from scratch"
                icon="add-circle"
                route="/(admin)/(courses)/course-creator"
                color={airbnbColors.primary}
              />
              
              <CourseFeatureCard
                title="Course Library"
                description="Browse and manage all existing courses"
                icon="library"
                route="/(admin)/(courses)/course-library"
                color={airbnbColors.secondary}
                badge={stats.totalCourses}
              />
            </View>
          </Animated.View>

          {/* Course Management Section */}
          <Animated.View 
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Course Management</Text>
            <View style={styles.menuCard}>
              <CourseFeatureCard
                title="Course Analytics"
                description="View course performance and engagement metrics"
                icon="analytics"
                route="/(admin)/(courses)/course-analytics"
                color="#8B5CF6"
              />
              
              <CourseFeatureCard
                title="Lesson Management"
                description="Organize and edit individual course lessons"
                icon="list"
                route="/(admin)/(courses)/lessons"
                color="#10B981"
              />
              
              <CourseFeatureCard
                title="Content Upload"
                description="Upload videos, documents, and other course materials"
                icon="cloud-upload"
                route="/(admin)/(courses)/upload-content"
                color="#F59E0B"
              />
            </View>
          </Animated.View>

          {/* Publishing & Distribution Section */}
          <Animated.View 
            entering={FadeInUp.delay(500).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Publishing & Distribution</Text>
            <View style={styles.menuCard}>
              <CourseFeatureCard
                title="Publish Courses"
                description="Review and publish draft courses to students"
                icon="globe"
                route="/(admin)/(courses)/publish-courses"
                color="#EC4899"
              />
              
              <CourseFeatureCard
                title="Course Categories"
                description="Organize courses by subjects and difficulty levels"
                icon="folder"
                route="/(admin)/(courses)/categories"
                color="#0EA5E9"
              />
            </View>
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
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: airbnbColors.lightGray,
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeCard: {
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
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: airbnbColors.darkGray,
    lineHeight: 22,
  },
  courseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: airbnbColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },

  // Stats Section
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: airbnbColors.darkGray,
    textAlign: 'center',
  },

  // Menu Sections
  sectionContainer: {
    marginBottom: 24,
  },
  menuCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Feature Cards
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  featureCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: airbnbColors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: airbnbColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
});