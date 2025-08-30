import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../services/AuthContext';

const { width, height } = Dimensions.get('window');

// Clean, minimalist color palette matching your app
const colors = {
  // Primary backgrounds
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  
  // Text colors
  charcoal: '#484848',
  darkGray: '#717171',
  mediumGray: '#B0B0B0',
  
  // Accent colors (used very subtly)
  primary: '#FF5A5F',
  secondary: '#00A699',
  tertiary: '#FC642D',
  
  // Subtle overlays
  overlay: 'rgba(72, 72, 72, 0.03)',
  shadowColor: 'rgba(34, 34, 34, 0.08)',
};

// Clean typography matching your app
const typography = {
  fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  sizes: {
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    huge: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Static loading texts
const loadingTexts = [
  'Preparing your learning experience...',
  'Loading your courses...',
  'Setting up your dashboard...',
  'Almost ready...',
];

export default function SplashScreen() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hasNavigated = useRef(false);
  const [loadingText, setLoadingText] = useState('Preparing your learning experience...');

  // Animation values
  const backgroundOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const loadingProgress = useSharedValue(0);
  const floatingY = useSharedValue(0);
  const dotsOpacity = useSharedValue(0);

  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: floatingY.value }
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { 
        translateY: interpolate(
          textOpacity.value,
          [0, 1],
          [20, 0]
        )
      }
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${loadingProgress.value * 100}%`,
  }));

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  // Loading text animation
  useEffect(() => {
    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[textIndex]);
    }, 800);

    return () => clearInterval(textInterval);
  }, []);

  useEffect(() => {
    // Start background animation
    backgroundOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.quad),
    });

    // Start logo animation with elegant entrance
    setTimeout(() => {
      logoOpacity.value = withTiming(1, {
        duration: 1200,
        easing: Easing.out(Easing.back(1.2)),
      });
      logoScale.value = withTiming(1, {
        duration: 1200,
        easing: Easing.out(Easing.back(1.2)),
      });
    }, 400);

    // Start floating animation
    setTimeout(() => {
      floatingY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    }, 1600);

    // Start text animation with delay
    setTimeout(() => {
      textOpacity.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.quad),
      });
    }, 1000);

    // Start loading progress
    setTimeout(() => {
      loadingProgress.value = withTiming(1, {
        duration: 2500,
        easing: Easing.out(Easing.quad),
      });
    }, 1200);

    // Start dots animation
    setTimeout(() => {
      dotsOpacity.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.quad),
      });
    }, 1800);

    // Handle navigation
    const timer = setTimeout(() => {
      if (!hasNavigated.current && !isLoading) {
        hasNavigated.current = true;
        
        // Gentle exit animation
        logoOpacity.value = withTiming(0, {
          duration: 600,
          easing: Easing.in(Easing.quad),
        });
        textOpacity.value = withTiming(0, {
          duration: 600,
          easing: Easing.in(Easing.quad),
        });
        backgroundOpacity.value = withTiming(0, {
          duration: 600,
          easing: Easing.in(Easing.quad),
        });

        setTimeout(() => {
          try {
            if (isAuthenticated) {
              router.replace('/(tabs)');
            } else {
              router.replace('/(pre-auth)');
            }
          } catch (error) {
            console.warn('Splash navigation error:', error);
            setTimeout(() => {
              if (!hasNavigated.current) {
                hasNavigated.current = true;
                router.replace('/(pre-auth)');
              }
            }, 100);
          }
        }, 300);
      }
    }, 3800);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, router]);

  // Reset navigation flag when auth state changes
  useEffect(() => {
    hasNavigated.current = false;
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} translucent />
      
      {/* Clean gradient background */}
      <Animated.View style={[styles.background, backgroundStyle]}>
        <LinearGradient
          colors={[
            colors.white,
            colors.offWhite,
            colors.lightGray,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* Subtle decorative elements */}
      <View style={styles.decorativeElements}>
        <View style={[styles.floatingElement, styles.element1]}>
          <Animated.View entering={FadeIn.delay(2000).duration(1000)}>
            <View style={styles.circle} />
          </Animated.View>
        </View>
        
        <View style={[styles.floatingElement, styles.element2]}>
          <Animated.View entering={FadeIn.delay(2200).duration(1000)}>
            <View style={[styles.circle, styles.circleSmall]} />
          </Animated.View>
        </View>

        <View style={[styles.floatingElement, styles.element3]}>
          <Animated.View entering={FadeIn.delay(2400).duration(1000)}>
            <View style={styles.bookIconContainer}>
              <Ionicons name="book-outline" size={20} color={colors.mediumGray} />
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoShadow}>
              <Image
                source={require('../assets/images/app-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
        </Animated.View>

        {/* Text Section */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Animated.Text 
            style={styles.mainTitle}
            entering={FadeInUp.delay(1000).duration(800)}
          >
            Speak English
          </Animated.Text>
          <Animated.Text 
            style={styles.subtitle}
            entering={FadeInUp.delay(1200).duration(800)}
          >
            like The English
          </Animated.Text>
          <Animated.Text 
            style={styles.tagline}
            entering={FadeInUp.delay(1400).duration(800)}
          >
            Master English with confidence
          </Animated.Text>
        </Animated.View>

        {/* Minimal Loading Section */}
        <Animated.View 
          style={styles.loadingContainer}
          entering={FadeIn.delay(1600).duration(800)}
        >
          {/* Subtle progress bar */}
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          
          {/* Loading text */}
          <Animated.Text style={styles.loadingText}>
            {loadingText}
          </Animated.Text>
          
          {/* Minimal loading dots */}
          <Animated.View style={[styles.loadingDots, dotsStyle]}>
            {[0, 1, 2].map((index) => (
              <Animated.View
                key={index}
                style={styles.dot}
                entering={FadeIn.delay(2000 + index * 150).duration(400)}
              />
            ))}
          </Animated.View>
        </Animated.View>
      </View>

      {/* Minimal bottom text */}
      <Animated.View 
        style={[styles.bottomText, { paddingBottom: insets.bottom + 30 }]}
        entering={FadeIn.delay(2600).duration(800)}
      >
        <Animated.Text style={styles.brandText}>
          Powered by AI
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    flex: 1,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatingElement: {
    position: 'absolute',
    opacity: 0.4,
  },
  element1: {
    top: height * 0.2,
    right: width * 0.1,
  },
  element2: {
    top: height * 0.7,
    left: width * 0.15,
  },
  element3: {
    bottom: height * 0.25,
    right: width * 0.2,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.mediumGray + '20',
  },
  circleSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 50,
    zIndex: 2,
  },
  logoContainer: {
    marginBottom: 80,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoShadow: {
    borderRadius: 80,
    padding: 20, // Reduced padding to prevent text overlap
    backgroundColor: colors.white,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 }, // Reduced shadow to prevent text cutoff
        shadowOpacity: 0.8,
        shadowRadius: 16,
      },
      android: {
        elevation: 8, // Reduced elevation
      },
    }),
  },
  logo: {
    width: 90, // Slightly smaller to prevent overlap
    height: 90,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 80, // Reduced margin for better spacing
    paddingHorizontal: 20, // Added padding to ensure text visibility
    zIndex: 3, // Higher z-index to ensure text appears above shadows
  },
  mainTitle: {
    fontSize: typography.sizes.huge,
    fontWeight: typography.weights.bold,
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: typography.fontFamily,
    letterSpacing: -1.5,
    textShadowColor: 'transparent', // Remove any text shadow that might interfere
    backgroundColor: 'transparent', // Ensure transparent background
  },
  subtitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
    color: colors.darkGray,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: typography.fontFamily,
    fontStyle: 'italic',
    textShadowColor: 'transparent',
    backgroundColor: 'transparent',
  },
  tagline: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.mediumGray,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
    textShadowColor: 'transparent',
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 280, // Increased width for better progress bar visibility
    paddingHorizontal: 20,
  },
  progressBar: {
    width: '100%',
    height: 4, // Increased height from 2 to 4 for better visibility
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    marginBottom: 24, // Reduced margin
    overflow: 'hidden',
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.mediumGray,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: typography.fontFamily,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.mediumGray,
  },
  bottomText: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  brandText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.mediumGray,
    textAlign: 'center',
    fontFamily: typography.fontFamily,
  },
  bookIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlay,
    borderWidth: 1,
    borderColor: colors.mediumGray + '20',
  },
});