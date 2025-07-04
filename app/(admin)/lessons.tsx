import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import appwriteService from '../../services/appwrite';

interface Lesson {
  $id: string;
  title: string;
  courseId: string;
  content: string;
  order: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

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

interface Course {
  $id: string;
  title: string;
}

export default function ContentManagementScreen() {
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' or 'exercises'
  
  // Lessons state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState<string | null>(null);
  const [searchLessonQuery, setSearchLessonQuery] = useState('');
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    courseId: '',
    order: 1,
    status: 'draft'
  });

  // Exercises state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCourseForExercise, setSelectedCourseForExercise] = useState<string | null>(null);
  const [lessonsByExerciseCourse, setLessonsByExerciseCourse] = useState<Lesson[]>([]);
  const [selectedLessonForExercise, setSelectedLessonForExercise] = useState<string | null>(null);
  const [searchExerciseQuery, setSearchExerciseQuery] = useState('');
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
  
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadCourses();
  }, []);

  // Load lessons when a course is selected in the lessons tab
  useEffect(() => {
    if (selectedCourseForLesson) {
      loadLessonsForCourse(selectedCourseForLesson);
    }
  }, [selectedCourseForLesson]);

  // Load lessons when a course is selected in the exercises tab
  useEffect(() => {
    if (selectedCourseForExercise) {
      loadLessonsByExerciseCourse(selectedCourseForExercise);
    }
  }, [selectedCourseForExercise]);

  // Load exercises when a lesson is selected
  useEffect(() => {
    if (selectedLessonForExercise) {
      loadExercisesForLesson(selectedLessonForExercise);
    }
  }, [selectedLessonForExercise]);

  // Load all courses
  const loadCourses = async () => {
    try {
      setLoading(true);
      const fetchedCourses = await appwriteService.getAllCourses();
      setCourses(fetchedCourses);
      
      if (fetchedCourses.length > 0) {
        setSelectedCourseForLesson(fetchedCourses[0].$id);
        setSelectedCourseForExercise(fetchedCourses[0].$id);
        setNewLesson(prev => ({ ...prev, courseId: fetchedCourses[0].$id }));
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      Alert.alert('Error', 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Load lessons for a specific course in the lessons tab
  const loadLessonsForCourse = async (courseId) => {
    try {
      setLoading(true);
      const fetchedLessons = await appwriteService.getLessonsByCourse(courseId);
      setLessons(fetchedLessons);
    } catch (error) {
      console.error('Error loading lessons:', error);
      Alert.alert('Error', 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  // Load lessons for a specific course in the exercises tab
  const loadLessonsByExerciseCourse = async (courseId) => {
    try {
      setLoading(true);
      const fetchedLessons = await appwriteService.getLessonsByCourse(courseId);
      setLessonsByExerciseCourse(fetchedLessons);
      
      if (fetchedLessons.length > 0) {
        setSelectedLessonForExercise(fetchedLessons[0].$id);
        setNewExercise(prev => ({ ...prev, lessonId: fetchedLessons[0].$id }));
      } else {
        setSelectedLessonForExercise(null);
        setExercises([]);
      }
    } catch (error) {
      console.error('Error loading lessons for exercises:', error);
      Alert.alert('Error', 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  // Load exercises for a specific lesson
  const loadExercisesForLesson = async (lessonId) => {
    try {
      setLoading(true);
      const fetchedExercises = await appwriteService.getExercisesByLesson(lessonId);
      setExercises(fetchedExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert('Error', 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  // Create a new lesson
  const handleCreateLesson = async () => {
    if (!newLesson.title.trim() || !newLesson.content.trim() || !newLesson.courseId) {
      Alert.alert('Error', 'Title, content, and course are required');
      return;
    }

    try {
      await appwriteService.createLesson({
        title: newLesson.title,
        content: newLesson.content,
        courseId: newLesson.courseId,
        order: newLesson.order,
        status: newLesson.status
      });
      
      setNewLesson({
        title: '',
        content: '',
        courseId: selectedCourseForLesson || '',
        order: lessons.length + 1,
        status: 'draft'
      });
      
      setIsAddingLesson(false);
      if (selectedCourseForLesson) {
        loadLessonsForCourse(selectedCourseForLesson);
      }
      Alert.alert('Success', 'Lesson created successfully');
    } catch (error) {
      console.error('Error creating lesson:', error);
      Alert.alert('Error', 'Failed to create lesson');
    }
  };

  // Delete a lesson
  const handleDeleteLesson = async (lessonId) => {
    Alert.alert(
      'Delete Lesson',
      'Are you sure you want to delete this lesson? This will also delete all exercises in this lesson.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await appwriteService.deleteLesson(lessonId);
              if (selectedCourseForLesson) {
                loadLessonsForCourse(selectedCourseForLesson);
              }
              Alert.alert('Success', 'Lesson deleted successfully');
            } catch (error) {
              console.error('Error deleting lesson:', error);
              Alert.alert('Error', 'Failed to delete lesson');
            }
          }
        }
      ]
    );
  };

  // Create a new exercise
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
        lessonId: selectedLessonForExercise || '',
        order: exercises.length + 1,
        points: 10
      });
      
      setIsAddingExercise(false);
      if (selectedLessonForExercise) {
        loadExercisesForLesson(selectedLessonForExercise);
      }
      Alert.alert('Success', 'Exercise created successfully');
    } catch (error) {
      console.error('Error creating exercise:', error);
      Alert.alert('Error', 'Failed to create exercise');
    }
  };

  // Delete an exercise
  const handleDeleteExercise = async (exerciseId) => {
    Alert.alert(
      'Delete Exercise',
      'Are you sure you want to delete this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await appwriteService.deleteExercise(exerciseId);
              if (selectedLessonForExercise) {
                loadExercisesForLesson(selectedLessonForExercise);
              }
              Alert.alert('Success', 'Exercise deleted successfully');
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert('Error', 'Failed to delete exercise');
            }
          }
        }
      ]
    );
  };

  // Update option for multiple-choice exercise
  const handleOptionChange = (index, value) => {
    const newOptions = [...newExercise.options];
    newOptions[index] = value;
    setNewExercise({...newExercise, options: newOptions});
  };

  // Toggle lesson status (publish/unpublish)
  const toggleLessonStatus = async (lesson) => {
    try {
      const newStatus = lesson.status === 'published' ? 'draft' : 'published';
      await appwriteService.updateLesson(lesson.$id, {
        ...lesson,
        status: newStatus
      });
      
      if (selectedCourseForLesson) {
        loadLessonsForCourse(selectedCourseForLesson);
      }
      
      Alert.alert('Success', `Lesson ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error updating lesson status:', error);
      Alert.alert('Error', 'Failed to update lesson status');
    }
  };

  // Filter lessons and exercises based on search queries
  const filteredLessons = lessons.filter(lesson => 
    lesson.title.toLowerCase().includes(searchLessonQuery.toLowerCase()) ||
    lesson.content.toLowerCase().includes(searchLessonQuery.toLowerCase())
  );
  
  const filteredExercises = exercises.filter(exercise => 
    exercise.title.toLowerCase().includes(searchExerciseQuery.toLowerCase()) ||
    exercise.content.toLowerCase().includes(searchExerciseQuery.toLowerCase())
  );

  // Loading indicator
  if (loading && courses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
          onPress={() => setActiveTab('lessons')}
        >
          <Ionicons
            name="list"
            size={20}
            color={activeTab === 'lessons' ? '#3B82F6' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>Lessons</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'exercises' && styles.activeTab]}
          onPress={() => setActiveTab('exercises')}
        >
          <Ionicons
            name="fitness"
            size={20}
            color={activeTab === 'exercises' ? '#3B82F6' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'exercises' && styles.activeTabText]}>Exercises</Text>
        </TouchableOpacity>
      </View>

      {/* Lessons Tab Content */}
      {activeTab === 'lessons' && (
        <ScrollView style={styles.contentContainer}>
          {/* Course Selector */}
          <View style={styles.selectorCard}>
            <Text style={styles.selectorLabel}>Select Course</Text>
            {courses.length > 0 ? (
              <Picker
                selectedValue={selectedCourseForLesson}
                onValueChange={(itemValue) => setSelectedCourseForLesson(itemValue)}
                style={styles.picker}
              >
                {courses.map(course => (
                  <Picker.Item key={course.$id} label={course.title} value={course.$id} />
                ))}
              </Picker>
            ) : (
              <View style={styles.emptySelector}>
                <Text style={styles.emptySelectorText}>No courses available</Text>
              </View>
            )}
          </View>

          {/* Search Bar */}
          {selectedCourseForLesson && (
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search lessons..."
                value={searchLessonQuery}
                onChangeText={setSearchLessonQuery}
              />
              {searchLessonQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchLessonQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Add Lesson Button */}
          {selectedCourseForLesson && !isAddingLesson ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setIsAddingLesson(true);
                setNewLesson(prev => ({ 
                  ...prev, 
                  courseId: selectedCourseForLesson,
                  order: lessons.length + 1
                }));
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text style={styles.addButtonText}>Add New Lesson</Text>
            </TouchableOpacity>
          ) : selectedCourseForLesson && isAddingLesson ? (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Add New Lesson</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Lesson title"
                  value={newLesson.title}
                  onChangeText={(text) => setNewLesson({...newLesson, title: text})}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Content</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Lesson content"
                  value={newLesson.content}
                  onChangeText={(text) => setNewLesson({...newLesson, content: text})}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Order</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Lesson order"
                  value={String(newLesson.order)}
                  onChangeText={(text) => setNewLesson({...newLesson, order: parseInt(text) || 1})}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <Picker
                  selectedValue={newLesson.status}
                  onValueChange={(itemValue) => setNewLesson({...newLesson, status: itemValue})}
                  style={styles.picker}
                >
                  <Picker.Item label="Draft" value="draft" />
                  <Picker.Item label="Published" value="published" />
                </Picker>
              </View>
              
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsAddingLesson(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateLesson}
                >
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Lessons List */}
          {selectedCourseForLesson && (
            loading ? (
              <View style={styles.loadingContentContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading lessons...</Text>
              </View>
            ) : filteredLessons.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text" size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>
                  {searchLessonQuery ? 'No lessons match your search' : 'No lessons available for this course'}
                </Text>
              </View>
            ) : (
              filteredLessons.map(lesson => (
                <View key={lesson.$id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{lesson.title}</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.statusBadge}
                        onPress={() => toggleLessonStatus(lesson)}
                      >
                        <Text style={[
                          styles.statusText,
                          { color: lesson.status === 'published' ? '#10B981' : '#9CA3AF' }
                        ]}>
                          {lesson.status === 'published' ? 'Published' : 'Draft'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          // Edit lesson (placeholder)
                          Alert.alert('Info', 'Edit lesson functionality not implemented yet');
                        }}
                      >
                        <Ionicons name="create-outline" size={20} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteLesson(lesson.$id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.cardMetadata}>
                    <View style={styles.metadataBadge}>
                      <Text style={styles.metadataText}>Order: {lesson.order}</Text>
                    </View>
                    <Text style={styles.dateText}>
                      Created: {new Date(lesson.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <Text style={styles.contentPreview} numberOfLines={3}>
                    {lesson.content}
                  </Text>
                </View>
              ))
            )
          )}
        </ScrollView>
      )}

      {/* Exercises Tab Content */}
      {activeTab === 'exercises' && (
        <ScrollView style={styles.contentContainer}>
          {/* Course Selector for Exercises */}
          <View style={styles.selectorCard}>
            <Text style={styles.selectorLabel}>Select Course</Text>
            {courses.length > 0 ? (
              <Picker
                selectedValue={selectedCourseForExercise}
                onValueChange={(itemValue) => setSelectedCourseForExercise(itemValue)}
                style={styles.picker}
              >
                {courses.map(course => (
                  <Picker.Item key={course.$id} label={course.title} value={course.$id} />
                ))}
              </Picker>
            ) : (
              <View style={styles.emptySelector}>
                <Text style={styles.emptySelectorText}>No courses available</Text>
              </View>
            )}
          </View>

          {/* Lesson Selector for Exercises */}
          {selectedCourseForExercise && (
            <View style={styles.selectorCard}>
              <Text style={styles.selectorLabel}>Select Lesson</Text>
              {lessonsByExerciseCourse.length > 0 ? (
                <Picker
                  selectedValue={selectedLessonForExercise}
                  onValueChange={(itemValue) => setSelectedLessonForExercise(itemValue)}
                  style={styles.picker}
                >
                  {lessonsByExerciseCourse.map(lesson => (
                    <Picker.Item key={lesson.$id} label={lesson.title} value={lesson.$id} />
                  ))}
                </Picker>
              ) : (
                <View style={styles.emptySelector}>
                  <Text style={styles.emptySelectorText}>No lessons available for this course</Text>
                </View>
              )}
            </View>
          )}

          {/* Search Bar for Exercises */}
          {selectedLessonForExercise && (
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                value={searchExerciseQuery}
                onChangeText={setSearchExerciseQuery}
              />
              {searchExerciseQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchExerciseQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Add Exercise Button */}
          {selectedLessonForExercise && !isAddingExercise ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setIsAddingExercise(true);
                setNewExercise(prev => ({ 
                  ...prev, 
                  lessonId: selectedLessonForExercise,
                  order: exercises.length + 1
                }));
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text style={styles.addButtonText}>Add New Exercise</Text>
            </TouchableOpacity>
          ) : selectedLessonForExercise && isAddingExercise ? (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Add New Exercise</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Exercise title"
                  value={newExercise.title}
                  onChangeText={(text) => setNewExercise({...newExercise, title: text})}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Type</Text>
                <Picker
                  selectedValue={newExercise.type}
                  onValueChange={(itemValue) => setNewExercise({...newExercise, type: itemValue})}
                  style={styles.picker}
                >
                  <Picker.Item label="Multiple Choice" value="multiple-choice" />
                  <Picker.Item label="Fill in the Blank" value="fill-blank" />
                  <Picker.Item label="True/False" value="true-false" />
                  <Picker.Item label="Matching" value="matching" />
                </Picker>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Content/Question</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Exercise content or question"
                  value={newExercise.content}
                  onChangeText={(text) => setNewExercise({...newExercise, content: text})}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              
              {newExercise.type === 'multiple-choice' && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Options</Text>
                  {newExercise.options.map((option, index) => (
                    <View key={index} style={styles.optionContainer}>
                      <TouchableOpacity
                        style={styles.radioButton}
                        onPress={() => setNewExercise({...newExercise, correctAnswer: option})}
                      >
                        <Ionicons
                          name={newExercise.correctAnswer === option ? "radio-button-on" : "radio-button-off"}
                          size={20}
                          color="#3B82F6"
                        />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.optionInput}
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChangeText={(text) => handleOptionChange(index, text)}
                      />
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, {flex: 1, marginRight: 8}]}>
                  <Text style={styles.label}>Order</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Exercise order"
                    value={String(newExercise.order)}
                    onChangeText={(text) => setNewExercise({...newExercise, order: parseInt(text) || 1})}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.formGroup, {flex: 1, marginLeft: 8}]}>
                  <Text style={styles.label}>Points</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Points"
                    value={String(newExercise.points)}
                    onChangeText={(text) => setNewExercise({...newExercise, points: parseInt(text) || 10})}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsAddingExercise(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateExercise}
                >
                  <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Exercises List */}
          {selectedLessonForExercise && (
            loading ? (
              <View style={styles.loadingContentContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading exercises...</Text>
              </View>
            ) : filteredExercises.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="fitness" size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>
                  {searchExerciseQuery ? 'No exercises match your search' : 'No exercises available for this lesson'}
                </Text>
              </View>
            ) : (
              filteredExercises.map(exercise => (
                <View key={exercise.$id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{exercise.title}</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          // Edit exercise (placeholder)
                          Alert.alert('Info', 'Edit exercise functionality not implemented yet');
                        }}
                      >
                        <Ionicons name="create-outline" size={20} color="#3B82F6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteExercise(exercise.$id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.cardMetadata}>
                    <View style={styles.metadataBadge}>
                      <Text style={styles.metadataText}>{exercise.type}</Text>
                    </View>
                    <View style={styles.metadataBadge}>
                      <Text style={styles.metadataText}>Order: {exercise.order}</Text>
                    </View>
                    <View style={styles.metadataBadge}>
                      <Text style={styles.metadataText}>{exercise.points} Points</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.contentPreview} numberOfLines={2}>
                    {exercise.content}
                  </Text>
                  
                  {exercise.options && exercise.options.length > 0 && (
                    <View style={styles.optionsList}>
                      <Text style={styles.optionsTitle}>Options:</Text>
                      {exercise.options.map((option, index) => (
                        <View key={index} style={styles.optionItem}>
                          <Ionicons
                            name={exercise.correctAnswer === option ? "checkmark-circle" : "ellipse-outline"}
                            size={16}
                            color={exercise.correctAnswer === option ? "#10B981" : "#9CA3AF"}
                          />
                          <Text style={styles.optionText}>{option}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            )
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingContentContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  selectorCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectorLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  picker: {
    height: 50,
  },
  emptySelector: {
    padding: 8,
  },
  emptySelectorText: {
    color: '#9CA3AF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 100,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    marginRight: 8,
  },
  optionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  cardMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 10,
  },
  metadataBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  metadataText: {
    fontSize: 12,
    color: '#4B5563',
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 'auto',
  },
  contentPreview: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 4,
  },
  optionsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 6,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  optionText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});