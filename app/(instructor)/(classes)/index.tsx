import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';
import { useAuth } from '../../../services/AuthContext';

// Consistent Airbnb-inspired color palette
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#E8484D',
  primaryLight: '#FFE8E9',
  secondary: '#00A699',
  secondaryLight: '#E0F7F5',
  tertiary: '#FC642D',
  tertiaryLight: '#FFF4F0',
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

interface ClassData {
  $id: string;
  title: string;
  description?: string;
  subject: string;
  grade: string;
  currentEnrollment?: number;
  maxStudents?: number;
  schedule?: string;
  status?: string;
  meetingDays?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
}

const ClassCard = ({ classData, index }: { classData: ClassData; index: number }) => {
  const router = useRouter();
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return airbnbColors.success;
      case 'pending': return airbnbColors.warning;
      case 'completed': return airbnbColors.mediumGray;
      default: return airbnbColors.mediumGray;
    }
  };

  const getEnrollmentColor = (current: number, max: number) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    if (percentage >= 90) return airbnbColors.error;
    if (percentage >= 70) return airbnbColors.warning;
    return airbnbColors.success;
  };

  return (
    <Animated.View 
      entering={FadeInLeft.delay(index * 150).duration(600)}
      style={styles.classCard}
    >
      <TouchableOpacity 
        style={styles.classCardContent}
        onPress={() => {
          // Navigate to class details
          router.push(`/(instructor)/(classes)/${classData.$id}` as any);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.classHeader}>
          <View style={styles.classInfo}>
            <Text style={styles.classTitle}>{classData.title}</Text>
            <Text style={styles.classSubject}>{classData.subject} • {classData.grade}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(classData.status || 'active') + '15' }]}>
            <Text style={StyleSheet.flatten([styles.statusText, { color: getStatusColor(classData.status || 'active') }])}>
              {classData.status || 'Active'}
            </Text>
          </View>
        </View>

        {classData.description && (
          <Text style={styles.classDescription} numberOfLines={2}>
            {classData.description}
          </Text>
        )}

        <View style={styles.classDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color={airbnbColors.darkGray} />
            <Text style={styles.detailText}>
              {classData.currentEnrollment || 0}/{classData.maxStudents || 0} students
            </Text>
            <View style={[
              styles.enrollmentDot, 
              { backgroundColor: getEnrollmentColor(classData.currentEnrollment || 0, classData.maxStudents || 0) }
            ]} />
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={airbnbColors.darkGray} />
            <Text style={styles.detailText}>
              {classData.schedule || `${classData.meetingDays || 'TBD'} ${classData.startTime || ''}`}
            </Text>
          </View>

          {classData.room && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={airbnbColors.darkGray} />
              <Text style={styles.detailText}>{classData.room}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function InstructorClasses() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);

  const loadClasses = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      if (!user?.$id) {
        console.log('No user ID available for loading classes');
        return;
      }

      const classesData = await appwriteService.getClassesByInstructor(user.$id);
      // Map the Class objects to ClassData format
      const mappedClasses: ClassData[] = Array.isArray(classesData) 
        ? classesData.map(cls => ({
            $id: cls.$id,
            title: cls.title || 'Untitled Class',
            description: cls.description,
            subject: cls.subject || 'General',
            grade: cls.grade || 'Mixed',
            currentEnrollment: cls.currentEnrollment || 0,
            maxStudents: cls.maxStudents || 0,
            schedule: cls.schedule,
            status: cls.status || 'active',
            meetingDays: cls.meetingDays,
            startTime: cls.startTime,
            endTime: cls.endTime,
            room: cls.room
          }))
        : [];
      
      setClasses(mappedClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
      if (!isRefresh) {
        Alert.alert('Error', 'Failed to load classes. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleRefresh = () => {
    loadClasses(true);
  };

  const handleCreateClass = () => {
    // Navigate to create class screen
    router.push('/(instructor)/(classes)/create' as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Text style={styles.loadingText}>Loading your classes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title="My Classes"
        showRefresh={true}
        showLogout={true}
        onRefreshPress={handleRefresh}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[airbnbColors.primary]}
            tintColor={airbnbColors.primary}
          />
        }
      >
        <View style={styles.content}>
          {/* Header Section */}
          <Animated.View 
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.headerSection}
          >
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerTitle}>Your Classes</Text>
                <Text style={styles.headerSubtitle}>
                  {classes.length} {classes.length === 1 ? 'class' : 'classes'} assigned
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateClass}
              >
                <Ionicons name="add" size={20} color={airbnbColors.white} />
                <Text style={styles.createButtonText}>New Class</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Classes List */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.classesSection}
          >
            {classes.length > 0 ? (
              <View style={styles.classesList}>
                {classes.map((classData, index) => (
                  <ClassCard key={classData.$id} classData={classData} index={index} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="school-outline" size={48} color={airbnbColors.mediumGray} />
                </View>
                <Text style={styles.emptyTitle}>No Classes Yet</Text>
                <Text style={styles.emptyDescription}>
                  You haven&apos;t been assigned to any classes yet. Check back later or contact your administrator.
                </Text>
                <TouchableOpacity style={styles.emptyButton} onPress={handleCreateClass}>
                  <Text style={styles.emptyButtonText}>Create First Class</Text>
                </TouchableOpacity>
              </View>
            )}
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
    fontWeight: '500',
  },

  // Header Section
  headerSection: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  createButtonText: {
    color: airbnbColors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Classes Section
  classesSection: {
    flex: 1,
  },
  classesList: {
    gap: 16,
  },
  classCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  classCardContent: {
    padding: 20,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  classInfo: {
    flex: 1,
    marginRight: 12,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  classSubject: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  classDescription: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    marginBottom: 16,
    lineHeight: 20,
  },
  classDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    flex: 1,
  },
  enrollmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: airbnbColors.darkGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: airbnbColors.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: airbnbColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});