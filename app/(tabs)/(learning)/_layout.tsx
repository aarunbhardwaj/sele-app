import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '../../../components/ui/theme';

export default function LearningLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Learning' }} />
      <Stack.Screen name="preferences" options={{ title: 'Learning Preferences' }} />
      <Stack.Screen name="dashboard" options={{ title: 'Progress Dashboard' }} />
    </Stack>
  );
}