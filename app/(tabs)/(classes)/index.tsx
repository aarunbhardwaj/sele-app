import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { borderRadius, colors } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';

// Mock data for upcoming classes
const upcomingClasses = [
  {
    id: '1',
    title: 'Pronunciation Workshop',
    instructor: 'Sarah Johnson',
    time: 'Tomorrow, 3:00 PM',
    duration: '45 min',
    level: 'Intermediate',
    participants: 8,
    maxParticipants: 12,
    imageUrl: require('../../../assets/images/app-logo.png')
  },
  {
    id: '2',
    title: 'Business English',
    instructor: 'David Miller',
    time: 'Wednesday, 5:30 PM',
    duration: '60 min',
    level: 'Advanced',
    participants: 6,
    maxParticipants: 10,
    imageUrl: require('../../../assets/images/app-logo.png')
  },
  {
    id: '3',
    title: 'Conversation Practice',
    instructor: 'Emma Wilson',
    time: 'Friday, 4:00 PM',
    duration: '60 min',
    level: 'Beginner',
    participants: 4,
    maxParticipants: 8,
    imageUrl: require('../../../assets/images/app-logo.png')
  }
];

// Mock data for instructors
const popularInstructors = [
  {
    id: '1',
    name: 'Sarah Johnson',
    specialty: 'Pronunciation',
    rating: 4.9,
    classes: 245,
    imageUrl: require('../../../assets/images/app-logo.png')
  },
  {
    id: '2',
    name: 'David Miller',
    specialty: 'Business English',
    rating: 4.8,
    classes: 178,
    imageUrl: require('../../../assets/images/app-logo.png')
  },
  {
    id: '3',
    name: 'Emma Wilson',
    specialty: 'Conversation',
    rating: 4.7,
    classes: 203,
    imageUrl: require('../../../assets/images/app-logo.png')
  },
  {
    id: '4',
    name: 'Michael Brown',
    specialty: 'Grammar',
    rating: 4.9,
    classes: 156,
    imageUrl: require('../../../assets/images/app-logo.png')
  },
];

// Class categories
const classCategories = [
  { id: '1', name: 'All', icon: 'grid-outline', active: true },
  { id: '2', name: 'Pronunciation', icon: 'mic-outline', active: false },
  { id: '3', name: 'Grammar', icon: 'school-outline', active: false },
  { id: '4', name: 'Business', icon: 'briefcase-outline', active: false },
  { id: '5', name: 'Conversation', icon: 'chatbubbles-outline', active: false },
];

