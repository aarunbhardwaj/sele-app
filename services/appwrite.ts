import { Account, Client, Databases, ID, Permission, Query, Role, Storage } from 'appwrite';

// Initialize Appwrite client
const appwriteEndpoint = 'https://cloud.appwrite.io/v1';
const appwriteProjectId = process.env.APPWRITE_PROJECT_ID || '68651f96001557986822';

// Database and collection IDs - make sure these match what's in Appwrite console
const DATABASE_ID = '6865602f000c8cc789bc';
const USERS_COLLECTION_ID = '6865d7f500022651a73a';
const ROLES_COLLECTION_ID = '6867fe9a000b1af9bdb8'; // Updated to correct roles collection ID
const COURSES_COLLECTION_ID = '6865dcb4001f03a2d904';
const LESSONS_COLLECTION_ID = '6865e600000561ebba31';
const EXERCISES_COLLECTION_ID = '6865e601000911331884';
const USER_PROGRESS_COLLECTION_ID = '6865e602000810dc0714';
const LESSON_COMPLETIONS_COLLECTION_ID = '6865e603000c430c1275';
const USER_ACTIVITIES_COLLECTION_ID = '6865e6040018e12e103d';
const STORAGE_BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || 'profile_images'; // Now loaded from .env

// Initialize the client
const client = new Client()
    .setEndpoint(appwriteEndpoint)
    .setProject(appwriteProjectId);

// Initialize services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Role management methods
const roleManagement = {
  // Create a new role
  createRole: async (name: string, permissions: string[]) => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        ROLES_COLLECTION_ID,
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
      const response = await databases.listDocuments(
        DATABASE_ID,
        ROLES_COLLECTION_ID
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
      return await databases.updateDocument(
        DATABASE_ID,
        ROLES_COLLECTION_ID,
        roleId,
        updateData
      );
    } catch (error) {
      console.error('Appwrite service :: updateRole :: error', error);
      throw error;
    }
  },

  // Delete a role
  deleteRole: async (roleId: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        ROLES_COLLECTION_ID,
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
      const userProfile = await appwriteService.getUserProfile(userId);
      if (userProfile) {
        return await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userProfile.$id,
          {
            roles: [...(userProfile.roles || []), roleId],
            updatedAt: new Date().toISOString()
          }
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
      const userProfile = await appwriteService.getUserProfile(userId);
      if (userProfile) {
        return await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userProfile.$id,
          {
            roles: (userProfile.roles || []).filter(id => id !== roleId),
            updatedAt: new Date().toISOString()
          }
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
      const userProfile = await appwriteService.getUserProfile(userId);
      if (userProfile && userProfile.roles) {
        const roles = await Promise.all(
          userProfile.roles.map(roleId => 
            databases.getDocument(DATABASE_ID, ROLES_COLLECTION_ID, roleId)
          )
        );
        return roles;
      }
      return [];
    } catch (error) {
      console.error('Appwrite service :: getUserRoles :: error', error);
      throw error;
    }
  }
};

