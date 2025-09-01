import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#E8484D',
  primaryLight: '#FFE8E9',
  secondary: '#00A699',
  secondaryLight: '#E0F7F5',
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  gray: '#EBEBEB',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  black: '#222222',
  warning: '#FC642D',
  error: '#C13515',
};

interface ClassDetail {
  $id: string;
  title: string;
  description?: string;
  subject?: string;
  grade?: string;
  currentEnrollment?: number;
  maxStudents?: number;
  schedule?: string;
  meetingDays?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  room?: string;
}

export default function InstructorClassDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassDetail | null>(null);

  const loadClass = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await appwriteService.getClassById(id);
      setClassData(data);
    } catch (error) {
      console.error('Failed to load class', error);
      Alert.alert('Error', 'Unable to load class details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadClass();
  }, [loadClass]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Text style={styles.loadingText}>Loading class...</Text>
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={48} color={airbnbColors.error} />
        <Text style={styles.errorTitle}>Class Not Found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title={classData.title || 'Class Details'}
        showBackButton={true}
        onBackPress={() => router.back()}
        showRefresh={true}
        onRefreshPress={loadClass}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{classData.title}</Text>
          {classData.description && (
            <Text style={styles.description}>{classData.description}</Text>
          )}
          <View style={styles.metaRow}>
            <Ionicons name="book-outline" size={18} color={airbnbColors.darkGray} />
            <Text style={styles.metaText}>{classData.subject || 'Subject'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="layers-outline" size={18} color={airbnbColors.darkGray} />
            <Text style={styles.metaText}>Grade: {classData.grade || 'N/A'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={18} color={airbnbColors.darkGray} />
            <Text style={styles.metaText}>{classData.currentEnrollment || 0}/{classData.maxStudents || 0} students</Text>
          </View>
          {(classData.schedule || classData.meetingDays) && (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={18} color={airbnbColors.darkGray} />
              <Text style={styles.metaText}>{classData.schedule || `${classData.meetingDays} ${classData.startTime || ''}`}</Text>
            </View>
          )}
          {classData.room && (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={18} color={airbnbColors.darkGray} />
              <Text style={styles.metaText}>Room: {classData.room}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: airbnbColors.offWhite },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 120 },
  card: { backgroundColor: airbnbColors.white, borderRadius: 16, padding: 20, shadowColor: airbnbColors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 24, fontWeight: '700', color: airbnbColors.charcoal, marginBottom: 8 },
  description: { fontSize: 16, lineHeight: 22, color: airbnbColors.darkGray, marginBottom: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  metaText: { fontSize: 15, color: airbnbColors.darkGray },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: airbnbColors.offWhite },
  loadingText: { marginTop: 16, fontSize: 16, color: airbnbColors.darkGray, fontWeight: '500' },
  errorTitle: { marginTop: 16, fontSize: 18, fontWeight: '600', color: airbnbColors.error },
  backButton: { marginTop: 24, backgroundColor: airbnbColors.primary, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  backButtonText: { color: airbnbColors.white, fontSize: 16, fontWeight: '600' },
});