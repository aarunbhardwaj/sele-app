import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../../components/ui/theme';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: any;
  route: string;
  color?: string;
}

const UserFeatureCard = ({ title, description, icon, route, color = colors.primary.main }: FeatureCardProps) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={styles.featureCard} 
      onPress={() => router.push(route as any)}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.neutral.gray} />
    </TouchableOpacity>
  );
};

export default function UsersIndexPage() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="User Management" 
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
        <View style={styles.welcome}>
          <Text style={styles.welcomeSubtitle}>Manage all users, roles, and permissions</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>User Features</Text>
          
          <UserFeatureCard
            title="User Directory"
            description="View and manage all users"
            icon="people-outline"
            route="/(admin)/(users)/directory"
          />
          
          <UserFeatureCard
            title="User Profiles"
            description="View and edit detailed user profiles"
            icon="person-outline"
            route="/(admin)/(users)/profiles"
          />
          
          <UserFeatureCard
            title="Role Management"
            description="Assign and manage user roles"
            icon="shield-outline"
            route="/(admin)/(users)/roles"
          />
          
          <UserFeatureCard
            title="Access Control"
            description="Configure feature access permissions"
            icon="lock-closed-outline"
            route="/(admin)/(users)/access-control"
          />
          
          <UserFeatureCard
            title="Registration Approval"
            description="Review and approve new user registrations"
            icon="checkmark-circle-outline"
            route="/(admin)/(users)/registration"
          />
          
          <UserFeatureCard
            title="Account Status"
            description="Manage active, suspended, and deleted accounts"
            icon="toggle-outline"
            route="/(admin)/(users)/status"
          />
          
          <UserFeatureCard
            title="Bulk Operations"
            description="Perform actions on multiple users"
            icon="list-outline"
            route="/(admin)/(users)/bulk-ops"
          />
          
          <UserFeatureCard
            title="Activity Logs"
            description="View user login and activity history"
            icon="analytics-outline"
            route="/(admin)/(users)/activity"
          />
          
          <UserFeatureCard
            title="User Import/Export"
            description="Import or export user data"
            icon="download-outline"
            route="/(admin)/(users)/import-export"
          />
          
          <UserFeatureCard
            title="User Analytics"
            description="View detailed user engagement metrics"
            icon="stats-chart-outline"
            route="/(admin)/(users)/analytics"
            color={colors.secondary.main}
          />
        </View>
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
    backgroundColor: colors.neutral.background,
  },
  welcome: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  welcomeSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
    marginTop: spacing.xs,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold as any,
    marginBottom: spacing.md,
    marginTop: spacing.md,
    color: colors.neutral.darkGray,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.neutral.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
  },
});