export const appwriteService = {
  // Create a new account
  createAccount: async (email: string, password: string, name: string) => {
    try {
      const response = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      if (response.$id) {
        // Account creation successful, now log in
        return await appwriteService.login(email, password);
      } else {
        throw new Error('Failed to create account');
      }
    } catch (error) {
      console.error('Appwrite service :: createAccount :: error', error);
      throw error;
    }
  },

  // Login to account - updated to use emailPasswordLogin for version 18.1.1
  login: async (email: string, password: string) => {
    try {
      // Using correct method for SDK version 18.1.1
      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error) {
      console.error('Appwrite service :: login :: error', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      return await account.get();
    } catch (error) {
      // This is often normal for guest users, so we'll handle it gracefully
      if (error.toString().includes('missing scope')) {
        console.log('User is not authenticated yet');
      } else {
        console.error('Appwrite service :: getCurrentUser :: error', error);
      }
      return null;
    }
  },

  // Get user account details including admin status
  getUserAccount: async () => {
    try {
      // First get the current user
      const currentUser = await account.get();
      
      if (!currentUser) {
        throw new Error('No user is logged in');
      }
      
      // Then get the user profile with additional information like isAdmin
      const userProfile = await appwriteService.getUserProfile(currentUser.$id);
      
      return userProfile;
    } catch (error) {
      console.error('Appwrite service :: getUserAccount :: error', error);
      throw error;
    }
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    try {
      const session = await account.getSession('current');
      return !!session;
    } catch (error) {
      return false;
    }
  },

  // Logout
  logout: async () => {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      console.error('Appwrite service :: logout :: error', error);
      throw error;
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      // Use the app URL scheme for mobile apps
      return await account.createRecovery(
        email,
        'react-tutorial://'  // Your app's URL scheme
      );
    } catch (error) {
      console.error('Appwrite service :: resetPassword :: error', error);
      throw error;
    }
  },

  // Update password with recovery code
  completePasswordRecovery: async (userId: string, secret: string, password: string, confirmPassword: string) => {
    try {
      return await account.updateRecovery(
        userId,
        secret,
        password,
        confirmPassword
      );
    } catch (error) {
      console.error('Appwrite service :: completePasswordRecovery :: error', error);
      throw error;
    }
  },

  // User profile methods
  createUserProfile: async (userId, userData) => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          displayName: userData.displayName,
          profileImage: userData.profileImage || '',
          nativeLanguage: userData.nativeLanguage,
          englishLevel: userData.englishLevel || 'beginner',
          learningGoal: userData.learningGoal || '',
          dailyGoalMinutes: userData.dailyGoalMinutes || 15,
          joinedDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Appwrite service :: createUserProfile :: error', error);
      throw error;
    }
  },
  
  getUserProfile: async (userId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );
      
      return response.documents[0];
    } catch (error) {
      console.error('Appwrite service :: getUserProfile :: error', error);
      throw error;
    }
  },
  
  updateUserProfile: async (documentId, userData) => {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        documentId,
        userData
      );
    } catch (error) {
      console.error('Appwrite service :: updateUserProfile :: error', error);
      throw error;
    }
  },
  
  // Course methods
  getAllCourses: async (filters = []) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        filters
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getAllCourses :: error', error);
      throw error;
    }
  },
  
  getCoursesByLevel: async (level) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        [Query.equal('level', level), Query.equal('isPublished', true)]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getCoursesByLevel :: error', error);
      throw error;
    }
  },
  
  getCourseById: async (courseId) => {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        COURSES_COLLECTION_ID,
        courseId
      );
    } catch (error) {
      console.error('Appwrite service :: getCourseById :: error', error);
      throw error;
    }
  },
  
  // Lesson methods
  getLessonsByCourse: async (courseId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        LESSONS_COLLECTION_ID,
        [
          Query.equal('courseId', courseId),
          Query.equal('isPublished', true),
          Query.orderAsc('order')
        ]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getLessonsByCourse :: error', error);
      throw error;
    }
  },
  
  getLessonById: async (lessonId) => {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        LESSONS_COLLECTION_ID,
        lessonId
      );
    } catch (error) {
      console.error('Appwrite service :: getLessonById :: error', error);
      throw error;
    }
  },
  
  // Exercise methods
  getExercisesByLesson: async (lessonId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        EXERCISES_COLLECTION_ID,
        [Query.equal('lessonId', lessonId)]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getExercisesByLesson :: error', error);
      throw error;
    }
  },
  
  // User Progress methods
  getUserProgress: async (userId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_PROGRESS_COLLECTION_ID,
        [Query.equal('userId', userId)]
      );
      
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getUserProgress :: error', error);
      throw error;
    }
  },
  
  getUserCourseProgress: async (userId, courseId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USER_PROGRESS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.equal('courseId', courseId)
        ]
      );
      
      return response.documents[0];
    } catch (error) {
      console.error('Appwrite service :: getUserCourseProgress :: error', error);
      throw error;
    }
  },
  
  createUserProgress: async (userId, courseId) => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        USER_PROGRESS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          courseId: courseId,
          lastCompletedLesson: null,
          enrollmentDate: new Date().toISOString(),
          completedLessons: [],
          overallProgress: 0,
          totalPointsEarned: 0,
          lastAccessDate: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Appwrite service :: createUserProgress :: error', error);
      throw error;
    }
  },
  
  updateUserProgress: async (progressId, progressData) => {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        USER_PROGRESS_COLLECTION_ID,
        progressId,
        progressData
      );
    } catch (error) {
      console.error('Appwrite service :: updateUserProgress :: error', error);
      throw error;
    }
  },
  
  // Lesson completion methods
  recordLessonCompletion: async (userId, lessonId, completionData) => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        LESSON_COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          lessonId: lessonId,
          completedAt: new Date().toISOString(),
          score: completionData.score,
          timeSpent: completionData.timeSpent,
          exercisesCompleted: completionData.exercisesCompleted,
          exercisesCorrect: completionData.exercisesCorrect,
        }
      );
    } catch (error) {
      console.error('Appwrite service :: recordLessonCompletion :: error', error);
      throw error;
    }
  },
  
  // User activity tracking
  trackUserActivity: async (userId, type, entityId, details = {}) => {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        USER_ACTIVITIES_COLLECTION_ID,
        ID.unique(),
        {
          userId: userId,
          type: type,
          entityId: entityId,
          timestamp: new Date().toISOString(),
          details: details,
        }
      );
    } catch (error) {
      console.error('Appwrite service :: trackUserActivity :: error', error);
      throw error;
    }
  },
  
  // Media storage methods
  uploadMedia: async (file, permissions = []) => {
    try {
      console.log('File object received for upload:', {
        name: file.name,
        type: file.type,
        size: file.size,
        hasUri: !!file.uri,
        hasSource: !!file.source
      });

      try {
        // Format required by Appwrite for React Native uploads
        const uploadedFile = await storage.createFile(
          STORAGE_BUCKET_ID,
          ID.unique(),
          file,  // Pass the entire file object directly
          [Permission.read(Role.any())]
        );
        
        console.log('File uploaded successfully:', uploadedFile.$id);
        return uploadedFile;
      } catch (error) {
        if (error.message && error.message.includes('Storage bucket not found')) {
          console.error('Storage bucket not found. Please create a bucket named "profile_images" in your Appwrite console.');
          throw new Error('Storage bucket not found. Please create a bucket named "profile_images" in your Appwrite console.');
        } else {
          console.error('Upload error details:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Appwrite service :: uploadMedia :: error', error);
      throw error;
    }
  },
  
  getFilePreview: (fileId) => {
    try {
      // Use getFileView instead of getFilePreview for a direct URL
      const previewUrl = storage.getFileView(STORAGE_BUCKET_ID, fileId);
      console.log('File preview URL:', previewUrl.toString());
      return previewUrl;
    } catch (error) {
      console.error('Appwrite service :: getFilePreview :: error', error);
      return null;
    }
  },
  
  deleteFile: async (fileId) => {
    try {
      await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
      return true;
    } catch (error) {
      console.error('Appwrite service :: deleteFile :: error', error);
      throw error;
    }
  },

  // Get all users
  getAllUsers: async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID
      );
      return response.documents;
    } catch (error) {
      console.error('Appwrite service :: getAllUsers :: error', error);
      throw error;
    }
  },

  // Role management methods - adding these to the main appwriteService object
  createRole: roleManagement.createRole,
  getAllRoles: roleManagement.getAllRoles,
  updateRole: roleManagement.updateRole,
  deleteRole: roleManagement.deleteRole,
  assignRoleToUser: roleManagement.assignRoleToUser,
  removeRoleFromUser: roleManagement.removeRoleFromUser,
  getUserRoles: roleManagement.getUserRoles
};

export default appwriteService;