import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing, typography } from '../../components/ui/theme';

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
        tabBarStyle: {
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
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.neutral.darkGray,
        tabBarShowLabel: true,
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: typography.fontSizes.xs,
          fontWeight: typography.fontWeights.medium as any,
          marginTop: 2,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 8,
        },
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
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={size} color={color} />
              {focused && <View style={styles.activeIndicator} />}
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