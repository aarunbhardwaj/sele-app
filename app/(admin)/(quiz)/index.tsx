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

const QuizFeatureCard = ({ title, description, icon, route, color = colors.primary.main }: FeatureCardProps) => {
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

export default function QuizIndexPage() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Quiz Management" 
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
          <Text style={styles.welcomeSubtitle}>Create, edit, and analyze language assessment quizzes</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Quiz Features</Text>
          
          <QuizFeatureCard
            title="Quiz Creator"
            description="Create new language assessment quizzes"
            icon="create-outline"
            route="/(admin)/(quiz)/quiz-creator"
          />
          
          <QuizFeatureCard
            title="Question Bank"
            description="Manage your library of quiz questions"
            icon="help-circle-outline"
            route="/(admin)/(quiz)/question-bank"
          />
          
          <QuizFeatureCard
            title="Quiz Categories"
            description="Organize quizzes by language levels and topics"
            icon="folder-outline"
            route="/(admin)/(quiz)/categories"
          />
          
          <QuizFeatureCard
            title="Difficulty Settings"
            description="Configure quiz difficulty levels"
            icon="options-outline"
            route="/(admin)/(quiz)/difficulty"
          />
          
          <QuizFeatureCard
            title="Auto-grading"
            description="Configure automated grading settings"
            icon="checkmark-done-outline"
            route="/(admin)/(quiz)/grading"
          />
          
          <QuizFeatureCard
            title="Quiz Analytics"
            description="View quiz completion and success rates"
            icon="pie-chart-outline"
            route="/(admin)/(quiz)/analytics"
          />
          
          <QuizFeatureCard
            title="Performance Reports"
            description="Generate reports on student performance"
            icon="document-text-outline"
            route="/(admin)/(quiz)/reports"
          />
          
          <QuizFeatureCard
            title="Quiz Templates"
            description="Create and manage reusable quiz templates"
            icon="copy-outline"
            route="/(admin)/(quiz)/templates"
          />
          
          <QuizFeatureCard
            title="Language Exercises"
            description="Create interactive language exercises"
            icon="chatbubble-outline"
            route="/(admin)/(quiz)/exercises"
          />
          
          <QuizFeatureCard
            title="Speaking Assessments"
            description="Configure pronunciation and speaking tests"
            icon="mic-outline"
            route="/(admin)/(quiz)/speaking"
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