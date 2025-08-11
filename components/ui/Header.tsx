import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Platform, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from './Typography';

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
  subtitle?: string;
  showNotifications?: boolean;
  onNotificationPress?: () => void;
  rightComponent?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Airbnb-inspired header component for pre-auth screens with clean, modern styling
 */
export default function PreAuthHeader({
  title,
  subtitle,
  showNotifications = true,
  onNotificationPress,
  rightComponent,
  children,
}: PreAuthHeaderProps) {
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={airbnbColors.white} 
        translucent={false}
      />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Left section with logo */}
          <View style={styles.leftSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/app-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="App logo"
              />
            </View>
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
          
          {/* Right section with notifications or custom component */}
          <View style={styles.rightSection}>
            {rightComponent ? (
              rightComponent
            ) : showNotifications ? (
              <TouchableOpacity 
                onPress={onNotificationPress}
                style={styles.notificationButton}
                accessible={true}
                accessibilityLabel="Notifications"
                accessibilityRole="button"
              >
                <View style={styles.notificationContainer}>
                  <Ionicons name="notifications-outline" size={20} color={airbnbColors.charcoal} />
                  {/* Optional notification badge */}
                  <View style={styles.notificationBadge} />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: airbnbColors.white,
  },
  header: {
    backgroundColor: airbnbColors.white,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    // Airbnb-style subtle shadow
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    // Clean bottom border
    borderBottomWidth: 0.5,
    borderBottomColor: airbnbColors.lightGray,
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
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: airbnbColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    // Airbnb-style subtle shadow
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: airbnbColors.darkGray,
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: -0.1,
  },
  notificationButton: {
    padding: 2,
  },
  notificationContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: airbnbColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    // Airbnb-style button shadow
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: airbnbColors.primary,
    // Small shadow for the badge
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 1,
  },
  placeholder: {
    width: 36,
    height: 36,
  },
});