import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../../components/ui/theme';

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
  
  // Automatically redirect to course library when this page loads
  useEffect(() => {
    router.replace('/(admin)/(courses)/course-library');
  }, []);
  
  // Show a loading indicator while redirecting
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading course library...</Text>
      </View>
    </SafeAreaView>
  );
  
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.primary.main,
    fontSize: typography.fontSizes.md,
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