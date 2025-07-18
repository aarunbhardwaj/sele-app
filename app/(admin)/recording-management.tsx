import React from 'react';
import { StyleSheet, View } from 'react-native';
import Card from '../../components/ui/Card';
import Text from '../../components/ui/Typography';

export default function RecordingManagementScreen() {
  return (
    <View style={styles.container}>
      <Card variant="elevated" style={styles.card}>
        <Text variant="h2">Recording Management</Text>
        <Text variant="body1" style={styles.text}>This is a placeholder for the recording management screen.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  card: { width: '100%', padding: 24 },
  text: { marginVertical: 16 },
});