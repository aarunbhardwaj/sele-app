import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import './globals.css'; // Import global styles

// This is a simple auth context setup - in a real app you'd use a proper auth system
export const AuthContext = React.createContext({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

import * as React from "react";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking if user is logged in
    // In a real app, you'd check AsyncStorage, SecureStore, or make an API call
    setTimeout(() => {
      setIsAuthenticated(false); // Initially not authenticated
      setIsLoading(false);
    }, 500);
  }, []);

  const authContext = {
    isAuthenticated,
    login: () => {
      setIsAuthenticated(true);
    },
    logout: () => {
      setIsAuthenticated(false);
    },
  };

  // Show a loading screen while checking authentication
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
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
          name="movies/[id]"
          options={{
            headerShown: false
          }} 
        />
      </Stack>
    </AuthContext.Provider>
  );
}
