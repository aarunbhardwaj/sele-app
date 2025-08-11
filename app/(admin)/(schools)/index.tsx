import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../../components/ui/theme';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';
import { School } from '../../../services/appwrite/school-service';

export default function SchoolsIndexPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive', 'pending'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterSchools();
  }, [schools, searchQuery, statusFilter, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load schools
      const schoolsResponse = await appwriteService.getAllSchools();
      setSchools(schoolsResponse);
      
      // Calculate total pages
      setTotalPages(Math.ceil(schoolsResponse.length / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Failed to load schools data:', error);
      Alert.alert('Error', 'Failed to load schools data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterSchools = () => {
    // Apply filters
    let filtered = [...schools];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(school => 
        school.name?.toLowerCase().includes(query) || 
        school.email?.toLowerCase().includes(query) ||
        school.city?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(school => school.status === statusFilter);
    }
    
    // Calculate total pages after filtering
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    
    // Apply pagination
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedSchools = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    setFilteredSchools(paginatedSchools);
  };

  const navigateToSchoolDetail = (school: School) => {
    // Navigate to school details screen with school data
    console.log('Navigating to school details with ID:', school.$id);
    router.push({
      pathname: '/(admin)/(schools)/school-details',
      params: { 
        id: school.$id,
        name: school.name
      }
    });
  };

  const handleAddNewSchool = () => {
    router.push('/(admin)/(schools)/add-school');
  };

  const handleDeleteSchool = async (schoolId: string) => {
    try {
      // Confirm delete
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this school? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await appwriteService.deleteSchool(schoolId);
              Alert.alert('Success', 'School deleted successfully');
              loadData(); // Reload the data
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting school:', error);
      Alert.alert('Error', 'Failed to delete school. Please try again.');
    }
  };

  const renderFilterBar = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.neutral.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search schools..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollableFilters 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />
    </View>
  );

  const renderSchoolRow = (school: School) => {
    return (
      <TouchableOpacity 
        style={styles.schoolRow}
        onPress={() => navigateToSchoolDetail(school)}
        activeOpacity={0.7}
      >
        <View style={styles.schoolInfo}>
          <View style={styles.schoolAvatar}>
            <Text style={styles.avatarText}>
              {school.name ? school.name[0].toUpperCase() : 'S'}
            </Text>
          </View>
          <View style={styles.schoolDetails}>
            <Text style={styles.schoolName}>{school.name || 'Unnamed School'}</Text>
            <Text style={styles.schoolEmail}>{school.email}</Text>
            <Text style={styles.schoolLocation}>{school.city}, {school.state}</Text>
          </View>
        </View>
        
        <View style={styles.schoolStatus}>
          <View style={[
            styles.statusBadge,
            school.status === 'active' && styles.activeBadge,
            school.status === 'inactive' && styles.inactiveBadge,
            school.status === 'pending' && styles.pendingBadge,
          ]}>
            <Text style={styles.statusText}>
              {school.status || 'Unknown'}
            </Text>
          </View>
        </View>
        
        <View style={styles.schoolEnrollment}>
          <Text style={styles.enrollmentText}>
            {school.enrollmentCount || 0} students
          </Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigateToSchoolDetail(school)}
          >
            <Ionicons name="eye-outline" size={18} color={colors.primary.main} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: '/(admin)/(schools)/edit-school',
              params: { id: school.$id }
            })}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.secondary.main} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDeleteSchool(school.$id || '')}
          >
            <Ionicons name="trash-outline" size={18} color={colors.status.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, page === 1 && styles.disabledButton]}
        onPress={() => setPage(prev => Math.max(1, prev - 1))}
        disabled={page === 1}
      >
        <Ionicons name="chevron-back" size={18} color={page === 1 ? colors.neutral.gray : colors.primary.main} />
        <Text style={[styles.paginationText, page === 1 && styles.disabledText]}>Previous</Text>
      </TouchableOpacity>
      
      <Text style={styles.pageInfo}>
        Page {page} of {totalPages}
      </Text>
      
      <TouchableOpacity
        style={[styles.paginationButton, page === totalPages && styles.disabledButton]}
        onPress={() => setPage(prev => Math.min(totalPages, prev + 1))}
        disabled={page === totalPages}
      >
        <Text style={[styles.paginationText, page === totalPages && styles.disabledText]}>Next</Text>
        <Ionicons name="chevron-forward" size={18} color={page === totalPages ? colors.neutral.gray : colors.primary.main} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader title="School Management" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading schools...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="School Management" 
        rightComponent={
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={loadData}
            >
              <Ionicons name="refresh-outline" size={24} color="#333333" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddNewSchool}
            >
              <Ionicons name="add-outline" size={24} color="#333333" />
            </TouchableOpacity>
          </View>
        }
      />
      
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>School Directory</Text>
          <Text style={styles.headerSubtitle}>
            {schools.length} total schools • {filteredSchools.length} shown
          </Text>
        </View>
        
        {renderFilterBar()}
        
        {filteredSchools.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={48} color={colors.neutral.lightGray} />
            <Text style={styles.emptyText}>No schools found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters or add a new school</Text>
            <TouchableOpacity
              style={styles.addSchoolButton}
              onPress={handleAddNewSchool}
            >
              <Text style={styles.addSchoolButtonText}>Add New School</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 2 }]}>School</Text>
              <Text style={styles.headerCell}>Status</Text>
              <Text style={styles.headerCell}>Enrollment</Text>
              <Text style={[styles.headerCell, { flex: 1.2 }]}>Actions</Text>
            </View>
            
            <FlatList
              data={filteredSchools}
              renderItem={({ item }) => renderSchoolRow(item)}
              keyExtractor={item => item.$id || Math.random().toString()}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
            
            {renderPagination()}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// Helper component for horizontal scrollable filters
