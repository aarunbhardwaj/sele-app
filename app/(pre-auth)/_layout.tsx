import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../services/AuthContext';

// Airbnb-inspired color palette (matching the main tabs)
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

const TabsLayout = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  // Debounced navigation function to prevent rapid navigation
  const handleNavigation = useCallback((route: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    // Use requestAnimationFrame to ensure smooth navigation
    requestAnimationFrame(() => {
      try {
        router.push(route as any);
      } catch (error) {
        console.warn('Navigation error:', error);
      } finally {
        // Reset navigation flag after a short delay
        setTimeout(() => setIsNavigating(false), 300);
      }
    });
  }, [router, isNavigating]);

  const handleLogout = useCallback(() => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    requestAnimationFrame(() => {
      try {
        logout();
      } catch (error) {
        console.warn('Logout error:', error);
      } finally {
        setTimeout(() => setIsNavigating(false), 300);
      }
    });
  }, [logout, isNavigating]);

  // Main Tabs layout - no drawer
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: airbnbColors.primary,
        tabBarInactiveTintColor: airbnbColors.mediumGray,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarShowLabel: true,
        unmountOnBlur: false, // Keep screens mounted to prevent state loss
        lazy: false, // Don't lazy load tabs
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          switch (route.name) {
            case 'index':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'login':
              iconName = focused ? 'log-in' : 'log-in-outline';
              break;
            case 'signup':
              iconName = focused ? 'person-add' : 'person-add-outline';
              break;
            case 'welcome':
              iconName = focused ? 'star' : 'star-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size || 24} color={color} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => !isNavigating && handleNavigation('/(pre-auth)/')}
              disabled={isNavigating}
              style={[props.style, isNavigating && { opacity: 0.6 }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: 'Sign In',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => !isNavigating && handleNavigation('/(pre-auth)/login')}
              disabled={isNavigating}
              style={[props.style, isNavigating && { opacity: 0.6 }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: 'Sign Up',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => !isNavigating && handleNavigation('/(pre-auth)/signup')}
              disabled={isNavigating}
              style={[props.style, isNavigating && { opacity: 0.6 }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="welcome"
        options={{
          title: 'Welcome',
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              onPress={() => !isNavigating && handleNavigation('/(pre-auth)/welcome')}
              disabled={isNavigating}
              style={[props.style, isNavigating && { opacity: 0.6 }]}
            />
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: airbnbColors.white,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
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
});

export default TabsLayout;