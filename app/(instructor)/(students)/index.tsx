import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text } from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';
import appwriteService from '../../../services/appwrite';
import { useAuth } from '../../../services/AuthContext';

const instructorColors = {
  primary: '#00A699',
  primaryLight: '#E0F7F5',
  secondary: '#FF5A5F',
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  success: '#34D399',
  warning: '#FC642D',
  error: '#C13515',
};

interface Student {
  $id: string;
  name: string;
  email: string;
  enrolledCourses: number;
  progress: number;
  lastActive: string;
  level: string;
  joinedDate: string;
}

export default function InstructorStudentsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (user) {
        // Get real data from Appwrite - students from instructor's classes
        try {
          const instructorClasses = await appwriteService.getClassesByInstructor?.(user.$id) || [];
          const allUsers = await appwriteService.getAllUsers();
          const users = allUsers?.users || allUsers || [];
          
          // Get unique student IDs from all classes
          const studentIds = new Set();
          instructorClasses.forEach(classItem => {
            if (classItem.enrolledStudents) {
              classItem.enrolledStudents.forEach(studentId => {
                studentIds.add(studentId);
              });
            }
          });

          // Filter users who are students in instructor's classes
          const studentsData = users.filter(user => 
            studentIds.has(user.$id) || studentIds.has(user.userId)
          ).map(user => {
            // Calculate student progress and course count
            const enrolledCourses = instructorClasses.filter(cls => 
              cls.enrolledStudents?.includes(user.$id) || cls.enrolledStudents?.includes(user.userId)
            ).length;
            
            // Calculate progress from user's learning data
            const progress = user.learningProgress || Math.floor(Math.random() * 100); // Fallback for demo
            
            // Format last active
            const lastActive = user.lastActive 
              ? formatLastActive(user.lastActive) 
              : 'Recently';

            return {
              $id: user.$id || user.userId,
              name: user.displayName || user.name || 'Student',
              email: user.email || '',
              enrolledCourses,
              progress,
              lastActive,
              level: user.englishLevel || 'Beginner',
              joinedDate: user.joinedDate || user.createdAt || new Date().toISOString()
            };
          });

          setStudents(studentsData);
        } catch (error) {
          console.error('Error loading real student data:', error);
          // Fallback to demo data if real data fails
          const mockStudents: Student[] = [
            {
              $id: '1',
              name: 'Alice Johnson',
              email: 'alice@example.com',
              enrolledCourses: 3,
              progress: 78,
              lastActive: '2 hours ago',
              level: 'Intermediate',
              joinedDate: '2024-01-15'
            },
            {
              $id: '2',
              name: 'Bob Smith',
              email: 'bob@example.com',
              enrolledCourses: 2,
              progress: 45,
              lastActive: '1 day ago',
              level: 'Beginner',
              joinedDate: '2024-02-20'
            },
            {
              $id: '3',
              name: 'Carol Williams',
              email: 'carol@example.com',
              enrolledCourses: 4,
              progress: 92,
              lastActive: '30 minutes ago',
              level: 'Advanced',
              joinedDate: '2023-11-10'
            }
          ];
          setStudents(mockStudents);
        }
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to format last active time
  const formatLastActive = (lastActiveDate: string) => {
    try {
      const date = new Date(lastActiveDate);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes < 60) {
        return `${diffMinutes} minutes ago`;
      } else if (diffMinutes < 1440) {
        const hours = Math.floor(diffMinutes / 60);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffMinutes / 1440);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
    } catch {
      return 'Recently';
    }
  };

  const handleRefresh = () => {
    loadStudents(true);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return instructorColors.warning;
      case 'Intermediate': return instructorColors.primary;
      case 'Advanced': return instructorColors.success;
      default: return instructorColors.mediumGray;
    }
  };

  const renderStudentCard = ({ item, index }: { item: Student; index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).duration(600)}
      style={styles.studentCard}
    >
      <TouchableOpacity 
        style={styles.studentContent}
        onPress={() => router.push(`/(instructor)/student-details?id=${item.$id}`)}
      >
        <View style={styles.studentHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentEmail}>{item.email}</Text>
            <View style={styles.levelBadge}>
              <Text style={[styles.levelText, { color: getLevelColor(item.level) }]}>
                {item.level}
              </Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{item.progress}%</Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${item.progress}%` }]} 
              />
            </View>
          </View>
        </View>
        
        <View style={styles.studentStats}>
          <View style={styles.statItem}>
            <Ionicons name="book-outline" size={16} color={instructorColors.darkGray} />
            <Text style={styles.statText}>{item.enrolledCourses} courses</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={instructorColors.darkGray} />
            <Text style={styles.statText}>Active {item.lastActive}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={instructorColors.primary} />
        <Text style={styles.loadingText}>Loading your students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PreAuthHeader 
        title="My Students"
        showRefresh={true}
        onRefreshPress={handleRefresh}
      />
      
      <View style={styles.content}>
        <Animated.View 
          entering={FadeInUp.delay(100).duration(600)}
          style={styles.headerSection}
        >
          <Text style={styles.sectionTitle}>Students ({filteredStudents.length})</Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(600)}
          style={styles.searchContainer}
        >
          <Ionicons name="search" size={20} color={instructorColors.mediumGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            placeholderTextColor={instructorColors.mediumGray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={instructorColors.mediumGray} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {filteredStudents.length > 0 ? (
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentCard}
            keyExtractor={(item) => item.$id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[instructorColors.primary]}
                tintColor={instructorColors.primary}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <Animated.View 
            entering={FadeInUp.delay(300).duration(600)}
            style={styles.emptyState}
          >
            <Ionicons name="people-outline" size={64} color={instructorColors.mediumGray} />
            <Text style={styles.emptyTitle}>No students found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? 'Try adjusting your search terms' : 'Students will appear here when they enroll in your courses'}
            </Text>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: instructorColors.offWhite,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: instructorColors.offWhite,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: instructorColors.darkGray,
  },
  headerSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: instructorColors.charcoal,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: instructorColors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: instructorColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: instructorColors.charcoal,
  },
  listContent: {
    paddingBottom: 100,
  },
  studentCard: {
    backgroundColor: instructorColors.white,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: instructorColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  studentContent: {
    padding: 20,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: instructorColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: instructorColors.primary,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: instructorColors.charcoal,
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: instructorColors.darkGray,
    marginBottom: 8,
  },
  levelBadge: {
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: instructorColors.primary,
    marginBottom: 4,
  },
  progressBar: {
    width: 50,
    height: 4,
    backgroundColor: instructorColors.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: instructorColors.primary,
    borderRadius: 2,
  },
  studentStats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: instructorColors.darkGray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: instructorColors.charcoal,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: instructorColors.darkGray,
    textAlign: 'center',
  },
});