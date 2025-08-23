import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { colors } from '../../components/ui/theme';

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
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          switch (route.name) {
            case 'index':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case '(courses)':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case '(learning)':
              iconName = focused ? 'school' : 'school-outline';
              break;
            case '(quiz)':
              iconName = focused ? 'help-circle' : 'help-circle-outline';
              break;
            case '(classes)':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case '(profile)':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case '(support)':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            default:
              iconName = 'ellipse-outline';
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
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.neutral.gray,
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
        unmountOnBlur: false, // Keep screens mounted to prevent state loss
        lazy: false, // Don't lazy load tabs
      })}
    >
      {/* Only the most essential tabs */}
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen 
        name="(courses)" 
        options={{ 
          title: 'Courses'
        }} 
      />
      <Tabs.Screen
        name="(learning)"
        options={{
          title: 'Learning',
          href: null, // Hide from tab bar but keep navigable
        }}
      />
      <Tabs.Screen name="(quiz)" options={{ title: 'Quiz' }} />
      <Tabs.Screen
        name="(classes)"
        options={{
          title: 'Classes',
          href: null, // Hide from tab bar but keep navigable
        }}
      />
      <Tabs.Screen name="(profile)" options={{ title: 'Profile' }} />
      <Tabs.Screen
        name="(support)"
        options={{
          title: 'Support',
          href: null, // Hide from tab bar but keep navigable
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    height: Platform.OS === 'ios' ? 85 : 65,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
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