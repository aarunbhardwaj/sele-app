import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  RefreshControl,
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
import appwriteService from '../../../services/appwrite';

// Airbnb-inspired color palette (extracted for reuse)
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#E8484D',
  primaryLight: '#FFE8E9',
  secondary: '#00A699',
  secondaryLight: '#E0F7F5',
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

const { width } = Dimensions.get('window');

interface Instructor {
  $id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  experience?: string;
  status: 'available' | 'assigned' | 'unavailable';
  currentAssignments?: string[];
  maxClasses?: number;
  isActive: boolean;
}

interface SchoolDemand {
  $id: string;
  name: string;
  address: string;
  city: string;
  totalClasses: number;
  unassignedClasses: number;
  assignedInstructors: number;
  demandLevel: 'low' | 'medium' | 'high' | 'urgent';
  classes: ClassDemand[];
}

interface ClassDemand {
  $id: string;
  title: string;
  subject: string;
  grade: string;
  schedule?: string;
  duration?: number;
  enrolledStudents: number;
  maxStudents: number;
  instructorId?: string;
  instructorName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'inactive' | 'full' | 'archived';
}

interface Assignment {
  instructorId: string;
  classId: string;
  schoolId: string;
  startDate: string;
  isTemporary?: boolean;
  notes?: string;
}

