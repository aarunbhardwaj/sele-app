import { Ionicons } from '@expo/vector-icons';
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
import { colors, spacing, typography } from '../../../components/ui/theme';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import { appwriteService } from '../../../services/appwrite';

interface Role {
  $id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  $id: string;
  userId: string;
  displayName: string;
  email: string;
  isAdmin?: boolean;
  roles?: string[];
  profileImage?: string;
}

const commonPermissions = [
  'read:courses',
  'write:courses',
  'read:lessons',
  'write:lessons',
  'read:quizzes',
  'write:quizzes',
  'read:users',
  'write:users',
  'admin:dashboard',
  'admin:analytics',
  'admin:settings',
];

export default function RolesManagementScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isUserModalVisible, setUserModalVisible] = useState(false);
  const [isRoleModalVisible, setRoleModalVisible] = useState(false);
  const [isNewRoleModalVisible, setNewRoleModalVisible] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all users and roles in parallel
      const [usersResponse, rolesResponse] = await Promise.all([
        appwriteService.getAllUsers(),
        appwriteService.getAllRoles(),
      ]);
      
      // Type casting the responses to match our interfaces
      setUsers(usersResponse as unknown as User[]);
      setRoles(rolesResponse as unknown as Role[]);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load users and roles');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      await appwriteService.assignRoleToUser(selectedUser.userId, selectedRole.$id);
      Alert.alert('Success', `Role ${selectedRole.name} assigned to ${selectedUser.displayName}`);
      
      // Update local state to reflect changes
      setUsers(users.map(user => {
        if (user.$id === selectedUser.$id) {
          return {
            ...user,
            roles: [...(user.roles || []), selectedRole.$id]
          };
        }
        return user;
      }));
      
      setUserModalVisible(false);
    } catch (error) {
      console.error('Failed to assign role:', error);
      Alert.alert('Error', 'Failed to assign role to user');
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      await appwriteService.removeRoleFromUser(userId, roleId);
      Alert.alert('Success', 'Role removed from user');
      
      // Update local state
      setUsers(users.map(user => {
        if (user.userId === userId) {
          return {
            ...user,
            roles: (user.roles || []).filter(id => id !== roleId)
          };
        }
        return user;
      }));
    } catch (error) {
      console.error('Failed to remove role:', error);
      Alert.alert('Error', 'Failed to remove role from user');
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      Alert.alert('Error', 'Role name cannot be empty');
      return;
    }

    try {
      const newRole = await appwriteService.createRole(
        newRoleName.trim(),
        selectedPermissions
      );
      
      setRoles([...roles, newRole as unknown as Role]);
      setNewRoleName('');
      setSelectedPermissions([]);
      setNewRoleModalVisible(false);
      Alert.alert('Success', `Role ${newRoleName} created successfully`);
    } catch (error) {
      console.error('Failed to create role:', error);
      Alert.alert('Error', 'Failed to create role');
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const updatedRole = await appwriteService.updateRole(
        selectedRole.$id,
        { permissions: selectedPermissions }
      );
      
      // Update roles in state
      setRoles(roles.map(role => 
        role.$id === updatedRole.$id ? (updatedRole as unknown as Role) : role
      ));
      
      setRoleModalVisible(false);
      Alert.alert('Success', `Role ${selectedRole.name} updated successfully`);
    } catch (error) {
      console.error('Failed to update role:', error);
      Alert.alert('Error', 'Failed to update role permissions');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await appwriteService.deleteRole(roleId);
      
      // Update local state
      setRoles(roles.filter(role => role.$id !== roleId));
      
      // Also update users who had this role
      setUsers(users.map(user => ({
        ...user,
        roles: (user.roles || []).filter(id => id !== roleId)
      })));
      
      Alert.alert('Success', 'Role deleted successfully');
    } catch (error) {
      console.error('Failed to delete role:', error);
      Alert.alert('Error', 'Failed to delete role');
    }
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setUserModalVisible(true);
  };

  const openRoleModal = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions);
    setRoleModalVisible(true);
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prevPermissions => 
      prevPermissions.includes(permission)
        ? prevPermissions.filter(p => p !== permission)
        : [...prevPermissions, permission]
    );
  };

  const getUserRoles = (user: User) => {
    if (!user.roles || user.roles.length === 0) return [];
    return roles.filter(role => user.roles?.includes(role.$id));
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader title="Role Management" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading user permissions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Role Management" 
        rightComponent={
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadData}
          >
            <Ionicons name="refresh-outline" size={24} color="#333333" />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Roles & Permissions</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setNewRoleModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.primary.main} />
              <Text style={styles.addButtonText}>New Role</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search roles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {filteredRoles.length > 0 ? (
            filteredRoles.map(role => (
              <View key={role.$id} style={styles.roleCard}>
                <View style={styles.roleHeader}>
                  <Text style={styles.roleName}>{role.name}</Text>
                  <View style={styles.roleActions}>
                    <TouchableOpacity
                      style={[styles.roleButton, styles.editButton]}
                      onPress={() => openRoleModal(role)}
                    >
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.roleButton, styles.deleteButton]}
                      onPress={() => Alert.alert(
                        'Delete Role',
                        `Are you sure you want to delete the ${role.name} role?`,
                        [
                          { text: 'Cancel' },
                          { text: 'Delete', onPress: () => handleDeleteRole(role.$id) }
                        ]
                      )}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <Text style={styles.permissionsLabel}>Permissions:</Text>
                <View style={styles.permissionsList}>
                  {role.permissions.map(permission => (
                    <View key={permission} style={styles.permissionTag}>
                      <Text style={styles.permissionText}>{permission}</Text>
                    </View>
                  ))}
                  {role.permissions.length === 0 && (
                    <Text style={styles.noPermissionsText}>No permissions assigned</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No roles found</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Permissions</Text>
          
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={userSearchQuery}
            onChangeText={setUserSearchQuery}
          />
          
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <View key={user.$id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.avatarText}>
                      {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.displayName || 'Unnamed User'}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    
                    <View style={styles.userRoles}>
                      {getUserRoles(user).map(role => (
                        <View key={role.$id} style={styles.userRoleTag}>
                          <Text style={styles.userRoleText}>{role.name}</Text>
                          <TouchableOpacity
                            onPress={() => Alert.alert(
                              'Remove Role',
                              `Remove ${role.name} role from ${user.displayName}?`,
                              [
                                { text: 'Cancel' },
                                { text: 'Remove', onPress: () => handleRemoveRole(user.userId, role.$id) }
                              ]
                            )}
                          >
                            <Ionicons name="close-circle" size={16} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      ))}
                      {(!user.roles || user.roles.length === 0) && (
                        <Text style={styles.noRolesText}>No roles assigned</Text>
                      )}
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => openUserModal(user)}
                >
                  <Text style={styles.assignButtonText}>Assign Role</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No users found</Text>
          )}
        </View>
      </ScrollView>

      {/* Modal for assigning role to user */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isUserModalVisible}
        onRequestClose={() => setUserModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Assign Role to {selectedUser?.displayName}
            </Text>
            
            <FlatList
              data={roles}
              keyExtractor={(item) => item.$id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.roleItem,
                    selectedRole?.$id === item.$id && styles.selectedRoleItem
                  ]}
                  onPress={() => setSelectedRole(item)}
                >
                  <Text style={styles.roleItemText}>{item.name}</Text>
                  {selectedRole?.$id === item.$id && (
                    <Ionicons name="checkmark" size={20} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              )}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setUserModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  !selectedRole && styles.disabledButton
                ]}
                disabled={!selectedRole}
                onPress={handleAssignRole}
              >
                <Text style={styles.confirmButtonText}>Assign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for editing role permissions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRoleModalVisible}
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit Permissions for {selectedRole?.name}
            </Text>
            
            <ScrollView style={styles.permissionsContainer}>
              {commonPermissions.map(permission => (
                <TouchableOpacity
                  key={permission}
                  style={[
                    styles.permissionItem,
                    selectedPermissions.includes(permission) && styles.selectedPermissionItem
                  ]}
                  onPress={() => togglePermission(permission)}
                >
                  <Text style={styles.permissionItemText}>{permission}</Text>
                  {selectedPermissions.includes(permission) && (
                    <Ionicons name="checkmark" size={20} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setRoleModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleUpdateRole}
              >
                <Text style={styles.confirmButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for creating new role */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isNewRoleModalVisible}
        onRequestClose={() => setNewRoleModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Role</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Role name"
              value={newRoleName}
              onChangeText={setNewRoleName}
            />
            
            <Text style={styles.permissionsLabel}>Select Permissions:</Text>
            
            <ScrollView style={styles.permissionsContainer}>
              {commonPermissions.map(permission => (
                <TouchableOpacity
                  key={permission}
                  style={[
                    styles.permissionItem,
                    selectedPermissions.includes(permission) && styles.selectedPermissionItem
                  ]}
                  onPress={() => togglePermission(permission)}
                >
                  <Text style={styles.permissionItemText}>{permission}</Text>
                  {selectedPermissions.includes(permission) && (
                    <Ionicons name="checkmark" size={20} color={colors.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setNewRoleModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  !newRoleName.trim() && styles.disabledButton
                ]}
                disabled={!newRoleName.trim()}
                onPress={handleCreateRole}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.neutral.gray,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.neutral.darkGray,
  },
  roleCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  roleName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary.main,
  },
  roleActions: {
    flexDirection: 'row',
  },
  roleButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  editButton: {
    backgroundColor: colors.primary.light,
  },
  deleteButton: {
    backgroundColor: colors.status.error,
  },
  buttonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium as any,
  },
  permissionsLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral.darkGray,
    marginBottom: spacing.xs,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  permissionTag: {
    backgroundColor: colors.primary.light + '30',
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    margin: 2,
  },
  permissionText: {
    fontSize: typography.fontSizes.xs,
    color: colors.primary.dark,
  },
  noPermissionsText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray,
    fontStyle: 'italic',
  },
  userCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold as any,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.neutral.text,
  },
  userEmail: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray,
    marginBottom: spacing.xs,
  },
  userRoles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  userRoleTag: {
    backgroundColor: colors.primary.main,
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    margin: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRoleText: {
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.white,
    marginRight: 4,
  },
  noRolesText: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.gray,
    fontStyle: 'italic',
  },
  assignButton: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary.light,
    borderRadius: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  assignButtonText: {
    color: colors.neutral.white,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium as any,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light + '20',
    borderRadius: 16,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  addButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary.main,
    marginLeft: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
  },
  searchInput: {
    backgroundColor: colors.neutral.white,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    fontSize: typography.fontSizes.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
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
  modalInput: {
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    fontSize: typography.fontSizes.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: colors.neutral.lightGray,
  },
  cancelButtonText: {
    color: colors.neutral.darkGray,
    fontWeight: typography.fontWeights.medium as any,
  },
  confirmButton: {
    backgroundColor: colors.primary.main,
  },
  confirmButtonText: {
    color: colors.neutral.white,
    fontWeight: typography.fontWeights.medium as any,
  },
  disabledButton: {
    opacity: 0.5,
  },
  roleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  roleItemText: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
  },
  selectedRoleItem: {
    backgroundColor: colors.primary.light + '20',
  },
  permissionsContainer: {
    maxHeight: 300,
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  permissionItemText: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
  },
  selectedPermissionItem: {
    backgroundColor: colors.primary.light + '20',
  },
  noDataText: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.gray,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
});