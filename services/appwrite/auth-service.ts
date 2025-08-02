import { ID, Query } from 'appwrite';
import { account, DATABASE_ID, databases, USERS_COLLECTION_ID } from './client';

const authService = {
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
        return await authService.login(email, password);
      } else {
        throw new Error('Failed to create account');
      }
    } catch (error) {
      console.error('Appwrite service :: createAccount :: error', error);
      throw error;
    }
  },

  // Login to account
  login: async (email: string, password: string) => {
    try {
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
      const userProfile = await authService.getUserProfile(currentUser.$id);
      
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
};

export default authService;