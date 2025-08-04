import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { colors } from '../../../components/ui/theme';
import { useAuth } from '../../../services/AuthContext';
import appwriteService from '../../../services/appwrite';

export default function CoursesIndex() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function checkUserRole() {
      try {
        // First check if user is authenticated
        if (!user) {
          router.replace('/(pre-auth)/login');
          return;
        }
        
        // Check if user has admin role
        const isAdmin = await appwriteService.isUserAdmin(user.$id);
        
        if (isAdmin) {
          // If admin, go to admin course library
          router.replace('/(admin)/(courses)/course-library');
        } else {
          // If regular user, go to user course catalog
          router.replace('/(tabs)/(courses)/catalog');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        // Default to user course catalog on error
        router.replace('/(tabs)/(courses)/catalog');
      } finally {
        setLoading(false);
      }
    }
    
    checkUserRole();
  }, [router, user]);
  
  // Show loading indicator while redirecting
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary.main} />
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
});