import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle, 
  Easing,
} from 'react-native-reanimated';

export default function SplashScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  // Animation styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    // Start animations
    opacity.value = withTiming(1, { 
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
    
    scale.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 1, 0.5, 1)
    });

    // Navigate to pre-auth home screen after splash duration
    const timer = setTimeout(() => {
      router.replace('/(pre-auth)');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

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