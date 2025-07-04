import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../services/AuthContext';
import appwriteService from '../../services/appwrite';

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
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="mt-4 text-gray-600">Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="pt-14 px-5 pb-8">
                {/* Header */}
                <View className="mb-6 flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold">Profile</Text>
                        <Text className="text-gray-600 mt-1">
                            Manage your account and preferences
                        </Text>
                    </View>
                    {!editing ? (
                        <TouchableOpacity 
                            className="bg-blue-50 rounded-lg p-2"
                            onPress={() => setEditing(true)}
                        >
                            <Ionicons name="pencil" size={22} color="#3B82F6" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity 
                            className="bg-gray-50 rounded-lg p-2"
                            onPress={() => setEditing(false)}
                        >
                            <Ionicons name="close" size={22} color="#4B5563" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* User Profile */}
                <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    {!editing ? (
                        <>
                            <View className="flex-row items-center">
                                <Image 
                                    source={
                                        userProfile?.profileImage 
                                            ? { uri: userProfile.profileImage } 
                                            : require('../../assets/images/app-logo.png')
                                    }
                                    className="w-20 h-20 rounded-full"
                                    resizeMode="cover"
                                />
                                <View className="ml-4">
                                    <Text className="text-lg font-bold">{userProfile?.displayName || user?.name || 'User'}</Text>
                                    <Text className="text-gray-600">{user?.email || 'No email provided'}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <View className="bg-blue-100 rounded-full px-2 py-0.5">
                                            <Text className="text-blue-700 text-xs">{userProfile?.englishLevel || 'Beginner'}</Text>
                                        </View>
                                        <View className="flex-row items-center ml-2">
                                            <Ionicons name="globe-outline" size={14} color="#4B5563" />
                                            <Text className="text-gray-700 text-xs ml-1">{userProfile?.nativeLanguage || 'Not specified'}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View className="mt-4 pt-4 border-t border-gray-100">
                                <Text className="text-gray-800 font-medium">Learning Goal</Text>
                                <Text className="text-gray-600 mt-1">{userProfile?.learningGoal || 'No learning goal set'}</Text>
                            </View>

                            <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
                                <View className="items-center">
                                    <Text className="text-xl font-bold text-blue-600">{userProfile?.dailyGoalMinutes || 15}</Text>
                                    <Text className="text-xs text-gray-600">Minutes/Day</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-xl font-bold text-blue-600">0</Text>
                                    <Text className="text-xs text-gray-600">Day Streak</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-xl font-bold text-blue-600">{formatDate(userProfile?.joinedDate)}</Text>
                                    <Text className="text-xs text-gray-600">Joined</Text>
                                </View>
                            </View>
                        </>
                    ) : (
                        // Editing mode
                        <View>
                            <TouchableOpacity 
                                className="items-center mb-4"
                                onPress={handleSelectImage}
                            >
                                <Image 
                                    source={
                                        formData.profileImage 
                                            ? { uri: formData.profileImage } 
                                            : require('../../assets/images/app-logo.png')
                                    }
                                    className="w-24 h-24 rounded-full mb-2"
                                    resizeMode="cover"
                                />
                                <Text className="text-blue-600">Change Photo</Text>
                            </TouchableOpacity>

                            <View className="mb-4">
                                <Text className="text-gray-700 mb-1">Display Name</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg p-2 bg-gray-50"
                                    value={formData.displayName}
                                    onChangeText={(text) => setFormData({...formData, displayName: text})}
                                    placeholder="Enter your name"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-700 mb-1">Native Language</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg p-2 bg-gray-50"
                                    value={formData.nativeLanguage}
                                    onChangeText={(text) => setFormData({...formData, nativeLanguage: text})}
                                    placeholder="Your native language"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-700 mb-1">English Level</Text>
                                <View className="flex-row flex-wrap">
                                    {englishLevelOptions.map((level) => (
                                        <TouchableOpacity
                                            key={level}
                                            className={`mr-2 mb-2 rounded-full px-4 py-2 ${
                                                formData.englishLevel === level
                                                    ? 'bg-blue-500'
                                                    : 'bg-gray-200'
                                            }`}
                                            onPress={() => setFormData({...formData, englishLevel: level})}
                                        >
                                            <Text
                                                className={`${
                                                    formData.englishLevel === level
                                                        ? 'text-white'
                                                        : 'text-gray-700'
                                                }`}
                                            >
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-700 mb-1">Learning Goal</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg p-2 bg-gray-50"
                                    value={formData.learningGoal}
                                    onChangeText={(text) => setFormData({...formData, learningGoal: text})}
                                    placeholder="What do you want to achieve?"
                                    multiline={true}
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-700 mb-1">Daily Goal (minutes)</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg p-2 bg-gray-50"
                                    value={String(formData.dailyGoalMinutes)}
                                    onChangeText={(text) => {
                                        const value = parseInt(text) || 0;
                                        setFormData({...formData, dailyGoalMinutes: value})
                                    }}
                                    placeholder="15"
                                    keyboardType="numeric"
                                />
                            </View>

                            <TouchableOpacity
                                className={`rounded-lg p-3 mt-2 ${saving ? 'bg-gray-400' : 'bg-blue-500'}`}
                                onPress={handleSaveProfile}
                                disabled={saving}
                            >
                                <View className="flex-row justify-center items-center">
                                    {saving ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Ionicons name="save-outline" size={20} color="white" />
                                    )}
                                    <Text className="text-white font-bold ml-2">{saving ? 'Saving...' : 'Save Changes'}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Admin Access - Only shown for admin users */}
                {isAdmin && (
                    <View className="mb-6">
                        <Text className="text-lg font-semibold mb-3">Admin Access</Text>
                        <View className="bg-white rounded-xl shadow-sm">
                            <TouchableOpacity 
                                className="p-4 flex-row items-center border-b border-gray-100"
                                onPress={handleAdminAccess}
                            >
                                <Ionicons name="shield-outline" size={22} color="#4B5563" />
                                <Text className="ml-3 text-gray-800">Admin Dashboard</Text>
                                <View className="ml-2 bg-red-100 rounded-full px-2 py-0.5">
                                    <Text className="text-red-700 text-xs">Admin</Text>
                                </View>
                                <View className="flex-1 flex-row justify-end">
                                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Settings */}
                <Text className="text-lg font-semibold mb-3">Settings</Text>
                <View className="bg-white rounded-xl shadow-sm mb-6">
                    <View className="p-4 flex-row justify-between items-center border-b border-gray-100">
                        <View className="flex-row items-center">
                            <Ionicons name="notifications-outline" size={22} color="#4B5563" />
                            <Text className="ml-3 text-gray-800">Push Notifications</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                            thumbColor={notifications ? "#3B82F6" : "#f4f3f4"}
                        />
                    </View>
                    <View className="p-4 flex-row justify-between items-center border-b border-gray-100">
                        <View className="flex-row items-center">
                            <Ionicons name="moon-outline" size={22} color="#4B5563" />
                            <Text className="ml-3 text-gray-800">Dark Mode</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                            thumbColor={darkMode ? "#3B82F6" : "#f4f3f4"}
                        />
                    </View>
                    <TouchableOpacity className="p-4 flex-row items-center border-b border-gray-100">
                        <Ionicons name="lock-closed-outline" size={22} color="#4B5563" />
                        <Text className="ml-3 text-gray-800">Change Password</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="p-4 flex-row items-center">
                        <Ionicons name="language-outline" size={22} color="#4B5563" />
                        <Text className="ml-3 text-gray-800">Language Preferences</Text>
                    </TouchableOpacity>
                </View>

                {/* Support */}
                <Text className="text-lg font-semibold mb-3">Support</Text>
                <View className="bg-white rounded-xl shadow-sm mb-6">
                    <TouchableOpacity className="p-4 flex-row items-center border-b border-gray-100">
                        <Ionicons name="help-circle-outline" size={22} color="#4B5563" />
                        <Text className="ml-3 text-gray-800">Help Center</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="p-4 flex-row items-center border-b border-gray-100">
                        <Ionicons name="chatbox-outline" size={22} color="#4B5563" />
                        <Text className="ml-3 text-gray-800">Contact Support</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="p-4 flex-row items-center">
                        <Ionicons name="document-text-outline" size={22} color="#4B5563" />
                        <Text className="ml-3 text-gray-800">Terms and Privacy</Text>
                    </TouchableOpacity>
                </View>

                {/* Logout Button */}
                <TouchableOpacity 
                    className="bg-red-50 rounded-xl p-4 flex-row justify-center items-center mt-4"
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                    <Text className="ml-2 text-red-600 font-medium">Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};
 
export default Profile;