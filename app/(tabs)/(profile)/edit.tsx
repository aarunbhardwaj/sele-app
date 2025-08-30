import React, { useState, useEffect } from 'react';
import { ScrollView, View, TextInput, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Card from '../../../components/ui/Card';
import Text from '../../../components/ui/Typography';
import { useAuth } from '../../../services/AuthContext';
import authService from '../../../services/appwrite/auth-service';
import { UserProfile } from '../../../lib/types';
import { showSuccess, showError } from '../../../lib/toast';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
    languagePreference: 'en',
    experienceLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userProfile = await authService.getUserProfile(user.$id);
      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          displayName: userProfile.displayName || user.name || '',
          bio: userProfile.bio || '',
          languagePreference: userProfile.languagePreference || 'en',
          experienceLevel: userProfile.experienceLevel || 'beginner',
        });
        setProfileImage(userProfile.profilePicture || null);
      }
    } catch (error) {
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your photo library to update your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      showError('Failed to select image');
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.displayName.trim()) {
        showError('Display name is required');
        return;
      }

      const updateData = {
        ...formData,
        profilePicture: profileImage,
        // Keep the existing fields that aren't being edited
        lastActive: new Date().toISOString(),
      };

      await authService.updateUserProfile(profile.$id, updateData);
      showSuccess('Profile updated successfully');
      router.back();
    } catch (error) {
      showError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body1">Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text variant="h1" style={styles.title}>Edit Profile</Text>
        <Text variant="body2" style={styles.subtitle}>
          Update your personal information and preferences
        </Text>
      </View>

      <Card variant="elevated" style={styles.section}>
        {/* Profile Picture */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageContainer} onPress={selectImage}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={48} color="#6c757d" />
              </View>
            )}
            <View style={styles.imageOverlay}>
              <Ionicons name="camera" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <Text variant="body2" style={styles.imageHint}>
            Tap to change profile picture
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text variant="h6" style={styles.label}>Display Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.displayName}
              onChangeText={(text) => handleInputChange('displayName', text)}
              placeholder="Enter your display name"
              maxLength={50}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text variant="h6" style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => handleInputChange('firstName', text)}
                placeholder="First name"
                maxLength={30}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text variant="h6" style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => handleInputChange('lastName', text)}
                placeholder="Last name"
                maxLength={30}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text variant="h6" style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text variant="caption" style={styles.charCount}>
              {formData.bio.length}/500 characters
            </Text>
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

          <View style={styles.inputGroup}>
            <Text variant="h6" style={styles.label}>Language Preference</Text>
            <View style={styles.languageGrid}>
              {[
                { code: 'en', name: 'English', flag: '🇺🇸' },
                { code: 'es', name: 'Español', flag: '🇪🇸' },
                { code: 'fr', name: 'Français', flag: '🇫🇷' },
                { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
                { code: 'it', name: 'Italiano', flag: '🇮🇹' },
                { code: 'pt', name: 'Português', flag: '🇵🇹' },
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageButton,
                    formData.languagePreference === lang.code && styles.languageButtonActive
                  ]}
                  onPress={() => handleInputChange('languagePreference', lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text 
                    variant="caption" 
                    style={[
                      styles.languageText,
                      formData.languagePreference === lang.code && styles.languageTextActive
                    ]}
                  >
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Card>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Text variant="h6" style={styles.saveButtonText}>Saving...</Text>
          ) : (
            <>
              <Text variant="h6" style={styles.saveButtonText}>Save Changes</Text>
              <Ionicons name="checkmark" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text variant="caption" style={styles.footerText}>
          Your information is secure and will only be used to improve your learning experience.
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  section: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  imageHint: {
    color: '#6c757d',
    textAlign: 'center',
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 4,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    color: '#6c757d',
    marginTop: 4,
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
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ced4da',
    backgroundColor: 'white',
    minWidth: 100,
  },
  languageButtonActive: {
    borderColor: '#007bff',
    backgroundColor: '#e3f2fd',
  },
  languageFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  languageText: {
    color: '#6c757d',
    fontSize: 12,
  },
  languageTextActive: {
    color: '#007bff',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
  },
  saveButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
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