import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function VerificationCodeScreen() {
  const [code, setCode] = useState(['', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Create refs for each input field to enable auto-focus
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null), // Password field
  ];

  const handleCodeChange = (text, index) => {
    if (text.length <= 1) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);
      
      // Auto-focus to next field if current field is filled
      if (text.length === 1 && index < 3) {
        inputRefs[index + 1].current.focus();
      }
    }
  };

  const handleSubmit = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 4) {
      Alert.alert('Error', 'Please enter a valid verification code');
      return;
    }
    
    if (!password) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    // Simulate API request delay
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Success', 
        'Your password has been reset successfully',
        [
          { text: 'Login Now', onPress: () => router.push('/auth/login') }
        ]
      );
    }, 1500);

    // In a real app, you would send a request to your backend:
    // try {
    //   await api.verifyCodeAndResetPassword(verificationCode, password);
    //   Alert.alert(
    //     'Success', 
    //     'Your password has been reset successfully',
    //     [{ text: 'Login Now', onPress: () => router.push('/auth/login') }]
    //   );
    // } catch (error) {
    //   Alert.alert('Error', error.message);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const resendCode = () => {
    Alert.alert('Verification Code', 'A new code has been sent to your email');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Verify Code' }} />
      
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>
        We've sent a verification code to your email. Please enter it below to reset your password.
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={inputRefs[index]}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.resendButton} onPress={resendCode}>
        <Text style={styles.resendText}>Resend Code</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <TextInput
          ref={inputRefs[4]}
          style={styles.input}
          placeholder="Enter new password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.linkButton} 
        onPress={() => router.push('/auth/login')}
      >
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  resendButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  resendText: {
    color: '#3b82f6',
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 16,
  },
});