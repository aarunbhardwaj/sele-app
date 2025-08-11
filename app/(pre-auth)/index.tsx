import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import PreAuthHeader from '../../components/ui/Header';
import Text from '../../components/ui/Typography';

const { width } = Dimensions.get('window');

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

// Features data with Airbnb-style approach
const features = [
  {
    id: '1',
    title: 'Learn Anywhere',
    description: 'Practice English lessons at your own pace, anytime',
    icon: 'location' as const,
    gradient: ['#FF5A5F', '#FF8E53'],
  },
  {
    id: '2',
    title: 'Native Speakers',
    description: 'Learn from qualified British English teachers',
    icon: 'people' as const,
    gradient: ['#00A699', '#00D2FF'],
  },
  {
    id: '3',
    title: 'Track Progress',
    description: 'See your improvement with detailed analytics',
    icon: 'trending-up' as const,
    gradient: ['#FC642D', '#FFB347'],
  },
];

// Simple testimonial data
const testimonials = [
  {
    id: '1',
    name: 'Sarah J.',
    text: 'Improved my English in just weeks!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Miguel R.',
    text: 'Best language learning app I\'ve used.',
    rating: 5,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  
  // Animation values
  const logoScale = useSharedValue(0.8);
  const heroOpacity = useSharedValue(0);
  const featuresOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(0.9);
  
  useEffect(() => {
    // Logo entrance animation
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 600 }),
      withTiming(1, { duration: 400 })
    );
    
    // Hero section animation
    heroOpacity.value = withTiming(1, { duration: 800 });
    
    // Features animation with delay
    featuresOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    
    // CTA animation
    ctaScale.value = withDelay(800, withSpring(1, { damping: 12 }));
  }, []);
  
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));
  
  const heroAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
  }));
  
  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));
  
  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Airbnb-styled header */}
      <PreAuthHeader 
        title="Discover English"
        subtitle="Start your learning journey"
        showNotifications={true}
        onNotificationPress={() => console.log('Notifications pressed')}
        accessible={true}
        accessibilityLabel="Home Screen Header"
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - Airbnb style */}
        <Animated.View 
          style={[styles.heroSection, heroAnimatedStyle]}
          entering={FadeInDown.delay(100).duration(800)}
        >
          {/* Logo */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/images/app-logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="English Learning App Logo"
              />
            </View>
          </Animated.View>
          
          {/* Main heading */}
          <Text style={styles.heroTitle}>
            Master English{'\n'}Like a Native
          </Text>
          
          <Text style={styles.heroSubtitle}>
            Join thousands of learners worldwide improving their English with our interactive lessons and expert guidance.
          </Text>
          
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color={airbnbColors.mediumGray} />
              <Text style={styles.statText}>50K+ Students</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color={airbnbColors.warning} />
              <Text style={styles.statText}>4.8 Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="globe" size={16} color={airbnbColors.mediumGray} />
              <Text style={styles.statText}>30+ Countries</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Features Section - Clean cards */}
        <Animated.View 
          style={[styles.featuresSection, featuresAnimatedStyle]}
          entering={FadeInUp.delay(300).duration(800)}
        >
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Animated.View
                key={feature.id}
                entering={FadeInUp.delay(400 + index * 100).duration(600)}
                style={styles.featureCard}
              >
                <View style={styles.featureIconContainer}>
                  <Ionicons 
                    name={feature.icon} 
                    size={24} 
                    color={airbnbColors.primary} 
                  />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
        
        {/* Testimonials - Simple */}
        <Animated.View 
          style={styles.testimonialsSection}
          entering={FadeInUp.delay(600).duration(800)}
        >
          <Text style={styles.sectionTitle}>Student Success</Text>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsScrollContent}
          >
            {testimonials.map((testimonial, index) => (
              <Animated.View
                key={testimonial.id}
                entering={FadeInUp.delay(700 + index * 100).duration(600)}
                style={styles.testimonialCard}
              >
                <View style={styles.starsContainer}>
                  {Array(5).fill(0).map((_, i) => (
                    <Ionicons 
                      key={i} 
                      name="star" 
                      size={14} 
                      color={airbnbColors.warning} 
                      style={styles.starIcon}
                    />
                  ))}
                </View>
                <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
                <Text style={styles.testimonialName}>- {testimonial.name}</Text>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
        
        {/* Final CTA Section */}
        <Animated.View 
          style={[styles.ctaSection, ctaAnimatedStyle]}
          entering={FadeInUp.delay(800).duration(800)}
        >
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaTitle}>Ready to Start?</Text>
            <Text style={styles.ctaSubtitle}>
              Begin your English learning journey today
            </Text>
            
            <View style={styles.ctaButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/(pre-auth)/signup')}
                accessible={true}
                accessibilityLabel="Sign up for free account"
              >
                <Text style={styles.primaryButtonText}>Get Started Free</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/(pre-auth)/login')}
                accessible={true}
                accessibilityLabel="Log in to existing account"
              >
                <Text style={styles.secondaryButtonText}>Already have an account?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
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
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: airbnbColors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 18,
    color: airbnbColors.darkGray,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    fontWeight: '500',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: -0.5,
  },
  featuresGrid: {
    gap: 24,
  },
  featureCard: {
    backgroundColor: airbnbColors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: airbnbColors.gray,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: airbnbColors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: airbnbColors.darkGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  testimonialsSection: {
    paddingBottom: 60,
  },
  testimonialsScrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  testimonialCard: {
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 12,
    padding: 20,
    width: width - 80,
    marginRight: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  starIcon: {
    marginRight: 2,
  },
  testimonialText: {
    fontSize: 16,
    color: airbnbColors.charcoal,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 22,
  },
  testimonialName: {
    fontSize: 14,
    color: airbnbColors.darkGray,
    fontWeight: '600',
  },
  ctaSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  ctaContainer: {
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: airbnbColors.charcoal,
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: airbnbColors.darkGray,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  ctaButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: airbnbColors.primary,
    borderRadius: 8,
    height: 52,
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
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: airbnbColors.primary,
  },
});