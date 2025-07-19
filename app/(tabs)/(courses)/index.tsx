import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import Button from '../../../components/ui/Button';
import Header from '../../../components/ui/Header';
import { colors } from '../../../components/ui/theme';
import Text from '../../../components/ui/Typography';

export default function CoursesIndex() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header 
          title="Courses" 
          showLogo={true}
          showDrawerToggle={true}
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