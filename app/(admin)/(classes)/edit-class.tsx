import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { classService } from '../../../services/appwrite/classService';

// Airbnb Colors
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#E1474C',
  secondary: '#00A699',
  tertiary: '#FC642D',
  dark: '#484848',
  mediumGray: '#767676',
  lightGray: '#EBEBEB',
  superLightGray: '#F7F7F7',
  white: '#FFFFFF',
  black: '#222222',
  success: '#008A05',
  warning: '#FFB400',
  error: '#C13515',
  background: '#FDFDFD',
  border: '#DDDDDD',
};

// Airbnb Typography
const airbnbTypography = {
  fontFamily: Platform.OS === 'ios' ? 'Circular' : 'CircularStd',
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    huge: 32,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Airbnb Spacing
const airbnbSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

interface AirbnbTextProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'small';
  color?: string;
  numberOfLines?: number;
  [key: string]: any;
}

export default function EditClassScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const classId = params.id as string;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Class form state
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [schedule, setSchedule] = useState('');
  const [maxStudents, setMaxStudents] = useState('30');
  const [duration, setDuration] = useState('60');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [status, setStatus] = useState<'active' | 'inactive' | 'full' | 'archived'>('active');
  const [enrollmentStatus, setEnrollmentStatus] = useState<'open' | 'closed' | 'waitlist-only'>('open');

  // Load class data
  useEffect(() => {
    if (classId) {
      loadClassData();
    } else {
      Alert.alert('Error', 'Class ID is missing');
      router.back();
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
      setInitialLoading(true);
      const classData = await classService.getClass(classId);
      
      // Populate form with class data
      setClassName(classData.title || '');
      setDescription(classData.description || '');
      setSubject(classData.subject || '');
      setGrade(classData.grade || '');
      setSection(classData.section || '');
      setSchedule(classData.schedule || '');
      setMaxStudents((classData.maxStudents || 30).toString());
      setDuration((classData.duration || 60).toString());
      setAcademicYear(classData.academicYear || '2024-2025');
      setStatus(classData.status || 'active');
      setEnrollmentStatus(classData.enrollmentStatus || 'open');
    } catch (error) {
      console.error('Failed to load class data:', error);
      Alert.alert('Error', 'Failed to load class details. Please try again.');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  // Create Airbnb-style Text component
  const AirbnbText = ({ children, style = {}, variant = 'body', color = airbnbColors.dark, ...props }: AirbnbTextProps) => {
    const getTextStyle = () => {
      switch (variant) {
        case 'hero':
          return { fontSize: airbnbTypography.sizes.huge, fontWeight: airbnbTypography.weights.bold };
        case 'title':
          return { fontSize: airbnbTypography.sizes.xxxl, fontWeight: airbnbTypography.weights.semibold };
        case 'subtitle':
          return { fontSize: airbnbTypography.sizes.xl, fontWeight: airbnbTypography.weights.regular };
        case 'body':
          return { fontSize: airbnbTypography.sizes.lg, fontWeight: airbnbTypography.weights.regular };
        case 'caption':
          return { fontSize: airbnbTypography.sizes.md, fontWeight: airbnbTypography.weights.regular };
        case 'small':
          return { fontSize: airbnbTypography.sizes.sm, fontWeight: airbnbTypography.weights.regular };
        default:
          return { fontSize: airbnbTypography.sizes.lg, fontWeight: airbnbTypography.weights.regular };
      }
    };

    return (
      <Animated.Text
        style={[
          {
            color,
            fontFamily: airbnbTypography.fontFamily,
            ...getTextStyle(),
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Animated.Text>
    );
  };

  const validateForm = () => {
    if (!className.trim()) {
      Alert.alert('Error', 'Class name is required');
      return false;
    }
    
    if (!subject.trim()) {
      Alert.alert('Error', 'Subject is required');
      return false;
    }
    
    if (!grade.trim()) {
      Alert.alert('Error', 'Grade is required');
      return false;
    }

    return true;
  };

  const handleUpdateClass = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const updates = {
        title: className.trim(),
        description: description.trim(),
        subject: subject.trim(),
        grade: grade.trim(),
        section: section.trim(),
        academicYear: academicYear,
        maxStudents: parseInt(maxStudents) || 30,
        duration: parseInt(duration) || 60,
        status: status,
        enrollmentStatus: enrollmentStatus,
        schedule: schedule.trim(),
      };

      await classService.updateClass(classId, updates);
      
      Alert.alert(
        'Success', 
        'Class updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Failed to update class:', error);
      Alert.alert('Error', 'Failed to update class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={airbnbColors.dark} />
          </TouchableOpacity>
          <AirbnbText variant="subtitle" style={styles.headerTitle}>Edit Class</AirbnbText>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <AirbnbText style={styles.loadingText}>Loading class details...</AirbnbText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={airbnbColors.dark} />
        </TouchableOpacity>
        <AirbnbText variant="subtitle" style={styles.headerTitle}>Edit Class</AirbnbText>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 }
        ]}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <AirbnbText variant="hero" style={styles.heroTitle}>
              Edit Class
            </AirbnbText>
            <AirbnbText variant="body" color={airbnbColors.mediumGray} style={styles.heroSubtitle}>
              Update class information and settings
            </AirbnbText>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="create" size={32} color={airbnbColors.primary} />
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={airbnbColors.primary} />
            <AirbnbText variant="title" style={styles.sectionTitle}>Basic Information</AirbnbText>
          </View>
          
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <AirbnbText variant="subtitle" style={styles.label}>Class Name *</AirbnbText>
              <TextInput
                style={styles.input}
                value={className}
                onChangeText={setClassName}
                placeholder="e.g. Advanced Mathematics, English Literature"
                placeholderTextColor={airbnbColors.mediumGray}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: airbnbSpacing.sm }]}>
                <AirbnbText variant="subtitle" style={styles.label}>Subject *</AirbnbText>
                <TextInput
                  style={styles.input}
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="e.g. Mathematics, English, Science"
                  placeholderTextColor={airbnbColors.mediumGray}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: airbnbSpacing.sm }]}>
                <AirbnbText variant="subtitle" style={styles.label}>Grade *</AirbnbText>
                <TextInput
                  style={styles.input}
                  value={grade}
                  onChangeText={setGrade}
                  placeholder="e.g. 9, 10, 11, 12"
                  placeholderTextColor={airbnbColors.mediumGray}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: airbnbSpacing.sm }]}>
                <AirbnbText variant="subtitle" style={styles.label}>Section</AirbnbText>
                <TextInput
                  style={styles.input}
                  value={section}
                  onChangeText={setSection}
                  placeholder="e.g. A, B, C (optional)"
                  placeholderTextColor={airbnbColors.mediumGray}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: airbnbSpacing.sm }]}>
                <AirbnbText variant="subtitle" style={styles.label}>Academic Year</AirbnbText>
                <TextInput
                  style={styles.input}
                  value={academicYear}
                  onChangeText={setAcademicYear}
                  placeholder="2024-2025"
                  placeholderTextColor={airbnbColors.mediumGray}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AirbnbText variant="subtitle" style={styles.label}>Description</AirbnbText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter class description"
                placeholderTextColor={airbnbColors.mediumGray}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Schedule & Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color={airbnbColors.primary} />
            <AirbnbText variant="title" style={styles.sectionTitle}>Schedule & Settings</AirbnbText>
          </View>
          
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <AirbnbText variant="subtitle" style={styles.label}>Schedule</AirbnbText>
              <TextInput
                style={styles.input}
                value={schedule}
                onChangeText={setSchedule}
                placeholder="e.g. Mon-Fri 9:00 AM - 10:00 AM"
                placeholderTextColor={airbnbColors.mediumGray}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: airbnbSpacing.sm }]}>
                <AirbnbText variant="subtitle" style={styles.label}>Duration (minutes)</AirbnbText>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="60"
                  placeholderTextColor={airbnbColors.mediumGray}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: airbnbSpacing.sm }]}>
                <AirbnbText variant="subtitle" style={styles.label}>Max Students</AirbnbText>
                <TextInput
                  style={styles.input}
                  value={maxStudents}
                  onChangeText={setMaxStudents}
                  placeholder="30"
                  placeholderTextColor={airbnbColors.mediumGray}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Status Settings */}
            <View style={styles.inputGroup}>
              <AirbnbText variant="subtitle" style={styles.label}>Class Status</AirbnbText>
              <View style={styles.statusOptions}>
                {(['active', 'inactive', 'archived'] as const).map((statusOption) => (
                  <TouchableOpacity
                    key={statusOption}
                    style={[
                      styles.statusOption,
                      status === statusOption && styles.selectedStatusOption
                    ]}
                    onPress={() => setStatus(statusOption)}
                  >
                    <AirbnbText
                      variant="body"
                      color={status === statusOption ? airbnbColors.white : airbnbColors.dark}
                      style={styles.statusText}
                    >
                      {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                    </AirbnbText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AirbnbText variant="subtitle" style={styles.label}>Enrollment Status</AirbnbText>
              <View style={styles.statusOptions}>
                {(['open', 'closed', 'waitlist-only'] as const).map((enrollmentOption) => (
                  <TouchableOpacity
                    key={enrollmentOption}
                    style={[
                      styles.statusOption,
                      enrollmentStatus === enrollmentOption && styles.selectedStatusOption
                    ]}
                    onPress={() => setEnrollmentStatus(enrollmentOption)}
                  >
                    <AirbnbText
                      variant="body"
                      color={enrollmentStatus === enrollmentOption ? airbnbColors.white : airbnbColors.dark}
                      style={styles.statusText}
                    >
                      {enrollmentOption.replace('-', ' ')}
                    </AirbnbText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.back()}
            disabled={loading}
          >
            <AirbnbText variant="body" color={airbnbColors.dark} style={styles.buttonText}>
              Cancel
            </AirbnbText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleUpdateClass}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={airbnbColors.white} />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color={airbnbColors.white} style={styles.buttonIcon} />
                <AirbnbText variant="body" color={airbnbColors.white} style={styles.buttonText}>
                  Update Class
                </AirbnbText>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: airbnbColors.background,
  },
  container: {
    flex: 1,
    backgroundColor: airbnbColors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: airbnbSpacing.md,
    paddingHorizontal: airbnbSpacing.lg,
    backgroundColor: airbnbColors.white,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.border,
  },
  backButton: {
    padding: airbnbSpacing.sm,
    borderRadius: 20,
    backgroundColor: airbnbColors.superLightGray,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: airbnbSpacing.md,
    color: airbnbColors.mediumGray,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: airbnbSpacing.lg,
    marginHorizontal: airbnbSpacing.lg,
    marginTop: airbnbSpacing.md,
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    marginBottom: airbnbSpacing.sm,
  },
  heroSubtitle: {
    lineHeight: 24,
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: airbnbColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: airbnbSpacing.lg,
  },
  section: {
    marginHorizontal: airbnbSpacing.lg,
    marginTop: airbnbSpacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: airbnbSpacing.md,
  },
  sectionTitle: {
    marginLeft: airbnbSpacing.sm,
  },
  formCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: airbnbSpacing.lg,
  },
  inputGroup: {
    marginBottom: airbnbSpacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: airbnbSpacing.sm,
  },
  label: {
    marginBottom: airbnbSpacing.sm,
  },
  input: {
    backgroundColor: airbnbColors.white,
    borderWidth: 1,
    borderColor: airbnbColors.border,
    borderRadius: 12,
    paddingHorizontal: airbnbSpacing.md,
    paddingVertical: airbnbSpacing.md,
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.dark,
  },
  textArea: {
    height: 80,
    paddingTop: airbnbSpacing.md,
    textAlignVertical: 'top',
  },
  statusOptions: {
    flexDirection: 'row',
    gap: airbnbSpacing.sm,
  },
  statusOption: {
    flex: 1,
    paddingVertical: airbnbSpacing.sm,
    paddingHorizontal: airbnbSpacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: airbnbColors.border,
    alignItems: 'center',
  },
  selectedStatusOption: {
    backgroundColor: airbnbColors.primary,
    borderColor: airbnbColors.primary,
  },
  statusText: {
    textAlign: 'center',
  },
  actionsSection: {
    flexDirection: 'row',
    marginHorizontal: airbnbSpacing.lg,
    marginTop: airbnbSpacing.xl,
    marginBottom: airbnbSpacing.md,
    gap: airbnbSpacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: airbnbSpacing.md,
    paddingHorizontal: airbnbSpacing.lg,
    borderRadius: 12,
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: airbnbColors.primary,
  },
  secondaryButton: {
    backgroundColor: airbnbColors.white,
    borderWidth: 1,
    borderColor: airbnbColors.border,
  },
  buttonIcon: {
    marginRight: airbnbSpacing.sm,
  },
  buttonText: {
    fontWeight: airbnbTypography.weights.semibold,
  },
});