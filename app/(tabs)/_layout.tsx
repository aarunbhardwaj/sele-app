import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const _Layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: 'white', // Changed to white for better visibility
                    borderTopWidth: 1,
                    borderTopColor: '#e5e7eb',
                },
                tabBarActiveTintColor: '#3b82f6', // Blue active color
                tabBarInactiveTintColor: '#6b7280', // Gray inactive color
                headerShown: false,
            }}
        >
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
