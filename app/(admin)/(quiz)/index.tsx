import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography } from '../../../components/ui/theme';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';

const { width } = Dimensions.get('window');

// Airbnb color palette - keeping original colors
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#FF3347',
  primaryLight: '#FF8589',
  secondary: '#00A699',
  secondaryDark: '#008F85',
  secondaryLight: '#57C1BA',
  neutral: colors.neutral,
  accent: colors.accent,
  status: colors.status
};

// Update all the colors in the app to use Airbnb colors
const appColors = {
  ...colors,
  primary: {
    light: airbnbColors.primaryLight,
    main: airbnbColors.primary,
    dark: airbnbColors.primaryDark,
  },
  secondary: {
    ...colors.secondary,
  }
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: any;
  route: string;
  color?: string;
  gradient?: string[];
  featured?: boolean;
}

const QuizFeatureCard = ({ title, description, icon, route, color = airbnbColors.primary, gradient, featured = false }: FeatureCardProps) => {
  const router = useRouter();
  
  const cardContent = (
    <View style={[styles.featureCard, featured && styles.featuredCard]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        {featured && (
          <View style={[styles.featuredBadge, { backgroundColor: color }]}>
            <Text style={styles.featuredText}>Popular</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.actionText, { color }]}>Get started</Text>
        <Ionicons name="arrow-forward" size={16} color={color} />
      </View>
    </View>
  );

  return (
    <TouchableOpacity 
      style={[styles.cardWrapper, featured && styles.featuredWrapper]}
      onPress={() => router.push(route as any)}
      activeOpacity={0.95}
    >
      {cardContent}
    </TouchableOpacity>
  );
};

export default function QuizIndexPage() {
  const router = useRouter();
  
  const primaryFeatures = [
    {
      title: "Quiz Creator",
      description: "Create new language assessment quizzes with advanced customization",
      icon: "create-outline",
      route: "/(admin)/(quiz)/quiz-creator",
      color: airbnbColors.primary,
      featured: true
    },
    {
      title: "Quiz Library",
      description: "View, edit, and organize your quiz collection",
      icon: "library-outline",
      route: "/(admin)/(quiz)/quiz-list",
      color: airbnbColors.secondary,
      featured: true
    },
    {
      title: "Quiz Attempts",
      description: "Review and analyze student quiz submission attempts",
      icon: "timer-outline",
      route: "/(admin)/(quiz)/quiz-attempts",
      color: airbnbColors.primaryLight,
      featured: true
    }
  ];
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Quiz Management" 
        rightComponent={
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {}}
          >
            <Ionicons name="notifications-outline" size={24} color={airbnbColors.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Modern Hero Section - White Card Design (no gradient background) */}
        <View style={styles.heroSection}>
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.heroIconContainer}>
                <Ionicons name="help-circle" size={32} color={airbnbColors.primary} />
              </View>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Quiz Management Hub</Text>
                <Text style={styles.heroSubtitle}>
                  Create, manage and review language assessment quizzes
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.heroButton}
              onPress={() => router.push('/(admin)/(quiz)/quiz-creator')}
            >
              <Ionicons name="add-circle" size={20} color={colors.neutral.white} />
              <Text style={styles.heroButtonText}>Create New Quiz</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          {/* Primary Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quiz Management</Text>
            <Text style={styles.sectionSubtitle}>
              All the tools you need to create and manage quizzes
            </Text>
            <View style={styles.primaryGrid}>
              {primaryFeatures.map((feature, index) => (
                <QuizFeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  route={feature.route}
                  color={feature.color}
                  featured={feature.featured}
                />
              ))}
            </View>
          </View>
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
    backgroundColor: '#FAFBFC',
  },
  
  // Modern Hero Section - White card without background gradient
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: airbnbColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.neutral.darkGray,
    lineHeight: 22,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: airbnbColors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
    marginLeft: spacing.sm,
  },

  // Content Container
  contentContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },

  // Sections
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.neutral.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.darkGray,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },

  // Grid Layouts
  primaryGrid: {
    gap: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },

  // Card Styles
  cardWrapper: {
    width: '100%',
    marginBottom: spacing.md,
  },
  featuredWrapper: {
    width: '100%',
  },
  featureCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    minHeight: 140,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featuredCard: {
    minHeight: 160,
    borderWidth: 2,
    borderColor: airbnbColors.primary + '20',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.neutral.white,
  },
  cardContent: {
    flex: 1,
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.neutral.text,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  
  // Header Elements
  notificationButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: airbnbColors.primary + '15',
  },
});