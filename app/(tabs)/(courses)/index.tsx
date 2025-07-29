import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { colors } from '../../../components/ui/theme';

export default function CoursesIndex() {
  const router = useRouter();
  
  // Automatically redirect to course library when this screen loads
  useEffect(() => {
    router.replace('/(admin)/(courses)/course-library');
  }, [router]);
  
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