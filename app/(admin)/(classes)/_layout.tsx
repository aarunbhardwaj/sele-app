import { Stack } from 'expo-router';
import React from 'react';

export default function ClassesLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      tabBarStyle: { display: 'none' },
      presentation: 'containedModal'
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="class-monitor" />
      <Stack.Screen name="class-scheduler" />
      <Stack.Screen name="create-class" />
      <Stack.Screen name="recording-management" />
      <Stack.Screen name="publish-schedule" />
      <Stack.Screen name="class-analytics" />
    </Stack>
  );
}