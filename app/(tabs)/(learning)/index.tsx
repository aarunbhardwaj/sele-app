import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Header from '../../../components/ui/Header';
import { borderRadius, colors, spacing, typography } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';

// Mock data for in-progress courses
const inProgressCourses = [
  {
    id: '1',
    title: 'British Pronunciation Basics',
    progress: 45,
    lastLesson: 'Vowel Sounds',
    image: require('../../../assets/images/app-logo.png'),
    nextLessonIn: '2 days'
  },
  {
    id: '2',
    title: 'Advanced Conversational English',
    progress: 23,
    lastLesson: 'Small Talk Techniques',
    image: require('../../../assets/images/app-logo.png'),
    nextLessonIn: '3 days'
  }
];

// Mock data for upcoming lessons
const upcomingLessons = [
  {
    id: '1',
    title: 'Live: Pronunciation Workshop',
    time: 'Tomorrow, 3:00 PM',
    duration: '45 min',
    tutor: 'Sarah Johnson'
  },
  {
    id: '2',
    title: 'Group Practice: Conversation',
    time: 'Friday, 6:00 PM',
    duration: '60 min',
    tutor: 'James Smith'
  }
];

const ProgressBar = ({ progress, color = colors.primary.main }) => (
  <View style={styles.progressBarContainer}>
    <View 
      style={[styles.progressBar, { width: `${progress}%`, backgroundColor: color }]} 
    />
  </View>
);

export default function MyLearningScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('progress');
  
  const renderCourseItem = ({ item }) => (
    <Card variant="elevated" style={styles.courseCard}>
      <TouchableOpacity>
        <View style={styles.courseRow}>
          <Image 
            source={item.image} 
            style={styles.courseImage} 
            resizeMode="cover" 
          />
          <View style={styles.courseContent}>
            <Text variant="subtitle1" style={styles.courseTitle}>{item.title}</Text>
            <Text variant="caption" color={colors.neutral.darkGray} style={styles.lessonText}>Last: {item.lastLesson}</Text>
            <ProgressBar progress={item.progress} />
            <View style={styles.courseFooter}>
              <Text variant="caption" color={colors.neutral.gray}>{item.progress}% complete</Text>
              <View style={styles.nextLessonContainer}>
                <Ionicons name="time-outline" size={12} color={colors.neutral.darkGray} />
                <Text variant="caption" color={colors.neutral.darkGray} style={styles.nextLessonText}>
                  Next: {item.nextLessonIn}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
  
  const renderLessonItem = ({ item }) => (
    <Card variant="elevated" style={styles.lessonCard}>
      <View style={styles.lessonContent}>
        <View style={styles.lessonInfo}>
          <Text variant="subtitle1" style={styles.lessonTitle}>{item.title}</Text>
          <Text variant="caption" color={colors.neutral.darkGray}>Tutor: {item.tutor}</Text>
          <View style={styles.lessonTimeContainer}>
            <Ionicons name="time-outline" size={12} color={colors.neutral.darkGray} />
            <Text variant="caption" color={colors.neutral.darkGray} style={styles.lessonTimeText}>
              {item.time} • {item.duration}
            </Text>
          </View>
        </View>
        <Button
          title="Join"
          variant="primary"
          size="small"
          style={styles.joinButton}
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="My Learning" 
        showLogo={true}
        rightIcon={<Ionicons name="settings-outline" size={22} color={colors.neutral.darkGray} />}
        onRightIconPress={() => router.push('/(tabs)/(profile)')}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Daily Goal */}
          <Card style={styles.goalCard}>
            <View style={styles.goalContent}>
              <View style={styles.goalInfo}>
                <Text variant="caption" color={colors.neutral.lightGray} style={styles.goalLabel}>DAILY GOAL</Text>
                <Text variant="h5" color={colors.neutral.white} style={styles.goalText}>25 minutes today</Text>
                <ProgressBar progress={70} color={colors.neutral.white} />
              </View>
              <View style={styles.goalPercentage}>
                <Text variant="subtitle1" color={colors.primary.main} style={styles.goalPercentageText}>70%</Text>
              </View>
            </View>
          </Card>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
              onPress={() => setActiveTab('progress')}
            >
              <Text 
                variant="subtitle2" 
                color={activeTab === 'progress' ? colors.primary.main : colors.neutral.darkGray}
              >
                In Progress
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
              onPress={() => setActiveTab('upcoming')}
            >
              <Text 
                variant="subtitle2" 
                color={activeTab === 'upcoming' ? colors.primary.main : colors.neutral.darkGray}
              >
                Upcoming Lessons
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
              onPress={() => setActiveTab('completed')}
            >
              <Text 
                variant="subtitle2" 
                color={activeTab === 'completed' ? colors.primary.main : colors.neutral.darkGray}
              >
                Completed
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'progress' && (
            <FlatList
              data={inProgressCourses}
              renderItem={renderCourseItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          )}
          
          {activeTab === 'upcoming' && (
            <FlatList
              data={upcomingLessons}
              renderItem={renderLessonItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          )}
          
          {activeTab === 'completed' && (
            <View style={styles.emptyState}>
              <Ionicons name="trophy" size={64} color={colors.neutral.lightGray} />
              <Text variant="body1" color={colors.neutral.gray} style={styles.emptyStateText}>
                You haven't completed any courses yet.
              </Text>
              <Button
                title="Browse Courses"
                variant="primary"
                onPress={() => router.push('/(tabs)/(courses)/catalog')}
                style={styles.emptyStateButton}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  goalCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.primary.main,
    padding: spacing.md,
  },
  goalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  goalLabel: {
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  goalText: {
    marginBottom: spacing.sm,
  },
  goalPercentage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalPercentageText: {
    fontWeight: typography.fontWeights.bold,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.full,
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.full,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.md,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary.main,
  },
  listContent: {
    paddingTop: spacing.sm,
  },
  courseCard: {
    marginBottom: spacing.md,
  },
  courseRow: {
    flexDirection: 'row',
  },
  courseImage: {
    width: 96,
    height: 96,
  },
  courseContent: {
    flex: 1,
    padding: spacing.md,
  },
  courseTitle: {
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  lessonText: {
    marginBottom: spacing.sm,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  nextLessonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextLessonText: {
    marginLeft: spacing.xs,
  },
  lessonCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  lessonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  lessonTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  lessonTimeText: {
    marginLeft: spacing.xs,
  },
  joinButton: {
    paddingHorizontal: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  emptyStateButton: {
    marginTop: spacing.md,
  },
});