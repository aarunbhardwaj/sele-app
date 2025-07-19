import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Header from '../../../components/ui/Header';
import { borderRadius, colors, spacing, typography } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';

// Mock data for course categories
const categories = [
  { id: '1', name: 'All Courses', icon: 'book' },
  { id: '2', name: 'Pronunciation', icon: 'mic' },
  { id: '3', name: 'Grammar', icon: 'school' },
  { id: '4', name: 'Vocabulary', icon: 'text' },
  { id: '5', name: 'Conversation', icon: 'chatbubbles' },
  { id: '6', name: 'Business', icon: 'briefcase' },
];

// Mock data for featured courses
const featuredCourses = [
  {
    id: '1',
    title: 'Complete British English Masterclass',
    level: 'All Levels',
    rating: 4.9,
    reviews: 1243,
    students: 15420,
    price: 89.99,
    discountPrice: 49.99,
    instructor: 'Emma Thompson',
    image: require('../../../assets/images/app-logo.png'),
    isBestseller: true,
  },
  {
    id: '2',
    title: 'British Accent: Pronunciation Secrets',
    level: 'Beginner',
    rating: 4.7,
    reviews: 853,
    students: 9240,
    price: 69.99,
    discountPrice: 34.99,
    instructor: 'James Wilson',
    image: require('../../../assets/images/app-logo.png'),
    isBestseller: false,
  },
];

// Mock data for all courses
const allCourses = [
  {
    id: '3',
    title: 'Advanced Business English & Presentations',
    level: 'Advanced',
    rating: 4.8,
    reviews: 654,
    students: 7320,
    price: 79.99,
    discountPrice: 39.99,
    instructor: 'Robert Clark',
    image: require('../../../assets/images/app-logo.png'),
    isBestseller: true,
    category: 'Business'
  },
  {
    id: '4',
    title: 'British Idioms and Expressions',
    level: 'Intermediate',
    rating: 4.6,
    reviews: 421,
    students: 5180,
    price: 59.99,
    discountPrice: 29.99,
    instructor: 'Sarah Johnson',
    image: require('../../../assets/images/app-logo.png'),
    isBestseller: false,
    category: 'Vocabulary'
  },
  {
    id: '5',
    title: 'Perfect Your Grammar: British English Rules',
    level: 'All Levels',
    rating: 4.5,
    reviews: 376,
    students: 4230,
    price: 64.99,
    discountPrice: 32.99,
    instructor: 'Michael Brown',
    image: require('../../../assets/images/app-logo.png'),
    isBestseller: false,
    category: 'Grammar'
  },
  {
    id: '6',
    title: 'Conversational Fluency in British English',
    level: 'Intermediate',
    rating: 4.7,
    reviews: 583,
    students: 6750,
    price: 74.99,
    discountPrice: 37.99,
    instructor: 'Emily White',
    image: require('../../../assets/images/app-logo.png'),
    isBestseller: true,
    category: 'Conversation'
  },
  // More courses...
];

