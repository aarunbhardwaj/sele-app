import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';

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

interface FeatureCardProps {
  title: string;
  description: string;
  icon: any;
  route: string;
  color?: string;
}

const AnalyticsFeatureCard = ({ title, description, icon, route, color = airbnbColors.primary }: FeatureCardProps) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={styles.featureCard} 
      onPress={() => router.push(route as any)}
    >
      <View style={styles.featureCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={24} color={color} />
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

export default function AnalyticsIndexPage() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title="System Analytics"
        rightComponent={
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={() => {}}
          >
            <Ionicons name="refresh" size={20} color={airbnbColors.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <Animated.View 
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.headerSection}
          >
            <View style={styles.headerCard}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Analytics Dashboard</Text>
                <Text style={styles.headerSubtitle}>
                  View comprehensive data and insights about your platform performance
                </Text>
              </View>
              <View style={styles.analyticsIconContainer}>
                <Ionicons name="analytics" size={24} color={airbnbColors.primary} />
              </View>
            </View>
          </Animated.View>

          {/* User Analytics Section */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>User Analytics</Text>
            <View style={styles.menuCard}>
              <AnalyticsFeatureCard
                title="User Engagement"
                description="View detailed user engagement metrics"
                icon="people"
                route="/(admin)/(analytics)/user-engagement"
                color={airbnbColors.secondary}
              />
              
              <AnalyticsFeatureCard
                title="Retention Analysis"
                description="Analyze user retention and churn rates"
                icon="return-down-back"
                route="/(admin)/(analytics)/retention"
                color={airbnbColors.warning}
              />
              
              <AnalyticsFeatureCard
                title="System Usage"
                description="Monitor platform usage statistics"
                icon="pulse"
                route="/(admin)/(analytics)/system-usage"
                color={airbnbColors.success}
              />
            </View>
          </Animated.View>

          {/* Content Analytics Section */}
          <Animated.View 
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Content Analytics</Text>
            <View style={styles.menuCard}>
              <AnalyticsFeatureCard
                title="Course Performance"
                description="Analyze how courses are performing"
                icon="book"
                route="/(admin)/(analytics)/course-performance"
                color="#8B5CF6"
              />
              
              <AnalyticsFeatureCard
                title="Learning Outcomes"
                description="View student learning progress and outcomes"
                icon="trending-up"
                route="/(admin)/(analytics)/learning-outcomes"
                color="#10B981"
              />
              
              <AnalyticsFeatureCard
                title="A/B Testing Results"
                description="View results of A/B testing experiments"
                icon="git-compare"
                route="/(admin)/(analytics)/ab-testing"
                color="#F59E0B"
              />
            </View>
          </Animated.View>

          {/* Financial Analytics Section */}
          <Animated.View 
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Financial Analytics</Text>
            <View style={styles.menuCard}>
              <AnalyticsFeatureCard
                title="Revenue & Financials"
                description="Track revenue and financial metrics"
                icon="cash"
                route="/(admin)/(analytics)/revenue"
                color="#059669"
              />
            </View>
          </Animated.View>

          {/* Advanced Analytics Section */}
          <Animated.View 
            entering={FadeInUp.delay(500).duration(600)}
            style={styles.sectionContainer}
          >
            <Text style={styles.sectionTitle}>Advanced Analytics</Text>
            <View style={styles.menuCard}>
              <AnalyticsFeatureCard
                title="Predictive Analytics"
                description="View AI-powered predictions and forecasts"
                icon="analytics"
                route="/(admin)/(analytics)/predictive"
                color="#6366F1"
              />
              
              <AnalyticsFeatureCard
                title="Custom Reports"
                description="Generate custom analytics reports"
                icon="document-text"
                route="/(admin)/(analytics)/custom-reports"
                color="#EC4899"
              />
              
              <AnalyticsFeatureCard
                title="Export Data"
                description="Export analytics data for external analysis"
                icon="download"
                route="/(admin)/(analytics)/export"
                color="#0EA5E9"
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
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: airbnbColors.lightGray,
  },

  // Header Section
  headerSection: {
    marginBottom: 24,
  },
  headerCard: {
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: airbnbColors.darkGray,
    lineHeight: 22,
  },
  analyticsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: airbnbColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
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