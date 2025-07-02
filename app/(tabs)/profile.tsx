import { useLocalSearchParams } from 'expo-router';
import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../_layout';

const Profile = () => {
    const router = useRouter();
    const { logout } = useContext(AuthContext);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const {id} = useLocalSearchParams();

    // Mock user data
    const user = {
        name: 'Emma Watson',
        email: 'emma.watson@example.com',
        profileImage: require('../../assets/images/app-logo.png'),
        level: 'Intermediate',
        streak: 15,
        totalPoints: 3750,
        joinDate: 'January 2025',
    };

    const handleLogout = () => {
        // Call logout from AuthContext
        logout();
        
        // Redirect to pre-auth welcome screen
        router.replace('/(pre-auth)/welcome');
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
      <View className="pt-14 px-5 pb-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold">Profile</Text>
          <Text className="text-gray-600 mt-1">
            Manage your account and preferences
          </Text>
        </View>

        {/* User Profile */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <View className="flex-row items-center">
            <Image 
              source={user.profileImage}
              className="w-20 h-20 rounded-full"
              resizeMode="cover"
            />
            <View className="ml-4">
              <Text className="text-lg font-bold">{user.name}</Text>
              <Text className="text-gray-600">{user.email}</Text>
              <View className="flex-row items-center mt-1">
                <View className="bg-blue-100 rounded-full px-2 py-0.5">
                  <Text className="text-blue-700 text-xs">{user.level}</Text>
                </View>
                <View className="flex-row items-center ml-2">
                  <Ionicons name="flame" size={14} color="#F59E0B" />
                  <Text className="text-gray-700 text-xs ml-1">{user.streak} day streak</Text>
                </View>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
            <View className="items-center">
              <Text className="text-xl font-bold text-blue-600">{user.totalPoints}</Text>
              <Text className="text-xs text-gray-600">Total Points</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-blue-600">{user.streak}</Text>
              <Text className="text-xs text-gray-600">Day Streak</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-blue-600">{user.joinDate}</Text>
              <Text className="text-xs text-gray-600">Joined</Text>
            </View>
          </View>
        </View>

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