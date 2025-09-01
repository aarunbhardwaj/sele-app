import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { Text } from '../../components/ui/Typography';
import PreAuthHeader from '../../components/ui2/pre-auth-header';
import type { ClassSession } from '../../lib/instructor-types';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

// Consistent Airbnb-inspired color palette (matching main app)
const airbnbColors = {
  primary: '#FF5A5F',        
  primaryDark: '#E8484D',    
  primaryLight: '#FFE8E9',   
  secondary: '#00A699',      
  secondaryLight: '#E0F7F5', 
  tertiary: '#FC642D',
  tertiaryLight: '#FFF4F0',
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

interface AssignmentInfo {
  schoolName: string;
  className: string;
  grade: string;
  subject: string;
  schedule: string;
  studentCount: number;
  status: 'active' | 'pending' | 'completed';
}

interface InstructorStats {
  myCourses: number;
  myStudents: number;
  myClasses: number;
  pendingAssignments: number;
  assignments: AssignmentInfo[];
}

const InstructorFeatureCard = React.memo<InstructorFeatureCardProps>((props) => {
  const { title, description, icon, route, color = airbnbColors.primary, badge } = props;
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={styles.featureCard} 
      onPress={() => router.push(route as any)}
      activeOpacity={0.8}
    >
      <View style={styles.featureCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
          {badge && (
            <View style={[styles.badge, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
    </TouchableOpacity>
  );
});

const AssignmentCard = ({ assignment, index }: { assignment: AssignmentInfo; index: number }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return airbnbColors.success;
      case 'pending': return airbnbColors.warning;
      case 'completed': return airbnbColors.success;
      default: return airbnbColors.mediumGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const statusTextStyle = {
    ...styles.statusText,
    color: getStatusColor(assignment.status)
  };

  return (
    <Animated.View 
      entering={FadeInRight.delay(index * 150).duration(600)}
      style={styles.assignmentCard}
    >
      <View style={styles.assignmentHeader}>
        <View style={styles.schoolInfo}>
          <View style={styles.schoolIcon}>
            <Ionicons name="school" size={20} color={airbnbColors.secondary} />
          </View>
          <View style={styles.schoolDetails}>
            <Text style={styles.schoolName}>{assignment.schoolName}</Text>
            <Text style={styles.className}>{assignment.className} • {assignment.grade}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) + '15' }]}>
          <Text style={statusTextStyle}>
            {getStatusText(assignment.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.assignmentDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="book-outline" size={16} color={airbnbColors.darkGray} />
          <Text style={styles.detailText}>{assignment.subject}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color={airbnbColors.darkGray} />
          <Text style={styles.detailText}>{assignment.schedule}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color={airbnbColors.darkGray} />
          <Text style={styles.detailText}>{assignment.studentCount} students</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export default function InstructorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<InstructorStats>({
    myCourses: 0,
    myStudents: 0,
    myClasses: 0,
    pendingAssignments: 0,
    assignments: [],
  });

  // Add new state for enhanced instructor features
  const [todaySessions, setTodaySessions] = useState<ClassSession[]>([]);

  const loadInstructorData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      if (!user?.$id) {
        console.log('No user ID available for loading instructor data');
        return;
      }

      // Load instructor profile and enhanced data
      const [
        coursesResp, 
        classesResp, 
        instructorProfileResp,
        todaySessionsResp,
      ] = await Promise.all([
        appwriteService.getAllCourses().catch(() => []),
        appwriteService.getClassesByInstructor?.(user.$id).catch(() => []),
        appwriteService.getInstructorProfile?.(user.$id).catch(() => null),
        appwriteService.getInstructorSessions?.(user.$id, { 
          date: new Date().toISOString().split('T')[0], 
          limit: 10 
        }).catch(() => []),
      ]);

      // Update instructor profile if it doesn't exist
      if (!instructorProfileResp && user) {
        try {
          await appwriteService.createInstructorProfile?.({
            userId: user.$id,
            displayName: user.name || 'Instructor',
            email: user.email || '',
            specialization: ['English Language'],
            experience: '1+ years',
            qualifications: [],
            status: 'available',
            maxClasses: 5,
            currentAssignments: [],
            rating: 0,
            totalRatings: 0,
            isActive: true
          });
        } catch (error) {
          console.warn('Could not create instructor profile:', error);
        }
      }

      const myCourses = Array.isArray(coursesResp) ? coursesResp.length : 0;
      const myClasses = Array.isArray(classesResp) ? classesResp.length : 0;
      
      // Calculate students from classes and create assignment info
      let totalStudents = 0;
      const assignments: AssignmentInfo[] = [];
      
      if (Array.isArray(classesResp)) {
        totalStudents = classesResp.reduce((sum, cls) => sum + (cls.currentEnrollment || 0), 0);
        
        // Transform classes into assignment information with enhanced data
        for (const classItem of classesResp) {
          const schoolName = 'School'; // Default school name since property doesn't exist on Class type
          assignments.push({
            schoolName,
            className: classItem.title || 'English Class',
            grade: classItem.grade || 'Intermediate',
            subject: classItem.subject || 'English Language',
            schedule: classItem.schedule || 'Mon, Wed, Fri - 10:00 AM',
            studentCount: classItem.currentEnrollment || 0,
            status: classItem.status === 'active' ? 'active' : 
                   classItem.status === 'inactive' ? 'pending' : 'completed'
          });
        }
      }

      // Set enhanced dashboard data
      setDashboardData({
        myCourses,
        myStudents: totalStudents,
        myClasses,
        pendingAssignments: assignments.filter(a => a.status === 'pending').length,
        assignments,
      });

      // Set additional instructor-specific data
      setTodaySessions(Array.isArray(todaySessionsResp) ? todaySessionsResp : []);

    } catch (error) {
      console.error('Error loading instructor data:', error);
      if (!isRefresh) {
        Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadInstructorData();
  }, [loadInstructorData]);

  const handleRefresh = () => {
    loadInstructorData(true);
  };

  // Add quick action handlers
  const handleStartClass = () => {
    const nextSession = todaySessions.find(s => s.status === 'scheduled');
    if (nextSession) {
      router.push(`/(instructor)/class-session?classId=${nextSession.classId}&sessionId=${nextSession.$id}`);
    } else {
      Alert.alert('No Scheduled Classes', 'You have no scheduled classes for today.');
    }
  };

  const handleRateStudents = () => {
    const recentSession = todaySessions.find(s => s.status === 'completed');
    if (recentSession) {
      router.push(`/(instructor)/student-rating?classId=${recentSession.classId}&sessionId=${recentSession.$id}`);
    } else {
      Alert.alert('No Recent Classes', 'You have no recent classes to rate students for.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Text style={styles.loadingText}>Loading instructor dashboard...</Text>
      </View>
    );
  }

  const statsList = [
    { number: dashboardData.myCourses, label: 'My Courses', icon: 'book' as const, color: airbnbColors.secondary },
    { number: dashboardData.myStudents, label: 'Students', icon: 'people' as const, color: airbnbColors.primary },
    { number: dashboardData.myClasses, label: 'Classes', icon: 'calendar' as const, color: airbnbColors.tertiary },
    { number: todaySessions.length, label: 'Today Sessions', icon: 'time' as const, color: airbnbColors.success },
  ];

  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title="Teaching Dashboard"
        showNotifications={true}
        showRefresh={true}
        showLogout={true}
        onNotificationPress={() => console.log('Instructor notifications')}
        onRefreshPress={handleRefresh}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[airbnbColors.primary]}
            tintColor={airbnbColors.primary}
          />
        }
      >
        <View style={styles.content}>
          {/* Enhanced Welcome Section */}
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
                  <Ionicons name="school" size={16} color={airbnbColors.white} />
                  <Text style={styles.instructorBadgeText}>Instructor</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Today's Quick Actions */}
          <Animated.View 
            entering={FadeInUp.delay(150).duration(600)}
            style={styles.quickActionsSection}
          >
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: airbnbColors.success + '15' }]}
                onPress={handleStartClass}
              >
                <Ionicons name="play-circle" size={32} color={airbnbColors.success} />
                <Text style={{...styles.quickActionText, color: airbnbColors.success}}>Start Class</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: airbnbColors.warning + '15' }]}
                onPress={handleRateStudents}
              >
                <Ionicons name="star" size={32} color={airbnbColors.warning} />
                <Text style={{...styles.quickActionText, color: airbnbColors.warning}}>Rate Students</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: airbnbColors.secondary + '15' }]}
                onPress={() => router.push('/instructor/calendar' as any)}
              >
                <Ionicons name="calendar" size={32} color={airbnbColors.secondary} />
                <Text style={{...styles.quickActionText, color: airbnbColors.secondary}}>My Schedule</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: airbnbColors.primary + '15' }]}
                onPress={() => router.push('/instructor/students' as any)}
              >
                <Ionicons name="people" size={32} color={airbnbColors.primary} />
                <Text style={{...styles.quickActionText, color: airbnbColors.primary}}>My Students</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Enhanced Stats Section */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.statsSection}
          >
            <Text style={styles.sectionTitle}>Teaching Overview</Text>
            <View style={styles.statsGrid}>
              {statsList.map((stat, index) => (
                <Animated.View
                  key={stat.label}
                  entering={FadeInLeft.delay((index + 1) * 100).duration(600)}
                  style={styles.statCard}
                >
                  <View style={[styles.statIconContainer, { backgroundColor: stat.color + '15' }]}>
                    <Ionicons name={stat.icon} size={20} color={stat.color} />
                  </View>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Class Assignments Section */}
          <Animated.View 
            entering={FadeInUp.delay(250).duration(600)}
            style={styles.assignmentsSection}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Assignments</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push('/instructor/classes' as any)}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color={airbnbColors.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.assignmentsList}>
              {dashboardData.assignments.slice(0, 3).map((assignment, index) => (
                <AssignmentCard 
                  key={`${assignment.schoolName}-${assignment.className}-${index}`}
                  assignment={assignment} 
                  index={index} 
                />
              ))}
              {dashboardData.assignments.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="school-outline" size={48} color={airbnbColors.mediumGray} />
                  <Text style={styles.emptyStateTitle}>No Assignments Yet</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Your class assignments will appear here
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Enhanced Instructor Features */}
          <Animated.View 
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Instructor Tools</Text>
            <View style={styles.menuCard}>
              <InstructorFeatureCard
                title="My Calendar"
                description="View your teaching schedule and upcoming sessions"
                icon="calendar-outline"
                route="/instructor/calendar"
                color={airbnbColors.secondary}
                badge={todaySessions.length > 0 ? todaySessions.length : undefined}
              />
              <InstructorFeatureCard
                title="My Classes"
                description="Manage your assigned classes and students"
                icon="school-outline"
                route="/instructor/classes"
                color={airbnbColors.primary}
                badge={dashboardData.myClasses > 0 ? dashboardData.myClasses : undefined}
              />
              <InstructorFeatureCard
                title="Student Management"
                description="View student progress and performance"
                icon="people-outline"
                route="/instructor/students"
                color={airbnbColors.tertiary}
                badge={dashboardData.myStudents > 0 ? dashboardData.myStudents : undefined}
              />
              <InstructorFeatureCard
                title="Instructor Profile"
                description="Update your teaching profile and preferences"
                icon="person-outline"
                route="/instructor/profile"
                color={airbnbColors.warning}
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
  instructorBadgeContainer: {
    marginLeft: 16,
  },
  instructorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.secondary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  instructorBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: airbnbColors.white,
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
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: airbnbColors.black,
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
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    fontWeight: '500',
  },

  // Assignments Section
  assignmentsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    color: airbnbColors.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  assignmentsList: {
    gap: 12,
  },
  assignmentCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  schoolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: airbnbColors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  schoolDetails: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 2,
  },
  className: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  assignmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },

  // Quick Actions Section
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
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
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    lineHeight: 20,
  },

  // Add new styles for enhanced features
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  sessionsSection: {
    marginBottom: 24,
  },
  sessionsList: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  sessionCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    padding: 16,
    minWidth: 180,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionTime: {
    fontSize: 16,
    fontWeight: '700',
    color: airbnbColors.charcoal,
  },
  sessionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessionStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: airbnbColors.white,
  },
  sessionTopic: {
    fontSize: 14,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  sessionDetails: {
    fontSize: 12,
    color: airbnbColors.darkGray,
  },

  // Add missing empty state styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});