export default function ClassesIndex() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('1');
  const [myClasses, setMyClasses] = useState(2); // Mock user data
  const [totalHours, setTotalHours] = useState(4.5); // Mock user data
  
  // Animation values
  const fade = useSharedValue(0);
  useEffect(() => {
    // Ensure animation runs on component mount
    fade.value = withTiming(1, { duration: 600 });
  }, []);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));
  
  const renderClassCard = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.animatedCard}
    >
      <Card style={styles.classCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="videocam-outline" size={24} color={colors.primary.main} />
          <Text variant="subtitle1" style={styles.classTitle}>{item.title}</Text>
          <View style={styles.levelBadge}>
            <Text variant="caption" style={styles.levelText}>{item.level}</Text>
          </View>
        </View>
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.neutral.darkGray} />
            <Text variant="body2" style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color={colors.neutral.darkGray} />
            <Text variant="body2" style={styles.detailText}>{item.instructor}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={colors.neutral.darkGray} />
            <Text variant="body2" style={styles.detailText}>{item.duration}</Text>
          </View>
          <View style={styles.participantsContainer}>
            <Text variant="caption" style={styles.participantsText}>
              {item.participants}/{item.maxParticipants} participants
            </Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${(item.participants / item.maxParticipants) * 100}%` }
                ]} 
              />
            </View>
          </View>
        </View>
        <View style={styles.cardActions}>
          <Button 
            title="Join Class" 
            variant="primary" 
            size="small"
            style={styles.joinButton}
            onPress={() => router.push('/(tabs)/(classes)/classroom')}
          />
          <Button 
            title="Details" 
            variant="outline" 
            size="small"
            style={styles.detailsButton}
            onPress={() => router.push(`/(tabs)/(classes)/details?id=${item.id}`)}
          />
        </View>
      </Card>
    </Animated.View>
  );
  
  const renderInstructor = ({ item, index }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      style={{ marginRight: 16, width: 140 }}
    >
      <TouchableOpacity 
        style={styles.instructorCard}
        onPress={() => router.push(`/(tabs)/(classes)/instructor?id=${item.id}`)}
      >
        <Image
          source={item.imageUrl}
          style={styles.instructorImage}
        />
        <Text variant="subtitle2" style={styles.instructorName}>{item.name}</Text>
        <Text variant="caption" style={styles.instructorSpecialty}>{item.specialty}</Text>
        <View style={styles.instructorStats}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text variant="caption" style={styles.instructorRating}>{item.rating}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        activeCategory === category.id && styles.activeCategory
      ]}
      onPress={() => setActiveCategory(category.id)}
    >
      <Ionicons 
        name={category.icon} 
        size={18} 
        color={activeCategory === category.id ? colors.neutral.white : colors.neutral.darkGray} 
      />
      <Text 
        variant="caption"
        style={[
          styles.categoryText,
          activeCategory === category.id && styles.activeCategoryText
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PreAuthHeader 
          title="Live Classes" 
        />
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, fadeStyle]}>
            {/* Header with welcome text */}
            <Text variant="h4" style={styles.heading}>Live Classes</Text>
            <Text variant="body1" style={styles.subtitle}>
              Join interactive live classes with our experienced instructors
            </Text>
            
            {/* Progress Stats */}
            <Animated.View 
              entering={FadeInDown.delay(150).springify()}
              style={styles.statsContainer}
            >
              <View style={styles.statCard}>
                <Text variant="h3" style={styles.statValue}>{myClasses}</Text>
                <Text variant="caption" style={styles.statLabel}>Classes This Week</Text>
              </View>
              <View style={styles.statCard}>
                <Text variant="h3" style={styles.statValue}>{totalHours}</Text>
                <Text variant="caption" style={styles.statLabel}>Hours Completed</Text>
              </View>
            </Animated.View>
            
            {/* Action Buttons */}
            <Animated.View 
              entering={FadeInDown.delay(250).springify()}
              style={styles.buttonContainer}
            >
              <Button 
                title="View Class Schedule"
                variant="primary"
                onPress={() => router.push('/(tabs)/(classes)/schedule')}
                style={styles.button}
                leftIcon={<Ionicons name="calendar-outline" size={20} color="white" />}
              />
              
              <Button 
                title="Book a Class" 
                variant="secondary"
                onPress={() => router.push('/(tabs)/(classes)/booking')}
                style={styles.button}
                leftIcon={<Ionicons name="add-circle-outline" size={20} color={colors.secondary.main} />}
              />
              
              <Button 
                title="My Class History" 
                variant="outline"
                onPress={() => router.push('/(tabs)/(classes)/history')}
                style={styles.button}
                leftIcon={<Ionicons name="time-outline" size={20} color={colors.primary.main} />}
              />
            </Animated.View>

            {/* Class Categories */}
            <Text variant="h5" style={styles.sectionTitle}>Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContentContainer}
            >
              {classCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    activeCategory === category.id && styles.activeCategory
                  ]}
                  onPress={() => setActiveCategory(category.id)}
                >
                  <Ionicons 
                    name={category.icon} 
                    size={18} 
                    color={activeCategory === category.id ? colors.neutral.white : colors.neutral.darkGray} 
                  />
                  <Text 
                    variant="caption"
                    style={[
                      styles.categoryText,
                      activeCategory === category.id && styles.activeCategoryText
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* Upcoming Classes */}
            <View style={styles.featuredSection}>
              <Text variant="h5" style={styles.sectionTitle}>Upcoming Classes</Text>
              {upcomingClasses.map((item, index) => (
                <View key={item.id}>
                  {renderClassCard({item, index})}
                </View>
              ))}
            </View>
            
            {/* Popular Instructors */}
            <View style={styles.featuredSection}>
              <View style={styles.sectionHeader}>
                <Text variant="h5" style={styles.sectionTitle}>Popular Instructors</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/(classes)/instructors')}>
                  <Text variant="body2" color={colors.secondary.main}>View All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                data={popularInstructors}
                renderItem={renderInstructor}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 8 }}
              />
            </View>
            
            {/* Community */}
            <View style={styles.communitySection}>
              <View style={styles.communityCard}>
                <Text variant="h5" style={styles.communityTitle}>Join Our Community</Text>
                <Text variant="body2" style={styles.communityText}>
                  Practice with other students in our weekly community classes
                </Text>
                <Button 
                  title="Explore Community Classes" 
                  variant="primary"
                  onPress={() => router.push('/(tabs)/(classes)/community')}
                  style={styles.communityButton}
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingBottom: 40,
  },
  heading: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    padding: 16,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    color: colors.primary.main,
    fontWeight: 'bold',
    fontSize: 28, // Make stat number larger and more prominent
  },
  statLabel: {
    marginTop: 4,
    color: colors.neutral.darkGray,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  button: {
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  categoriesContentContainer: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.full,
    marginRight: 8,
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  activeCategory: {
    backgroundColor: colors.primary.main,
  },
  categoryText: {
    marginLeft: 6,
    color: colors.neutral.darkGray,
  },
  activeCategoryText: {
    color: colors.neutral.white,
  },
  featuredSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
    color: colors.neutral.darkGray, // Make section titles more visible
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  animatedCard: {
    marginBottom: 16,
  },
  classCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2, // Slightly larger shadow for better visibility
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  classTitle: {
    marginLeft: 8,
    fontWeight: '600',
    flex: 1,
  },
  levelBadge: {
    backgroundColor: colors.secondary.light,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  levelText: {
    color: colors.secondary.dark,
    fontWeight: '500',
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
  },
  participantsContainer: {
    marginTop: 8,
  },
  participantsText: {
    marginBottom: 4,
    color: colors.neutral.darkGray,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.neutral.lightGray,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary.main,
  },
  cardActions: {
    flexDirection: 'row',
  },
  joinButton: {
    marginRight: 8,
    flex: 2,
  },
  detailsButton: {
    flex: 1,
  },
  instructorCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.md,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  instructorImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
  },
  instructorName: {
    textAlign: 'center',
    fontWeight: '600',
  },
  instructorSpecialty: {
    textAlign: 'center',
    color: colors.neutral.darkGray,
    marginBottom: 4,
  },
  instructorStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorRating: {
    marginLeft: 4,
    fontWeight: '500',
  },
  communitySection: {
    marginBottom: 24,
  },
  communityCard: {
    backgroundColor: colors.secondary.light + '30',
    borderRadius: borderRadius.md,
    padding: 24,
    alignItems: 'center',
    // Add shadow for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  communityTitle: {
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  communityText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  communityButton: {
    minWidth: 200,
  }
});