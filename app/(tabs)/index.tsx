import { useEffect } from 'react';
import { Text, View, Pressable, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle, 
  Easing,
  withSpring 
} from 'react-native-reanimated';

export default function WelcomeScreen() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const logoPosition = useSharedValue(-100);

  // Animation styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { translateY: logoPosition.value }
      ],
    };
  });

  useEffect(() => {
    // Animate logo fading in and scaling up
    opacity.value = withTiming(1, { 
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
    
    scale.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 1, 0.5, 1)
    });
    
    // Animate logo moving up from below
    logoPosition.value = withSpring(0, {
      damping: 12,
      stiffness: 90
    });
  }, []);

  const handleGetStarted = () => {
    router.push('/auth/signup');
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="min-h-screen items-center pt-16 px-6">
        <Animated.View style={logoAnimatedStyle} className="items-center">
          <Image 
            source={require('../../assets/images/app-logo.png')}
            className="w-40 h-40 rounded-2xl"
            resizeMode="contain"
          />
          
          <Text className="mt-8 text-2xl font-bold text-blue-600 text-center">
            Speak English like The English
          </Text>
          
          <Text className="mt-4 text-gray-600 text-base text-center">
            Master English pronunciation, idioms, and fluency with our interactive lessons
          </Text>
          
          <View className="w-full my-12">
            <View className="bg-blue-50 rounded-xl p-5 mb-4">
              <Text className="font-semibold text-blue-800 mb-1">Interactive Lessons</Text>
              <Text className="text-gray-700">Learn with audio, video, and practice exercises</Text>
            </View>
            
            <View className="bg-blue-50 rounded-xl p-5 mb-4">
              <Text className="font-semibold text-blue-800 mb-1">Native Speakers</Text>
              <Text className="text-gray-700">Learn from real British English speakers</Text>
            </View>
            
            <View className="bg-blue-50 rounded-xl p-5">
              <Text className="font-semibold text-blue-800 mb-1">Track Progress</Text>
              <Text className="text-gray-700">Monitor your improvement with detailed analytics</Text>
            </View>
          </View>

          <Pressable 
            className="mt-4 bg-blue-600 py-4 px-12 rounded-full w-full items-center"
            onPress={handleGetStarted}
          >
            <Text className="text-white font-semibold text-lg">Get Started</Text>
          </Pressable>
          
          <Text className="mt-6 text-gray-500 text-sm">
            Start your journey to fluent British English today
          </Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}