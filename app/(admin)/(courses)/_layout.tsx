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
      <Stack.Screen name="edit-course" />
      <Stack.Screen name="publish-course" />
      <Stack.Screen name="lessons" />
      <Stack.Screen name="upload-content" />
      <Stack.Screen name="course-analytics" />
      <Stack.Screen name="set-categories" />
      <Stack.Screen name="set-curriculum" />
      <Stack.Screen name="exercises" />
      <Stack.Screen name="set-instructor" />
    </Stack>
  );
}