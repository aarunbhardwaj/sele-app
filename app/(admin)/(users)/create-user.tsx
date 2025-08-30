import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
import { withErrorHandling } from '../../../lib/errors';
import { showError, showSuccess } from '../../../lib/toast';
import { Role } from '../../../lib/types';
import authService from '../../../services/appwrite/auth-service';

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

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  role: string;
  isAdmin: boolean;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface AirbnbTextProps {
  children: React.ReactNode;
  style?: any;
  variant?: 'hero' | 'title' | 'subtitle' | 'body' | 'caption' | 'small';
  color?: string;
  numberOfLines?: number;
  [key: string]: any;
}

export default function CreateUserScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    role: 'student',
    isAdmin: false,
    experienceLevel: 'beginner',
  });

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

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = withErrorHandling(
    async () => {
      // Mock roles - in real app, fetch from API
      const mockRoles: Role[] = [
        { $id: 'student', name: 'Student', description: 'Standard student access', permissions: ['read'], isSystem: true },
        { $id: 'instructor', name: 'Instructor', description: 'Can create and manage courses', permissions: ['read', 'write'], isSystem: true },
        { $id: 'admin', name: 'Administrator', description: 'Full system access', permissions: ['read', 'write', 'delete', 'admin'], isSystem: true },
      ];
      setRoles(mockRoles);
    },
    'CreateUser.loadRoles'
  );

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate display name from first and last name
    if (field === 'firstName' || field === 'lastName') {
      const firstName = field === 'firstName' ? value as string : formData.firstName;
      const lastName = field === 'lastName' ? value as string : formData.lastName;
      if (firstName && lastName) {
        setFormData(prev => ({ ...prev, displayName: `${firstName} ${lastName}` }));
      }
    }
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      showError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      showError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      showError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      showError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 8) {
      showError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleCreateUser = withErrorHandling(
    async () => {
      if (!validateForm()) return;

      setLoading(true);
      
      try {
        // Create the user account
        const newUser = await authService.createAccount(
          formData.email,
          formData.password,
          formData.displayName || `${formData.firstName} ${formData.lastName}`
        );

        if (newUser) {
          // Create user profile with additional information
          await authService.createUserProfile(newUser.$id, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            displayName: formData.displayName || `${formData.firstName} ${formData.lastName}`,
            experienceLevel: formData.experienceLevel,
            isAdmin: formData.isAdmin,
            role: formData.role,
          });

          showSuccess('User created successfully!');
          router.back();
        }
      } catch (error: any) {
        console.error('Failed to create user:', error);
        showError(error.message || 'Failed to create user');
      } finally {
        setLoading(false);
      }
    },
    'CreateUser.handleCreateUser'
  );

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
        <AirbnbText variant="subtitle" style={styles.headerTitle}>Create User</AirbnbText>
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
              Create New User
            </AirbnbText>
            <AirbnbText variant="body" color={airbnbColors.mediumGray} style={styles.heroSubtitle}>
              Add a new user to your platform with role and permissions
            </AirbnbText>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="person-add" size={32} color={airbnbColors.primary} />
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={airbnbColors.primary} />
            <AirbnbText variant="title" style={styles.sectionTitle}>Personal Information</AirbnbText>
          </View>
          
          <View style={styles.formCard}>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: airbnbSpacing.sm }]}>
                <AirbnbText variant="subtitle" style={styles.label}>First Name *</AirbnbText>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange('firstName', text)}
                  placeholder="Enter first name"
                  placeholderTextColor={airbnbColors.mediumGray}
                  autoCapitalize="words"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: airbnbSpacing.sm }]}>
                <AirbnbText variant="subtitle" style={styles.label}>Last Name *</AirbnbText>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange('lastName', text)}
                  placeholder="Enter last name"
                  placeholderTextColor={airbnbColors.mediumGray}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AirbnbText variant="subtitle" style={styles.label}>Display Name</AirbnbText>
              <TextInput
                style={styles.input}
                value={formData.displayName}
                onChangeText={(text) => handleInputChange('displayName', text)}
                placeholder="Auto-generated from name"
                placeholderTextColor={airbnbColors.mediumGray}
              />
              <AirbnbText variant="small" color={airbnbColors.mediumGray} style={styles.helperText}>
                This name will be visible to other users
              </AirbnbText>
            </View>

            <View style={styles.inputGroup}>
              <AirbnbText variant="subtitle" style={styles.label}>Email Address *</AirbnbText>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="Enter email address"
                placeholderTextColor={airbnbColors.mediumGray}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={20} color={airbnbColors.primary} />
            <AirbnbText variant="title" style={styles.sectionTitle}>Password</AirbnbText>
          </View>
          
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <AirbnbText variant="subtitle" style={styles.label}>Password *</AirbnbText>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                placeholder="Enter password (min 8 characters)"
                placeholderTextColor={airbnbColors.mediumGray}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <AirbnbText variant="subtitle" style={styles.label}>Confirm Password *</AirbnbText>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                placeholder="Confirm password"
                placeholderTextColor={airbnbColors.mediumGray}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        {/* Role & Permissions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={airbnbColors.primary} />
            <AirbnbText variant="title" style={styles.sectionTitle}>Role & Permissions</AirbnbText>
          </View>
          
          <View style={styles.formCard}>
            <View style={styles.roleSelection}>
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.$id}
                  style={[
                    styles.roleOption,
                    formData.role === role.$id && styles.roleOptionActive
                  ]}
                  onPress={() => {
                    handleInputChange('role', role.$id);
                    handleInputChange('isAdmin', role.name === 'Administrator');
                  }}
                >
                  <View style={styles.roleContent}>
                    <AirbnbText variant="subtitle" style={[
                      styles.roleName,
                      formData.role === role.$id && styles.roleNameActive
                    ]}>
                      {role.name}
                    </AirbnbText>
                    <AirbnbText variant="body" style={[
                      styles.roleDescription,
                      formData.role === role.$id && styles.roleDescriptionActive
                    ]}>
                      {role.description}
                    </AirbnbText>
                  </View>
                  <View style={[
                    styles.radioButton,
                    formData.role === role.$id && styles.radioButtonActive
                  ]}>
                    {formData.role === role.$id && (
                      <Ionicons name="checkmark" size={16} color={airbnbColors.white} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputGroup}>
              <AirbnbText variant="subtitle" style={styles.label}>Experience Level</AirbnbText>
              <View style={styles.segmentedControl}>
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.segmentButton,
                      formData.experienceLevel === level && styles.segmentButtonActive
                    ]}
                    onPress={() => handleInputChange('experienceLevel', level)}
                  >
                    <AirbnbText 
                      variant="caption" 
                      style={[
                        styles.segmentText,
                        formData.experienceLevel === level && styles.segmentTextActive
                      ]}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
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
            onPress={handleCreateUser}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={airbnbColors.white} />
            ) : (
              <>
                <Ionicons name="person-add" size={20} color={airbnbColors.white} style={styles.buttonIcon} />
                <AirbnbText variant="body" color={airbnbColors.white} style={styles.buttonText}>
                  Create User
                </AirbnbText>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <AirbnbText variant="small" color={airbnbColors.mediumGray} style={styles.footerText}>
            New users will receive an email with their login credentials and setup instructions.
          </AirbnbText>
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
  helperText: {
    marginTop: airbnbSpacing.xs,
    fontSize: airbnbTypography.sizes.sm,
    color: airbnbColors.mediumGray,
  },
  roleSelection: {
    marginBottom: airbnbSpacing.lg,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: airbnbSpacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: airbnbColors.border,
    backgroundColor: airbnbColors.white,
    marginBottom: airbnbSpacing.sm,
  },
  roleOptionActive: {
    borderColor: airbnbColors.primary,
    backgroundColor: airbnbColors.primary + '10',
  },
  roleContent: {
    flex: 1,
  },
  roleName: {
    fontSize: airbnbTypography.sizes.lg,
    fontWeight: airbnbTypography.weights.semibold,
    color: airbnbColors.dark,
    marginBottom: airbnbSpacing.xs,
  },
  roleNameActive: {
    color: airbnbColors.primary,
  },
  roleDescription: {
    fontSize: airbnbTypography.sizes.md,
    color: airbnbColors.mediumGray,
    lineHeight: 20,
  },
  roleDescriptionActive: {
    color: airbnbColors.dark,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: airbnbColors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: airbnbColors.white,
  },
  radioButtonActive: {
    borderColor: airbnbColors.primary,
    backgroundColor: airbnbColors.primary,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: airbnbColors.superLightGray,
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: airbnbSpacing.sm,
    paddingHorizontal: airbnbSpacing.md,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: airbnbColors.primary,
  },
  segmentText: {
    fontSize: airbnbTypography.sizes.md,
    fontWeight: airbnbTypography.weights.medium,
    color: airbnbColors.mediumGray,
  },
  segmentTextActive: {
    color: airbnbColors.white,
  },
  actionsSection: {
    flexDirection: 'row',
    marginHorizontal: airbnbSpacing.lg,
    marginTop: airbnbSpacing.xl,
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
  footer: {
    marginHorizontal: airbnbSpacing.lg,
    marginTop: airbnbSpacing.lg,
    marginBottom: airbnbSpacing.md,
    alignItems: 'center',
  },
  footerText: {
    fontSize: airbnbTypography.sizes.sm,
    color: airbnbColors.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});