import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring
} from 'react-native-reanimated';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Typography';
import { spacing, typography } from '../../components/ui/theme';
import { useAuth } from '../../services/AuthContext';

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

// Mock data
const streakDays = 12;
const userName = 'Aarun';
const dailyGoalProgress = 75; // 75% complete
const weeklyProgress = 85;

const continueLearningData = [
  { 
    id: '1', 
    title: 'Business English Essentials', 
    progress: 68,
    nextLesson: 'Lesson 8: Meeting Vocabulary',
    image: require('../../assets/images/app-logo.png'),
    difficulty: 'Intermediate',
    estimatedTime: '15 min'
  },
  { 
    id: '2', 
    title: 'Conversation Practice', 
    progress: 45,
    nextLesson: 'Lesson 3: Daily Conversations',
    image: require('../../assets/images/app-logo.png'),
    difficulty: 'Beginner',
    estimatedTime: '20 min'
  },
  { 
    id: '3', 
    title: 'Grammar Fundamentals', 
    progress: 82,
    nextLesson: 'Lesson 12: Past Perfect Tense',
    image: require('../../assets/images/app-logo.png'),
    difficulty: 'Advanced',
    estimatedTime: '12 min'
  },
];

const quickActions = [
  { id: '1', title: 'Take Quiz', icon: 'help-circle', route: '/(tabs)/(quiz)/categories', color: airbnbColors.primary },
  { id: '2', title: 'Live Classes', icon: 'people', route: '/(tabs)/(classes)', color: airbnbColors.secondary },
  { id: '3', title: 'My Courses', icon: 'book', route: '/(tabs)/(courses)/enrolled', color: airbnbColors.warning },
  { id: '4', title: 'Progress', icon: 'analytics', route: '/(tabs)/(learning)/dashboard', color: '#8B5CF6' },
];

const achievements = [
  { id: '1', title: '7-Day Streak', icon: 'flame', completed: true },
  { id: '2', title: 'First Course', icon: 'trophy', completed: true },
  { id: '3', title: 'Quiz Master', icon: 'medal', completed: false },
];

// This is the correct way to define options for Expo Router
export const unstable_settings = {
  // This ensures proper routing in the new structure
  initialRouteName: "index"
};

