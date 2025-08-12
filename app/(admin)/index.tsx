import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Text from '../../components/ui/Typography';
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
        router.push(fixedRoute);
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
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Stats data state
  const [stats, setStats] = useState([
    { number: 2, label: 'Roles', icon: 'key' },
    { number: 5, label: 'Users', icon: 'people' },
    { number: 12, label: 'Courses', icon: 'book' }
  ]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get users
      const users = await appwriteService.getAllUsers();
      const totalUsers = users.length;
      
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

      // Update the stat cards with real data
      setStats([
        { number: totalRoles, label: 'Roles', icon: 'key' },
        { number: totalUsers, label: 'Users', icon: 'people' },
        { number: totalCourses, label: 'Courses', icon: 'book' }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Display loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Text style={styles.loadingText}>Loading admin center...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title="Admin Control Center"
        rightComponent={
          <TouchableOpacity 
            onPress={handleLogout}
            style={styles.logoutButton}
            accessible={true}
            accessibilityLabel="Logout"
            accessibilityRole="button"
          >
            <Ionicons name="log-out" size={20} color={airbnbColors.error} />
          </TouchableOpacity>
        }
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
                  Hello, {user?.name || 'Admin'}. Here's what's happening with your platform today.
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

          {/* Stats Section */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.statsSection}
          >
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: airbnbColors.primary + '15' }]}>
                    <Ionicons name={stat.icon} size={20} color={airbnbColors.primary} />
                  </View>
                  <Text style={styles.statNumber}>{stat.number}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
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
              />
              
              <AdminFeatureCard
                title="Course Management"
                description="Create, edit, and organize courses"
                icon="book"
                route="/(admin)/(courses)/index"
                color={airbnbColors.warning}
              />
              
              <AdminFeatureCard
                title="School Management"
                description="Manage school partnerships and settings"
                icon="school"
                route="/(admin)/(schools)/index"
                color={airbnbColors.success}
              />
            </View>
          </Animated.View>

          {/* Content & Assessment Section */}
          <Animated.View 
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Content & Assessment</Text>
            <View style={styles.menuCard}>
              <AdminFeatureCard
                title="Quiz Management"
                description="Create and manage language assessments"
                icon="help-circle"
                route="/(admin)/(quiz)/index"
                color="#EC4899"
              />
              
              <AdminFeatureCard
                title="Class Management"
                description="Schedule and monitor live classes"
                icon="videocam"
                route="/(admin)/(classes)/index"
                color="#8B5CF6"
              />
            </View>
          </Animated.View>

          {/* Analytics Section */}
          <Animated.View 
            entering={FadeInUp.delay(500).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Analytics & Insights</Text>
            <View style={styles.menuCard}>
              <AdminFeatureCard
                title="System Analytics"
                description="View comprehensive platform insights"
                icon="analytics"
                route="/(admin)/(analytics)/index"
                color="#0EA5E9"
              />
              
              <AdminFeatureCard
                title="Dashboard Analytics"
                description="Real-time metrics and performance data"
                icon="bar-chart"
                route="/(admin)/(dashboard)/index"
                color="#10B981"
              />
            </View>
          </Animated.View>

          {/* Recent Activity */}
          <Animated.View 
            entering={FadeInUp.delay(600).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <View style={styles.activityItem}>
                <View style={[styles.activityDot, { backgroundColor: airbnbColors.success }]} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>New user registered</Text>
                  <Text style={styles.activityTime}>Today, 2:30 PM</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={[styles.activityDot, { backgroundColor: airbnbColors.warning }]} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>Course "React Basics" published</Text>
                  <Text style={styles.activityTime}>Yesterday, 10:15 AM</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={[styles.activityDot, { backgroundColor: airbnbColors.primary }]} />
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>New quiz created</Text>
                  <Text style={styles.activityTime}>2 days ago, 4:45 PM</Text>
                </View>
              </View>
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

  // Activity Section
  activityCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    fontWeight: '500',
    color: airbnbColors.charcoal,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
});