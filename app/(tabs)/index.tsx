import { Redirect } from 'expo-router';

// This is the correct way to define options for Expo Router
export const unstable_settings = {
  // This tells Expo Router this tab shouldn't appear in the tab bar
  isHidden: true
};

export default function TabsIndex() {
  // Redirect to courses catalog instead of showing welcome screen after login
  return <Redirect href="/(tabs)/courses-catalog" />;
}