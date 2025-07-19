import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, typography } from '../../../components/ui/theme';

export default function DrawerTabsLayout() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  // Navigation function
  const handleNavigation = (route: string) => {
    if (isNavigating) return;
    setIsNavigating(true);
    
    requestAnimationFrame(() => {
      router.push(route as any);
      setIsNavigating(false);
    });
  };

  // Main Tabs layout - this is similar to the pre-auth tabs but with authenticated screens
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
          let iconName: any = 'home-outline';
            
          // Match tab routes to appropriate icons
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
            case '(profile)':
              iconName = focused ? 'person' : 'person-outline';
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
      {/* Main tabs - this matches what we had before */}
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="(learning)" options={{ title: 'Learning' }} />
      <Tabs.Screen name="(courses)" options={{ title: 'Courses' }} />
      <Tabs.Screen name="(quiz)" options={{ title: 'Quizzes' }} />
      <Tabs.Screen name="(profile)" options={{ title: 'Profile' }} />
      
      {/* Hidden screens but still accessible via navigation */}
      <Tabs.Screen name="(classes)" options={{ href: null, title: 'Classes' }} />
      <Tabs.Screen name="(support)" options={{ href: null, title: 'Support' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.primary.veryLightBlue,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    height: 60,
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
  },
});