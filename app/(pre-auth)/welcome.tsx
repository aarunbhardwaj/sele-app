import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import Text from '../../components/ui/Typography';
import { Button } from '../../components/ui2/button-native';
import { Card, CardContent } from '../../components/ui2/card-native';
import PreAuthHeader, { preAuthColors } from '../../components/ui2/pre-auth-header';

// Current learning modules
const currentLessons = [
  {
    id: '1',
    title: 'Greetings & Introductions',
    progress: 75,
    lastLesson: 'Formal Greetings',
    timeLeft: '5 min left',
    image: require('../../assets/images/app-logo.png'),
  },
  {
    id: '2',
    title: 'Basic Conversations',
    progress: 40,
    lastLesson: 'Asking Questions',
    timeLeft: '10 min left',
    image: require('../../assets/images/app-logo.png'),
  },
  {
    id: '3',
    title: 'Numbers & Counting',
    progress: 20,
    lastLesson: 'Numbers 1-20',
    timeLeft: '15 min left',
    image: require('../../assets/images/app-logo.png'),
  },
];

// Featured words/phrases
const featuredWords = [
  { id: '1', word: 'Hello', translation: 'Hola', flag: 'es' },
  { id: '2', word: 'Thank you', translation: 'Gracias', flag: 'es' },
  { id: '3', word: 'Good morning', translation: 'Buenos días', flag: 'es' },
  { id: '4', word: 'Please', translation: 'Por favor', flag: 'es' },
  { id: '5', word: 'Goodbye', translation: 'Adiós', flag: 'es' },
];

