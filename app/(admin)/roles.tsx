import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

interface Role {
  $id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export default function RolesScreen() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Available permissions
  const availablePermissions = [
    'create:courses',
    'edit:courses',
    'delete:courses',
    'manage:users',
    'manage:roles',
    'view:analytics'
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const fetchedRoles = await appwriteService.getAllRoles();
      setRoles(fetchedRoles);
    } catch (error) {
      Alert.alert('Error', 'Failed to load roles');
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      Alert.alert('Error', 'Please enter a role name');
      return;
    }

    try {
      await appwriteService.createRole(newRoleName, []);
      setNewRoleName('');
      setIsAddingRole(false);
      loadRoles();
      Alert.alert('Success', 'Role created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create role');
      console.error('Error creating role:', error);
    }
  };

  const handleUpdateRole = async (role: Role) => {
    try {
      await appwriteService.updateRole(role.$id, {
        name: role.name,
        permissions: role.permissions
      });
      setEditingRole(null);
      loadRoles();
      Alert.alert('Success', 'Role updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update role');
      console.error('Error updating role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    Alert.alert(
      'Delete Role',
      'Are you sure you want to delete this role?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await appwriteService.deleteRole(roleId);
              loadRoles();
              Alert.alert('Success', 'Role deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete role');
              console.error('Error deleting role:', error);
            }
          }
        }
      ]
    );
  };

  const togglePermission = (role: Role, permission: string) => {
    const updatedPermissions = role.permissions.includes(permission)
      ? role.permissions.filter(p => p !== permission)
      : [...role.permissions, permission];

    const updatedRole = { ...role, permissions: updatedPermissions };
    handleUpdateRole(updatedRole);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-gray-600">Loading roles...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Add Role Button */}
        {!isAddingRole ? (
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-lg flex-row justify-center items-center mb-4"
            onPress={() => setIsAddingRole(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Add New Role</Text>
          </TouchableOpacity>
        ) : (
          <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
              placeholder="Enter role name"
              value={newRoleName}
              onChangeText={setNewRoleName}
            />
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="bg-gray-200 p-2 rounded-lg mr-2"
                onPress={() => setIsAddingRole(false)}
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 p-2 rounded-lg"
                onPress={handleCreateRole}
              >
                <Text className="text-white">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Roles List */}
        {roles.map(role => (
          <View key={role.$id} className="bg-white p-4 rounded-lg mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold">{role.name}</Text>
              <View className="flex-row">
                <TouchableOpacity
                  className="p-2"
                  onPress={() => handleDeleteRole(role.$id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Permissions */}
            <Text className="font-medium mb-2">Permissions:</Text>
            <View className="flex-row flex-wrap">
              {availablePermissions.map(permission => (
                <TouchableOpacity
                  key={permission}
                  className={`m-1 px-3 py-1 rounded-full ${
                    role.permissions.includes(permission)
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}
                  onPress={() => togglePermission(role, permission)}
                >
                  <Text
                    className={
                      role.permissions.includes(permission)
                        ? 'text-blue-700'
                        : 'text-gray-700'
                    }
                  >
                    {permission}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}