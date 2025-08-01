import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { borderRadius, colors, spacing, typography } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';
import { Query } from 'appwrite';

interface Course {
  $id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  estimatedDuration: string;
  totalLessons: number;
  isPublished: boolean;
  imageUrl?: string;
  instructorId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  $id: string;
  title: string;
  description: string;
  content: string;
  courseId: string;
  order: number;
  isPublished: boolean;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

interface Instructor {
  $id: string;
  userId: string;
  displayName: string;
  profileImage?: string;
  email?: string;
  isInstructor: boolean;
}

export default function CourseDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [eligibleInstructors, setEligibleInstructors] = useState<Instructor[]>([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  
  // Active tab state (lessons, quizzes, materials, etc.)
  const [activeTab, setActiveTab] = useState('lessons');
  
  // Modal state for adding instructors
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newInstructorEmail, setNewInstructorEmail] = useState('');
  const [newInstructorName, setNewInstructorName] = useState('');
  const [newInstructorImage, setNewInstructorImage] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchCourseData(id as string);
      fetchLessons(id as string);
      fetchInstructors(id as string);
      fetchEligibleInstructors();
      fetchQuizzes(id as string);
    } else {
      Alert.alert('Error', 'Course ID not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [id]);
  
  const fetchCourseData = async (courseId: string) => {
    try {
      const courseData = await appwriteService.getCourseById(courseId);
      setCourse(courseData as Course);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      Alert.alert('Error', 'Failed to load course data', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLessons = async (courseId: string) => {
    try {
      // Modified to fetch all lessons, not just published ones
      const response = await appwriteService.getLessonsByCourse(courseId);
      setLessons(response);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      Alert.alert('Error', 'Failed to load lessons');
    }
  };
  
  const fetchInstructors = async (courseId: string) => {
    try {
      const response = await appwriteService.getInstructorsByCourse(courseId);
      setInstructors(response);
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
      Alert.alert('Error', 'Failed to load instructors');
    }
  };
  
  const fetchEligibleInstructors = async () => {
    try {
      setIsLoading(true);
      const instructors = await appwriteService.getEligibleInstructors();
      setEligibleInstructors(instructors);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch eligible instructors:', error);
      Alert.alert('Error', 'Failed to load eligible instructors');
      setIsLoading(false);
    }
  };
  
  const fetchQuizzes = async (courseId) => {
    try {
      setLoadingQuizzes(true);
      // Get all quizzes and filter for this course
      const response = await appwriteService.getAllQuizzes([
        Query.equal('courseId', courseId)
      ]);
      setQuizzes(response);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      Alert.alert('Error', 'Failed to load quizzes');
    } finally {
      setLoadingQuizzes(false);
    }
  };
  
  const handleAddInstructor = async () => {
    if (!newInstructorEmail || !newInstructorName) {
      return;
    }
    
    try {
      const instructorData = {
        email: newInstructorEmail,
        displayName: newInstructorName,
        profileImage: newInstructorImage,
        isInstructor: true,
      };
      
      await appwriteService.addInstructorToCourse(course.$id, instructorData);
      setIsModalVisible(false);
      setNewInstructorEmail('');
      setNewInstructorName('');
      setNewInstructorImage('');
      fetchInstructors(course.$id);
      Alert.alert('Success', 'Instructor added successfully');
    } catch (error) {
      console.error('Failed to add instructor:', error);
      Alert.alert('Error', 'Failed to add instructor');
    }
  };
  
  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
          onPress={() => setActiveTab('lessons')}
        >
          <Text 
            variant="subtitle2" 
            color={activeTab === 'lessons' ? colors.primary.main : colors.neutral.darkGray}
          >
            Lessons
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'instructors' && styles.activeTab]}
          onPress={() => setActiveTab('instructors')}
        >
          <Text 
            variant="subtitle2" 
            color={activeTab === 'instructors' ? colors.primary.main : colors.neutral.darkGray}
          >
            Instructors
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'quizzes' && styles.activeTab]}
          onPress={() => setActiveTab('quizzes')}
        >
          <Text 
            variant="subtitle2" 
            color={activeTab === 'quizzes' ? colors.primary.main : colors.neutral.darkGray}
          >
            Quizzes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'materials' && styles.activeTab]}
          onPress={() => setActiveTab('materials')}
        >
          <Text 
            variant="subtitle2" 
            color={activeTab === 'materials' ? colors.primary.main : colors.neutral.darkGray}
          >
            Materials
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderLessons = () => {
    if (lessons.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={colors.neutral.lightGray} />
          <Text style={styles.emptyText}>No lessons found</Text>
          <Button 
            title="Add First Lesson" 
            onPress={() => router.push(`/(admin)/(courses)/create-lesson?courseId=${id}`)}
            style={styles.emptyButton}
          />
        </View>
      );
    }
    
    return (
      <View>
        <View style={styles.sectionHeader}>
          <Text variant="h6">Lessons ({lessons.length})</Text>
          <Button 
            title="+ Add Lesson" 
            variant="outline"
            size="small"
            onPress={() => router.push(`/(admin)/(courses)/create-lesson?courseId=${id}`)}
          />
        </View>
        
        {lessons.map((lesson, index) => (
          <Card key={lesson.$id} style={styles.lessonCard}>
            <View style={styles.lessonHeader}>
              <View style={styles.lessonOrder}>
                <Text style={styles.orderNumber}>{lesson.order || index + 1}</Text>
              </View>
              <View style={styles.lessonDetails}>
                <View style={styles.lessonTitleContainer}>
                  <Text variant="subtitle1" style={styles.lessonTitle}>
                    {lesson.title}
                  </Text>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: lesson.isPublished ? colors.status.success + '20' : colors.neutral.lightGray }
                  ]}>
                    <Text 
                      variant="caption" 
                      style={styles.statusText}
                      color={lesson.isPublished ? colors.status.success : colors.neutral.darkGray}
                    >
                      {lesson.isPublished ? 'Published' : 'Draft'}
                    </Text>
                  </View>
                </View>
                
                <Text variant="body2" style={styles.lessonDescription} numberOfLines={2}>
                  {lesson.description || 'No description available'}
                </Text>
                
                <View style={styles.lessonMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={colors.neutral.gray} />
                    <Text variant="caption" color={colors.neutral.gray} style={styles.metaText}>
                      {lesson.duration} min
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.neutral.gray} />
                    <Text variant="caption" color={colors.neutral.gray} style={styles.metaText}>
                      {new Date(lesson.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.lessonActions}>
              <TouchableOpacity 
                style={styles.lessonIconButton}
                onPress={() => router.push(`/(admin)/(courses)/edit-lesson?id=${lesson.$id}`)}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.primary.main} />
                <Text variant="caption" style={styles.lessonIconButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.lessonIconButton}
                onPress={() => {
                  // Handle viewing the lesson
                  Alert.alert('View Lesson', 'View lesson functionality will be implemented soon.');
                }}
              >
                <Ionicons name="eye-outline" size={18} color={colors.secondary.main} />
                <Text variant="caption" style={styles.lessonIconButtonText}>View</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.lessonIconButton}
                onPress={() => {
                  Alert.alert(
                    'Delete Lesson',
                    'Are you sure you want to delete this lesson?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await appwriteService.deleteLesson(lesson.$id);
                            // Refresh the lessons list
                            fetchLessons(id as string);
                            Alert.alert('Success', 'Lesson deleted successfully');
                          } catch (error) {
                            console.error('Failed to delete lesson:', error);
                            Alert.alert('Error', 'Failed to delete lesson');
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                <Text variant="caption" style={styles.lessonIconButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>
    );
  };
  
  const renderInstructors = () => {
    const assignInstructor = async (instructorId: string) => {
      try {
        await appwriteService.assignInstructorToCourse(course.$id, instructorId);
        fetchInstructors(course.$id);
        setIsModalVisible(false);
        Alert.alert('Success', 'Instructor assigned successfully');
      } catch (error) {
        console.error('Failed to assign instructor:', error);
        Alert.alert('Error', 'Failed to assign instructor to course');
      }
    };

    // Show instructors if any are already assigned
    if (instructors.length > 0) {
      return (
        <View>
          <View style={styles.sectionHeader}>
            <Text variant="h6">Course Instructors</Text>
            <Button
              title="+ Add Instructor"
              variant="outline"
              size="small"
              onPress={() => setIsModalVisible(true)}
            />
          </View>

          {instructors.map((instructor) => (
            <Card key={instructor.$id} style={styles.instructorCard}>
              <View style={styles.instructorHeader}>
                <View style={styles.instructorImageContainer}>
                  {instructor.profileImage ? (
                    <Image
                      source={{ uri: instructor.profileImage }}
                      style={styles.instructorImage}
                    />
                  ) : (
                    <View style={styles.instructorImagePlaceholder}>
                      <Ionicons name="person" size={30} color={colors.neutral.lightGray} />
                    </View>
                  )}
                </View>
                <View style={styles.instructorDetails}>
                  <Text variant="subtitle1">{instructor.displayName}</Text>
                  <Text variant="body2" style={styles.instructorEmail}>{instructor.email}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  Alert.alert(
                    'Remove Instructor',
                    `Are you sure you want to remove ${instructor.displayName} from this course?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await appwriteService.removeInstructorFromCourse(course.$id);
                            fetchInstructors(course.$id);
                            Alert.alert('Success', 'Instructor removed successfully');
                          } catch (error) {
                            console.error('Failed to remove instructor:', error);
                            Alert.alert('Error', 'Failed to remove instructor');
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </Card>
          ))}

          {/* Modal for adding new instructors */}
          <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text variant="h6" style={styles.modalTitle}>Select Instructor</Text>
                
                {isLoading ? (
                  <ActivityIndicator size="large" color={colors.primary.main} />
                ) : (
                  eligibleInstructors.length === 0 ? (
                    <Text style={styles.noInstructorsText}>No eligible instructors found</Text>
                  ) : (
                    <FlatList
                      data={eligibleInstructors}
                      keyExtractor={(item) => item.$id}
                      style={styles.instructorList}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.instructorListItem}
                          onPress={() => assignInstructor(item.userId)}
                        >
                          <View style={styles.instructorListItemInner}>
                            <View style={styles.instructorAvatar}>
                              {item.profileImage ? (
                                <Image
                                  source={{ uri: item.profileImage }}
                                  style={styles.avatarImage}
                                />
                              ) : (
                                <Ionicons name="person" size={20} color={colors.neutral.white} />
                              )}
                            </View>
                            <View style={styles.instructorListItemContent}>
                              <Text variant="subtitle2">{item.displayName}</Text>
                              <Text variant="caption" style={styles.instructorRole}>
                                {item.isAdmin ? 'Admin' : 'Instructor'}
                              </Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      )}
                    />
                  )
                )}
                
                <Button 
                  title="Cancel"
                  variant="outline"
                  onPress={() => setIsModalVisible(false)}
                  style={styles.cancelButton}
                />
              </View>
            </View>
          </Modal>
        </View>
      );
    }

    // Empty state when no instructors are assigned
    return (
      <View style={styles.emptyState}>
        <Ionicons name="person-outline" size={64} color={colors.neutral.lightGray} />
        <Text style={styles.emptyText}>No instructors assigned yet</Text>
        <Text style={styles.emptySubtext}>
          Assign an instructor to help manage this course
        </Text>
        <Button 
          title="Assign Instructor" 
          onPress={() => setIsModalVisible(true)}
          style={styles.emptyButton}
        />
        
        {/* Modal for selecting instructors */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text variant="h6" style={styles.modalTitle}>Select Instructor</Text>
              
              {isLoading ? (
                <ActivityIndicator size="large" color={colors.primary.main} />
              ) : (
                eligibleInstructors.length === 0 ? (
                  <Text style={styles.noInstructorsText}>No eligible instructors found</Text>
                ) : (
                  <FlatList
                    data={eligibleInstructors}
                    keyExtractor={(item) => item.$id}
                    style={styles.instructorList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.instructorListItem}
                        onPress={() => assignInstructor(item.userId)}
                      >
                        <View style={styles.instructorListItemInner}>
                          <View style={styles.instructorAvatar}>
                            {item.profileImage ? (
                              <Image
                                source={{ uri: item.profileImage }}
                                style={styles.avatarImage}
                              />
                            ) : (
                              <Ionicons name="person" size={20} color={colors.neutral.white} />
                            )}
                          </View>
                          <View style={styles.instructorListItemContent}>
                            <Text variant="subtitle2">{item.displayName}</Text>
                            <Text variant="caption" style={styles.instructorRole}>
                              {item.isAdmin ? 'Admin' : 'Instructor'}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )}
                  />
                )
              )}
              
              <Button 
                title="Cancel"
                variant="outline"
                onPress={() => setIsModalVisible(false)}
                style={styles.cancelButton}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  };
  
  const renderQuizzes = () => {
    if (loadingQuizzes) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      );
    }
    
    if (quizzes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="help-circle-outline" size={64} color={colors.neutral.lightGray} />
          <Text style={styles.emptyText}>No quizzes available yet</Text>
          <Text style={styles.emptySubtext}>
            Create quizzes to test student knowledge and track progress
          </Text>
          <Button 
            title="Create Quiz" 
            onPress={() => router.push(`/(admin)/(quiz)/quiz-creator?courseId=${course.$id}`)}
            style={styles.emptyButton}
          />
          <Button
            title="View All Quizzes"
            variant="outline"
            onPress={() => router.push('/(admin)/(quiz)/quiz-list')}
            style={[styles.emptyButton, { marginTop: spacing.sm }]}
          />
        </View>
      );
    }
    
    return (
      <View>
        <View style={styles.sectionHeader}>
          <Text variant="h6">Quizzes ({quizzes.length})</Text>
          <Button 
            title="+ Add Quiz" 
            variant="outline"
            size="small"
            onPress={() => router.push(`/(admin)/(quiz)/quiz-creator?courseId=${course.$id}`)}
          />
        </View>
        
        {quizzes.map((quiz) => (
          <Card key={quiz.$id} style={styles.quizCard}>
            <View style={styles.quizHeader}>
              <Text variant="subtitle1" style={styles.quizTitle}>
                {quiz.title}
              </Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: quiz.isPublished ? colors.status.success + '20' : colors.neutral.lightGray }
              ]}>
                <Text 
                  variant="caption" 
                  style={styles.statusText}
                  color={quiz.isPublished ? colors.status.success : colors.neutral.darkGray}
                >
                  {quiz.isPublished ? 'Published' : 'Draft'}
                </Text>
              </View>
            </View>
            
            <Text variant="body2" style={styles.quizDescription} numberOfLines={2}>
              {quiz.description || 'No description available'}
            </Text>
            
            <View style={styles.quizMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={colors.neutral.gray} />
                <Text variant="caption" color={colors.neutral.gray} style={styles.metaText}>
                  {quiz.timeLimit > 0 ? `${quiz.timeLimit} sec` : 'No time limit'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={colors.neutral.gray} />
                <Text variant="caption" color={colors.neutral.gray} style={styles.metaText}>
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <View style={styles.quizActions}>
              <TouchableOpacity 
                style={styles.quizIconButton}
                onPress={() => router.push(`/(admin)/(quiz)/question-editor?quizId=${quiz.$id}`)}
              >
                <Ionicons name="pencil-outline" size={18} color={colors.primary.main} />
                <Text variant="caption" style={styles.quizIconButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quizIconButton}
                onPress={() => {
                  // Handle viewing the quiz
                  router.push(`/quiz-interface?quizId=${quiz.$id}`);
                }}
              >
                <Ionicons name="eye-outline" size={18} color={colors.secondary.main} />
                <Text variant="caption" style={styles.quizIconButtonText}>Preview</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quizIconButton}
                onPress={() => {
                  Alert.alert(
                    'Delete Quiz',
                    'Are you sure you want to delete this quiz?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await appwriteService.deleteQuiz(quiz.$id);
                            // Refresh the quizzes list
                            fetchQuizzes(id as string);
                            Alert.alert('Success', 'Quiz deleted successfully');
                          } catch (error) {
                            console.error('Failed to delete quiz:', error);
                            Alert.alert('Error', 'Failed to delete quiz');
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="trash-outline" size={18} color={colors.status.error} />
                <Text variant="caption" style={styles.quizIconButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>
    );
  };
  
  const renderMaterials = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-outline" size={64} color={colors.neutral.lightGray} />
      <Text style={styles.emptyText}>No additional materials yet</Text>
      <Text style={styles.emptySubtext}>
        Upload PDFs, worksheets, and other course materials
      </Text>
      <Button 
        title="Upload Material" 
        onPress={() => Alert.alert('Coming Soon', 'Material uploads will be available in a future update')}
        style={styles.emptyButton}
      />
    </View>
  );
  
  const renderAnalytics = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bar-chart-outline" size={64} color={colors.neutral.lightGray} />
      <Text style={styles.emptyText}>Analytics Coming Soon</Text>
      <Text style={styles.emptySubtext}>
        Student progress and engagement metrics will be available here
      </Text>
    </View>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="Course Details"
          leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
          onLeftIconPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!course) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PreAuthHeader 
          title="Course Details"
          leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
          onLeftIconPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Course not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <PreAuthHeader 
        title="Course Details"
        leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
        onLeftIconPress={() => router.back()}
      />
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <Card style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <View style={styles.courseImageContainer}>
                {course.imageUrl ? (
                  <Image 
                    source={{ uri: course.imageUrl }} 
                    style={styles.courseImage} 
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="book-outline" size={40} color={colors.neutral.lightGray} />
                  </View>
                )}
              </View>
              
              <View style={styles.courseInfo}>
                <Text variant="h4" style={styles.courseTitle}>{course.title}</Text>
                <View style={styles.courseMetaRow}>
                  <View style={styles.metaBadge}>
                    <Text variant="caption" style={styles.metaBadgeText}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </Text>
                  </View>
                  <View style={styles.metaBadge}>
                    <Text variant="caption" style={styles.metaBadgeText}>
                      {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: course.isPublished ? colors.status.success + '20' : colors.neutral.lightGray }
                  ]}>
                    <Text 
                      variant="caption" 
                      style={styles.statusText}
                      color={course.isPublished ? colors.status.success : colors.neutral.darkGray}
                    >
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.courseActions}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => router.push(`/(admin)/(courses)/edit-course?id=${course.$id}`)}
              >
                <Ionicons name="pencil-outline" size={20} color={colors.primary.main} />
                <Text variant="caption" style={styles.iconButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={async () => {
                  try {
                    const updatedCourse = await appwriteService.updateCourse(course.$id, {
                      isPublished: !course.isPublished
                    });
                    setCourse({
                      ...course,
                      isPublished: !course.isPublished
                    });
                    Alert.alert(
                      'Success', 
                      `Course ${course.isPublished ? 'unpublished' : 'published'} successfully`
                    );
                  } catch (error) {
                    console.error('Failed to update course:', error);
                    Alert.alert('Error', 'Failed to update course status');
                  }
                }}
              >
                <Ionicons 
                  name={course.isPublished ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={course.isPublished ? colors.secondary.main : colors.secondary.main} 
                />
                <Text variant="caption" style={styles.iconButtonText}>
                  {course.isPublished ? "Unpublish" : "Publish"}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => router.push(`/(admin)/(courses)/lessons?courseId=${course.$id}`)}
              >
                <Ionicons name="list-outline" size={20} color={colors.primary.dark} />
                <Text variant="caption" style={styles.iconButtonText}>Lessons</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.courseDescription}>
              <Text variant="subtitle1">Description</Text>
              <Text variant="body2" style={styles.descriptionText}>
                {course.description}
              </Text>
            </View>
            
            <View style={styles.courseStats}>
              <View style={styles.statItem}>
                <Text variant="h6">{course.totalLessons}</Text>
                <Text variant="caption" color={colors.neutral.darkGray}>Lessons</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="h6">{course.estimatedDuration || 'N/A'}</Text>
                <Text variant="caption" color={colors.neutral.darkGray}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="h6">0</Text>
                <Text variant="caption" color={colors.neutral.darkGray}>Students</Text>
              </View>
            </View>
          </Card>
          
          {renderTabs()}
          
          <View style={styles.tabContent}>
            {activeTab === 'lessons' && renderLessons()}
            {activeTab === 'instructors' && renderInstructors()}
            {activeTab === 'quizzes' && renderQuizzes()}
            {activeTab === 'materials' && renderMaterials()}
            {activeTab === 'analytics' && renderAnalytics()}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.neutral.darkGray,
  },
  errorText: {
    color: colors.status.error,
  },
  courseCard: {
    padding: spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  courseImageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    marginBottom: spacing.xs,
    color: colors.primary.main,
  },
  courseMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaBadge: {
    backgroundColor: colors.primary.light + '30',
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaBadgeText: {
    color: colors.primary.main,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontWeight: typography.fontWeights.medium as any,
  },
  courseActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    marginRight: spacing.xs,
    flex: 1,
    minWidth: 70,
  },
  iconButtonText: {
    marginTop: 4,
    fontSize: typography.fontSizes.xs,
    color: colors.neutral.text,
    textAlign: 'center',
  },
  courseDescription: {
    marginBottom: spacing.md,
  },
  descriptionText: {
    marginTop: spacing.xs,
    color: colors.neutral.darkGray,
  },
  courseStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingTop: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  activeTab: {
    backgroundColor: colors.primary.light + '20',
  },
  tabContent: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lessonCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  lessonHeader: {
    flexDirection: 'row',
  },
  lessonOrder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary.light + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  orderNumber: {
    fontWeight: typography.fontWeights.bold as any,
    color: colors.primary.main,
  },
  lessonDetails: {
    flex: 1,
  },
  lessonTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  lessonTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  lessonDescription: {
    color: colors.neutral.darkGray,
    marginBottom: spacing.xs,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  metaText: {
    marginLeft: 2,
  },
  lessonActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingTop: spacing.sm,
  },
  lessonIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  lessonIconButtonText: {
    marginLeft: spacing.xs,
    color: colors.primary.main,
    ...typography.caption,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSizes.lg,
    color: colors.neutral.darkGray,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    textAlign: 'center',
    color: colors.neutral.gray,
    marginBottom: spacing.md,
  },
  emptyButton: {
    marginTop: spacing.sm,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral.black + '80',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.neutral.white,
  },
  addButton: {
    marginTop: spacing.sm,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  instructorCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  instructorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  instructorImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  instructorImage: {
    width: '100%',
    height: '100%',
  },
  instructorImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructorDetails: {
    flex: 1,
  },
  instructorEmail: {
    marginTop: 2,
    color: colors.neutral.gray,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  removeButtonText: {
    marginLeft: spacing.xs,
    color: colors.status.error,
    ...typography.caption,
  },
  noInstructorsText: {
    textAlign: 'center',
    color: colors.neutral.darkGray,
    marginTop: spacing.md,
  },
  instructorList: {
    maxHeight: 300,
  },
  instructorListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.lightGray,
  },
  instructorListItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: spacing.sm,
    backgroundColor: colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  instructorListItemContent: {
    flex: 1,
  },
  instructorRole: {
    marginTop: 2,
    color: colors.neutral.gray,
  },
  cancelButton: {
    marginTop: spacing.md,
  },
  quizCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quizTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  quizDescription: {
    color: colors.neutral.darkGray,
    marginBottom: spacing.xs,
  },
  quizMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.lightGray,
    paddingTop: spacing.sm,
  },
  quizIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
    backgroundColor: colors.neutral.white,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  quizIconButtonText: {
    marginLeft: spacing.xs,
    color: colors.primary.main,
    ...typography.caption,
  },
});