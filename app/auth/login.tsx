import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../services/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      await login(email, password);
      // The navigation will be handled by the AuthContext after successful login
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        'Invalid email or password. Please try again.',
        [{ text: 'OK' }]
      );
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Implement social login
    Alert.alert(
      'Social Login',
      `${provider} login is not implemented yet.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 px-8 pt-12 pb-8">
          {/* Header */}
          <View className="items-center mb-10">
            <Image
              source={require('../../assets/images/app-logo.png')}
              className="w-20 h-20 mb-4"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-blue-600">Welcome Back</Text>
            <Text className="text-gray-500 text-center mt-1">
              Sign in to continue your language learning journey
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Email */}
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Email</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email ? <Text className="text-red-500 text-sm mt-1">{errors.email}</Text> : null}
            </View>

            {/* Password */}
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Password</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text className="text-red-500 text-sm mt-1">{errors.password}</Text> : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              className="self-end" 
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text className="text-blue-600">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className={`mt-4 py-3.5 rounded-lg items-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-8">
            <View className="flex-1 h-0.5 bg-gray-200" />
            <Text className="mx-4 text-gray-500">or continue with</Text>
            <View className="flex-1 h-0.5 bg-gray-200" />
          </View>

          {/* Social Login */}
          <View className="flex-row justify-center space-x-6">
            <TouchableOpacity
              className="w-14 h-14 border border-gray-300 rounded-full items-center justify-center"
              onPress={() => handleSocialLogin('Google')}
            >
              <Ionicons name="logo-google" size={22} color="#DB4437" />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-14 h-14 border border-gray-300 rounded-full items-center justify-center"
              onPress={() => handleSocialLogin('Apple')}
            >
              <Ionicons name="logo-apple" size={22} color="#000000" />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-14 h-14 border border-gray-300 rounded-full items-center justify-center"
              onPress={() => handleSocialLogin('Facebook')}
            >
              <Ionicons name="logo-facebook" size={22} color="#4267B2" />
            </TouchableOpacity>
          </View>

          {/* Sign up link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text className="text-blue-600 font-semibold">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}