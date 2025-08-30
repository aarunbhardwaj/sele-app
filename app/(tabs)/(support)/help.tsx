import React from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Card from '../../../components/ui/Card';
import Text from '../../../components/ui/Typography';

interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  summary: string;
}

const helpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using the app',
    icon: 'play-circle',
    articles: [
      {
        id: 'account-setup',
        title: 'Setting Up Your Account',
        summary: 'How to create and configure your learning profile'
      },
      {
        id: 'first-course',
        title: 'Taking Your First Course',
        summary: 'A step-by-step guide to enrolling and starting your learning journey'
      },
      {
        id: 'navigation',
        title: 'Navigating the App',
        summary: 'Understanding the main sections and features'
      }
    ]
  },
  {
    id: 'courses',
    title: 'Courses & Learning',
    description: 'Everything about courses, lessons, and progress',
    icon: 'school',
    articles: [
      {
        id: 'course-enrollment',
        title: 'Enrolling in Courses',
        summary: 'How to find and enroll in courses that interest you'
      },
      {
        id: 'progress-tracking',
        title: 'Tracking Your Progress',
        summary: 'Understanding your learning progress and statistics'
      },
      {
        id: 'certificates',
        title: 'Earning Certificates',
        summary: 'How to complete courses and receive certificates'
      }
    ]
  },
  {
    id: 'quizzes',
    title: 'Quizzes & Assessments',
    description: 'Taking quizzes and understanding your results',
    icon: 'clipboard',
    articles: [
      {
        id: 'taking-quizzes',
        title: 'Taking Quizzes',
        summary: 'How to attempt quizzes and submit answers'
      },
      {
        id: 'quiz-results',
        title: 'Understanding Quiz Results',
        summary: 'How to interpret your quiz scores and feedback'
      },
      {
        id: 'retaking-quizzes',
        title: 'Retaking Quizzes',
        summary: 'When and how you can retake failed quizzes'
      }
    ]
  },
  {
    id: 'live-classes',
    title: 'Live Classes',
    description: 'Joining and participating in live sessions',
    icon: 'videocam',
    articles: [
      {
        id: 'joining-classes',
        title: 'Joining Live Classes',
        summary: 'How to join scheduled live classes and webinars'
      },
      {
        id: 'class-etiquette',
        title: 'Class Etiquette',
        summary: 'Best practices for participating in live sessions'
      },
      {
        id: 'recording-access',
        title: 'Accessing Recordings',
        summary: 'How to watch recorded classes you missed'
      }
    ]
  },
  {
    id: 'account',
    title: 'Account & Settings',
    description: 'Managing your profile and preferences',
    icon: 'settings',
    articles: [
      {
        id: 'profile-management',
        title: 'Managing Your Profile',
        summary: 'How to update your personal information and preferences'
      },
      {
        id: 'privacy-settings',
        title: 'Privacy Settings',
        summary: 'Controlling who can see your learning progress'
      },
      {
        id: 'notifications',
        title: 'Notification Settings',
        summary: 'Customizing when and how you receive notifications'
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Common issues and how to solve them',
    icon: 'build',
    articles: [
      {
        id: 'login-issues',
        title: 'Login Problems',
        summary: 'Troubleshooting login and password issues'
      },
      {
        id: 'video-playback',
        title: 'Video Playback Issues',
        summary: 'Fixing problems with course videos not playing'
      },
      {
        id: 'app-performance',
        title: 'App Performance',
        summary: 'Improving app speed and responsiveness'
      }
    ]
  }
];

export default function HelpScreen() {
  const handleCategoryPress = (categoryId: string) => {
    // Navigate to category details (would be implemented in a real app)
    console.log('Navigate to category:', categoryId);
  };

  const handleArticlePress = (categoryId: string, articleId: string) => {
    // Navigate to specific article (would be implemented in a real app)
    console.log('Navigate to article:', categoryId, articleId);
  };

  const openContactSupport = () => {
    Linking.openURL('mailto:support@example.com?subject=Help Request');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text variant="h1" style={styles.title}>Help Center</Text>
        <Text variant="body1" style={styles.subtitle}>
          Browse help articles by category or search for specific topics
        </Text>
      </View>

      {helpCategories.map((category) => (
        <Card key={category.id} variant="elevated" style={styles.categoryCard}>
          <TouchableOpacity 
            style={styles.categoryHeader}
            onPress={() => handleCategoryPress(category.id)}
          >
            <View style={styles.categoryIcon}>
              <Ionicons name={category.icon} size={24} color="#007bff" />
            </View>
            <View style={styles.categoryInfo}>
              <Text variant="h4" style={styles.categoryTitle}>{category.title}</Text>
              <Text variant="body2" style={styles.categoryDescription}>
                {category.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </TouchableOpacity>

          <View style={styles.articlesContainer}>
            {category.articles.slice(0, 3).map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleItem}
                onPress={() => handleArticlePress(category.id, article.id)}
              >
                <View style={styles.articleContent}>
                  <Text variant="h6" style={styles.articleTitle}>{article.title}</Text>
                  <Text variant="caption" style={styles.articleSummary}>
                    {article.summary}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#adb5bd" />
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      ))}

      {/* Contact Support Card */}
      <Card variant="elevated" style={styles.contactCard}>
        <View style={styles.contactHeader}>
          <Ionicons name="help-circle" size={32} color="#28a745" />
          <View style={styles.contactInfo}>
            <Text variant="h4" style={styles.contactTitle}>Still Need Help?</Text>
            <Text variant="body2" style={styles.contactDescription}>
              Can't find what you're looking for? Our support team is here to help.
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.contactButton} onPress={openContactSupport}>
          <Text variant="h6" style={styles.contactButtonText}>Contact Support</Text>
          <Ionicons name="mail" size={20} color="white" />
        </TouchableOpacity>
      </Card>

      <View style={styles.footer}>
        <Text variant="caption" style={styles.footerText}>
          Need more help? Visit our website or contact our support team directly.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6c757d',
    lineHeight: 22,
  },
  categoryCard: {
    margin: 16,
    marginTop: 8,
    padding: 0,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    color: '#212529',
    marginBottom: 4,
  },
  categoryDescription: {
    color: '#6c757d',
    lineHeight: 18,
  },
  articlesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  articleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 12,
    marginBottom: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    color: '#495057',
    marginBottom: 2,
  },
  articleSummary: {
    color: '#6c757d',
    lineHeight: 16,
  },
  contactCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#e8f5e8',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactTitle: {
    color: '#155724',
    marginBottom: 4,
  },
  contactDescription: {
    color: '#5a6c57',
    lineHeight: 18,
  },
  contactButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: 'white',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 18,
  },
});