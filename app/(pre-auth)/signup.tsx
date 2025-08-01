import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import Text from '../../components/ui/Typography';
import { Button } from '../../components/ui2/button-native';
import { Card, CardContent } from '../../components/ui2/card-native';
import { Input } from '../../components/ui2/input-native';
import PreAuthHeader, { preAuthColors } from '../../components/ui2/pre-auth-header';

const { width } = Dimensions.get('window');

const badges = [
  {
    id: '1',
    title: 'Early Bird',
    icon: 'sunrise',
    color: '#f59e0b',
    description: 'Join the early adopters of our language learning platform',
  },
  {
    id: '2',
    title: 'Quick Learner',
    icon: 'flash',
    color: '#14b8a6',
    description: 'Complete your first lesson within 24 hours',
  },
  {
    id: '3',
    title: 'Social Learner',
    icon: 'people',
    color: '#a855f7',
    description: 'Connect your social accounts to find friends',
  },
];

export default function SignUpScreen() {
  const router = useRouter();
  
  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const badgesTranslateX = useSharedValue(width);
  const characterBounce = useSharedValue(1);
  const buttonScale = useSharedValue(0.95);
  const confettiOpacity = useSharedValue(0);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [step, setStep] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  
  // Animated confetti positions for celebration effect
  const confettiPositions = Array.from({ length: 30 }).map(() => ({
    x: useSharedValue(Math.random() * width),
    y: useSharedValue(-20),
    rotate: useSharedValue(Math.random() * 360),
    size: 5 + Math.random() * 10,
    color: ['#FFD700', '#FF6347', '#4169E1', '#32CD32', '#FF69B4'][Math.floor(Math.random() * 5)],
  }));
  
  useEffect(() => {
    // Header animation
    headerOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) });
    headerTranslateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) });
    
    // Form animation
    formOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    formTranslateY.value = withDelay(
      400,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    
    // Animate character bounce continuously for fun
    characterBounce.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.bounce }),
        withTiming(1, { duration: 1000, easing: Easing.bounce }),
      ),
      -1,
      true
    );
  }, []);
  
  // Show badges animation when moving to step 2
  useEffect(() => {
    if (step === 2) {
      badgesTranslateX.value = withSpring(0, { damping: 12, stiffness: 100 });
      
      // Show confetti celebration
      showConfettiAnimation();
    }
  }, [step]);
  
  const showConfettiAnimation = () => {
    setShowConfetti(true);
    confettiOpacity.value = 1;
    
    // Animate each confetti piece
    confettiPositions.forEach((confetti, index) => {
      confetti.y.value = withDelay(
        index * 20,
        withTiming(500 + Math.random() * 300, { duration: 1500 + Math.random() * 1000 })
      );
      confetti.rotate.value = withDelay(
        index * 20,
        withTiming(confetti.rotate.value + 360 * 2 + Math.random() * 360, { duration: 1500 + Math.random() * 1000 })
      );
    });
    
    // Hide confetti after animation
    setTimeout(() => {
      confettiOpacity.value = withTiming(0, { duration: 500 });
      setTimeout(() => setShowConfetti(false), 500);
    }, 3000);
  };
  
  // Animated styles
  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));
  
  const badgesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: badgesTranslateX.value }],
  }));
  
  const characterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: characterBounce.value }],
  }));
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  
  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    pointerEvents: 'none',
  }));
  
  const handleContinue = () => {
    // Animate button press
    buttonScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 200, easing: Easing.bounce })
    );
    
    if (step === 1) {
      if (name && email && password && isTermsAccepted) {
        setStep(2);
      }
    } else {
      setIsSigningUp(true);
      
      // Simulate signup process
      setTimeout(() => {
        setIsSigningUp(false);
        router.replace('/(tabs)');
      }, 1500);
    }
  };
  
  const goBack = () => {
    if (step === 2) {
      setStep(1);
      badgesTranslateX.value = width;
    } else {
      router.back();
    }
  };

  // Custom component for step indicator in the header
  const StepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={[styles.stepDot, { backgroundColor: step >= 1 ? preAuthColors.emerald : preAuthColors.lightGrey }]} />
      <View style={styles.stepLine} />
      <View style={[styles.stepDot, { backgroundColor: step >= 2 ? preAuthColors.emerald : preAuthColors.lightGrey }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Using shared PreAuthHeader component */}
      <View>
        <PreAuthHeader 
          title={step === 1 ? 'Create Account' : 'Almost Done!'} 
        />
        <StepIndicator />
      </View>
      
      {/* Confetti animation overlay */}
      {showConfetti && (
        <Animated.View style={[confettiAnimatedStyle]} pointerEvents="none">
          {confettiPositions.map((confetti, index) => (
            <Animated.View 
              key={index}
              style={{
                position: 'absolute',
                width: confetti.size,
                height: confetti.size,
                backgroundColor: confetti.color,
                borderRadius: confetti.size / 2,
                top: 0,
                left: 0,
                transform: [
                  { translateX: confetti.x },
                  { translateY: confetti.y },
                  { rotate: confetti.rotate },
                ],
              }}
            />
          ))}
        </Animated.View>
      )}
      
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
      >
        {step === 1 ? (
          <View style={styles.content}>
            <Animated.View style={characterAnimatedStyle}>
              <Image
                source={require('../../assets/images/app-logo.png')}
                style={styles.character}
                resizeMode="contain"
              />
            </Animated.View>
            
            <Text style={styles.title}>Join Our Community</Text>
            <Text style={styles.subtitle}>Create an account to start your language learning journey</Text>
            
            {/* Form section */}
            <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
              <Card style={styles.formCard}>
                <CardContent style={styles.cardContent}>
                  {/* Name input */}
                  <View style={styles.inputWrapper}>
                    <Input
                      placeholder="Your Name"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      leftIcon={<Ionicons name="person-outline" size={20} color={preAuthColors.textLight} />}
                    />
                  </View>
                  
                  {/* Email input */}
                  <View style={styles.inputWrapper}>
                    <Input
                      placeholder="Email Address"
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
                  
                  {/* Terms and Conditions Checkbox */}
                  <View style={styles.checkboxContainer}>
                    <TouchableOpacity 
                      style={styles.checkbox}
                      onPress={() => setIsTermsAccepted(!isTermsAccepted)}
                    >
                      {isTermsAccepted ? (
                        <Ionicons name="checkmark" size={16} color={preAuthColors.emerald} />
                      ) : null}
                    </TouchableOpacity>
                    <Text style={styles.checkboxText}>
                      I accept the{' '}
                      <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                      <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                  </View>
                  
                  {/* Continue button */}
                  <Animated.View style={buttonAnimatedStyle}>
                    <Button
                      onPress={handleContinue}
                      className="bg-emerald-500 w-full py-3 mt-4"
                      textClassName="text-white font-bold"
                      disabled={!name || !email || !password || !isTermsAccepted}
                    >
                      <View style={styles.buttonContent}>
                        <Text className="text-white font-bold mr-2">Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                      </View>
                    </Button>
                  </Animated.View>
                </CardContent>
              </Card>
              
              {/* Terms and conditions */}
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
              
              {/* Social signup options */}
              <View style={styles.socialContainer}>
                <Text style={styles.socialText}>Or sign up with</Text>
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
          </View>
        ) : (
          // Step 2 - Badges and gamification elements
          <View style={styles.content}>
            <Text style={styles.title}>You're Almost There!</Text>
            <Text style={styles.subtitle}>Claim your first badges and start learning</Text>
            
            {/* Badges section */}
            <Animated.View style={[styles.badgesContainer, badgesAnimatedStyle]}>
              {badges.map((badge) => (
                <Card key={badge.id} style={styles.badgeCard}>
                  <CardContent style={styles.badgeContent}>
                    <View 
                      style={[styles.badgeIconContainer, { backgroundColor: badge.color + '20' }]}
                    >
                      <Ionicons name={badge.icon} size={28} color={badge.color} />
                    </View>
                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                    <Text style={styles.badgeDescription}>{badge.description}</Text>
                    
                    {/* Badge progress indicator */}
                    <View style={styles.badgeProgressContainer}>
                      <View style={styles.badgeProgressBar}>
                        <View 
                          style={[
                            styles.badgeProgressFill, 
                            { backgroundColor: badge.color, width: badge.id === '1' ? '100%' : '0%' }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.badgeProgressText, { color: badge.color }]}>
                        {badge.id === '1' ? 'Unlocked' : 'Coming Soon'}
                      </Text>
                    </View>
                  </CardContent>
                </Card>
              ))}
              
              {/* XP bonus card - Duolingo style */}
              <Card style={styles.xpBonusCard}>
                <CardContent style={styles.xpBonusContent}>
                  <View style={styles.xpIconContainer}>
                    <Text style={styles.xpText}>+100</Text>
                    <Text style={styles.xpLabel}>XP</Text>
                  </View>
                  <View style={styles.xpTextContainer}>
                    <Text style={styles.xpBonusTitle}>Sign-up Bonus!</Text>
                    <Text style={styles.xpBonusDescription}>
                      Get a head start with 100 XP when you create your account today
                    </Text>
                  </View>
                </CardContent>
              </Card>
              
              {/* Final signup button */}
              <Animated.View style={buttonAnimatedStyle}>
                <Button
                  onPress={handleContinue}
                  className="bg-emerald-500 w-full py-3 mt-6"
                  textClassName="text-white font-bold"
                  disabled={isSigningUp}
                >
                  {isSigningUp ? (
                    <View style={styles.buttonContent}>
                      <Text className="text-white mr-2">Creating account</Text>
                      <Animated.View 
                        style={{ 
                          width: 16, 
                          height: 16,
                          transform: [{ rotate: withRepeat(withTiming('360deg', { duration: 1000 }), -1) }]
                        }}
                      >
                        <Ionicons name="refresh" size={16} color="white" />
                      </Animated.View>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Text className="text-white font-bold mr-2">Start Learning Now</Text>
                      <Ionicons name="rocket-outline" size={20} color="white" />
                    </View>
                  )}
                </Button>
              </Animated.View>
            </Animated.View>
          </View>
        )}
      </ScrollView>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/(pre-auth)/login')}>
          <Text style={styles.loginLink}>Log in</Text>
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
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 16,
    marginTop: -16,
    backgroundColor: preAuthColors.lightGrey,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLine: {
    width: 80,
    height: 2,
    backgroundColor: preAuthColors.lightGrey,
    marginHorizontal: 5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  character: {
    width: 100,
    height: 100,
    marginBottom: 24,
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
  formContainer: {
    width: '100%',
  },
  formCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: preAuthColors.textLight,
    marginTop: 16,
  },
  termsLink: {
    color: preAuthColors.emerald,
    fontWeight: '600',
  },
  socialContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  socialText: {
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
  badgesContainer: {
    width: '100%',
    paddingVertical: 16,
  },
  badgeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  badgeContent: {
    padding: 16,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: preAuthColors.textDark,
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    color: preAuthColors.textLight,
    marginBottom: 12,
  },
  badgeProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: preAuthColors.lightGrey,
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  badgeProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  badgeProgressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  xpBonusCard: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF9C4',
  },
  xpBonusContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  xpText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  xpTextContainer: {
    flex: 1,
  },
  xpBonusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 4,
  },
  xpBonusDescription: {
    fontSize: 14,
    color: '#7D6E00',
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
  loginLink: {
    fontSize: 14,
    color: preAuthColors.emerald,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: preAuthColors.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxText: {
    fontSize: 14,
    color: preAuthColors.textDark,
    flex: 1,
  },
});