export default function RosterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [schoolDemands, setSchoolDemands] = useState<SchoolDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'assigned' | 'unavailable'>('all');
  const [demandFilter, setDemandFilter] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');
  const [activeView, setActiveView] = useState<'overview' | 'assign' | 'shuffle'>('overview');
  
  // Assignment Modal State
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassDemand | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<SchoolDemand | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isTemporaryAssignment, setIsTemporaryAssignment] = useState(false);

  const loadData = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Load instructors
      const allUsers = await appwriteService.getAllUsers();
      const instructorUsers = allUsers.users?.filter((user: any) => 
        user.role === 'instructor' || user.isInstructor
      ) || [];

      // Transform and enrich instructor data
      const instructorsWithAssignments = await Promise.all(
        instructorUsers.map(async (user: any) => {
          try {
            const assignedClasses = await appwriteService.getClassesByInstructor(user.$id);
            return {
              $id: user.$id,
              userId: user.$id,
              name: user.name || user.displayName || 'Unknown',
              email: user.email || '',
              phone: user.phone,
              specialization: user.specialization || 'General',
              experience: user.experience || 'Not specified',
              status: assignedClasses.length === 0 ? 'available' : 
                      assignedClasses.length >= (user.maxClasses || 5) ? 'unavailable' : 'assigned',
              currentAssignments: assignedClasses.map(c => c.$id),
              maxClasses: user.maxClasses || 5,
              isActive: user.isActive !== false
            } as Instructor;
          } catch (error) {
            console.error('Error loading instructor assignments:', error);
            return {
              $id: user.$id,
              userId: user.$id,
              name: user.name || user.displayName || 'Unknown',
              email: user.email || '',
              status: 'available',
              currentAssignments: [],
              maxClasses: 5,
              isActive: true
            } as Instructor;
          }
        })
      );

      setInstructors(instructorsWithAssignments);

      // Load schools and their class demands
      const allSchools = await appwriteService.getAllSchools();
      const schoolsWithDemands = await Promise.all(
        allSchools.documents.map(async (school: any) => {
          try {
            const schoolClasses = await appwriteService.getClassesBySchool(school.$id);
            
            const classesWithDemand = schoolClasses.map(classItem => {
              const enrollmentRate = classItem.maxStudents ? 
                (classItem.currentEnrollment || 0) / classItem.maxStudents : 0;
              
              return {
                $id: classItem.$id,
                title: classItem.title,
                subject: classItem.subject,
                grade: classItem.grade,
                schedule: classItem.schedule,
                duration: classItem.duration,
                enrolledStudents: classItem.currentEnrollment || 0,
                maxStudents: classItem.maxStudents || 0,
                instructorId: classItem.instructorId,
                instructorName: classItem.instructorName,
                priority: !classItem.instructorId ? 'urgent' :
                         enrollmentRate > 0.8 ? 'high' :
                         enrollmentRate > 0.5 ? 'medium' : 'low',
                status: classItem.status
              } as ClassDemand;
            });

            const unassignedCount = classesWithDemand.filter(c => !c.instructorId).length;
            const assignedInstructorCount = new Set(
              classesWithDemand.filter(c => c.instructorId).map(c => c.instructorId)
            ).size;

            const demandLevel = unassignedCount === 0 ? 'low' :
                              unassignedCount <= 2 ? 'medium' :
                              unassignedCount <= 5 ? 'high' : 'urgent';

            return {
              $id: school.$id,
              name: school.name,
              address: school.address,
              city: school.city,
              totalClasses: classesWithDemand.length,
              unassignedClasses: unassignedCount,
              assignedInstructors: assignedInstructorCount,
              demandLevel,
              classes: classesWithDemand
            } as SchoolDemand;
          } catch (error) {
            console.error('Error loading school classes:', error);
            return {
              $id: school.$id,
              name: school.name,
              address: school.address,
              city: school.city,
              totalClasses: 0,
              unassignedClasses: 0,
              assignedInstructors: 0,
              demandLevel: 'low' as const,
              classes: []
            } as SchoolDemand;
          }
        })
      );

      setSchoolDemands(schoolsWithDemands);
    } catch (error) {
      console.error('Failed to load roster data:', error);
      Alert.alert('Error', 'Failed to load roster data: ' + (error as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await appwriteService.getAllUsers();
      setAllUsers(users);
      setFilteredUsers(users);
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadClassesForEnrollment = useCallback(async () => {
    try {
      if (!selectedSchool?.$id) return;
      
      const availableClasses = await appwriteService.getAvailableClassesForEnrollment(selectedSchool.$id);
      setAvailableClasses(availableClasses);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  }, [selectedSchool]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData(true);
  };

  const handleAssignInstructor = async () => {
    if (!selectedInstructor || !selectedClass || !selectedSchool) {
      Alert.alert('Error', 'Please select an instructor and class');
      return;
    }

    try {
      setLoading(true);
      
      // Assign instructor to class
      await appwriteService.assignInstructorToClass(
        selectedClass.$id, 
        selectedInstructor.$id
      );

      Alert.alert('Success', 'Instructor assigned successfully!');
      setShowAssignmentModal(false);
      setSelectedInstructor(null);
      setSelectedClass(null);
      setSelectedSchool(null);
      setAssignmentNotes('');
      loadData(true);
    } catch (error) {
      console.error('Failed to assign instructor:', error);
      Alert.alert('Error', 'Failed to assign instructor: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (classId: string, instructorName: string) => {
    Alert.alert(
      'Remove Assignment',
      `Are you sure you want to remove ${instructorName} from this class?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await appwriteService.removeInstructorFromClass(classId, '');
              Alert.alert('Success', 'Assignment removed successfully');
              loadData(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove assignment');
            }
          }
        }
      ]
    );
  };

  const handleEnrollStudentInClass = async (userId: string, classId: string) => {
    try {
      await appwriteService.enrollStudent(classId, userId);
      Alert.alert('Success', 'Student enrolled successfully');
      loadUsers(); // Refresh the data
    } catch (error) {
      console.error('Failed to enroll student:', error);
      Alert.alert('Error', 'Failed to enroll student: ' + (error as Error).message);
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'urgent': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      case 'low': return '#65A30D';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return airbnbColors.secondary;
      case 'assigned': return '#D97706';
      case 'unavailable': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || instructor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSchools = schoolDemands.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         school.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDemand = demandFilter === 'all' || school.demandLevel === demandFilter;
    return matchesSearch && matchesDemand;
  });

  const renderHeader = () => (
    <>
      {/* Hero Section */}
      <LinearGradient 
        colors={[airbnbColors.primary, airbnbColors.primaryDark]} 
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="people" size={32} color={colors.neutral.white} />
          </View>
          <Text style={styles.heroTitle}>Staff Roster Management</Text>
          <Text style={styles.heroSubtitle}>
            Assign instructors to schools and manage daily teaching schedules
          </Text>
          
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {instructors.filter(i => i.status === 'available').length}
              </Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {schoolDemands.reduce((acc, school) => acc + school.unassignedClasses, 0)}
              </Text>
              <Text style={styles.statLabel}>Unassigned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {schoolDemands.filter(s => s.demandLevel === 'urgent' || s.demandLevel === 'high').length}
              </Text>
              <Text style={styles.statLabel}>High Priority</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, activeView === 'overview' && styles.activeToggleButton]}
          onPress={() => setActiveView('overview')}
        >
          <Ionicons 
            name="grid-outline" 
            size={18} 
            color={activeView === 'overview' ? colors.neutral.white : airbnbColors.primary} 
          />
          <Text style={[
            styles.toggleButtonText, 
            activeView === 'overview' && styles.activeToggleButtonText
          ]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleButton, activeView === 'assign' && styles.activeToggleButton]}
          onPress={() => setActiveView('assign')}
        >
          <Ionicons 
            name="person-add-outline" 
            size={18} 
            color={activeView === 'assign' ? colors.neutral.white : airbnbColors.primary} 
          />
          <Text style={[
            styles.toggleButtonText, 
            activeView === 'assign' && styles.activeToggleButtonText
          ]}>
            Assign
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.toggleButton, activeView === 'shuffle' && styles.activeToggleButton]}
          onPress={() => setActiveView('shuffle')}
        >
          <Ionicons 
            name="shuffle-outline" 
            size={18} 
            color={activeView === 'shuffle' ? colors.neutral.white : airbnbColors.primary} 
          />
          <Text style={[
            styles.toggleButtonText, 
            activeView === 'shuffle' && styles.activeToggleButtonText
          ]}>
            Shuffle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder={activeView === 'overview' ? "Search schools or instructors..." : 
                        activeView === 'assign' ? "Search instructors or classes..." :
                        "Search for staff reshuffling..."}
            placeholderTextColor={colors.neutral.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );

  const renderInstructorCard = (instructor: Instructor) => (
    <View style={styles.instructorCard} key={instructor.$id}>
      <View style={styles.instructorHeader}>
        <View style={styles.instructorInfo}>
          <View style={[styles.avatarContainer, { backgroundColor: getStatusColor(instructor.status) }]}>
            <Text style={styles.avatarText}>
              {getInitials(instructor.name)}
            </Text>
          </View>
          <View style={styles.instructorDetails}>
            <Text style={styles.instructorName}>{instructor.name}</Text>
            <Text style={styles.instructorEmail}>{instructor.email}</Text>
            <Text style={styles.instructorSpecialization}>
              {instructor.specialization} • {instructor.experience}
            </Text>
          </View>
        </View>
        <View style={styles.instructorMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(instructor.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(instructor.status) }]}>
              {instructor.status.charAt(0).toUpperCase() + instructor.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.assignmentCount}>
            {instructor.currentAssignments?.length || 0}/{instructor.maxClasses} Classes
          </Text>
        </View>
      </View>
      
      {activeView === 'assign' && (
        <TouchableOpacity
          style={[
            styles.selectButton,
            selectedInstructor?.$id === instructor.$id && styles.selectedButton
          ]}
          onPress={() => setSelectedInstructor(
            selectedInstructor?.$id === instructor.$id ? null : instructor
          )}
        >
          <Text style={[
            styles.selectButtonText,
            selectedInstructor?.$id === instructor.$id && styles.selectedButtonText
          ]}>
            {selectedInstructor?.$id === instructor.$id ? 'Selected' : 'Select'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSchoolCard = (school: SchoolDemand) => (
    <View style={styles.schoolCard} key={school.$id}>
      <View style={styles.schoolHeader}>
        <View style={styles.schoolInfo}>
          <Text style={styles.schoolName}>{school.name}</Text>
          <Text style={styles.schoolLocation}>{school.address}, {school.city}</Text>
        </View>
        <View style={[styles.demandBadge, { backgroundColor: getDemandColor(school.demandLevel) + '15' }]}>
          <Text style={[styles.demandText, { color: getDemandColor(school.demandLevel) }]}>
            {school.demandLevel.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.schoolStats}>
        <View style={styles.schoolStatItem}>
          <Text style={styles.schoolStatNumber}>{school.totalClasses}</Text>
          <Text style={styles.schoolStatLabel}>Total Classes</Text>
        </View>
        <View style={styles.schoolStatItem}>
          <Text style={[styles.schoolStatNumber, { color: '#DC2626' }]}>
            {school.unassignedClasses}
          </Text>
          <Text style={styles.schoolStatLabel}>Unassigned</Text>
        </View>
        <View style={styles.schoolStatItem}>
          <Text style={[styles.schoolStatNumber, { color: airbnbColors.secondary }]}>
            {school.assignedInstructors}
          </Text>
          <Text style={styles.schoolStatLabel}>Instructors</Text>
        </View>
      </View>

      {/* Show classes for assignment view */}
      {activeView === 'assign' && (
        <View style={styles.classesSection}>
          <Text style={styles.classesSectionTitle}>Classes Needing Assignment</Text>
          {school.classes.filter(c => !c.instructorId).map(classItem => (
            <TouchableOpacity
              key={classItem.$id}
              style={[
                styles.classItem,
                selectedClass?.$id === classItem.$id && styles.selectedClassItem
              ]}
              onPress={() => {
                setSelectedClass(selectedClass?.$id === classItem.$id ? null : classItem);
                setSelectedSchool(school);
              }}
            >
              <View style={styles.classInfo}>
                <Text style={styles.className}>{classItem.title}</Text>
                <Text style={styles.classDetails}>
                  {classItem.subject} • Grade {classItem.grade} • {classItem.enrolledStudents}/{classItem.maxStudents} students
                </Text>
                {classItem.schedule && (
                  <Text style={styles.classSchedule}>{classItem.schedule}</Text>
                )}
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getDemandColor(classItem.priority) }]}>
                <Text style={styles.priorityText}>{classItem.priority.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderAssignmentModal = () => (
    <Modal
      visible={showAssignmentModal}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Assignment</Text>
            <TouchableOpacity onPress={() => setShowAssignmentModal(false)}>
              <Ionicons name="close" size={24} color={colors.neutral.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.assignmentPreview}>
            <Text style={styles.previewLabel}>Instructor:</Text>
            <Text style={styles.previewValue}>{selectedInstructor?.name}</Text>
            
            <Text style={styles.previewLabel}>Class:</Text>
            <Text style={styles.previewValue}>{selectedClass?.title}</Text>
            
            <Text style={styles.previewLabel}>School:</Text>
            <Text style={styles.previewValue}>{selectedSchool?.name}</Text>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAssignmentModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleAssignInstructor}
            >
              <Text style={styles.confirmButtonText}>Assign</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <Text style={styles.loadingText}>Loading roster data...</Text>
        </View>
      );
    }

    switch (activeView) {
      case 'overview':
        return (
          <View style={styles.overviewContent}>
            <Text style={styles.sectionTitle}>School Demands</Text>
            {filteredSchools.map(renderSchoolCard)}
            
            <Text style={styles.sectionTitle}>Available Instructors</Text>
            {filteredInstructors.filter(i => i.status === 'available').map(renderInstructorCard)}
          </View>
        );
        
      case 'assign':
        return (
          <View style={styles.assignContent}>
            <View style={styles.assignmentSection}>
              <Text style={styles.sectionTitle}>
                Select Instructor {selectedInstructor && `(${selectedInstructor.name})`}
              </Text>
              {filteredInstructors.filter(i => i.status !== 'unavailable').map(renderInstructorCard)}
            </View>
            
            <View style={styles.assignmentSection}>
              <Text style={styles.sectionTitle}>
                Select Class {selectedClass && `(${selectedClass.title})`}
              </Text>
              {filteredSchools.map(renderSchoolCard)}
            </View>
            
            {selectedInstructor && selectedClass && (
              <TouchableOpacity
                style={styles.assignButton}
                onPress={() => setShowAssignmentModal(true)}
              >
                <Ionicons name="person-add" size={20} color={colors.neutral.white} />
                <Text style={styles.assignButtonText}>
                  Assign {selectedInstructor.name} to {selectedClass.title}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
        
      case 'shuffle':
        return (
          <View style={styles.shuffleContent}>
            <Text style={styles.sectionTitle}>Current Assignments</Text>
            {schoolDemands.map(school => (
              <View key={school.$id} style={styles.shuffleSchoolCard}>
                <Text style={styles.shuffleSchoolName}>{school.name}</Text>
                {school.classes.filter(c => c.instructorId).map(classItem => (
                  <View key={classItem.$id} style={styles.shuffleAssignmentItem}>
                    <View style={styles.shuffleAssignmentInfo}>
                      <Text style={styles.shuffleClassName}>{classItem.title}</Text>
                      <Text style={styles.shuffleInstructorName}>
                        {classItem.instructorName}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeAssignmentButton}
                      onPress={() => handleRemoveAssignment(classItem.$id, classItem.instructorName || '')}
                    >
                      <Ionicons name="close" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ))}
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={styles.headerContainer}>
        <PreAuthHeader 
          title="Staff Roster"
          showBackButton={true}
          onBackPress={() => router.back()}
          showNotifications={true}
          showRefresh={true}
          onRefreshPress={handleRefresh}
          onNotificationPress={() => console.log('Roster notifications')}
        />
      </SafeAreaView>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[airbnbColors.primary]}
            tintColor={airbnbColors.primary}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 80 }
        ]}
      >
        {renderHeader()}
        {renderContent()}
      </ScrollView>

      {renderAssignmentModal()}
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
    lineHeight: 20,
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

  // View Toggle
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  activeToggleButton: {
    backgroundColor: airbnbColors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: airbnbColors.primary,
  },
  activeToggleButtonText: {
    color: colors.neutral.white,
  },

  // Search Section
  searchSection: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.neutral.text,
  },

  // Loading
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

  // Content Sections
  overviewContent: {
    paddingHorizontal: spacing.lg,
  },
  assignContent: {
    paddingHorizontal: spacing.lg,
  },
  shuffleContent: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  assignmentSection: {
    marginBottom: spacing.lg,
  },

  // Instructor Cards
  instructorCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  instructorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  instructorInfo: {
    flexDirection: 'row',
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
  instructorDetails: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  instructorEmail: {
    fontSize: 14,
    color: colors.neutral.gray,
    marginBottom: 4,
  },
  instructorSpecialization: {
    fontSize: 12,
    color: colors.neutral.gray,
  },
  instructorMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  assignmentCount: {
    fontSize: 12,
    color: colors.neutral.gray,
  },

  // School Cards
  schoolCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  schoolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: 4,
  },
  schoolLocation: {
    fontSize: 14,
    color: colors.neutral.gray,
  },
  demandBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  demandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  schoolStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  schoolStatItem: {
    alignItems: 'center',
  },
  schoolStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.text,
  },
  schoolStatLabel: {
    fontSize: 12,
    color: colors.neutral.gray,
    marginTop: 2,
  },

  // Classes Section
  classesSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  classesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: spacing.sm,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedClassItem: {
    backgroundColor: airbnbColors.primary + '15',
    borderColor: airbnbColors.primary,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  classDetails: {
    fontSize: 12,
    color: colors.neutral.gray,
    marginBottom: 2,
  },
  classSchedule: {
    fontSize: 12,
    color: airbnbColors.secondary,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral.white,
  },

  // Selection Buttons
  selectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: airbnbColors.primary,
    marginTop: spacing.sm,
  },
  selectedButton: {
    backgroundColor: airbnbColors.primary,
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: airbnbColors.primary,
    textAlign: 'center',
  },
  selectedButtonText: {
    color: colors.neutral.white,
  },

  // Assignment Button
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: airbnbColors.secondary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  assignButtonText: {
    color: colors.neutral.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Shuffle Content
  shuffleSchoolCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  shuffleSchoolName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: spacing.md,
  },
  shuffleAssignmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  shuffleAssignmentInfo: {
    flex: 1,
  },
  shuffleClassName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: 2,
  },
  shuffleInstructorName: {
    fontSize: 12,
    color: airbnbColors.secondary,
  },
  removeAssignmentButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.text,
  },
  assignmentPreview: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 16,
    color: colors.neutral.text,
    marginBottom: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.gray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.gray,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: airbnbColors.secondary,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
});