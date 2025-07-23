import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import Card from '../../../components/ui/Card';
import { colors } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';

export default function AdminDashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader title="Admin Dashboard" />
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <Card variant="elevated" style={styles.card}>
            <Text variant="h2">Admin Dashboard</Text>
            <Text variant="body1" style={styles.text}>This is a placeholder for the admin dashboard screen.</Text>
          </Card>
        </View>
      </ScrollView>
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
  },
  contentContainer: {
    padding: 16,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: { 
    width: '100%', 
    padding: 24 
  },
  text: { 
    marginVertical: 16 
  },
});