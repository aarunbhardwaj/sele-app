import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Card from '../../../components/ui/Card';
import { colors } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';

export default function ClassSchedulerScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Class Scheduler"
        rightComponent={
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {}}
          >
            <Ionicons name="notifications-outline" size={24} color="#333333" />
          </TouchableOpacity>
        }
      />
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <Card variant="elevated" style={styles.card}>
            <Text variant="h2">Class Scheduler</Text>
            <Text variant="body1" style={styles.text}>This is a placeholder for the class scheduler screen.</Text>
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
  },
  card: { width: '100%', padding: 24 },
  text: { marginVertical: 16 },
  notificationButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#E5E5E5',
  },
});