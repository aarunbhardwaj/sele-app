import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text } from '../../components/ui/Typography';
import PreAuthHeader from '../../components/ui2/pre-auth-header';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

// Airbnb-inspired color palette (same as profile page)
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

// Define the feature card interface
interface AdminFeatureCardProps {
  title: string;
  description: string;
  icon: any;
  route: string;
  color?: string;
  badge?: number | string;
}

// Feature Card Component with Airbnb styling
const AdminFeatureCard = ({ 
  title, 
  description, 
  icon, 
  route, 
  color = airbnbColors.primary,
  badge
}: AdminFeatureCardProps) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={styles.featureCard} 
      onPress={() => {
        const fixedRoute = route.endsWith('/index') 
          ? route.substring(0, route.length - 6) 
          : route;
        router.push(fixedRoute as any);
      }}
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
      <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
    </TouchableOpacity>
  );
};

// Main Component
export default function AdminControlCenter() {
  const { user } = useAuth();
  // Removed unused router instance; each feature card handles its own routing
  const [loading, setLoading] = useState(true);
  
  // Replace simplistic stats with rich dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    students: 0,
    instructors: 0,
    admins: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    totalSchools: 0,
    totalRoles: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load core datasets concurrently where possible
      const [usersResp, coursesResp, quizzesResp, schoolsResp, rolesResp] = await Promise.all([
        appwriteService.getAllUsers().catch(e => { console.log('Users load error', e); return null; }),
        appwriteService.getAllCourses().catch(e => { console.log('Courses load error', e); return []; }),
        appwriteService.getAllQuizzes?.().catch(e => { console.log('Quizzes load error', e); return []; }),
        appwriteService.getAllSchools?.().catch(e => { console.log('Schools load error', e); return []; }),
        appwriteService.getAllRoles?.().catch(e => { console.log('Roles load error', e); return []; }),
      ]);

      // Normalize users response to a plain array
      const rawUsers: any[] = Array.isArray(usersResp?.users)
        ? usersResp.users
        : Array.isArray(usersResp)
          ? usersResp
          : [];

      const totalUsers = rawUsers.length;

      // New role counting logic: only three roles (admin, instructor, student)
      const admins = rawUsers.filter(u => u?.isAdmin === true).length;
      const instructors = rawUsers.filter(u => !u?.isAdmin && (u?.isInstructor === true || u?.role === 'instructor')).length;
      const students = Math.max(0, totalUsers - admins - instructors);

      const activeUsers = rawUsers.filter(u => (u?.status || 'active') === 'active').length;

      // Normalize counts for other collections (support Appwrite DocumentList or arrays)
      const getCount = (res: any): number => {
        if (!res) return 0;
        if (Array.isArray(res)) return res.length;
        if (Array.isArray(res?.documents)) return res.documents.length;
        return 0;
      };

      setDashboardData({
        totalUsers,
        students,
        instructors,
        admins,
        activeUsers,
        totalCourses: getCount(coursesResp),
        totalQuizzes: getCount(quizzesResp),
        totalSchools: getCount(schoolsResp),
        totalRoles: getCount(rolesResp),
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // (Optional) logout handler kept for future use

  // Display loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Text style={styles.loadingText}>Loading admin center...</Text>
      </View>
    );
  }

  // Prepare stats list for rendering (ordered)
  const statsList = [
    { number: dashboardData.totalUsers, label: 'Users', icon: 'people' as const },
    { number: dashboardData.activeUsers, label: 'Active', icon: 'flash' as const },
    { number: dashboardData.students, label: 'Students', icon: 'school' as const },
    { number: dashboardData.instructors, label: 'Instructors', icon: 'easel' as const },
    { number: dashboardData.admins, label: 'Admins', icon: 'shield-checkmark' as const },
    { number: dashboardData.totalRoles, label: 'Roles', icon: 'key' as const },
    { number: dashboardData.totalSchools, label: 'Schools', icon: 'business' as const },
  ];

  // Roles distribution for visualization (exclude zero counts automatically)
  const distributionRaw = [
    { label: 'Students', value: dashboardData.students, color: airbnbColors.primary },
    { label: 'Instructors', value: dashboardData.instructors, color: airbnbColors.secondary },
    { label: 'Admins', value: dashboardData.admins, color: airbnbColors.warning },
  ];
  const totalDist = distributionRaw.reduce((a, b) => a + b.value, 0) || 1;
  const rolesDistribution = distributionRaw
    .filter(d => d.value > 0)
    .map(d => ({ ...d, pct: Math.round((d.value / totalDist) * 100) }));

  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title="Admin Control Center"
        showNotifications={true}
        showRefresh={true}
        showLogout={true}
        onNotificationPress={() => console.log('Admin notifications')}
        onRefreshPress={loadDashboardData}
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
                  Hello, {user?.name || 'Admin'}. Here&apos;s what&apos;s happening with your platform today.
                </Text>
              </View>
              <View style={styles.adminBadgeContainer}>
                <View style={styles.adminBadge}>
                  <Ionicons name="shield-checkmark" size={16} color={airbnbColors.white} />
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Core Platform Stats */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.statsSection}
          >
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.statsGridEnhanced}>
              {statsList.map((stat, index) => (
                <View key={index} style={styles.statCardEnhanced}>
                  <View style={[styles.statIconContainer, { backgroundColor: airbnbColors.primary + '15' }]}> 
                    <Ionicons name={stat.icon} size={18} color={airbnbColors.primary} />
                  </View>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Roles Overview Distribution */}
          <Animated.View 
            entering={FadeInUp.delay(250).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Roles Overview</Text>
            <View style={styles.rolesCard}>
              {rolesDistribution.map((r, idx) => (
                <View key={idx} style={styles.roleRow}>
                  <View style={[styles.roleColorDot, { backgroundColor: r.color }]} />
                  <Text style={styles.roleLabel}>{r.label}</Text>
                  <View style={styles.roleBarTrack}>
                    <View style={[styles.roleBarFill, { backgroundColor: r.color, width: (r.pct + '%') as any }]} />
                  </View>
                  <Text style={styles.rolePct}>{r.pct}%</Text>
                </View>
              ))}
              {rolesDistribution.length === 0 && (
                <Text style={styles.emptyText}>No role data available</Text>
              )}
            </View>
          </Animated.View>

          {/* Management Section */}
          <Animated.View 
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Management</Text>
            <View style={styles.menuCard}>
              <AdminFeatureCard
                title="User Management"
                description="Manage accounts, roles, and permissions"
                icon="people"
                route="/(admin)/(users)/index"
                color={airbnbColors.secondary}
                badge={dashboardData.totalUsers}
              />
              
              <AdminFeatureCard
                title="Roles Management"
                description="Create & assign platform roles"
                icon="key"
                route="/(admin)/(users)/roles"
                color={airbnbColors.warning}
                badge={dashboardData.totalRoles}
              />

              <AdminFeatureCard
                title="Schools Management"
                description="Manage school partners"
                icon="school"
                route="/(admin)/(schools)/index"
                color={airbnbColors.success}
                badge={dashboardData.totalSchools}
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
  logoutButton: {
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
  adminBadgeContainer: {
    marginLeft: 16,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  adminBadgeText: {
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
    gap: 12,
  },
  statsGridEnhanced: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  statCardEnhanced: {
    width: '47%',
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    padding: 12,
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

  // Roles distribution styles
  rolesCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  roleLabel: {
    width: 90,
    fontSize: 14,
    fontWeight: '500',
    color: airbnbColors.charcoal,
  },
  roleBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: airbnbColors.lightGray,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  roleBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  rolePct: {
    width: 42,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    color: airbnbColors.darkGray,
  },
  emptyText: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    textAlign: 'center',
    marginTop: 8,
  },

  // Menu Sections
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 12,
    paddingHorizontal: 4,
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