import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const _Layout = () => {
    return (
        <Tabs
            screenOptions={({ navigation }) => ({
                tabBarStyle: {
                    backgroundColor: '#3b82f6', // Changed to blue to match app's color scheme
                    borderTopWidth: 0, // Removed border for cleaner look
                },
                tabBarActiveTintColor: '#ffffff', // White color for active icons
                tabBarInactiveTintColor: '#bfdbfe', // Light blue for inactive icons
                headerShown: true, // Show header
                headerStyle: {
                    backgroundColor: '#3b82f6', // Blue header to match tab bar
                },
                headerTintColor: '#ffffff', // White text/icons in header
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                // Custom header with logo and right side buttons
                headerTitle: () => (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={require('../../assets/images/app-logo.png')}
                            style={{ width: 30, height: 30, marginRight: 8 }}
                            resizeMode="contain"
                        />
                        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>
                            SELE
                        </Text>
                    </View>
                ),
                headerRight: () => (
                    <View style={{ flexDirection: 'row', marginRight: 15 }}>
                        <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => console.log('Search pressed')}>
                            <Ionicons name="search" size={24} color="#ffffff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={{ marginHorizontal: 8 }} onPress={() => console.log('Notifications pressed')}>
                            <Ionicons name="notifications" size={24} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                ),
            })}
        >
            {/* Configure index screen to be hidden but without using href and tabBarButton together */}
            <Tabs.Screen
                name="index"
                options={{
                    // Using tabBarStyle to hide this tab button instead
                    tabBarItemStyle: { display: 'none' },
                    tabBarLabelStyle: { display: 'none' },
                }}
            />
            
            <Tabs.Screen
                name="my-learning"
                options={{
                    title: "My Learning",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="school" size={size} color={color} />
                    ),
                }}
            />
            
            <Tabs.Screen
                name="enrolled-courses"
                options={{
                    title: "Enrolled",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="bookmark" size={size} color={color} />
                    ),
                }}
            />
            
            <Tabs.Screen
                name="courses-catalog"
                options={{
                    title: "Catalog",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="library" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default _Layout;
