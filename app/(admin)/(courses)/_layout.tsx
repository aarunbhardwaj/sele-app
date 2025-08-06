import { Stack } from 'expo-router';
import React from 'react';

export default function CoursesLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      tabBarStyle: { display: 'none' },
      presentation: 'containedModal'
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="course-library" />
      <Stack.Screen name="course-creator" />
      <Stack.Screen name="course-details" />
      <Stack.Screen name="edit-course" />
      <Stack.Screen name="lessons" />
      <Stack.Screen name="create-lesson" />
      <Stack.Screen name="edit-lesson" />
      <Stack.Screen name="lesson-view" />
    </Stack>
  );
}