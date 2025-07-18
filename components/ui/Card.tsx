import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { borderRadius, colors } from './theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = true,
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: colors.neutral.white,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: colors.neutral.white,
          borderWidth: 1,
          borderColor: colors.neutral.lightGray,
        };
      case 'elevated':
        return {
          backgroundColor: colors.neutral.white,
          ...styles.elevated,
        };
      default:
        return {
          backgroundColor: colors.neutral.white,
        };
    }
  };

  return (
    <View
      style={[
        styles.card,
        getCardStyle(),
        padding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  padding: {
    padding: 16,
  },
  elevated: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default Card;