import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    FadeInRight,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import Text from '../../components/ui/Typography';
import { Button } from '../../components/ui2/button-native';
import { Card, CardContent } from '../../components/ui2/card-native';
import PreAuthHeader from '../../components/ui2/pre-auth-header';

const { width } = Dimensions.get('window');

// Features data
const features = [
  {
    id: '1',
    title: 'Learn from Native Speakers',
    description: 'Learn authentic British English from qualified native speakers',
    icon: 'people' as const,
    color: '#a855f7', // Using secondary color
    unlocked: true,
    background: 'bg-purple-100',
    iconBg: 'bg-purple-200',
    iconColor: '#a855f7',
  },
  {
    id: '2',
    title: 'Interactive Lessons',
    description: 'Engaging lessons with audio, video, and practice exercises',
    icon: 'play-circle' as const,
    color: '#f59e0b', // Using accent color
    unlocked: true,
    background: 'bg-amber-100',
    iconBg: 'bg-amber-200',
    iconColor: '#f59e0b',
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'Personalized learning analytics to monitor your improvement',
    icon: 'stats-chart' as const,
    color: '#14b8a6', // Using primary color
    unlocked: false,
    background: 'bg-teal-100',
    iconBg: 'bg-teal-200',
    iconColor: '#14b8a6',
  },
  {
    id: '4',
    title: 'Practice Anytime',
    description: 'Flexible learning schedules that fit your busy life',
    icon: 'time' as const,
    color: '#7e22ce', // Using secondary dark
    unlocked: false,
    background: 'bg-purple-100',
    iconBg: 'bg-purple-200',
    iconColor: '#7e22ce',
  },
];

// Testimonials data
const testimonials = [
  {
    id: '1',
    name: 'Sarah J.',
    country: 'France',
    text: 'This app transformed my English skills! The British accent lessons are exceptional.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Miguel R.',
    country: 'Spain',
    text: 'I improved my business English in just two months. Highly recommend!',
    rating: 5,
  },
  {
    id: '3',
    name: 'Yuki T.',
    country: 'Japan',
    text: 'The pronunciation exercises helped me sound more natural when speaking.',
    rating: 4,
  },
];

