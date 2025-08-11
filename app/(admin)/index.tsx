import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../components/ui/theme';
import PreAuthHeader from '../../components/ui2/pre-auth-header';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

// Define the feature card interface
interface AdminFeatureCardProps {
  title: string;
  description: string;
  icon: any;
  route: string;
  color?: string;
  badge?: number | string;
}

// Feature Card Component
const AdminFeatureCard = ({ 
  title, 
  description, 
  icon, 
  route, 
  color = colors.primary.main,
  badge
}: AdminFeatureCardProps) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={styles.featureCard} 
      onPress={() => {
        // Fix route pattern: Remove trailing '/index' and use proper format
        const fixedRoute = route.endsWith('/index') 
          ? route.substring(0, route.length - 6) 
          : route;
        router.push(fixedRoute);
      }}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
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
      <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
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
    { number: 2, label: 'Roles' },
    { number: 5, label: 'Users' },
    { number: 12, label: 'Courses' }
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Admin Navigation Dashboard
  const renderAdminNavigation = () => (
    <>
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Admin Control Center</Text>
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
      
      <Text style={styles.sectionTitle}>Main Features</Text>
      
      {/* Courses */}
      <AdminFeatureCard
        title="Course Management"
        description="Create, edit, and manage courses"
        icon="book-outline"
        route="/(admin)/(courses)/index"
        color="#8B5CF6"
      />
      
      {/* Users */}
      <AdminFeatureCard
        title="User Management"
        description="Manage accounts, roles, and permissions"
        icon="people-outline"
        route="/(admin)/(users)/index"
        color="#F59E0B"
      />
      
      {/* Quiz */}
      <AdminFeatureCard
        title="Quiz Management"
        description="Create and manage language assessments"
        icon="help-circle-outline"
        route="/(admin)/(quiz)/index"
        color="#EC4899"
      />
      
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
            <Text style={styles.activityText}>Course "Beginner Spanish" published</Text>
            <Text style={styles.activityTime}>Yesterday, 10:15 AM</Text>
          </View>
        </View>
      </View>
    </>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ color: '#6B7280', marginTop: 16 }}>Loading admin center...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Admin Control Center"
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => {}}
            >
              <Ionicons name="notifications-outline" size={24} color="#333333" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleLogout}
              style={styles.logoutButton}
              accessible={true}
              accessibilityLabel="Logout"
              accessibilityRole="button"
            >
              <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView style={styles.container}>
        {renderAdminNavigation()}
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
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary.main,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
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
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.neutral.gray,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: colors.neutral.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
});