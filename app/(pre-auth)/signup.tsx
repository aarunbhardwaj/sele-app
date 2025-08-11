import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  primary: '#FF5A5F',
  primaryDark: '#E8484D',
  primaryLight: '#FFE8E9',
  secondary: '#00A699',
  secondaryLight: '#E0F7F5',
  white: '#FFFFFF',
  offWhite: '#FAFAFA',
  lightGray: '#F7F7F7',
  gray: '#EBEBEB',
  mediumGray: '#B0B0B0',
  darkGray: '#717171',
  charcoal: '#484848',
  black: '#222222',
  success: '#00A699',
  warning: '#FC642D',
  error: '#C13515',
  google: '#DB4437',
  apple: '#000000',
  facebook: '#1877F2',
  focus: '#FF5A5F',
  focusLight: 'rgba(255, 90, 95, 0.1)',
};

export default function SignUpScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  
  // Animation values
  const logoScale = useSharedValue(0.9);
  const buttonScale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isFocused, setIsFocused] = useState<{[key: string]: boolean}>({});
  
  useEffect(() => {
    logoScale.value = withSequence(
      withTiming(1.05, { duration: 600 }),
      withTiming(1, { duration: 400 })
    );
  }, []);
  
  useEffect(() => {
    if (isSigningUp) {
      rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
    } else {
      rotation.value = 0;
    }
  }, [isSigningUp]);
  
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
  
  // Validation functions
  const validateName = (name: string): boolean => {
    const isValid = name.trim().length >= 2;
    setErrors(prev => ({
      ...prev,
      name: isValid ? '' : 'Please enter your name (minimum 2 characters)'
    }));
    return isValid;
  };
  
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
  
  const handleSignup = async () => {
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid) {
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
    setIsSigningUp(true);
    
    try {
      await signup(email, password, name);
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setIsSigningUp(false);
    }
  };
  
  const handleFocus = (field: string) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };
  
  const handleBlur = (field: string) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
    if (field === 'name' && name) validateName(name);
    if (field === 'email' && email) validateEmail(email);
    if (field === 'password' && password) validatePassword(password);
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Airbnb-styled header */}
      <PreAuthHeader 
        title="Join Our Community"
        subtitle="Create your learning account"
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
          {/* Logo section */}
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
          
          {/* Welcome text */}
          <Animated.View 
            entering={FadeInDown.delay(300).duration(800)}
            style={styles.welcomeSection}
          >
            <Text style={styles.welcomeTitle}>Join Our Community</Text>
            <Text style={styles.welcomeSubtitle}>
              Create an account to start your language learning journey
            </Text>
          </Animated.View>
          
          {/* Form section */}
          <Animated.View
            entering={FadeInUp.delay(400).duration(800)}
            style={styles.formContainer}
          >
            {/* Name input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={[
                styles.inputWrapper,
                isFocused.name && styles.inputWrapperFocused,
                errors.name && styles.inputWrapperError
              ]}>
                <TextInput
                  placeholder="Enter your full name"
                  placeholderTextColor={airbnbColors.mediumGray}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) validateName(text);
                  }}
                  autoCapitalize="words"
                  onFocus={() => handleFocus('name')}
                  onBlur={() => handleBlur('name')}
                  style={styles.textInput}
                  accessibilityLabel="Full Name"
                  accessibilityHint="Enter your full name"
                />
              </View>
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>
            
            {/* Email input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[
                styles.inputWrapper,
                isFocused.email && styles.inputWrapperFocused,
                errors.email && styles.inputWrapperError
              ]}>
                <TextInput
                  placeholder="Enter your email address"
                  placeholderTextColor={airbnbColors.mediumGray}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) validateEmail(text);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
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
                  placeholder="Create a secure password"
                  placeholderTextColor={airbnbColors.mediumGray}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) validatePassword(text);
                  }}
                  secureTextEntry={!isPasswordVisible}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                  style={styles.textInput}
                  accessibilityLabel="Password"
                  accessibilityHint="Create a secure password"
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
            
            {/* Sign up button */}
            <Animated.View style={[styles.signupButtonContainer, buttonAnimatedStyle]}>
              <TouchableOpacity
                onPress={handleSignup}
                disabled={isSigningUp}
                style={[
                  styles.signupButton,
                  isSigningUp && styles.signupButtonDisabled
                ]}
                accessible={true}
                accessibilityLabel={isSigningUp ? "Creating account" : "Create Account"}
              >
                {isSigningUp ? (
                  <View style={styles.loadingContainer}>
                    <Animated.View style={[styles.spinner, spinnerAnimatedStyle]}>
                      <Ionicons name="refresh" size={20} color={airbnbColors.white} />
                    </Animated.View>
                    <Text style={styles.buttonText}>Creating account...</Text>
                  </View>
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
          
          {/* Social signup section */}
          <Animated.View 
            entering={FadeInUp.delay(600).duration(800)}
            style={styles.socialSection}
          >
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                accessible={true}
                accessibilityLabel="Sign up with Google"
              >
                <View style={[styles.socialIcon, { backgroundColor: airbnbColors.google }]}>
                  <Text style={styles.socialIconText}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton}
                accessible={true}
                accessibilityLabel="Sign up with Apple"
              >
                <Ionicons name="logo-apple" size={20} color={airbnbColors.apple} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          {/* Terms text */}
          <Animated.View 
            entering={FadeInUp.delay(700).duration(800)}
            style={styles.termsContainer}
          >
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <TouchableOpacity onPress={() => router.push('/terms')}>
                <Text style={styles.termsLink}>Terms of Service</Text>
              </TouchableOpacity>
              {' '}and{' '}
              <TouchableOpacity onPress={() => router.push('/privacy')}>
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </Text>
          </Animated.View>
        </Animated.View>
      </ScrollView>
      
      {/* Footer */}
      <Animated.View 
        entering={FadeInUp.delay(800).duration(800)}
        style={styles.footer}
      >
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <TouchableOpacity 
            onPress={() => router.push('/(pre-auth)/login')}
            accessible={true}
            accessibilityLabel="Log in to existing account"
          >
            <Text style={styles.loginLink}>Log in</Text>
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: airbnbColors.white,
    borderBottomWidth: 1,
    borderBottomColor: airbnbColors.gray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: airbnbColors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: airbnbColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: airbnbColors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 50,
    height: 50,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: airbnbColors.charcoal,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: airbnbColors.darkGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: airbnbColors.charcoal,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: airbnbColors.lightGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: 16,
    height: 56,
  },
  inputWrapperFocused: {
    borderColor: airbnbColors.primary,
    backgroundColor: airbnbColors.white,
    shadowColor: airbnbColors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapperError: {
    borderColor: airbnbColors.error,
    backgroundColor: airbnbColors.white,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: airbnbColors.charcoal,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: airbnbColors.error,
    marginTop: 6,
    marginLeft: 4,
  },
  signupButtonContainer: {
    marginTop: 8,
  },
  signupButton: {
    backgroundColor: airbnbColors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: airbnbColors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signupButtonDisabled: {
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
  socialSection: {
    marginBottom: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: airbnbColors.gray,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
  socialButtonsContainer: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: airbnbColors.white,
    borderRadius: 12,
    height: 48,
    borderWidth: 1,
    borderColor: airbnbColors.gray,
    gap: 12,
  },
  socialIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: airbnbColors.white,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: airbnbColors.charcoal,
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: airbnbColors.darkGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: airbnbColors.primary,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: airbnbColors.white,
    borderTopWidth: 1,
    borderTopColor: airbnbColors.gray,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: airbnbColors.darkGray,
  },
  loginLink: {
    color: airbnbColors.primary,
    fontWeight: '600',
  },
});