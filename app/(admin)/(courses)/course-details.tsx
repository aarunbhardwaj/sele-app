import { Ionicons } from '@expo/vector-icons';
import { Query } from 'appwrite';
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
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';

// Airbnb-inspired color palette
const airbnbColors = {
  primary: '#FF5A5F',
  primaryDark: '#E8484D',
  primaryLight: '#FFE8E9',
  secondary: '#00A699',
  secondaryLight: '#E0F7F5',
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  gray: '#EBEBEB',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  black: '#222222',
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
};

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

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return airbnbColors.success;
      case 'intermediate': return airbnbColors.warning;
      case 'advanced': return airbnbColors.error;
      default: return airbnbColors.mediumGray;
    }
  };

  const renderTabs = () => {
    const tabs = [
      { key: 'lessons', label: 'Lessons', icon: 'list' },
      { key: 'instructors', label: 'Instructors', icon: 'people' },
      { key: 'quizzes', label: 'Quizzes', icon: 'help-circle' },
      { key: 'materials', label: 'Materials', icon: 'document' },
    ];

    return (
      <Animated.View 
        entering={FadeInUp.delay(400).duration(600)}
        style={styles.tabsSection}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.key ? airbnbColors.white : airbnbColors.mediumGray} 
              />
              <Text style={[
                styles.tabText, 
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderLessons = () => {
    if (lessons.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Ionicons name="document-text-outline" size={48} color={airbnbColors.mediumGray} />
          <Text style={styles.emptyText}>No lessons found</Text>
          <Text style={styles.emptySubtext}>Create your first lesson to get started</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push(`/(admin)/(courses)/create-lesson?courseId=${id}`)}
          >
            <Ionicons name="add" size={20} color={airbnbColors.white} />
            <Text style={styles.createButtonText}>Add First Lesson</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.contentCard}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>Lessons ({lessons.length})</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push(`/(admin)/(courses)/create-lesson?courseId=${id}`)}
          >
            <Ionicons name="add" size={16} color={airbnbColors.primary} />
            <Text style={styles.addButtonText}>Add Lesson</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.itemsList}>
          {lessons.map((lesson, index) => (
            <View key={lesson.$id} style={[styles.itemCard, index === lessons.length - 1 && styles.lastItem]}>
              <View style={styles.itemHeader}>
                <View style={styles.itemOrder}>
                  <Text style={styles.orderText}>{lesson.order || index + 1}</Text>
                </View>
                <View style={styles.itemContent}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{lesson.title}</Text>
                    <View style={styles.itemBadges}>
                      {(lesson.videoId || lesson.mediaUrl || lesson.mediaUrls) && (
                        <View style={styles.videoBadge}>
                          <Ionicons name="videocam" size={12} color={airbnbColors.secondary} />
                        </View>
                      )}
                      <View style={[styles.statusBadge, { 
                        backgroundColor: lesson.isPublished ? airbnbColors.success + '20' : airbnbColors.warning + '20'
                      }]}>
                        <Text style={[styles.statusText, { 
                          color: lesson.isPublished ? airbnbColors.success : airbnbColors.warning
                        }]}>
                          {lesson.isPublished ? 'Published' : 'Draft'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {lesson.description || 'No description available'}
                  </Text>
                  
                  <View style={styles.itemMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time" size={12} color={airbnbColors.mediumGray} />
                      <Text style={styles.metaText}>{lesson.duration} min</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar" size={12} color={airbnbColors.mediumGray} />
                      <Text style={styles.metaText}>
                        {new Date(lesson.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: airbnbColors.secondary + '15' }]}
                  onPress={() => router.push(`/(admin)/(courses)/lesson-view?id=${lesson.$id}`)}
                >
                  <Ionicons name="eye" size={14} color={airbnbColors.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: airbnbColors.primary + '15' }]}
                  onPress={() => router.push(`/(admin)/(courses)/edit-lesson?id=${lesson.$id}`)}
                >
                  <Ionicons name="pencil" size={14} color={airbnbColors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: airbnbColors.error + '15' }]}
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
                  <Ionicons name="trash" size={14} color={airbnbColors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
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

    if (instructors.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Ionicons name="person-outline" size={48} color={airbnbColors.mediumGray} />
          <Text style={styles.emptyText}>No instructors assigned yet</Text>
          <Text style={styles.emptySubtext}>Assign an instructor to help manage this course</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="person-add" size={20} color={airbnbColors.white} />
            <Text style={styles.createButtonText}>Assign Instructor</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.contentCard}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>Course Instructors</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name="add" size={16} color={airbnbColors.primary} />
            <Text style={styles.addButtonText}>Add Instructor</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.itemsList}>
          {instructors.map((instructor, index) => (
            <View key={instructor.$id} style={[styles.instructorCard, index === instructors.length - 1 && styles.lastItem]}>
              <View style={styles.instructorInfo}>
                <View style={styles.instructorAvatar}>
                  {instructor.profileImage ? (
                    <Image
                      source={{ uri: instructor.profileImage }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {instructor.displayName?.[0]?.toUpperCase() || 'I'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.instructorDetails}>
                  <Text style={styles.instructorName}>{instructor.displayName}</Text>
                  <Text style={styles.instructorEmail}>{instructor.email}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: airbnbColors.error + '15' }]}
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
                <Ionicons name="trash" size={14} color={airbnbColors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderQuizzes = () => {
    if (loadingQuizzes) {
      return (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <Text style={styles.loadingText}>Loading quizzes...</Text>
        </View>
      );
    }
    
    if (quizzes.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Ionicons name="help-circle-outline" size={48} color={airbnbColors.mediumGray} />
          <Text style={styles.emptyText}>No quizzes available yet</Text>
          <Text style={styles.emptySubtext}>Create quizzes to test student knowledge and track progress</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push(`/(admin)/(quiz)/quiz-creator?courseId=${course.$id}`)}
          >
            <Ionicons name="add" size={20} color={airbnbColors.white} />
            <Text style={styles.createButtonText}>Create Quiz</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.contentCard}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>Quizzes ({quizzes.length})</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push(`/(admin)/(quiz)/quiz-creator?courseId=${course.$id}`)}
          >
            <Ionicons name="add" size={16} color={airbnbColors.primary} />
            <Text style={styles.addButtonText}>Add Quiz</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.itemsList}>
          {quizzes.map((quiz, index) => (
            <View key={quiz.$id} style={[styles.itemCard, index === quizzes.length - 1 && styles.lastItem]}>
              <View style={styles.quizHeader}>
                <View style={styles.quizIcon}>
                  <Ionicons name="help-circle" size={20} color={airbnbColors.primary} />
                </View>
                <View style={styles.itemContent}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{quiz.title}</Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: quiz.isPublished ? airbnbColors.success + '20' : airbnbColors.warning + '20'
                    }]}>
                      <Text style={[styles.statusText, { 
                        color: quiz.isPublished ? airbnbColors.success : airbnbColors.warning
                      }]}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.itemDescription} numberOfLines={2}>
                    {quiz.description || 'No description available'}
                  </Text>
                  
                  <View style={styles.itemMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time" size={12} color={airbnbColors.mediumGray} />
                      <Text style={styles.metaText}>
                        {quiz.timeLimit > 0 ? `${quiz.timeLimit} sec` : 'No time limit'}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar" size={12} color={airbnbColors.mediumGray} />
                      <Text style={styles.metaText}>
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <View style={styles.itemActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: airbnbColors.secondary + '15' }]}
                  onPress={() => router.push(`/quiz-interface?quizId=${quiz.$id}`)}
                >
                  <Ionicons name="eye" size={14} color={airbnbColors.secondary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: airbnbColors.primary + '15' }]}
                  onPress={() => router.push(`/(admin)/(quiz)/question-editor?quizId=${quiz.$id}`)}
                >
                  <Ionicons name="pencil" size={14} color={airbnbColors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: airbnbColors.error + '15' }]}
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
                  <Ionicons name="trash" size={14} color={airbnbColors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  const renderMaterials = () => (
    <View style={styles.emptyCard}>
      <Ionicons name="document-outline" size={48} color={airbnbColors.mediumGray} />
      <Text style={styles.emptyText}>No additional materials yet</Text>
      <Text style={styles.emptySubtext}>Upload PDFs, worksheets, and other course materials</Text>
      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => Alert.alert('Coming Soon', 'Material uploads will be available in a future update')}
      >
        <Ionicons name="cloud-upload" size={20} color={airbnbColors.white} />
        <Text style={styles.createButtonText}>Upload Material</Text>
      </TouchableOpacity>
    </View>
  );

  // Display loading indicator
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PreAuthHeader 
          title="Course Details"
          leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
          onLeftIconPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={airbnbColors.primary} />
          <Text style={styles.loadingText}>Loading course details...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <PreAuthHeader 
          title="Course Details"
          leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
          onLeftIconPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color={airbnbColors.error} />
          <Text style={styles.errorText}>Course not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <PreAuthHeader 
        title="Course Details"
        leftIcon={<Ionicons name="arrow-back" size={24} color="#333333" />}
        onLeftIconPress={() => router.back()}
        rightComponent={
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push(`/(admin)/(courses)/edit-course?id=${course.$id}`)}
          >
            <Ionicons name="pencil" size={20} color={airbnbColors.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* Course Header Section */}
          <Animated.View 
            entering={FadeInDown.delay(100).duration(600)}
            style={styles.courseSection}
          >
            <View style={styles.courseCard}>
              {/* Course Image and Basic Info */}
              <View style={styles.courseHeader}>
                <View style={styles.imageContainer}>
                  {course.imageUrl ? (
                    <Image 
                      source={{ uri: course.imageUrl }} 
                      style={styles.courseImage} 
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="book" size={32} color={airbnbColors.mediumGray} />
                    </View>
                  )}
                  <View style={[styles.statusBadge, { 
                    backgroundColor: course.isPublished ? airbnbColors.success : airbnbColors.warning
                  }]}>
                    <Text style={styles.statusText}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <View style={styles.courseBadges}>
                    <View style={[styles.levelBadge, { backgroundColor: getLevelColor(course.level) + '20' }]}>
                      <Text style={[styles.levelText, { color: getLevelColor(course.level) }]}>
                        {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                      </Text>
                    </View>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {course.category?.charAt(0).toUpperCase() + course.category?.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Course Description */}
              <View style={styles.descriptionSection}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{course.description}</Text>
              </View>

              {/* Course Stats */}
              <View style={styles.statsSection}>
                <View style={styles.statItem}>
                  <Ionicons name="list" size={20} color={airbnbColors.primary} />
                  <Text style={styles.statNumber}>{course.totalLessons || lessons.length}</Text>
                  <Text style={styles.statLabel}>Lessons</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={20} color={airbnbColors.secondary} />
                  <Text style={styles.statNumber}>{course.estimatedDuration || 'N/A'}</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={20} color={airbnbColors.warning} />
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Students</Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={styles.actionsSection}>
                <TouchableOpacity 
                  style={[styles.actionCard, { backgroundColor: airbnbColors.primary + '15' }]}
                  onPress={() => router.push(`/(admin)/(courses)/edit-course?id=${course.$id}`)}
                >
                  <Ionicons name="pencil" size={20} color={airbnbColors.primary} />
                  <Text style={[styles.actionText, { color: airbnbColors.primary }]}>Edit Course</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionCard, { backgroundColor: airbnbColors.secondary + '15' }]}
                  onPress={async () => {
                    try {
                      await appwriteService.updateCourse(course.$id, {
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
                    name={course.isPublished ? "eye-off" : "eye"} 
                    size={20} 
                    color={airbnbColors.secondary} 
                  />
                  <Text style={[styles.actionText, { color: airbnbColors.secondary }]}>
                    {course.isPublished ? "Unpublish" : "Publish"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {renderTabs()}

          {/* Tab Content */}
          <Animated.View 
            entering={FadeInUp.delay(500).duration(600)}
            style={styles.tabContentSection}
          >
            {activeTab === 'lessons' && renderLessons()}
            {activeTab === 'instructors' && renderInstructors()}
            {activeTab === 'quizzes' && renderQuizzes()}
            {activeTab === 'materials' && renderMaterials()}
          </Animated.View>
        </View>
      </ScrollView>

      {/* Modal for adding instructors */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Instructor</Text>
            
            {isLoading ? (
              <ActivityIndicator size="large" color={airbnbColors.primary} />
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
                      <View style={styles.instructorListContent}>
                        <View style={styles.instructorListAvatar}>
                          {item.profileImage ? (
                            <Image
                              source={{ uri: item.profileImage }}
                              style={styles.listAvatarImage}
                            />
                          ) : (
                            <Text style={styles.listAvatarText}>
                              {item.displayName?.[0]?.toUpperCase() || 'I'}
                            </Text>
                          )}
                        </View>
                        <View style={styles.instructorListDetails}>
                          <Text style={styles.instructorListName}>{item.displayName}</Text>
                          <Text style={styles.instructorListRole}>
                            {item.isAdmin ? 'Admin' : 'Instructor'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )
            )}
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: airbnbColors.offWhite,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: airbnbColors.darkGray,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 18,
    color: airbnbColors.error,
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: airbnbColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  backButtonText: {
    color: airbnbColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: airbnbColors.lightGray,
  },

  // Course Section
  courseSection: {
    marginBottom: 24,
  },
  courseCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  courseImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: airbnbColors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: airbnbColors.white,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 8,
    lineHeight: 28,
  },
  courseBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: airbnbColors.primaryLight,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: airbnbColors.primary,
    textTransform: 'capitalize',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    lineHeight: 20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: airbnbColors.darkGray,
    marginTop: 2,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
  },
  actionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Tabs Section
  tabsSection: {
    marginBottom: 24,
  },
  tabsContainer: {
    paddingVertical: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: airbnbColors.lightGray,
    marginRight: 12,
    gap: 6,
  },
  activeTab: {
    backgroundColor: airbnbColors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: airbnbColors.mediumGray,
  },
  activeTabText: {
    color: airbnbColors.white,
  },

  // Tab Content Section
  tabContentSection: {
    marginBottom: 24,
  },
  contentCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.charcoal,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: airbnbColors.primary,
  },

  // Items List
  itemsList: {
    gap: 12,
  },
  itemCard: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  lastItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  itemOrder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: airbnbColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderText: {
    fontSize: 14,
    fontWeight: '700',
    color: airbnbColors.primary,
  },
  itemContent: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginRight: 8,
  },
  itemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  videoBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: airbnbColors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDescription: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    marginBottom: 8,
    lineHeight: 18,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: airbnbColors.mediumGray,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Quiz-specific styles
  quizHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  quizIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: airbnbColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  // Instructor-specific styles
  instructorCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  instructorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: airbnbColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.primary,
  },
  instructorDetails: {
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
  },
  instructorEmail: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    marginTop: 2,
  },

  // Empty/Loading States
  emptyCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.white,
  },
  loadingCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 20,
    textAlign: 'center',
  },
  noInstructorsText: {
    textAlign: 'center',
    color: airbnbColors.darkGray,
    marginVertical: 20,
  },
  instructorList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  instructorListItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
  },
  instructorListContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorListAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: airbnbColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  listAvatarImage: {
    width: '100%',
    height: '100%',
  },
  listAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.primary,
  },
  instructorListDetails: {
    flex: 1,
  },
  instructorListName: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
  },
  instructorListRole: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    marginTop: 2,
  },
  cancelButton: {
    backgroundColor: airbnbColors.lightGray,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
  },
});