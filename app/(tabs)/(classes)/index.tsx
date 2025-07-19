import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../../components/ui/theme';
import Header from '../../../components/ui/Header';
import Text from '../../../components/ui/Typography';
import Button from '../../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export default function ClassesIndex() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Header 
        title="Live Classes" 
        showLogo={true}
      />
      <View style={styles.content}>
        <Text variant="h4" style={styles.heading}>Live Classes</Text>
        <Text variant="body1" style={styles.subtitle}>
          Join interactive live classes with our experienced instructors
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Class Schedule"
            variant="primary"
            onPress={() => router.push('/(tabs)/(classes)/schedule')}
            style={styles.button}
            leftIcon={<Ionicons name="calendar-outline" size={20} color="white" />}
          />
          
          <Button 
            title="Book a Class" 
            variant="secondary"
            onPress={() => router.push('/(tabs)/(classes)/booking')}
            style={styles.button}
            leftIcon={<Ionicons name="add-circle-outline" size={20} color={colors.secondary.main} />}
          />
          
          <Button 
            title="Class History" 
            variant="outline"
            onPress={() => router.push('/(tabs)/(classes)/history')}
            style={styles.button}
            leftIcon={<Ionicons name="time-outline" size={20} color={colors.primary.main} />}
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