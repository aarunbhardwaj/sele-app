import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import appwriteService from './appwrite';

type User = {
  $id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    checkUserStatus();
  }, []);

  // Check user authentication status
  const checkUserStatus = async () => {
    try {
      setIsLoading(true);
      const currentUser = await appwriteService.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Check if there's already an active session
      const isLoggedIn = await appwriteService.isLoggedIn();
      
      // Only attempt login if not already logged in
      if (!isLoggedIn) {
        await appwriteService.login(email, password);
      }
      
      const currentUser = await appwriteService.getCurrentUser();
      
      // Only proceed if we have a valid user
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        
        // Check if user is admin to redirect to admin panel
        try {
          const userProfile = await appwriteService.getUserProfile(currentUser.$id);
          console.log('User logged in:', currentUser.$id);
          
          // Store admin status in global state
          const isAdmin = userProfile && userProfile.isAdmin === true;
          
          // Use setTimeout to avoid React state update issues
          setTimeout(() => {
            if (isAdmin) {
              console.log('Detected admin user - redirecting to admin area');
              router.replace('/(admin)');
            } else {
              console.log('Standard user - redirecting to app');
              router.replace('/(tabs)');
            }
          }, 0);
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError);
          // Default to regular user view on profile fetch error
          setTimeout(() => router.replace('/(tabs)'), 0);
        }
      } else {
        throw new Error('Could not retrieve user details');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Display a user-friendly error message
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid email or password. Please try again.'
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Create account and automatically create profile
      await appwriteService.createAccount(email, password, name);
      const currentUser = await appwriteService.getCurrentUser();
      
      if (currentUser) {
        // Ensure user profile exists
        let userProfile = await appwriteService.getUserProfile(currentUser.$id);
        
        if (!userProfile) {
          console.log('Profile not found, creating one...');
          userProfile = await appwriteService.createUserProfile(currentUser.$id, {
            displayName: name,
            firstName: name.split(' ')[0] || '',
            lastName: name.split(' ').slice(1).join(' ') || '',
            englishLevel: 'beginner',
            dailyGoalMinutes: 15,
            isAdmin: false,
            role: 'student',
            status: 'active'
          });
        }
        
        setUser(currentUser);
        setIsAuthenticated(true);
        
        // Navigate to appropriate screen
        router.replace('/(tabs)');
        return true;
      } else {
        throw new Error('Failed to retrieve user after signup');
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      
      // Extract meaningful error message from Appwrite exception
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      // Handle specific Appwrite errors
      if (error.message) {
        if (error.message.includes('already exists')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Password must meet the security requirements. Please use a stronger password.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // Show alert with appropriate error message
      Alert.alert('Signup Failed', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await appwriteService.logout();
      
      // Clear authentication state first
      setUser(null);
      setIsAuthenticated(false);
      
      // Use setTimeout to avoid React state update issues during navigation
      setTimeout(() => {
        router.replace('/(pre-auth)');
      }, 0);
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Logout Failed', 'An error occurred while logging out. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await appwriteService.resetPassword(email);
    } catch (error: any) {
      console.error('Password reset failed:', error);
      Alert.alert(
        'Password Reset Failed',
        error.message || 'An error occurred while sending the password reset email. Please try again.'
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};