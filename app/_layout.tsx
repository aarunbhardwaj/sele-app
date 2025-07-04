import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { AuthProvider, useAuth } from "../services/AuthContext";
import './globals.css'; // Import global styles

// Root layout component that uses our AuthProvider
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

// Navigation component that uses the auth context
function RootLayoutNav() {
  const { isLoading, isAuthenticated } = useAuth();

  // Show a loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false, // Default to hide headers globally
      }}
    >
      <Stack.Screen
        name="splash"
        options={{
          headerShown: false
        }} 
      />
      <Stack.Screen
        name="(pre-auth)"
        options={{
          headerShown: false
        }}
        redirect={isAuthenticated}  // Redirect if user is already logged in
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false
        }}
        redirect={!isAuthenticated}  // Redirect if user is not logged in
      />
      <Stack.Screen
        name="(admin)"
        options={{
          headerShown: false
        }}
        redirect={!isAuthenticated}  // Redirect if user is not logged in
      />
      {/* Individual auth screens */}
      <Stack.Screen
        name="auth/forgot-password"
        options={{
          headerShown: true,
          headerTitle: "Forgot Password"
        }}
      />
      <Stack.Screen
        name="auth/login"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="auth/signup"
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="auth/verification-code"
        options={{
          headerShown: true,
          headerTitle: "Verification"
        }}
      />
    </Stack>
  );
}
