import { ID, Permission, Query, Role } from 'appwrite';
import { AuthenticationError, AuthorizationError, withErrorHandling } from '../../lib/errors';
import { User, UserProfile, Role as UserRole } from '../../lib/types';
import { account, databaseId, databases, usersCollectionId } from './client';

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
            experienceLevel: 'beginner',
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
    try {
      const result = await withErrorHandling(async () => {
        try {
          // First check if there's an active session
          const session = await account.getSession('current');
          if (!session) {
            return null;
          }
          
          // Only try to get user if session exists
          return await account.get();
        } catch (error: any) {
          // Handle specific guest/no session errors
          if (error.code === 401 || error.message?.includes('guests') || error.message?.includes('missing scopes')) {
            console.log('User is not authenticated (guest state)');
            return null;
          }
          
          // Re-throw other errors
          throw error;
        }
      }, 'AuthService.getCurrentUser', null);
      
      return result || null;
    } catch {
      return null;
    }
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
    }, 'AuthService.getUserAccount', null as any);
  },

  // Check if user is authenticated
  isLoggedIn: async (): Promise<boolean> => {
    return withErrorHandling(async () => {
      try {
        const session = await account.getSession('current');
        return !!session;
      } catch (error: any) {
        // Handle specific guest/no session errors
        if (error.code === 401 || error.message?.includes('guests') || error.message?.includes('missing scopes')) {
          console.log('No active session found (guest state)');
          return false;
        }
        // Re-throw other unexpected errors
        throw error;
      }
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
  completePasswordRecovery: async (userId: string, secret: string, password: string) => {
    return withErrorHandling(async () => {
      return await account.updateRecovery(
        userId,
        secret,
        password
      );
    }, 'AuthService.completePasswordRecovery');
  },

  // Create user profile with comprehensive data
  createUserProfile: async (userId: string, userData: Partial<UserProfile>) => {
    return withErrorHandling(async () => {
      console.log('[AuthService.createUserProfile] Creating profile for', userId, 'DB:', databaseId, 'COL:', usersCollectionId);
      // Use the userId as the document ID for a direct 1-to-1 mapping
      return await databases.createDocument(
        databaseId,
        usersCollectionId,
        ID.custom(userId), // Use custom ID matching the user's auth ID
        {
          userId: userId, // Keep userId in the document for consistency
          displayName: userData.displayName || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          profilePicture: userData.profilePicture || '',
          languagePreference: userData.languagePreference || 'English',
          englishLevel: userData.englishLevel || 'beginner',
          learningGoals: userData.learningGoals || ['Improve my English skills'],
          experienceLevel: userData.experienceLevel || 'beginner',
          isAdmin: userData.isAdmin || false,
          role: userData.role || 'student',
          isInstructor: userData.isInstructor || false,
          status: userData.status || 'active',
          lastActive: new Date().toISOString(),
          phone: userData.phone || null,
          bio: userData.bio || '',
          preferences: userData.preferences || {
            notifications: { email: true, push: true, reminders: true },
            privacy: { profileVisibility: 'public', showProgress: true },
            learning: { dailyGoal: 15, difficultyPreference: 'adaptive' }
          }
        },
        [
          // Allow the owner to manage their profile
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
          // Allow all authenticated users to read basic profiles (optional)
          Permission.read(Role.users())
        ]
      );
    }, 'AuthService.createUserProfile');
  },
  
  // Get user profile with fallback
  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    const result = await withErrorHandling(async () => {
      console.log('[AuthService.getUserProfile] Fetching profile for', userId, 'using getDocument.');
      try {
        // First, try fetching directly using userId as the document ID.
        const document = await databases.getDocument(
          databaseId,
          usersCollectionId,
          userId 
        );
        return (document as unknown as UserProfile) || null;
      } catch (error: any) {
        // If not found (404), it might be an old profile with a unique() ID.
        // Fallback to listing documents.
        if (error.code === 404) {
          console.log('[AuthService.getUserProfile] Document with ID', userId, 'not found. Falling back to listDocuments.');
          const response = await databases.listDocuments(
            databaseId,
            usersCollectionId,
            [Query.equal('userId', userId), Query.limit(1)]
          );
          if (response.documents.length > 0) {
            return (response.documents[0] as unknown as UserProfile) || null;
          }
        }
        // For other errors (like 502), re-throw to be handled by retry logic.
        throw error;
      }
    }, 'AuthService.getUserProfile', null);
    return result as UserProfile | null; 
  },
  
  // Update user profile
  updateUserProfile: async (documentId: string, userData: Partial<UserProfile>) => {
    return withErrorHandling(async () => {
      const updateData = {
        ...userData,
        lastActive: new Date().toISOString(),
      };
      
      // The documentId might be a userId or a unique ID. getDocument will handle both.
      return await databases.updateDocument(
        databaseId,
        usersCollectionId,
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
        // Use profile.$id, which is the actual document ID
        return await authService.updateUserProfile(profile.$id, {
          lastActive: new Date().toISOString()
        });
      }
    }, 'AuthService.updateLastActive');
  },

  // Get user roles
  getUserRoles: async (userId: string): Promise<UserRole[]> => {
    const roles = await withErrorHandling(async () => {
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
    }, 'AuthService.getUserRoles', [] as UserRole[]);
    return roles as UserRole[];
  },

  // Check if user has permission
  hasPermission: async (userId: string, permission: string): Promise<boolean> => {
    const result = await withErrorHandling(async () => {
      const roles = await authService.getUserRoles(userId);
      return roles.some(role => role.permissions.includes(permission));
    }, 'AuthService.hasPermission', false);
    return !!result;
  },

  // Check if user is admin
  isAdmin: async (userId: string): Promise<boolean> => {
    const result = await withErrorHandling(async () => {
      const profile = await authService.getUserProfile(userId);
      return profile?.isAdmin || false;
    }, 'AuthService.isAdmin', false);
    return !!result;
  },

  // Get all users with pagination and filtering
  getAllUsers: async (limit: number = 25, offset: number = 0, search?: string) => {
    return withErrorHandling(async () => {
      const queries = [Query.limit(limit), Query.offset(offset)];
      
      if (search) {
        queries.push(Query.search('displayName', search));
      }
      
      const response = await databases.listDocuments(
        databaseId,
        usersCollectionId,
        queries
      );
      
      return {
        users: response.documents as unknown as UserProfile[],
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
          databaseId,
          usersCollectionId,
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
          databaseId,
          usersCollectionId,
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
            experienceLevel: 'beginner',
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return { 
          created: createdProfiles, 
          message: `Sync completed with errors. Created ${createdProfiles} profiles.`,
          error: errorMessage
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
            experienceLevel: 'beginner',
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