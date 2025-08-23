import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { colors } from '../../components/ui/theme';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

// Airbnb-inspired color palette (matching the main tabs)
const airbnbColors = {
  // Primary Airbnb colors
  primary: '#FF5A5F',        // Airbnb's signature coral/red
  primaryDark: '#E8484D',    // Darker variant
  primaryLight: '#FFE8E9',   // Light coral background
  
  // Secondary colors
  secondary: '#00A699',      // Teal for accents
  secondaryLight: '#E0F7F5', // Light teal background
  
  // Neutral palette (very Airbnb-esque)
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  gray: '#EBEBEB',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  black: '#222222',
  
  // Status colors
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
};

export default function AdminLayout() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check admin role with proper error handling
  const checkAdminRole = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setIsAdmin(false);
      setCheckingAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      setCheckingAdmin(true);
      const userData = await appwriteService.getUserProfile(user.$id);
      const hasAdminRole = userData?.role === 'Admin' || userData?.isAdmin === true;
      
      setIsAdmin(hasAdminRole);
      
      if (!hasAdminRole) {
        // Non-admin users should be redirected
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      }
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
      // Redirect on error
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } finally {
      setCheckingAdmin(false);
      setIsLoading(false);
    }
  }, [user, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAdmin(false);
      setIsLoading(false);
      setCheckingAdmin(false);
      router.replace('/(pre-auth)');
      return;
    }

    checkAdminRole();
  }, [isAuthenticated, checkAdminRole, router]);

  if (isLoading || checkingAdmin) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Text style={styles.loadingText}>Loading admin panel...</Text>
      </View>
    );
  }

  if (!isAdmin) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Redirecting to main app...</Text>
      </View>
    );
  }

  // Using Tabs instead of Stack to show bottom navigation
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: airbnbColors.primary,
        tabBarInactiveTintColor: airbnbColors.mediumGray,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {/* Main visible tabs - these will show in the bottom tab bar */}
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'grid' : 'grid-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray} 
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(courses)" 
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'book' : 'book-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(users)" 
        options={{
          title: 'Users',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'people' : 'people-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(schools)" 
        options={{
          title: 'Schools',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'school' : 'school-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(quiz)" 
        options={{
          title: 'Quizzes',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon 
              name={focused ? 'help-circle' : 'help-circle-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />
      
      {/* Hidden screens - these won't appear in the tab bar but are still navigable */}
      <Tabs.Screen 
        name="(dashboard)" 
        options={{ 
          href: null // This completely hides it from the tab bar
        }} 
      />
      <Tabs.Screen 
        name="(analytics)" 
        options={{ 
          href: null // This completely hides it from the tab bar
        }} 
      />
      <Tabs.Screen 
        name="(classes)" 
        options={{ 
          href: null // This completely hides it from the tab bar
        }} 
      />
    </Tabs>
  );
}

// Helper component for tab bar icons
function TabBarIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  return (
    <View style={[
      styles.iconContainer,
      focused && styles.iconContainerActive
    ]}>
      <View style={[
        styles.iconWrapper,
        focused && styles.iconWrapperActive
      ]}>
        <Ionicons 
          name={name} 
          size={focused ? 24 : 22} 
          color={focused ? airbnbColors.white : color} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.neutral.darkGray,
  },
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 85, // Increased for better spacing
    paddingHorizontal: 16, // Increased for better spacing
    paddingTop: 10,
    paddingBottom: 22, // Increased bottom padding
    position: 'absolute',
    // Enhanced shadow for better separation from background
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
    // Stronger border for definition
    borderWidth: 0.5,
    borderColor: airbnbColors.lightGray,
    borderBottomWidth: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6, // Increased for better spacing
    marginBottom: 0,
    letterSpacing: 0.1,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6, // Increased for better touch area
    paddingHorizontal: 4, // Increased for better spacing
    minHeight: 60, // Increased minimum height
    maxWidth: '20%', // Ensure equal distribution across 5 tabs
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 2, // Small margin for better spacing
  },
  iconContainerActive: {
    transform: [{ scale: 1.08 }], // Slightly increased for better visual feedback
  },
  iconWrapper: {
    width: 36, // Increased for better touch area
    height: 36, // Increased for better touch area
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: airbnbColors.primary,
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: airbnbColors.primaryLight,
    transform: [{ scale: 1.0 }],
  },
});