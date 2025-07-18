import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Text from '../components/ui/Typography';

// Mock quiz data
const MOCK_QUIZ = {
  id: '1',
  title: 'React Basics Quiz',
  description: 'Test your knowledge of React fundamentals',
  questions: [
    {
      id: 'q1',
      text: 'What is JSX?',
      options: [
        { id: 'a', text: 'A JavaScript XML syntax extension' },
        { id: 'b', text: 'A new programming language' },
        { id: 'c', text: 'A database query language' },
        { id: 'd', text: 'A styling framework' },
      ],
      correctAnswer: 'a',
    },
    {
      id: 'q2',
      text: 'Which hook is used to perform side effects in a function component?',
      options: [
        { id: 'a', text: 'useState' },
        { id: 'b', text: 'useContext' },
        { id: 'c', text: 'useEffect' },
        { id: 'd', text: 'useReducer' },
      ],
      correctAnswer: 'c',
    },
    {
      id: 'q3',
      text: 'What is the virtual DOM in React?',
      options: [
        { id: 'a', text: 'A complete copy of the actual DOM' },
        { id: 'b', text: 'A lightweight JavaScript representation of the DOM' },
        { id: 'c', text: 'A browser extension for React' },
        { id: 'd', text: 'A special HTML syntax' },
      ],
      correctAnswer: 'b',
    },
  ],
};

export default function QuizInterfaceScreen() {
  const { categoryId } = useLocalSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = MOCK_QUIZ.questions[currentQuestionIndex];
  const totalQuestions = MOCK_QUIZ.questions.length;
  
  const handleSelectAnswer = (optionId) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionId,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishQuiz = () => {
    router.push('/quiz-results');
  };

  const isOptionSelected = (optionId) => {
    return selectedAnswers[currentQuestion.id] === optionId;
  };

  if (quizCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <Card variant="elevated" style={styles.completedCard}>
          <Text variant="h3" style={styles.completedTitle}>Quiz Completed!</Text>
          <Text variant="body1" style={styles.completedText}>
            You've answered all {totalQuestions} questions.
          </Text>
          <Button
            title="See Results"
            variant="primary"
            fullWidth
            onPress={handleFinishQuiz}
            style={styles.seeResultsButton}
          />
        </Card>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h3">{MOCK_QUIZ.title}</Text>
        <Text variant="body2">Question {currentQuestionIndex + 1} of {totalQuestions}</Text>
      </View>

      <Card variant="elevated" style={styles.questionCard}>
        <Text variant="h4" style={styles.questionText}>{currentQuestion.text}</Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option) => (
            <Button
              key={option.id}
              title={option.text}
              variant={isOptionSelected(option.id) ? 'primary' : 'outline'}
              fullWidth
              onPress={() => handleSelectAnswer(option.id)}
              style={styles.optionButton}
            />
          ))}
        </View>
      </Card>

      <View style={styles.navigationButtons}>
        <Button
          title="Previous"
          variant="outline"
          onPress={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          style={styles.navButton}
        />
        <Button
          title={currentQuestionIndex === totalQuestions - 1 ? "Finish" : "Next"}
          variant="primary"
          onPress={handleNextQuestion}
          disabled={!selectedAnswers[currentQuestion.id]}
          style={styles.navButton}
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
  questionCard: {
    marginBottom: 24,
    padding: 20,
  },
  questionText: {
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    marginBottom: 10,
    justifyContent: 'flex-start',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flex: 0.48,
  },
  completedCard: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedTitle: {
    marginBottom: 16,
  },
  completedText: {
    marginBottom: 24,
    textAlign: 'center',
  },
  seeResultsButton: {
    marginTop: 16,
  },
});