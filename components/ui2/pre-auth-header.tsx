import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../services/AuthContext';
import Text from '../ui/Typography';

// Airbnb-inspired color palette (matching the tab bars)
export const airbnbColors = {
  // Primary Airbnb colors
  primary: '#FF5A5F',        // Airbnb's signature coral/red
  primaryDark: '#E8484D',    // Darker variant
  primaryLight: '#FFE8E9',   // Light coral background
  
  // Secondary colors
  secondary: '#00A699',      // Teal for accents
  secondaryLight: '#E0F7F5', // Light teal background
  
  // Neutral palette (very Airbnb-esque)
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  gray: '#EBEBEB',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  black: '#222222',
  
  // Status colors
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
};

export interface PreAuthHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  children?: React.ReactNode;
  subtitle?: string;
  // Admin-specific props
  showNotifications?: boolean;
  showRefresh?: boolean;
  showLogout?: boolean;
  onNotificationPress?: () => void;
  onRefreshPress?: () => void;
  onLogoutPress?: () => void;
  onLeftIconPress?: () => void;
  leftIcon?: React.ReactNode;
}

/**
 * Airbnb-inspired header component for admin screens with consistent navigation options
 */
export default function PreAuthHeader({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  children,
  subtitle,
  showNotifications = true,
  showRefresh = false,
  showLogout = false,
  onNotificationPress,
  onRefreshPress,
  onLogoutPress,
  onLeftIconPress,
  leftIcon,
}: PreAuthHeaderProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      // Default notification behavior - could navigate to notifications screen
      console.log('Notifications pressed');
      // TODO: Implement notifications screen navigation
      // router.push('/(admin)/notifications');
    }
  };

  const handleLogoutPress = async () => {
    if (onLogoutPress) {
      onLogoutPress();
    } else {
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
              } catch (error) {
                console.error('Logout failed:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            }
          }
        ]
      );
    }
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (onLeftIconPress) {
      onLeftIconPress();
    } else {
      router.back();
    }
  };

  const renderRightActions = () => {
    if (rightComponent) {
      return rightComponent;
    }

    const actions = [];

    if (showNotifications) {
      actions.push(
        <TouchableOpacity
          key="notifications"
          onPress={handleNotificationPress}
          style={styles.actionButton}
          accessible={true}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <View style={styles.actionButtonContainer}>
            <Ionicons name="notifications-outline" size={20} color={airbnbColors.charcoal} />
            {/* Notification badge - could be dynamic based on unread count */}
            <View style={styles.notificationBadge} />
          </View>
        </TouchableOpacity>
      );
    }

    if (showRefresh && onRefreshPress) {
      actions.push(
        <TouchableOpacity
          key="refresh"
          onPress={onRefreshPress}
          style={styles.actionButton}
          accessible={true}
          accessibilityLabel="Refresh"
          accessibilityRole="button"
        >
          <View style={styles.actionButtonContainer}>
            <Ionicons name="refresh-outline" size={20} color={airbnbColors.charcoal} />
          </View>
        </TouchableOpacity>
      );
    }

    if (showLogout) {
      actions.push(
        <TouchableOpacity
          key="logout"
          onPress={handleLogoutPress}
          style={styles.actionButton}
          accessible={true}
          accessibilityLabel="Logout"
          accessibilityRole="button"
        >
          <View style={[styles.actionButtonContainer, styles.logoutButton]}>
            <Ionicons name="log-out-outline" size={20} color={airbnbColors.error} />
          </View>
        </TouchableOpacity>
      );
    }

    if (actions.length === 0) {
      return <View style={styles.placeholder} />;
    }

    return (
      <View style={styles.actionsContainer}>
        {actions}
      </View>
    );
  };
  
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={airbnbColors.white} 
        translucent={false}
      />
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Left section with back button, custom icon, or logo */}
            <View style={styles.leftSection}>
              {showBackButton || leftIcon ? (
                <TouchableOpacity 
                  onPress={handleBackPress} 
                  style={styles.backButton}
                  accessible={true}
                  accessibilityLabel="Go back"
                  accessibilityRole="button"
                >
                  <View style={styles.backButtonContainer}>
                    {leftIcon || <Ionicons name="arrow-back" size={20} color={airbnbColors.charcoal} />}
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../assets/images/app-logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                    accessible={true}
                    accessibilityLabel="App logo"
                  />
                </View>
              )}
            </View>
            
            {/* Center section with title */}
            <View style={styles.centerSection}>
              {title && (
                <View style={styles.titleContainer}>
                  <Text style={styles.headerTitle}>{title}</Text>
                  {subtitle && (
                    <Text style={styles.headerSubtitle}>{subtitle}</Text>
                  )}
                </View>
              )}
              {children}
            </View>
            
            {/* Right section with actions */}
            <View style={styles.rightSection}>
              {renderRightActions()}
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: airbnbColors.white,
  },
  header: {
    backgroundColor: airbnbColors.white,
    paddingTop: Platform.OS === 'ios' ? 10 : 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    // Subtle shadow for depth
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    // Clean bottom border
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.lightGray,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  rightSection: {
    minWidth: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  backButton: {
    padding: 2,
  },
  backButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: airbnbColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle shadow for the button
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: airbnbColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: airbnbColors.darkGray,
    textAlign: 'center',
    marginTop: 2,
  },
  placeholder: {
    width: 32,
    height: 32,
  },
  actionButton: {
    padding: 2,
  },
  actionButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: airbnbColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: airbnbColors.primary,
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  logoutButton: {
    backgroundColor: airbnbColors.error + '15',
  },
});