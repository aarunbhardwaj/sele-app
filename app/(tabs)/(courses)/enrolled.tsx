import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { borderRadius, colors, spacing, typography } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';

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
    image: require('../../../assets/images/app-logo.png'),
  },
  {
    id: '2',
    title: 'Advanced Conversational English',
    level: 'Intermediate',
    progress: 23,
    instructor: 'James Wilson',
    totalLessons: 15,
    completedLessons: 3,
    image: require('../../../assets/images/app-logo.png'),
  },
  {
    id: '3',
    title: 'Business English & Idioms',
    level: 'Advanced',
    progress: 78,
    instructor: 'Robert Clark',
    totalLessons: 10,
    completedLessons: 7,
    image: require('../../../assets/images/app-logo.png'),
  }
];

const ProgressBar = ({ progress }) => (
  <View style={styles.progressBarContainer}>
    <View 
      style={[styles.progressBar, { width: `${progress}%` }]} 
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
    <Card
      variant="elevated"
      style={styles.courseCard}
    >
      <TouchableOpacity onPress={() => router.push(`/(tabs)/(courses)/details?id=${item.id}`)}>
        <Image 
          source={item.image} 
          style={styles.courseImage} 
          resizeMode="cover" 
        />
        <View style={styles.courseContent}>
          <View style={styles.courseHeader}>
            <Text variant="subtitle2" color={colors.secondary.main}>{item.level}</Text>
            <View style={styles.instructorContainer}>
              <Ionicons name="person-outline" size={14} color={colors.neutral.darkGray} />
              <Text variant="caption" color={colors.neutral.darkGray} style={styles.instructorText}>
                {item.instructor}
              </Text>
            </View>
          </View>
          
          <Text variant="h5" style={styles.courseTitle}>{item.title}</Text>
          
          <ProgressBar progress={item.progress} />
          
          <View style={styles.progressInfo}>
            <Text variant="caption" color={colors.neutral.gray}>{item.progress}% complete</Text>
            <Text variant="caption" color={colors.neutral.gray}>
              {item.completedLessons}/{item.totalLessons} lessons
            </Text>
          </View>
          
          <Button
            title="Continue Learning"
            variant="primary"
            onPress={() => router.push(`/(tabs)/(courses)/progress?id=${item.id}`)}
            style={styles.continueButton}
            fullWidth
          />
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h2" color={colors.primary.main}>My Enrolled Courses</Text>
          <Text variant="body2" color={colors.neutral.darkGray} style={styles.subtitle}>
            Continue where you left off
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.neutral.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your courses"
            placeholderTextColor={colors.neutral.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
        >
          <TouchableOpacity 
            style={[
              styles.filterButton,
              activeFilter === 'all' && styles.activeFilterButton
            ]}
            onPress={() => setActiveFilter('all')}
          >
            <Text 
              variant="body2" 
              color={activeFilter === 'all' ? colors.neutral.white : colors.neutral.text}
            >
              All Courses
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              activeFilter === 'inProgress' && styles.activeFilterButton
            ]}
            onPress={() => setActiveFilter('inProgress')}
          >
            <Text 
              variant="body2" 
              color={activeFilter === 'inProgress' ? colors.neutral.white : colors.neutral.text}
            >
              In Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              activeFilter === 'notStarted' && styles.activeFilterButton
            ]}
            onPress={() => setActiveFilter('notStarted')}
          >
            <Text 
              variant="body2" 
              color={activeFilter === 'notStarted' ? colors.neutral.white : colors.neutral.text}
            >
              Not Started
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.filterButton,
              activeFilter === 'completed' && styles.activeFilterButton
            ]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text 
              variant="body2" 
              color={activeFilter === 'completed' ? colors.neutral.white : colors.neutral.text}
            >
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
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={colors.neutral.lightGray} />
            <Text variant="body1" color={colors.neutral.gray} style={styles.emptyStateText}>
              No courses matching your search.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  content: {
    paddingTop: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.neutral.lightGray,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    color: colors.neutral.text,
    fontSize: typography.fontSizes.md,
  },
  filtersContainer: {
    marginBottom: spacing.xl,
  },
  filterButton: {
    backgroundColor: colors.neutral.lightGray,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  activeFilterButton: {
    backgroundColor: colors.primary.main,
  },
  courseCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 144,
  },
  courseContent: {
    padding: spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorText: {
    marginLeft: 4,
  },
  courseTitle: {
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.full,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  continueButton: {
    marginTop: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: spacing.md,
  },
});