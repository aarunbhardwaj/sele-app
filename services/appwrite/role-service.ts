import { ID, Permission, Role } from 'appwrite';
import authService from './auth-service';
import { getAppwriteClient } from './client';

const roleService = {
  // Create a new role
  createRole: async (name: string, permissions: string[]) => {
    try {
      const { databases, config } = getAppwriteClient();
      return await databases.createDocument(
        config.databaseId,
        config.rolesCollectionId,
        ID.unique(),
        {
          name,
          permissions,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Appwrite service :: createRole :: error', error);
      throw error;
    }
  },

  // Get all roles
  getAllRoles: async () => {
    try {
      const { databases, config } = getAppwriteClient();
      const response = await databases.listDocuments(
        config.databaseId,
        config.rolesCollectionId
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getAllRoles :: error', error);
      throw error;
    }
  },

  // Update a role
  updateRole: async (roleId: string, data: { name?: string; permissions?: string[] }) => {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      const { account } = getAppwriteClient();
      // Get current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('User must be logged in to update roles');
      }
      
      const { databases, config } = getAppwriteClient();
      // Add explicit permissions when updating document
      return await databases.updateDocument(
        config.databaseId,
        config.rolesCollectionId,
        roleId,
        updateData,
        [
          Permission.read(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any())
        ]
      );
    } catch (error) {
      console.error('Appwrite service :: updateRole :: error', error);
      throw error;
    }
  },

  // Delete a role
  deleteRole: async (roleId: string) => {
    try {
      const { databases, config } = getAppwriteClient();
      await databases.deleteDocument(
        config.databaseId,
        config.rolesCollectionId,
        roleId
      );
      return true;
    } catch (error) {
      console.error('Appwrite service :: deleteRole :: error', error);
      throw error;
    }
  },

  // Assign role to user
  assignRoleToUser: async (userId: string, roleId: string) => {
    try {
      // Update user profile with role
      const userProfile = await authService.getUserProfile(userId);
      if (userProfile) {
        // Store roles as comma-separated string instead of array
        const currentRoles = userProfile.roles || '';
        let newRoles = currentRoles;
        
        // If current roles is empty, just use the roleId
        if (!currentRoles) {
          newRoles = roleId;
        } 
        // If it already has roles, append the new one with a comma
        else if (!currentRoles.includes(roleId)) {
          newRoles = currentRoles + ',' + roleId;
        }
        
        const { databases, config } = getAppwriteClient();
        return await databases.updateDocument(
          config.databaseId,
          config.usersCollectionId,
          userProfile.$id,
          {
            roles: newRoles,
            updatedAt: new Date().toISOString()
          },
          [
            Permission.read(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any())
          ]
        );
      }
      throw new Error('User profile not found');
    } catch (error) {
      console.error('Appwrite service :: assignRoleToUser :: error', error);
      throw error;
    }
  },

  // Remove role from user
  removeRoleFromUser: async (userId: string, roleId: string) => {
    try {
      const userProfile = await authService.getUserProfile(userId);
      if (userProfile) {
        // Handle roles as string
        const currentRoles = userProfile.roles || '';
        const rolesArray = currentRoles.split(',').filter(id => id.trim() !== '');
        const updatedRolesArray = rolesArray.filter(id => id !== roleId);
        const updatedRoles = updatedRolesArray.join(',');
        
        const { databases, config } = getAppwriteClient();
        return await databases.updateDocument(
          config.databaseId,
          config.usersCollectionId,
          userProfile.$id,
          {
            roles: updatedRoles,
            updatedAt: new Date().toISOString()
          },
          [
            Permission.read(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any())
          ]
        );
      }
      throw new Error('User profile not found');
    } catch (error) {
      console.error('Appwrite service :: removeRoleFromUser :: error', error);
      throw error;
    }
  },

  // Get user roles
  getUserRoles: async (userId: string) => {
    try {
      const userProfile = await authService.getUserProfile(userId);
      if (userProfile && userProfile.roles) {
        // Convert from string to array
        const rolesArray = userProfile.roles.split(',').filter(id => id.trim() !== '');
        
        if (rolesArray.length > 0) {
          const { databases, config } = getAppwriteClient();
          // Only try to fetch roles if they exist
          const roles = await Promise.all(
            rolesArray.map(roleId => 
              databases.getDocument(config.databaseId, config.rolesCollectionId, roleId)
            )
          );
          return roles;
        }
      }
      return [];
    } catch (error) {
      console.error('Appwrite service :: getUserRoles :: error', error);
      // Return empty array instead of throwing to make the function more resilient
      return [];
    }
  }
};

export default roleService;