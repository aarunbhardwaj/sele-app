import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  
  // Class form state
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [schedule, setSchedule] = useState('');
  const [maxStudents, setMaxStudents] = useState('30');
  const [duration, setDuration] = useState('60');
  const [isActive, setIsActive] = useState(true);

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

  const handleCreateClass = async () => {
    if (!className.trim()) {
      Alert.alert('Error', 'Class name is required');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success', 
        'Class created successfully!',
        [
          {
            text: 'OK',
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
                placeholder="Enter class name"
                placeholderTextColor={airbnbColors.mediumGray}
              />
            </View>

            <View style={styles.inputGroup}>
              <AirbnbText variant="subtitle" style={styles.label}>Subject</AirbnbText>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="e.g. English, Mathematics, Science"
                placeholderTextColor={airbnbColors.mediumGray}
              />
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
                numberOfLines={4}
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
                When will this class meet?
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
            disabled={loading}
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
});