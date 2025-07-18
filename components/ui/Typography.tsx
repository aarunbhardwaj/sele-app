import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from './theme';

type TypographyVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' 
  | 'body1' | 'body2' 
  | 'subtitle1' | 'subtitle2' 
  | 'caption' | 'button';

interface TextProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle;
  numberOfLines?: number;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body1',
  color = colors.neutral.text,
  align = 'left',
  style,
  numberOfLines,
  ...rest
}) => {
  const getTypographyStyle = () => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: typography.fontSizes.heading,
          fontWeight: typography.fontWeights.bold,
        };
      case 'h2':
        return {
          fontSize: typography.fontSizes.xxl,
          fontWeight: typography.fontWeights.bold,
        };
      case 'h3':
        return {
          fontSize: typography.fontSizes.xl,
          fontWeight: typography.fontWeights.semibold,
        };
      case 'h4':
        return {
          fontSize: typography.fontSizes.lg,
          fontWeight: typography.fontWeights.semibold,
        };
      case 'h5':
        return {
          fontSize: typography.fontSizes.md,
          fontWeight: typography.fontWeights.semibold,
        };
      case 'h6':
        return {
          fontSize: typography.fontSizes.md,
          fontWeight: typography.fontWeights.medium,
        };
      case 'subtitle1':
        return {
          fontSize: typography.fontSizes.md,
          fontWeight: typography.fontWeights.medium,
        };
      case 'subtitle2':
        return {
          fontSize: typography.fontSizes.sm,
          fontWeight: typography.fontWeights.medium,
        };
      case 'body1':
        return {
          fontSize: typography.fontSizes.md,
          fontWeight: typography.fontWeights.regular,
        };
      case 'body2':
        return {
          fontSize: typography.fontSizes.sm,
          fontWeight: typography.fontWeights.regular,
        };
      case 'caption':
        return {
          fontSize: typography.fontSizes.xs,
          fontWeight: typography.fontWeights.regular,
        };
      case 'button':
        return {
          fontSize: typography.fontSizes.sm,
          fontWeight: typography.fontWeights.semibold,
          textTransform: 'uppercase' as 'uppercase',
        };
      default:
        return {
          fontSize: typography.fontSizes.md,
          fontWeight: typography.fontWeights.regular,
        };
    }
  };

  return (
    <RNText
      style={[
        styles.text,
        getTypographyStyle(),
        { color, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
      {...rest}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  text: {
    // Base styles
  },
});

export default Text;