import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/ui/Header';
import { borderRadius, colors, spacing, typography } from '../../components/ui/theme';
import Text from '../../components/ui/Typography';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

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
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text variant="body1" color={colors.neutral.darkGray} style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header 
                title="Profile" 
                showLogo={true}
                rightIcon={
                    !editing ? (
                        <Ionicons name="pencil" size={22} color={colors.primary.main} />
                    ) : (
                        <Ionicons name="close" size={22} color={colors.neutral.darkGray} />
                    )
                }
                onRightIconPress={() => setEditing(!editing)}
            />
            <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                    {/* Profile Card */}
                    <Card style={styles.profileCard}>
                        {!editing ? (
                            <>
                                <View style={styles.profileHeader}>
                                    <Image 
                                        source={
                                            userProfile?.profileImage 
                                                ? { uri: userProfile.profileImage } 
                                                : require('../../assets/images/app-logo.png')
                                        }
                                        style={styles.profileImage}
                                        resizeMode="cover"
                                    />
                                    <View style={styles.profileInfo}>
                                        <Text variant="h5" style={styles.profileName}>{userProfile?.displayName || user?.name || 'User'}</Text>
                                        <Text variant="body2" color={colors.neutral.darkGray}>{user?.email || 'No email provided'}</Text>
                                        <View style={styles.profileBadges}>
                                            <View style={styles.levelBadge}>
                                                <Text variant="caption" color={colors.secondary.dark} style={styles.badgeText}>{userProfile?.englishLevel || 'Beginner'}</Text>
                                            </View>
                                            <View style={styles.languageBadge}>
                                                <Ionicons name="globe-outline" size={14} color={colors.neutral.darkGray} />
                                                <Text variant="caption" color={colors.neutral.darkGray} style={styles.languageText}>{userProfile?.nativeLanguage || 'Not specified'}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.sectionDivider}>
                                    <Text variant="subtitle2" color={colors.neutral.text}>Learning Goal</Text>
                                    <Text variant="body2" color={colors.neutral.darkGray} style={styles.goalText}>{userProfile?.learningGoal || 'No learning goal set'}</Text>
                                </View>

                                <View style={styles.statsContainer}>
                                    <View style={styles.statItem}>
                                        <Text variant="h4" color={colors.primary.main} style={styles.statValue}>{userProfile?.dailyGoalMinutes || 15}</Text>
                                        <Text variant="caption" color={colors.neutral.darkGray} style={styles.statLabel}>Minutes/Day</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text variant="h4" color={colors.primary.main} style={styles.statValue}>0</Text>
                                        <Text variant="caption" color={colors.neutral.darkGray} style={styles.statLabel}>Day Streak</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text variant="h4" color={colors.primary.main} style={styles.statValue}>{formatDate(userProfile?.joinedDate)}</Text>
                                        <Text variant="caption" color={colors.neutral.darkGray} style={styles.statLabel}>Joined</Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            // Editing mode
                            <View>
                                <TouchableOpacity 
                                    style={styles.imageSelector}
                                    onPress={handleSelectImage}
                                >
                                    <Image 
                                        source={
                                            formData.profileImage 
                                                ? { uri: formData.profileImage } 
                                                : require('../../assets/images/app-logo.png')
                                        }
                                        style={styles.editProfileImage}
                                        resizeMode="cover"
                                    />
                                    <Text variant="body2" color={colors.secondary.main} style={styles.changePhotoText}>Change Photo</Text>
                                </TouchableOpacity>

                                <View style={styles.formField}>
                                    <Text variant="subtitle2" color={colors.neutral.darkGray} style={styles.formLabel}>Display Name</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={formData.displayName}
                                        onChangeText={(text) => setFormData({...formData, displayName: text})}
                                        placeholder="Enter your name"
                                        placeholderTextColor={colors.neutral.gray}
                                    />
                                </View>

                                <View style={styles.formField}>
                                    <Text variant="subtitle2" color={colors.neutral.darkGray} style={styles.formLabel}>Native Language</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={formData.nativeLanguage}
                                        onChangeText={(text) => setFormData({...formData, nativeLanguage: text})}
                                        placeholder="Your native language"
                                        placeholderTextColor={colors.neutral.gray}
                                    />
                                </View>

                                <View style={styles.formField}>
                                    <Text variant="subtitle2" color={colors.neutral.darkGray} style={styles.formLabel}>English Level</Text>
                                    <View style={styles.levelOptions}>
                                        {englishLevelOptions.map((level) => (
                                            <TouchableOpacity
                                                key={level}
                                                style={[
                                                    styles.levelOption,
                                                    formData.englishLevel === level && styles.selectedLevelOption
                                                ]}
                                                onPress={() => setFormData({...formData, englishLevel: level})}
                                            >
                                                <Text
                                                    variant="body2"
                                                    color={formData.englishLevel === level ? colors.neutral.white : colors.neutral.darkGray}
                                                >
                                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.formField}>
                                    <Text variant="subtitle2" color={colors.neutral.darkGray} style={styles.formLabel}>Learning Goal</Text>
                                    <TextInput
                                        style={[styles.textInput, styles.textAreaInput]}
                                        value={formData.learningGoal}
                                        onChangeText={(text) => setFormData({...formData, learningGoal: text})}
                                        placeholder="What do you want to achieve?"
                                        placeholderTextColor={colors.neutral.gray}
                                        multiline={true}
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                    />
                                </View>

                                <View style={styles.formField}>
                                    <Text variant="subtitle2" color={colors.neutral.darkGray} style={styles.formLabel}>Daily Goal (minutes)</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={String(formData.dailyGoalMinutes)}
                                        onChangeText={(text) => {
                                            const value = parseInt(text) || 0;
                                            setFormData({...formData, dailyGoalMinutes: value})
                                        }}
                                        placeholder="15"
                                        placeholderTextColor={colors.neutral.gray}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <Button
                                    title={saving ? 'Saving...' : 'Save Changes'}
                                    variant="primary"
                                    onPress={handleSaveProfile}
                                    loading={saving}
                                    disabled={saving}
                                    fullWidth
                                    style={styles.saveButton}
                                    leftIcon={saving ? null : <Ionicons name="save-outline" size={20} color="white" />}
                                />
                            </View>
                        )}
                    </Card>

                    {/* Admin Access - Only shown for admin users */}
                    {isAdmin && (
                        <View style={styles.sectionContainer}>
                            <Text variant="h5" style={styles.sectionTitle}>Admin Access</Text>
                            <Card style={styles.sectionCard}>
                                <TouchableOpacity 
                                    style={styles.menuItem}
                                    onPress={handleAdminAccess}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <Ionicons name="shield-outline" size={22} color={colors.neutral.darkGray} />
                                        <Text variant="body1" color={colors.neutral.text} style={styles.menuItemText}>Admin Dashboard</Text>
                                        <View style={styles.adminBadge}>
                                            <Text variant="caption" color={colors.status.error} style={styles.adminBadgeText}>Admin</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={18} color={colors.neutral.gray} />
                                </TouchableOpacity>
                            </Card>
                        </View>
                    )}

                    {/* Settings */}
                    <View style={styles.sectionContainer}>
                        <Text variant="h5" style={styles.sectionTitle}>Settings</Text>
                        <Card style={styles.sectionCard}>
                            <View style={[styles.menuItem, styles.menuItemBordered]}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="notifications-outline" size={22} color={colors.neutral.darkGray} />
                                    <Text variant="body1" color={colors.neutral.text} style={styles.menuItemText}>Push Notifications</Text>
                                </View>
                                <Switch
                                    value={notifications}
                                    onValueChange={setNotifications}
                                    trackColor={{ false: colors.neutral.lightGray, true: colors.primary.light }}
                                    thumbColor={notifications ? colors.primary.main : colors.neutral.white}
                                />
                            </View>
                            <View style={[styles.menuItem, styles.menuItemBordered]}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="moon-outline" size={22} color={colors.neutral.darkGray} />
                                    <Text variant="body1" color={colors.neutral.text} style={styles.menuItemText}>Dark Mode</Text>
                                </View>
                                <Switch
                                    value={darkMode}
                                    onValueChange={setDarkMode}
                                    trackColor={{ false: colors.neutral.lightGray, true: colors.primary.light }}
                                    thumbColor={darkMode ? colors.primary.main : colors.neutral.white}
                                />
                            </View>
                            <TouchableOpacity style={[styles.menuItem, styles.menuItemBordered]}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="lock-closed-outline" size={22} color={colors.neutral.darkGray} />
                                    <Text variant="body1" color={colors.neutral.text} style={styles.menuItemText}>Change Password</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.neutral.gray} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="language-outline" size={22} color={colors.neutral.darkGray} />
                                    <Text variant="body1" color={colors.neutral.text} style={styles.menuItemText}>Language Preferences</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.neutral.gray} />
                            </TouchableOpacity>
                        </Card>
                    </View>

                    {/* Support */}
                    <View style={styles.sectionContainer}>
                        <Text variant="h5" style={styles.sectionTitle}>Support</Text>
                        <Card style={styles.sectionCard}>
                            <TouchableOpacity style={[styles.menuItem, styles.menuItemBordered]}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="help-circle-outline" size={22} color={colors.neutral.darkGray} />
                                    <Text variant="body1" color={colors.neutral.text} style={styles.menuItemText}>Help Center</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.neutral.gray} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.menuItem, styles.menuItemBordered]}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="chatbox-outline" size={22} color={colors.neutral.darkGray} />
                                    <Text variant="body1" color={colors.neutral.text} style={styles.menuItemText}>Contact Support</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.neutral.gray} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem}>
                                <View style={styles.menuItemLeft}>
                                    <Ionicons name="document-text-outline" size={22} color={colors.neutral.darkGray} />
                                    <Text variant="body1" color={colors.neutral.text} style={styles.menuItemText}>Terms and Privacy</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.neutral.gray} />
                            </TouchableOpacity>
                        </Card>
                    </View>

                    {/* Logout Button */}
                    <Button
                        title="Log Out"
                        variant="outline"
                        style={styles.logoutButton}
                        textStyle={{ color: colors.status.error }}
                        leftIcon={<Ionicons name="log-out-outline" size={22} color={colors.status.error} />}
                        onPress={handleLogout}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.neutral.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        paddingTop: spacing.md,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.neutral.background,
    },
    loadingText: {
        marginTop: spacing.md,
    },
    profileCard: {
        marginBottom: spacing.xl,
        padding: spacing.md,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    profileInfo: {
        marginLeft: spacing.md,
        flex: 1,
    },
    profileName: {
        fontWeight: typography.fontWeights.bold,
    },
    profileBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    levelBadge: {
        backgroundColor: colors.secondary.light + '30', // With opacity
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },
    badgeText: {
        fontWeight: typography.fontWeights.medium,
    },
    languageBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
    languageText: {
        marginLeft: 4,
    },
    sectionDivider: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral.lightGray,
    },
    goalText: {
        marginTop: spacing.xs,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.neutral.lightGray,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontWeight: typography.fontWeights.bold,
    },
    statLabel: {
        textAlign: 'center',
    },
    imageSelector: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    editProfileImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
        marginBottom: spacing.sm,
    },
    changePhotoText: {
        fontWeight: typography.fontWeights.medium,
    },
    formField: {
        marginBottom: spacing.md,
    },
    formLabel: {
        marginBottom: spacing.xs,
    },
    textInput: {
        borderWidth: 1,
        borderColor: colors.neutral.lightGray,
        borderRadius: borderRadius.md,
        padding: spacing.sm,
        backgroundColor: colors.neutral.background,
        color: colors.neutral.text,
        fontSize: typography.fontSizes.sm,
    },
    textAreaInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    levelOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    levelOption: {
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.neutral.lightGray,
    },
    selectedLevelOption: {
        backgroundColor: colors.primary.main,
    },
    saveButton: {
        marginTop: spacing.md,
    },
    sectionContainer: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontWeight: typography.fontWeights.semibold,
        marginBottom: spacing.sm,
    },
    sectionCard: {
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
    },
    menuItemBordered: {
        borderBottomWidth: 1,
        borderBottomColor: colors.neutral.lightGray,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    menuItemText: {
        marginLeft: spacing.sm,
    },
    adminBadge: {
        backgroundColor: colors.status.error + '20', // With opacity
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        marginLeft: spacing.sm,
    },
    adminBadgeText: {
        fontWeight: typography.fontWeights.medium,
    },
    logoutButton: {
        backgroundColor: colors.status.error + '10', // Very light red
        borderColor: colors.status.error + '30', // Light red border
        marginTop: spacing.md,
    },
});
 
export default Profile;