export default function HomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Animation values
  const headerScale = useSharedValue(0.8);
  const cardScale = useSharedValue(0.9);
  
  useEffect(() => {
    // Animate elements on mount
    headerScale.value = withSpring(1, { damping: 15 });
    cardScale.value = withDelay(200, withSpring(1, { damping: 15 }));
    
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderContinueLearningCard = ({ item, index }) => (
    <Animated.View
      entering={FadeInUp.delay(300 + index * 100).duration(600)}
      key={item.id}
    >
      <TouchableOpacity
        style={styles.learningCard}
        onPress={() => router.push(`/(tabs)/(courses)/progress?id=${item.id}`)}
        activeOpacity={0.8}
      >
        <Card style={styles.learningCardContent}>
          <View style={styles.learningCardHeader}>
            <Image source={item.image} style={styles.courseImage} />
            <View style={styles.courseInfo}>
              <Text variant="subtitle2" style={styles.courseTitle}>{item.title}</Text>
              <Text variant="caption" style={styles.courseSubtitle}>{item.nextLesson}</Text>
              <View style={styles.courseMeta}>
                <View style={[styles.difficultyBadge, { backgroundColor: item.difficulty === 'Beginner' ? airbnbColors.success + '20' : item.difficulty === 'Intermediate' ? airbnbColors.warning + '20' : airbnbColors.error + '20' }]}>
                  <Text variant="caption" style={[styles.difficultyText, { color: item.difficulty === 'Beginner' ? airbnbColors.success : item.difficulty === 'Intermediate' ? airbnbColors.warning : airbnbColors.error }]}>
                    {item.difficulty}
                  </Text>
                </View>
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={12} color={airbnbColors.mediumGray} />
                  <Text variant="caption" style={styles.timeText}>{item.estimatedTime}</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text variant="caption" style={styles.progressText}>{item.progress}% complete</Text>
              <TouchableOpacity>
                <Ionicons name="play-circle" size={24} color={airbnbColors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuickAction = ({ item, index }) => (
    <Animated.View
      entering={FadeInUp.delay(600 + index * 50).duration(400)}
      style={styles.quickActionWrapper}
      key={item.id}
    >
      <TouchableOpacity
        style={[styles.quickActionCard, { backgroundColor: item.color + '15' }]}
        onPress={() => router.push(item.route as any)}
        activeOpacity={0.7}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: item.color + '25' }]}>
          <Ionicons name={item.icon as any} size={24} color={item.color} />
        </View>
        <Text variant="caption" style={styles.quickActionText}>{item.title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={airbnbColors.offWhite} 
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          bounces={true}
        >
          {/* Header Section */}
          <Animated.View style={[styles.header, headerAnimatedStyle]} entering={FadeIn.duration(800)}>
            <View style={styles.headerContent}>
              <View style={styles.greetingContainer}>
                <Text variant="h4" style={styles.greetingText}>{getGreeting()}</Text>
                <Text variant="h2" style={styles.nameText}>{userName}! 👋</Text>
              </View>
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/(profile)')}
                style={styles.profileButton}
              >
                <View style={styles.profileImageContainer}>
                  <Text style={styles.profileInitial}>{userName.charAt(0)}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Streak & Progress Card */}
          <Animated.View style={cardAnimatedStyle} entering={FadeInDown.delay(200).duration(800)}>
            <Card style={styles.progressCard}>
              <View style={styles.progressCardHeader}>
                <View style={styles.streakSection}>
                  <View style={styles.streakIcon}>
                    <Ionicons name="flame" size={20} color={airbnbColors.warning} />
                  </View>
                  <View>
                    <Text variant="subtitle1" style={styles.streakNumber}>{streakDays}</Text>
                    <Text variant="caption" style={styles.streakLabel}>Day Streak</Text>
                  </View>
                </View>
                
                <View style={styles.goalSection}>
                  <View style={styles.circularProgress}>
                    <Text variant="subtitle2" style={styles.progressPercentage}>{dailyGoalProgress}%</Text>
                  </View>
                  <Text variant="caption" style={styles.goalLabel}>Daily Goal</Text>
                </View>
              </View>
              
              <View style={styles.weeklyProgressSection}>
                <Text variant="body2" style={styles.weeklyProgressLabel}>This week's progress</Text>
                <View style={styles.weeklyProgressBar}>
                  <View style={[styles.weeklyProgressFill, { width: `${weeklyProgress}%` }]} />
                </View>
                <Text variant="caption" style={styles.weeklyProgressText}>{weeklyProgress}% of weekly goal</Text>
              </View>
            </Card>
          </Animated.View>

          {/* Continue Learning Section */}
          <View style={styles.sectionContainer}>
            <Animated.View entering={FadeInUp.delay(400).duration(600)}>
              <View style={styles.sectionHeader}>
                <Text variant="h5" style={styles.sectionTitle}>Continue Learning</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/(courses)/enrolled')}>
                  <Text variant="body2" style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            
            <FlatList
              horizontal
              data={continueLearningData}
              renderItem={renderContinueLearningCard}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.learningListContainer}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionContainer}>
            <Animated.View entering={FadeInUp.delay(600).duration(600)}>
              <View style={styles.sectionHeader}>
                <Text variant="h5" style={styles.sectionTitle}>Quick Actions</Text>
              </View>
            </Animated.View>
            
            <View style={styles.quickActionsGrid}>
              {quickActions.map((item, index) => renderQuickAction({ item, index }))}
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.sectionContainer}>
            <Animated.View entering={FadeInUp.delay(800).duration(600)}>
              <View style={styles.sectionHeader}>
                <Text variant="h5" style={styles.sectionTitle}>Achievements</Text>
              </View>
            </Animated.View>
            
            <Animated.View entering={FadeInUp.delay(900).duration(600)}>
              <Card style={styles.achievementsCard}>
                <View style={styles.achievementsGrid}>
                  {achievements.map((achievement, index) => (
                    <View key={achievement.id} style={styles.achievementItem}>
                      <View style={[
                        styles.achievementIcon,
                        { backgroundColor: achievement.completed ? airbnbColors.success + '20' : airbnbColors.gray }
                      ]}>
                        <Ionicons 
                          name={achievement.icon as any} 
                          size={16} 
                          color={achievement.completed ? airbnbColors.success : airbnbColors.mediumGray} 
                        />
                      </View>
                      <Text 
                        variant="caption" 
                        style={[
                          styles.achievementText,
                          { color: achievement.completed ? airbnbColors.charcoal : airbnbColors.mediumGray }
                        ]}
                      >
                        {achievement.title}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            </Animated.View>
          </View>

          {/* Bottom Padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  scrollView: {
    flex: 1,
    backgroundColor: airbnbColors.offWhite,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.sm, // Reduced by half again
    paddingBottom: spacing.lg,
    backgroundColor: airbnbColors.offWhite,
    zIndex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    color: airbnbColors.darkGray,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: typography.fontWeights.medium as any,
  },
  nameText: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold as any,
    fontSize: 28,
  },
  profileButton: {
    padding: 4,
  },
  profileImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: airbnbColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: {
    color: airbnbColors.white,
    fontSize: 18,
    fontWeight: typography.fontWeights.semibold as any,
  },
  progressCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: airbnbColors.white,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: airbnbColors.warning + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  streakNumber: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.bold as any,
  },
  streakLabel: {
    color: airbnbColors.mediumGray,
  },
  goalSection: {
    alignItems: 'center',
  },
  circularProgress: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: airbnbColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressPercentage: {
    color: airbnbColors.primary,
    fontWeight: typography.fontWeights.bold as any,
  },
  goalLabel: {
    color: airbnbColors.mediumGray,
  },
  weeklyProgressSection: {
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
    paddingTop: spacing.md,
  },
  weeklyProgressLabel: {
    color: airbnbColors.charcoal,
    marginBottom: spacing.sm,
  },
  weeklyProgressBar: {
    height: 8,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  weeklyProgressFill: {
    height: 8,
    backgroundColor: airbnbColors.secondary,
    borderRadius: 4,
  },
  weeklyProgressText: {
    color: airbnbColors.mediumGray,
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.semibold as any,
  },
  seeAllText: {
    color: airbnbColors.primary,
    fontWeight: typography.fontWeights.medium as any,
  },
  learningListContainer: {
    paddingLeft: spacing.lg,
  },
  learningCard: {
    marginRight: spacing.md,
    width: 280,
  },
  learningCardContent: {
    padding: spacing.md,
    backgroundColor: airbnbColors.white,
  },
  learningCardHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  courseImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.semibold as any,
    marginBottom: spacing.xs,
  },
  courseSubtitle: {
    color: airbnbColors.mediumGray,
    marginBottom: spacing.sm,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: typography.fontWeights.medium as any,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: airbnbColors.mediumGray,
    marginLeft: 4,
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: airbnbColors.lightGray,
    paddingTop: spacing.sm,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressText: {
    color: airbnbColors.mediumGray,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 3,
  },
  progressBar: {
    height: 6,
    backgroundColor: airbnbColors.primary,
    borderRadius: 3,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  quickActionWrapper: {
    width: '48%',
    marginBottom: spacing.md,
  },
  quickActionCard: {
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  quickActionText: {
    color: airbnbColors.charcoal,
    fontWeight: typography.fontWeights.medium as any,
    textAlign: 'center',
  },
  achievementsCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    backgroundColor: airbnbColors.white,
  },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementItem: {
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  achievementText: {
    textAlign: 'center',
    fontSize: 11,
  },
  bottomPadding: {
    height: 120, // Increased bottom padding
  },
});