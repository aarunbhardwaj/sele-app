import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../components/ui/theme';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import type { Class } from '../../../lib/types';
import appwriteService from '../../../services/appwrite';

// Airbnb color palette
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

export default function ClassDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const classId = params.id as string;
  const insets = useSafeAreaInsets();
  
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [classStats, setClassStats] = useState<any>(null);
  
  const loadClassData = useCallback(async () => {
    try {
      setLoading(true);
      const [classInfo, stats] = await Promise.all([
        appwriteService.getClassById(classId),
        appwriteService.getClassStats(classId)
      ]);
      setClassData(classInfo);
      setClassStats(stats);
    } catch (error) {
      console.error('Failed to load class data:', error);
      Alert.alert('Error', 'Failed to load class details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [classId]);
  
  useEffect(() => {
    if (classId) {
      loadClassData();
    } else {
      Alert.alert('Error', 'Class ID is missing');
      router.back();
    }
  }, [classId, loadClassData, router]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return airbnbColors.secondary;
      case 'inactive':
        return '#6B7280';
      case 'full':
        return '#F59E0B';
      case 'archived':
        return '#9CA3AF';
      default:
        return '#6B7280';
    }
  };

  const getEnrollmentStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return airbnbColors.secondary;
      case 'closed':
        return '#EF4444';
      case 'waitlist-only':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const handleDeleteClass = () => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete "${classData?.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!classData?.$id) return;
            
            try {
              setLoading(true);
              await appwriteService.deleteClass(classData.$id);
              Alert.alert('Success', 'Class deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => router.back()
                }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete class: ' + (error as Error).message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderEnrollmentInfo = () => {
    if (!classStats) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enrollment Information</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{classStats.totalEnrolled}</Text>
            <Text style={styles.statLabel}>Enrolled</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{classStats.availableSpots}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{classStats.waitingListCount}</Text>
            <Text style={styles.statLabel}>Waiting List</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: airbnbColors.secondary }]}>
              {Math.round(classStats.enrollmentRate)}%
            </Text>
            <Text style={styles.statLabel}>Filled</Text>
          </View>
        </View>

        {classStats.enrollmentRate >= 80 && (
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.warningText}>
              This class is nearly full. Consider increasing capacity or creating another section.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={styles.headerContainer}>
        <PreAuthHeader 
          title="Class Details"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
      </SafeAreaView>

      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 80 }
        ]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={airbnbColors.primary} />
            <Text style={styles.loadingText}>Loading class details...</Text>
          </View>
        ) : !classData ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.neutral.gray} />
            <Text style={styles.errorTitle}>Class Not Found</Text>
            <Text style={styles.errorSubtitle}>
              The class you&apos;re looking for doesn&apos;t exist or has been removed.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={[styles.backButtonText, { color: airbnbColors.primary }]}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Hero Section */}
            <LinearGradient 
              colors={[airbnbColors.primary, airbnbColors.primaryDark]} 
              style={styles.heroSection}
            >
              <View style={styles.heroContent}>
                <View style={styles.classIconContainer}>
                  <Ionicons name="school" size={48} color={colors.neutral.white} />
                </View>
                <Text style={styles.heroTitle}>{classData.title}</Text>
                <Text style={styles.heroSubtitle}>
                  {classData.subject} • Grade {classData.grade} {classData.section && `• Section ${classData.section}`}
                </Text>
                <Text style={styles.classCode}>Class Code: {classData.code}</Text>
                
                <View style={styles.statusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(classData.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(classData.status) }]}>
                      {classData.status.charAt(0).toUpperCase() + classData.status.slice(1)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getEnrollmentStatusColor(classData.enrollmentStatus) + '15' }]}>
                    <Text style={[styles.statusText, { color: getEnrollmentStatusColor(classData.enrollmentStatus) }]}>
                      {classData.enrollmentStatus.replace('-', ' ')}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/(admin)/(classes)/edit-class?id=${classData.$id}`)}
              >
                <Ionicons name="create-outline" size={20} color={airbnbColors.secondary} />
                <Text style={[styles.actionButtonText, { color: airbnbColors.secondary }]}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/(admin)/(classes)/manage-students?id=${classData.$id}`)}
              >
                <Ionicons name="people-outline" size={20} color={airbnbColors.accent.main} />
                <Text style={[styles.actionButtonText, { color: airbnbColors.accent.main }]}>Students</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDeleteClass}
              >
                <Ionicons name="trash-outline" size={20} color={airbnbColors.primary} />
                <Text style={[styles.actionButtonText, { color: airbnbColors.primary }]}>Delete</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContainer}>
              {/* Enrollment Information */}
              {renderEnrollmentInfo()}
              
              {/* Class Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Class Information</Text>
                
                <View style={styles.infoItem}>
                  <Ionicons name="book-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Subject</Text>
                    <Text style={styles.infoValue}>{classData.subject}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="school-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Grade & Section</Text>
                    <Text style={styles.infoValue}>
                      Grade {classData.grade} {classData.section && `- Section ${classData.section}`}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Academic Year</Text>
                    <Text style={styles.infoValue}>{classData.academicYear || 'Not specified'}</Text>
                  </View>
                </View>
                
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                  <View>
                    <Text style={styles.infoLabel}>Duration</Text>
                    <Text style={styles.infoValue}>{classData.duration || 60} minutes</Text>
                  </View>
                </View>
                
                {classData.schedule && (
                  <View style={styles.infoItem}>
                    <Ionicons name="calendar-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                    <View>
                      <Text style={styles.infoLabel}>Schedule</Text>
                      <Text style={styles.infoValue}>{classData.schedule}</Text>
                    </View>
                  </View>
                )}
                
                {classData.instructorName && (
                  <View style={styles.infoItem}>
                    <Ionicons name="person-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                    <View>
                      <Text style={styles.infoLabel}>Instructor</Text>
                      <Text style={styles.infoValue}>{classData.instructorName}</Text>
                    </View>
                  </View>
                )}
              </View>
              
              {/* Description */}
              {classData.description && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>{classData.description}</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  headerContainer: {
    backgroundColor: colors.neutral.white,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  classIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  classCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.neutral.white,
    marginTop: -spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral.gray,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorSubtitle: {
    fontSize: 14,
    color: colors.neutral.gray,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: airbnbColors.primary,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Details Sections
  detailsContainer: {
    padding: spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.neutral.white,
    marginTop: -spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoIcon: {
    marginRight: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.neutral.gray,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: colors.neutral.text,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.neutral.darkGray,
    lineHeight: 24,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.neutral.background,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.neutral.gray,
    textAlign: 'center',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
  },
});