// Learning paths inspired by Duolingo
const learningPaths = [
  {
    id: '1',
    title: 'Pronunciation Basics',
    lessons: 5,
    completed: 0,
    difficulty: 'Beginner',
    icon: 'mic' as const,
    color: '#22c55e',
    background: 'bg-green-100',
    progressColor: 'bg-green-500',
    buttonColor: 'bg-green-500',
    iconBg: 'bg-green-200',
    iconColor: '#22c55e',
  },
  {
    id: '2',
    title: 'Everyday Conversations',
    lessons: 10,
    completed: 0,
    difficulty: 'Intermediate',
    icon: 'chatbubbles' as const,
    color: '#3b82f6',
    background: 'bg-blue-100',
    progressColor: 'bg-blue-500',
    buttonColor: 'bg-blue-500',
    iconBg: 'bg-blue-200',
    iconColor: '#3b82f6',
  },
  {
    id: '3',
    title: 'British Idioms',
    lessons: 8,
    completed: 0,
    difficulty: 'Advanced',
    icon: 'book' as const,
    color: '#ec4899',
    background: 'bg-pink-100',
    progressColor: 'bg-pink-500',
    buttonColor: 'bg-pink-500',
    iconBg: 'bg-pink-200',
    iconColor: '#ec4899',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [streakDays, setStreakDays] = useState(7);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Animation values
  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(50);
  const featuresOpacity = useSharedValue(0);
  const testimonialsOpacity = useSharedValue(0);
  const ctaOpacity = useSharedValue(0);
  const ctaScale = useSharedValue(0.9);
  const mascotRotate = useSharedValue(0);
  const pathsTranslateX = useSharedValue(width);
  const streakPulse = useSharedValue(1);
  const confettiOpacity = useSharedValue(0);
  
  // Animated confetti positions
  const confettiPositions = Array.from({ length: 20 }).map(() => ({
    x: useSharedValue(Math.random() * width),
    y: useSharedValue(-20),
    rotate: useSharedValue(Math.random() * 360),
    size: 5 + Math.random() * 10,
    color: ['#FFD700', '#FF6347', '#4169E1', '#32CD32', '#FF69B4'][Math.floor(Math.random() * 5)],
  }));
  
  useEffect(() => {
    // Animate mascot continuously
    mascotRotate.value = withRepeat(
      withSequence(
        withTiming(-0.05, { duration: 1000 }),
        withTiming(0.05, { duration: 1000 }),
      ),
      -1,
      true
    );
    
    // Animate streak counter
    streakPulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      2,
      true
    );
    
    // Hero animations
    heroOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    heroTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) });
    
    // Animate features section with delay
    featuresOpacity.value = withDelay(400, 
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    
    // Animate learning paths sliding in from right
    pathsTranslateX.value = withDelay(600,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
    
    // Animate testimonials section with more delay
    testimonialsOpacity.value = withDelay(800, 
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    
    // Animate CTA section with even more delay
    ctaOpacity.value = withDelay(1200, 
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    ctaScale.value = withDelay(1200, 
      withSequence(
        withTiming(1.05, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.quad) })
      )
    );
    
    // Show confetti after a delay
    setTimeout(() => {
      showConfettiAnimation();
    }, 1500);
  }, []);
  
  const showConfettiAnimation = () => {
    setShowConfetti(true);
    confettiOpacity.value = 1;
    
    // Animate each confetti piece
    confettiPositions.forEach((confetti, index) => {
      // Animate Y position
      confetti.y.value = withDelay(
        index * 50,
        withTiming(500 + Math.random() * 200, { duration: 1500 + Math.random() * 1000 })
      );
      
      // Animate rotation
      const rotationTarget = 360 * 2 + Math.random() * 360;
      confetti.rotate.value = withDelay(
        index * 50,
        withTiming(rotationTarget, { duration: 1500 + Math.random() * 1000 })
      );
    });
    
    // Hide confetti after animation
    setTimeout(() => {
      confettiOpacity.value = withTiming(0, { duration: 500 });
      setTimeout(() => setShowConfetti(false), 500);
    }, 3000);
  };
  
  const heroAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));
  
  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));
  
  const pathsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pathsTranslateX.value }],
  }));
  
  const testimonialsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: testimonialsOpacity.value,
  }));
  
  const ctaAnimatedStyle = useAnimatedStyle(() => ({
    opacity: ctaOpacity.value,
    transform: [{ scale: ctaScale.value }],
  }));
  
  const mascotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${mascotRotate.value}rad` }],
  }));
  
  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakPulse.value }],
  }));
  
  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'none',
  }));

  // Create animated styles for each confetti piece
  const confettiPiecesStyles = confettiPositions.map((confetti) => 
    useAnimatedStyle(() => ({
      position: 'absolute',
      width: confetti.size,
      height: confetti.size,
      backgroundColor: confetti.color,
      borderRadius: confetti.size / 2,
      top: 0,
      left: 0,
      transform: [
        { translateX: confetti.x.value },
        { translateY: confetti.y.value },
        { rotate: `${confetti.rotate.value}deg` },
      ],
    }))
  );
  
  const handleGetStarted = () => {
    router.push('/(pre-auth)/signup');
  };

  const handlePathSelect = (path) => {
    // Path selection logic
    console.log('Selected path:', path.title);
  };
  
  const handleContinueLearning = (path) => {
    // Continue learning logic
    console.log('Continue learning:', path.title);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Using the shared header component */}
      <PreAuthHeader>
        <View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.nameText}>English Learning</Text>
        </View>
      </PreAuthHeader>
      
      {/* Confetti animation overlay */}
      {showConfetti && (
        <Animated.View style={confettiAnimatedStyle} pointerEvents="none">
          {confettiPositions.map((confetti, index) => (
            <Animated.View 
              key={index}
              style={confettiPiecesStyles[index]}
            />
          ))}
        </Animated.View>
      )}

      <ScrollView className="flex-1">
        {/* Hero Section */}
        <Animated.View 
          style={heroAnimatedStyle}
          className="px-6 pt-8 pb-8"
        >
          <Card className="overflow-hidden bg-emerald-500 shadow-lg rounded-xl">
            <CardContent className="p-6">
              <View className="items-center mb-8">
                <Animated.View style={[mascotAnimatedStyle]} className="mb-2">
                  <Image
                    source={require('../../assets/images/app-logo.png')}
                    style={{ width: 96, height: 96, borderRadius: 24, marginBottom: 16 }}
                    resizeMode="contain"
                  />
                </Animated.View>
                <Text 
                  variant="h2" 
                  color="white" 
                  align="center" 
                  style={styles.heroTitle}
                >
                  Speak English like{'\n'}The English
                </Text>
                <Text 
                  variant="body1" 
                  color="white" 
                  align="center" 
                  style={styles.heroSubtitle}
                >
                  Master British English pronunciation, idioms, and fluency with our interactive lessons
                </Text>
                
                <Button
                  variant="outline"
                  className="mt-8 bg-white border-white px-8 py-4"
                  textClassName="text-emerald-500 font-bold"
                  onPress={handleGetStarted}
                >
                  <View className="flex-row items-center">
                    <Text 
                      variant="button" 
                      color="#10b981" 
                      style={styles.buttonText}
                    >
                      Start Learning
                    </Text>
                    <Ionicons name="arrow-forward" size={20} color="#10b981" />
                  </View>
                </Button>
              </View>
              
              <View className="flex-row justify-center mt-6">
                <View className="flex-row items-center bg-white/20 rounded-md py-1 px-3 mx-1">
                  <Ionicons name="people" size={14} color="#f8fafc" />
                  <Text 
                    variant="caption" 
                    color="white" 
                    style={styles.statText}
                  >
                    50K+ Students
                  </Text>
                </View>
                <View className="flex-row items-center bg-white/20 rounded-md py-1 px-3 mx-1">
                  <Ionicons name="star" size={14} color="#f8fafc" />
                  <Text 
                    variant="caption" 
                    color="white" 
                    style={styles.statText}
                  >
                    4.8 Rating
                  </Text>
                </View>
                <View className="flex-row items-center bg-white/20 rounded-md py-1 px-3 mx-1">
                  <Ionicons name="globe" size={14} color="#f8fafc" />
                  <Text 
                    variant="caption" 
                    color="white" 
                    style={styles.statText}
                  >
                    30+ Countries
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>
        
        {/* Learning Paths - Duolingo Style */}
        <Animated.View style={pathsAnimatedStyle} className="px-6 py-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text 
              variant="h3" 
              style={styles.sectionTitle}
            >
              Learning Paths
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text 
                variant="subtitle1" 
                color="#10b981" 
                style={styles.viewAllText}
              >
                View All
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#10b981" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-2"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {learningPaths.map((path, index) => (
              <Animated.View
                key={path.id}
                entering={FadeInRight.delay(index * 100).springify()}
                className="mr-4"
              >
                <TouchableOpacity 
                  className={`p-4 rounded-xl w-[220px] ${path.background}`}
                  style={{ borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' }}
                  onPress={() => handlePathSelect(path)}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View style={{ width: '70%' }}>
                      <Text 
                        variant="h4"
                        style={styles.pathTitle}
                      >
                        {path.title}
                      </Text>
                    </View>
                    <View className="bg-white/30 rounded-md px-2 py-1">
                      <Text 
                        variant="caption" 
                        style={styles.difficultyText}
                      >
                        {path.difficulty}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="mt-2">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="book-outline" size={14} color="#334155" />
                      <Text 
                        variant="body2" 
                        color="#64748b" 
                        style={styles.lessonCountText}
                      >
                        {path.lessons} lessons
                      </Text>
                    </View>
                    
                    <View className="flex-row items-center mb-3">
                      <Ionicons name="checkmark-circle-outline" size={14} color="#334155" />
                      <Text 
                        variant="body2" 
                        color="#64748b" 
                        style={styles.completionText}
                      >
                        {path.completed}/{path.lessons} completed
                      </Text>
                    </View>
                    
                    <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                      <View 
                        className={`h-full ${path.progressColor}`} 
                        style={{ width: `${(path.completed / path.lessons) * 100}%` }} 
                      />
                    </View>
                    
                    <TouchableOpacity 
                      className={`mt-4 py-2 px-3 rounded-lg flex-row justify-center items-center ${path.buttonColor}`}
                      onPress={() => handleContinueLearning(path)}
                    >
                      <Text 
                        variant="button" 
                        color="white" 
                        style={styles.startButtonText}
                      >
                        Start Learning
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
        
        {/* Features Section */}
        <Animated.View style={featuresAnimatedStyle} className="px-6 py-8">
          <Text 
            variant="h2" 
            style={styles.featureHeading}
          >
            Why Choose Our App?
          </Text>
          
          {features.map((feature, index) => (
            <Animated.View 
              key={feature.id}
              entering={FadeInUp.delay(index * 100).springify()}
              className="mb-6 flex-row"
            >
              <View className={`p-3 rounded-xl mr-4 ${feature.iconBg}`}>
                <Ionicons name={feature.icon} size={24} color={feature.iconColor} />
              </View>
              <View className="flex-1">
                <Text 
                  variant="h4" 
                  style={styles.featureTitle}
                >
                  {feature.title}
                </Text>
                <Text 
                  variant="body1" 
                  color="#64748b" 
                  style={styles.featureDescription}
                >
                  {feature.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </Animated.View>
        
        {/* Testimonials Section */}
        <Animated.View style={testimonialsAnimatedStyle} className="px-6 py-8">
          <Text 
            variant="h2" 
            style={styles.testimonialsHeading}
          >
            What Our Students Say
          </Text>
          
          <FlatList
            data={testimonials}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
            renderItem={({ item: testimonial, index }) => (
              <Animated.View
                entering={FadeInRight.delay(index * 100).springify()}
                className="mr-4"
              >
                <Card 
                  className="overflow-hidden rounded-xl border border-border" 
                  style={styles.testimonialCard}
                >
                  <CardContent className="p-4">
                    <View className="flex-row mb-3">
                      {Array(5).fill(0).map((_, i) => (
                        <Ionicons 
                          key={i} 
                          name={i < testimonial.rating ? "star" : "star-outline"} 
                          size={16} 
                          color="#f59e0b" 
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                    
                    <Text 
                      variant="body1" 
                      style={styles.testimonialText}
                    >
                      "{testimonial.text}"
                    </Text>
                    
                    <View className="flex-row items-center mt-4">
                      <View className="h-10 w-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                        <Image 
                          source={{ uri: testimonial.avatar }} 
                          style={{ width: '100%', height: '100%' }} 
                        />
                      </View>
                      <View>
                        <Text 
                          variant="subtitle1" 
                          style={styles.testimonialName}
                        >
                          {testimonial.name}
                        </Text>
                        <Text 
                          variant="caption" 
                          color="#64748b" 
                          style={styles.testimonialCountry}
                        >
                          {testimonial.country}
                        </Text>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              </Animated.View>
            )}
          />
        </Animated.View>
        
        {/* CTA Section */}
        <Animated.View style={ctaAnimatedStyle} className="px-6 py-10 bg-emerald-50 mx-4 my-8 rounded-xl">
          <Text 
            variant="h2" 
            align="center" 
            style={styles.ctaHeading}
          >
            Ready to Improve Your English?
          </Text>
          <Text 
            variant="body1" 
            align="center" 
            color="#64748b" 
            style={styles.ctaSubheading}
          >
            Join thousands of students worldwide and start your language journey today.
          </Text>
          
          <View className="mt-6 flex-row justify-center">
            <Button
              variant="default"
              className="bg-emerald-500 px-8 py-3"
              textClassName="text-white font-bold"
              onPress={handleGetStarted}
            >
              Get Started for Free
            </Button>
          </View>
        </Animated.View>
        
 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#64748b',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#334155',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    marginTop: 6,
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pathTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
  },
  lessonCountText: {
    fontSize: 12,
    marginLeft: 6,
  },
  completionText: {
    fontSize: 12,
    marginLeft: 6,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featureHeading: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 24,
  },
  featureTitle: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 4,
  },
  featureDescription: {
    lineHeight: 20,
  },
  testimonialsHeading: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 24,
  },
  testimonialCard: {
    width: width - 80, // Card width
  },
  testimonialText: {
    fontStyle: 'italic',
    marginBottom: 16,
  },
  testimonialName: {
    fontWeight: '600',
  },
  testimonialCountry: {
    fontSize: 12,
  },
  ctaHeading: {
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 8,
  },
  ctaSubheading: {
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
  },
});