// Learning module card component
const LearningModuleCard = ({ lesson }) => (
  <Card style={styles.learningCard}>
    <TouchableOpacity>
      <View style={styles.learningCardContent}>
        <View style={styles.learningCardImageContainer}>
          <Image
            source={lesson.image}
            style={styles.learningCardImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.learningCardDetails}>
          <Text variant="subtitle2" style={styles.lessonTitle}>
            {lesson.title}
          </Text>
          <Text variant="caption" style={styles.lessonSubtitle}>
            {lesson.lastLesson}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${lesson.progress}%` }]} />
          </View>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color={preAuthColors.textLight} />
            <Text variant="caption" style={styles.timeText}>
              {lesson.timeLeft}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  </Card>
);

// Word card component
const WordCard = ({ word }) => (
  <Card style={styles.wordCard}>
    <TouchableOpacity>
      <View style={styles.wordCardContent}>
        <View style={styles.flagContainer}>
          <Ionicons name="flag" size={16} color={preAuthColors.softPurple} />
        </View>
        <Text variant="subtitle2" style={styles.wordText}>
          {word.word}
        </Text>
        <Text variant="caption" style={styles.translationText}>
          {word.translation}
        </Text>
      </View>
    </TouchableOpacity>
  </Card>
);

export default function WelcomePage() {
  const router = useRouter();
  const contentOpacity = useSharedValue(0);
  const userName = "Aarun"; // This would come from your user state/context
  const streakDays = 7;
  const dailyGoalProgress = 3;
  const dailyGoalTotal = 5;

  useEffect(() => {
    // Animate content
    contentOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: (1 - contentOpacity.value) * 20 }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Use shared header component */}
      <PreAuthHeader>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{userName}!</Text>
        </View>
      </PreAuthHeader>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <Animated.View style={[contentAnimatedStyle, styles.contentContainer]}>
          {/* Streak & Daily Goal Section */}
          <View style={styles.statsContainer}>
            {/* Streak Card */}
            <Card style={[styles.statCard, { backgroundColor: preAuthColors.softPurple }]}>
              <CardContent style={styles.statCardContent}>
                <View style={styles.streakIconContainer}>
                  <Ionicons name="flame" size={28} color={preAuthColors.white} />
                </View>
                <Text style={styles.statValue}>{streakDays}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </CardContent>
            </Card>
            
            {/* Daily Goal Card */}
            <Card style={[styles.statCard, { backgroundColor: preAuthColors.lightBlue }]}>
              <CardContent style={styles.statCardContent}>
                <Text style={styles.goalText}>Daily Goal</Text>
                <View style={styles.goalProgressContainer}>
                  <Text style={styles.goalProgressText}>
                    {dailyGoalProgress}/{dailyGoalTotal} lessons
                  </Text>
                </View>
                <View style={styles.goalBarContainer}>
                  <View 
                    style={[
                      styles.goalProgressBar, 
                      { width: `${(dailyGoalProgress / dailyGoalTotal) * 100}%` }
                    ]} 
                  />
                </View>
              </CardContent>
            </Card>
          </View>

          {/* Continue Learning Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Learning</Text>
              <TouchableOpacity>
                <Text style={styles.sectionAction}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={currentLessons}
              renderItem={({ item }) => <LearningModuleCard lesson={item} />}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            />
          </View>

          {/* Featured Words Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Words</Text>
              <TouchableOpacity>
                <Text style={styles.sectionAction}>Practice</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.wordsContainer}>
              {featuredWords.map(word => (
                <WordCard key={word.id} word={word} />
              ))}
            </View>
          </View>

          {/* Call to Action Card */}
          <Card style={styles.ctaCard}>
            <CardContent style={styles.ctaContent}>
              <Ionicons name="trophy" size={32} color={preAuthColors.pastelYellow} />
              <Text style={styles.ctaTitle}>Complete Today's Challenge!</Text>
              <Text style={styles.ctaDescription}>
                Practice pronunciation for 5 minutes to earn bonus points
              </Text>
              <Button style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Start Challenge</Text>
              </Button>
            </CardContent>
          </Card>
          
          {/* Footer spacing */}
          <View style={{ height: 80 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: preAuthColors.white,
  },
  welcomeText: {
    fontSize: 16,
    color: preAuthColors.textDark,
    fontWeight: '400',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: preAuthColors.textDark,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    shadowColor: preAuthColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  statCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  streakIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: preAuthColors.white,
  },
  statLabel: {
    fontSize: 14,
    color: preAuthColors.white,
    marginTop: 4,
  },
  goalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: preAuthColors.white,
    marginBottom: 8,
  },
  goalProgressContainer: {
    marginBottom: 8,
  },
  goalProgressText: {
    fontSize: 14,
    color: preAuthColors.white,
    fontWeight: '500',
  },
  goalBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressBar: {
    height: '100%',
    backgroundColor: preAuthColors.white,
    borderRadius: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: preAuthColors.textDark,
  },
  sectionAction: {
    fontSize: 14,
    color: preAuthColors.softPurple,
    fontWeight: '600',
  },
  learningCard: {
    width: 280,
    marginLeft: 4,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: preAuthColors.white,
    shadowColor: preAuthColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  learningCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  learningCardImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: preAuthColors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  learningCardImage: {
    width: 40,
    height: 40,
  },
  learningCardDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: preAuthColors.textDark,
    marginBottom: 4,
  },
  lessonSubtitle: {
    fontSize: 14,
    color: preAuthColors.textLight,
    marginBottom: 8,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: preAuthColors.softPurple,
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: preAuthColors.textLight,
    marginLeft: 4,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: preAuthColors.white,
    shadowColor: preAuthColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  wordCardContent: {
    padding: 12,
    alignItems: 'center',
  },
  flagContainer: {
    marginBottom: 6,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '600',
    color: preAuthColors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  translationText: {
    fontSize: 14,
    color: preAuthColors.textLight,
    textAlign: 'center',
  },
  ctaCard: {
    backgroundColor: preAuthColors.softPurple,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  ctaContent: {
    padding: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: preAuthColors.white,
    marginTop: 12,
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 14,
    color: preAuthColors.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: preAuthColors.white,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: preAuthColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: preAuthColors.softPurple,
  },
});