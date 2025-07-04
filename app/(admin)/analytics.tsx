import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, Text, View } from 'react-native';
import appwriteService from '../../services/appwrite';

// Import a chart library if needed
// import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalLessons: number;
  totalExercises: number;
  usersByLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  completionRate: number;
  averageScore: number;
  mostPopularCourse: string;
  mostActiveUser: string;
}

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalExercises: 0,
    usersByLevel: {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
    },
    completionRate: 0,
    averageScore: 0,
    mostPopularCourse: '',
    mostActiveUser: '',
  });

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // In a real app, you would have a dedicated analytics endpoint
      // For now, we'll mock the data by fetching various collections
      
      // Get users
      const users = await appwriteService.getAllUsers();
      const totalUsers = users.length;
      
      // Get active users (users who have been active in the last 7 days)
      // This is a mock calculation since we don't have real activity timestamps
      const activeUsers = Math.floor(totalUsers * 0.6);
      
      // Get courses
      const courses = await appwriteService.getAllCourses();
      const totalCourses = courses.length;
      
      // Mock data for levels
      const usersByLevel = {
        beginner: Math.floor(totalUsers * 0.5),
        intermediate: Math.floor(totalUsers * 0.3),
        advanced: Math.floor(totalUsers * 0.2),
      };
      
      // Mock other data
      const totalLessons = totalCourses * 5; // Assume 5 lessons per course
      const totalExercises = totalLessons * 3; // Assume 3 exercises per lesson
      const completionRate = 68; // 68%
      const averageScore = 72; // 72/100
      
      // Most popular course
      const mostPopularCourse = courses.length > 0 ? courses[0].title : 'None';
      
      // Most active user
      const mostActiveUser = users.length > 0 ? users[0].displayName || 'Unknown' : 'None';
      
      setAnalyticsData({
        totalUsers,
        activeUsers,
        totalCourses,
        totalLessons,
        totalExercises,
        usersByLevel,
        completionRate,
        averageScore,
        mostPopularCourse,
        mostActiveUser,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="mb-6">
          <Text className="text-xl font-bold mb-2">Dashboard Overview</Text>
          <Text className="text-gray-600">Summary of platform statistics and performance</Text>
        </View>
        
        {/* Key Metrics */}
        <View className="flex-row flex-wrap justify-between mb-6">
          {/* Total Users */}
          <View className="bg-white p-4 rounded-xl shadow-sm mb-4" style={{ width: '48%' }}>
            <View className="flex-row justify-between items-center mb-2">
              <Ionicons name="people" size={24} color="#3B82F6" />
              <Text className="text-blue-500 text-xs">Total</Text>
            </View>
            <Text className="text-2xl font-bold">{analyticsData.totalUsers}</Text>
            <Text className="text-gray-600">Users</Text>
          </View>
          
          {/* Active Users */}
          <View className="bg-white p-4 rounded-xl shadow-sm mb-4" style={{ width: '48%' }}>
            <View className="flex-row justify-between items-center mb-2">
              <Ionicons name="people-circle" size={24} color="#10B981" />
              <Text className="text-green-500 text-xs">Active</Text>
            </View>
            <Text className="text-2xl font-bold">{analyticsData.activeUsers}</Text>
            <Text className="text-gray-600">Active Users</Text>
          </View>
          
          {/* Total Courses */}
          <View className="bg-white p-4 rounded-xl shadow-sm mb-4" style={{ width: '48%' }}>
            <View className="flex-row justify-between items-center mb-2">
              <Ionicons name="book" size={24} color="#8B5CF6" />
              <Text className="text-purple-500 text-xs">Total</Text>
            </View>
            <Text className="text-2xl font-bold">{analyticsData.totalCourses}</Text>
            <Text className="text-gray-600">Courses</Text>
          </View>
          
          {/* Completion Rate */}
          <View className="bg-white p-4 rounded-xl shadow-sm mb-4" style={{ width: '48%' }}>
            <View className="flex-row justify-between items-center mb-2">
              <Ionicons name="checkmark-circle" size={24} color="#F59E0B" />
              <Text className="text-amber-500 text-xs">Rate</Text>
            </View>
            <Text className="text-2xl font-bold">{analyticsData.completionRate}%</Text>
            <Text className="text-gray-600">Completion Rate</Text>
          </View>
        </View>
        
        {/* User Levels Distribution */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-bold mb-4">User Levels Distribution</Text>
          <View className="mb-4">
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-700">Beginner</Text>
              <Text className="text-gray-700">{analyticsData.usersByLevel.beginner} users</Text>
            </View>
            <View className="bg-gray-200 rounded-full h-2.5">
              <View 
                className="bg-green-500 rounded-full h-2.5" 
                style={{ width: `${(analyticsData.usersByLevel.beginner / analyticsData.totalUsers) * 100}%` }} 
              />
            </View>
          </View>
          <View className="mb-4">
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-700">Intermediate</Text>
              <Text className="text-gray-700">{analyticsData.usersByLevel.intermediate} users</Text>
            </View>
            <View className="bg-gray-200 rounded-full h-2.5">
              <View 
                className="bg-blue-500 rounded-full h-2.5" 
                style={{ width: `${(analyticsData.usersByLevel.intermediate / analyticsData.totalUsers) * 100}%` }} 
              />
            </View>
          </View>
          <View className="mb-2">
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-700">Advanced</Text>
              <Text className="text-gray-700">{analyticsData.usersByLevel.advanced} users</Text>
            </View>
            <View className="bg-gray-200 rounded-full h-2.5">
              <View 
                className="bg-purple-500 rounded-full h-2.5" 
                style={{ width: `${(analyticsData.usersByLevel.advanced / analyticsData.totalUsers) * 100}%` }} 
              />
            </View>
          </View>
        </View>
        
        {/* Content Statistics */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-bold mb-4">Content Statistics</Text>
          <View className="flex-row justify-between items-center mb-4">
            <View className="items-center">
              <Text className="text-3xl font-bold text-blue-500">{analyticsData.totalCourses}</Text>
              <Text className="text-gray-600 mt-1">Courses</Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-green-500">{analyticsData.totalLessons}</Text>
              <Text className="text-gray-600 mt-1">Lessons</Text>
            </View>
            <View className="items-center">
              <Text className="text-3xl font-bold text-purple-500">{analyticsData.totalExercises}</Text>
              <Text className="text-gray-600 mt-1">Exercises</Text>
            </View>
          </View>
        </View>
        
        {/* Performance Metrics */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-bold mb-4">Performance Metrics</Text>
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-700">Average Score</Text>
              <Text className="font-bold">{analyticsData.averageScore}/100</Text>
            </View>
            <View className="bg-gray-200 rounded-full h-2.5">
              <View 
                className="bg-blue-500 rounded-full h-2.5" 
                style={{ width: `${analyticsData.averageScore}%` }} 
              />
            </View>
          </View>
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-700">Course Completion</Text>
              <Text className="font-bold">{analyticsData.completionRate}%</Text>
            </View>
            <View className="bg-gray-200 rounded-full h-2.5">
              <View 
                className="bg-green-500 rounded-full h-2.5" 
                style={{ width: `${analyticsData.completionRate}%` }} 
              />
            </View>
          </View>
        </View>
        
        {/* Top Performers */}
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-bold mb-4">Top Performers</Text>
          <View className="mb-3">
            <Text className="text-gray-700">Most Popular Course</Text>
            <Text className="font-bold text-lg">{analyticsData.mostPopularCourse}</Text>
          </View>
          <View>
            <Text className="text-gray-700">Most Active User</Text>
            <Text className="font-bold text-lg">{analyticsData.mostActiveUser}</Text>
          </View>
        </View>

        {/* Here you would add charts using a chart library */}
        {/* 
        <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-bold mb-4">User Activity</Text>
          <LineChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                data: [20, 45, 28, 80, 99, 43]
              }]
            }}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
        </View>
        */}
      </View>
    </ScrollView>
  );
}