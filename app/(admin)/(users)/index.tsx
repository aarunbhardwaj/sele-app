import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Typography from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import { Role, UserProfile } from '../../../lib/types';
import appwriteService from '../../../services/appwrite';

// Airbnb-inspired color palette (same as profile page)
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

// Extended user interface for admin display
interface AdminUserDisplay extends UserProfile {
  email?: string;
  displayName?: string;
  status?: 'active' | 'suspended' | 'pending';
  roles?: string[];
  profileImage?: string;
  lastLoginAt?: string;
}

export default function UsersIndexPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserDisplay[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Memoize filtered users to prevent unnecessary recalculations
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    
    let filtered = [...users];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(query) || 
        user.email?.toLowerCase().includes(query) ||
        user.firstName?.toLowerCase().includes(query) ||
        user.lastName?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    return filtered;
  }, [users, searchQuery, statusFilter]);

  // Memoize paginated users
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, page, ITEMS_PER_PAGE]);

  // Memoize total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  }, [filteredUsers.length, ITEMS_PER_PAGE]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load users and roles in parallel
      const [usersResponse, rolesResponse] = await Promise.all([
        appwriteService.getAllUsers(),
        appwriteService.getAllRoles()
      ]);
      
      // Handle users response - extract users array if it's wrapped in an object
      const usersArray = Array.isArray(usersResponse) ? usersResponse : usersResponse?.users || [];
      setUsers(usersArray);
      
      // Handle roles response - ensure it's an array and cast to proper type
      const rolesArray = Array.isArray(rolesResponse) ? rolesResponse as unknown as Role[] : [];
      setRoles(rolesArray);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load users data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data only once on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  const getUserRoleName = useCallback((user: AdminUserDisplay): string => {
    if (user.isAdmin) return 'Admin';
    
    const userRoles = roles.filter(role => user.roles?.includes(role.$id));
    if (userRoles.some(role => role.name.toLowerCase().includes('admin'))) {
      return 'Admin';
    } else if (userRoles.some(role => role.name.toLowerCase().includes('instructor'))) {
      return 'Instructor';
    } else {
      return 'Student';
    }
  }, [roles]);

  const navigateToUserProfile = useCallback((user: AdminUserDisplay) => {
    try {
      console.log('Navigating to user profile with ID:', user.userId || user.$id);
      router.push({
        pathname: '/(admin)/(users)/user-details',
        params: { 
          id: user.userId || user.$id,
          displayName: user.displayName || user.firstName || '',
          email: user.email || '',
          status: user.status || 'active',
          isAdmin: user.isAdmin ? 'true' : 'false'
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to navigate to user details');
    }
  }, [router]);

  const getStatusColor = useCallback((status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return airbnbColors.success;
      case 'suspended': return airbnbColors.error;
      case 'pending': return airbnbColors.warning;
      default: return airbnbColors.mediumGray;
    }
  }, []);

  const getRoleColor = useCallback((roleName: string) => {
    switch (roleName) {
      case 'Admin': return airbnbColors.primary;
      case 'Instructor': return airbnbColors.secondary;
      case 'Student': return airbnbColors.warning;
      default: return airbnbColors.mediumGray;
    }
  }, []);

  // Handle pagination with bounds checking
  const handlePreviousPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage(prev => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // Display loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Typography style={styles.loadingText}>Loading users...</Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title="User Management"
        showNotifications={true}
        showRefresh={true}
        onRefreshPress={loadData}
        onNotificationPress={() => console.log('User management notifications')}
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header Section */}
          <Animated.View 
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.headerSection}
          >
            <View style={styles.headerCard}>
              <View style={styles.headerContent}>
                <Typography style={styles.headerTitle}>User Directory</Typography>
                <Typography style={styles.headerSubtitle}>
                  {users.length} total users • {filteredUsers.length} filtered
                </Typography>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.statBadge}>
                  <Ionicons name="people" size={20} color={airbnbColors.primary} />
                  <Typography style={styles.statText}>{users.length}</Typography>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Search & Filters Section */}
          <Animated.View 
            entering={FadeInUp.delay(200).duration(600)}
            style={styles.filtersSection}
          >
            <Typography style={styles.sectionTitle}>Search & Filter</Typography>
            <View style={styles.filtersCard}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={airbnbColors.mediumGray} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search users by name or email..."
                  placeholderTextColor={airbnbColors.mediumGray}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              
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
                  <Typography style={StyleSheet.flatten([styles.filterText, statusFilter === 'all' && styles.activeFilterText])}>
                    All Users
                  </Typography>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterChip, statusFilter === 'active' && styles.activeFilterChip]}
                  onPress={() => setStatusFilter('active')}
                >
                  <Typography style={StyleSheet.flatten([styles.filterText, statusFilter === 'active' && styles.activeFilterText])}>
                    Active
                  </Typography>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.filterChip, statusFilter === 'suspended' && styles.activeFilterChip]}
                  onPress={() => setStatusFilter('suspended')}
                >
                  <Typography style={StyleSheet.flatten([styles.filterText, statusFilter === 'suspended' && styles.activeFilterText])}>
                    Suspended
                  </Typography>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Animated.View>

          {/* Users List Section */}
          <Animated.View 
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.usersSection}
          >
            <Typography style={styles.sectionTitle}>Users</Typography>
            {paginatedUsers.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="people-outline" size={48} color={airbnbColors.mediumGray} />
                <Typography style={styles.emptyText}>No users found</Typography>
                <Typography style={styles.emptySubtext}>Try adjusting your search or filters</Typography>
              </View>
            ) : (
              <View style={styles.usersCard}>
                {paginatedUsers.map((user, index) => (
                  <TouchableOpacity 
                    key={`user-${user.$id}`}
                    style={[
                      styles.userRow,
                      index === paginatedUsers.length - 1 && styles.lastUserRow
                    ]}
                    onPress={() => navigateToUserProfile(user)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.userInfo}>
                      <View style={[styles.userAvatar, { backgroundColor: airbnbColors.primary + '20' }]}>
                        {user.profileImage ? (
                          <Image 
                            source={{ uri: user.profileImage }}
                            style={styles.avatarImage}
                            resizeMode="cover"
                            onError={() => console.log('Failed to load user avatar')}
                          />
                        ) : (
                          <Typography style={styles.avatarText}>
                            {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                          </Typography>
                        )}
                      </View>
                      <View style={styles.userDetails}>
                        <Typography style={styles.userName} numberOfLines={1}>
                          {user.displayName || 'Unnamed User'}
                        </Typography>
                        <Typography style={styles.userEmail} numberOfLines={1}>
                          {user.email}
                        </Typography>
                        <View style={styles.userBadges}>
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status || 'active') + '20' }]}>
                            <Typography style={StyleSheet.flatten([styles.statusText, { color: getStatusColor(user.status || 'active') }])}>
                              {user.status || 'Active'}
                            </Typography>
                          </View>
                          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(getUserRoleName(user)) + '20' }]}>
                            <Typography style={StyleSheet.flatten([styles.roleText, { color: getRoleColor(getUserRoleName(user)) }])}>
                              {getUserRoleName(user)}
                            </Typography>
                          </View>
                        </View>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Pagination Section */}
          {totalPages > 1 && (
            <Animated.View 
              entering={FadeInUp.delay(400).duration(600)}
              style={styles.paginationSection}
            >
              <View style={styles.paginationCard}>
                <TouchableOpacity
                  style={[styles.paginationButton, page === 1 && styles.disabledButton]}
                  onPress={handlePreviousPage}
                  disabled={page === 1}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={18} color={page === 1 ? airbnbColors.mediumGray : airbnbColors.primary} />
                  <Typography style={StyleSheet.flatten([styles.paginationText, page === 1 && styles.disabledText])}>Previous</Typography>
                </TouchableOpacity>
                
                <Typography style={styles.pageInfo}>
                  Page {page} of {totalPages}
                </Typography>
                
                <TouchableOpacity
                  style={[styles.paginationButton, page === totalPages && styles.disabledButton]}
                  onPress={handleNextPage}
                  disabled={page === totalPages}
                  activeOpacity={0.7}
                >
                  <Typography style={StyleSheet.flatten([styles.paginationText, page === totalPages && styles.disabledText])}>Next</Typography>
                  <Ionicons name="chevron-forward" size={18} color={page === totalPages ? airbnbColors.mediumGray : airbnbColors.primary} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(admin)/(users)/create-user')}
        activeOpacity={0.8}
      >
        <Ionicons name="person-add" size={24} color="white" />
      </TouchableOpacity>
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
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: airbnbColors.lightGray,
  },

  // Header Section
  headerSection: {
    marginBottom: 24,
  },
  headerCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
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
  statsContainer: {
    marginLeft: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.primary,
  },

  // Filters Section
  filtersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  filtersCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: airbnbColors.charcoal,
  },
  filtersScrollContent: {
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterChip: {
    backgroundColor: airbnbColors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: airbnbColors.darkGray,
  },
  activeFilterText: {
    color: airbnbColors.white,
  },

  // Users Section
  usersSection: {
    marginBottom: 24,
  },
  usersCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  lastUserRow: {
    borderBottomWidth: 0,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    color: airbnbColors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    marginBottom: 8,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State
  emptyCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    marginTop: 4,
  },

  // Pagination Section
  paginationSection: {
    marginBottom: 24,
  },
  paginationCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: airbnbColors.lightGray,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: airbnbColors.primary,
  },
  disabledText: {
    color: airbnbColors.mediumGray,
  },
  pageInfo: {
    fontSize: 16,
    fontWeight: '500',
    color: airbnbColors.charcoal,
  },
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: airbnbColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});