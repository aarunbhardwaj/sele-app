import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import appwriteService from '../../services/appwrite';

// Types
interface User {
  $id: string;
  userId: string;
  displayName: string;
  profileImage?: string;
  nativeLanguage?: string;
  englishLevel?: string;
  isAdmin?: boolean;
  roles?: string[];
  joinedDate: string;
}

interface Role {
  $id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export default function UsersScreen() {
  // State variables
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'roles'
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    permissions: [] as string[],
  });
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});

  // Available permissions for roles
  const availablePermissions = [
    'create:courses',
    'edit:courses',
    'delete:courses',
    'manage:users',
    'manage:roles',
    'view:analytics'
  ];

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load both users and roles data
  const loadData = async () => {
    setLoading(true);
    try {
      // Load users
      const fetchedUsers = await appwriteService.getAllUsers();
      setUsers(fetchedUsers);
      
      // Load roles
      const fetchedRoles = await appwriteService.getAllRoles();
      setRoles(fetchedRoles);
      
      // Get user-role mappings
      const userRolesMap: Record<string, string[]> = {};
      for (const user of fetchedUsers) {
        if (user.roles && user.roles.length > 0) {
          userRolesMap[user.userId] = user.roles;
        } else {
          userRolesMap[user.userId] = [];
        }
      }
      setUserRoles(userRolesMap);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Create a new role
  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      Alert.alert('Error', 'Role name is required');
      return;
    }

    try {
      await appwriteService.createRole(
        newRole.name,
        newRole.permissions
      );
      
      setNewRole({
        name: '',
        permissions: []
      });
      
      setIsAddingRole(false);
      await loadData();
      Alert.alert('Success', 'Role created successfully');
    } catch (error) {
      console.error('Error creating role:', error);
      Alert.alert('Error', 'Failed to create role');
    }
  };

  // Delete a role
  const handleDeleteRole = async (roleId: string) => {
    Alert.alert(
      'Delete Role',
      'Are you sure you want to delete this role? This will remove the role from all users.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await appwriteService.deleteRole(roleId);
              await loadData();
              Alert.alert('Success', 'Role deleted successfully');
            } catch (error) {
              console.error('Error deleting role:', error);
              Alert.alert('Error', 'Failed to delete role');
            }
          }
        }
      ]
    );
  };

  // Toggle permission for new role
  const togglePermission = (permission: string) => {
    if (newRole.permissions.includes(permission)) {
      setNewRole({
        ...newRole,
        permissions: newRole.permissions.filter(p => p !== permission)
      });
    } else {
      setNewRole({
        ...newRole,
        permissions: [...newRole.permissions, permission]
      });
    }
  };

  // Toggle admin status for a user
  const toggleAdminStatus = async (user: User) => {
    try {
      await appwriteService.updateUserProfile(user.$id, {
        isAdmin: !user.isAdmin,
        updatedAt: new Date().toISOString()
      });
      
      await loadData();
      Alert.alert('Success', `Admin status ${user.isAdmin ? 'removed from' : 'granted to'} ${user.displayName}`);
    } catch (error) {
      console.error('Error updating user admin status:', error);
      Alert.alert('Error', 'Failed to update admin status');
    }
  };

  // Assign/remove role for a user
  const toggleRoleForUser = async (userId: string, roleId: string) => {
    try {
      const hasRole = userRoles[userId] && userRoles[userId].includes(roleId);
      
      if (hasRole) {
        await appwriteService.removeRoleFromUser(userId, roleId);
      } else {
        await appwriteService.assignRoleToUser(userId, roleId);
      }
      
      await loadData();
    } catch (error) {
      console.error('Error toggling user role:', error);
      Alert.alert('Error', 'Failed to update user roles');
    }
  };

  // Filter users and roles based on search query
  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.nativeLanguage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.englishLevel?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.activeTab]}
          onPress={() => setActiveTab('users')}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'users' ? '#3B82F6' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'roles' && styles.activeTab]}
          onPress={() => setActiveTab('roles')}
        >
          <Ionicons
            name="key"
            size={20}
            color={activeTab === 'roles' ? '#3B82F6' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'roles' && styles.activeTabText]}>Roles</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder={activeTab === 'users' ? "Search users..." : "Search roles..."}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Users Management</Text>
          
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No users match your search' : 'No users available'}
              </Text>
            </View>
          ) : (
            filteredUsers.map(user => (
              <View key={user.$id} style={styles.card}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userInitial}>
                        {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.userName}>{user.displayName || 'Anonymous'}</Text>
                      <Text style={styles.userDetail}>Level: {user.englishLevel || 'Not set'}</Text>
                      <Text style={styles.userDetail}>Language: {user.nativeLanguage || 'Not set'}</Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.adminBadge, user.isAdmin && styles.adminBadgeActive]}
                    onPress={() => toggleAdminStatus(user)}
                  >
                    <Text style={[styles.adminBadgeText, user.isAdmin && styles.adminBadgeTextActive]}>
                      {user.isAdmin ? 'Admin' : 'Regular'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.divider}></View>
                
                <Text style={styles.rolesTitle}>Roles:</Text>
                <View style={styles.rolesList}>
                  {roles.length === 0 ? (
                    <Text style={styles.noRolesText}>No roles available</Text>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {roles.map(role => {
                        const hasRole = userRoles[user.userId] && userRoles[user.userId].includes(role.$id);
                        return (
                          <TouchableOpacity
                            key={role.$id}
                            style={[styles.roleBadge, hasRole && styles.roleBadgeActive]}
                            onPress={() => toggleRoleForUser(user.userId, role.$id)}
                          >
                            <Text style={[styles.roleBadgeText, hasRole && styles.roleBadgeTextActive]}>
                              {role.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
                
                <Text style={styles.joinDate}>
                  Joined: {new Date(user.joinedDate).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Roles Tab Content */}
      {activeTab === 'roles' && (
        <ScrollView style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Roles Management</Text>
          
          {/* Add Role Button */}
          {!isAddingRole ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAddingRole(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text style={styles.addButtonText}>Add New Role</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Add New Role</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Role Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter role name"
                  value={newRole.name}
                  onChangeText={(text) => setNewRole({...newRole, name: text})}
                />
              </View>
              
              <Text style={styles.label}>Permissions</Text>
              <View style={styles.permissionsContainer}>
                {availablePermissions.map(permission => (
                  <TouchableOpacity
                    key={permission}
                    style={[styles.permissionBadge, newRole.permissions.includes(permission) && styles.permissionBadgeActive]}
                    onPress={() => togglePermission(permission)}
                  >
                    <Text style={[styles.permissionBadgeText, newRole.permissions.includes(permission) && styles.permissionBadgeTextActive]}>
                      {permission}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsAddingRole(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateRole}
                >
                  <Text style={styles.createButtonText}>Create Role</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Roles List */}
          {filteredRoles.length === 0 && !isAddingRole ? (
            <View style={styles.emptyState}>
              <Ionicons name="key" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No roles match your search' : 'No roles available'}
              </Text>
            </View>
          ) : (
            filteredRoles.map(role => (
              <View key={role.$id} style={styles.card}>
                <View style={styles.roleHeader}>
                  <Text style={styles.roleName}>{role.name}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteRole(role.$id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.divider}></View>
                
                <Text style={styles.permissionsTitle}>Permissions:</Text>
                <View style={styles.permissionsContainer}>
                  {role.permissions.length === 0 ? (
                    <Text style={styles.noPermissionsText}>No permissions assigned</Text>
                  ) : (
                    role.permissions.map(permission => (
                      <View key={permission} style={styles.permissionBadge}>
                        <Text style={styles.permissionBadgeText}>{permission}</Text>
                      </View>
                    ))
                  )}
                </View>
                
                <Text style={styles.roleDate}>
                  Created: {new Date(role.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  adminBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  adminBadgeActive: {
    backgroundColor: '#EFF6FF',
  },
  adminBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  adminBadgeTextActive: {
    color: '#3B82F6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  rolesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  rolesList: {
    marginBottom: 12,
  },
  noRolesText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  roleBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  roleBadgeActive: {
    backgroundColor: '#EFF6FF',
  },
  roleBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  roleBadgeTextActive: {
    color: '#3B82F6',
  },
  joinDate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
  },
  permissionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 16,
  },
  permissionBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  permissionBadgeActive: {
    backgroundColor: '#EFF6FF',
  },
  permissionBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  permissionBadgeTextActive: {
    color: '#3B82F6',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  deleteButton: {
    padding: 6,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  noPermissionsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  roleDate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
  },
});