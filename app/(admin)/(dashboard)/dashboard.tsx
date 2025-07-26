import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { colors } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';

export default function AdminDashboardScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main dashboard index to avoid duplicate dashboards
    router.replace('/(admin)/(dashboard)/index');
  }, []);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary.main} />
        <Text variant="body1" style={styles.text}>Redirecting to main dashboard...</Text>
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
    padding: 16
  },
  text: { 
    marginTop: 16,
    textAlign: 'center',
    color: colors.neutral.darkGray
  }
});