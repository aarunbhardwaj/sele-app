import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing, typography } from '../../components/ui/theme';

export default function TabsLayout() {
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
          let iconName;
          
          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === '(classes)') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === '(quiz)') {
            iconName = focused ? 'help-circle' : 'help-circle-outline';
          } else if (route.name === '(profile)') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
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
      {/* Only 4 main tabs as requested */}
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="(classes)" options={{ title: 'Classes' }} />
      <Tabs.Screen name="(quiz)" options={{ title: 'Quiz' }} />
      <Tabs.Screen name="(profile)" options={{ title: 'Profile' }} />
      
      {/* Explicitly hide other folders from tab bar */}
      <Tabs.Screen name="(courses)" options={{ href: null }} />
      <Tabs.Screen name="(learning)" options={{ href: null }} />
      <Tabs.Screen name="(support)" options={{ href: null }} />
      <Tabs.Screen name="(drawer)" options={{ href: null }} />
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