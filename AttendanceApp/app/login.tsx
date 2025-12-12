import { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserByEmailAndPassword } from '@/services/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      // Authenticate user using Firebase service
      const user = await getUserByEmailAndPassword(email, password);

      if (user) {
        // Save user data to AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(user));

        // Navigate based on role
        switch (user.role) {
          case 'kepsek':
            router.replace('/kepsek');
            break;
          case 'guru':
            router.replace('/guru');
            break;
          case 'murid':
            router.replace('/murid');
            break;
          default:
            setIsLoading(false);
            Alert.alert('Error', 'Role tidak valid');
            return;
        }
      } else {
        setIsLoading(false);
        Alert.alert('Error', 'Email atau password salah');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat login');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.formContainer}>
        <ThemedText type="title" style={styles.title}>Login Absensi</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <ThemedText type="button" style={styles.loginButtonText}>
            {isLoading ? 'Memproses...' : 'Masuk'}
          </ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.demoInfo}>
          Demo account: kepsek@example.com, guru@example.com, murid@example.com
        </ThemedText>
        <ThemedText style={styles.demoInfo}>
          Password: password
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoInfo: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 12,
    color: '#888',
  },
});