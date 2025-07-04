import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import appwriteService from '../../services/appwrite';
import { useAuth } from '../../services/AuthContext';

interface Course {
  $id: string;
  title: string;
  description: string;
  level: string;
  isPublished: boolean;
  duration: string;
  createdAt: string;
  updatedAt: string;
}

export default function CoursesScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    level: 'beginner',
    duration: '4 weeks'
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const fetchedCourses = await appwriteService.getAllCourses();
      setCourses(fetchedCourses);
    } catch (error) {
      Alert.alert('Error', 'Failed to load courses');
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      Alert.alert('Error', 'Title and description are required');
      return;
    }

    try {
      // Check if createCourse method exists in appwriteService
      if (typeof appwriteService.createCourse !== 'function') {
        Alert.alert('Error', 'Course creation functionality not implemented yet');
        return;
      }

      await appwriteService.createCourse({
        title: newCourse.title,
        description: newCourse.description,
        level: newCourse.level,
        duration: newCourse.duration,
        isPublished: false
      });
      
      setNewCourse({
        title: '',
        description: '',
        level: 'beginner',
        duration: '4 weeks'
      });
      
      setIsAddingCourse(false);
      loadCourses();
      Alert.alert('Success', 'Course created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create course');
      console.error('Error creating course:', error);
    }
  };

  const togglePublishStatus = async (courseId, isCurrentlyPublished) => {
    try {
      // Check if updateCourse method exists in appwriteService
      if (typeof appwriteService.updateCourse !== 'function') {
        Alert.alert('Error', 'Course update functionality not implemented yet');
        return;
      }

      await appwriteService.updateCourse(courseId, {
        isPublished: !isCurrentlyPublished
      });
      
      loadCourses();
      Alert.alert('Success', `Course ${isCurrentlyPublished ? 'unpublished' : 'published'} successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update course');
      console.error('Error updating course:', error);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    Alert.alert(
      'Delete Course',
      'Are you sure you want to delete this course? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Check if deleteCourse method exists in appwriteService
              if (typeof appwriteService.deleteCourse !== 'function') {
                Alert.alert('Error', 'Course deletion functionality not implemented yet');
                return;
              }

              await appwriteService.deleteCourse(courseId);
              loadCourses();
              Alert.alert('Success', 'Course deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete course');
              console.error('Error deleting course:', error);
            }
          }
        }
      ]
    );
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">Loading courses...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Search Bar */}
        <View className="bg-white rounded-lg px-4 py-2 mb-4 flex-row items-center border border-gray-200">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search courses"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Add Course Button */}
        {!isAddingCourse ? (
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-lg flex-row justify-center items-center mb-4"
            onPress={() => setIsAddingCourse(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Add New Course</Text>
          </TouchableOpacity>
        ) : (
          <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
            <Text className="text-lg font-bold mb-3">Add New Course</Text>
            
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Title</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Course title"
                value={newCourse.title}
                onChangeText={(text) => setNewCourse({...newCourse, title: text})}
              />
            </View>
            
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Description</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Course description"
                value={newCourse.description}
                onChangeText={(text) => setNewCourse({...newCourse, description: text})}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Level</Text>
              <View className="flex-row flex-wrap">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <TouchableOpacity
                    key={level}
                    className={`m-1 px-3 py-1 rounded-full ${
                      newCourse.level === level
                        ? 'bg-blue-100'
                        : 'bg-gray-100'
                    }`}
                    onPress={() => setNewCourse({...newCourse, level})}
                  >
                    <Text
                      className={
                        newCourse.level === level
                          ? 'text-blue-700'
                          : 'text-gray-700'
                      }
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Duration</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Course duration (e.g., 4 weeks)"
                value={newCourse.duration}
                onChangeText={(text) => setNewCourse({...newCourse, duration: text})}
              />
            </View>
            
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="bg-gray-200 p-2 rounded-lg mr-2"
                onPress={() => setIsAddingCourse(false)}
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 p-2 rounded-lg"
                onPress={handleCreateCourse}
              >
                <Text className="text-white">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Courses List */}
        {filteredCourses.length === 0 && !loading ? (
          <View className="bg-white p-4 rounded-lg items-center">
            <Ionicons name="book" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-2">
              {searchQuery ? 'No courses match your search' : 'No courses available'}
            </Text>
          </View>
        ) : (
          filteredCourses.map(course => (
            <View key={course.$id} className="bg-white p-4 rounded-lg mb-4 shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold">{course.title}</Text>
                <View className="flex-row">
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => togglePublishStatus(course.$id, course.isPublished)}
                  >
                    <Ionicons 
                      name={course.isPublished ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={course.isPublished ? "#3B82F6" : "#9CA3AF"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => handleDeleteCourse(course.$id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View className="flex-row mb-2">
                <View className="bg-blue-100 rounded-full px-2 py-1 mr-2">
                  <Text className="text-blue-700 text-xs">{course.level.charAt(0).toUpperCase() + course.level.slice(1)}</Text>
                </View>
                <View className="bg-gray-100 rounded-full px-2 py-1 mr-2">
                  <Text className="text-gray-700 text-xs">{course.duration}</Text>
                </View>
                <View className={`rounded-full px-2 py-1 ${course.isPublished ? 'bg-green-100' : 'bg-amber-100'}`}>
                  <Text className={course.isPublished ? 'text-green-700 text-xs' : 'text-amber-700 text-xs'}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </Text>
                </View>
              </View>
              
              <Text className="text-gray-600 mb-2">{course.description}</Text>
              
              <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-100">
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => {
                    Alert.alert('Info', 'View lessons functionality not implemented yet');
                  }}
                >
                  <Ionicons name="list" size={16} color="#3B82F6" />
                  <Text className="text-blue-600 ml-1">View Lessons</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-row items-center"
                  onPress={() => {
                    Alert.alert('Info', 'Edit course functionality not implemented yet');
                  }}
                >
                  <Ionicons name="create-outline" size={16} color="#3B82F6" />
                  <Text className="text-blue-600 ml-1">Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}