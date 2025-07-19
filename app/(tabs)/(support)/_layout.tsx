import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '../../../components/ui/theme';

export default function SupportLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Help & Support' }} />
    </Stack>
  );
}