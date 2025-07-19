import { Stack } from 'expo-router';
import React from 'react';
import { colors } from '../../../components/ui/theme';

export default function ClassesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Classes' }} />
      <Stack.Screen name="schedule" options={{ title: 'Class Schedule' }} />
      <Stack.Screen name="booking" options={{ title: 'Book a Class' }} />
      <Stack.Screen name="history" options={{ title: 'Class History' }} />
      <Stack.Screen name="classroom" options={{ title: 'Virtual Classroom' }} />
      <Stack.Screen name="recording-playback" options={{ title: 'Recording Playback' }} />
      <Stack.Screen name="video-player" options={{ title: 'Video Player' }} />
    </Stack>
  );
}