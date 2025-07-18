import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from './theme';
import Text from './Typography';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  showLogo = true,
  rightIcon,
  onRightIconPress,
  transparent = false,
}) => {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  return (
    <View style={[
      styles.container,
      transparent && styles.transparentContainer
    ]}>
      <View style={styles.leftContent}>
        {showBack && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={goBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={transparent ? colors.neutral.white : colors.neutral.text} 
            />
          </TouchableOpacity>
        )}
        {showLogo && (
          <Image
            source={require('../../assets/images/app-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>

      {title && (
        <Text 
          variant="h5" 
          color={transparent ? colors.neutral.white : colors.primary.main}
          style={styles.title}
        >
          {title}
        </Text>
      )}

      <View style={styles.rightContent}>
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.rightIconButton}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral.white,
  },
  transparentContainer: {
    backgroundColor: 'transparent',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  rightContent: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  backButton: {
    marginRight: spacing.sm,
  },
  title: {
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  rightIconButton: {
    padding: spacing.xs,
  },
});

export default Header;