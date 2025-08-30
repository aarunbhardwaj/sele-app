import { ID, Query } from 'appwrite';
import { account, DATABASE_ID, databases, USERS_COLLECTION_ID, ROLES_COLLECTION_ID } from './client';
import { User, UserProfile, Role } from '../../lib/types';
import { withErrorHandling, AuthenticationError, AuthorizationError } from '../../lib/errors';

const authService = {
  // Create a new account with enhanced error handling
  createAccount: async (email: string, password: string, name: string) => {
    return withErrorHandling(async () => {
      const response = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      if (response.$id) {
        // Account creation successful, now log in
        await authService.login(email, password);
        
        // Create initial user profile
        await authService.createUserProfile(response.$id, {
          displayName: name,
          englishLevel: 'beginner',
          dailyGoalMinutes: 15,
          isAdmin: false,
        });
        
        return response;
      } else {
        throw new Error('Failed to create account');
      }
    }, 'AuthService.createAccount');
  },

  // Login to account with enhanced validation
  login: async (email: string, password: string) => {
    return withErrorHandling(async () => {
      const session = await account.createEmailPasswordSession(email, password);
      
      // Update last active timestamp
      const user = await account.get();
      if (user) {
        await authService.updateLastActive(user.$id);
      }
      
      return session;
    }, 'AuthService.login');
  },

  // Get current user with proper error handling
  getCurrentUser: async (): Promise<User | null> => {
    return withErrorHandling(async () => {
      return await account.get();
    }, 'AuthService.getCurrentUser', null);
  },

  // Get user account with role and permissions
  getUserAccount: async () => {
    return withErrorHandling(async () => {
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new AuthenticationError('No user is logged in');
      }
      
      const userProfile = await authService.getUserProfile(currentUser.$id);
      const userRoles = await authService.getUserRoles(currentUser.$id);
      
      return {
        ...currentUser,
        profile: userProfile,
        roles: userRoles,
        isAdmin: userProfile?.isAdmin || false
      };
    }, 'AuthService.getUserAccount');
  },

  // Check if user is authenticated
  isLoggedIn: async (): Promise<boolean> => {
    return withErrorHandling(async () => {
      const session = await account.getSession('current');
      return !!session;
    }, 'AuthService.isLoggedIn', false);
  },

  // Logout with cleanup
  logout: async () => {
    return withErrorHandling(async () => {
      return await account.deleteSession('current');
    }, 'AuthService.logout');
  },

  // Reset password with app-specific URL scheme
  resetPassword: async (email: string) => {
    return withErrorHandling(async () => {
      return await account.createRecovery(
        email,
        'react-tutorial://reset-password'  // Your app's URL scheme
      );
    }, 'AuthService.resetPassword');
  },

  // Complete password recovery
  completePasswordRecovery: async (userId: string, secret: string, password: string, confirmPassword: string) => {
    return withErrorHandling(async () => {
      return await account.updateRecovery(
        userId,
        secret,
        password,
        confirmPassword
      );
    }, 'AuthService.completePasswordRecovery');
  },

  // Create user profile with comprehensive data
  createUserProfile: async (userId: string, userData: Partial<UserProfile>) => {
    return withErrorHandling(async () => {
      return await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          displayName: userData.displayName || '',
          profilePicture: userData.profilePicture || '',
          bio: userData.bio || '',
          languagePreference: userData.languagePreference || 'en',
          experienceLevel: userData.experienceLevel || 'beginner',
          dailyGoalMinutes: userData.dailyGoalMinutes || 15,
          isAdmin: userData.isAdmin || false,
          schoolId: userData.schoolId || null,
          role: userData.role || 'student',
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          preferences: {
            notifications: {
              email: true,
              push: true,
              reminders: true
            },
            privacy: {
              profileVisibility: 'public',
              showProgress: true
            },
            learning: {
              dailyGoal: userData.dailyGoalMinutes || 15,
              difficultyPreference: 'adaptive'
            }
          }
        }
      );
    }, 'AuthService.createUserProfile');
  },
  
  // Get user profile with fallback
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    return withErrorHandling(async () => {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );
      
      return response.documents[0] as UserProfile || null;
    }, 'AuthService.getUserProfile', null);
  },
  
  // Update user profile
  updateUserProfile: async (documentId: string, userData: Partial<UserProfile>) => {
    return withErrorHandling(async () => {
      const updateData = {
        ...userData,
        lastActive: new Date().toISOString(),
      };
      
      return await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId,
        updateData
      );
    }, 'AuthService.updateUserProfile');
  },

  // Update last active timestamp
  updateLastActive: async (userId: string) => {
    return withErrorHandling(async () => {
      const profile = await authService.getUserProfile(userId);
      if (profile) {
        return await authService.updateUserProfile(profile.$id, {
          lastActive: new Date().toISOString()
        });
      }
    }, 'AuthService.updateLastActive');
  },

  // Get user roles
  getUserRoles: async (userId: string): Promise<Role[]> => {
    return withErrorHandling(async () => {
      // This would be implemented based on your role assignment system
      // For now, returning a basic role structure
      const profile = await authService.getUserProfile(userId);
      
      if (profile?.isAdmin) {
        return [{
          $id: 'admin-role',
          name: 'Administrator',
          description: 'Full system access',
          permissions: ['read', 'write', 'delete', 'admin'],
          isSystem: true
        }];
      } else {
        return [{
          $id: 'student-role',
          name: 'Student',
          description: 'Standard student access',
          permissions: ['read'],
          isSystem: true
        }];
      }
    }, 'AuthService.getUserRoles', []);
  },

  // Check if user has permission
  hasPermission: async (userId: string, permission: string): Promise<boolean> => {
    return withErrorHandling(async () => {
      const roles = await authService.getUserRoles(userId);
      return roles.some(role => role.permissions.includes(permission));
    }, 'AuthService.hasPermission', false);
  },

  // Check if user is admin
  isAdmin: async (userId: string): Promise<boolean> => {
    return withErrorHandling(async () => {
      const profile = await authService.getUserProfile(userId);
      return profile?.isAdmin || false;
    }, 'AuthService.isAdmin', false);
  },

  // Get all users with pagination and filtering
  getAllUsers: async (limit: number = 25, offset: number = 0, search?: string) => {
    return withErrorHandling(async () => {
      const queries = [Query.limit(limit), Query.offset(offset)];
      
      if (search) {
        queries.push(Query.search('displayName', search));
      }
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        queries
      );
      
      return {
        users: response.documents as UserProfile[],
        total: response.total
      };
    }, 'AuthService.getAllUsers');
  },

  // Delete user account (admin only)
  deleteUserAccount: async (userId: string, currentUserId: string) => {
    return withErrorHandling(async () => {
      // Check if current user is admin
      const isAdminUser = await authService.isAdmin(currentUserId);
      if (!isAdminUser) {
        throw new AuthorizationError('Only administrators can delete user accounts');
      }
      
      // Get user profile to delete
      const profile = await authService.getUserProfile(userId);
      if (profile) {
        return await databases.deleteDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          profile.$id
        );
      }
    }, 'AuthService.deleteUserAccount');
  },
};

export default authService;