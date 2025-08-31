import { ID, Query } from 'appwrite';
import { AuthenticationError, AuthorizationError, withErrorHandling } from '../../lib/errors';
import { Role, User, UserProfile } from '../../lib/types';
import { account, DATABASE_ID, databases, USERS_COLLECTION_ID } from './client';

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
        
        // Create initial user profile with better error handling
        try {
          await authService.createUserProfile(response.$id, {
            displayName: name,
            firstName: name.split(' ')[0] || '',
            lastName: name.split(' ').slice(1).join(' ') || '',
            englishLevel: 'beginner',
            dailyGoalMinutes: 15,
            isAdmin: false,
            role: 'student',
            status: 'active'
          });
          console.log('User profile created successfully for:', response.$id);
        } catch (profileError) {
          console.error('Failed to create user profile:', profileError);
          // Don't throw here - user account was created successfully
          // Profile creation can be retried later
        }
        
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
          displayName: userData.displayName || '',
          email: userData.email || '',
          profileImage: userData.profileImage || '',
          nativeLanguage: userData.nativeLanguage || 'English',
          englishLevel: userData.englishLevel || 'beginner',
          learningGoal: userData.learningGoal || 'Improve my English skills',
          dailyGoalMinutes: userData.dailyGoalMinutes || 15,
          isAdmin: userData.isAdmin || false,
          roles: userData.roles || '',
          isInstructor: userData.isInstructor || false,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          phone: userData.phone || null,
          location: userData.location || '',
          bio: userData.bio || ''
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

  // Sync auth users with missing profiles (admin utility)
  syncAuthUsersWithProfiles: async () => {
    return withErrorHandling(async () => {
      console.log('Starting comprehensive user profile sync...');
      let createdProfiles = 0;
      
      try {
        // Get all existing profiles first
        const existingProfilesResponse = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.limit(100)] // Adjust limit as needed
        );
        
        const existingUserIds = existingProfilesResponse.documents.map(
          (profile: any) => profile.userId
        );
        
        console.log(`Found ${existingUserIds.length} existing profiles`);
        
        // Get current user to ensure they have a profile
        const currentUser = await account.get();
        if (currentUser && !existingUserIds.includes(currentUser.$id)) {
          console.log('Creating missing profile for current user:', currentUser.$id);
          await authService.createUserProfile(currentUser.$id, {
            displayName: currentUser.name || 'User',
            firstName: currentUser.name?.split(' ')[0] || '',
            lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
            englishLevel: 'beginner',
            dailyGoalMinutes: 15,
            isAdmin: false,
            role: 'student',
            status: 'active'
          });
          createdProfiles++;
        }
        
        return { 
          created: createdProfiles, 
          message: `Profile sync completed. Created ${createdProfiles} profiles.`,
          existingProfiles: existingUserIds.length 
        };
        
      } catch (error) {
        console.error('Error during profile sync:', error);
        return { 
          created: createdProfiles, 
          message: `Sync completed with errors. Created ${createdProfiles} profiles.`,
          error: error.message 
        };
      }
    }, 'AuthService.syncAuthUsersWithProfiles');
  },

  // Get enhanced user data combining auth and profile
  getEnhancedUserData: async (userId: string) => {
    return withErrorHandling(async () => {
      const profile = await authService.getUserProfile(userId);
      
      if (!profile) {
        // If no profile exists, try to create one for the current user
        const currentUser = await account.get();
        if (currentUser && currentUser.$id === userId) {
          console.log('Creating missing profile for current user during data fetch');
          const newProfile = await authService.createUserProfile(userId, {
            displayName: currentUser.name || 'User',
            firstName: currentUser.name?.split(' ')[0] || '',
            lastName: currentUser.name?.split(' ').slice(1).join(' ') || '',
            englishLevel: 'beginner',
            dailyGoalMinutes: 15,
            isAdmin: false,
            role: 'student',
            status: 'active'
          });
          return newProfile;
        }
        return null;
      }
      
      return profile;
    }, 'AuthService.getEnhancedUserData', null);
  },
};

export default authService;