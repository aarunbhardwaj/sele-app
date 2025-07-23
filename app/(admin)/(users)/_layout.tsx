import { Stack } from 'expo-router';
import React from 'react';

export default function UsersLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      tabBarStyle: { display: 'none' },
      presentation: 'containedModal'
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="roles" />
      <Stack.Screen name="student-list" />
      <Stack.Screen name="student-details" />
      <Stack.Screen name="user-analytics" />
    </Stack>
  );
}