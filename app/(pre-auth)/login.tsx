import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../services/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);

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
      // The AuthContext will handle navigation after successful login
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Implement social login
    console.log(`Login with ${provider}`);
    // After successful login
    // router.replace('/(tabs)');
  };

  const handleForgotPassword = () => {
    // Handle forgot password
    console.log('Forgot password');
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
          <View className="items-center mb-8">
            <Image
              source={require('../../assets/images/app-logo.png')}
              className="w-20 h-20 mb-3"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-blue-600">Welcome Back</Text>
            <Text className="text-gray-500 text-center mt-1">
              Login to continue your learning journey
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
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
                  placeholder="Enter your password"
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

            {/* Remember Me & Forgot Password */}
            <View className="flex-row justify-between items-center mt-1">
              <TouchableOpacity 
                className="flex-row items-center" 
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={rememberMe ? "checkbox-outline" : "square-outline"} 
                  size={18} 
                  color="#3B82F6" 
                />
                <Text className="ml-2 text-gray-600">Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text className="text-blue-600 font-medium">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`mt-5 py-3 rounded-lg items-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
              onPress={handleLogin}
              disabled={loading}
              style={{ shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 1.5, elevation: 2 }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-0.5 bg-gray-200" />
            <Text className="mx-4 text-gray-500">or login with</Text>
            <View className="flex-1 h-0.5 bg-gray-200" />
          </View>

          {/* Social Login */}
          <View className="flex-row justify-center space-x-6">
            <TouchableOpacity
              className="w-12 h-12 border border-gray-200 rounded-full items-center justify-center bg-white"
              onPress={() => handleSocialLogin('Google')}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-12 h-12 border border-gray-200 rounded-full items-center justify-center bg-white"
              onPress={() => handleSocialLogin('Apple')}
            >
              <Ionicons name="logo-apple" size={20} color="#000000" />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-12 h-12 border border-gray-200 rounded-full items-center justify-center bg-white"
              onPress={() => handleSocialLogin('Facebook')}
            >
              <Ionicons name="logo-facebook" size={20} color="#4267B2" />
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text className="text-blue-600 font-medium">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}