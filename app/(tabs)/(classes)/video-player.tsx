import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Card from '../../../components/ui/Card';
import Typography from '../../../components/ui/Typography';
import VideoPlayer from '../../../components/ui/VideoPlayer';
import { useAuth } from '../../../services/AuthContext';
import { useLearningProgress } from '../../../services/LearningProgressContext';
import { Lesson, Course } from '../../../lib/types';
import { showSuccess, showError } from '../../../lib/toast';

// Mock data - in a real app, this would come from your API
const mockLesson: Lesson = {
  $id: 'lesson-1',
  courseId: 'course-1',
  title: 'Introduction to React Native',
  description: 'Learn the basics of React Native development',
  content: 'This lesson covers the fundamentals of React Native...',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  duration: 1200, // 20 minutes
  order: 1,
  isPreview: false,
  objectives: [
    'Understand React Native components',
    'Learn about state management',
    'Build your first mobile app'
  ]
};

const mockCourse: Course = {
  $id: 'course-1',
  title: 'React Native Masterclass',
  description: 'Complete guide to React Native development',
  level: 'intermediate',
  category: 'Mobile Development',
  tags: ['react-native', 'mobile', 'javascript'],
  duration: 7200, // 2 hours total
  language: 'en',
  instructorId: 'instructor-1',
  instructorName: 'John Doe',
  isPublished: true,
  isFree: false,
  price: 99.99,
  currency: 'USD'
};

