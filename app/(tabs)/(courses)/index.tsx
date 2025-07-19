import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../../components/ui/theme';
import Header from '../../../components/ui/Header';
import Text from '../../../components/ui/Typography';
import Button from '../../../components/ui/Button';

export default function CoursesIndex() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Header 
        title="Courses" 
        showLogo={true}
      />
      <View style={styles.content}>
        <Text variant="h4" style={styles.heading}>Courses</Text>
        <Text variant="body1" style={styles.subtitle}>
          Explore our course catalog or view your enrolled courses
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Browse Catalog" 
            variant="primary"
            onPress={() => router.push('/(tabs)/(courses)/catalog')}
            style={styles.button}
          />
          
          <Button 
            title="My Enrolled Courses" 
            variant="outline"
            onPress={() => router.push('/(tabs)/(courses)/enrolled')}
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