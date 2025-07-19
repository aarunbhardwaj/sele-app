import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Button from '../../../components/ui/Button';
import { borderRadius, colors } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';
import PreAuthHeader from '../../../components/ui2/pre-auth-header';

const quizCategories = [
  { id: '1', title: 'Grammar', icon: 'school-outline', color: '#D1C4E9' },
  { id: '2', title: 'Vocabulary', icon: 'book-outline', color: '#C8E6C9' },
  { id: '3', title: 'Pronunciation', icon: 'mic-outline', color: '#FFECB3' },
];

export default function QuizIndex() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PreAuthHeader title="Quizzes" />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text variant="h4" style={styles.heading}>Quiz Center</Text>
            <Text variant="body1" style={styles.subtitle}>
              Test your knowledge with our interactive quizzes
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text variant="h3" style={styles.statNumber}>12</Text>
                <Text variant="caption" style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statCard}>
                <Text variant="h3" style={styles.statNumber}>86%</Text>
                <Text variant="caption" style={styles.statLabel}>Avg. Score</Text>
              </View>
            </View>
            
            <Text variant="h5" style={styles.sectionTitle}>Categories</Text>
            
            <View style={styles.categoriesContainer}>
              {quizCategories.map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  style={[styles.categoryCard, { backgroundColor: category.color }]}
                  onPress={() => router.push(`/(tabs)/(quiz)/categories?initial=${category.id}`)}
                >
                  <Ionicons name={category.icon} size={32} color="#333333" />
                  <Text variant="subtitle2" style={styles.categoryTitle}>{category.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text variant="h5" style={styles.sectionTitle}>Actions</Text>
            
            <View style={styles.buttonContainer}>
              <Button 
                title="Browse All Categories" 
                variant="primary"
                onPress={() => router.push('/(tabs)/(quiz)/categories')}
                style={styles.button}
                leftIcon={<Ionicons name="grid-outline" size={20} color="white" />}
              />
              
              <Button 
                title="My Quiz History" 
                variant="outline"
                onPress={() => router.push('/(tabs)/(quiz)/history')}
                style={styles.button}
                leftIcon={<Ionicons name="time-outline" size={20} color={colors.primary.main} />}
              />
              
              <Button 
                title="Take Practice Quiz" 
                variant="secondary"
                onPress={() => router.push('/quiz-interface?mode=practice')}
                style={styles.button}
                leftIcon={<Ionicons name="fitness-outline" size={20} color={colors.secondary.main} />}
              />
            </View>
          </View>
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
    padding: 24,
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
    marginBottom: 32,
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
  statNumber: {
    color: colors.primary.main,
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: 4,
    color: colors.neutral.darkGray,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  categoryTitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginBottom: 16,
  },
});