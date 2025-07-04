import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import appwriteService from '../../services/appwrite';

interface Exercise {
  $id: string;
  title: string;
  type: string;
  content: string;
  options?: string[];
  correctAnswer?: string;
  lessonId: string;
  order: number;
  points: number;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  $id: string;
  title: string;
  courseId: string;
}

interface Course {
  $id: string;
  title: string;
}

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({
    title: '',
    type: 'multiple-choice',
    content: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    lessonId: '',
    order: 1,
    points: 10
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadLessonsForCourse(selectedCourse);
    } else {
      setLessons([]);
      setSelectedLesson(null);
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedLesson) {
      loadExercisesForLesson(selectedLesson);
    } else {
      setExercises([]);
    }
  }, [selectedLesson]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const fetchedCourses = await appwriteService.getAllCourses();
      setCourses(fetchedCourses);
      
      if (fetchedCourses.length > 0) {
        setSelectedCourse(fetchedCourses[0].$id);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load courses');
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLessonsForCourse = async (courseId) => {
    try {
      setLoading(true);
      const fetchedLessons = await appwriteService.getLessonsByCourse(courseId);
      setLessons(fetchedLessons);
      
      if (fetchedLessons.length > 0) {
        setSelectedLesson(fetchedLessons[0].$id);
        setNewExercise(prev => ({ ...prev, lessonId: fetchedLessons[0].$id }));
      } else {
        setSelectedLesson(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load lessons');
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExercisesForLesson = async (lessonId) => {
    try {
      setLoading(true);
      const fetchedExercises = await appwriteService.getExercisesByLesson(lessonId);
      setExercises(fetchedExercises);
    } catch (error) {
      Alert.alert('Error', 'Failed to load exercises');
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async () => {
    if (!newExercise.title.trim() || !newExercise.content.trim() || !newExercise.lessonId) {
      Alert.alert('Error', 'Title, content, and lesson are required');
      return;
    }

    if (newExercise.type === 'multiple-choice' && (!newExercise.options || !newExercise.correctAnswer)) {
      Alert.alert('Error', 'Options and correct answer are required for multiple choice exercises');
      return;
    }

    try {
      // Check if createExercise method exists in appwriteService
      if (typeof appwriteService.createExercise !== 'function') {
        Alert.alert('Error', 'Exercise creation functionality not implemented yet');
        return;
      }

      const exerciseData = {
        title: newExercise.title,
        type: newExercise.type,
        content: newExercise.content,
        lessonId: newExercise.lessonId,
        order: newExercise.order,
        points: newExercise.points
      };
      
      // Only include options and correct answer for multiple choice exercises
      if (newExercise.type === 'multiple-choice') {
        exerciseData.options = newExercise.options.filter(option => option.trim() !== '');
        exerciseData.correctAnswer = newExercise.correctAnswer;
      }

      await appwriteService.createExercise(exerciseData);
      
      setNewExercise({
        title: '',
        type: 'multiple-choice',
        content: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        lessonId: selectedLesson || '',
        order: exercises.length + 1,
        points: 10
      });
      
      setIsAddingExercise(false);
      if (selectedLesson) {
        loadExercisesForLesson(selectedLesson);
      }
      Alert.alert('Success', 'Exercise created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create exercise');
      console.error('Error creating exercise:', error);
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Check if deleteExercise method exists in appwriteService
              if (typeof appwriteService.deleteExercise !== 'function') {
                Alert.alert('Error', 'Exercise deletion functionality not implemented yet');
                return;
              }

              await appwriteService.deleteExercise(exerciseId);
              if (selectedLesson) {
                loadExercisesForLesson(selectedLesson);
              }
              Alert.alert('Success', 'Exercise deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete exercise');
              console.error('Error deleting exercise:', error);
            }
          }
        }
      ]
    );
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newExercise.options];
    newOptions[index] = value;
    setNewExercise({...newExercise, options: newOptions});
  };

  const filteredExercises = exercises.filter(exercise => 
    exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && courses.length === 0) {
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
        {/* Course Selector */}
        <View className="bg-white rounded-lg p-2 mb-4 border border-gray-200">
          <Text className="text-gray-700 mb-2 px-2">Select Course</Text>
          {courses.length > 0 ? (
            <Picker
              selectedValue={selectedCourse}
              onValueChange={(itemValue) => setSelectedCourse(itemValue)}
              style={{ height: 50 }}
            >
              {courses.map(course => (
                <Picker.Item key={course.$id} label={course.title} value={course.$id} />
              ))}
            </Picker>
          ) : (
            <View className="p-2">
              <Text className="text-gray-500">No courses available</Text>
            </View>
          )}
        </View>

        {/* Lesson Selector */}
        {selectedCourse && (
          <View className="bg-white rounded-lg p-2 mb-4 border border-gray-200">
            <Text className="text-gray-700 mb-2 px-2">Select Lesson</Text>
            {lessons.length > 0 ? (
              <Picker
                selectedValue={selectedLesson}
                onValueChange={(itemValue) => setSelectedLesson(itemValue)}
                style={{ height: 50 }}
              >
                {lessons.map(lesson => (
                  <Picker.Item key={lesson.$id} label={lesson.title} value={lesson.$id} />
                ))}
              </Picker>
            ) : (
              <View className="p-2">
                <Text className="text-gray-500">No lessons available for this course</Text>
              </View>
            )}
          </View>
        )}

        {/* Search Bar */}
        {selectedLesson && (
          <View className="bg-white rounded-lg px-4 py-2 mb-4 flex-row items-center border border-gray-200">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Search exercises"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Add Exercise Button */}
        {selectedLesson && !isAddingExercise ? (
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-lg flex-row justify-center items-center mb-4"
            onPress={() => {
              setIsAddingExercise(true);
              setNewExercise(prev => ({ 
                ...prev, 
                lessonId: selectedLesson || '',
                order: exercises.length + 1
              }));
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Add New Exercise</Text>
          </TouchableOpacity>
        ) : selectedLesson && isAddingExercise ? (
          <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
            <Text className="text-lg font-bold mb-3">Add New Exercise</Text>
            
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Title</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Exercise title"
                value={newExercise.title}
                onChangeText={(text) => setNewExercise({...newExercise, title: text})}
              />
            </View>
            
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Type</Text>
              <Picker
                selectedValue={newExercise.type}
                onValueChange={(itemValue) => setNewExercise({...newExercise, type: itemValue})}
                style={{ height: 50, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8 }}
              >
                <Picker.Item label="Multiple Choice" value="multiple-choice" />
                <Picker.Item label="Fill in the Blank" value="fill-blank" />
                <Picker.Item label="True/False" value="true-false" />
                <Picker.Item label="Matching" value="matching" />
              </Picker>
            </View>
            
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Content/Question</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Exercise content or question"
                value={newExercise.content}
                onChangeText={(text) => setNewExercise({...newExercise, content: text})}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            
            {newExercise.type === 'multiple-choice' && (
              <>
                <Text className="text-gray-700 mb-2">Options</Text>
                {newExercise.options.map((option, index) => (
                  <View key={index} className="mb-2 flex-row items-center">
                    <TouchableOpacity
                      onPress={() => setNewExercise({...newExercise, correctAnswer: option})}
                      className="mr-2"
                    >
                      <Ionicons
                        name={newExercise.correctAnswer === option ? "radio-button-on" : "radio-button-off"}
                        size={20}
                        color="#3B82F6"
                      />
                    </TouchableOpacity>
                    <TextInput
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChangeText={(text) => handleOptionChange(index, text)}
                    />
                  </View>
                ))}
              </>
            )}
            
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Order</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Exercise order"
                value={String(newExercise.order)}
                onChangeText={(text) => setNewExercise({...newExercise, order: parseInt(text) || 1})}
                keyboardType="numeric"
              />
            </View>
            
            <View className="mb-3">
              <Text className="text-gray-700 mb-1">Points</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Points awarded for correct answer"
                value={String(newExercise.points)}
                onChangeText={(text) => setNewExercise({...newExercise, points: parseInt(text) || 10})}
                keyboardType="numeric"
              />
            </View>
            
            <View className="flex-row justify-end">
              <TouchableOpacity
                className="bg-gray-200 p-2 rounded-lg mr-2"
                onPress={() => setIsAddingExercise(false)}
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 p-2 rounded-lg"
                onPress={handleCreateExercise}
              >
                <Text className="text-white">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Exercises List */}
        {selectedLesson && (
          loading ? (
            <View className="flex-1 justify-center items-center py-10">
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-600 mt-4">Loading exercises...</Text>
            </View>
          ) : filteredExercises.length === 0 ? (
            <View className="bg-white p-4 rounded-lg items-center">
              <Ionicons name="fitness" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 mt-2">
                {searchQuery ? 'No exercises match your search' : 'No exercises available for this lesson'}
              </Text>
            </View>
          ) : (
            filteredExercises.map(exercise => (
              <View key={exercise.$id} className="bg-white p-4 rounded-lg mb-4 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-bold">{exercise.title}</Text>
                  <View className="flex-row">
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => {
                        Alert.alert('Info', 'Edit exercise functionality not implemented yet');
                      }}
                    >
                      <Ionicons name="create-outline" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="p-2"
                      onPress={() => handleDeleteExercise(exercise.$id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View className="flex-row mb-2">
                  <View className="bg-blue-100 rounded-full px-2 py-1 mr-2">
                    <Text className="text-blue-700 text-xs">{exercise.type}</Text>
                  </View>
                  <View className="bg-gray-100 rounded-full px-2 py-1 mr-2">
                    <Text className="text-gray-700 text-xs">Order: {exercise.order}</Text>
                  </View>
                  <View className="bg-green-100 rounded-full px-2 py-1">
                    <Text className="text-green-700 text-xs">{exercise.points} Points</Text>
                  </View>
                </View>
                
                <Text className="text-gray-600 mb-2" numberOfLines={2}>{exercise.content}</Text>
                
                {exercise.options && exercise.options.length > 0 && (
                  <View className="mt-2 pt-2 border-t border-gray-100">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Options:</Text>
                    {exercise.options.map((option, index) => (
                      <View key={index} className="flex-row items-center mb-1">
                        <Ionicons
                          name={exercise.correctAnswer === option ? "checkmark-circle" : "ellipse-outline"}
                          size={16}
                          color={exercise.correctAnswer === option ? "#10B981" : "#9CA3AF"}
                        />
                        <Text className="ml-2 text-gray-600">{option}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )
        )}
      </View>
    </ScrollView>
  );
}