export default function VideoPlayerScreen() {
  const { lessonId, courseId } = useLocalSearchParams<{ lessonId: string; courseId: string }>();
  const { user } = useAuth();
  const { markLessonStarted, updateLessonProgress, markLessonCompleted } = useLearningProgress();
  
  const [lesson] = useState<Lesson>(mockLesson);
  const [course] = useState<Course>(mockCourse);
  const [isCompleted, setIsCompleted] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (user && lessonId) {
      // Mark lesson as started when component mounts
      markLessonStarted(lessonId, courseId);
    }
  }, [user, lessonId, courseId]);

  const handleProgressUpdate = (progress: number) => {
    if (lessonId) {
      updateLessonProgress(lessonId, progress);
    }
  };

  const handleVideoComplete = () => {
    if (lessonId && !isCompleted) {
      setIsCompleted(true);
      markLessonCompleted(lessonId);
      showSuccess('Lesson completed! Great job!');
    }
  };

  const handleNextLesson = () => {
    // In a real app, this would navigate to the next lesson
    Alert.alert(
      'Next Lesson',
      'Navigate to the next lesson in the course?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => {
          router.push(`/video-player?lessonId=lesson-2&courseId=${courseId}`);
        }}
      ]
    );
  };

  const handleTakeQuiz = () => {
    // Navigate to quiz for this lesson
    router.push(`/(tabs)/(quiz)?lessonId=${lessonId}&courseId=${courseId}`);
  };

  const toggleNotes = () => {
    setShowNotes(!showNotes);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Typography variant="h6" style={styles.courseTitle}>{course.title}</Typography>
          <Typography variant="h3" style={styles.lessonTitle}>{lesson.title}</Typography>
        </View>
      </View>

      {/* Video Player */}
      <Card variant="elevated" style={styles.videoCard}>
        <VideoPlayer
          uri={lesson.videoUrl || ''}
          lessonId={lessonId}
          courseId={courseId}
          onProgressUpdate={handleProgressUpdate}
          onComplete={handleVideoComplete}
          autoPlay={false}
          showControls={true}
        />
      </Card>

      {/* Lesson Info */}
      <Card variant="elevated" style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={styles.infoLeft}>
            <Typography variant="h4" style={styles.infoTitle}>Lesson Overview</Typography>
            <Typography variant="body2" style={styles.infoDuration}>
              Duration: {Math.floor(lesson.duration / 60)} minutes
            </Typography>
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#28a745" />
              <Typography variant="caption" style={styles.completedText}>Completed</Typography>
            </View>
          )}
        </View>

        <Typography variant="body1" style={styles.description}>
          {lesson.description}
        </Typography>

        {lesson.objectives && lesson.objectives.length > 0 && (
          <View style={styles.objectivesSection}>
            <Typography variant="h5" style={styles.objectivesTitle}>Learning Objectives</Typography>
            {lesson.objectives.map((objective, index) => (
              <View key={index} style={styles.objectiveItem}>
                <Ionicons name="checkmark" size={16} color="#28a745" />
                <Typography variant="body2" style={styles.objectiveText}>
                  {objective}
                </Typography>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Actions */}
      <Card variant="elevated" style={styles.actionsCard}>
        <Typography variant="h4" style={styles.actionsTitle}>Lesson Actions</Typography>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={toggleNotes}>
            <Ionicons name="document-text" size={24} color="#007bff" />
            <Typography variant="h6" style={styles.actionButtonText}>Notes</Typography>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleTakeQuiz}>
            <Ionicons name="help-circle" size={24} color="#6f42c1" />
            <Typography variant="h6" style={styles.actionButtonText}>Take Quiz</Typography>
          </TouchableOpacity>

          {isCompleted && (
            <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleNextLesson}>
              <Ionicons name="play-forward" size={24} color="white" />
              <Typography variant="h6" style={[styles.actionButtonText, { color: 'white' }]}>Next Lesson</Typography>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes Section */}
        {showNotes && (
          <View style={styles.notesSection}>
            <Typography variant="h5" style={styles.notesTitle}>Your Notes</Typography>
            <View style={styles.notesInput}>
              <Text style={styles.notesPlaceholder}>
                {notes || 'Add your notes about this lesson...'}
              </Text>
            </View>
            <TouchableOpacity style={styles.saveNotesButton}>
              <Typography variant="h6" style={styles.saveNotesText}>Save Notes</Typography>
            </TouchableOpacity>
          </View>
        )}
      </Card>

      {/* Course Navigation */}
      <Card variant="elevated" style={styles.navigationCard}>
        <Typography variant="h4" style={styles.navigationTitle}>Course Navigation</Typography>
        
        <View style={styles.navigationButtons}>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="chevron-back" size={20} color="#6c757d" />
            <Typography variant="body2" style={styles.navButtonText}>Previous</Typography>
          </TouchableOpacity>

          <TouchableOpacity style={styles.courseOverviewButton}>
            <Typography variant="h6" style={styles.courseOverviewText}>Course Overview</Typography>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton}>
            <Typography variant="body2" style={styles.navButtonText}>Next</Typography>
            <Ionicons name="chevron-forward" size={20} color="#6c757d" />
          </TouchableOpacity>
        </View>
      </Card>

      <View style={styles.footer}>
        <Typography variant="caption" style={styles.footerText}>
          Continue watching to track your progress and earn certificates
        </Typography>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  courseTitle: {
    color: '#6c757d',
    marginBottom: 4,
  },
  lessonTitle: {
    color: '#212529',
  },
  videoCard: {
    margin: 16,
    marginTop: 8,
    padding: 0,
    overflow: 'hidden',
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoLeft: {
    flex: 1,
  },
  infoTitle: {
    color: '#212529',
    marginBottom: 4,
  },
  infoDuration: {
    color: '#6c757d',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  completedText: {
    color: '#28a745',
    fontWeight: '600',
  },
  description: {
    color: '#495057',
    lineHeight: 24,
    marginBottom: 20,
  },
  objectivesSection: {
    marginTop: 8,
  },
  objectivesTitle: {
    color: '#212529',
    marginBottom: 12,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  objectiveText: {
    color: '#495057',
    flex: 1,
    lineHeight: 20,
  },
  actionsCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  actionsTitle: {
    color: '#212529',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    backgroundColor: 'white',
    gap: 8,
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  actionButtonText: {
    color: '#495057',
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  notesTitle: {
    color: '#212529',
    marginBottom: 12,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  notesPlaceholder: {
    color: '#6c757d',
    fontStyle: 'italic',
  },
  saveNotesButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveNotesText: {
    color: 'white',
    fontWeight: '600',
  },
  navigationCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  navigationTitle: {
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  navButtonText: {
    color: '#6c757d',
  },
  courseOverviewButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  courseOverviewText: {
    color: '#495057',
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