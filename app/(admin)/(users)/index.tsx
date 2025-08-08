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

// Define interfaces
interface User {
  $id: string;
  userId: string;
  displayName: string;
  email: string;
  isAdmin?: boolean;
  roles?: string[];
  profileImage?: string;
  status?: string; // 'active', 'suspended', 'pending'
  createdAt?: string;
  lastLoginAt?: string;
}

interface Role {
  $id: string;
  name: string;
}

export default function UsersIndexPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'suspended'
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, statusFilter, roleFilter, page]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load users and roles in parallel
      const [usersResponse, rolesResponse] = await Promise.all([
        appwriteService.getAllUsers(),
        appwriteService.getAllRoles()
      ]);
      
      setUsers(usersResponse);
      setRoles(rolesResponse);
      
      // Calculate total pages
      setTotalPages(Math.ceil(usersResponse.length / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load users data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    // Apply filters
    let filtered = [...users];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(query) || 
        user.email?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => 
        user.roles?.includes(roleFilter)
      );
    }
    
    // Calculate total pages after filtering
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    
    // Apply pagination
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedUsers = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    setFilteredUsers(paginatedUsers);
  };

  const getUserRoles = (user: User) => {
    if (!user.roles || user.roles.length === 0) return [];
    return roles.filter(role => user.roles?.includes(role.$id));
  };

  const getUserRoleName = (user: User): string => {
    if (user.isAdmin) return 'Admin';
    
    const userRoles = getUserRoles(user);
    if (userRoles.some(role => role.name.toLowerCase().includes('admin'))) {
      return 'Admin';
    } else if (userRoles.some(role => role.name.toLowerCase().includes('instructor'))) {
      return 'Instructor';
    } else {
      return 'Student';
    }
  };

  const navigateToUserProfile = (user: User) => {
    // Navigate to user profile details screen with all user data
    console.log('Navigating to user profile with ID:', user.userId || user.$id);
    router.push({
      pathname: '/(admin)/(users)/user-details',
      params: { 
        id: user.userId || user.$id,
        // Pass more data to avoid unnecessary API calls
        displayName: user.displayName,
        email: user.email,
        status: user.status,
        isAdmin: user.isAdmin ? 'true' : 'false'
      }
    });
  };

  const renderFilterBar = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.neutral.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollableFilters 
        statusFilter={statusFilter}
        roleFilter={roleFilter}
        setStatusFilter={setStatusFilter}
        setRoleFilter={setRoleFilter}
        roles={roles}
      />
    </View>
  );

  const renderUserRow = (user: User) => {
    const roleName = getUserRoleName(user);
    
    return (
      <TouchableOpacity 
        style={styles.userRow}
        onPress={() => navigateToUserProfile(user)}
        activeOpacity={0.7}
      >
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>
              {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.displayName || 'Unnamed User'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        </View>
        
        <View style={styles.userStatus}>
          <View style={[
            styles.statusBadge,
            user.status === 'active' && styles.activeBadge,
            user.status === 'suspended' && styles.suspendedBadge,
            user.status === 'pending' && styles.pendingBadge,
          ]}>
            <Text style={styles.statusText}>
              {user.status || 'Active'}
            </Text>
          </View>
        </View>
        
        <View style={styles.userRole}>
          <View style={[
            styles.roleBadge,
            roleName === 'Admin' && styles.adminRoleBadge,
            roleName === 'Instructor' && styles.instructorRoleBadge,
            roleName === 'Student' && styles.studentRoleBadge,
          ]}>
            <Text style={[
              styles.roleText,
              roleName === 'Admin' && styles.adminRoleText,
              roleName === 'Instructor' && styles.instructorRoleText,
              roleName === 'Student' && styles.studentRoleText,
            ]}>
              {roleName}
            </Text>
          </View>
        </View>
        
        <View style={styles.viewDetailsContainer}>
          <Ionicons name="chevron-forward" size={18} color={colors.neutral.gray} />
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
        <PreAuthHeader title="User Management" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="User Management" 
        rightComponent={
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadData}
          >
            <Ionicons name="refresh-outline" size={24} color="#333333" />
          </TouchableOpacity>
        }
      />
      
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>User Directory</Text>
          <Text style={styles.headerSubtitle}>
            {users.length} total users • {filteredUsers.length} shown
          </Text>
        </View>
        
        {renderFilterBar()}
        
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.neutral.lightGray} />
            <Text style={styles.emptyText}>No users found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, { flex: 2 }]}>User</Text>
              <Text style={styles.headerCell}>Status</Text>
              <Text style={styles.headerCell}>Role</Text>
              <Text style={[styles.headerCell, { flex: 0.5 }]}></Text>
            </View>
            
            <FlatList
              data={filteredUsers}
              renderItem={({ item }) => renderUserRow(item)}
              keyExtractor={item => item.$id}
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
  roleFilter, 
  setStatusFilter, 
  setRoleFilter,
  roles
}: { 
  statusFilter: string;
  roleFilter: string;
  setStatusFilter: (filter: string) => void;
  setRoleFilter: (filter: string) => void;
  roles: Role[];
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
          All Users
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
        style={[styles.filterChip, statusFilter === 'suspended' && styles.activeFilterChip]}
        onPress={() => setStatusFilter('suspended')}
      >
        <Text style={[styles.filterText, statusFilter === 'suspended' && styles.activeFilterText]}>
          Suspended
        </Text>
      </TouchableOpacity>
      
      <View style={styles.filterDivider} />
      
      {/* Role filters */}
      <TouchableOpacity
        style={[styles.filterChip, roleFilter === 'all' && styles.activeFilterChip]}
        onPress={() => setRoleFilter('all')}
      >
        <Text style={[styles.filterText, roleFilter === 'all' && styles.activeFilterText]}>
          All Roles
        </Text>
      </TouchableOpacity>
      
      {roles.map(role => (
        <TouchableOpacity
          key={role.$id}
          style={[styles.filterChip, roleFilter === role.$id && styles.activeFilterChip]}
          onPress={() => setRoleFilter(role.$id)}
        >
          <Text style={[styles.filterText, roleFilter === role.$id && styles.activeFilterText]}>
            {role.name}
          </Text>
        </TouchableOpacity>
      ))}
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
  filterDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.neutral.lightGray,
    marginHorizontal: spacing.sm,
    alignSelf: 'center',
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
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  userInfo: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray,
    marginBottom: 6,
  },
  userStatus: {
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
  suspendedBadge: {
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
  userRole: {
    flex: 1,
    alignItems: 'flex-start',
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.lightGray,
  },
  adminRoleBadge: {
    backgroundColor: colors.primary.main + '20',
  },
  instructorRoleBadge: {
    backgroundColor: colors.secondary.main + '20',
  },
  studentRoleBadge: {
    backgroundColor: colors.status.info + '20',
  },
  roleText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral.darkGray,
  },
  adminRoleText: {
    color: colors.primary.main,
  },
  instructorRoleText: {
    color: colors.secondary.main,
  },
  studentRoleText: {
    color: colors.status.info,
  },
  viewDetailsContainer: {
    flex: 0.5,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  refreshButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral.darkGray,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  currentRoles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  modalRoleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    margin: 2,
  },
  modalRoleText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.white,
    marginRight: spacing.xs,
  },
  roleSelector: {
    maxHeight: 200,
  },
  roleSelectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  selectedRoleItem: {
    backgroundColor: colors.primary.light + '20',
  },
  roleSelectorText: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});