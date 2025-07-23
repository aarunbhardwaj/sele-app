import { Stack } from 'expo-router';
import React from 'react';

export default function QuizLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      tabBarStyle: { display: 'none' },
      presentation: 'containedModal'
    }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="quiz-builder" />
      <Stack.Screen name="create-quiz" />
      <Stack.Screen name="preview-quiz" />
      <Stack.Screen name="publish-quiz" />
      <Stack.Screen name="quiz-analytics" />
      <Stack.Screen name="question-bank" />
    </Stack>
  );
}