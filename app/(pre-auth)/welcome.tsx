import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import PreAuthHeader from '../../components/ui/Header';
import Text from '../../components/ui/Typography';
import { useAuth } from '../../services/AuthContext';
import { useLearningProgress } from '../../services/LearningProgressContext';

// Airbnb-inspired color palette
const airbnbColors = {
  // Primary Airbnb colors
  primary: '#FF5A5F',        // Airbnb's signature coral/red
  primaryDark: '#E8484D',    // Darker variant
  primaryLight: '#FFE8E9',   // Light coral background
  
  // Secondary colors
  secondary: '#00A699',      // Teal for accents
  secondaryLight: '#E0F7F5', // Light teal background
  
  // Neutral palette (very Airbnb-esque)
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  gray: '#EBEBEB',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  black: '#222222',
  
  // Status colors
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
  
  // Focus and interaction
  focus: '#FF5A5F',
  focusLight: 'rgba(255, 90, 95, 0.1)',
};

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { streakDays, overallCompletion } = useLearningProgress();
  
  // Animation values
  const logoScale = useSharedValue(0.9);
  const cardScale = useSharedValue(1);
  
  const userName = user?.name || "Learner";
  
  useEffect(() => {
    // Gentle logo entrance animation
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 600 }),
      withTiming(1, { duration: 400 })
    );
  }, []);
  
  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));
  
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));
  
  const handleCardPress = (action: () => void) => {
    cardScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );
    action();
  };

  return (
    <View style={styles.container}>
      {/* Airbnb-styled header */}
      <PreAuthHeader 
        title="Welcome Back"
        subtitle="Ready to continue learning?"
        showNotifications={true}
        onNotificationPress={() => console.log('Notifications pressed')}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main content container */}
        <Animated.View 
          entering={FadeIn.delay(200).duration(800)}
          style={styles.contentContainer}
        >
          {/* Logo and welcome section */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/images/app-logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="Application logo"
              />
            </View>
          </Animated.View>
          
          {/* Welcome message */}
          <Animated.View 
            entering={FadeInDown.delay(300).duration(800)}
            style={styles.welcomeSection}
          >
            <Text style={styles.welcomeTitle}>Welcome back, {userName}!</Text>
            <Text style={styles.welcomeSubtitle}>
              Continue your language learning journey
            </Text>
          </Animated.View>
          
          {/* Stats cards - Airbnb style */}
          <Animated.View 
            entering={FadeInDown.delay(400).duration(800)}
            style={styles.statsContainer}
          >
            <Animated.View style={[styles.statCard, cardAnimatedStyle]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="flame" size={24} color={airbnbColors.warning} />
              </View>
              <Text style={styles.statValue}>{streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </Animated.View>
            
            <Animated.View style={[styles.statCard, cardAnimatedStyle]}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trophy" size={24} color={airbnbColors.secondary} />
              </View>
              <Text style={styles.statValue}>{Math.round(overallCompletion)}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </Animated.View>
          </Animated.View>
          
          {/* Action cards - Clean Airbnb style */}
          <Animated.View 
            entering={FadeInUp.delay(500).duration(800)}
            style={styles.actionsContainer}
          >
            {/* Continue Learning Card */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleCardPress(() => router.push('/(tabs)'))}
              accessible={true}
              accessibilityLabel="Continue learning, go to main app"
            >
              <View style={styles.actionCardContent}>
                <View style={[styles.actionIcon, { backgroundColor: airbnbColors.primaryLight }]}>
                  <Ionicons name="play" size={24} color={airbnbColors.primary} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Continue Learning</Text>
                  <Text style={styles.actionSubtitle}>Pick up where you left off</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
              </View>
            </TouchableOpacity>
            
            {/* Daily Practice Card */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleCardPress(() => router.push('/(tabs)/quiz'))}
              accessible={true}
              accessibilityLabel="Start daily practice quiz"
            >
              <View style={styles.actionCardContent}>
                <View style={[styles.actionIcon, { backgroundColor: airbnbColors.secondaryLight }]}>
                  <Ionicons name="checkmark-circle" size={24} color={airbnbColors.secondary} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Daily Practice</Text>
                  <Text style={styles.actionSubtitle}>5 minutes to stay sharp</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
              </View>
            </TouchableOpacity>
            
            {/* Explore Courses Card */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleCardPress(() => router.push('/(tabs)/courses'))}
              accessible={true}
              accessibilityLabel="Explore available courses"
            >
              <View style={styles.actionCardContent}>
                <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                  <Ionicons name="library" size={24} color="#9C27B0" />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Explore Courses</Text>
                  <Text style={styles.actionSubtitle}>Discover new topics</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={airbnbColors.mediumGray} />
              </View>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Quick stats section */}
          <Animated.View 
            entering={FadeInUp.delay(600).duration(800)}
            style={styles.quickStatsContainer}
          >
            <Text style={styles.quickStatsTitle}>This Week</Text>
            <View style={styles.quickStatsGrid}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>45</Text>
                <Text style={styles.quickStatLabel}>Minutes</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>12</Text>
                <Text style={styles.quickStatLabel}>Lessons</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatValue}>87</Text>
                <Text style={styles.quickStatLabel}>Words</Text>
              </View>
            </View>
          </Animated.View>
          
          {/* Achievement badge */}
          <Animated.View 
            entering={FadeInUp.delay(700).duration(800)}
            style={styles.achievementContainer}
          >
            <View style={styles.achievementBadge}>
              <Ionicons name="star" size={20} color={airbnbColors.warning} />
              <Text style={styles.achievementText}>
                Great job! You're on a {streakDays}-day streak
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
      
      {/* Footer CTA */}
      <Animated.View 
        entering={FadeInUp.delay(800).duration(800)}
        style={styles.footer}
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(tabs)')}
          accessible={true}
          accessibilityLabel="Start learning now"
        >
          <Text style={styles.primaryButtonText}>Start Learning</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: airbnbColors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: airbnbColors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 60,
    height: 60,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: airbnbColors.darkGray,
    lineHeight: 24,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: airbnbColors.gray,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: airbnbColors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    fontWeight: '500',
  },
  actionsContainer: {
    marginBottom: 32,
  },
  actionCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: airbnbColors.gray,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
  quickStatsContainer: {
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  quickStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 16,
    textAlign: 'center',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: airbnbColors.primary,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: airbnbColors.darkGray,
    fontWeight: '500',
  },
  achievementContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  achievementText: {
    fontSize: 14,
    color: airbnbColors.charcoal,
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: airbnbColors.white,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.gray,
  },
  primaryButton: {
    backgroundColor: airbnbColors.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.white,
  },
});