import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

// Consistent Airbnb-inspired color palette (matching main app)
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

export default function InstructorLayout() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Check instructor access
  const checkAccess = useCallback(async () => {
    if (!user || !isAuthenticated) {
      setHasAccess(false);
      setCheckingAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      setCheckingAccess(true);
      const userData = await appwriteService.getUserProfile(user.$id);
      const hasInstructorRole = userData?.role === 'instructor' || userData?.isInstructor === true;
      
      setHasAccess(hasInstructorRole);
      
      if (!hasInstructorRole) {
        // Non-instructor users should be redirected
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      }
    } catch (error) {
      console.error('Error checking instructor access:', error);
      setHasAccess(false);
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 100);
    } finally {
      setCheckingAccess(false);
      setIsLoading(false);
    }
  }, [user, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      setHasAccess(false);
      setIsLoading(false);
      setCheckingAccess(false);
      router.replace('/(pre-auth)');
      return;
    }

    checkAccess();
  }, [isAuthenticated, checkAccess, router]);

  if (isLoading || checkingAccess) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Text style={styles.loadingText}>Loading instructor dashboard...</Text>
      </View>
    );
  }

  if (!hasAccess) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Redirecting to main app...</Text>
      </View>
    );
  }

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
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'speedometer' : 'speedometer-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray} 
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(calendar)" 
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'calendar' : 'calendar-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(students)" 
        options={{
          title: 'Students',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'people' : 'people-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(classes)" 
        options={{
          title: 'Classes',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'school' : 'school-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(profile)" 
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'person' : 'person-outline'} 
              color={focused ? airbnbColors.primary : airbnbColors.mediumGray}
              focused={focused} 
            />
          ),
        }}
      />

      {/* Hide non-tab screens from the tab bar */}
      <Tabs.Screen 
        name="class-session" 
        options={{
          href: null, // Hide from tab bar
        }}
      />
      
      <Tabs.Screen 
        name="student-rating" 
        options={{
          href: null, // Hide from tab bar
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
    backgroundColor: airbnbColors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: airbnbColors.darkGray,
  },
  tabBar: {
    backgroundColor: airbnbColors.white,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
    height: 85,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 22,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 0,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    minHeight: 50,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 2,
  },
  iconContainerActive: {
    transform: [{ scale: 1.08 }],
  },
  iconWrapper: {
    width: 36,
    height: 36,
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