import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../../components/ui/theme';
import Header from '../../../components/ui/Header';
import Text from '../../../components/ui/Typography';
import Button from '../../../components/ui/Button';

export default function QuizIndex() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Header 
        title="Quizzes" 
        showLogo={true}
      />
      <View style={styles.content}>
        <Text variant="h4" style={styles.heading}>Quiz Center</Text>
        <Text variant="body1" style={styles.subtitle}>
          Test your knowledge with our interactive quizzes
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Browse Quiz Categories" 
            variant="primary"
            onPress={() => router.push('/(tabs)/(quiz)/categories')}
            style={styles.button}
          />
          
          <Button 
            title="Quiz History" 
            variant="outline"
            onPress={() => router.push('/(tabs)/(quiz)/history')}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.7,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    marginBottom: 16,
  },
});