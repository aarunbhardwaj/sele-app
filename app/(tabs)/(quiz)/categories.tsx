import { router } from 'expo-router';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Header from '../../../components/ui/Header';
import Text from '../../../components/ui/Typography';

// Mock data for quiz categories
const QUIZ_CATEGORIES = [
  { id: '1', title: 'React Basics', description: 'Test your knowledge of React fundamentals', count: 10 },
  { id: '2', title: 'JavaScript Advanced', description: 'Advanced JavaScript concepts and patterns', count: 15 },
  { id: '3', title: 'React Native', description: 'Mobile development with React Native', count: 12 },
  { id: '4', title: 'State Management', description: 'Redux, Context API, and other state management solutions', count: 8 },
  { id: '5', title: 'Web Performance', description: 'Optimize and improve web application performance', count: 10 },
];

export default function QuizCategoriesScreen() {
  const handleCategoryPress = (categoryId: string) => {
    router.push(`/quiz-interface?categoryId=${categoryId}`);
  };

  const renderCategory = ({ item }) => (
    <Card variant="outlined" style={styles.categoryCard}>
      <View>
        <Text variant="h4">{item.title}</Text>
        <Text variant="body2" style={styles.description}>{item.description}</Text>
        <Text variant="caption" style={styles.quizCount}>{item.count} quizzes available</Text>
      </View>
      <Button 
        title="Start Quiz" 
        variant="primary" 
        size="small" 
        onPress={() => handleCategoryPress(item.id)} 
      />
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Quiz Categories" 
        showLogo={true}
        showDrawerToggle={true} 
      />
      <View style={styles.header}>
        <Text variant="h2">Quiz Categories</Text>
        <Text variant="body1" style={styles.subtitle}>Select a category to start practicing</Text>
      </View>
      
      <FlatList
        data={QUIZ_CATEGORIES}
        renderItem={renderCategory}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f9fc',
  },
  header: {
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  list: {
    paddingBottom: 24,
  },
  categoryCard: {
    marginBottom: 16,
    padding: 20,
  },
  description: {
    marginTop: 4,
    marginBottom: 8,
  },
  quizCount: {
    marginBottom: 16,
    opacity: 0.6,
  }
});