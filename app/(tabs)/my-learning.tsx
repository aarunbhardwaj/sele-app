import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Mock data for in-progress courses
const inProgressCourses = [
  {
    id: '1',
    title: 'British Pronunciation Basics',
    progress: 45,
    lastLesson: 'Vowel Sounds',
    image: require('../../assets/images/app-logo.png'),
    nextLessonIn: '2 days'
  },
  {
    id: '2',
    title: 'Advanced Conversational English',
    progress: 23,
    lastLesson: 'Small Talk Techniques',
    image: require('../../assets/images/app-logo.png'),
    nextLessonIn: '3 days'
  }
];

// Mock data for upcoming lessons
const upcomingLessons = [
  {
    id: '1',
    title: 'Live: Pronunciation Workshop',
    time: 'Tomorrow, 3:00 PM',
    duration: '45 min',
    tutor: 'Sarah Johnson'
  },
  {
    id: '2',
    title: 'Group Practice: Conversation',
    time: 'Friday, 6:00 PM',
    duration: '60 min',
    tutor: 'James Smith'
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

export default function MyLearningScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('progress');
  
  const renderCourseItem = ({ item }) => (
    <TouchableOpacity className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden">
      <View className="flex-row">
        <Image 
          source={item.image} 
          className="w-24 h-24" 
          resizeMode="cover" 
        />
        <View className="p-3 flex-1">
          <Text className="font-semibold text-base mb-1">{item.title}</Text>
          <Text className="text-gray-600 text-xs mb-2">Last: {item.lastLesson}</Text>
          <ProgressBar progress={item.progress} />
          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-xs text-gray-500">{item.progress}% complete</Text>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text className="text-xs text-gray-500 ml-1">Next: {item.nextLessonIn}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  const renderLessonItem = ({ item }) => (
    <TouchableOpacity className="bg-white rounded-xl shadow-sm mb-4 p-4">
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="font-semibold text-base mb-1">{item.title}</Text>
          <Text className="text-gray-600 text-xs mb-1">Tutor: {item.tutor}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="time-outline" size={12} color="#6B7280" />
            <Text className="text-xs text-gray-500 ml-1">{item.time} • {item.duration}</Text>
          </View>
        </View>
        <TouchableOpacity 
          className="bg-blue-500 py-1.5 px-3 rounded-lg"
        >
          <Text className="text-white text-xs font-medium">Join</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="pt-14 px-5 pb-8">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold">My Learning</Text>
          <Text className="text-gray-600 mt-1">
            Track your progress and upcoming lessons
          </Text>
        </View>

        {/* Daily Goal */}
        <View className="bg-blue-600 rounded-xl p-4 mb-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-blue-100 text-xs mb-1">DAILY GOAL</Text>
              <Text className="text-white text-lg font-semibold mb-1">25 minutes today</Text>
              <ProgressBar progress={70} />
            </View>
            <View className="bg-white h-14 w-14 rounded-full items-center justify-center">
              <Text className="text-blue-600 font-bold">70%</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row mb-6 border-b border-gray-200">
          <TouchableOpacity 
            className={`pb-3 px-4 ${activeTab === 'progress' ? 'border-b-2 border-blue-600' : ''}`}
            onPress={() => setActiveTab('progress')}
          >
            <Text className={`font-medium ${activeTab === 'progress' ? 'text-blue-600' : 'text-gray-600'}`}>In Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`pb-3 px-4 ${activeTab === 'upcoming' ? 'border-b-2 border-blue-600' : ''}`}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text className={`font-medium ${activeTab === 'upcoming' ? 'text-blue-600' : 'text-gray-600'}`}>Upcoming Lessons</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`pb-3 px-4 ${activeTab === 'completed' ? 'border-b-2 border-blue-600' : ''}`}
            onPress={() => setActiveTab('completed')}
          >
            <Text className={`font-medium ${activeTab === 'completed' ? 'text-blue-600' : 'text-gray-600'}`}>Completed</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'progress' && (
          <FlatList
            data={inProgressCourses}
            renderItem={renderCourseItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
        
        {activeTab === 'upcoming' && (
          <FlatList
            data={upcomingLessons}
            renderItem={renderLessonItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        )}
        
        {activeTab === 'completed' && (
          <View className="items-center justify-center py-10">
            <Ionicons name="trophy" size={64} color="#D1D5DB" />
            <Text className="text-gray-400 text-center mt-3">
              You haven't completed any courses yet.
            </Text>
            <TouchableOpacity className="mt-4 bg-blue-600 py-2.5 px-5 rounded-lg">
              <Text className="text-white">Browse Courses</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}