export default function CoursesCatalogScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('1'); // Default to 'All Courses'
  
  // Filter courses based on search query and selected category
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === '1') return matchesSearch; // All Courses
    
    const categoryName = categories.find(cat => cat.id === selectedCategory)?.name;
    return matchesSearch && course.category === categoryName;
  });

  const renderCourseCard = ({ item }) => (
    <Card
      variant="elevated"
      style={styles.courseCard}
    >
      <TouchableOpacity 
        onPress={() => router.push(`/(tabs)/(courses)/details?id=${item.id}`)}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={item.image} 
            style={styles.courseImage} 
            resizeMode="cover" 
          />
          {item.isBestseller && (
            <View style={styles.bestsellerBadge}>
              <Text variant="caption" color={colors.neutral.black} style={styles.bestsellerText}>Bestseller</Text>
            </View>
          )}
        </View>
        <View style={styles.courseContent}>
          <View style={styles.courseHeader}>
            <Text variant="subtitle2" color={colors.secondary.main}>{item.level}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={colors.accent.main} />
              <Text variant="caption" color={colors.neutral.darkGray} style={styles.ratingText}>{item.rating} ({item.reviews} reviews)</Text>
            </View>
          </View>
          
          <Text variant="h5" style={styles.courseTitle}>{item.title}</Text>
          
          <Text variant="caption" color={colors.neutral.darkGray} style={styles.instructorText}>By {item.instructor} • {item.students} students</Text>
          
          <View style={styles.priceContainer}>
            <Text variant="subtitle1" color={colors.neutral.text} style={styles.discountPrice}>£{item.discountPrice}</Text>
            <Text variant="body2" color={colors.neutral.gray} style={styles.originalPrice}>£{item.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryButton,
        selectedCategory === item.id ? styles.categoryButtonActive : styles.categoryButtonInactive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={16} 
        color={selectedCategory === item.id ? colors.neutral.white : colors.neutral.darkGray} 
      />
      <Text 
        variant="body2" 
        color={selectedCategory === item.id ? colors.neutral.white : colors.neutral.text}
        style={styles.categoryButtonText}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Courses" 
        showLogo={true}
        rightIcon={<Ionicons name="search" size={22} color={colors.neutral.darkGray} />}
        onRightIconPress={() => {
          // Focus the search input
          // In a real app, you might want to show/hide a separate search screen
        }}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.neutral.gray} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses, instructors, etc."
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

          {/* Categories */}
          <View style={styles.categoriesSection}>
            <Text variant="h5" style={styles.sectionTitle}>Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScrollView}
            >
              {categories.map(item => renderCategoryButton({ item }))}
            </ScrollView>
          </View>

          {/* Featured Courses */}
          {selectedCategory === '1' && searchQuery === '' && (
            <View style={styles.featuredSection}>
              <View style={styles.sectionHeader}>
                <Text variant="h5" style={styles.sectionTitle}>Featured Courses</Text>
                <TouchableOpacity>
                  <Text variant="body2" color={colors.secondary.main} style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={featuredCourses}
                renderItem={renderCourseCard}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* All Courses or Filtered Courses */}
          <View style={styles.coursesSection}>
            <View style={styles.sectionHeader}>
              <Text variant="h5" style={styles.sectionTitle}>
                {selectedCategory === '1' && searchQuery === '' ? 'Popular Courses' : 'Courses'}
              </Text>
              {selectedCategory === '1' && searchQuery === '' && (
                <TouchableOpacity>
                  <Text variant="body2" color={colors.secondary.main} style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {filteredCourses.length > 0 ? (
              <FlatList
                data={filteredCourses}
                renderItem={renderCourseCard}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={64} color={colors.neutral.lightGray} />
                <Text variant="body1" color={colors.neutral.gray} style={styles.emptyStateText}>
                  No courses found matching your criteria.
                </Text>
                <Button
                  title="View All Courses"
                  variant="primary"
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('1');
                  }}
                  style={styles.emptyStateButton}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
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
  categoriesSection: {
    marginBottom: spacing.xl,
  },
  categoriesScrollView: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginRight: spacing.md,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary.main,
  },
  categoryButtonInactive: {
    backgroundColor: colors.neutral.lightGray,
  },
  categoryButtonText: {
    marginLeft: spacing.xs,
  },
  featuredSection: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontWeight: typography.fontWeights.medium,
  },
  courseCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  courseImage: {
    width: '100%',
    height: 144, // Fixed height for course images
  },
  bestsellerBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.accent.light,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  bestsellerText: {
    fontWeight: typography.fontWeights.bold,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
  },
  courseTitle: {
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
  },
  instructorText: {
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountPrice: {
    fontWeight: typography.fontWeights.bold,
  },
  originalPrice: {
    marginLeft: spacing.sm,
    textDecorationLine: 'line-through',
  },
  coursesSection: {
    marginBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  emptyStateButton: {
    marginTop: spacing.md,
  },
});