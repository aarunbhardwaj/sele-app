import React from 'react';
import { StyleSheet, View } from 'react-native';
import Card from '../../../components/ui/Card';
import Text from '../../../components/ui/Typography';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Card variant="elevated" style={styles.card}>
        <Text variant="h2">Settings</Text>
        <Text variant="body1" style={styles.text}>This is a placeholder for the settings screen.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { width: '100%', padding: 24 },
  text: { marginVertical: 16 },
});