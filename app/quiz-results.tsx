import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Text from '../components/ui/Typography';

// Mock quiz results
const MOCK_RESULTS = {
  quizTitle: 'React Basics Quiz',
  totalQuestions: 10,
  correctAnswers: 7,
  timeTaken: '8 minutes 23 seconds',
  answers: [
    { questionNumber: 1, correct: true },
    { questionNumber: 2, correct: true },
    { questionNumber: 3, correct: false },
    { questionNumber: 4, correct: true },
    { questionNumber: 5, correct: true },
    { questionNumber: 6, correct: false },
    { questionNumber: 7, correct: true },
    { questionNumber: 8, correct: false },
    { questionNumber: 9, correct: true },
    { questionNumber: 10, correct: true },
  ],
};

export default function QuizResultsScreen() {
  const score = Math.round((MOCK_RESULTS.correctAnswers / MOCK_RESULTS.totalQuestions) * 100);
  
  const handleRetakeQuiz = () => {
    // Navigate back to quiz interface
    router.push('/quiz-interface?categoryId=1');
  };
  
  const handleGoToHistory = () => {
    // Navigate to quiz history
    router.push('/quiz-history');
  };
  
  const handleBackToCategories = () => {
    // Navigate back to quiz categories
    router.push('/(tabs)/quiz-categories');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2">Quiz Results</Text>
        <Text variant="body1" style={styles.quizTitle}>{MOCK_RESULTS.quizTitle}</Text>
      </View>
      
      <Card variant="elevated" style={styles.scoreCard}>
        <Text variant="h1" style={styles.scoreText}>{score}%</Text>
        <Text variant="h4" style={styles.scoreDetails}>
          {MOCK_RESULTS.correctAnswers} out of {MOCK_RESULTS.totalQuestions} correct
        </Text>
        <Text variant="body2">Time taken: {MOCK_RESULTS.timeTaken}</Text>
      </Card>
      
      <Card variant="outlined" style={styles.answersSummaryCard}>
        <Text variant="h4" style={styles.summaryTitle}>Question Summary</Text>
        <ScrollView style={styles.answersList}>
          {MOCK_RESULTS.answers.map((answer) => (
            <View key={answer.questionNumber} style={styles.answerRow}>
              <Text variant="body1">Question {answer.questionNumber}</Text>
              <View 
                style={[
                  styles.answerIndicator, 
                  answer.correct ? styles.correctAnswer : styles.incorrectAnswer
                ]}
              >
                <Text 
                  variant="body2" 
                  style={styles.answerText}
                >
                  {answer.correct ? 'Correct' : 'Incorrect'}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </Card>
      
      <View style={styles.actionButtons}>
        <Button
          title="Retake Quiz"
          variant="outline"
          onPress={handleRetakeQuiz}
          style={styles.actionButton}
        />
        <Button
          title="Quiz History"
          variant="outline"
          onPress={handleGoToHistory}
          style={styles.actionButton}
        />
        <Button
          title="Back to Categories"
          variant="primary"
          onPress={handleBackToCategories}
          fullWidth
          style={styles.mainButton}
        />
      </View>
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
  quizTitle: {
    marginTop: 4,
    opacity: 0.7,
  },
  scoreCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 48,
    marginBottom: 8,
  },
  scoreDetails: {
    marginBottom: 8,
  },
  answersSummaryCard: {
    padding: 16,
    flex: 1,
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 16,
  },
  answersList: {
    flex: 1,
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  answerIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  correctAnswer: {
    backgroundColor: '#e6f7ed',
  },
  incorrectAnswer: {
    backgroundColor: '#fdeded',
  },
  answerText: {
    color: '#333',
  },
  actionButtons: {
    marginTop: 'auto',
  },
  actionButton: {
    marginBottom: 12,
  },
  mainButton: {
    marginTop: 4,
  },
});