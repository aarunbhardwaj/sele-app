import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';
import { useAuth } from '../../../services/AuthContext';

// Consistent Airbnb-inspired color palette (matching main app)
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
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
};

interface InstructorProfile {
  $id?: string;
  userId: string;
  displayName: string;
  email: string;
  profileImage?: string;
  bio?: string;
  specialization?: string;
  experience?: string;
  qualifications?: string;
  phone?: string;
  location?: string;
  isInstructor: boolean;
  joinedDate?: string;
  lastActive?: string;
}

export default function InstructorProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    specialization: '',
    experience: '',
    qualifications: '',
    phone: '',
    location: '',
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userProfile = await appwriteService.getUserProfile(user.$id);
      
      if (userProfile) {
        const instructorProfile: InstructorProfile = {
          $id: userProfile.$id,
          userId: userProfile.userId || user.$id,
          displayName: userProfile.displayName || user.name || '',
          email: user.email || '',
          profileImage: userProfile.profileImage,
          bio: userProfile.bio,
          specialization: userProfile.specialization || 'General English',
          experience: userProfile.experience || 'Not specified',
          qualifications: userProfile.qualifications || '',
          phone: userProfile.phone,
          location: userProfile.location,
          isInstructor: true,
          joinedDate: userProfile.joinedDate,
          lastActive: userProfile.lastActive,
        };

        setProfile(instructorProfile);
        setFormData({
          displayName: instructorProfile.displayName,
          bio: instructorProfile.bio || '',
          specialization: instructorProfile.specialization || 'General English',
          experience: instructorProfile.experience || 'Not specified',
          qualifications: instructorProfile.qualifications || '',
          phone: instructorProfile.phone || '',
          location: instructorProfile.location || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !user) return;

    try {
      setSaving(true);

      const updateData = {
        displayName: formData.displayName,
        bio: formData.bio,
        specialization: formData.specialization,
        experience: formData.experience,
        qualifications: formData.qualifications,
        phone: formData.phone,
        location: formData.location,
        lastActive: new Date().toISOString(),
      };

      await appwriteService.updateUserProfile(profile.$id || profile.userId, updateData);
      
      // Update local state
      setProfile({ ...profile, ...updateData });
      setEditMode(false);
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        bio: profile.bio || '',
        specialization: profile.specialization || 'General English',
        experience: profile.experience || 'Not specified',
        qualifications: profile.qualifications || '',
        phone: profile.phone || '',
        location: profile.location || '',
      });
    }
    setEditMode(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={airbnbColors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title="Instructor Profile"
        showLogout={true}
        onLogoutPress={handleLogout}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(600)}
          style={styles.profileHeader}
        >
          <View style={styles.profileImageContainer}>
            {profile.profileImage ? (
              <Image 
                source={{ uri: profile.profileImage }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileImageText}>
                  {profile.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.instructorBadge}>
              <Ionicons name="school" size={16} color={airbnbColors.white} />
              <Text style={styles.badgeText}>Instructor</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.displayName}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <Text style={styles.profileRole}>
              {profile.specialization} • {profile.experience}
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.editButton, editMode && styles.editButtonActive]}
            onPress={() => setEditMode(!editMode)}
          >
            <Ionicons 
              name={editMode ? "close" : "create"} 
              size={20} 
              color={editMode ? airbnbColors.error : airbnbColors.primary} 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.statsContainer}
        >
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </Animated.View>

        {/* Profile Details */}
        <Animated.View 
          entering={FadeInUp.delay(300).duration(600)}
          style={styles.detailsContainer}
        >
          <Text style={styles.sectionTitle}>Professional Information</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Display Name</Text>
              {editMode ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.displayName}
                  onChangeText={(text) => setFormData({ ...formData, displayName: text })}
                  placeholder="Enter your display name"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.displayName}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Bio</Text>
              {editMode ? (
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.bio}
                  onChangeText={(text) => setFormData({ ...formData, bio: text })}
                  placeholder="Tell us about yourself..."
                  multiline
                  numberOfLines={3}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.bio || 'No bio available'}
                </Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Specialization</Text>
              {editMode ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.specialization}
                  onChangeText={(text) => setFormData({ ...formData, specialization: text })}
                  placeholder="e.g., Business English, IELTS Preparation"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.specialization}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Experience</Text>
              {editMode ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.experience}
                  onChangeText={(text) => setFormData({ ...formData, experience: text })}
                  placeholder="e.g., 5+ years teaching experience"
                />
              ) : (
                <Text style={styles.fieldValue}>{profile.experience}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Qualifications</Text>
              {editMode ? (
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={formData.qualifications}
                  onChangeText={(text) => setFormData({ ...formData, qualifications: text })}
                  placeholder="e.g., TESOL Certificate, Master's in Education"
                  multiline
                  numberOfLines={2}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.qualifications || 'No qualifications listed'}
                </Text>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Contact Information */}
        <Animated.View 
          entering={FadeInUp.delay(400).duration(600)}
          style={styles.detailsContainer}
        >
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone</Text>
              {editMode ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.phone || 'Not provided'}
                </Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Location</Text>
              {editMode ? (
                <TextInput
                  style={styles.textInput}
                  value={formData.location}
                  onChangeText={(text) => setFormData({ ...formData, location: text })}
                  placeholder="Enter your location"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {profile.location || 'Not provided'}
                </Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Member Since</Text>
              <Text style={styles.fieldValue}>
                {formatDate(profile.joinedDate)}
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Last Active</Text>
              <Text style={styles.fieldValue}>
                {formatDate(profile.lastActive)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        {editMode && (
          <Animated.View 
            entering={FadeInUp.delay(500).duration(600)}
            style={styles.actionButtons}
          >
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={airbnbColors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: airbnbColors.offWhite,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: airbnbColors.darkGray,
  },
  errorText: {
    fontSize: 16,
    color: airbnbColors.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: airbnbColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: airbnbColors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  // Profile Header
  profileHeader: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: airbnbColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    fontSize: 32,
    fontWeight: '700',
    color: airbnbColors.primary,
  },
  instructorBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: airbnbColors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: airbnbColors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    marginBottom: 6,
  },
  profileRole: {
    fontSize: 12,
    color: airbnbColors.primary,
    fontWeight: '600',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: airbnbColors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonActive: {
    backgroundColor: airbnbColors.error + '15',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: airbnbColors.darkGray,
    fontWeight: '500',
  },

  // Details
  detailsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    color: airbnbColors.darkGray,
    lineHeight: 22,
  },
  textInput: {
    borderWidth: 1,
    borderColor: airbnbColors.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: airbnbColors.charcoal,
    backgroundColor: airbnbColors.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.darkGray,
  },
  saveButton: {
    flex: 1,
    backgroundColor: airbnbColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.white,
  },
});