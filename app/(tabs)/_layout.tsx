import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Airbnb-inspired color palette (matching login screen)
const airbnbColors = {
  // Primary Airbnb colors
  primary: '#FF5A5F',        // Airbnb's signature coral/red
  primaryDark: '#E8484D',    // Darker variant
  primaryLight: '#FFE8E9',   // Light coral background
  
  // Secondary colors
  secondary: '#00A699',      // Teal for accents
  secondaryLight: '#E0F7F5', // Light teal background
  
  // Neutral palette (very Airbnb-esque)
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  gray: '#EBEBEB',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  black: '#222222',
  
  // Status colors
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
};

export default function TabsLayout() {
  const pathname = usePathname();
  const router = useRouter();

  // Custom function to handle Courses tab navigation
  const handleCoursesTab = () => {
    // If we're already in courses tab but not on catalog, navigate to catalog
    if (pathname.includes('/(tabs)/(courses)') && !pathname.includes('/(tabs)/(courses)/catalog')) {
      router.navigate('/(tabs)/(courses)/catalog');
      return true; // Indicate we handled the navigation
    }
    
    // If we're already on the catalog page, do nothing
    if (pathname.includes('/(tabs)/(courses)/catalog')) {
      return true; // Indicate we handled the navigation
    }
    
    // Otherwise, let default navigation happen
    return false;
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: airbnbColors.primary,
        tabBarInactiveTintColor: airbnbColors.mediumGray,
        tabBarShowLabel: true,
        headerShown: false,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          
          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === '(courses)') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === '(quiz)') {
            iconName = focused ? 'help-circle' : 'help-circle-outline';
          } else if (route.name === '(profile)') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return (
            <View style={[
              styles.iconContainer,
              focused && styles.iconContainerActive
            ]}>
              <View style={[
                styles.iconWrapper,
                focused && styles.iconWrapperActive
              ]}>
                <Ionicons 
                  name={iconName} 
                  size={focused ? 24 : 22} 
                  color={focused ? airbnbColors.white : color} 
                />
              </View>
            </View>
          );
        }
      })}
    >
      {/* Only the most essential tabs */}
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen 
        name="(courses)" 
        options={{ 
          title: 'Courses',
          // We'll override the default navigation with our own
          onPress: () => handleCoursesTab()
        }} 
      />
      <Tabs.Screen name="(quiz)" options={{ title: 'Quizzes' }} />
      <Tabs.Screen name="(profile)" options={{ title: 'Profile' }} />
      
      {/* Explicitly hide other folders from tab bar */}
      <Tabs.Screen name="(classes)" options={{ href: null }} />
      <Tabs.Screen name="(learning)" options={{ href: null }} />
      <Tabs.Screen name="(support)" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 0,
    borderTopLeftRadius: 20, // Reduced from 28
    borderTopRightRadius: 20,
    height: 82, // Reduced from 95
    paddingHorizontal: 8, // Reduced from 20
    paddingTop: 8, // Reduced from 12
    paddingBottom: 20, // Reduced from 28
    position: 'absolute',
    // Enhanced shadow for better separation from background
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
    // Stronger border for definition
    borderWidth: 0.5, // Reduced border
    borderColor: airbnbColors.lightGray,
    borderBottomWidth: 0,
  },
  tabBarLabel: {
    fontSize: 10, // Reduced from 11
    fontWeight: '600', // Reduced from 700
    marginTop: 4, // Reduced from 6
    marginBottom: 2, // Reduced from 4
    letterSpacing: 0.1, // Reduced from 0.2
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4, // Reduced from 8
    paddingHorizontal: 2, // Reduced from 4
    minHeight: 58, // Reduced from 70
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 0, // Removed margin
  },
  iconContainerActive: {
    transform: [{ scale: 1.05 }], // Reduced from 1.1
  },
  iconWrapper: {
    width: 32, // Reduced from 38
    height: 32, // Reduced from 38
    borderRadius: 16, // Reduced from 19
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconWrapperActive: {
    backgroundColor: airbnbColors.primary,
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 2 }, // Reduced from 4
    shadowOpacity: 0.3, // Reduced from 0.4
    shadowRadius: 4, // Reduced from 8
    elevation: 4, // Reduced from 8
    borderWidth: 1, // Reduced from 2
    borderColor: airbnbColors.primaryLight,
    transform: [{ scale: 1.0 }], // Removed extra scaling
  },
});