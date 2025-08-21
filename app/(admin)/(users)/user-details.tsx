import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../../components/ui/theme';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

// Airbnb color palette
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#FF3347',
  primaryLight: '#FF8589',
  secondary: '#00A699',
  secondaryDark: '#008F85',
  secondaryLight: '#57C1BA',
  neutral: colors.neutral,
  accent: colors.accent,
  status: colors.status
};

interface User {
  $id: string;
  userId: string;
  displayName: string;
  email: string;
  bio?: string;
  isAdmin?: boolean;
  roles?: string[];
  profileImage?: string;
  status?: string;
  phone?: string;
  location?: string;
  joinDate?: string;
  lastActive?: string;
  createdAt?: string;
  lastLoginAt?: string;
  nativeLanguage?: string;
  englishLevel?: string;
  learningGoal?: string;
  dailyGoalMinutes?: number;
}

interface Role {
  $id: string;
  name: string;
}

export default function UserDetailsScreen() {
  const router = useRouter();
  const rawParams = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const initRef = useRef(false);
  
  // Stabilize params using useMemo to prevent infinite re-renders
  const params = useMemo(() => ({
    id: rawParams.id as string,
    displayName: rawParams.displayName as string,
    email: rawParams.email as string,
    status: rawParams.status as string,
    isAdmin: rawParams.isAdmin === 'true',
  }), [rawParams.id]); // Only depend on the ID which should be stable
  
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Editable user fields
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [englishLevel, setEnglishLevel] = useState('beginner');
  const [learningGoal, setLearningGoal] = useState('');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState('15');
  const [isActive, setIsActive] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  
  useEffect(() => {
    // Check if we've already initialized to prevent multiple loads
    if (initRef.current) return;
    
    // Initialize with params
    if (params.id) {
      initRef.current = true; // Mark as initialized
      
      const initialUser = {
        $id: params.id,
        userId: params.id,
        displayName: params.displayName,
        email: params.email,
        status: params.status,
        isAdmin: params.isAdmin,
      };
      
      setUser(initialUser);
      setDisplayName(initialUser.displayName || '');
      setEmail(initialUser.email || '');
      setIsActive(initialUser.status !== 'suspended');
      setIsAdmin(initialUser.isAdmin || false);
      
      // Load full user data for complete information
      loadUserData();
    }
  }, [params.id]); // Only depend on the ID which shouldn't change
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load roles first
      const rolesData = await appwriteService.getAllRoles();
      setRoles(rolesData);
      
      try {
        // Try to load user with userId first
        const userData = await appwriteService.getUserProfile(params.id as string);
        
        if (userData) {
          console.log("Found user document with ID:", userData.$id, "userId:", userData.userId);
          setUser(userData);
          
          // Set form values
          setDisplayName(userData.displayName || '');
          setProfileImage(userData.profileImage || '');
          setNativeLanguage(userData.nativeLanguage || '');
          setEnglishLevel(userData.englishLevel || 'beginner');
          setLearningGoal(userData.learningGoal || '');
          setDailyGoalMinutes(userData.dailyGoalMinutes ? userData.dailyGoalMinutes.toString() : '15');
          setPhone(userData.phone ? userData.phone.toString() : '');
          setLocation(userData.location || '');
          setBio(userData.bio || '');
          setIsActive(userData.status !== 'suspended');
          setIsAdmin(userData.isAdmin || false);
        }
      } catch (error) {
        console.log('Could not find user by ID, using passed parameters', error);
        // If we can't get the user by ID, we'll use the parameters that were passed
        // We already set initial values from params in useEffect
      }
    } catch (error) {
      console.error('Failed to load complete user data:', error);
      // We won't redirect back in this case since we already have basic user info from params
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Prepare updated user data - only include fields that exist in the database collection
      // Handle type conversions and empty values properly
      const updatedData: any = {
        displayName,
        profileImage,
        nativeLanguage,
        englishLevel,
        learningGoal,
        dailyGoalMinutes: parseInt(dailyGoalMinutes, 10) || 15,
        isAdmin,
        lastActive: new Date().toISOString()
      };
      
      // Only include phone if it's not empty and is a valid number
      if (phone && phone.trim() !== '') {
        const phoneNumber = parseInt(phone.replace(/\D/g, ''), 10);
        if (!isNaN(phoneNumber)) {
          updatedData.phone = phoneNumber;
        }
      }
      
      // Only include location if it's not empty
      if (location && location.trim() !== '') {
        updatedData.location = location;
      }
      
      // Only include bio if it's not empty
      if (bio && bio.trim() !== '') {
        updatedData.bio = bio;
      }
      
      try {
        if (!user || !user.$id) {
          console.error("Missing document ID for update");
          Alert.alert('Error', 'User document ID is missing. Cannot update profile.');
          return;
        }
        
        console.log("Updating user with document ID:", user.$id);
        console.log("Update data:", updatedData);
        
        // Use the document ID ($id) for updates, not the userId
        await appwriteService.updateUserProfile(user.$id, updatedData);
        
        // If admin status changed, update roles
        if (isAdmin !== user?.isAdmin) {
          if (isAdmin) {
            // Find admin role ID
            const adminRole = roles.find(role => 
              role.name.toLowerCase().includes('admin')
            );
            
            if (adminRole) {
              await appwriteService.assignRoleToUser(user.userId, adminRole.$id);
            }
          } else {
            // Find admin role ID
            const adminRole = roles.find(role => 
              role.name.toLowerCase().includes('admin')
            );
            
            if (adminRole) {
              await appwriteService.removeRoleFromUser(user.userId, adminRole.$id);
            }
          }
        }
        
        Alert.alert('Success', 'User profile updated successfully');
        setEditMode(false);
        
        // Update local state
        setUser({
          ...user,
          ...updatedData
        });
      } catch (error) {
        console.error('Failed to update user:', error);
        Alert.alert('Error', 'Failed to update user profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };;
  
  const getUserRoleName = (): string => {
    if (user?.isAdmin) return 'Admin';
    
    const userRoles = user?.roles || [];
    if (roles.some(role => 
      userRoles.includes(role.$id) && 
      role.name.toLowerCase().includes('admin')
    )) {
      return 'Admin';
    } else if (roles.some(role => 
      userRoles.includes(role.$id) && 
      role.name.toLowerCase().includes('instructor')
    )) {
      return 'Instructor';
    } else {
      return 'Student';
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleImagePicker = useCallback(async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'We need permission to access your photos to update the profile image.');
        return;
      }
      
      // Launch image picker with compatible options
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images', // Use string instead of ImagePicker.MediaType.Images
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      // Check if user cancelled (updated API)
      if (result.canceled) {
        return;
      }
      
      // Image selected, update profileImage state
      if (result.assets && result.assets[0]) {
        const selectedImageUri = result.assets[0].uri;
        setProfileImage(selectedImageUri);
        
        // Show feedback to user
        Alert.alert('Image Selected', 'Profile image updated. Don\'t forget to save your changes.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  }, []);
  
  if (loading && !user) {
    return (
      <View style={styles.safeArea}>
        <SafeAreaView style={styles.headerContainer}>
          <PreAuthHeader 
            title="User Details"
            onLeftIconPress={() => router.back()}
          />
        </SafeAreaView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <Text style={styles.loadingText}>Loading user details...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.safeArea}>
      <SafeAreaView style={styles.headerContainer}>
        <PreAuthHeader 
          title="User Details"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 80 }
          ]}
        >
          {/* Hero Section with User Profile */}
          <LinearGradient 
            colors={[airbnbColors.primary, airbnbColors.primaryDark]} 
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <View style={styles.userProfileCard}>
                <View style={styles.avatarContainer}>
                  {profileImage ? (
                    <Image 
                      source={{ uri: profileImage }} 
                      style={styles.avatar} 
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                      </Text>
                    </View>
                  )}
                  
                  {editMode && (
                    <TouchableOpacity 
                      style={styles.changeAvatarButton}
                      onPress={handleImagePicker}
                    >
                      <Ionicons name="camera" size={16} color={colors.neutral.white} />
                    </TouchableOpacity>
                  )}
                </View>
                
                <View style={styles.userInfo}>
                  <Text style={styles.heroUserName}>
                    {user?.displayName || 'Unnamed User'}
                  </Text>
                  <Text style={styles.heroUserEmail}>{user?.email}</Text>
                  
                  <View style={styles.heroBadgesContainer}>
                    <View style={[
                      styles.heroStatusBadge,
                      user?.status === 'active' && styles.heroActiveBadge,
                      user?.status === 'suspended' && styles.heroSuspendedBadge,
                    ]}>
                      <Text style={styles.heroStatusText}>
                        {user?.status || 'Active'}
                      </Text>
                    </View>
                    
                    <View style={[
                      styles.heroRoleBadge,
                      getUserRoleName() === 'Admin' && styles.heroAdminRoleBadge,
                      getUserRoleName() === 'Instructor' && styles.heroInstructorRoleBadge,
                      getUserRoleName() === 'Student' && styles.heroStudentRoleBadge,
                    ]}>
                      <Text style={styles.heroRoleText}>
                        {getUserRoleName()}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setEditMode(!editMode)}
                >
                  <Ionicons 
                    name={editMode ? "close" : "create-outline"} 
                    size={20} 
                    color={airbnbColors.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.contentContainer}>
            {/* Basic Information Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Basic Information</Text>
              
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Display Name</Text>
                  {editMode ? (
                    <TextInput
                      style={styles.input}
                      value={displayName}
                      onChangeText={setDisplayName}
                      placeholder="Enter display name"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{user?.displayName || 'Not set'}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="mail-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  {editMode ? (
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{user?.phone || 'Not set'}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  {editMode ? (
                    <TextInput
                      style={styles.input}
                      value={location}
                      onChangeText={setLocation}
                      placeholder="Enter location"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{user?.location || 'Not set'}</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Learning Profile Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Learning Profile</Text>
              
              <View style={styles.infoItem}>
                <Ionicons name="language-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Native Language</Text>
                  {editMode ? (
                    <TextInput
                      style={styles.input}
                      value={nativeLanguage}
                      onChangeText={setNativeLanguage}
                      placeholder="Enter native language"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{user?.nativeLanguage || 'Not set'}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="school-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>English Level</Text>
                  {editMode ? (
                    <TextInput
                      style={styles.input}
                      value={englishLevel}
                      onChangeText={setEnglishLevel}
                      placeholder="Enter English proficiency level"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{user?.englishLevel || 'Beginner'}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="flag-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Learning Goal</Text>
                  {editMode ? (
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={learningGoal}
                      onChangeText={setLearningGoal}
                      placeholder="Enter learning goal"
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{user?.learningGoal || 'Not set'}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Daily Goal</Text>
                  {editMode ? (
                    <TextInput
                      style={styles.input}
                      value={dailyGoalMinutes}
                      onChangeText={setDailyGoalMinutes}
                      placeholder="Daily goal in minutes"
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text style={styles.infoValue}>{user?.dailyGoalMinutes || '15'} minutes</Text>
                  )}
                </View>
              </View>
            </View>

            {/* Account Details Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Account Details</Text>
              
              <View style={styles.infoItem}>
                <Ionicons name="finger-print-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>User ID</Text>
                  <Text style={styles.infoValue}>{user?.userId || user?.$id || 'Not available'}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Account Created</Text>
                  <Text style={styles.infoValue}>{formatDate(user?.createdAt)}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Ionicons name="log-in-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Last Login</Text>
                  <Text style={styles.infoValue}>{formatDate(user?.lastLoginAt)}</Text>
                </View>
              </View>
              
              {editMode && (
                <>
                  <View style={styles.switchItem}>
                    <View style={styles.switchInfo}>
                      <Ionicons name="shield-checkmark-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Account Active</Text>
                        <Text style={styles.switchDescription}>Allow user to access the platform</Text>
                      </View>
                    </View>
                    <Switch
                      value={isActive}
                      onValueChange={setIsActive}
                      trackColor={{ false: '#E2E8F0', true: airbnbColors.primaryLight }}
                      thumbColor={isActive ? airbnbColors.primary : colors.neutral.white}
                    />
                  </View>
                  
                  <View style={styles.switchItem}>
                    <View style={styles.switchInfo}>
                      <Ionicons name="key-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Admin Privileges</Text>
                        <Text style={styles.switchDescription}>Grant admin access to this user</Text>
                      </View>
                    </View>
                    <Switch
                      value={isAdmin}
                      onValueChange={setIsAdmin}
                      trackColor={{ false: '#E2E8F0', true: airbnbColors.primaryLight }}
                      thumbColor={isAdmin ? airbnbColors.primary : colors.neutral.white}
                    />
                  </View>
                </>
              )}
            </View>

            {/* Bio Card */}
            {(user?.bio || editMode) && (
              <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Bio</Text>
                
                <View style={styles.infoItem}>
                  <Ionicons name="document-text-outline" size={20} color={colors.neutral.darkGray} style={styles.infoIcon} />
                  <View style={styles.infoContent}>
                    {editMode ? (
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Enter user bio"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    ) : (
                      <Text style={styles.infoValue}>{user?.bio || 'No bio available'}</Text>
                    )}
                  </View>
                </View>
              </View>
            )}
            
            {/* Action Buttons */}
            {editMode && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditMode(false);
                    // Reset form values
                    setDisplayName(user?.displayName || '');
                    setProfileImage(user?.profileImage || '');
                    setNativeLanguage(user?.nativeLanguage || '');
                    setEnglishLevel(user?.englishLevel || 'beginner');
                    setLearningGoal(user?.learningGoal || '');
                    setDailyGoalMinutes(user?.dailyGoalMinutes ? user.dailyGoalMinutes.toString() : '15');
                    setPhone(user?.phone ? user.phone.toString() : '');
                    setLocation(user?.location || '');
                    setBio(user?.bio || '');
                    setIsActive(user?.status !== 'suspended');
                    setIsAdmin(user?.isAdmin || false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSaveChanges}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.neutral.white} />
                  ) : (
                    <Ionicons name="checkmark-circle" size={20} color={colors.neutral.white} />
                  )}
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Updating...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  headerContainer: {
    backgroundColor: colors.neutral.white,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral.gray,
    marginTop: spacing.md,
  },

  // Hero Section
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  userProfileCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: airbnbColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.white,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: airbnbColors.secondary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  userInfo: {
    flex: 1,
  },
  heroUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.text,
    marginBottom: 4,
  },
  heroUserEmail: {
    fontSize: 14,
    color: colors.neutral.gray,
    marginBottom: 8,
  },
  heroBadgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  heroStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  heroActiveBadge: {
    backgroundColor: airbnbColors.secondary + '20',
  },
  heroSuspendedBadge: {
    backgroundColor: airbnbColors.primary + '20',
  },
  heroStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.darkGray,
    textTransform: 'capitalize',
  },
  heroRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  heroAdminRoleBadge: {
    backgroundColor: airbnbColors.primary + '20',
  },
  heroInstructorRoleBadge: {
    backgroundColor: airbnbColors.secondary + '20',
  },
  heroStudentRoleBadge: {
    backgroundColor: '#F59E0B' + '20',
  },
  heroRoleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.darkGray,
  },
  editButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Content
  contentContainer: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },

  // Info Cards
  infoCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.text,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.neutral.darkGray,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.neutral.text,
    lineHeight: 22,
  },
  input: {
    backgroundColor: colors.neutral.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    fontSize: 16,
    color: colors.neutral.text,
    minHeight: 44,
  },
  textArea: {
    minHeight: 88,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },

  // Switch Items
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: spacing.md,
  },
  switchDescription: {
    fontSize: 12,
    color: colors.neutral.gray,
    marginTop: 2,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.lg,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.darkGray,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: airbnbColors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
    marginLeft: spacing.sm,
  },
});
