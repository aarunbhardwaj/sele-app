import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import type { ClassSession, InstructorSchedule } from '../../../lib/instructor-types';
import appwriteService from '../../../services/appwrite';
import { useAuth } from '../../../services/AuthContext';

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

interface CalendarDay {
  date: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  sessions: ClassSession[];
}

// Add new interfaces for roster integration
interface EnhancedSession extends ClassSession {
  schoolName?: string;
  classTitle?: string;
  assignmentStatus?: 'active' | 'pending' | 'completed' | 'cancelled';
  isTemporary?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  enrollmentRate?: number;
  maxStudents?: number;
}

interface RosterAssignment {
  $id: string;
  schoolName: string;
  className: string;
  subject: string;
  grade: string;
  schedule: string;
  status: 'active' | 'pending' | 'completed' | 'cancelled';
  isTemporary: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  totalStudents: number;
  maxStudents: number;
  assignedDate: string;
  notes?: string;
}

export default function InstructorCalendarScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [sessions, setSessions] = useState<EnhancedSession[]>([]);
  const [schedule, setSchedule] = useState<InstructorSchedule[]>([]);
  const [rosterAssignments, setRosterAssignments] = useState<RosterAssignment[]>([]);
  const [weekView, setWeekView] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadCalendarData();
  }, [currentMonth]);

  const loadCalendarData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!user?.$id) return;

      // Get start and end dates for the current month view
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      // Load all instructor data including roster assignments
      const [sessionsResp, scheduleResp, assignmentsResp, classesResp] = await Promise.all([
        appwriteService.getInstructorSessions?.(user.$id, {}).catch(() => []),
        appwriteService.getInstructorSchedule?.(user.$id).catch(() => []),
        appwriteService.getInstructorAssignments?.(user.$id).catch(() => []),
        appwriteService.getClassesByInstructor?.(user.$id).catch(() => [])
      ]);

      // Enhance sessions with roster data
      const enhancedSessions = await enhanceSessionsWithRosterData(
        sessionsResp || [], 
        assignmentsResp || [], 
        classesResp || []
      );

      setSessions(enhancedSessions);
      setSchedule(Array.isArray(scheduleResp) ? scheduleResp : []);
      
      // Transform assignments for roster display
      const rosterData = (assignmentsResp || []).map(assignment => ({
        $id: assignment.$id,
        schoolName: assignment.schoolName,
        className: assignment.className,
        subject: assignment.subject,
        grade: assignment.grade,
        schedule: assignment.schedule,
        status: assignment.status,
        isTemporary: assignment.isTemporary,
        priority: determinePriority(assignment),
        totalStudents: 0, // Will be populated from class data
        maxStudents: 0,
        assignedDate: assignment.startDate,
        notes: assignment.notes
      }));

      setRosterAssignments(rosterData);

      // Generate calendar days with enhanced session data
      generateCalendarDays(startOfMonth, endOfMonth, enhancedSessions);

    } catch (error) {
      console.error('Error loading calendar data:', error);
      Alert.alert('Error', 'Failed to load calendar data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const enhanceSessionsWithRosterData = async (
    sessions: ClassSession[], 
    assignments: any[], 
    classes: any[]
  ): Promise<EnhancedSession[]> => {
    return sessions.map(session => {
      // Find matching assignment
      const assignment = assignments.find(a => a.classId === session.classId);
      
      // Find matching class data
      const classData = classes.find(c => c.$id === session.classId);
      
      return {
        ...session,
        schoolName: assignment?.schoolName || 'Unknown School',
        classTitle: assignment?.className || classData?.title || 'English Class',
        assignmentStatus: assignment?.status || 'active',
        isTemporary: assignment?.isTemporary || false,
        priority: determinePriority(assignment) || 'medium',
        enrollmentRate: classData ? (classData.currentEnrollment / (classData.maxStudents || 1)) : 0,
        maxStudents: classData?.maxStudents || session.totalStudents
      };
    });
  };

  const determinePriority = (assignment: any): 'low' | 'medium' | 'high' | 'urgent' => {
    if (!assignment) return 'medium';
    
    if (assignment.isTemporary) return 'urgent';
    if (assignment.status === 'pending') return 'high';
    if (assignment.endDate && new Date(assignment.endDate) < new Date()) return 'high';
    
    return 'medium';
  };

  const generateCalendarDays = (startOfMonth: Date, endOfMonth: Date, sessionData: ClassSession[]) => {
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // Get first day of the month and how many days to show from previous month
    const firstDayOfWeek = startOfMonth.getDay();
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfWeek);

    // Generate 42 days (6 weeks) for the calendar
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateString = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
      const isToday = currentDate.toDateString() === today.toDateString();
      
      // Filter sessions for this date
      const daySessions = sessionData.filter(session => 
        session.sessionDate === dateString
      );

      days.push({
        date: dateString,
        dayName: dayNames[currentDate.getDay()],
        dayNumber: currentDate.getDate(),
        isToday,
        isCurrentMonth,
        sessions: daySessions
      });
    }

    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const getSelectedDateSessions = () => {
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    return sessions.filter(session => session.sessionDate === selectedDateString);
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return airbnbColors.success;
      case 'completed': return airbnbColors.primary;
      case 'scheduled': return airbnbColors.warning;
      case 'cancelled': return airbnbColors.error;
      default: return airbnbColors.mediumGray;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      case 'low': return '#65A30D';
      default: return airbnbColors.mediumGray;
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'active': return airbnbColors.success;
      case 'pending': return airbnbColors.warning;
      case 'completed': return airbnbColors.primary;
      case 'cancelled': return airbnbColors.error;
      default: return airbnbColors.mediumGray;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const renderCalendarDay = (day: CalendarDay, index: number) => {
    const isSelected = selectedDate.toDateString() === new Date(day.date).toDateString();
    const hasSession = day.sessions.length > 0;

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          !day.isCurrentMonth && styles.calendarDayInactive,
          isSelected && styles.calendarDaySelected,
          day.isToday && styles.calendarDayToday
        ]}
        onPress={() => setSelectedDate(new Date(day.date))}
      >
        <Text style={[
          styles.calendarDayNumber,
          !day.isCurrentMonth && styles.calendarDayNumberInactive,
          isSelected && styles.calendarDayNumberSelected,
          day.isToday && styles.calendarDayNumberToday
        ]}>
          {day.dayNumber}
        </Text>
        {hasSession && (
          <View style={[styles.sessionIndicator, { backgroundColor: airbnbColors.primary }]} />
        )}
      </TouchableOpacity>
    );
  };

  const renderSessionCard = (session: EnhancedSession, index: number) => (
    <Animated.View
      key={session.$id}
      entering={FadeInUp.delay(index * 100).duration(500)}
      style={[
        styles.sessionCard,
        session.isTemporary && styles.temporarySessionCard
      ]}
    >
      <TouchableOpacity
        style={styles.sessionContent}
        onPress={() => router.push(`/(instructor)/class-session?classId=${session.classId}&sessionId=${session.$id}`)}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionTimeContainer}>
            <Text style={styles.sessionTime}>
              {formatTime(session.startTime)} - {formatTime(session.endTime)}
            </Text>
            <View style={styles.sessionBadges}>
              <View style={[styles.sessionStatusBadge, { backgroundColor: getSessionStatusColor(session.status) }]}>
                <Text style={styles.sessionStatusText}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Text>
              </View>
              {session.isTemporary && (
                <View style={[styles.temporaryBadge, { backgroundColor: airbnbColors.warning }]}>
                  <Text style={styles.badgeText}>TEMP</Text>
                </View>
              )}
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(session.priority || 'medium') }]}>
                <Text style={styles.badgeText}>{(session.priority || 'medium').toUpperCase()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced session info with roster data */}
        <View style={styles.sessionInfoContainer}>
          <Text style={styles.sessionTopic}>{session.lessonTopic || session.classTitle}</Text>
          <Text style={styles.schoolName}>{session.schoolName}</Text>
        </View>
        
        <View style={styles.sessionDetails}>
          <View style={styles.sessionDetail}>
            <Ionicons name="location-outline" size={16} color={airbnbColors.darkGray} />
            <Text style={styles.sessionDetailText}>
              {session.sessionType === 'online' ? 'Online Class' : 'In-Person'}
            </Text>
          </View>
          
          <View style={styles.sessionDetail}>
            <Ionicons name="people-outline" size={16} color={airbnbColors.darkGray} />
            <Text style={styles.sessionDetailText}>
              {session.attendanceCount}/{session.totalStudents} students
            </Text>
          </View>

          <View style={styles.sessionDetail}>
            <Ionicons name="school-outline" size={16} color={airbnbColors.darkGray} />
            <Text style={styles.sessionDetailText}>
              Grade {rosterAssignments.find(a => a.className === session.classTitle)?.grade || 'N/A'}
            </Text>
          </View>

          {session.enrollmentRate !== undefined && (
            <View style={styles.sessionDetail}>
              <Ionicons name="trending-up-outline" size={16} color={airbnbColors.darkGray} />
              <Text style={styles.sessionDetailText}>
                {Math.round((session.enrollmentRate || 0) * 100)}% enrolled
              </Text>
            </View>
          )}
        </View>

        {/* Assignment status indicator */}
        <View style={styles.assignmentStatusContainer}>
          <View style={[styles.assignmentStatusBadge, { backgroundColor: getAssignmentStatusColor(session.assignmentStatus || 'active') + '15' }]}>
            <Text style={[styles.assignmentStatusText, { color: getAssignmentStatusColor(session.assignmentStatus || 'active') }]}>
              Assignment: {(session.assignmentStatus || 'active').charAt(0).toUpperCase() + (session.assignmentStatus || 'active').slice(1)}
            </Text>
          </View>
        </View>

        {session.status === 'scheduled' && (
          <View style={styles.sessionActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(instructor)/class-session?classId=${session.classId}&sessionId=${session.$id}`)}
            >
              <Ionicons name="play" size={16} color={airbnbColors.success} />
              <Text style={[styles.actionButtonText, { color: airbnbColors.success }]}>Start Class</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'Class Details', 
                  `School: ${session.schoolName}\nClass: ${session.classTitle}\nType: ${session.isTemporary ? 'Temporary Assignment' : 'Regular Assignment'}\nPriority: ${session.priority}\nStatus: ${session.assignmentStatus}`
                );
              }}
            >
              <Ionicons name="information-circle-outline" size={16} color={airbnbColors.primary} />
              <Text style={[styles.actionButtonText, { color: airbnbColors.primary }]}>Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {session.status === 'completed' && (
          <View style={styles.sessionActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(instructor)/student-rating?classId=${session.classId}&sessionId=${session.$id}`)}
            >
              <Ionicons name="star" size={16} color={airbnbColors.warning} />
              <Text style={[styles.actionButtonText, { color: airbnbColors.warning }]}>View Ratings</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  // Add roster summary component
  const renderRosterSummary = () => (
    <Animated.View entering={FadeInUp.delay(150).duration(600)} style={styles.rosterSummary}>
      <Text style={styles.rosterSummaryTitle}>Assignment Overview</Text>
      <View style={styles.rosterStats}>
        <View style={styles.rosterStatItem}>
          <Text style={styles.rosterStatNumber}>
            {rosterAssignments.filter(a => a.status === 'active').length}
          </Text>
          <Text style={styles.rosterStatLabel}>Active</Text>
        </View>
        <View style={styles.rosterStatItem}>
          <Text style={[styles.rosterStatNumber, { color: airbnbColors.warning }]}>
            {rosterAssignments.filter(a => a.isTemporary).length}
          </Text>
          <Text style={styles.rosterStatLabel}>Temporary</Text>
        </View>
        <View style={styles.rosterStatItem}>
          <Text style={[styles.rosterStatNumber, { color: '#EA580C' }]}>
            {rosterAssignments.filter(a => a.priority === 'high' || a.priority === 'urgent').length}
          </Text>
          <Text style={styles.rosterStatLabel}>High Priority</Text>
        </View>
        <View style={styles.rosterStatItem}>
          <Text style={[styles.rosterStatNumber, { color: airbnbColors.secondary }]}>
            {new Set(rosterAssignments.map(a => a.schoolName)).size}
          </Text>
          <Text style={styles.rosterStatLabel}>Schools</Text>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Text style={styles.loadingText}>Loading schedule...</Text>
      </View>
    );
  }

  const selectedDateSessions = getSelectedDateSessions();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadCalendarData(true)} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={airbnbColors.charcoal} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Schedule</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setWeekView(!weekView)} style={styles.viewToggleButton}>
              <Ionicons name={weekView ? "calendar" : "list"} size={20} color={airbnbColors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={styles.todayButton}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Roster Summary */}
        {renderRosterSummary()}

        {/* Calendar Navigation */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
            <Ionicons name="chevron-back" size={24} color={airbnbColors.primary} />
          </TouchableOpacity>
          
          <Text style={styles.monthTitle}>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
            <Ionicons name="chevron-forward" size={24} color={airbnbColors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Calendar Grid */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)} style={styles.calendarContainer}>
          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {dayNames.map(day => (
              <Text key={day} style={styles.dayHeader}>{day}</Text>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.calendarGrid}>
            {calendarDays.map(renderCalendarDay)}
          </View>
        </Animated.View>

        {/* Selected Date Sessions */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.selectedDateSection}>
          <Text style={styles.selectedDateTitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>

          {selectedDateSessions.length > 0 ? (
            <View style={styles.sessionsList}>
              {selectedDateSessions.map(renderSessionCard)}
            </View>
          ) : (
            <View style={styles.noSessionsContainer}>
              <Ionicons name="calendar-outline" size={48} color={airbnbColors.mediumGray} />
              <Text style={styles.noSessionsText}>No classes scheduled for this date</Text>
              <Text style={styles.noSessionsSubtext}>
                Your schedule will appear here when classes are assigned
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ...existing styles...

  // New styles for roster integration
  rosterSummary: {
    backgroundColor: airbnbColors.white,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rosterSummaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 16,
  },
  rosterStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rosterStatItem: {
    alignItems: 'center',
  },
  rosterStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
  },
  rosterStatLabel: {
    fontSize: 12,
    color: airbnbColors.darkGray,
    marginTop: 4,
  },
  temporarySessionCard: {
    borderLeftWidth: 4,
    borderLeftColor: airbnbColors.warning,
  },
  sessionBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  temporaryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: airbnbColors.white,
  },
  sessionInfoContainer: {
    marginBottom: 12,
  },
  schoolName: {
    fontSize: 14,
    color: airbnbColors.secondary,
    fontWeight: '500',
  },
  assignmentStatusContainer: {
    marginTop: 8,
    marginBottom: 12,
  },
  assignmentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  assignmentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewToggleButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: airbnbColors.lightGray,
  },

  // ...keep all existing styles...
  container: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  scrollView: {
    flex: 1,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: airbnbColors.white,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
  },
  todayButton: {
    backgroundColor: airbnbColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: airbnbColors.white,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: airbnbColors.white,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: airbnbColors.charcoal,
  },
  calendarContainer: {
    backgroundColor: airbnbColors.white,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: airbnbColors.darkGray,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
    position: 'relative',
  },
  calendarDayInactive: {
    opacity: 0.3,
  },
  calendarDaySelected: {
    backgroundColor: airbnbColors.primary,
  },
  calendarDayToday: {
    backgroundColor: airbnbColors.secondary + '20',
  },
  calendarDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
  },
  calendarDayNumberInactive: {
    color: airbnbColors.mediumGray,
  },
  calendarDayNumberSelected: {
    color: airbnbColors.white,
  },
  calendarDayNumberToday: {
    color: airbnbColors.secondary,
  },
  sessionIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  selectedDateSection: {
    padding: 20,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 16,
  },
  sessionsList: {
    gap: 12,
  },
  sessionCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    shadowColor: airbnbColors.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionContent: {
    padding: 20,
  },
  sessionHeader: {
    marginBottom: 12,
  },
  sessionTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionTime: {
    fontSize: 16,
    fontWeight: '700',
    color: airbnbColors.charcoal,
  },
  sessionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sessionStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: airbnbColors.white,
  },
  sessionTopic: {
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  sessionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionDetailText: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: airbnbColors.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noSessionsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noSessionsText: {
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noSessionsSubtext: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});