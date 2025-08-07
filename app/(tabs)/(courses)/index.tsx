import { usePathname, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  
  useEffect(() => {
    async function checkUserRole() {
      try {
        // First check if user is authenticated
        if (!user) {
          console.log('No user found, redirecting to login');
          router.replace('/(pre-auth)/login');
          return;
        }
        
        console.log('Checking role for user:', user.$id);
        
        // Check if we're coming from a tab click when already in courses section
        const isRevisitingCoursesTab = pathname === '/(tabs)/(courses)' && 
          segments.length === 2; // Just the tabs and courses segments
        
        setMessage('Checking your access level...');
        
        // Check if user has admin role
        const isAdmin = await appwriteService.isUserAdmin(user.$id);
        console.log('Is user admin?', isAdmin);
        
        if (isAdmin) {
          setMessage('Loading admin course library...');
          // If admin, go to admin course library
          setTimeout(() => {
            router.replace('/(admin)/(courses)/course-library');
          }, 100);
        } else {
          setMessage('Loading course catalog...');
          // If regular user, go to user course catalog
          setTimeout(() => {
            router.replace('/(tabs)/(courses)/catalog');
          }, 100);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setError('Error loading courses. Please try again.');
        setMessage('Something went wrong. Redirecting to course catalog...');
        // Default to user course catalog on error
        setTimeout(() => {
          router.replace('/(tabs)/(courses)/catalog');
        }, 1000);
      }
    }
    
    checkUserRole();
  }, [router, user, pathname, segments]);
  
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
  },
  loadingText: {
    marginTop: 10,
    color: colors.neutral.darkGray,
  },
  errorText: {
    marginTop: 10,
    color: 'red',
  }
});