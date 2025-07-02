import React, { useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  withTiming, 
  useAnimatedStyle, 
  Easing,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Features data
const features = [
  {
    id: '1',
    title: 'Learn from Native Speakers',
    description: 'Learn authentic British English from qualified native speakers',
    icon: 'people',
    color: '#3B82F6',
  },
  {
    id: '2',
    title: 'Interactive Lessons',
    description: 'Engaging lessons with audio, video, and practice exercises',
    icon: 'play-circle',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'Personalized learning analytics to monitor your improvement',
    icon: 'stats-chart',
    color: '#F59E0B',
  },
  {
    id: '4',
    title: 'Practice Anytime',
    description: 'Flexible learning schedules that fit your busy life',
    icon: 'time',
    color: '#8B5CF6',
  },
];

// Testimonials data
const testimonials = [
  {
    id: '1',
    name: 'Sarah J.',
    country: 'France',
    text: 'This app transformed my English skills! The British accent lessons are exceptional.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Miguel R.',
    country: 'Spain',
    text: 'I improved my business English in just two months. Highly recommend!',
    rating: 5,
  },
  {
    id: '3',
    name: 'Yuki T.',
    country: 'Japan',
    text: 'The pronunciation exercises helped me sound more natural when speaking.',
    rating: 4,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(50);
  const featuresOpacity = useSharedValue(0);
  const testimonialsOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(0.9);
  
  useEffect(() => {
    // Animate hero section
    heroOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    heroTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) });
    
    // Animate features section with delay
    featuresOpacity.value = withDelay(400, 
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    
    // Animate testimonials section with more delay
    testimonialsOpacity.value = withDelay(800, 
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    
    // Animate CTA section with even more delay
    ctaOpacity.value = withDelay(1200, 
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    ctaScale.value = withDelay(1200, 
      withSequence(
        withTiming(1.05, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.quad) })
      )
    );
  }, []);
  
  const heroAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));
  
  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));
  
  const testimonialsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: testimonialsOpacity.value,
  }));
  
  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ scale: ctaScale.value }],
  }));
  
  const handleGetStarted = () => {
    router.push('/(pre-auth)/signup');
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section */}
      <Animated.View 
        style={heroAnimatedStyle} 
        className="min-h-[400px] px-5 pt-20 pb-8 bg-blue-600"
      >
        <View className="items-center mb-6">
          <Image
            source={require('../../assets/images/app-logo.png')}
            className="w-24 h-24 rounded-2xl mb-4"
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold text-white text-center">
            Speak English like{'\n'}The English
          </Text>
          <Text className="text-blue-100 text-center mt-4 text-base">
            Master British English pronunciation, idioms, and fluency with our interactive lessons
          </Text>
          
          <TouchableOpacity 
            className="mt-8 bg-white py-4 px-8 rounded-full flex-row items-center"
            onPress={handleGetStarted}
          >
            <Text className="text-blue-600 font-semibold text-lg mr-2">Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row justify-center mt-6">
          <View className="bg-blue-500 rounded-lg py-1 px-3 mx-1 flex-row items-center">
            <Ionicons name="people" size={14} color="#BFDBFE" />
            <Text className="text-blue-100 text-xs ml-1">50K+ Students</Text>
          </View>
          <View className="bg-blue-500 rounded-lg py-1 px-3 mx-1 flex-row items-center">
            <Ionicons name="star" size={14} color="#BFDBFE" />
            <Text className="text-blue-100 text-xs ml-1">4.8 Rating</Text>
          </View>
          <View className="bg-blue-500 rounded-lg py-1 px-3 mx-1 flex-row items-center">
            <Ionicons name="globe" size={14} color="#BFDBFE" />
            <Text className="text-blue-100 text-xs ml-1">30+ Countries</Text>
          </View>
        </View>
      </Animated.View>
      
      {/* Features Section */}
      <Animated.View style={featuresAnimatedStyle} className="px-5 py-10">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Why Choose Our App?</Text>
        
        <View className="space-y-4">
          {features.map((feature) => (
            <View 
              key={feature.id} 
              className="bg-gray-50 rounded-xl p-5 flex-row"
            >
              <View 
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: feature.color + '20' }}  // 20 is hex for 12% opacity
              >
                <Ionicons name={feature.icon} size={24} color={feature.color} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-semibold text-gray-800 text-lg mb-1">
                  {feature.title}
                </Text>
                <Text className="text-gray-600">
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
      
      {/* Testimonials Section */}
      <Animated.View style={testimonialsAnimatedStyle} className="px-5 py-8 bg-gray-50">
        <Text className="text-2xl font-bold text-gray-800 mb-6">What Our Students Say</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={width - 80}  // Card width + padding
          className="pb-4"
        >
          {testimonials.map((testimonial) => (
            <View 
              key={testimonial.id} 
              className="bg-white rounded-xl p-5 mr-4 shadow-sm"
              style={{ width: width - 80 }}
            >
              <View className="flex-row mb-4">
                {[...Array(5)].map((_, i) => (
                  <Ionicons 
                    key={i}
                    name={i < testimonial.rating ? "star" : "star-outline"} 
                    size={16} 
                    color={i < testimonial.rating ? "#F59E0B" : "#D1D5DB"} 
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              
              <Text className="text-gray-800 mb-3 italic">
                "{testimonial.text}"
              </Text>
              
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-semibold text-gray-800">{testimonial.name}</Text>
                  <Text className="text-gray-600 text-sm">{testimonial.country}</Text>
                </View>
                <Ionicons name="chatbubble" size={20} color="#3B82F6" />
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
      
      {/* CTA Section */}
      <Animated.View style={ctaAnimatedStyle} className="px-5 py-10 items-center">
        <View className="bg-blue-50 rounded-2xl p-6 items-center w-full">
          <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
            Ready to Improve Your English?
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Join thousands of students who are speaking better English
          </Text>
          
          <View className="flex-row">
            <TouchableOpacity 
              className="bg-blue-600 py-3.5 px-6 rounded-lg flex-row items-center mr-3"
              onPress={handleGetStarted}
            >
              <Text className="text-white font-semibold">Sign Up Free</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-white py-3.5 px-6 rounded-lg flex-row items-center border border-gray-300"
              onPress={() => router.push('/(pre-auth)/welcome')}
            >
              <Text className="text-gray-700 font-semibold">Explore Courses</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="mt-10 mb-5">
          <Text className="text-gray-400 text-center text-sm">© 2025 English Learning App</Text>
          <View className="flex-row justify-center mt-3">
            <TouchableOpacity className="mx-2">
              <Ionicons name="logo-twitter" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity className="mx-2">
              <Ionicons name="logo-instagram" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity className="mx-2">
              <Ionicons name="logo-facebook" size={20} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity className="mx-2">
              <Ionicons name="logo-youtube" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}