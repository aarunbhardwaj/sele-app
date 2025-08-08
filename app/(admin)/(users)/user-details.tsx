import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import Button from '../../../components/ui/Button';
import { borderRadius, colors, spacing, typography } from '../../../components/ui/theme';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

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
}

interface Role {
  $id: string;
  name: string;
}

export default function UserDetailsScreen() {
  const router = useRouter();
  const rawParams = useLocalSearchParams();
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
      const updatedData = {
        displayName,
        profileImage,
        nativeLanguage,
        englishLevel,
        learningGoal,
        dailyGoalMinutes: parseInt(dailyGoalMinutes, 10) || 15,
        // Don't include status as it's not in the Appwrite schema
        // Store active/inactive status in a different way or add it to schema first
        isAdmin,
        phone,
        location,
        bio,
        lastActive: new Date().toISOString() // Update the last active timestamp
      };
      
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
  
  if (loading && !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="User Profile"
          leftComponent={
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.neutral.text} />
            </TouchableOpacity>
          }
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading user profile...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <PreAuthHeader 
          title="User Details"
          leftComponent={
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.neutral.text} />
            </TouchableOpacity>
          }
          rightComponent={
            <View style={styles.headerRightContainer}>
              <TouchableOpacity 
                onPress={() => {/* Handle notifications */}}
                style={styles.headerButton}
              >
                <Ionicons 
                  name="notifications-outline" 
                  size={22} 
                  color={colors.neutral.text} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setEditMode(!editMode)}
                style={styles.headerButton}
              >
                <Ionicons 
                  name={editMode ? "close" : "pencil"} 
                  size={20} 
                  color={editMode ? colors.status.error : colors.primary.main} 
                />
              </TouchableOpacity>
            </View>
          }
        />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user?.profileImage ? (
                <Image 
                  source={{ uri: user.profileImage }} 
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
                <TouchableOpacity style={styles.changeAvatarButton}>
                  <Ionicons name="camera" size={18} color={colors.neutral.white} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.userMeta}>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusBadge,
                  user?.status === 'active' && styles.activeBadge,
                  user?.status === 'suspended' && styles.suspendedBadge,
                ]}>
                  <Text style={styles.statusText}>
                    {user?.status || 'Active'}
                  </Text>
                </View>
                
                <View style={[
                  styles.roleBadge,
                  getUserRoleName() === 'Admin' && styles.adminRoleBadge,
                  getUserRoleName() === 'Instructor' && styles.instructorRoleBadge,
                  getUserRoleName() === 'Student' && styles.studentRoleBadge,
                ]}>
                  <Text style={[
                    styles.roleText,
                    getUserRoleName() === 'Admin' && styles.adminRoleText,
                    getUserRoleName() === 'Instructor' && styles.instructorRoleText,
                    getUserRoleName() === 'Student' && styles.studentRoleText,
                  ]}>
                    {getUserRoleName()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.userName}>
                {user?.displayName || 'Unnamed User'}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Display Name</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter display name"
                />
              ) : (
                <Text style={styles.value}>{user?.displayName || 'Not set'}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Native Language</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={nativeLanguage}
                  onChangeText={setNativeLanguage}
                  placeholder="Enter native language"
                />
              ) : (
                <Text style={styles.value}>{user?.nativeLanguage || 'Not set'}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>English Level</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={englishLevel}
                  onChangeText={setEnglishLevel}
                  placeholder="Enter English proficiency level"
                />
              ) : (
                <Text style={styles.value}>{user?.englishLevel || 'Beginner'}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Learning Goal</Text>
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
                <Text style={styles.value}>{user?.learningGoal || 'Not set'}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Daily Goal (Minutes)</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={dailyGoalMinutes}
                  onChangeText={setDailyGoalMinutes}
                  placeholder="Enter daily goal in minutes"
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.value}>{user?.dailyGoalMinutes || '15'} minutes</Text>
              )}
            </View>
          </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.value}>{user?.phone || 'Not set'}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              {editMode ? (
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Enter location"
                />
              ) : (
                <Text style={styles.value}>{user?.location || 'Not set'}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bio</Text>
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
                <Text style={styles.value}>{user?.bio || 'No bio available'}</Text>
              )}
            </View>
          
          
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>User ID</Text>
              <Text style={styles.value}>{user?.userId || user?.$id || 'Not available'}</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Account Created</Text>
              <Text style={styles.value}>{formatDate(user?.createdAt)}</Text>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Last Login</Text>
              <Text style={styles.value}>{formatDate(user?.lastLoginAt)}</Text>
            </View>
            
            {editMode && (
              <>
                <View style={styles.switchGroup}>
                  <Text style={styles.label}>Account Active</Text>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                    trackColor={{ false: colors.neutral.lightGray, true: colors.primary.light }}
                    thumbColor={isActive ? colors.primary.main : colors.neutral.gray}
                  />
                </View>
                
                <View style={styles.switchGroup}>
                  <Text style={styles.label}>Admin Privileges</Text>
                  <Switch
                    value={isAdmin}
                    onValueChange={setIsAdmin}
                    trackColor={{ false: colors.neutral.lightGray, true: colors.primary.light }}
                    thumbColor={isAdmin ? colors.primary.main : colors.neutral.gray}
                  />
                </View>
              </>
            )}
          </View>
          
          {editMode && (
            <View style={styles.actionButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setEditMode(false);
                  // Reset form values
                  setDisplayName(user?.displayName || '');
                  setProfileImage(user?.profileImage || '');
                  setNativeLanguage(user?.nativeLanguage || '');
                  setEnglishLevel(user?.englishLevel || 'beginner');
                  setLearningGoal(user?.learningGoal || '');
                  setDailyGoalMinutes(user?.dailyGoalMinutes ? user.dailyGoalMinutes.toString() : '15');
   
                  setIsAdmin(user?.isAdmin || false);
                }}
                variant="secondary"
                style={styles.cancelButton}
              />
              <Button
                title="Save Changes"
                onPress={handleSaveChanges}
                loading={saving}
                style={styles.saveButton}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.gray,
    marginTop: spacing.sm,
  },
  editButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: colors.neutral.background,
  },
  profileHeader: {
    backgroundColor: colors.neutral.white,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral.white,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  userMeta: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.lightGray,
    marginRight: spacing.xs,
  },
  activeBadge: {
    backgroundColor: colors.status.success + '20',
  },
  suspendedBadge: {
    backgroundColor: colors.status.error + '20',
  },
  statusText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral.darkGray,
    textTransform: 'capitalize',
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.lightGray,
  },
  adminRoleBadge: {
    backgroundColor: colors.primary.main + '20',
  },
  instructorRoleBadge: {
    backgroundColor: colors.secondary.main + '20',
  },
  studentRoleBadge: {
    backgroundColor: colors.status.info + '20',
  },
  roleText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium as any,
    color: colors.neutral.darkGray,
  },
  adminRoleText: {
    color: colors.primary.main,
  },
  instructorRoleText: {
    color: colors.secondary.main,
  },
  studentRoleText: {
    color: colors.status.info,
  },
  userName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.neutral.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.gray,
  },
  infoSection: {
    backgroundColor: colors.neutral.white,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.primary.main,
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    color: colors.neutral.darkGray,
    marginBottom: 4,
  },
  value: {
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
  },
  input: {
    backgroundColor: colors.neutral.background,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    fontSize: typography.fontSizes.md,
    color: colors.neutral.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    borderRadius: 16,
    marginLeft: spacing.md,
    backgroundColor: colors.neutral.background,
  },
});
