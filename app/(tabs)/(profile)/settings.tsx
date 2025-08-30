import React, { useState, useEffect } from 'react';
import { ScrollView, View, Switch, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Card from '../../../components/ui/Card';
import Text from '../../../components/ui/Typography';
import { useAuth } from '../../../services/AuthContext';
import authService from '../../../services/appwrite/auth-service';
import { UserProfile, UserPreferences } from '../../../lib/types';
import { showSuccess, showError } from '../../../lib/toast';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      email: true,
      push: true,
      reminders: true,
    },
    privacy: {
      profileVisibility: 'public',
      showProgress: true,
    },
    learning: {
      dailyGoal: 15,
      difficultyPreference: 'adaptive',
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userProfile = await authService.getUserProfile(user.$id);
      if (userProfile) {
        setProfile(userProfile);
        if (userProfile.preferences) {
          setPreferences(userProfile.preferences);
        }
      }
    } catch (error) {
      showError('Failed to load profile settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: UserPreferences) => {
    if (!profile) return;
    
    try {
      await authService.updateUserProfile(profile.$id, {
        preferences: newPreferences
      });
      setPreferences(newPreferences);
      showSuccess('Settings updated successfully');
    } catch (error) {
      showError('Failed to update settings');
    }
  };

  const handleNotificationToggle = (key: keyof UserPreferences['notifications']) => {
    const newPreferences = {
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key]
      }
    };
    updatePreferences(newPreferences);
  };

  const handlePrivacyToggle = (key: keyof UserPreferences['privacy']) => {
    const newPreferences = {
      ...preferences,
      privacy: {
        ...preferences.privacy,
        [key]: key === 'profileVisibility' 
          ? (preferences.privacy[key] === 'public' ? 'private' : 'public')
          : !preferences.privacy[key]
      }
    };
    updatePreferences(newPreferences);
  };

  const handleDailyGoalChange = () => {
    Alert.prompt(
      'Daily Learning Goal',
      'How many minutes would you like to study per day?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (text) => {
            const minutes = parseInt(text || '15', 10);
            if (minutes > 0 && minutes <= 300) {
              const newPreferences = {
                ...preferences,
                learning: {
                  ...preferences.learning,
                  dailyGoal: minutes
                }
              };
              updatePreferences(newPreferences);
            } else {
              showError('Please enter a valid number between 1 and 300 minutes');
            }
          }
        }
      ],
      'plain-text',
      preferences.learning.dailyGoal.toString()
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              showSuccess('Logged out successfully');
            } catch (error) {
              showError('Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // This would implement account deletion
            showError('Account deletion is not implemented yet');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text variant="body1">Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1" style={styles.title}>Settings</Text>
        <Text variant="body2" style={styles.subtitle}>
          Customize your learning experience and account preferences
        </Text>
      </View>

      {/* Profile Section */}
      <Card variant="elevated" style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Profile</Text>
        
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => router.push('/(tabs)/(profile)/edit')}
        >
          <View style={styles.settingContent}>
            <Ionicons name="person" size={24} color="#007bff" />
            <View style={styles.settingInfo}>
              <Text variant="h5" style={styles.settingTitle}>Edit Profile</Text>
              <Text variant="body2" style={styles.settingDescription}>
                Update your personal information and profile picture
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6c757d" />
        </TouchableOpacity>
      </Card>

      {/* Notifications Section */}
      <Card variant="elevated" style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="mail" size={24} color="#28a745" />
            <View style={styles.settingInfo}>
              <Text variant="h5" style={styles.settingTitle}>Email Notifications</Text>
              <Text variant="body2" style={styles.settingDescription}>
                Receive course updates and announcements via email
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.notifications.email}
            onValueChange={() => handleNotificationToggle('email')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.notifications.email ? '#007bff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="notifications" size={24} color="#fd7e14" />
            <View style={styles.settingInfo}>
              <Text variant="h5" style={styles.settingTitle}>Push Notifications</Text>
              <Text variant="body2" style={styles.settingDescription}>
                Get notified about new messages and updates
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.notifications.push}
            onValueChange={() => handleNotificationToggle('push')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.notifications.push ? '#007bff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="alarm" size={24} color="#6f42c1" />
            <View style={styles.settingInfo}>
              <Text variant="h5" style={styles.settingTitle}>Learning Reminders</Text>
              <Text variant="body2" style={styles.settingDescription}>
                Daily reminders to help you stay on track
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.notifications.reminders}
            onValueChange={() => handleNotificationToggle('reminders')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.notifications.reminders ? '#007bff' : '#f4f3f4'}
          />
        </View>
      </Card>

      {/* Privacy Section */}
      <Card variant="elevated" style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Privacy</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="eye" size={24} color="#17a2b8" />
            <View style={styles.settingInfo}>
              <Text variant="h5" style={styles.settingTitle}>Profile Visibility</Text>
              <Text variant="body2" style={styles.settingDescription}>
                Currently: {preferences.privacy.profileVisibility === 'public' ? 'Public' : 'Private'}
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.privacy.profileVisibility === 'public'}
            onValueChange={() => handlePrivacyToggle('profileVisibility')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.privacy.profileVisibility === 'public' ? '#007bff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Ionicons name="bar-chart" size={24} color="#20c997" />
            <View style={styles.settingInfo}>
              <Text variant="h5" style={styles.settingTitle}>Show Learning Progress</Text>
              <Text variant="body2" style={styles.settingDescription}>
                Allow others to see your learning statistics
              </Text>
            </View>
          </View>
          <Switch
            value={preferences.privacy.showProgress}
            onValueChange={() => handlePrivacyToggle('showProgress')}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={preferences.privacy.showProgress ? '#007bff' : '#f4f3f4'}
          />
        </View>
      </Card>

      {/* Learning Section */}
      <Card variant="elevated" style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Learning</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleDailyGoalChange}>
          <View style={styles.settingContent}>
            <Ionicons name="time" size={24} color="#e83e8c" />
            <View style={styles.settingInfo}>
              <Text variant="h5" style={styles.settingTitle}>Daily Goal</Text>
              <Text variant="body2" style={styles.settingDescription}>
                {preferences.learning.dailyGoal} minutes per day
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6c757d" />
        </TouchableOpacity>
      </Card>

      {/* Account Section */}
      <Card variant="elevated" style={styles.section}>
        <Text variant="h3" style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <View style={styles.settingContent}>
            <Ionicons name="log-out" size={24} color="#dc3545" />
            <View style={styles.settingInfo}>
              <Text variant="h5" style={[styles.settingTitle, { color: '#dc3545' }]}>Logout</Text>
              <Text variant="body2" style={styles.settingDescription}>
                Sign out of your account
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6c757d" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleDeleteAccount}>
          <View style={styles.settingContent}>
            <Ionicons name="trash" size={24} color="#dc3545" />
            <View style={styles.settingInfo}>
              <Text variant="h5" style={[styles.settingTitle, { color: '#dc3545' }]}>Delete Account</Text>
              <Text variant="body2" style={styles.settingDescription}>
                Permanently delete your account and all data
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6c757d" />
        </TouchableOpacity>
      </Card>

      <View style={styles.footer}>
        <Text variant="caption" style={styles.footerText}>
          App Version 1.0.0 • Last Updated: March 2024
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    color: '#212529',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6c757d',
    lineHeight: 20,
  },
  section: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    color: '#212529',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    color: '#212529',
    marginBottom: 2,
  },
  settingDescription: {
    color: '#6c757d',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#adb5bd',
    textAlign: 'center',
  },
});