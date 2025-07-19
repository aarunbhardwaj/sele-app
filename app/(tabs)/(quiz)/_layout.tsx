import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '../../../components/ui/theme';

export default function QuizLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="categories" options={{ title: 'Quiz Categories' }} />
      <Stack.Screen name="history" options={{ title: 'Quiz History' }} />
    </Stack>
  );
}