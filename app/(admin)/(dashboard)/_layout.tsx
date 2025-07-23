import { Stack } from 'expo-router';
import React from 'react';

export default function DashboardLayout() {
  // Using a simple stack with no tab configuration to avoid adding extra tabs
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      // Disable any tab bar contributions from this layout
      tabBarStyle: { display: 'none' },
      // Important: Do not add any screens to the tab bar
      presentation: 'containedModal'
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}