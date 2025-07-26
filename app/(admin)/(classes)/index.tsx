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

const ClassFeatureCard = ({ title, description, icon, route, color = colors.primary.main }: FeatureCardProps) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={styles.featureCard} 
      onPress={() => {
        // Fix route pattern: Remove trailing '/index' if present
        const fixedRoute = route.endsWith('/index') 
          ? route.substring(0, route.length - 6) 
          : route;
        router.push(fixedRoute);
      }}
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

export default function ClassesIndexPage() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Class Management"
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
          <Text style={styles.welcomeSubtitle}>Schedule, monitor, and manage all live classes</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Class Features</Text>
          
          <ClassFeatureCard
            title="Class Scheduler"
            description="Schedule new live classes and sessions"
            icon="calendar-outline"
            route="/(admin)/(classes)/class-scheduler"
          />
          
          <ClassFeatureCard
            title="Create Class"
            description="Create new class templates and structures"
            icon="create-outline"
            route="/(admin)/(classes)/create-class"
          />
          
          <ClassFeatureCard
            title="Class Monitor"
            description="View active and upcoming classes"
            icon="desktop-outline"
            route="/(admin)/(classes)/class-monitor"
          />
          
          <ClassFeatureCard
            title="Publish Schedule"
            description="Make class schedules available to students"
            icon="globe-outline"
            route="/(admin)/(classes)/publish-schedule"
          />
          
          <ClassFeatureCard
            title="Recording Management"
            description="Manage recorded class sessions"
            icon="videocam-outline"
            route="/(admin)/(classes)/recording-management"
          />

          <ClassFeatureCard
            title="Instructor Assignment"
            description="Assign instructors to specific classes"
            icon="person-outline"
            route="/(admin)/(classes)/instructor-assignment"
          />
          
          <ClassFeatureCard
            title="Virtual Room Setup"
            description="Configure virtual classroom settings"
            icon="easel-outline"
            route="/(admin)/(classes)/virtual-room"
          />
          
          <ClassFeatureCard
            title="Attendance Management"
            description="Track student attendance for classes"
            icon="clipboard-outline"
            route="/(admin)/(classes)/attendance"
          />
          
          <ClassFeatureCard
            title="Class Materials"
            description="Upload and organize class materials"
            icon="document-outline"
            route="/(admin)/(classes)/materials"
          />
          
          <ClassFeatureCard
            title="Class Analytics"
            description="View detailed class performance metrics"
            icon="stats-chart-outline"
            route="/(admin)/(classes)/analytics"
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