import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {getUserProfile, loginUser} from "@/api/auth";
import { useAuth } from '@/hooks/AuthContext'; // Add this if not already imported

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);


  const { refreshAuth } = useAuth(); // Pull it from context

const handleLogin = async () => {
  try {
    const token = await loginUser(email.trim(), password.trim());

    if (token) {
      await AsyncStorage.setItem('jwtToken', token);

      const userProfile = await getUserProfile(token);
      if (userProfile?.username) {
        await AsyncStorage.setItem('username', userProfile.username);
      }

      await refreshAuth(); // ✅ This updates context immediately

      router.replace('/(tabs)/JewelryBoxScreen');
    } else {
      Alert.alert('Login Failed', 'Please check your email and password.');
    }
  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Error', 'An error occurred during login.');
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to BidGoat 🐐</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
  <TextInput
    style={styles.passwordInput}
    placeholder="Password"
    secureTextEntry={!showPassword}
    value={password}
    onChangeText={setPassword}
  />
  <Text onPress={() => setShowPassword(prev => !prev)} style={styles.toggle}>
    {showPassword ? '🙈 Hide' : '👁️ Show'}
  </Text>
</View>

<Text onPress={() => router.push('/login')} style={styles.link}>
  Don't have an account? Register
</Text>


      <Button title="Login" onPress={handleLogin} disabled={!email || !password} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff' // Optional — makes it look cleaner
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8
  },
  link: {
  color: '#007aff',
  textAlign: 'center',
  marginTop: 16,
  textDecorationLine: 'underline',
  fontSize: 16
},
  passwordContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#bfae82',
  backgroundColor: '#fffef8',
  paddingHorizontal: 12,
  paddingVertical: 8,
  marginBottom: 16,
  borderRadius: 12,
},
passwordInput: {
  flex: 1,
  fontSize: 16,
  paddingVertical: 8,
},
  toggle: {
  marginLeft: 12,
  color: '#007aff',
  fontWeight: '500',
}

});



export default LoginScreen;
