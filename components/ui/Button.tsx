import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { borderRadius, colors, typography } from './theme';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: any;
  textStyle?: any;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  // Get background color based on variant
  const getBackgroundColor = () => {
    if (disabled) return colors.neutral.lightGray;
    
    switch (variant) {
      case 'primary':
        return colors.primary.main;
      case 'secondary':
        return colors.secondary.main;
      case 'accent':
        return colors.accent.main;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.primary.main;
    }
  };

  // Get text color based on variant
  const getTextColor = () => {
    if (disabled) return colors.neutral.gray;
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        return colors.neutral.white;
      case 'accent':
        return colors.neutral.text;
      case 'outline':
        return colors.primary.main;
      case 'ghost':
        return colors.primary.main;
      default:
        return colors.neutral.white;
    }
  };

  // Get border color and width based on variant
  const getBorder = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 2,
        borderColor: disabled ? colors.neutral.lightGray : colors.primary.main,
      };
    }
    return {};
  };

  // Get padding based on size
  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 6, paddingHorizontal: 12 };
      case 'medium':
        return { paddingVertical: 10, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 14, paddingHorizontal: 20 };
      default:
        return { paddingVertical: 10, paddingHorizontal: 16 };
    }
  };

  // Get font size based on size
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return typography.fontSizes.sm;
      case 'medium':
        return typography.fontSizes.md;
      case 'large':
        return typography.fontSizes.lg;
      default:
        return typography.fontSizes.md;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        getPadding(),
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
          style={styles.loader} 
        />
      ) : (
        <Text
          style={[
            styles.text,
            { fontSize: getFontSize(), color: getTextColor() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  text: {
    fontWeight: typography.fontWeights.semibold as any,
    textAlign: 'center',
  },
  loader: {
    marginHorizontal: 8,
  },
});

export default Button;