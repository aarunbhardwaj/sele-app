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

const CourseFeatureCard = ({ title, description, icon, route, color = colors.primary.main }: FeatureCardProps) => {
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

export default function CoursesIndexPage() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Course Management" 
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
          <Text style={styles.welcomeSubtitle}>Create, edit, and manage all course content</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Course Features</Text>
          
          <CourseFeatureCard
            title="Course Library"
            description="View and manage all available courses"
            icon="library-outline"
            route="/(admin)/(courses)/course-library"
          />
          
          <CourseFeatureCard
            title="Course Creator"
            description="Create new courses from scratch"
            icon="create-outline"
            route="/(admin)/(courses)/course-creator"
          />
          
          <CourseFeatureCard
            title="Edit Course"
            description="Modify existing course content"
            icon="pencil-outline"
            route="/(admin)/(courses)/edit-course"
          />
          
          <CourseFeatureCard
            title="Upload Content"
            description="Add videos, audio, and documents to courses"
            icon="cloud-upload-outline"
            route="/(admin)/(courses)/upload-content"
          />
          
          <CourseFeatureCard
            title="Curriculum Designer"
            description="Create and organize course structure"
            icon="git-branch-outline"
            route="/(admin)/(courses)/set-curriculum"
          />
          
          <CourseFeatureCard
            title="Category Management"
            description="Organize courses into categories"
            icon="folder-outline"
            route="/(admin)/(courses)/set-categories"
          />
          
          <CourseFeatureCard
            title="Instructor Assignment"
            description="Assign instructors to courses"
            icon="person-outline"
            route="/(admin)/(courses)/set-instructor"
          />
          
          <CourseFeatureCard
            title="Lesson Management"
            description="Create and edit individual lessons"
            icon="document-text-outline"
            route="/(admin)/(courses)/lessons"
          />
          
          <CourseFeatureCard
            title="Exercise Creator"
            description="Create interactive language exercises"
            icon="fitness-outline"
            route="/(admin)/(courses)/exercises"
          />
          
          <CourseFeatureCard
            title="Course Publishing"
            description="Publish or unpublish courses"
            icon="globe-outline"
            route="/(admin)/(courses)/publish-course"
          />
          
          <CourseFeatureCard
            title="Course Analytics"
            description="View detailed course performance metrics"
            icon="stats-chart-outline"
            route="/(admin)/(courses)/course-analytics"
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