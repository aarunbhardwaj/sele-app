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

const AnalyticsFeatureCard = ({ title, description, icon, route, color = colors.primary.main }: FeatureCardProps) => {
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

export default function AnalyticsIndexPage() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="System Analytics"
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
          <Text style={styles.welcomeSubtitle}>View comprehensive data and insights about your platform</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Analytics Features</Text>
          
          <AnalyticsFeatureCard
            title="User Engagement"
            description="View detailed user engagement metrics"
            icon="people-outline"
            route="/(admin)/(analytics)/user-engagement"
          />
          
          <AnalyticsFeatureCard
            title="Course Performance"
            description="Analyze how courses are performing"
            icon="book-outline"
            route="/(admin)/(analytics)/course-performance"
          />
          
          <AnalyticsFeatureCard
            title="Revenue & Financials"
            description="Track revenue and financial metrics"
            icon="cash-outline"
            route="/(admin)/(analytics)/revenue"
          />
          
          <AnalyticsFeatureCard
            title="Learning Outcomes"
            description="View student learning progress and outcomes"
            icon="trending-up-outline"
            route="/(admin)/(analytics)/learning-outcomes"
          />
          
          <AnalyticsFeatureCard
            title="System Usage"
            description="Monitor platform usage statistics"
            icon="pulse-outline"
            route="/(admin)/(analytics)/system-usage"
          />
          
          <AnalyticsFeatureCard
            title="A/B Testing Results"
            description="View results of A/B testing experiments"
            icon="git-compare-outline"
            route="/(admin)/(analytics)/ab-testing"
          />
          
          <AnalyticsFeatureCard
            title="Retention Analysis"
            description="Analyze user retention and churn rates"
            icon="return-down-back-outline"
            route="/(admin)/(analytics)/retention"
          />
          
          <AnalyticsFeatureCard
            title="Predictive Analytics"
            description="View AI-powered predictions and forecasts"
            icon="analytics-outline"
            route="/(admin)/(analytics)/predictive"
          />
          
          <AnalyticsFeatureCard
            title="Custom Reports"
            description="Generate custom analytics reports"
            icon="document-text-outline"
            route="/(admin)/(analytics)/custom-reports"
          />
          
          <AnalyticsFeatureCard
            title="Export Data"
            description="Export analytics data for external analysis"
            icon="download-outline"
            route="/(admin)/(analytics)/export"
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