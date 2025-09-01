import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { ClassSession, OnlineSession } from '../../lib/instructor-types';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

const airbnbColors = {
  primary: '#FF5A5F',
  secondary: '#00A699',
  tertiary: '#FC642D',
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
};

export default function ClassSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ClassSession | null>(null);
  const [onlineSession, setOnlineSession] = useState<OnlineSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [homework, setHomework] = useState('');
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [lessonTopic, setLessonTopic] = useState('');
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // Mock data - in real app this would come from params and API
  const classData = {
    id: params.classId || 'class123',
    title: 'Advanced English Grammar',
    subject: 'English',
    grade: '10th Grade',
    totalStudents: 25,
    schoolName: 'Lincoln High School'
  };

  useEffect(() => {
    loadSessionData();
  }, []);

  useEffect(() => {
    // Update timer every second when session is ongoing
    if (session?.status === 'ongoing' && !timerInterval) {
      const interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } else if (session?.status !== 'ongoing' && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [session?.status]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      // In real app, load existing session if it exists
      // For now, create a mock scheduled session
      const mockSession: ClassSession = {
        $id: 'session123',
        classId: classData.id,
        instructorId: user?.$id || '',
        schoolId: 'school123',
        sessionDate: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        endTime: '11:00',
        sessionType: 'in-person',
        attendanceCount: 0,
        totalStudents: classData.totalStudents,
        lessonTopic: '',
        materials: [],
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setSession(mockSession);
      setAttendanceCount(mockSession.attendanceCount);
      setLessonTopic(mockSession.lessonTopic);
    } catch (error) {
      console.error('Error loading session:', error);
      Alert.alert('Error', 'Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = async () => {
    if (!session || !user?.$id) return;

    if (!lessonTopic.trim()) {
      Alert.alert('Error', 'Please enter a lesson topic before starting the session');
      return;
    }

    try {
      setLoading(true);
      
      // Update session with lesson topic first
      const updatedSession = await appwriteService.updateClassSession(session.$id, {
        lessonTopic: lessonTopic.trim(),
        attendanceCount
      });

      // Start the session
      const startedSession = await appwriteService.startSession(session.$id);
      setSession(startedSession);
      setSessionTimer(0);

      Alert.alert('Success', 'Class session started successfully!');
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleStartOnlineSession = async () => {
    if (!session || !user?.$id) return;

    try {
      setLoading(true);

      // Generate meeting link (in real app, integrate with Zoom/Teams/Meet API)
      const meetingId = `meeting-${Date.now()}`;
      const meetingLink = `https://meet.example.com/${meetingId}`;

      const onlineSessionData: Omit<OnlineSession, '$id' | 'createdAt' | 'updatedAt'> = {
        sessionId: session.$id,
        meetingPlatform: 'custom',
        meetingId,
        meetingLink,
        recordingEnabled: true,
        attendees: [],
        sharedFiles: [],
        sessionQuality: {
          videoQuality: 'good',
          audioQuality: 'good',
          connectionStability: 'stable'
        }
      };

      const createdOnlineSession = await appwriteService.createOnlineSession(onlineSessionData);
      setOnlineSession(createdOnlineSession);

      // Update main session
      await appwriteService.updateClassSession(session.$id, {
        sessionType: 'online',
        meetingLink: meetingLink,
        lessonTopic: lessonTopic.trim()
      });

      // Start the session
      const startedSession = await appwriteService.startSession(session.$id);
      setSession(startedSession);
      setSessionTimer(0);

      Alert.alert(
        'Online Session Started', 
        `Meeting link: ${meetingLink}\n\nShare this link with your students.`,
        [
          { text: 'Copy Link', onPress: () => {/* Copy to clipboard */} },
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error starting online session:', error);
      Alert.alert('Error', 'Failed to start online session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!session || !user?.$id) return;

    try {
      setLoading(true);

      const endedSession = await appwriteService.endSession(session.$id, sessionNotes);
      setSession(endedSession);
      
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      setShowEndSessionModal(false);
      
      Alert.alert(
        'Session Ended',
        'Would you like to rate your students now?',
        [
          { text: 'Later', onPress: () => router.back() },
          { 
            text: 'Rate Students', 
            onPress: () => router.push(`/(instructor)/student-rating?classId=${classData.id}&sessionId=${session.$id}`)
          }
        ]
      );
    } catch (error) {
      console.error('Error ending session:', error);
      Alert.alert('Error', 'Failed to end session');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return airbnbColors.success;
      case 'scheduled': return airbnbColors.warning;
      case 'completed': return airbnbColors.primary;
      case 'cancelled': return airbnbColors.error;
      default: return airbnbColors.mediumGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return 'Live Session';
      case 'scheduled': return 'Ready to Start';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  if (loading && !session) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Text style={styles.loadingText}>Loading session...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={airbnbColors.error} />
        <Text style={styles.errorText}>Session not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={24} color={airbnbColors.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{classData.title}</Text>
            <Text style={styles.headerSubtitle}>
              {classData.subject} • {classData.grade} • {classData.schoolName}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(session.status) }]}>
            <Text style={styles.statusText}>{getStatusText(session.status)}</Text>
          </View>
        </Animated.View>

        {/* Session Timer */}
        {session.status === 'ongoing' && (
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.timerSection}>
            <View style={styles.timerCard}>
              <Ionicons name="time" size={32} color={airbnbColors.success} />
              <Text style={styles.timerText}>{formatTime(sessionTimer)}</Text>
              <Text style={styles.timerLabel}>Session Duration</Text>
            </View>
          </Animated.View>
        )}

        {/* Session Details */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color={airbnbColors.primary} />
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{session.sessionDate}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color={airbnbColors.primary} />
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{session.startTime} - {session.endTime}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color={airbnbColors.primary} />
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>
                {session.sessionType === 'online' ? 'Online Class' : 'In-Person Class'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="people" size={20} color={airbnbColors.primary} />
              <Text style={styles.detailLabel}>Students:</Text>
              <Text style={styles.detailValue}>{attendanceCount}/{session.totalStudents}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Lesson Topic */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.topicSection}>
          <Text style={styles.sectionTitle}>Lesson Topic</Text>
          <TextInput
            style={styles.topicInput}
            value={lessonTopic}
            onChangeText={setLessonTopic}
            placeholder="Enter today's lesson topic..."
            placeholderTextColor={airbnbColors.mediumGray}
            editable={session.status !== 'completed'}
          />
        </Animated.View>

        {/* Attendance */}
        <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.attendanceSection}>
          <Text style={styles.sectionTitle}>Attendance</Text>
          <View style={styles.attendanceCard}>
            <View style={styles.attendanceControls}>
              <TouchableOpacity
                style={styles.attendanceButton}
                onPress={() => setAttendanceCount(Math.max(0, attendanceCount - 1))}
                disabled={session.status === 'completed'}
              >
                <Ionicons name="remove" size={24} color={airbnbColors.white} />
              </TouchableOpacity>
              
              <View style={styles.attendanceDisplay}>
                <Text style={styles.attendanceNumber}>{attendanceCount}</Text>
                <Text style={styles.attendanceLabel}>Present</Text>
              </View>
              
              <TouchableOpacity
                style={styles.attendanceButton}
                onPress={() => setAttendanceCount(Math.min(session.totalStudents, attendanceCount + 1))}
                disabled={session.status === 'completed'}
              >
                <Ionicons name="add" size={24} color={airbnbColors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Online Session Controls */}
        {session.sessionType === 'online' && session.status === 'ongoing' && (
          <Animated.View entering={FadeInUp.delay(600).duration(600)} style={styles.onlineControls}>
            <Text style={styles.sectionTitle}>Online Session</Text>
            <View style={styles.onlineCard}>
              <View style={styles.meetingInfo}>
                <Text style={styles.meetingLabel}>Meeting Link:</Text>
                <Text style={styles.meetingLink}>{session.meetingLink}</Text>
              </View>
              <TouchableOpacity style={styles.copyButton}>
                <Ionicons name="copy" size={20} color={airbnbColors.primary} />
                <Text style={styles.copyButtonText}>Copy Link</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View entering={FadeInUp.delay(700).duration(600)} style={styles.actionsSection}>
          {session.status === 'scheduled' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={handleStartSession}
                disabled={loading}
              >
                <Ionicons name="play" size={20} color={airbnbColors.white} />
                <Text style={styles.actionButtonText}>Start In-Person Class</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.onlineButton]}
                onPress={handleStartOnlineSession}
                disabled={loading}
              >
                <Ionicons name="videocam" size={20} color={airbnbColors.white} />
                <Text style={styles.actionButtonText}>Start Online Class</Text>
              </TouchableOpacity>
            </View>
          )}

          {session.status === 'ongoing' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rateButton]}
                onPress={() => router.push(`/(instructor)/student-rating?classId=${classData.id}&sessionId=${session.$id}`)}
              >
                <Ionicons name="star" size={20} color={airbnbColors.white} />
                <Text style={styles.actionButtonText}>Rate Students</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.endButton]}
                onPress={() => setShowEndSessionModal(true)}
              >
                <Ionicons name="stop" size={20} color={airbnbColors.white} />
                <Text style={styles.actionButtonText}>End Session</Text>
              </TouchableOpacity>
            </View>
          )}

          {session.status === 'completed' && (
            <View style={styles.completedActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}
                onPress={() => router.push(`/(instructor)/student-rating?classId=${classData.id}&sessionId=${session.$id}`)}
              >
                <Ionicons name="eye" size={20} color={airbnbColors.white} />
                <Text style={styles.actionButtonText}>View Ratings</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* End Session Modal */}
      <Modal
        visible={showEndSessionModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>End Session</Text>
            
            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Session Notes (Optional)</Text>
              <TextInput
                style={styles.modalTextArea}
                value={sessionNotes}
                onChangeText={setSessionNotes}
                placeholder="Add notes about today's session..."
                multiline
                numberOfLines={4}
                placeholderTextColor={airbnbColors.mediumGray}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Homework Assignment (Optional)</Text>
              <TextInput
                style={styles.modalTextArea}
                value={homework}
                onChangeText={setHomework}
                placeholder="Assign homework for next class..."
                multiline
                numberOfLines={3}
                placeholderTextColor={airbnbColors.mediumGray}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEndSessionModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleEndSession}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={airbnbColors.white} />
                ) : (
                  <Text style={styles.modalConfirmText}>End Session</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: airbnbColors.offWhite,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: airbnbColors.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: airbnbColors.offWhite,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.error,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: airbnbColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: airbnbColors.white,
    fontWeight: '600',
  },
  header: {
    backgroundColor: airbnbColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBackButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: airbnbColors.white,
  },
  timerSection: {
    padding: 20,
    alignItems: 'center',
  },
  timerCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 200,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: airbnbColors.success,
    marginVertical: 8,
  },
  timerLabel: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
  detailsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginLeft: 12,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: airbnbColors.darkGray,
  },
  topicSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  topicInput: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    color: airbnbColors.charcoal,
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  attendanceSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  attendanceCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  attendanceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceButton: {
    backgroundColor: airbnbColors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceDisplay: {
    alignItems: 'center',
    marginHorizontal: 40,
  },
  attendanceNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: airbnbColors.primary,
  },
  attendanceLabel: {
    fontSize: 16,
    color: airbnbColors.darkGray,
    marginTop: 4,
  },
  onlineControls: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  onlineCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  meetingInfo: {
    marginBottom: 16,
  },
  meetingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 8,
  },
  meetingLink: {
    fontSize: 14,
    color: airbnbColors.primary,
    backgroundColor: airbnbColors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: airbnbColors.lightGray,
    padding: 12,
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.primary,
    marginLeft: 8,
  },
  actionsSection: {
    padding: 20,
    marginBottom: 40,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    backgroundColor: airbnbColors.success,
  },
  onlineButton: {
    backgroundColor: airbnbColors.secondary,
  },
  rateButton: {
    backgroundColor: airbnbColors.warning,
  },
  endButton: {
    backgroundColor: airbnbColors.error,
  },
  viewButton: {
    backgroundColor: airbnbColors.primary,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: airbnbColors.white,
    marginLeft: 8,
  },
  completedActions: {
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 8,
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: airbnbColors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: airbnbColors.charcoal,
    backgroundColor: airbnbColors.offWhite,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: airbnbColors.lightGray,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.darkGray,
  },
  modalConfirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: airbnbColors.error,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.white,
  },
});