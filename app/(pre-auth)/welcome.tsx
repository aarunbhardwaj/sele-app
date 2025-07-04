import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const courses = [
  {
    id: '1',
    title: 'British Pronunciation Basics',
    level: 'Beginner',
    lessons: 12,
    duration: '3 weeks',
    image: require('../../assets/images/app-logo.png')
  },
  {
    id: '2',
    title: 'Advanced Conversational English',
    level: 'Intermediate',
    lessons: 15,
    duration: '4 weeks',
    image: require('../../assets/images/app-logo.png')
  },
  {
    id: '3',
    title: 'Business English & Idioms',
    level: 'Advanced',
    lessons: 10,
    duration: '3 weeks',
    image: require('../../assets/images/app-logo.png')
  },
  {
    id: '4',
    title: 'Master British Slang',
    level: 'Intermediate',
    lessons: 8,
    duration: '2 weeks',
    image: require('../../assets/images/app-logo.png')
  }
];

const CourseCard = ({ course }) => (
  <TouchableOpacity 
    className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
    style={{ elevation: 2 }}
  >
    <Image 
      source={course.image} 
      className="w-full h-36" 
      resizeMode="cover" 
    />
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-blue-600 font-medium">{course.level}</Text>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#6B7280" />
          <Text className="text-gray-500 ml-1 text-xs">{course.duration}</Text>
        </View>
      </View>
      <Text className="text-lg font-semibold mb-1">{course.title}</Text>
      <View className="flex-row items-center">
        <Ionicons name="book-outline" size={14} color="#6B7280" />
        <Text className="text-gray-500 ml-1 text-xs">{course.lessons} Lessons</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function WelcomePage() {
  const router = useRouter();
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate header
    headerOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // Animate content with slight delay
    contentOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      delay: 300,
    });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: (1 - headerOpacity.value) * -20 }],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: (1 - contentOpacity.value) * 20 }],
    };
  });

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pt-12 px-5 pb-8">
          {/* Header */}
          <Animated.View style={headerAnimatedStyle} className="mb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Image 
                source={require('../../assets/images/app-logo.png')}
                className="w-10 h-10"
                resizeMode="contain"
              />
              <TouchableOpacity>
                <Ionicons name="search-outline" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            <Text className="text-3xl font-bold">Welcome to English Learning</Text>
            <Text className="text-gray-600 mt-2">
              Explore our courses and start your journey to speaking like a native
            </Text>
          </Animated.View>

          {/* Content */}
          <Animated.View style={contentAnimatedStyle}>
            {/* Featured Course */}
            <View className="bg-blue-600 rounded-xl p-5 mb-6">
              <View className="mb-3">
                <Text className="text-white text-xs font-medium mb-1">FEATURED COURSE</Text>
                <Text className="text-white text-xl font-bold mb-1">Complete British English</Text>
                <Text className="text-blue-100">Master pronunciation, vocabulary and more</Text>
              </View>
              <TouchableOpacity className="bg-white py-2.5 px-5 rounded-lg self-start">
                <Text className="text-blue-600 font-medium">Start Now</Text>
              </TouchableOpacity>
            </View>

            {/* Course Categories */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold">Categories</Text>
                <TouchableOpacity>
                  <Text className="text-blue-600">See All</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                <TouchableOpacity className="bg-blue-600 py-2 px-4 rounded-full mr-3">
                  <Text className="text-white">All Courses</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-200 py-2 px-4 rounded-full mr-3">
                  <Text className="text-gray-800">Pronunciation</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-200 py-2 px-4 rounded-full mr-3">
                  <Text className="text-gray-800">Grammar</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-200 py-2 px-4 rounded-full mr-3">
                  <Text className="text-gray-800">Vocabulary</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-gray-200 py-2 px-4 rounded-full">
                  <Text className="text-gray-800">Idioms</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Popular Courses */}
            <View>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-semibold">Popular Courses</Text>
                <TouchableOpacity>
                  <Text className="text-blue-600">See All</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={courses}
                renderItem={({ item }) => <CourseCard course={item} />}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}