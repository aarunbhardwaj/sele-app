import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Mock data for enrolled courses
const enrolledCourses = [
  {
    id: '1',
    title: 'British Pronunciation Basics',
    level: 'Beginner',
    progress: 45,
    instructor: 'Emma Thompson',
    totalLessons: 12,
    completedLessons: 5,
    image: require('../../assets/images/app-logo.png'),
  },
  {
    id: '2',
    title: 'Advanced Conversational English',
    level: 'Intermediate',
    progress: 23,
    instructor: 'James Wilson',
    totalLessons: 15,
    completedLessons: 3,
    image: require('../../assets/images/app-logo.png'),
  },
  {
    id: '3',
    title: 'Business English & Idioms',
    level: 'Advanced',
    progress: 78,
    instructor: 'Robert Clark',
    totalLessons: 10,
    completedLessons: 7,
    image: require('../../assets/images/app-logo.png'),
  }
];

const ProgressBar = ({ progress }) => (
  <View className="w-full h-2 bg-gray-200 rounded-full mt-2">
    <View 
      className="h-2 bg-blue-500 rounded-full" 
      style={{ width: `${progress}%` }} 
    />
  </View>
);

export default function EnrolledCoursesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter courses based on search query and active filter
  const filteredCourses = enrolledCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'inProgress') return matchesSearch && (course.progress > 0 && course.progress < 100);
    if (activeFilter === 'notStarted') return matchesSearch && course.progress === 0;
    if (activeFilter === 'completed') return matchesSearch && course.progress === 100;
    
    return matchesSearch;
  });

  const renderCourseItem = ({ item }) => (
    <TouchableOpacity 
      className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
      onPress={() => router.push(`/courses/${item.id}`)}
    >
      <Image 
        source={item.image} 
        className="w-full h-36" 
        resizeMode="cover" 
      />
      <View className="p-4">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-blue-600 font-medium">{item.level}</Text>
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={14} color="#6B7280" />
            <Text className="text-gray-500 ml-1 text-xs">{item.instructor}</Text>
          </View>
        </View>
        
        <Text className="text-lg font-semibold mb-2">{item.title}</Text>
        
        <ProgressBar progress={item.progress} />
        
        <View className="flex-row justify-between items-center mt-2">
          <Text className="text-xs text-gray-500">{item.progress}% complete</Text>
          <Text className="text-xs text-gray-500">
            {item.completedLessons}/{item.totalLessons} lessons
          </Text>
        </View>
        
        <TouchableOpacity 
          className="bg-blue-600 py-2 rounded-lg items-center mt-3"
        >
          <Text className="text-white font-medium">Continue Learning</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="pt-14 px-5 pb-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold">My Enrolled Courses</Text>
          <Text className="text-gray-600 mt-1">
            Continue where you left off
          </Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white rounded-lg px-4 py-2.5 mb-6 border border-gray-200">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-800"
            placeholder="Search your courses"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-6"
        >
          <TouchableOpacity 
            className={`py-2 px-4 rounded-full mr-3 ${activeFilter === 'all' ? 'bg-blue-600' : 'bg-gray-200'}`}
            onPress={() => setActiveFilter('all')}
          >
            <Text className={`${activeFilter === 'all' ? 'text-white' : 'text-gray-800'}`}>
              All Courses
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`py-2 px-4 rounded-full mr-3 ${activeFilter === 'inProgress' ? 'bg-blue-600' : 'bg-gray-200'}`}
            onPress={() => setActiveFilter('inProgress')}
          >
            <Text className={`${activeFilter === 'inProgress' ? 'text-white' : 'text-gray-800'}`}>
              In Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`py-2 px-4 rounded-full mr-3 ${activeFilter === 'notStarted' ? 'bg-blue-600' : 'bg-gray-200'}`}
            onPress={() => setActiveFilter('notStarted')}
          >
            <Text className={`${activeFilter === 'notStarted' ? 'text-white' : 'text-gray-800'}`}>
              Not Started
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`py-2 px-4 rounded-full mr-3 ${activeFilter === 'completed' ? 'bg-blue-600' : 'bg-gray-200'}`}
            onPress={() => setActiveFilter('completed')}
          >
            <Text className={`${activeFilter === 'completed' ? 'text-white' : 'text-gray-800'}`}>
              Completed
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Courses List */}
        {filteredCourses.length > 0 ? (
          <FlatList
            data={filteredCourses}
            renderItem={renderCourseItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View className="items-center justify-center py-10">
            <Ionicons name="search" size={64} color="#D1D5DB" />
            <Text className="text-gray-400 text-center mt-3">
              No courses matching your search.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}