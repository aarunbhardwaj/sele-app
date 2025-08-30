import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Text from '../../../components/ui/Typography';
import Card from '../../../components/ui/Card';
import authService from '../../../services/appwrite/auth-service';
import { UserProfile, Role } from '../../../lib/types';
import { showSuccess, showError } from '../../../lib/toast';
import { withErrorHandling } from '../../../lib/errors';

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

export default function CreateUserScreen() {
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text variant="h1" style={styles.title}>Create New User</Text>
        <Text variant="body2" style={styles.subtitle}>
          Add a new user to the system with role and permissions
        </Text>
      </View>

      <Card variant="elevated" style={styles.formCard}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text variant="h4" style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text variant="h6" style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                placeholder="Enter first name"
                autoCapitalize="words"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text variant="h6" style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                placeholder="Enter last name"
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text variant="h6" style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={formData.displayName}
              onChangeText={(text) => handleInputChange('displayName', text)}
              placeholder="Auto-generated from name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text variant="h6" style={styles.label}>Email Address *</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Password Section */}
        <View style={styles.section}>
          <Text variant="h4" style={styles.sectionTitle}>Password</Text>
          
          <View style={styles.inputGroup}>
            <Text variant="h6" style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              placeholder="Enter password (min 8 characters)"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text variant="h6" style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              placeholder="Confirm password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Role & Permissions */}
        <View style={styles.section}>
          <Text variant="h4" style={styles.sectionTitle}>Role & Permissions</Text>
          
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
                  <Text variant="h5" style={[
                    styles.roleName,
                    formData.role === role.$id && styles.roleNameActive
                  ]}>
                    {role.name}
                  </Text>
                  <Text variant="body2" style={[
                    styles.roleDescription,
                    formData.role === role.$id && styles.roleDescriptionActive
                  ]}>
                    {role.description}
                  </Text>
                </View>
                <View style={[
                  styles.radioButton,
                  formData.role === role.$id && styles.radioButtonActive
                ]}>
                  {formData.role === role.$id && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text variant="h6" style={styles.label}>Experience Level</Text>
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
                  <Text 
                    variant="body2" 
                    style={[
                      styles.segmentText,
                      formData.experienceLevel === level && styles.segmentTextActive
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.back()}
        >
          <Text variant="h6" style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateUser}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text variant="h6" style={styles.createButtonText}>Creating...</Text>
            </>
          ) : (
            <>
              <Text variant="h6" style={styles.createButtonText}>Create User</Text>
              <Ionicons name="person-add" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text variant="caption" style={styles.footerText}>
          New users will receive an email with their login credentials and setup instructions.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6c757d',
    lineHeight: 20,
  },
  formCard: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#212529',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#495057',
  },
  roleSelection: {
    gap: 12,
    marginBottom: 20,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    backgroundColor: 'white',
  },
  roleOptionActive: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  roleContent: {
    flex: 1,
  },
  roleName: {
    color: '#495057',
    marginBottom: 4,
  },
  roleNameActive: {
    color: '#007bff',
  },
  roleDescription: {
    color: '#6c757d',
    lineHeight: 18,
  },
  roleDescriptionActive: {
    color: '#495057',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ced4da',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  radioButtonActive: {
    borderColor: '#007bff',
    backgroundColor: '#007bff',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#007bff',
  },
  segmentText: {
    color: '#6c757d',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  createButton: {
    flex: 2,
    backgroundColor: '#28a745',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
    alignItems: 'center',
  },
  footerText: {
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 18,
  },
});