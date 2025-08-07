import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../../components/ui/theme';

export default function CoursesIndexPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Simple direct navigation to course-library
    // Using a small timeout to avoid potential navigation conflicts
    const redirectTimer = setTimeout(() => {
      console.log('Redirecting to admin course library...');
      router.replace('/(admin)/(courses)/course-library');
    }, 200);
    
    return () => clearTimeout(redirectTimer);
  }, [router]);
  
  // Show a loading indicator while redirecting
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text style={styles.loadingText}>Loading course library...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.background,
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.primary.main,
    fontSize: typography.fontSizes.md,
  },
});