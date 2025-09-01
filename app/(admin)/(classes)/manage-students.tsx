import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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

export default function ManageStudentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const classId = params.id as string;
  const insets = useSafeAreaInsets();
  
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [waitingListStudents, setWaitingListStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'waitlist'>('enrolled');
  
  const loadClassData = useCallback(async () => {
    try {
      setLoading(true);
      const classInfo = await appwriteService.getClass(classId);
      setClassData(classInfo);
      
      // Load enrolled students details
      if (classInfo.enrolledStudents && classInfo.enrolledStudents.length > 0) {
        const enrolledDetails = await Promise.all(
          classInfo.enrolledStudents.map(async (studentId: string) => {
            try {
              const student = await appwriteService.getUserById(studentId);
              return student;
            } catch (error) {
              console.error('Failed to load student:', error);
              return null;
            }
          })
        );
        setEnrolledStudents(enrolledDetails.filter(Boolean));
      }
      
      // Load waiting list students details
      if (classInfo.waitingList && classInfo.waitingList.length > 0) {
        const waitingDetails = await Promise.all(
          classInfo.waitingList.map(async (studentId: string) => {
            try {
              const student = await appwriteService.getUserById(studentId);
              return student;
            } catch (error) {
              console.error('Failed to load student:', error);
              return null;
            }
          })
        );
        setWaitingListStudents(waitingDetails.filter(Boolean));
      }
      
    } catch (error) {
      console.error('Failed to load class data:', error);
      Alert.alert('Error', 'Failed to load class details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  const loadAvailableStudents = useCallback(async () => {
    try {
      const allUsers = await appwriteService.getAllUsers();
      // Filter to only show students who are not already enrolled or on waiting list
      const currentStudentIds = [
        ...(classData?.enrolledStudents || []),
        ...(classData?.waitingList || [])
      ];
      const available = allUsers.filter(user => 
        user.role === 'student' && !currentStudentIds.includes(user.$id)
      );
      setAvailableStudents(available);
      setFilteredStudents(available);
    } catch (error) {
      console.error('Failed to load available students:', error);
    }
  }, [classData]);
  
  useEffect(() => {
    if (classId) {
      loadClassData();
    } else {
      Alert.alert('Error', 'Class ID is missing');
      router.back();
    }
  }, [classId, loadClassData]);

  useEffect(() => {
    if (showAddStudent) {
      loadAvailableStudents();
    }
  }, [showAddStudent, loadAvailableStudents]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(availableStudents);
    } else {
      const filtered = availableStudents.filter(student =>
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, availableStudents]);

  const handleEnrollStudent = async (studentId: string) => {
    try {
      await appwriteService.enrollStudent(classId, studentId);
      Alert.alert('Success', 'Student enrolled successfully');
      loadClassData();
      setShowAddStudent(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to enroll student:', error);
      Alert.alert('Error', 'Failed to enroll student. ' + (error as Error).message);
    }
  };

  const handleRemoveStudent = (studentId: string, studentName: string) => {
    Alert.alert(
      'Remove Student',
      `Are you sure you want to remove ${studentName} from this class?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await appwriteService.unenrollStudent(classId, studentId);
              Alert.alert('Success', 'Student removed successfully');
              loadClassData();
            } catch (error) {
              console.error('Failed to remove student:', error);
              Alert.alert('Error', 'Failed to remove student. Please try again.');
            }
          }
        }
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const renderStudentCard = ({ item: student, index }: { item: any; index: number }) => (
    <Animated.View
      style={[
        styles.studentCard,
        { 
          transform: [{ 
            translateY: new Animated.Value(50).interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            }) 
          }] 
        }
      ]}
    >
      <View style={styles.studentInfo}>
        <View style={[styles.avatarContainer, { backgroundColor: airbnbColors.primary }]}>
          <Text style={styles.avatarText}>
            {getInitials(student.name || 'Unknown')}
          </Text>
        </View>
        <View style={styles.studentDetails}>
          <Text style={styles.studentName}>{student.name || 'Unknown Student'}</Text>
          <Text style={styles.studentEmail}>{student.email || 'No email provided'}</Text>
          {student.phone && (
            <Text style={styles.studentPhone}>{student.phone}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.studentActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => router.push(`/(admin)/(users)/user-details?id=${student.$id}`)}
        >
          <Ionicons name="eye-outline" size={18} color={airbnbColors.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveStudent(student.$id, student.name)}
        >
          <Ionicons name="trash-outline" size={18} color={airbnbColors.primary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderAvailableStudentCard = ({ item: student }: { item: any }) => (
    <TouchableOpacity
      style={styles.availableStudentCard}
      onPress={() => handleEnrollStudent(student.$id)}
      activeOpacity={0.8}
    >
      <View style={styles.studentInfo}>
        <View style={[styles.avatarContainer, { backgroundColor: airbnbColors.secondary }]}>
          <Text style={styles.avatarText}>
            {getInitials(student.name || 'Unknown')}
          </Text>
        </View>
        <View style={styles.studentDetails}>
          <Text style={styles.studentName}>{student.name || 'Unknown Student'}</Text>
          <Text style={styles.studentEmail}>{student.email || 'No email provided'}</Text>
          {student.grade && (
            <Text style={styles.studentGrade}>Grade {student.grade}</Text>
          )}
        </View>
      </View>
      <View style={styles.addButtonContainer}>
        <Ionicons name="add-circle" size={28} color={airbnbColors.secondary} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.safeArea}>
        <SafeAreaView style={styles.headerContainer}>
          <PreAuthHeader 
            title="Manage Students"
            showBackButton={true}
            onBackPress={() => router.back()}
          />
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <Text style={styles.loadingText}>Loading class details...</Text>
        </View>
      </View>
    );
  }

  if (showAddStudent) {
    return (
      <View style={styles.safeArea}>
        <SafeAreaView style={styles.headerContainer}>
          <PreAuthHeader 
            title="Add Students"
            showBackButton={true}
            onBackPress={() => setShowAddStudent(false)}
          />
        </SafeAreaView>
        
        {/* Hero Section */}
        <LinearGradient 
          colors={[airbnbColors.secondary, airbnbColors.secondaryDark]} 
          style={styles.addStudentHero}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="person-add" size={32} color={colors.neutral.white} />
            </View>
            <Text style={styles.heroTitle}>Add Students</Text>
            <Text style={styles.heroSubtitle}>
              Search and add students to {classData?.title}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.container}>
          {/* Search Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.neutral.gray} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search students by name or email..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.neutral.gray}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.neutral.gray} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Available Students List */}
          <View style={styles.studentsSection}>
            <Text style={styles.sectionTitle}>
              Available Students ({filteredStudents.length})
            </Text>
            
            <FlatList
              data={filteredStudents}
              renderItem={renderAvailableStudentCard}
              keyExtractor={item => item.$id}
              contentContainerStyle={styles.studentsListContainer}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={64} color={colors.neutral.lightGray} />
                  <Text style={styles.emptyTitle}>
                    {searchQuery ? 'No Students Found' : 'No Available Students'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'All students are either enrolled or on the waiting list for this class.'
                    }
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={styles.headerContainer}>
        <PreAuthHeader 
          title="Manage Students"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
      </SafeAreaView>

      {/* Hero Section */}
      <LinearGradient 
        colors={[airbnbColors.primary, airbnbColors.primaryDark]} 
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="people" size={32} color={colors.neutral.white} />
          </View>
          <Text style={styles.heroTitle}>{classData?.title}</Text>
          <Text style={styles.heroSubtitle}>
            {classData?.subject} • Grade {classData?.grade} • Code: {classData?.code}
          </Text>
          
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{enrolledStudents.length}</Text>
              <Text style={styles.statLabel}>Enrolled</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{waitingListStudents.length}</Text>
              <Text style={styles.statLabel}>Waiting</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{(classData?.maxStudents || 0) - enrolledStudents.length}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddStudent(true)}
        >
          <Ionicons name="person-add" size={20} color={airbnbColors.white} />
          <Text style={styles.addButtonText}>Add Students</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => router.push('/(admin)/(users)')}
        >
          <Ionicons name="settings-outline" size={20} color={airbnbColors.secondary} />
          <Text style={[styles.addButtonText, { color: airbnbColors.secondary }]}>Manage All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 80 }
        ]}
      >
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'enrolled' && styles.activeTab]}
            onPress={() => setActiveTab('enrolled')}
          >
            <Text style={[styles.tabText, activeTab === 'enrolled' && styles.activeTabText]}>
              Enrolled ({enrolledStudents.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'waitlist' && styles.activeTab]}
            onPress={() => setActiveTab('waitlist')}
          >
            <Text style={[styles.tabText, activeTab === 'waitlist' && styles.activeTabText]}>
              Waiting List ({waitingListStudents.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Students Content */}
        <View style={styles.studentsContent}>
          {activeTab === 'enrolled' ? (
            enrolledStudents.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="people-outline" size={64} color={colors.neutral.lightGray} />
                <Text style={styles.emptyTitle}>No Students Enrolled</Text>
                <Text style={styles.emptySubtitle}>
                  This class doesn't have any enrolled students yet. Add some students to get started.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionButton}
                  onPress={() => setShowAddStudent(true)}
                >
                  <Ionicons name="person-add" size={20} color={airbnbColors.primary} />
                  <Text style={styles.emptyActionText}>Add First Student</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={enrolledStudents}
                renderItem={renderStudentCard}
                keyExtractor={item => item.$id}
                scrollEnabled={false}
                contentContainerStyle={styles.studentsListContainer}
                showsVerticalScrollIndicator={false}
              />
            )
          ) : (
            waitingListStudents.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="time-outline" size={64} color={colors.neutral.lightGray} />
                <Text style={styles.emptyTitle}>No Students Waiting</Text>
                <Text style={styles.emptySubtitle}>
                  The waiting list is empty. Students will appear here when the class is full.
                </Text>
              </View>
            ) : (
              <FlatList
                data={waitingListStudents}
                renderItem={renderStudentCard}
                keyExtractor={item => item.$id}
                scrollEnabled={false}
                contentContainerStyle={styles.studentsListContainer}
                showsVerticalScrollIndicator={false}
              />
            )
          )}
        </View>
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

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral.gray,
    marginTop: spacing.md,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  addStudentHero: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 64,
    height: 64,
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
    marginBottom: spacing.lg,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.white,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.neutral.white,
    marginTop: -spacing.lg,
    marginHorizontal: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'center',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: airbnbColors.secondary,
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'center',
  },
  addButtonText: {
    color: airbnbColors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Search Section
  searchSection: {
    padding: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral.text,
    paddingVertical: spacing.sm,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: airbnbColors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray,
  },
  activeTabText: {
    color: colors.neutral.white,
  },

  // Students Content
  studentsContent: {
    backgroundColor: colors.neutral.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  studentsSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: spacing.md,
  },
  studentsListContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  // Student Cards
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  availableStudentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '700',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: colors.neutral.gray,
    marginBottom: 2,
  },
  studentPhone: {
    fontSize: 12,
    color: colors.neutral.gray,
  },
  studentGrade: {
    fontSize: 12,
    color: airbnbColors.secondary,
    fontWeight: '500',
  },

  // Actions
  studentActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  viewButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: airbnbColors.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: airbnbColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonContainer: {
    padding: spacing.sm,
  },

  // Empty States
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.neutral.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: airbnbColors.primary,
  },
  emptyActionText: {
    color: airbnbColors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});