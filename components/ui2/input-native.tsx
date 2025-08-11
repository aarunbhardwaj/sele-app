import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ leftIcon, rightIcon, style, ...props }, ref) => {
    return (
      <View style={styles.container}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          ref={ref}
          style={[styles.input, leftIcon ? styles.inputWithLeftIcon : {}, rightIcon ? styles.inputWithRightIcon : {}, style]}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    height: 50,
    position: 'relative',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    height: '100%',
    paddingVertical: 0, // Remove vertical padding to maximize text space
  },
  inputWithLeftIcon: {
    paddingLeft: 48, // Increased from 45 to give more space
  },
  inputWithRightIcon: {
    paddingRight: 48, // Increased from 45 to give more space
  },
  leftIconContainer: {
    position: 'absolute',
    left: 12, // Moved closer to edge to give more text space
    zIndex: 1,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    position: 'absolute',
    right: 12, // Moved closer to edge to give more text space
    zIndex: 1,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});