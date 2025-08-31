import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text } from '../../components/ui/Typography';
import PreAuthHeader from '../../components/ui2/pre-auth-header';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

// Instructor-specific color palette
const instructorColors = {
  primary: '#00A699',        
  primaryDark: '#008B7D',    
  primaryLight: '#E0F7F5',   
  secondary: '#FF5A5F',      
  secondaryLight: '#FFE8E9', 
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

interface InstructorFeatureCardProps {
  title: string;
  description: string;
  icon: any;
  route: string;
  color?: string;
  badge?: number | string;
}

const InstructorFeatureCard = ({ 
  title, 
  description, 
  icon, 
  route, 
  color = instructorColors.primary,
  badge
}: InstructorFeatureCardProps) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={styles.featureCard} 
      onPress={() => router.push(route as any)}
    >
      <View style={styles.featureCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={instructorColors.mediumGray} />
    </TouchableOpacity>
  );
};

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    myCourses: 0,
    myStudents: 0,
    myClasses: 0,
    pendingAssignments: 0,
  });

  useEffect(() => {
    loadInstructorData();
  }, []);

  const loadInstructorData = async () => {
    try {
      setLoading(true);
      if (!user) return;

      // Load instructor-specific data
      const [coursesResp, classesResp] = await Promise.all([
        appwriteService.getCoursesByInstructor?.(user.$id).catch(() => []),
        appwriteService.getClassesByInstructor?.(user.$id).catch(() => []),
      ]);

      const myCourses = Array.isArray(coursesResp) ? coursesResp.length : 0;
      const myClasses = Array.isArray(classesResp) ? classesResp.length : 0;
      
      // Calculate students from classes
      let totalStudents = 0;
      if (Array.isArray(classesResp)) {
        totalStudents = classesResp.reduce((sum, cls) => sum + (cls.currentEnrollment || 0), 0);
      }

      setDashboardData({
        myCourses,
        myStudents: totalStudents,
        myClasses,
        pendingAssignments: 0, // Placeholder
      });
    } catch (error) {
      console.error('Error loading instructor data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={instructorColors.primary} />
        <Text style={styles.loadingText}>Loading instructor dashboard...</Text>
      </View>
    );
  }

  const statsList = [
    { number: dashboardData.myCourses, label: 'My Courses', icon: 'book' as const },
    { number: dashboardData.myStudents, label: 'Students', icon: 'people' as const },
    { number: dashboardData.myClasses, label: 'Classes', icon: 'calendar' as const },
    { number: dashboardData.pendingAssignments, label: 'Pending', icon: 'time' as const },
  ];

  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title="Instructor Dashboard"
        showNotifications={true}
        showRefresh={true}
        showLogout={true}
        onNotificationPress={() => console.log('Instructor notifications')}
        onRefreshPress={loadInstructorData}
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
                <Text style={styles.welcomeTitle}>Welcome back!</Text>
                <Text style={styles.welcomeSubtitle}>
                  Hello, {user?.name || 'Instructor'}. Ready to inspire your students today?
                </Text>
              </View>
              <View style={styles.instructorBadgeContainer}>
                <View style={styles.instructorBadge}>
                  <Ionicons name="school" size={16} color={instructorColors.white} />
                  <Text style={styles.instructorBadgeText}>Instructor</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Stats Section */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.statsSection}
          >
            <Text style={styles.sectionTitle}>Teaching Overview</Text>
            <View style={styles.statsGrid}>
              {statsList.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: instructorColors.primary + '15' }]}> 
                    <Ionicons name={stat.icon} size={18} color={instructorColors.primary} />
                  </View>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View 
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.menuCard}>
              <InstructorFeatureCard
                title="Manage Courses"
                description="Create and edit your courses"
                icon="book"
                route="/(instructor)/(courses)/index"
                color={instructorColors.primary}
                badge={dashboardData.myCourses}
              />
              
              <InstructorFeatureCard
                title="View Students"
                description="Monitor student progress"
                icon="people"
                route="/(instructor)/(students)/index"
                color={instructorColors.secondary}
                badge={dashboardData.myStudents}
              />

              <InstructorFeatureCard
                title="Schedule Classes"
                description="Manage class schedules"
                icon="calendar"
                route="/(instructor)/(classes)/index"
                color={instructorColors.warning}
                badge={dashboardData.myClasses}
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
    backgroundColor: instructorColors.offWhite,
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
    backgroundColor: instructorColors.offWhite,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: instructorColors.darkGray,
    fontWeight: '500',
  },

  // Welcome Section
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeCard: {
    backgroundColor: instructorColors.white,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: instructorColors.black,
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
    color: instructorColors.charcoal,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: instructorColors.darkGray,
    lineHeight: 22,
  },
  instructorBadgeContainer: {
    marginLeft: 16,
  },
  instructorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: instructorColors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  instructorBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: instructorColors.white,
  },

  // Stats Section
  statsSection: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: instructorColors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: instructorColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    alignItems: 'flex-start',
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
    color: instructorColors.charcoal,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: instructorColors.darkGray,
    textAlign: 'center',
  },

  // Menu Sections
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: instructorColors.charcoal,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: instructorColors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: instructorColors.black,
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
    borderBottomColor: instructorColors.lightGray,
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
    backgroundColor: instructorColors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: instructorColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: instructorColors.charcoal,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 14,
    color: instructorColors.darkGray,
  },
});