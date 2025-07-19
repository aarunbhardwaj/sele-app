import { Redirect } from 'expo-router';
import React from 'react';

// This file serves as a redirect to the main application index
export default function DrawerIndex() {
  return <Redirect href="/(tabs)" />;
}