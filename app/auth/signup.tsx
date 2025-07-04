import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../services/AuthContext';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validate = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 px-8 pt-12 pb-8">
          {/* Header */}
          <View className="items-center mb-8">
            <Image
              source={require('../../assets/images/app-logo.png')}
              className="w-20 h-20 mb-4"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-blue-600">Create Account</Text>
            <Text className="text-gray-500 text-center mt-1">
              Sign up to start your learning journey
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            {/* Name */}
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                <Ionicons name="person-outline" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
              {errors.name ? <Text className="text-red-500 text-sm mt-1">{errors.name}</Text> : null}
            </View>

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
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Confirm Password</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg px-4 py-3 bg-gray-50">
                <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? <Text className="text-red-500 text-sm mt-1">{errors.confirmPassword}</Text> : null}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              className={`mt-4 py-3.5 rounded-lg items-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-semibold">Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Already have an account */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text className="text-blue-600 font-semibold">Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}