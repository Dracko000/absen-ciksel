import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg';
import { TouchableOpacity as TouchableOpacityGesture } from 'react-native-gesture-handler';

export default function GuruDashboard() {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          if (parsedData.role !== 'guru') {
            Alert.alert('Akses Ditolak', 'Anda tidak memiliki akses ke halaman ini');
            router.back();
            return;
          }
          setUserInfo(parsedData);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };

    loadUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleScanQR = () => {
    router.push('/scan');
  };

  const handleExport = () => {
    router.push('/export');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Dashboard Guru</ThemedText>
        {userInfo && (
          <ThemedText style={styles.welcomeText}>Selamat datang, {userInfo.name}</ThemedText>
        )}
      </ThemedView>

      <ScrollView style={styles.content}>
        <ThemedView style={styles.qrSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>QR Code Anda</ThemedText>
          <ThemedText style={styles.qrDescription}>
            Tunjukkan QR Code ini saat diabsen oleh Kepala Sekolah
          </ThemedText>

          <View style={styles.qrContainer}>
            {userInfo && (
              <QRCode
                value={JSON.stringify({ id: userInfo.id, name: userInfo.name, type: 'guru', timestamp: Date.now() })}
                size={200}
                bgColor="white"
                fgColor="black"
              />
            )}
          </View>
        </ThemedView>

        <ThemedView style={styles.actionsSection}>
          <TouchableOpacity style={styles.optionButton} onPress={handleScanQR}>
            <ThemedText type="button" style={styles.optionButtonText}>Scan QR Code Murid</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={handleExport}>
            <ThemedText type="button" style={styles.optionButtonText}>Export Data Absensi</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <TouchableOpacityGesture style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText type="button" style={styles.logoutButtonText}>Keluar</ThemedText>
        </TouchableOpacityGesture>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    marginTop: 10,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  qrDescription: {
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  qrContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  actionsSection: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  optionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});