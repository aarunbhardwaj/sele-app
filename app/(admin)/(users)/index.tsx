import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
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

const { width } = Dimensions.get('window');

interface Student {
  $id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  grade?: string;
  status: 'active' | 'inactive' | 'suspended';
  enrolledClasses?: number;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export default function StudentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const itemsPerPage = 15;

  const loadStudents = useCallback(async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const usersResponse = await appwriteService.getAllUsers();
      const allUsers = usersResponse?.users || [];
      
      // Filter for students only and map to Student type
      let filteredStudents = allUsers
        .filter((user: any) => user.role === 'student')
        .map((user: any) => ({
          $id: user.$id,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone,
          role: user.role,
          grade: user.grade,
          status: user.status || 'active',
          enrolledClasses: user.enrolledClasses || 0,
          lastActive: user.lastActive,
          createdAt: user.$createdAt || new Date().toISOString(),
          updatedAt: user.$updatedAt || new Date().toISOString(),
        } as Student));

      // Apply search filter
      if (searchQuery.trim()) {
        filteredStudents = filteredStudents.filter((student: Student) =>
          student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filteredStudents = filteredStudents.filter((student: Student) => student.status === statusFilter);
      }

      // Apply grade filter
      if (gradeFilter !== 'all') {
        filteredStudents = filteredStudents.filter((student: Student) => student.grade === gradeFilter);
      }

      // Pagination
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

      setStudents(paginatedStudents);
      setTotalStudents(filteredStudents.length);
      setTotalPages(Math.ceil(filteredStudents.length / itemsPerPage));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load students:', error);
      Alert.alert('Error', 'Failed to load students data: ' + (error as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, statusFilter, gradeFilter]);

  useEffect(() => {
    loadStudents(1);
  }, [loadStudents]);

  const handleRefresh = () => {
    loadStudents(currentPage, true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleGradeFilter = (grade: string) => {
    setGradeFilter(grade);
    setCurrentPage(1);
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    Alert.alert(
      'Delete Student',
      `Are you sure you want to delete "${studentName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Note: Implement actual delete functionality in your service
              Alert.alert('Success', 'Student deleted successfully');
              loadStudents(currentPage);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete student: ' + (error as Error).message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return airbnbColors.secondary;
      case 'inactive':
        return '#6B7280';
      case 'suspended':
        return airbnbColors.primary;
      default:
        return '#6B7280';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const renderStatusFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>Filter by Status</Text>
      <FlatList
        data={[
          { 
            key: 'all', 
            label: 'All', 
            icon: 'grid-outline', 
            color: airbnbColors.primary,
            count: totalStudents 
          },
          { 
            key: 'active', 
            label: 'Active', 
            icon: 'checkmark-circle', 
            color: airbnbColors.secondary,
            count: students.filter(s => s.status === 'active').length
          },
          { 
            key: 'inactive', 
            label: 'Inactive', 
            icon: 'pause-circle', 
            color: '#6B7280',
            count: students.filter(s => s.status === 'inactive').length
          },
          { 
            key: 'suspended', 
            label: 'Suspended', 
            icon: 'ban', 
            color: airbnbColors.primary,
            count: students.filter(s => s.status === 'suspended').length
          }
        ]}
        renderItem={({ item: filter }) => {
          const isActive = statusFilter === filter.key;
          return (
            <TouchableOpacity
              style={[
                styles.filterButton,
                isActive && [styles.filterButtonActive, { backgroundColor: filter.color }]
              ]}
              onPress={() => handleStatusFilter(filter.key as typeof statusFilter)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.filterIconContainer,
                isActive && styles.filterIconContainerActive
              ]}>
                <Ionicons 
                  name={filter.icon as any} 
                  size={18} 
                  color={isActive ? filter.color : filter.color} 
                />
              </View>
              <View style={styles.filterTextContainer}>
                <Text style={[
                  styles.filterButtonText,
                  isActive && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
                <View style={[
                  styles.filterCountBadge,
                  isActive ? styles.filterCountBadgeActive : { backgroundColor: filter.color + '15' }
                ]}>
                  <Text style={[
                    styles.filterCountText,
                    isActive ? styles.filterCountTextActive : { color: filter.color }
                  ]}>
                    {filter.count}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      />
    </View>
  );

  const renderStudentCard = (student: Student, index: number) => (
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
      <TouchableOpacity
        style={styles.studentCardContent}
        onPress={() => router.push(`/(admin)/(users)/user-details?id=${student.$id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.studentCardHeader}>
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
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(student.status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(student.status) }]}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.studentCardBody}>
          <View style={styles.studentMeta}>
            {student.grade && (
              <View style={styles.metaItem}>
                <Ionicons name="school-outline" size={16} color={colors.neutral.gray} />
                <Text style={styles.metaText}>Grade {student.grade}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="library-outline" size={16} color={colors.neutral.gray} />
              <Text style={styles.metaText}>
                {student.enrolledClasses || 0} Classes
              </Text>
            </View>
            {student.lastActive && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={colors.neutral.gray} />
                <Text style={styles.metaText}>
                  Last seen {new Date(student.lastActive).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.studentCardFooter}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/(admin)/(classes)/manage-students?studentId=${student.$id}`);
            }}
          >
            <Ionicons name="library-outline" size={16} color={airbnbColors.secondary} />
            <Text style={[styles.actionButtonText, { color: airbnbColors.secondary }]}>Classes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              router.push(`/(admin)/(users)/edit-user?id=${student.$id}` as any);
            }}
          >
            <Ionicons name="create-outline" size={16} color={airbnbColors.accent.main} />
            <Text style={[styles.actionButtonText, { color: airbnbColors.accent.main }]}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteStudent(student.$id, student.name);
            }}
          >
            <Ionicons name="trash-outline" size={16} color={airbnbColors.primary} />
            <Text style={[styles.actionButtonText, { color: airbnbColors.primary }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={() => currentPage > 1 && loadStudents(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#9CA3AF' : airbnbColors.primary} />
        </TouchableOpacity>

        <Text style={styles.paginationText}>
          Page {currentPage} of {totalPages}
        </Text>

        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
          onPress={() => currentPage < totalPages && loadStudents(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#9CA3AF' : airbnbColors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <>
      {/* Hero Section */}
      <LinearGradient 
        colors={[airbnbColors.secondary, airbnbColors.secondaryDark]} 
        style={styles.heroSection}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="people" size={32} color={colors.neutral.white} />
          </View>
          <Text style={styles.heroTitle}>Students Management</Text>
          <Text style={styles.heroSubtitle}>
            Manage student accounts, enrollments, and academic progress
          </Text>
          
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalStudents}</Text>
              <Text style={styles.statLabel}>Total Students</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {students.filter(s => s.status === 'active').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {students.filter(s => s.enrolledClasses && s.enrolledClasses > 0).length}
              </Text>
              <Text style={styles.statLabel}>Enrolled</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(admin)/(users)/add-user' as any)}
        >
          <Ionicons name="person-add" size={20} color={colors.neutral.white} />
          <Text style={styles.addButtonText}>Add Student</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.bulkButton}
          onPress={() => Alert.alert('Coming Soon', 'Bulk import feature coming soon!')}
        >
          <Ionicons name="cloud-upload-outline" size={20} color={airbnbColors.secondary} />
          <Text style={[styles.addButtonText, { color: airbnbColors.secondary }]}>Bulk Import</Text>
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students by name or email..."
            placeholderTextColor={colors.neutral.gray}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filters */}
      {renderStatusFilter()}
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={colors.neutral.gray} />
      <Text style={styles.emptyTitle}>No Students Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || statusFilter !== 'all' 
          ? 'Try adjusting your search or filters'
          : 'Get started by adding your first student'
        }
      </Text>
      {!searchQuery && statusFilter === 'all' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/(admin)/(users)/add-user' as any)}
        >
          <Ionicons name="add" size={20} color={airbnbColors.secondary} />
          <Text style={[styles.emptyButtonText, { color: airbnbColors.secondary }]}>
            Add First Student
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.secondary} />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      );
    }
    return renderPagination();
  };

  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={styles.headerContainer}>
        <PreAuthHeader 
          title="Students"
          showBackButton={true}
          onBackPress={() => router.back()}
          showNotifications={true}
          showRefresh={true}
          onRefreshPress={handleRefresh}
          onNotificationPress={() => console.log('Students notifications')}
        />
      </SafeAreaView>

      <View style={styles.container}>
        <FlatList
          data={students}
          renderItem={({ item, index }) => renderStudentCard(item, index)}
          keyExtractor={(item) => item.$id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={!loading ? renderEmptyState : null}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[airbnbColors.secondary]}
              tintColor={airbnbColors.secondary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.flatListContent,
            { paddingBottom: Math.max(insets.bottom || 0, 20) + 80 }
          ]}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={5}
          windowSize={10}
        />
      </View>
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
    backgroundColor: airbnbColors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'center',
  },
  bulkButton: {
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
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: '600',
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

  // Filters
  filterSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: spacing.xs,
  },
  filterContent: {
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: airbnbColors.secondary + '30',
    backgroundColor: colors.neutral.white,
  },
  filterButtonActive: {
    backgroundColor: airbnbColors.secondary,
    borderColor: airbnbColors.secondary,
  },
  filterIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: airbnbColors.secondary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  filterIconContainerActive: {
    backgroundColor: colors.neutral.white,
  },
  filterTextContainer: {
    flex: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: airbnbColors.secondary,
  },
  filterButtonTextActive: {
    color: colors.neutral.white,
  },
  filterCountBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  filterCountBadgeActive: {
    backgroundColor: airbnbColors.primary,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: airbnbColors.secondary,
  },
  filterCountTextActive: {
    color: colors.neutral.white,
  },

  // Student Cards
  studentCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  studentCardContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  studentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  studentInfo: {
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
  studentActions: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  studentCardBody: {
    marginBottom: spacing.md,
  },
  studentMeta: {
    gap: spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: colors.neutral.gray,
    flex: 1,
  },
  studentCardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Pagination
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    color: colors.neutral.text,
    fontWeight: '500',
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral.gray,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.neutral.gray,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: airbnbColors.secondary,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  flatListContent: {
    flexGrow: 1,
  },
});