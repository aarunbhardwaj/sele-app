import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import Text from '../../components/ui/Typography';
import { Button } from '../../components/ui2/button-native';
import { Card, CardContent } from '../../components/ui2/card-native';
import { Input } from '../../components/ui2/input-native';
import PreAuthHeader, { preAuthColors } from '../../components/ui2/pre-auth-header';
import { useAuth } from '../../services/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  // Animation values
  const logoScale = useSharedValue(0.8);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(0.95);
  // Spinner rotation value
  const rotation = useSharedValue(0);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginAttempt, setLoginAttempt] = useState(0);
  const [showTip, setShowTip] = useState(false);
  const tipOpacity = useSharedValue(0);
  
  // Gamification elements
  const [streakDays, setStreakDays] = useState(7); // Simulated streak data
  
  useEffect(() => {
    // Logo entrance animation
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 600, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.quad) })
    );
    
    // Content entrance animation
    contentOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    contentTranslateY.value = withDelay(
      400,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    
    // Form entrance animation
    formOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    formTranslateY.value = withDelay(
      800,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) })
    );
  }, []);
  
  useEffect(() => {
    if (isLoggingIn) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [isLoggingIn]);
  
  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });
  
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: contentTranslateY.value }],
    };
  });
  
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }],
    };
  });
  
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });
  
  const tipAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: tipOpacity.value,
    };
  });
  
  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  
  const handleLogin = async () => {
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 200, easing: Easing.bounce })
    );
    setIsLoggingIn(true);
    setLoginAttempt(loginAttempt + 1);
    try {
      await login(email, password);
      // Navigation is handled in AuthContext after successful login
    } catch (error) {
      // Error is handled in AuthContext (alert), but you can add extra UI feedback here if needed
    } finally {
      setIsLoggingIn(false);
      setShowTip(true);
      tipOpacity.value = withTiming(1, { duration: 500 });
      setTimeout(() => {
        tipOpacity.value = withTiming(0, { duration: 500 });
        setTimeout(() => setShowTip(false), 500);
      }, 4000);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Using the shared header component without back button */}
      <PreAuthHeader title="Log In" />
      
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Image
            source={require('../../assets/images/app-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Log in to continue your learning journey</Text>
        
        {/* Streak reminder - Duolingo style gamification */}
        <View style={styles.streakContainer}>
          <View style={styles.streakIcon}>
            <Ionicons name="flame" size={22} color="#FF7F50" />
          </View>
          <Text style={styles.streakText}>
            Don't break your {streakDays}-day streak! Sign in to continue learning.
          </Text>
        </View>
        
        {/* Form section */}
        <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
          <Card style={styles.formCard}>
            <CardContent style={styles.cardContent}>
              {/* Email input */}
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon={<Ionicons name="mail-outline" size={20} color={preAuthColors.textLight} />}
                />
              </View>
              
              {/* Password input */}
              <View style={styles.inputWrapper}>
                <Input
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={preAuthColors.textLight} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                      <Ionicons 
                        name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={preAuthColors.textLight}
                      />
                    </TouchableOpacity>
                  }
                />
              </View>
              
              {/* Login button */}
              <Animated.View style={buttonAnimatedStyle}>
                <Button
                  onPress={handleLogin}
                  className="bg-emerald-500 w-full py-4 my-4"
                  textClassName="text-white font-bold"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <View style={styles.loadingContainer}>
                      <Text className="text-white mr-2">Logging in</Text>
                      <Animated.View style={[{ width: 16, height: 16 }, spinnerAnimatedStyle]}>
                        <Ionicons name="refresh" size={16} color="white" />
                      </Animated.View>
                    </View>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </Animated.View>
              
              {/* Forgot password link */}
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={() => router.push('/auth/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </CardContent>
          </Card>
          
          {/* Language learning tip - appears after login attempt */}
          {showTip && (
            <Animated.View style={[styles.tipContainer, tipAnimatedStyle]}>
              <View style={styles.tipIconContainer}>
                <Ionicons name="bulb-outline" size={24} color={preAuthColors.pastelYellow} />
              </View>
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>Learning Tip</Text>
                <Text style={styles.tipText}>
                  Practice speaking out loud for just 5 minutes a day to improve your pronunciation dramatically!
                </Text>
              </View>
            </Animated.View>
          )}
          
          {/* Social login options */}
          <View style={styles.socialLoginContainer}>
            <Text style={styles.socialLoginText}>Or continue with</Text>
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={20} color={preAuthColors.textDark} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={20} color={preAuthColors.textDark} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={20} color={preAuthColors.textDark} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
      
      {/* Footer - Sign up link */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/(pre-auth)/signup')}>
          <Text style={styles.signupLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: preAuthColors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: preAuthColors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: preAuthColors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFECE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  streakText: {
    flex: 1,
    fontSize: 14,
    color: '#E67E22',
  },
  formContainer: {
    width: '100%',
  },
  formCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardContent: {
    padding: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: preAuthColors.softPurple,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLoginContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  socialLoginText: {
    fontSize: 14,
    color: preAuthColors.textLight,
    marginBottom: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: preAuthColors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: preAuthColors.softPurple + '20',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: preAuthColors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: preAuthColors.textDark,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: preAuthColors.textLight,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: preAuthColors.textLight,
    marginRight: 4,
  },
  signupLink: {
    fontSize: 14,
    color: preAuthColors.emerald,
    fontWeight: '600',
  },
});