import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>Aplikasi Absensi QR</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>Sistem Absensi Berbasis QR Code</ThemedText>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <ThemedText type="button" style={styles.loginButtonText}>Masuk ke Aplikasi</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.infoText}>
          Untuk Kepala Sekolah, Guru, dan Siswa
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
  },
  content: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
