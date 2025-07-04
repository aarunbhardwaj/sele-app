import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../services/AuthContext';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: ''
  });

  const validate = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: ''
    };
    let isValid = true;
    
    // Name validation
    if (!name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Terms validation
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms of Service';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const toggleTerms = () => {
    setTermsAccepted(!termsAccepted);
    if (!termsAccepted) {
      setErrors({...errors, terms: ''});
    }
  };

  const handleSignup = async () => {
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      const success = await signup(email, password, name);
      // Navigation is handled by AuthContext if successful
      if (!success) {
        // If signup returns false, it means it failed but was handled gracefully
        setLoading(false);
      }
    } catch (error) {
      // This catch block is just a safeguard; most errors are handled in AuthContext
      console.error('Unexpected signup error:', error);
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    // Implement social signup
    console.log(`Signup with ${provider}`);
    // After successful signup
    // router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="flex-1 bg-white"
        contentContainerStyle={{ 
          minHeight: height,
          justifyContent: 'center'
        }}
      >
        <View className="flex-1 px-8 justify-center">
          {/* Header */}
          <View className="items-center mb-6">
            <Image
              source={require('../../assets/images/app-logo.png')}
              className="w-20 h-20 mb-3"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-blue-600">Create Account</Text>
            <Text className="text-gray-500 text-center mt-1">
              Sign up to start your language learning journey
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Full Name */}
            <View>
              <Text className="text-gray-700 mb-1.5 font-medium">Full Name</Text>
              <View className={`flex-row items-center border-2 rounded-lg px-2.5 py-1.5 bg-white ${errors.name ? 'border-red-400' : 'border-blue-200'}`}
                   style={{ backgroundColor: '#fafbfc', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 1 }}>
                <Ionicons name="person-outline" size={14} color={errors.name ? '#F87171' : '#3B82F6'} />
                <TextInput
                  className="flex-1 ml-2 text-sm text-gray-800"
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {errors.name ? <Text className="text-red-500 text-sm mt-1">{errors.name}</Text> : null}
            </View>

            {/* Email */}
            <View>
              <Text className="text-gray-700 mb-1.5 font-medium">Email</Text>
              <View className={`flex-row items-center border-2 rounded-lg px-2.5 py-1.5 bg-white ${errors.email ? 'border-red-400' : 'border-blue-200'}`}
                   style={{ backgroundColor: '#fafbfc', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 1 }}>
                <Ionicons name="mail-outline" size={14} color={errors.email ? '#F87171' : '#3B82F6'} />
                <TextInput
                  className="flex-1 ml-2 text-sm text-gray-800"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {errors.email ? <Text className="text-red-500 text-sm mt-1">{errors.email}</Text> : null}
            </View>

            {/* Password */}
            <View>
              <Text className="text-gray-700 mb-1.5 font-medium">Password</Text>
              <View className={`flex-row items-center border-2 rounded-lg px-2.5 py-1.5 bg-white ${errors.password ? 'border-red-400' : 'border-blue-200'}`}
                   style={{ backgroundColor: '#fafbfc', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 1 }}>
                <Ionicons name="lock-closed-outline" size={14} color={errors.password ? '#F87171' : '#3B82F6'} />
                <TextInput
                  className="flex-1 ml-2 text-sm text-gray-800"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={14}
                    color="#3B82F6"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text className="text-red-500 text-sm mt-1">{errors.password}</Text> : null}
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-gray-700 mb-1.5 font-medium">Confirm Password</Text>
              <View className={`flex-row items-center border-2 rounded-lg px-2.5 py-1.5 bg-white ${errors.confirmPassword ? 'border-red-400' : 'border-blue-200'}`}
                   style={{ backgroundColor: '#fafbfc', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 1 }}>
                <Ionicons name="lock-closed-outline" size={14} color={errors.confirmPassword ? '#F87171' : '#3B82F6'} />
                <TextInput
                  className="flex-1 ml-2 text-sm text-gray-800"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={14}
                    color="#3B82F6"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text> : null}
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity 
              className="flex-row items-start mt-2" 
              onPress={toggleTerms}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={termsAccepted ? "checkbox-outline" : "square-outline"} 
                size={18} 
                color={errors.terms ? "#F87171" : "#3B82F6"} 
                style={{ marginTop: 2 }} 
              />
              <Text className="text-gray-600 ml-2 flex-1">
                By signing up, you agree to our <Text className="text-blue-600 font-medium">Terms of Service</Text> and <Text className="text-blue-600 font-medium">Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
            {errors.terms ? <Text className="text-red-500 text-sm mt-1">{errors.terms}</Text> : null}

            {/* Signup Button */}
            <TouchableOpacity
              className={`mt-4 py-3 rounded-lg items-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
              onPress={handleSignup}
              disabled={loading}
              style={{ shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 1.5, elevation: 2 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-0.5 bg-gray-200" />
            <Text className="mx-4 text-gray-500">or sign up with</Text>
            <View className="flex-1 h-0.5 bg-gray-200" />
          </View>

          {/* Social Signup */}
          <View className="flex-row justify-center space-x-6">
            <TouchableOpacity
              className="w-12 h-12 border border-gray-200 rounded-full items-center justify-center bg-white"
              onPress={() => handleSocialSignup('Google')}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-12 h-12 border border-gray-200 rounded-full items-center justify-center bg-white"
              onPress={() => handleSocialSignup('Apple')}
            >
              <Ionicons name="logo-apple" size={20} color="#000000" />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-12 h-12 border border-gray-200 rounded-full items-center justify-center bg-white"
              onPress={() => handleSocialSignup('Facebook')}
            >
              <Ionicons name="logo-facebook" size={20} color="#4267B2" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}