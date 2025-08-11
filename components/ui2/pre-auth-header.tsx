import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Platform, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
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
}

/**
 * Airbnb-inspired header component for pre-auth screens with clean, modern styling
 */
export default function PreAuthHeader({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  children,
  subtitle,
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
          {/* Left section with back button or logo */}
          <View style={styles.leftSection}>
            {showBackButton ? (
              <TouchableOpacity 
                onPress={onBackPress} 
                style={styles.backButton}
                accessible={true}
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <View style={styles.backButtonContainer}>
                  <Ionicons name="arrow-back" size={20} color={airbnbColors.charcoal} />
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
          
          {/* Right section */}
          <View style={styles.rightSection}>
            {rightComponent || <View style={styles.placeholder} />}
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
});