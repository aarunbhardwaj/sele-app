import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from "../services/AuthContext";
import { LearningProgressProvider } from "../services/LearningProgressContext";
import './globals.css'; // Import global styles

// Root layout component that uses our AuthProvider
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <LearningProgressProvider>
          <RootLayoutNav />
        </LearningProgressProvider>
      </AuthProvider>
    </GestureHandlerRootView>
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
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200, // Reduce animation duration
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="splash"
        options={{
          headerShown: false,
          gestureEnabled: false, // Disable gesture on splash
        }} 
      />
      <Stack.Screen
        name="(pre-auth)"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
        redirect={isAuthenticated}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
        redirect={!isAuthenticated}
      />
      <Stack.Screen
        name="(admin)"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
        redirect={!isAuthenticated}
      />
      {/* Individual auth screens */}
      <Stack.Screen
        name="auth/forgot-password"
        options={{
          headerShown: true,
          headerTitle: "Forgot Password",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="auth/login"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="auth/signup"
        options={{
          headerShown: false,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="auth/verification-code"
        options={{
          headerShown: true,
          headerTitle: "Verification",
          gestureEnabled: true,
        }}
      />
      
      {/* Standalone screens */}
      <Stack.Screen name="quiz-interface" options={{ headerShown: false }} />
      <Stack.Screen name="quiz-results" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="error" options={{ headerShown: false }} />
      <Stack.Screen name="maintenance" options={{ headerShown: false }} />
      <Stack.Screen name="feedback" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="terms" options={{ headerShown: false }} />
      <Stack.Screen name="thank-you" options={{ headerShown: false }} />
      <Stack.Screen name="updates" options={{ headerShown: false }} />
    </Stack>
  );
}
