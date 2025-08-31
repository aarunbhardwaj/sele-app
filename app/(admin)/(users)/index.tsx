import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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

interface User {
  $id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin' | 'parent';
  grade?: string;
  status: 'active' | 'inactive' | 'suspended';
  enrolledClasses?: number;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  isAdmin?: boolean;
}

export default function UsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const itemsPerPage = 15;

  const loadUsers = useCallback(async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // First, ensure current user has a profile (sync utility)
      try {
        await appwriteService.syncAuthUsersWithProfiles();
      } catch (syncError) {
        console.log('Profile sync completed with some issues:', syncError);
      }

      const usersResponse = await appwriteService.getAllUsers();
      const allUsers = usersResponse?.users || [];
      
      // Map all users to User type with correct field mapping
      let filteredUsers = allUsers
        .map((user: any) => {
          // Determine role based on boolean flags
          let userRole = 'student'; // default
          if (user.isAdmin) {
            userRole = 'admin';
          } else if (user.isInstructor) {
            userRole = 'teacher';
          } else if (user.roles && user.roles.includes('parent')) {
            userRole = 'parent';
          }

          return {
            $id: user.$id,
            name: user.displayName || user.firstName + ' ' + user.lastName || 'Unknown User',
            email: user.email || 'No email',
            phone: user.phone,
            role: userRole,
            grade: user.grade,
            status: user.status || 'active',
            enrolledClasses: user.enrolledClasses || 0,
            lastActive: user.lastActive,
            createdAt: user.joinedDate || user.$createdAt || new Date().toISOString(),
            updatedAt: user.$updatedAt || new Date().toISOString(),
            userId: user.userId, // Keep the original userId for operations
            isAdmin: user.isAdmin || false, // Add isAdmin field
          } as User;
        });

      // Apply search filter
      if (searchQuery.trim()) {
        filteredUsers = filteredUsers.filter((user: User) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filteredUsers = filteredUsers.filter((user: User) => user.status === statusFilter);
      }

      // Apply role filter
      if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter((user: User) => user.role === roleFilter);
      }

      // Pagination
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setTotalUsers(filteredUsers.length);
      setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load users:', error);
      Alert.alert('Error', 'Failed to load users data: ' + (error as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, statusFilter, roleFilter]);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  const handleRefresh = () => {
    loadUsers(currentPage, true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleChangeUserRole = async (userId: string, userName: string, currentRole: string, isCurrentlyAdmin: boolean) => {
    const roleOptions = [
      {
        text: 'Student',
        onPress: () => confirmRoleChange(userId, userName, 'student', false, false)
      },
      {
        text: 'Teacher/Instructor', 
        onPress: () => showAdminToggleForRole(userId, userName, 'teacher', true, false)
      },
      {
        text: 'Admin',
        onPress: () => confirmRoleChange(userId, userName, 'admin', true, false)
      },
      {
        text: 'Parent',
        onPress: () => showAdminToggleForRole(userId, userName, 'parent', false, false)
      }
    ];
    
    Alert.alert(
      'Change User Role',
      `Current role: ${currentRole}\nAdmin privileges: ${isCurrentlyAdmin ? 'Yes' : 'No'}\n\nSelect new role for "${userName}":`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...roleOptions
      ]
    );
  };

  const showAdminToggleForRole = (userId: string, userName: string, newRole: string, isInstructor: boolean, currentAdminStatus: boolean) => {
    // For teacher/instructor and parent roles, ask about admin privileges
    Alert.alert(
      'Admin Privileges',
      `Role: ${newRole}\nShould "${userName}" have admin privileges?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'No Admin',
          onPress: () => confirmRoleChange(userId, userName, newRole, false, isInstructor)
        },
        {
          text: 'Make Admin',
          onPress: () => confirmRoleChange(userId, userName, newRole, true, isInstructor)
        }
      ]
    );
  };

  const confirmRoleChange = (userId: string, userName: string, newRole: string, makeAdmin: boolean, makeInstructor: boolean) => {
    const adminText = makeAdmin ? ' with admin privileges' : '';
    const instructorText = makeInstructor ? ' (instructor)' : '';
    
    Alert.alert(
      'Confirm Role Change',
      `Are you sure you want to change "${userName}" to "${newRole}"${instructorText}${adminText}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update Role',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Find the user profile to get the document ID
              const allUsersResponse = await appwriteService.getAllUsers();
              const userProfile = allUsersResponse?.users?.find((u: any) => u.userId === userId);
              
              if (!userProfile) {
                Alert.alert('Error', 'User profile not found');
                return;
              }
              
              // Update the boolean flags instead of role field
              await appwriteService.updateUserProfile(userProfile.$id, { 
                isAdmin: makeAdmin,
                isInstructor: makeInstructor,
                roles: newRole // Update the roles string field
              });
              
              Alert.alert(
                'Success', 
                `User role updated successfully!\n\nNew role: ${newRole}\nAdmin privileges: ${makeAdmin ? 'Yes' : 'No'}\nInstructor: ${makeInstructor ? 'Yes' : 'No'}`
              );
              loadUsers(currentPage);
            } catch (error) {
              console.error('Role update error:', error);
              Alert.alert('Error', 'Failed to change user role: ' + (error as Error).message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleToggleUserStatus = async (userId: string, userName: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} "${userName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: newStatus === 'inactive' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              setLoading(true);
              // TODO: Implement status change in appwrite service
              await appwriteService.updateUserStatus(userId, newStatus);
              Alert.alert('Success', `User ${action}d successfully`);
              loadUsers(currentPage);
            } catch (error) {
              Alert.alert('Error', `Failed to ${action} user: ` + (error as Error).message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // deleteUser not defined; perform a soft delete by setting status to inactive
              await appwriteService.updateUserProfile(userId, { status: 'inactive' });
              Alert.alert('Success', 'User deactivated successfully');
              loadUsers(currentPage);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user: ' + (error as Error).message);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return airbnbColors.primary;
      case 'teacher':
        return airbnbColors.secondary;
      case 'student':
        return airbnbColors.accent.main;
      case 'parent':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return 'shield-checkmark';
      case 'teacher':
        return 'school';
      case 'student':
        return 'person';
      case 'parent':
        return 'people';
      default:
        return 'person-outline';
    }
  };

  const renderRoleFilter = () => (
     <View style={styles.filterSection}>
       <Text style={styles.filterSectionTitle}>Filter by Role</Text>
       <FlatList
         data={[
           { 
             key: 'all', 
             label: 'All Roles', 
             icon: 'grid-outline', 
             color: airbnbColors.primary,
             count: totalUsers 
           },
           { 
             key: 'student', 
             label: 'Students', 
             icon: 'person', 
             color: airbnbColors.accent.main,
             count: users.filter(u => u.role === 'student').length
           },
           { 
             key: 'teacher', 
             label: 'Teachers', 
             icon: 'school', 
             color: airbnbColors.secondary,
             count: users.filter(u => u.role === 'teacher').length
           },
           { 
             key: 'admin', 
             label: 'Admins', 
             icon: 'shield-checkmark', 
             color: airbnbColors.primary,
             count: users.filter(u => u.role === 'admin').length
           },
           { 
             key: 'parent', 
             label: 'Parents', 
             icon: 'people', 
             color: '#8B5CF6',
             count: users.filter(u => u.role === 'parent').length
           }
         ]}
         renderItem={({ item: filter }) => {
           const isActive = roleFilter === filter.key;
           return (
             <TouchableOpacity
               style={[
                 styles.filterButton,
                 isActive && [styles.filterButtonActive, { backgroundColor: filter.color + '15', borderColor: filter.color }]
               ]}
               onPress={() => handleRoleFilter(filter.key)}
               activeOpacity={0.7}
             >
               <View style={styles.filterIconContainer}>                
                 <Ionicons 
                   name={filter.icon as any} 
                   size={18} 
                   color={isActive ? filter.color : filter.color} 
                 />
               </View>
               <View style={styles.filterTextContainer}>
                 <Text style={[styles.filterButtonText, { color: colors.neutral.text }]}> 
                   {filter.label}
                 </Text>
                 <View style={[styles.filterCountBadge, { backgroundColor: filter.color + '15' }]}>
                   <Text style={[styles.filterCountText, { color: filter.color }]}>
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
             count: totalUsers 
           },
           { 
             key: 'active', 
             label: 'Active', 
             icon: 'checkmark-circle', 
             color: airbnbColors.secondary,
             count: users.filter(s => s.status === 'active').length
           },
           { 
             key: 'inactive', 
             label: 'Inactive', 
             icon: 'pause-circle', 
             color: '#6B7280',
             count: users.filter(s => s.status === 'inactive').length
           },
           { 
             key: 'suspended', 
             label: 'Suspended', 
             icon: 'ban', 
             color: airbnbColors.primary,
             count: users.filter(s => s.status === 'suspended').length
           }
         ]}
         renderItem={({ item: filter }) => {
           const isActive = statusFilter === filter.key;
           return (
             <TouchableOpacity
               style={[
                 styles.filterButton,
                 isActive && [styles.filterButtonActive, { backgroundColor: filter.color + '15', borderColor: filter.color }]
               ]}
               onPress={() => handleStatusFilter(filter.key as typeof statusFilter)}
               activeOpacity={0.7}
             >
               <View style={styles.filterIconContainer}>                
                 <Ionicons 
                   name={filter.icon as any} 
                   size={18} 
                   color={isActive ? filter.color : filter.color} 
                 />
               </View>
               <View style={styles.filterTextContainer}>
                 <Text style={[styles.filterButtonText, { color: colors.neutral.text }]}> 
                   {filter.label}
                 </Text>
                 <View style={[styles.filterCountBadge, { backgroundColor: filter.color + '15' }]}>
                   <Text style={[styles.filterCountText, { color: filter.color }]}>
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

  const renderUserCard = (user: User, index: number) => (
    <Animated.View
      entering={FadeInDown.delay(100 + index * 40).duration(400)}
      style={styles.studentCard}
    >
       <TouchableOpacity
         style={styles.studentCardContent}
         onPress={() => router.push(`/(admin)/(users)/user-details?id=${user.$id}`)}
         activeOpacity={0.8}
       >
         <View style={styles.studentCardHeader}>
           <View style={styles.studentInfo}>
             <View style={[styles.avatarContainer, { backgroundColor: getRoleColor(user.role) }]}>
               <Ionicons name={getRoleIcon(user.role) as any} size={24} color={colors.neutral.white} />
             </View>
             <View style={styles.studentDetails}>
               <View style={styles.userNameRow}>
                 <Text style={styles.studentName} numberOfLines={1}>{user.name || 'Unknown User'}</Text>
                 <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '15' }]}>
                   <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                     {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                   </Text>
                 </View>
               </View>
               <Text style={styles.studentEmail} numberOfLines={1}>{user.email || 'No email provided'}</Text>
               {user.phone && (
                 <Text style={styles.studentPhone} numberOfLines={1}>{user.phone}</Text>
               )}
             </View>
           </View>
           <View style={styles.studentActions}>
             <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) + '15' }]}>
               <Text style={[styles.statusText, { color: getStatusColor(user.status) }]}>
                 {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
               </Text>
             </View>
           </View>
         </View>

         <View style={styles.studentCardBody}>
           <View style={styles.studentMeta}>
             {user.grade && (
               <View style={styles.metaItem}>
                 <Ionicons name="school-outline" size={16} color={colors.neutral.gray} />
                 <Text style={styles.metaText}>Grade {user.grade}</Text>
               </View>
             )}
             {user.role === 'student' && (
               <View style={styles.metaItem}>
                 <Ionicons name="library-outline" size={16} color={colors.neutral.gray} />
                 <Text style={styles.metaText}>
                   {user.enrolledClasses || 0} Classes
                 </Text>
               </View>
             )}
             {user.lastActive && (
               <View style={styles.metaItem}>
                 <Ionicons name="time-outline" size={16} color={colors.neutral.gray} />
                 <Text style={styles.metaText}>
                   Last seen {new Date(user.lastActive).toLocaleDateString()}
                 </Text>
               </View>
             )}
             <View style={styles.metaItem}>
               <Ionicons name="calendar-outline" size={16} color={colors.neutral.gray} />
               <Text style={styles.metaText}>
                 Joined {new Date(user.createdAt).toLocaleDateString()}
               </Text>
             </View>
           </View>
         </View>

         <View style={styles.studentCardFooter}>
           <TouchableOpacity
             style={styles.actionButton}
             onPress={(e) => {
               e.stopPropagation();
               handleChangeUserRole(user.userId || user.$id, user.name, user.role, user.isAdmin || false);
             }}
           >
             <Ionicons name="swap-horizontal-outline" size={16} color={airbnbColors.accent.main} />
             <Text style={[styles.actionButtonText, { color: airbnbColors.accent.main }]}>Change Role</Text>
           </TouchableOpacity>
           
           <TouchableOpacity
             style={styles.actionButton}
             onPress={(e) => {
               e.stopPropagation();
               router.push(`/(admin)/(users)/edit-user?id=${user.$id}` as any);
             }}
           >
             <Ionicons name="create-outline" size={16} color={airbnbColors.accent.main} />
             <Text style={[styles.actionButtonText, { color: airbnbColors.accent.main }]}>Edit</Text>
           </TouchableOpacity>
         </View>
       </TouchableOpacity>
     </Animated.View>
   );

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="people" size={32} color={airbnbColors.primary} />
            </View>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>User Management</Text>
              <Text style={styles.heroSubtitle}>
                Manage user accounts, roles, and permissions across the platform
              </Text>
            </View>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: airbnbColors.secondary }]}>
                {users.filter(u => u.status === 'active').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                {users.filter(u => ['admin','teacher'].includes(u.role)).length}
              </Text>
              <Text style={styles.statLabel}>Staff</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or email..."
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

      {/* Role Filters */}
      {renderRoleFilter()}
      
      {/* Status Filters */}
      {renderStatusFilter()}

      {/* Add User Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(admin)/(users)/add-user' as any)}
        >
          <Ionicons name="person-add" size={20} color={colors.neutral.white} />
          <Text style={styles.addButtonText}>Add New User</Text>
        </TouchableOpacity>
      </View>
     </View>
   );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={colors.neutral.gray} />
      <Text style={styles.emptyTitle}>No Users Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
          ? 'Try adjusting your search or filters'
          : 'Get started by adding your first user'
        }
      </Text>
      {!searchQuery && statusFilter === 'all' && roleFilter === 'all' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/(admin)/(users)/add-user' as any)}
        >
          <Ionicons name="add" size={20} color={airbnbColors.secondary} />
          <Text style={[styles.emptyButtonText, { color: airbnbColors.secondary }]}>
            Add First User
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const canPrev = currentPage > 1;
    const canNext = currentPage < totalPages;

    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, !canPrev && styles.paginationButtonDisabled]}
          disabled={!canPrev}
          onPress={() => canPrev && loadUsers(currentPage - 1)}
        >
          <Ionicons name="chevron-back" size={20} color={canPrev ? colors.neutral.text : colors.neutral.gray} />
        </TouchableOpacity>
        <Text style={styles.paginationText}>{currentPage} / {totalPages}</Text>
        <TouchableOpacity
          style={[styles.paginationButton, !canNext && styles.paginationButtonDisabled]}
          disabled={!canNext}
          onPress={() => canNext && loadUsers(currentPage + 1)}
        >
          <Ionicons name="chevron-forward" size={20} color={canNext ? colors.neutral.text : colors.neutral.gray} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.secondary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      );
    }
    return renderPagination();
  };

  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={styles.headerContainer}>
        <PreAuthHeader 
          title="Users"
          showBackButton={true}
          onBackPress={() => router.back()}
          showNotifications={true}
          showRefresh={true}
          onRefreshPress={handleRefresh}
          onNotificationPress={() => console.log('Users notifications')}
        />
      </SafeAreaView>
      <View style={styles.container}>
        <FlatList
          data={users}
          renderItem={({ item, index }) => renderUserCard(item, index)}
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
          contentContainerStyle={[styles.flatListContent, { paddingBottom: Math.max(insets.bottom || 0, 20) + 80 }]}
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
   headerWrapper: {},

  // Modern Hero Section - White card without background gradient
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: airbnbColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.neutral.darkGray,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: airbnbColors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.neutral.darkGray,
    marginTop: 4,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginHorizontal: spacing.sm,
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
     borderColor: airbnbColors.primary + '30',
     backgroundColor: colors.neutral.white,
    },
    filterButtonActive: {
     backgroundColor: airbnbColors.primary,
     borderColor: airbnbColors.primary,
    },
    filterIconContainer: {
     width: 32,
     height: 32,
     borderRadius: 16,
     backgroundColor: airbnbColors.primary + '15',
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
     color: airbnbColors.primary,
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
     backgroundColor: airbnbColors.secondary,
    },
    filterCountText: {
      fontSize: 12,
      fontWeight: '500',
     color: airbnbColors.primary,
    },
    filterCountTextActive: {
      color: colors.neutral.white,
    },
 
   // Add Button
   addButtonContainer: {
     paddingHorizontal: spacing.lg,
     marginBottom: spacing.md,
   },
   addButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: airbnbColors.primary,
     paddingVertical: spacing.md,
     borderRadius: 12,
     shadowColor: airbnbColors.primary,
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.2,
     shadowRadius: 8,
     elevation: 4,
   },
   addButtonText: {
     fontSize: 16,
     fontWeight: '600',
     color: colors.neutral.white,
     marginLeft: spacing.sm,
   },

   // User Card Styles
   studentCard: {
     marginHorizontal: spacing.lg,
     marginBottom: spacing.md,
     borderRadius: 16,
     overflow: 'hidden',
     backgroundColor: 'transparent',
   },
   studentCardContent: {
     backgroundColor: colors.neutral.white,
     borderRadius: 16,
     padding: spacing.md,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.06,
     shadowRadius: 12,
     elevation: 2,
     borderWidth: 1,
     borderColor: '#F1F5F9',
   },
   studentCardHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
   },
   studentInfo: {
     flexDirection: 'row',
     alignItems: 'center',
     flex: 1,
   },
   avatarContainer: {
     width: 48,
     height: 48,
     borderRadius: 12,
     justifyContent: 'center',
     alignItems: 'center',
     marginRight: spacing.md,
   },
   studentDetails: {
     flex: 1,
   },
   userNameRow: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     marginBottom: 2,
   },
   studentName: {
     fontSize: 16,
     fontWeight: '700',
     color: colors.neutral.text,
     flex: 1,
     marginRight: spacing.sm,
   },
   roleBadge: {
     paddingHorizontal: spacing.sm,
     paddingVertical: 4,
     borderRadius: 12,
     flexShrink: 0,
   },
   roleText: {
     fontSize: 12,
     fontWeight: '600',
   },
   studentEmail: {
     fontSize: 13,
     color: colors.neutral.darkGray,
     marginTop: 4,
   },
   studentPhone: {
     fontSize: 13,
     color: colors.neutral.darkGray,
     marginTop: 2,
   },
   studentActions: {
     marginLeft: spacing.md,
     alignItems: 'flex-end',
   },
   statusBadge: {
     paddingHorizontal: spacing.sm,
     paddingVertical: 6,
     borderRadius: 12,
   },
   statusText: {
     fontSize: 12,
     fontWeight: '600',
   },
   studentCardBody: {
     marginTop: spacing.sm,
     borderTopWidth: 1,
     borderTopColor: '#F1F5F9',
     paddingTop: spacing.sm,
   },
   studentMeta: {
     flexDirection: 'row',
     alignItems: 'center',
     flexWrap: 'wrap',
     gap: spacing.sm,
   },
   metaItem: {
     flexDirection: 'row',
     alignItems: 'center',
     marginBottom: spacing.xs,
   },
   metaText: {
     marginLeft: spacing.xs,
     fontSize: 13,
     color: colors.neutral.darkGray,
   },
   studentCardFooter: {
     marginTop: spacing.sm,
     flexDirection: 'row',
     justifyContent: 'flex-end',
     alignItems: 'center',
   },
   actionButton: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingHorizontal: spacing.md,
     paddingVertical: spacing.sm,
     marginLeft: spacing.md,
   },
   actionButtonText: {
     marginLeft: spacing.xs,
     fontSize: 13,
     fontWeight: '600',
   },

   // Empty state
   emptyContainer: {
     alignItems: 'center',
     justifyContent: 'center',
     padding: spacing.xl,
   },
   emptyTitle: {
     fontSize: 18,
     fontWeight: '700',
     color: colors.neutral.text,
     marginTop: spacing.md,
   },
   emptySubtitle: {
     fontSize: 14,
     color: colors.neutral.darkGray,
     marginTop: spacing.sm,
     textAlign: 'center',
   },
   emptyButton: {
     marginTop: spacing.md,
     flexDirection: 'row',
     alignItems: 'center',
     paddingHorizontal: spacing.md,
     paddingVertical: spacing.sm,
     borderRadius: 12,
     backgroundColor: colors.neutral.white,
     borderWidth: 1,
     borderColor: '#E2E8F0',
   },
   emptyButtonText: {
     marginLeft: spacing.xs,
     fontSize: 14,
     fontWeight: '600',
   },

   // Pagination & Loading
   paginationContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     paddingVertical: spacing.md,
   },
   paginationButton: {
     padding: spacing.sm,
     borderRadius: 8,
     marginHorizontal: spacing.sm,
   },
   paginationButtonDisabled: {
     opacity: 0.4,
   },
   paginationText: {
     fontSize: 14,
     color: colors.neutral.text,
     fontWeight: '600',
   },
   loadingContainer: {
     alignItems: 'center',
     padding: spacing.lg,
   },
   loadingText: {
     marginTop: spacing.sm,
     color: colors.neutral.darkGray,
   },

   // FlatList content spacing
   flatListContent: {
     paddingTop: spacing.md,
   },
});
