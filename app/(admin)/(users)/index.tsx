import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Button from '../../../components/ui/Button';
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleModalVisible, setRoleModalVisible] = useState(false);
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

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      await appwriteService.assignRoleToUser(selectedUser.userId, selectedRole.$id);
      
      // Update user in local state
      const updatedUsers = users.map(user => {
        if (user.$id === selectedUser.$id) {
          return {
            ...user,
            roles: [...(user.roles || []), selectedRole.$id]
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setRoleModalVisible(false);
      Alert.alert('Success', `Role ${selectedRole.name} assigned to ${selectedUser.displayName}`);
    } catch (error) {
      console.error('Failed to assign role:', error);
      Alert.alert('Error', 'Failed to assign role to user');
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      await appwriteService.removeRoleFromUser(userId, roleId);
      
      // Update user in local state
      const updatedUsers = users.map(user => {
        if (user.userId === userId) {
          return {
            ...user,
            roles: (user.roles || []).filter(id => id !== roleId)
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      Alert.alert('Success', 'Role removed successfully');
    } catch (error) {
      console.error('Failed to remove role:', error);
      Alert.alert('Error', 'Failed to remove role from user');
    }
  };

  const handleUpdateStatus = async (user: User, newStatus: string) => {
    try {
      // Update user status in the backend
      await appwriteService.updateUserStatus(user.userId, newStatus);
      
      // Update user in local state
      const updatedUsers = users.map(u => {
        if (u.$id === user.$id) {
          return { ...u, status: newStatus };
        }
        return u;
      });
      
      setUsers(updatedUsers);
      Alert.alert('Success', `User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const getUserRoles = (user: User) => {
    if (!user.roles || user.roles.length === 0) return [];
    return roles.filter(role => user.roles?.includes(role.$id));
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(null);
    setRoleModalVisible(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
    const userRoles = getUserRoles(user);
    
    return (
      <View style={styles.userRow}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>
              {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.displayName || 'Unnamed User'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={12} color={colors.neutral.gray} />
                <Text style={styles.metaText}>Joined: {formatDate(user.createdAt)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={12} color={colors.neutral.gray} />
                <Text style={styles.metaText}>Last login: {formatDate(user.lastLoginAt)}</Text>
              </View>
            </View>
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
        
        <View style={styles.userRoles}>
          {userRoles.length > 0 ? (
            <View style={styles.rolesList}>
              {userRoles.map(role => (
                <View key={role.$id} style={styles.roleTag}>
                  <Text style={styles.roleText}>{role.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noRolesText}>No roles</Text>
          )}
        </View>
        
        <View style={styles.userActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openRoleModal(user)}
          >
            <Ionicons name="key-outline" size={18} color={colors.primary.main} />
            <Text style={styles.actionText}>Roles</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              const newStatus = user.status === 'active' ? 'suspended' : 'active';
              handleUpdateStatus(user, newStatus);
            }}
          >
            <Ionicons 
              name={user.status === 'active' ? "lock-closed-outline" : "lock-open-outline"} 
              size={18} 
              color={colors.secondary.main} 
            />
            <Text style={styles.actionText}>
              {user.status === 'active' ? 'Suspend' : 'Activate'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
              <Text style={styles.headerCell}>Roles</Text>
              <Text style={styles.headerCell}>Actions</Text>
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
      
      {/* Modal for assigning roles */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRoleModalVisible}
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Manage Roles for {selectedUser?.displayName}
            </Text>
            
            <Text style={styles.modalSubtitle}>Current Roles:</Text>
            {selectedUser && getUserRoles(selectedUser).length > 0 ? (
              <View style={styles.currentRoles}>
                {getUserRoles(selectedUser).map(role => (
                  <View key={role.$id} style={styles.modalRoleTag}>
                    <Text style={styles.modalRoleText}>{role.name}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveRole(selectedUser.userId, role.$id)}
                    >
                      <Ionicons name="close-circle" size={16} color={colors.status.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noRolesText}>No roles assigned</Text>
            )}
            
            <Text style={styles.modalSubtitle}>Assign New Role:</Text>
            <View style={styles.roleSelector}>
              {roles.map(role => (
                <TouchableOpacity
                  key={role.$id}
                  style={[
                    styles.roleSelectorItem,
                    selectedRole?.$id === role.$id && styles.selectedRoleItem
                  ]}
                  onPress={() => setSelectedRole(role)}
                >
                  <Text style={styles.roleSelectorText}>{role.name}</Text>
                  {selectedRole?.$id === role.$id && (
                    <Ionicons name="checkmark" size={16} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setRoleModalVisible(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Assign Role"
                onPress={handleAssignRole}
                disabled={!selectedRole}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  userInfo: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  userEmail: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  metaText: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray,
    marginLeft: 4,
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
  userRoles: {
    flex: 1,
  },
  rolesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roleTag: {
    backgroundColor: colors.primary.light + '30',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    margin: 2,
  },
  roleText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary.dark,
  },
  noRolesText: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.gray,
    fontStyle: 'italic',
  },
  userActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSizes.xs,
    marginLeft: 4,
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