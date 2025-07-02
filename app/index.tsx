import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the splash screen when the app starts
  return <Redirect href="/splash" />;
}