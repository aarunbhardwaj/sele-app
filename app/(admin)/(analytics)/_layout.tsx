import { Stack } from 'expo-router';
import React from 'react';

export default function AnalyticsLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      tabBarStyle: { display: 'none' },
      presentation: 'containedModal'
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="user-analytics" />
      <Stack.Screen name="course-analytics" />
      <Stack.Screen name="class-analytics" />
      <Stack.Screen name="quiz-analytics" />
    </Stack>
  );
}