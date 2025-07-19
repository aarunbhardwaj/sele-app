import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '../../../components/ui/theme';

export default function CoursesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="catalog" options={{ title: 'Course Catalog' }} />
      <Stack.Screen name="details" options={{ title: 'Course Details' }} />
      <Stack.Screen name="progress" options={{ title: 'Course Progress' }} />
      <Stack.Screen name="enrolled" options={{ title: 'Enrolled Courses' }} />
      <Stack.Screen name="enrollment" options={{ title: 'Enrollment' }} />
    </Stack>
  );
}