const ScrollableFilters = ({ 
  statusFilter, 
  setStatusFilter,
}: { 
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filtersScrollContent}
    >
      {/* Status filters */}
      <TouchableOpacity
        style={[styles.filterChip, statusFilter === 'all' && styles.activeFilterChip]}
        onPress={() => setStatusFilter('all')}
      >
        <Text style={[styles.filterText, statusFilter === 'all' && styles.activeFilterText]}>
          All Schools
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterChip, statusFilter === 'active' && styles.activeFilterChip]}
        onPress={() => setStatusFilter('active')}
      >
        <Text style={[styles.filterText, statusFilter === 'active' && styles.activeFilterText]}>
          Active
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterChip, statusFilter === 'inactive' && styles.activeFilterChip]}
        onPress={() => setStatusFilter('inactive')}
      >
        <Text style={[styles.filterText, statusFilter === 'inactive' && styles.activeFilterText]}>
          Inactive
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterChip, statusFilter === 'pending' && styles.activeFilterChip]}
        onPress={() => setStatusFilter('pending')}
      >
        <Text style={[styles.filterText, statusFilter === 'pending' && styles.activeFilterText]}>
          Pending
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  headerContainer: {
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.gray,
    marginTop: spacing.sm,
  },
  filtersContainer: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: spacing.xs,
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
  },
  filtersScrollContent: {
    paddingVertical: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  activeFilterChip: {
    backgroundColor: colors.primary.light,
  },
  filterText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
  },
  activeFilterText: {
    color: colors.neutral.white,
    fontWeight: typography.fontWeights.medium as any,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  headerCell: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.neutral.darkGray,
  },
  listContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  schoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  schoolInfo: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  schoolAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold as any,
  },
  schoolDetails: {
    flex: 1,
  },
  schoolName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral.text,
    marginBottom: 4,
  },
  schoolEmail: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray,
    marginBottom: 2,
  },
  schoolLocation: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray,
  },
  schoolStatus: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.lightGray,
  },
  activeBadge: {
    backgroundColor: colors.status.success + '20',
  },
  inactiveBadge: {
    backgroundColor: colors.status.error + '20',
  },
  pendingBadge: {
    backgroundColor: colors.status.warning + '20',
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral.darkGray,
    textTransform: 'capitalize',
  },
  schoolEnrollment: {
    flex: 1,
    alignItems: 'flex-start',
  },
  enrollmentText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
  },
  actions: {
    flex: 1.2,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    color: colors.neutral.darkGray,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.gray,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  addSchoolButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  addSchoolButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium as any,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.background,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary.main,
    marginHorizontal: spacing.xs,
  },
  disabledText: {
    color: colors.neutral.gray,
  },
  pageInfo: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
    marginRight: 8,
  },
  addButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
  },
});
