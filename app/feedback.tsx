import React from 'react';
import { StyleSheet, View } from 'react-native';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Text from '../components/ui/Typography';

export default function FeedbackScreen() {
  return (
    <View style={styles.container}>
      <Card variant="elevated" style={styles.card}>
        <Text variant="h2">Feedback</Text>
        <Text variant="body1" style={styles.text}>This is a placeholder for the feedback form screen.</Text>
        <Button title="Submit" onPress={() => {}} style={styles.button} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { width: '100%', padding: 24 },
  text: { marginVertical: 16 },
  button: { marginTop: 16 },
});