import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../ui/Typography';

// Colors used in pre-auth screens
export const preAuthColors = {
  lightBlue: '#ADD8E6',
  lightGrey: '#E5E5E5',
  softPurple: '#C8A2C8',
  pastelYellow: '#FFFFD1',
  white: '#FFFFFF',
  textDark: '#333333',
  textLight: '#666666',
  shadow: 'rgba(0, 0, 0, 0.08)',
  emerald: '#10b981',
  // Changed header background color to a very light blue
  headerBg: '#E6F7FF', // Very light blue color
};

export interface PreAuthHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Shared header component for pre-auth screens with consistent styling
 */
export default function PreAuthHeader({
  title,
  showBackButton = false,
  onBackPress,
  rightComponent,
  children,
}: PreAuthHeaderProps) {
  const defaultRightComponent = (
    <TouchableOpacity 
      style={styles.languageSelector}
      onPress={() => {}}
    >
      <Text style={styles.languageText}>🇬🇧 EN</Text>
      <Ionicons name="chevron-down" size={16} color={preAuthColors.textDark} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.header}>
      <StatusBar barStyle="dark-content" backgroundColor={preAuthColors.headerBg} />
      <View style={styles.headerContent}>
        <View style={styles.leftContainer}>
          {showBackButton ? (
            <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={preAuthColors.textDark} />
            </TouchableOpacity>
          ) : (
            <Image
              source={require('../../assets/images/app-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          )}
          
          {title && <Text style={styles.headerTitle}>{title}</Text>}
          {children}
        </View>
        
        {rightComponent || defaultRightComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: preAuthColors.headerBg,
    paddingTop: 0, // Reduced from 60 to 0 to remove whitespace
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    // Add a subtle shadow for better separation from content
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: preAuthColors.textDark, // Changed from white to dark text
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: preAuthColors.lightGrey, // Changed from semi-transparent white to light grey
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  languageText: {
    marginRight: 4,
    fontSize: 14,
    color: preAuthColors.textDark, // Changed from white to dark text
  },
});