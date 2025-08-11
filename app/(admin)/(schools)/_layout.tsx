import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '../../../components/ui/theme';

/**
 * Layout for Schools section
 * This prevents the school screens from being automatically added as tabs
 */
export default function SchoolsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral.background }
      }}
    />
  );
}