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
import appwriteService from '../../../services/appwrite';

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

export default function CreateClassScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const schoolId = params.schoolId as string;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  
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
  const [isActive, setIsActive] = useState(true);

  // Check if we have a schoolId parameter
  useEffect(() => {
    if (!schoolId) {
      Alert.alert(
        'Missing School Information',
        'A school must be selected to create a class. Please select a school first.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }
  }, [schoolId, router]);

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

  const generateClassCode = () => {
    const subjectPrefix = subject.substring(0, 3).toUpperCase();
    const gradePrefix = grade.replace(/\s+/g, '');
    const sectionSuffix = section ? `-${section}` : '';
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${subjectPrefix}${gradePrefix}${sectionSuffix}-${randomSuffix}`;
  };

  const handleCreateClass = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const classCode = generateClassCode();
      
      const classData = {
        title: className.trim(),
        description: description.trim() || `${subject} class for Grade ${grade}`,
        code: classCode,
        schoolId: schoolId,
        courseId: '', // Will be auto-assigned later
        subject: subject.trim(),
        grade: grade.trim(),
        section: section.trim() || '',
        academicYear: academicYear,
        maxStudents: parseInt(maxStudents) || 30,
        duration: parseInt(duration) || 60,
        status: 'active' as const,
        enrollmentStatus: 'open' as const,
        type: 'in-person' as const,
        isActive: isActive,
        isPublic: true,
        allowWaitlist: true,
        currentEnrollment: 0,
        enrolledStudents: [],
        waitingList: [],
        schedule: schedule.trim() || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const createdClass = await appwriteService.createClass(classData);
      
      Alert.alert(
        'Success', 
        `Class "${className}" has been created successfully with code: ${classCode}`,
        [
          {
            text: 'View Class',
            onPress: () => router.replace(`/(admin)/(classes)/class-details?id=${createdClass.$id}`)
          },
          {
            text: 'Create Another',
            onPress: () => {
              // Reset form
              setClassName('');
              setDescription('');
              setSubject('');
              setGrade('');
              setSection('');
              setSchedule('');
              setMaxStudents('30');
              setDuration('60');
            }
          },
          {
            text: 'Go Back',
            style: 'cancel',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Failed to create class:', error);
      Alert.alert('Error', 'Failed to create class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        <AirbnbText variant="subtitle" style={styles.headerTitle}>Create Class</AirbnbText>
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
              Create New Class
            </AirbnbText>
            <AirbnbText variant="body" color={airbnbColors.mediumGray} style={styles.heroSubtitle}>
              Set up a new class for your students with schedule and details
            </AirbnbText>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="school" size={32} color={airbnbColors.primary} />
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
                placeholder="Enter class description (optional)"
                placeholderTextColor={airbnbColors.mediumGray}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <AirbnbText variant="small" color={airbnbColors.mediumGray} style={styles.helperText}>
                Describe what students will learn in this class
              </AirbnbText>
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
              <AirbnbText variant="small" color={airbnbColors.mediumGray} style={styles.helperText}>
                When will this class meet? (Optional - can be set later)
              </AirbnbText>
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
          </View>
        </View>

        {/* Preview Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye" size={20} color={airbnbColors.secondary} />
            <AirbnbText variant="title" style={styles.sectionTitle}>Preview</AirbnbText>
          </View>
          
          <View style={styles.previewCard}>
            <AirbnbText variant="subtitle" style={styles.previewTitle}>
              {className || 'Class Name'} {section && `(Section ${section})`}
            </AirbnbText>
            <AirbnbText variant="small" color={airbnbColors.mediumGray} style={styles.previewCode}>
              Code: {subject && grade ? generateClassCode() : 'Will be generated'}
            </AirbnbText>
            <AirbnbText variant="body" color={airbnbColors.mediumGray} style={styles.previewDescription}>
              {description || `${subject || 'Subject'} class for Grade ${grade || 'X'}`}
            </AirbnbText>
            <View style={styles.previewMeta}>
              <AirbnbText variant="small" color={airbnbColors.mediumGray}>
                Subject: {subject || 'Not specified'} • Grade: {grade || 'Not specified'} • Max Students: {maxStudents}
              </AirbnbText>
            </View>
          </View>
        </View>

        {/* Coming Soon Features */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="construct" size={20} color={airbnbColors.warning} />
            <AirbnbText variant="title" style={styles.sectionTitle}>Coming Soon</AirbnbText>
          </View>
          
          <View style={styles.comingSoonCard}>
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <Ionicons name="calendar" size={16} color={airbnbColors.mediumGray} />
                <AirbnbText variant="body" color={airbnbColors.mediumGray} style={styles.featureText}>
                  Advanced scheduling with recurring events
                </AirbnbText>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="people" size={16} color={airbnbColors.mediumGray} />
                <AirbnbText variant="body" color={airbnbColors.mediumGray} style={styles.featureText}>
                  Student enrollment management
                </AirbnbText>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="videocam" size={16} color={airbnbColors.mediumGray} />
                <AirbnbText variant="body" color={airbnbColors.mediumGray} style={styles.featureText}>
                  Virtual classroom integration
                </AirbnbText>
              </View>
              
              <View style={styles.featureItem}>
                <Ionicons name="analytics" size={16} color={airbnbColors.mediumGray} />
                <AirbnbText variant="body" color={airbnbColors.mediumGray} style={styles.featureText}>
                  Attendance tracking and reports
                </AirbnbText>
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
            onPress={handleCreateClass}
            disabled={loading || !schoolId}
          >
            {loading ? (
              <ActivityIndicator size="small" color={airbnbColors.white} />
            ) : (
              <>
                <Ionicons name="add" size={20} color={airbnbColors.white} style={styles.buttonIcon} />
                <AirbnbText variant="body" color={airbnbColors.white} style={styles.buttonText}>
                  Create Class
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
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: airbnbSpacing.sm,
    borderRadius: 20,
    backgroundColor: airbnbColors.superLightGray,
  },
  headerTitle: {
    fontSize: airbnbTypography.sizes.xl,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40,
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
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: airbnbTypography.sizes.huge,
    fontWeight: airbnbTypography.weights.bold,
    color: airbnbColors.dark,
    marginBottom: airbnbSpacing.sm,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: airbnbTypography.sizes.lg,
    color: airbnbColors.mediumGray,
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
    fontSize: airbnbTypography.sizes.xl,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    marginLeft: airbnbSpacing.sm,
  },
  formCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: airbnbSpacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  comingSoonCard: {
    backgroundColor: airbnbColors.superLightGray,
    borderRadius: 16,
    padding: airbnbSpacing.lg,
    borderWidth: 1,
    borderColor: airbnbColors.border,
  },
  inputGroup: {
    marginBottom: airbnbSpacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: airbnbSpacing.sm,
  },
  label: {
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
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
    fontFamily: airbnbTypography.fontFamily,
  },
  textArea: {
    height: 100,
    paddingTop: airbnbSpacing.md,
    textAlignVertical: 'top',
  },
  helperText: {
    marginTop: airbnbSpacing.xs,
    fontSize: airbnbTypography.sizes.sm,
    color: airbnbColors.mediumGray,
  },
  featureList: {
    gap: airbnbSpacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    marginLeft: airbnbSpacing.sm,
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.mediumGray,
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
    ...Platform.select({
      ios: {
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
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
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.semibold,
  },
  // Preview Card
  previewCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: airbnbSpacing.lg,
    borderWidth: 1,
    borderColor: airbnbColors.secondary + '30',
    backgroundColor: airbnbColors.secondary + '05',
  },
  previewTitle: {
    fontSize: airbnbTypography.sizes.xl,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    marginBottom: 4,
  },
  previewCode: {
    fontSize: airbnbTypography.sizes.sm,
    fontFamily: 'monospace',
    color: airbnbColors.secondary,
    marginBottom: airbnbSpacing.sm,
  },
  previewDescription: {
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.mediumGray,
    marginBottom: airbnbSpacing.sm,
    lineHeight: 20,
  },
  previewMeta: {
    paddingTop: airbnbSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.border,
  },
});