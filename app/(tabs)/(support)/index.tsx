import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../../../components/ui/Card';
import Text from '../../../components/ui/Typography';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I enroll in a course?',
    answer: 'To enroll in a course, browse the courses section, select the course you\'re interested in, and tap the "Enroll" button. Free courses will be immediately available, while paid courses require payment completion.'
  },
  {
    id: '2',
    question: 'How can I track my learning progress?',
    answer: 'Your progress is automatically tracked as you complete lessons and quizzes. Visit the Learning tab to see your overall progress, completed courses, and learning statistics.'
  },
  {
    id: '3',
    question: 'Can I download content for offline learning?',
    answer: 'Currently, offline downloads are not supported. However, we\'re working on this feature for future releases. You\'ll need an internet connection to access course materials.'
  },
  {
    id: '4',
    question: 'How do I join live classes?',
    answer: 'Live classes appear in your Classes tab when scheduled. Join by tapping the "Join Class" button at the scheduled time. Make sure you have a stable internet connection and camera/microphone permissions enabled.'
  },
  {
    id: '5',
    question: 'What should I do if I forgot my password?',
    answer: 'On the login screen, tap "Forgot Password?" and enter your email address. You\'ll receive a password reset link via email. Follow the instructions in the email to create a new password.'
  },
  {
    id: '6',
    question: 'How do I contact my instructor?',
    answer: 'You can contact instructors through the course discussion section or during live classes. Some instructors also provide direct contact information in their course materials.'
  }
];

export default function HelpSupportScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const openEmail = () => {
    Linking.openURL('mailto:support@example.com?subject=App Support Request');
  };

  const openWebsite = () => {
    Linking.openURL('https://example.com/help');
  };

  const openChat = () => {
    // In a real app, this would open a chat widget or navigate to chat screen
    alert('Chat support coming soon!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1" style={styles.title}>Help & Support</Text>
        <Text variant="body1" style={styles.subtitle}>
          Find answers to common questions or get in touch with our support team
        </Text>
      </View>

      {/* Quick Actions */}
      <Card variant="elevated" style={styles.quickActionsCard}>
        <Text variant="h3" style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={openEmail}>
          <Ionicons name="mail" size={24} color="#007bff" />
          <View style={styles.actionContent}>
            <Text variant="h5" style={styles.actionTitle}>Email Support</Text>
            <Text variant="body2" style={styles.actionDescription}>
              Send us an email and we'll get back to you within 24 hours
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6c757d" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={openChat}>
          <Ionicons name="chatbubbles" size={24} color="#28a745" />
          <View style={styles.actionContent}>
            <Text variant="h5" style={styles.actionTitle}>Live Chat</Text>
            <Text variant="body2" style={styles.actionDescription}>
              Chat with our support team in real-time
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6c757d" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={openWebsite}>
          <Ionicons name="globe" size={24} color="#6f42c1" />
          <View style={styles.actionContent}>
            <Text variant="h5" style={styles.actionTitle}>Help Center</Text>
            <Text variant="body2" style={styles.actionDescription}>
              Visit our comprehensive online help center
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6c757d" />
        </TouchableOpacity>
      </Card>

      {/* FAQ Section */}
      <Card variant="elevated" style={styles.faqCard}>
        <Text variant="h3" style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {faqData.map((faq) => (
          <View key={faq.id} style={styles.faqItem}>
            <TouchableOpacity 
              style={styles.faqQuestion} 
              onPress={() => toggleFAQ(faq.id)}
            >
              <Text variant="h5" style={styles.questionText}>{faq.question}</Text>
              <Ionicons 
                name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6c757d" 
              />
            </TouchableOpacity>
            
            {expandedFAQ === faq.id && (
              <View style={styles.faqAnswer}>
                <Text variant="body1" style={styles.answerText}>{faq.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </Card>

      {/* Contact Info */}
      <Card variant="elevated" style={styles.contactCard}>
        <Text variant="h3" style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.contactItem}>
          <Ionicons name="mail" size={20} color="#007bff" />
          <Text variant="body1" style={styles.contactText}>support@example.com</Text>
        </View>
        
        <View style={styles.contactItem}>
          <Ionicons name="call" size={20} color="#28a745" />
          <Text variant="body1" style={styles.contactText}>+1 (555) 123-4567</Text>
        </View>
        
        <View style={styles.contactItem}>
          <Ionicons name="time" size={20} color="#fd7e14" />
          <Text variant="body1" style={styles.contactText}>Mon-Fri, 9AM-5PM EST</Text>
        </View>
      </Card>

      <View style={styles.footer}>
        <Text variant="caption" style={styles.footerText}>
          App Version 1.0.0 • Last Updated: March 2024
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
  title: {
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6c757d',
    lineHeight: 22,
  },
  sectionTitle: {
    color: '#212529',
    marginBottom: 16,
  },
  quickActionsCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    color: '#212529',
    marginBottom: 4,
  },
  actionDescription: {
    color: '#6c757d',
    lineHeight: 18,
  },
  faqCard: {
    margin: 16,
    padding: 20,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  questionText: {
    flex: 1,
    color: '#212529',
    marginRight: 8,
  },
  faqAnswer: {
    paddingBottom: 12,
    paddingLeft: 4,
  },
  answerText: {
    color: '#495057',
    lineHeight: 22,
  },
  contactCard: {
    margin: 16,
    padding: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 12,
    color: '#495057',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#adb5bd',
    textAlign: 'center',
  },
});