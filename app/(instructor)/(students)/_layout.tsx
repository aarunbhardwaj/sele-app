import { Stack } from 'expo-router';
import React from 'react';

export default function StudentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'My Students',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}