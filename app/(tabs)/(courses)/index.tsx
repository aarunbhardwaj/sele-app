import { usePathname, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../components/ui/theme';
import { useAuth } from '../../../services/AuthContext';
import appwriteService from '../../../services/appwrite';

export default function CoursesIndex() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { user } = useAuth();
  const [message, setMessage] = useState('Loading course library...');
  const [error, setError] = useState<string | null>(null);
  const hasNavigated = useRef(false); // Prevent multiple navigations
  
  useEffect(() => {
    async function checkUserRole() {
      if (hasNavigated.current) return; // Prevent multiple executions
      
      try {
        if (!user) {
          setMessage('Please log in to access courses');
          return;
        }

        setMessage('Checking access permissions...');
        
        // Get user profile to check role
        const userProfile = await appwriteService.getUserProfile(user.$id);
        const isAdmin = userProfile?.role === 'Admin' || userProfile?.isAdmin === true;
        
        if (isAdmin) {
          setMessage('Redirecting to course management...');
          hasNavigated.current = true;
          
          // Use requestAnimationFrame for smooth navigation
          requestAnimationFrame(() => {
            try {
              router.replace('/(admin)/(courses)/course-library');
            } catch (navigationError) {
              console.warn('Course admin navigation error:', navigationError);
              setError('Navigation failed. Please try again.');
              hasNavigated.current = false;
            }
          });
        } else {
          setMessage('Redirecting to course catalog...');
          hasNavigated.current = true;
          
          requestAnimationFrame(() => {
            try {
              router.replace('/(tabs)/(courses)/catalog');
            } catch (navigationError) {
              console.warn('Course catalog navigation error:', navigationError);
              setError('Navigation failed. Please try again.');
              hasNavigated.current = false;
            }
          });
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setError('Failed to check permissions');
        setMessage('Redirecting to course catalog...');
        
        // Fallback to catalog on error
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          setTimeout(() => {
            try {
              router.replace('/(tabs)/(courses)/catalog');
            } catch (navigationError) {
              console.warn('Fallback navigation error:', navigationError);
              hasNavigated.current = false;
            }
          }, 1000);
        }
      }
    }
    
    // Small delay to prevent immediate navigation conflicts
    const timer = setTimeout(() => {
      checkUserRole();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [router, user, pathname, segments]);

  // Reset navigation flag when user changes
  useEffect(() => {
    hasNavigated.current = false;
  }, [user]);
  
  // Show loading indicator while redirecting
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>{message}</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    color: colors.neutral.darkGray,
    textAlign: 'center',
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    textAlign: 'center',
  }
});