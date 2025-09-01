import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import PreAuthHeader from '../../components/ui/Header';
import Text from '../../components/ui/Typography';
import { useAuth } from '../../services/AuthContext';

// Airbnb-inspired color palette
const airbnbColors = {
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
  
  // Social media colors
  google: '#DB4437',
  apple: '#000000',
  facebook: '#1877F2',
  
  // Focus and interaction
  focus: '#FF5A5F',
  focusLight: 'rgba(255, 90, 95, 0.1)',
};

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Animation values
  const logoScale = useSharedValue(0.9);
  const buttonScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isFocused, setIsFocused] = useState<{[key: string]: boolean}>({});
  
  // Refs for TextInput components
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  
  // Gamification elements
  const [streakDays, setStreakDays] = useState(7);
  
  useEffect(() => {
    // Gentle logo entrance animation
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 600 }),
      withTiming(1, { duration: 400 })
    );
  }, []);
  
  useEffect(() => {
    if (isLoggingIn) {
      rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
    } else {
      rotation.value = 0;
    }
  }, [isLoggingIn]);
  
  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  
  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  // Validation functions - no automatic validation on change
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setErrors(prev => ({
      ...prev,
      email: isValid ? '' : 'Please enter a valid email address'
    }));
    return isValid;
  };
  
  const validatePassword = (password: string): boolean => {
    const isValid = password.length >= 6;
    setErrors(prev => ({
      ...prev, 
      password: isValid ? '' : 'Password must be at least 6 characters'
    }));
    return isValid;
  };
  
  const handleLogin = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      buttonScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 300 })
      );
      return;
    }
    
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 200 })
    );
    setIsLoggingIn(true);
    
    try {
      await login(email, password);
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Focus handlers with better management
  const handleFocus = (field: string) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
    // Clear any existing errors when focusing on a field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleBlur = (field: string) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
    // Only validate on blur if field has content AND we're not switching to another input
    // This prevents the focus jumping issue
    setTimeout(() => {
      if (field === 'email' && email.trim() && !isFocused.password) {
        validateEmail(email);
      }
      if (field === 'password' && password.trim() && !isFocused.email) {
        validatePassword(password);
      }
    }, 100);
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Airbnb-styled header */}
      <PreAuthHeader 
        title="Welcome Back"
        subtitle="Log in to continue learning"
        showNotifications={true}
        onNotificationPress={() => console.log('Notifications pressed')}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main content container */}
        <Animated.View 
          entering={FadeIn.delay(200).duration(800)}
          style={styles.contentContainer}
        >
          {/* Logo section - clean and minimal */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/images/app-logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="Application logo"
              />
            </View>
          </Animated.View>
          
          {/* Welcome text - Airbnb style */}
          <Animated.View 
            entering={FadeInDown.delay(300).duration(800)}
            style={styles.welcomeSection}
          >
            <Text style={styles.welcomeSubtitle}>
              We're happy to see you again. Continue your learning journey.
            </Text>
          </Animated.View>
          
          {/* Streak motivation card - Airbnb card style */}
          <Animated.View 
            entering={FadeInDown.delay(400).duration(800)}
            style={styles.streakCard}
            accessible={true}
            accessibilityLabel={`You have a ${streakDays}-day streak. Sign in to continue learning.`}
          >
            <View style={styles.streakIconContainer}>
              <View style={styles.streakIcon}>
                <Ionicons name="flame" size={20} color={airbnbColors.warning} />
              </View>
              <View style={styles.streakContent}>
                <Text style={styles.streakTitle}>{streakDays} day streak</Text>
                <Text style={styles.streakSubtitle}>Don't break your learning momentum!</Text>
              </View>
            </View>
          </Animated.View>
          
          {/* Form section - Clean Airbnb style */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(800)}
            style={styles.formContainer}
          >
            {/* Email input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[
                styles.inputWrapper,
                isFocused.email && styles.inputWrapperFocused,
                errors.email && styles.inputWrapperError
              ]}>
                <TextInput
                  ref={emailRef}
                  placeholder="Enter your email address"
                  placeholderTextColor={airbnbColors.mediumGray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  style={styles.textInput}
                  accessibilityLabel="Email Address"
                  accessibilityHint="Enter your email address"
                />
              </View>
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}
            </View>
            
            {/* Password input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[
                styles.inputWrapper,
                isFocused.password && styles.inputWrapperFocused,
                errors.password && styles.inputWrapperError
              ]}>
                <TextInput
                  ref={passwordRef}
                  placeholder="Enter your password"
                  placeholderTextColor={airbnbColors.mediumGray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  style={styles.textInput}
                  accessibilityLabel="Password"
                  accessibilityHint="Enter your password"
                />
                <TouchableOpacity 
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeButton}
                  accessible={true}
                  accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
                >
                  <Ionicons 
                    name={isPasswordVisible ? "eye-off" : "eye"} 
                    size={22} 
                    color={airbnbColors.mediumGray}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>
            
            {/* Forgot password link */}
            <TouchableOpacity 
              style={styles.forgotPasswordButton}
              onPress={() => router.push('/auth/forgot-password')}
              accessible={true}
              accessibilityLabel="Forgot password"
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
            
            {/* Login button - Airbnb style */}
            <Animated.View style={[styles.loginButtonContainer, buttonAnimatedStyle]}>
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoggingIn}
                style={[
                  styles.loginButton,
                  isLoggingIn && styles.loginButtonDisabled
                ]}
                accessible={true}
                accessibilityLabel={isLoggingIn ? "Logging in" : "Log In"}
              >
                {isLoggingIn ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View style={[styles.spinner, spinnerAnimatedStyle]}>
                      <Ionicons name="refresh" size={20} color={airbnbColors.white} />
                    </Animated.View>
                    <Text style={styles.buttonText}>Logging in...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </ScrollView>
      
      {/* Footer - Clean Airbnb style */}
      <Animated.View 
        entering={FadeInUp.delay(600).duration(800)}
        style={styles.footer}
      >
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <TouchableOpacity 
            onPress={() => router.push('/(pre-auth)/signup')}
            accessible={true}
            accessibilityLabel="Sign up for a new account"
          >
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: airbnbColors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: airbnbColors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logo: {
    width: 50,
    height: 50,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: airbnbColors.darkGray,
    lineHeight: 24,
    textAlign: 'center',
  },
  streakCard: {
    backgroundColor: airbnbColors.secondaryLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: airbnbColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  streakIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: airbnbColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakContent: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.secondary,
    marginBottom: 2,
  },
  streakSubtitle: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: airbnbColors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: airbnbColors.gray,
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapperFocused: {
    borderColor: airbnbColors.charcoal,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperError: {
    borderColor: airbnbColors.error,
    borderWidth: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: airbnbColors.charcoal,
    paddingVertical: 0,
    // Remove any default borders or outlines
    borderWidth: 0,
    outlineWidth: 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: airbnbColors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: airbnbColors.primary,
    fontWeight: '500',
  },
  loginButtonContainer: {
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: airbnbColors.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: airbnbColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
  signupLink: {
    fontSize: 14,
    color: airbnbColors.primary,
    fontWeight: '600',
  },
});