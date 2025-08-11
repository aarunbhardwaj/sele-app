import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../components/ui/theme';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';
import { useAuth } from '../../../services/AuthContext';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalExercises: number;
  usersByLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  completionRate: number;
  averageScore: number;
  mostPopularCourse: string;
  mostActiveUser: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showingAnalytics, setShowingAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalExercises: 0,
    usersByLevel: {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    },
    completionRate: 0,
    averageScore: 0,
    mostPopularCourse: '',
    mostActiveUser: '',
  });

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get users
      const users = await appwriteService.getAllUsers();
      const totalUsers = users.length;
      
      // Get active users (mock calculation)
      const activeUsers = Math.floor(totalUsers * 0.6);
      
      // Get courses
      const courses = await appwriteService.getAllCourses();
      const totalCourses = courses.length;
      
      // Get roles (if possible)
      let totalRoles = 2; // Default value
      try {
        const roles = await appwriteService.getAllRoles();
        totalRoles = roles.length;
      } catch (error) {
        console.log("Couldn't load roles, using default value");
      }
      
      // Mock data for analytics
      const usersByLevel = {
        beginner: Math.floor(totalUsers * 0.5),
        intermediate: Math.floor(totalUsers * 0.3),
        advanced: Math.floor(totalUsers * 0.2),
      };
      
      const totalLessons = totalCourses * 5; // Assume 5 lessons per course
      const totalExercises = totalLessons * 3; // Assume 3 exercises per lesson
      const completionRate = 68; // 68%
      const averageScore = 72; // 72/100
      
      // Most popular course
      const mostPopularCourse = courses.length > 0 ? courses[0].title : 'None';
      
      // Most active user
      const mostActiveUser = users.length > 0 ? users[0].displayName || 'Unknown' : 'None';
      
      setAnalyticsData({
        totalUsers,
        activeUsers,
        totalCourses,
        totalLessons,
        totalExercises,
        usersByLevel,
        completionRate,
        averageScore,
        mostPopularCourse,
        mostActiveUser,
      });

      // Update the stat cards with real data
      setStats([
        { number: totalRoles, label: 'Roles' },
        { number: totalUsers, label: 'Users' },
        { number: totalCourses, label: 'Courses' }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // State for the stats cards
  const [stats, setStats] = useState([
    { number: 2, label: 'Roles' },
    { number: 5, label: 'Users' },
    { number: 12, label: 'Courses' }
  ]);

  const renderDashboard = () => (
    <>
      <View style={styles.welcomeSection}>
        <Text style={styles.headerSubtitle}>Welcome, {user?.name || 'Admin'}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statNumber}>{stat.number}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
      
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => router.push("/(admin)/(users)")}
        >
          <Ionicons name="people-outline" size={32} color="#3B82F6" />
          <Text style={styles.actionTitle}>Manage Users</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => router.push("/(admin)/(courses)/course-library")}
        >
          <Ionicons name="book-outline" size={32} color="#8B5CF6" />
          <Text style={styles.actionTitle}>Manage Courses</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => router.push("/(admin)/(schools)")}
        >
          <Ionicons name="school-outline" size={32} color="#059669" />
          <Text style={styles.actionTitle}>Manage Schools</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => router.push("/(admin)/(quiz)/quiz-list")}
        >
          <Ionicons name="help-circle-outline" size={32} color="#EC4899" />
          <Text style={styles.actionTitle}>Manage Quizzes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard} 
          onPress={() => router.push("/(admin)/(users)/roles-management")}
        >
          <Ionicons name="key-outline" size={32} color="#F59E0B" />
          <Text style={styles.actionTitle}>Manage Roles</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityList}>
        <View style={styles.activityItem}>
          <View style={styles.activityDot}></View>
          <View>
            <Text style={styles.activityText}>New user registered</Text>
            <Text style={styles.activityTime}>Today, 2:30 PM</Text>
          </View>
        </View>
        
        <View style={styles.activityItem}>
          <View style={styles.activityDot}></View>
          <View>
            <Text style={styles.activityText}>Course "React Basics" published</Text>
            <Text style={styles.activityTime}>Yesterday, 10:15 AM</Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderAnalytics = () => (
    <>
      <View style={styles.welcomeSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.headerSubtitle}>Platform performance metrics</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowingAnalytics(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Key Metrics */}
      <View style={styles.analyticsRow}>
        {/* Total Users */}
        <View style={styles.analyticsCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="people" size={24} color="#3B82F6" />
            <Text style={{ color: '#3B82F6', fontSize: 12 }}>Total</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{analyticsData.totalUsers}</Text>
          <Text style={{ color: '#6B7280' }}>Users</Text>
        </View>
        
        {/* Active Users */}
        <View style={styles.analyticsCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="people-circle" size={24} color="#10B981" />
            <Text style={{ color: '#10B981', fontSize: 12 }}>Active</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{analyticsData.activeUsers}</Text>
          <Text style={{ color: '#6B7280' }}>Active Users</Text>
        </View>
      </View>
      
      <View style={styles.analyticsRow}>
        {/* Total Courses */}
        <View style={styles.analyticsCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="book" size={24} color="#8B5CF6" />
            <Text style={{ color: '#8B5CF6', fontSize: 12 }}>Total</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{analyticsData.totalCourses}</Text>
          <Text style={{ color: '#6B7280' }}>Courses</Text>
        </View>
        
        {/* Completion Rate */}
        <View style={styles.analyticsCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="checkmark-circle" size={24} color="#F59E0B" />
            <Text style={{ color: '#F59E0B', fontSize: 12 }}>Rate</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{analyticsData.completionRate}%</Text>
          <Text style={{ color: '#6B7280' }}>Completion Rate</Text>
        </View>
      </View>
      
      {/* User Levels Distribution */}
      <View style={[styles.analyticsFullCard, { marginTop: 8 }]}>
        <Text style={styles.cardTitle}>User Levels Distribution</Text>
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#4B5563' }}>Beginner</Text>
            <Text style={{ color: '#4B5563' }}>{analyticsData.usersByLevel.beginner} users</Text>
          </View>
          <View style={{ backgroundColor: '#E5E7EB', borderRadius: 10, height: 10 }}>
            <View 
              style={{
                backgroundColor: '#10B981',
                borderRadius: 10,
                height: 10,
                width: `${(analyticsData.usersByLevel.beginner / analyticsData.totalUsers) * 100}%`
              }}
            />
          </View>
        </View>
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#4B5563' }}>Intermediate</Text>
            <Text style={{ color: '#4B5563' }}>{analyticsData.usersByLevel.intermediate} users</Text>
          </View>
          <View style={{ backgroundColor: '#E5E7EB', borderRadius: 10, height: 10 }}>
            <View 
              style={{
                backgroundColor: '#3B82F6',
                borderRadius: 10,
                height: 10,
                width: `${(analyticsData.usersByLevel.intermediate / analyticsData.totalUsers) * 100}%`
              }}
            />
          </View>
        </View>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#4B5563' }}>Advanced</Text>
            <Text style={{ color: '#4B5563' }}>{analyticsData.usersByLevel.advanced} users</Text>
          </View>
          <View style={{ backgroundColor: '#E5E7EB', borderRadius: 10, height: 10 }}>
            <View 
              style={{
                backgroundColor: '#8B5CF6',
                borderRadius: 10,
                height: 10,
                width: `${(analyticsData.usersByLevel.advanced / analyticsData.totalUsers) * 100}%`
              }}
            />
          </View>
        </View>
      </View>
      
      {/* Content Statistics */}
      <View style={styles.analyticsFullCard}>
        <Text style={styles.cardTitle}>Content Statistics</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#3B82F6' }}>{analyticsData.totalCourses}</Text>
            <Text style={{ color: '#6B7280', marginTop: 4 }}>Courses</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#10B981' }}>{analyticsData.totalLessons}</Text>
            <Text style={{ color: '#6B7280', marginTop: 4 }}>Lessons</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#8B5CF6' }}>{analyticsData.totalExercises}</Text>
            <Text style={{ color: '#6B7280', marginTop: 4 }}>Exercises</Text>
          </View>
        </View>
      </View>
      
      {/* Performance Metrics */}
      <View style={styles.analyticsFullCard}>
        <Text style={styles.cardTitle}>Performance Metrics</Text>
        <View style={{ marginVertical: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#4B5563' }}>Average Score</Text>
            <Text style={{ fontWeight: 'bold' }}>{analyticsData.averageScore}/100</Text>
          </View>
          <View style={{ backgroundColor: '#E5E7EB', borderRadius: 10, height: 10, marginBottom: 16 }}>
            <View 
              style={{
                backgroundColor: '#3B82F6',
                borderRadius: 10,
                height: 10,
                width: `${analyticsData.averageScore}%`
              }}
            />
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#4B5563' }}>Course Completion</Text>
            <Text style={{ fontWeight: 'bold' }}>{analyticsData.completionRate}%</Text>
          </View>
          <View style={{ backgroundColor: '#E5E7EB', borderRadius: 10, height: 10 }}>
            <View 
              style={{
                backgroundColor: '#10B981',
                borderRadius: 10,
                height: 10,
                width: `${analyticsData.completionRate}%`
              }}
            />
          </View>
        </View>
      </View>
      
      {/* Top Performers */}
      <View style={styles.analyticsFullCard}>
        <Text style={styles.cardTitle}>Top Performers</Text>
        <View style={{ marginVertical: 12 }}>
          <Text style={{ color: '#4B5563' }}>Most Popular Course</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>{analyticsData.mostPopularCourse}</Text>
          
          <Text style={{ color: '#4B5563' }}>Most Active User</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{analyticsData.mostActiveUser}</Text>
        </View>
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ color: '#6B7280', marginTop: 16 }}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title={showingAnalytics ? "Analytics Dashboard" : "Admin Dashboard"}
        rightComponent={
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {}}
          >
            <Ionicons name="notifications-outline" size={24} color="#333333" />
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.container}>
        {showingAnalytics ? renderAnalytics() : renderDashboard()}
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
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 8,
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
    marginRight: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#1F2937',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  // Analytics styles
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  analyticsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  analyticsFullCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  }
});