import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing, typography } from '../../components/ui/theme';
import { useAuth } from '../../services/AuthContext';

const TabsLayout = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

  // Simplified navigation function
  const handleNavigation = (route: string) => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    requestAnimationFrame(() => {
      router.push(route as any);
      setIsNavigating(false);
    });
  };

  const handleLogout = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    requestAnimationFrame(() => {
      logout();
      setIsNavigating(false);
    });
  };

  // Main Tabs layout - no drawer
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.neutral.darkGray,
        tabBarShowLabel: true,
        headerShown: false,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIcon: ({ color, size, focused }) => {
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
              iconName = focused ? 'information-circle' : 'information-circle-outline';
              break;
            default:
              iconName = 'home-outline';
          }
          
          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={size} color={color} />
              {focused && <View style={styles.activeIndicator} />}
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="login" options={{ title: 'Login' }} />
      <Tabs.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Tabs.Screen name="welcome" options={{ title: 'Welcome' }} />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.primary.veryLightBlue,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    height: 60,
    paddingHorizontal: spacing.md,
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabBarLabel: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium as any,
    marginTop: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    height: 24,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary.main,
  }
});

export default TabsLayout;