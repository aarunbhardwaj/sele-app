import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useAuth } from '../services/AuthContext';

export default function SplashScreen() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const hasNavigated = useRef(false); // Prevent multiple navigations

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    // Start animation immediately
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });
    scale.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });

    // Handle navigation with proper cleanup
    const timer = setTimeout(() => {
      if (!hasNavigated.current && !isLoading) {
        hasNavigated.current = true;

        // Use requestAnimationFrame for smooth navigation
        requestAnimationFrame(() => {
          try {
            if (isAuthenticated) {
              router.replace('/(tabs)');
            } else {
              router.replace('/(pre-auth)');
            }
          } catch (error) {
            console.warn('Splash navigation error:', error);
            // Fallback navigation
            setTimeout(() => {
              if (!hasNavigated.current) {
                hasNavigated.current = true;
                router.replace('/(pre-auth)');
              }
            }, 100);
          }
        });
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, isAuthenticated, router]);

  // Reset navigation flag when auth state changes
  useEffect(() => {
    hasNavigated.current = false;
  }, [isAuthenticated]);

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Animated.View style={logoAnimatedStyle} className="items-center">
        <Image
          source={require('../assets/images/app-logo.png')}
          className="w-60 h-60"
          resizeMode="contain"
        />
        <Text className="mt-6 text-2xl font-bold text-blue-600">
          Speak English like The English
        </Text>
      </Animated.View>
    </View>
  );
}