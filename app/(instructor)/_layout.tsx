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

// Instructor-specific color palette
const instructorColors = {
  primary: '#00A699',        // Teal - more professional for instructors
  primaryDark: '#008B7D',    
  primaryLight: '#E0F7F5',   
  
  secondary: '#FF5A5F',      // Coral accent
  secondaryLight: '#FFE8E9', 
  
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  gray: '#EBEBEB',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  black: '#222222',
  
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
};

export default function InstructorLayout() {
  const { user, isAuthenticated, isInstructor } = useAuth();
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
        <ActivityIndicator size="large" color={instructorColors.primary} />
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
        tabBarActiveTintColor: instructorColors.primary,
        tabBarInactiveTintColor: instructorColors.mediumGray,
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
              color={focused ? instructorColors.primary : instructorColors.mediumGray} 
              focused={focused} 
            />
          ),
        }}
      />
      
      <Tabs.Screen 
        name="(courses)" 
        options={{
          title: 'My Courses',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'book' : 'book-outline'} 
              color={focused ? instructorColors.primary : instructorColors.mediumGray}
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
              color={focused ? instructorColors.primary : instructorColors.mediumGray}
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
              name={focused ? 'calendar' : 'calendar-outline'} 
              color={focused ? instructorColors.primary : instructorColors.mediumGray}
              focused={focused} 
            />
          ),
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
          color={focused ? instructorColors.white : color} 
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
    backgroundColor: instructorColors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: instructorColors.darkGray,
  },
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 85,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
    position: 'absolute',
    shadowColor: instructorColors.black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
    borderWidth: 0.5,
    borderColor: instructorColors.lightGray,
    borderBottomWidth: 0,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
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
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 60,
    maxWidth: '25%',
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
    backgroundColor: instructorColors.primary,
    shadowColor: instructorColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: instructorColors.primaryLight,
    transform: [{ scale: 1.0 }],
  },
});