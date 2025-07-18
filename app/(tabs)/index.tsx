import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Text from '../../components/ui/Typography';
import { borderRadius, spacing, typography } from '../../components/ui/theme';

const streakDays = 12;
const continueLessons = [
  { id: '1', title: 'Module 1: Greetings', progress: 30 },
  { id: '2', title: 'Module 2: Pronunciation', progress: 60 },
  { id: '3', title: 'Module 3: Vocabulary', progress: 45 },
];
const featuredWords = [
  { id: '1', flag: '🇬🇧', word: 'Hello' },
  { id: '2', flag: '🇬🇧', word: 'Thank you' },
  { id: '3', flag: '🇬🇧', word: 'Please' },
];

// This is the correct way to define options for Expo Router
export const unstable_settings = {
  // This tells Expo Router this tab shouldn't appear in the tab bar
  isHidden: true
};

export default function TabsIndex() {
  const fade = useSharedValue(0);
  useEffect(() => void (fade.value = withTiming(1, { duration: 600 })), []);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, fadeStyle]}>
        {/* Welcome Header */}
        <Text variant="h4" style={styles.welcomeText}>Welcome back, Aarun!</Text>
        {/* Streak Card */}
        <View style={styles.streakCard}>
          <Ionicons name="flame" size={24} color="#FF6B6B" />
          <Text variant="subtitle1" style={styles.streakText}>{streakDays} day streak</Text>
        </View>
        {/* Continue Learning */}
        <Text variant="h5" style={styles.sectionTitle}>Continue Learning</Text>
        <FlatList
          horizontal
          data={continueLessons}
          keyExtractor={item=>item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
          renderItem={({item}) => (
            <View style={styles.lessonCard}>
              <Text variant="subtitle2" style={styles.lessonTitle}>{item.title}</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${item.progress}%` }]} />
              </View>
            </View>
          )}
        />
        {/* Daily Goal */}
        <Text variant="h5" style={styles.sectionTitle}>Daily Goal</Text>
        <View style={styles.goalContainer}>
          <Text variant="body" style={styles.goalText}>3/5 lessons completed</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '60%' }]} />
          </View>
        </View>
        {/* Featured Words */}
        <Text variant="h5" style={styles.sectionTitle}>Featured Phrases</Text>
        <FlatList
          horizontal
          data={featuredWords}
          keyExtractor={item=>item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: spacing.sm }}
          renderItem={({item}) => (
            <View style={styles.wordCard}>
              <Text variant="h3">{item.flag}</Text>
              <Text variant="subtitle1" style={styles.wordText}>{item.word}</Text>
            </View>
          )}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor: '#E0F7FA' /* light blue pastel */ },
  content: { flex:1, padding: spacing.lg },
  welcomeText: { color: '#00796B', fontFamily: 'Poppins', marginBottom: spacing.md },
  streakCard: { flexDirection:'row', alignItems:'center', backgroundColor:'#B2DFDB', padding:spacing.sm, borderRadius:borderRadius.md, marginBottom:spacing.lg },
  streakText: { marginLeft: spacing.sm, color: '#004D40', fontFamily:'Poppins', fontWeight:typography.fontWeights.semibold },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm, color:'#004D40', fontFamily:'Poppins' },
  lessonCard: { backgroundColor:'#C8E6C9', padding: spacing.md, borderRadius: borderRadius.md, marginRight: spacing.md, width: 160 },
  lessonTitle: { color:'#1B5E20', fontFamily:'Poppins', marginBottom: spacing.sm },
  progressBarContainer: { height:8, backgroundColor:'rgba(0,0,0,0.1)', borderRadius:borderRadius.full, overflow:'hidden' },
  progressBar: { height:8, backgroundColor:'#43A047' },
  goalContainer: { marginBottom: spacing.lg },
  goalText: { marginBottom: spacing.sm, color:'#004D40', fontFamily:'Poppins' },
  wordCard: { backgroundColor:'#E1BEE7', padding: spacing.md, borderRadius: borderRadius.md, marginRight: spacing.md, alignItems:'center' },
  wordText: { marginTop: spacing.sm, color:'#4A148C', fontFamily:'Poppins', fontSize:typography.fontSizes.lg }
});