import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';
import { useAuth } from '../../../services/AuthContext';

// Airbnb-inspired color palette
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

const Profile = () => {
    const router = useRouter();
    const { logout, user } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const { id } = useLocalSearchParams();

    // State for user profile data
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Form state for editing
    const [formData, setFormData] = useState({
        displayName: '',
        nativeLanguage: '',
        englishLevel: 'beginner',
        learningGoal: '',
        dailyGoalMinutes: 15,
        profileImage: ''
    });

    // English level options for dropdown
    const englishLevelOptions = ['beginner', 'intermediate', 'advanced'];
    
    // Fetch user profile data
    useEffect(() => {
        if (user && user.$id) {
            fetchUserProfile(user.$id);
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchUserProfile = async (userId) => {
        try {
            setLoading(true);
            const profile = await appwriteService.getUserProfile(userId);
            
            if (profile) {
                setUserProfile(profile);
                // Check for admin status
                setIsAdmin(profile.isAdmin === true);
                
                // Initialize form data with current values
                setFormData({
                    displayName: profile.displayName,
                    nativeLanguage: profile.nativeLanguage,
                    englishLevel: profile.englishLevel,
                    learningGoal: profile.learningGoal || '',
                    dailyGoalMinutes: profile.dailyGoalMinutes || 15,
                    profileImage: profile.profileImage || ''
                });
            } else {
                // If no profile exists, create one with default values
                const newProfileData = {
                    displayName: user.name || '',
                    nativeLanguage: 'English',
                    englishLevel: 'beginner',
                    learningGoal: 'Improve my English skills',
                    dailyGoalMinutes: 15,
                    profileImage: ''
                };
                
                const newProfile = await appwriteService.createUserProfile(userId, newProfileData);
                setUserProfile(newProfile);
                setFormData(newProfileData);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Error', 'Failed to load profile data. Please make sure you are logged in.');
        } finally {
            setLoading(false);
        }
    };

    // Direct access to admin panel
    const handleAdminAccess = () => {
        console.log("Redirecting to admin panel...");
        try {
            // Use replace for a more reliable redirection
            router.replace('/(admin)');
        } catch (error) {
            console.error("Navigation error:", error);
            Alert.alert("Navigation Error", "Could not access admin panel. Please try again.");
        }
    };

    // Function to handle profile image selection
    const handleSelectImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                quality: 0.8,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                exif: false
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedAsset = result.assets[0];
                console.log("Selected image:", selectedAsset.uri);
                
                try {
                    // Get file info
                    const fileInfo = await FileSystem.getInfoAsync(selectedAsset.uri);
                    console.log("File info:", fileInfo);
                    
                    if (!fileInfo.exists) {
                        throw new Error('File does not exist');
                    }
                    
                    // Convert the file to binary format that Appwrite can handle
                    const fileContent = await FileSystem.readAsStringAsync(selectedAsset.uri, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    
                    // Create a temporary filename for Appwrite
                    const fileName = `profile_${Date.now()}.jpg`;
                    
                    // Create an object that matches what Appwrite expects
                    const fileBlob = {
                        name: fileName,
                        type: 'image/jpeg',
                        size: fileInfo.size,
                        source: fileContent  // Using source instead of base64String
                    };
                    
                    console.log("Attempting to upload file:", {
                        name: fileBlob.name,
                        type: fileBlob.type,
                        size: fileBlob.size,
                        hasSource: !!fileBlob.source
                    });
                    
                    // Upload to Appwrite Storage
                    const uploadedFile = await appwriteService.uploadMedia(fileBlob);
                    console.log("File uploaded to Appwrite:", uploadedFile);
                    
                    if (uploadedFile && uploadedFile.$id) {
                        // Get the preview URL for the uploaded file
                        const previewObject = appwriteService.getFilePreview(uploadedFile.$id);
                        const fileUrl = previewObject.toString();
                        console.log("File preview URL:", fileUrl);
                        
                        // Update form data with the new image URL
                        setFormData({
                            ...formData,
                            profileImage: fileUrl
                        });
                        
                        Alert.alert('Success', 'Profile image uploaded successfully');
                    } else {
                        throw new Error('Failed to upload image: No file ID returned');
                    }
                } catch (uploadError) {
                    console.error('Appwrite upload error:', uploadError);
                    Alert.alert('Upload Error', `Failed to upload image to server: ${uploadError.message}`);
                }
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to open the image picker. Please try again.');
        }
    };

    // Function to save profile changes
    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            
            if (userProfile) {
                // Validate form data
                if (!formData.displayName.trim()) {
                    Alert.alert('Error', 'Display name is required');
                    setSaving(false);
                    return;
                }
                
                // Update the existing profile
                const updatedProfile = await appwriteService.updateUserProfile(
                    userProfile.$id,
                    {
                        displayName: formData.displayName,
                        nativeLanguage: formData.nativeLanguage,
                        englishLevel: formData.englishLevel,
                        learningGoal: formData.learningGoal,
                        dailyGoalMinutes: formData.dailyGoalMinutes,
                        profileImage: formData.profileImage,
                        lastActive: new Date().toISOString()
                    }
                );
                
                setUserProfile(updatedProfile);
                setEditing(false);
                Alert.alert('Success', 'Profile updated successfully');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save profile changes');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            // Call logout from AuthContext
            await logout();
            // Router navigation will be handled in the AuthContext
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

    // Display loading indicator while fetching data
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={airbnbColors.primary} />
                <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <PreAuthHeader 
                title="Profile" 
                rightComponent={
                    <TouchableOpacity 
                        onPress={() => setEditing(!editing)}
                        style={styles.editButton}
                    >
                        {!editing ? (
                            <Ionicons name="pencil" size={22} color={airbnbColors.primary} />
                        ) : (
                            <Ionicons name="close" size={22} color={airbnbColors.darkGray} />
                        )}
                    </TouchableOpacity>
                }
            />
            
            <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.content}>
                    {/* Hero Profile Section */}
                    <Animated.View 
                        entering={FadeInDown.delay(100).duration(600)}
                        style={styles.heroSection}
                    >
                        <View style={styles.profileContainer}>
                            {!editing ? (
                                <>
                                    <View style={styles.profileImageContainer}>
                                        <Image 
                                            source={
                                                userProfile?.profileImage 
                                                    ? { uri: userProfile.profileImage } 
                                                    : require('../../../assets/images/app-logo.png')
                                            }
                                            style={styles.profileImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.statusIndicator} />
                                    </View>
                                    
                                    <View style={styles.profileInfo}>
                                        <Text style={styles.profileName}>
                                            {userProfile?.displayName || user?.name || 'User'}
                                        </Text>
                                        <Text style={styles.profileEmail}>
                                            {user?.email || 'No email provided'}
                                        </Text>
                                        
                                        <View style={styles.badgeContainer}>
                                            <View style={[styles.badge, styles.levelBadge]}>
                                                <Ionicons name="school" size={14} color={airbnbColors.secondary} />
                                                <Text style={styles.badgeText}>
                                                    {userProfile?.englishLevel || 'Beginner'}
                                                </Text>
                                            </View>
                                            
                                            <View style={[styles.badge, styles.languageBadge]}>
                                                <Ionicons name="globe" size={14} color={airbnbColors.darkGray} />
                                                <Text style={[styles.badgeText, styles.languageBadgeText]}>
                                                    {userProfile?.nativeLanguage || 'Not specified'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </>
                            ) : (
                                // Editing Mode
                                <View style={styles.editingContainer}>
                                    <TouchableOpacity 
                                        style={styles.editImageContainer}
                                        onPress={handleSelectImage}
                                    >
                                        <Image 
                                            source={
                                                formData.profileImage 
                                                    ? { uri: formData.profileImage } 
                                                    : require('../../../assets/images/app-logo.png')
                                            }
                                            style={styles.editProfileImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.cameraOverlay}>
                                            <Ionicons name="camera" size={20} color={airbnbColors.white} />
                                        </View>
                                    </TouchableOpacity>

                                    <View style={styles.editForm}>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>Display Name</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={formData.displayName}
                                                onChangeText={(text) => setFormData({...formData, displayName: text})}
                                                placeholder="Enter your name"
                                                placeholderTextColor={airbnbColors.mediumGray}
                                            />
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>Native Language</Text>
                                            <TextInput
                                                style={styles.textInput}
                                                value={formData.nativeLanguage}
                                                onChangeText={(text) => setFormData({...formData, nativeLanguage: text})}
                                                placeholder="Your native language"
                                                placeholderTextColor={airbnbColors.mediumGray}
                                            />
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>English Level</Text>
                                            <View style={styles.levelSelector}>
                                                {englishLevelOptions.map((level) => (
                                                    <TouchableOpacity
                                                        key={level}
                                                        style={[
                                                            styles.levelOption,
                                                            formData.englishLevel === level && styles.selectedLevel
                                                        ]}
                                                        onPress={() => setFormData({...formData, englishLevel: level})}
                                                    >
                                                        <Text style={[
                                                            styles.levelText,
                                                            formData.englishLevel === level && styles.selectedLevelText
                                                        ]}>
                                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>Learning Goal</Text>
                                            <TextInput
                                                style={[styles.textInput, styles.textArea]}
                                                value={formData.learningGoal}
                                                onChangeText={(text) => setFormData({...formData, learningGoal: text})}
                                                placeholder="What do you want to achieve?"
                                                placeholderTextColor={airbnbColors.mediumGray}
                                                multiline={true}
                                                numberOfLines={3}
                                                textAlignVertical="top"
                                            />
                                        </View>

                                        <TouchableOpacity
                                            style={styles.saveButton}
                                            onPress={handleSaveProfile}
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <ActivityIndicator size="small" color={airbnbColors.white} />
                                            ) : (
                                                <>
                                                    <Ionicons name="checkmark" size={20} color={airbnbColors.white} />
                                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animated.View>

                    {/* Stats Section */}
                    {!editing && (
                        <Animated.View 
                            entering={FadeInUp.delay(200).duration(600)}
                            style={styles.statsSection}
                        >
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Text style={styles.statNumber}>{userProfile?.dailyGoalMinutes || 15}</Text>
                                    <Text style={styles.statLabel}>min/day</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statNumber}>0</Text>
                                    <Text style={styles.statLabel}>Day streak</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Text style={styles.statNumber}>3</Text>
                                    <Text style={styles.statLabel}>Courses</Text>
                                </View>
                            </View>
                        </Animated.View>
                    )}

                    {/* Admin Access - Only shown for admin users */}
                    {isAdmin && !editing && (
                        <Animated.View 
                            entering={FadeInUp.delay(300).duration(600)}
                            style={styles.sectionContainer}
                        >
                            <Text style={styles.sectionTitle}>Admin Access</Text>
                            <View style={styles.menuCard}>
                                <TouchableOpacity 
                                    style={styles.adminMenuItem}
                                    onPress={handleAdminAccess}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={styles.adminIconContainer}>
                                            <Ionicons name="shield" size={20} color={airbnbColors.primary} />
                                        </View>
                                        <View style={styles.menuItemContent}>
                                            <Text style={styles.menuItemTitle}>Admin Dashboard</Text>
                                            <Text style={styles.menuItemSubtitle}>Manage system settings</Text>
                                        </View>
                                        <View style={styles.adminBadge}>
                                            <Text style={styles.adminBadgeText}>Admin</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}

                    {/* Learning Section */}
                    {!editing && (
                        <Animated.View 
                            entering={FadeInUp.delay(400).duration(600)}
                            style={styles.sectionContainer}
                        >
                            <Text style={styles.sectionTitle}>Learning</Text>
                            <View style={styles.menuCard}>
                                <TouchableOpacity 
                                    style={[styles.menuItem, styles.menuItemBordered]}
                                    onPress={() => router.push('/(tabs)/(courses)/catalog')}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: airbnbColors.secondary + '20' }]}>
                                            <Ionicons name="book" size={20} color={airbnbColors.secondary} />
                                        </View>
                                        <View style={styles.menuItemContent}>
                                            <Text style={styles.menuItemTitle}>Course Catalog</Text>
                                            <Text style={styles.menuItemSubtitle}>Browse available courses</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.menuItem, styles.menuItemBordered]}
                                    onPress={() => router.push('/(tabs)/(courses)/enrolled')}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: airbnbColors.warning + '20' }]}>
                                            <Ionicons name="library" size={20} color={airbnbColors.warning} />
                                        </View>
                                        <View style={styles.menuItemContent}>
                                            <Text style={styles.menuItemTitle}>My Courses</Text>
                                            <Text style={styles.menuItemSubtitle}>Continue learning</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={styles.menuItem}
                                    onPress={() => router.push('/(tabs)/(learning)/dashboard')}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: airbnbColors.primary + '20' }]}>
                                            <Ionicons name="analytics" size={20} color={airbnbColors.primary} />
                                        </View>
                                        <View style={styles.menuItemContent}>
                                            <Text style={styles.menuItemTitle}>Progress Dashboard</Text>
                                            <Text style={styles.menuItemSubtitle}>Track your learning</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}

                    {/* Settings Section */}
                    {!editing && (
                        <Animated.View 
                            entering={FadeInUp.delay(500).duration(600)}
                            style={styles.sectionContainer}
                        >
                            <Text style={styles.sectionTitle}>Settings</Text>
                            <View style={styles.menuCard}>
                                <View style={[styles.menuItem, styles.menuItemBordered]}>
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: airbnbColors.success + '20' }]}>
                                            <Ionicons name="notifications" size={20} color={airbnbColors.success} />
                                        </View>
                                        <View style={styles.menuItemContent}>
                                            <Text style={styles.menuItemTitle}>Push Notifications</Text>
                                            <Text style={styles.menuItemSubtitle}>Get learning reminders</Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={notifications}
                                        onValueChange={setNotifications}
                                        trackColor={{ false: airbnbColors.lightGray, true: airbnbColors.primary + '40' }}
                                        thumbColor={notifications ? airbnbColors.primary : airbnbColors.white}
                                        ios_backgroundColor={airbnbColors.lightGray}
                                    />
                                </View>
                                
                                <TouchableOpacity 
                                    style={[styles.menuItem, styles.menuItemBordered]}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: airbnbColors.darkGray + '20' }]}>
                                            <Ionicons name="lock-closed" size={20} color={airbnbColors.darkGray} />
                                        </View>
                                        <View style={styles.menuItemContent}>
                                            <Text style={styles.menuItemTitle}>Privacy & Security</Text>
                                            <Text style={styles.menuItemSubtitle}>Manage your privacy</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.menuItem}>
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.iconContainer, { backgroundColor: airbnbColors.mediumGray + '20' }]}>
                                            <Ionicons name="help-circle" size={20} color={airbnbColors.mediumGray} />
                                        </View>
                                        <View style={styles.menuItemContent}>
                                            <Text style={styles.menuItemTitle}>Help & Support</Text>
                                            <Text style={styles.menuItemSubtitle}>Get help when you need it</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}

                    {/* Logout Button */}
                    {!editing && (
                        <Animated.View 
                            entering={FadeInUp.delay(600).duration(600)}
                            style={styles.logoutContainer}
                        >
                            <TouchableOpacity
                                style={styles.logoutButton}
                                onPress={handleLogout}
                            >
                                <Ionicons name="log-out" size={20} color={airbnbColors.error} />
                                <Text style={styles.logoutText}>Sign Out</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: airbnbColors.offWhite,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 8,
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
        fontWeight: '500',
    },
    editButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: airbnbColors.lightGray,
    },
    
    // Hero Section
    heroSection: {
        marginBottom: 24,
    },
    profileContainer: {
        backgroundColor: airbnbColors.white,
        borderRadius: 16,
        padding: 24,
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    profileImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 3,
        borderColor: airbnbColors.lightGray,
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 4,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: airbnbColors.success,
        borderWidth: 3,
        borderColor: airbnbColors.white,
    },
    profileInfo: {
        alignItems: 'center',
    },
    profileName: {
        fontSize: 24,
        fontWeight: '700',
        color: airbnbColors.charcoal,
        marginBottom: 4,
        textAlign: 'center',
    },
    profileEmail: {
        fontSize: 16,
        color: airbnbColors.darkGray,
        marginBottom: 16,
        textAlign: 'center',
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    levelBadge: {
        backgroundColor: airbnbColors.secondaryLight,
    },
    languageBadge: {
        backgroundColor: airbnbColors.lightGray,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: airbnbColors.secondary,
    },
    languageBadgeText: {
        color: airbnbColors.darkGray,
    },
    
    // Editing Mode
    editingContainer: {
        alignItems: 'center',
    },
    editImageContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    editProfileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: airbnbColors.lightGray,
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: airbnbColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: airbnbColors.white,
    },
    editForm: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: airbnbColors.charcoal,
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: airbnbColors.gray,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: airbnbColors.charcoal,
        backgroundColor: airbnbColors.white,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    levelSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    levelOption: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: airbnbColors.gray,
        backgroundColor: airbnbColors.white,
        alignItems: 'center',
    },
    selectedLevel: {
        borderColor: airbnbColors.primary,
        backgroundColor: airbnbColors.primaryLight,
    },
    levelText: {
        fontSize: 14,
        fontWeight: '600',
        color: airbnbColors.darkGray,
    },
    selectedLevelText: {
        color: airbnbColors.primary,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: airbnbColors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        gap: 8,
        marginTop: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: airbnbColors.white,
    },
    
    // Stats Section
    statsSection: {
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
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
        fontSize: 24,
        fontWeight: '700',
        color: airbnbColors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
        color: airbnbColors.darkGray,
        textAlign: 'center',
    },
    
    // Menu Sections
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: airbnbColors.charcoal,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    menuCard: {
        backgroundColor: airbnbColors.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        minHeight: 72,
    },
    menuItemBordered: {
        borderBottomWidth: 1,
        borderBottomColor: airbnbColors.lightGray,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: airbnbColors.charcoal,
        marginBottom: 2,
    },
    menuItemSubtitle: {
        fontSize: 14,
        color: airbnbColors.darkGray,
    },
    
    // Admin specific styles
    adminMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    adminIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: airbnbColors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    adminBadge: {
        backgroundColor: airbnbColors.error,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 12,
    },
    adminBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: airbnbColors.white,
    },
    
    // Logout Section
    logoutContainer: {
        marginBottom: 24,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: airbnbColors.white,
        borderRadius: 12,
        paddingVertical: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: airbnbColors.error + '30',
        shadowColor: airbnbColors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: airbnbColors.error,
    },
});
 
export default Profile;