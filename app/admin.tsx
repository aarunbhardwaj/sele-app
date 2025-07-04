import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

// This is a simple redirect component that will immediately navigate to the admin section
export default function AdminRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to admin dashboard on mount
    setTimeout(() => {
      router.replace('/(admin)/index');
    }, 100);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Redirecting to Admin Dashboard...</Text>
    </View>
  );
}