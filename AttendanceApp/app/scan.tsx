import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recordAttendance } from '@/services/firebase';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [role, setRole] = useState<string>('');
  const [scannerInfo, setScannerInfo] = useState<{id: string, name: string, role: string} | null>(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    const loadUserRole = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setRole(parsedData.role);
          setScannerInfo({
            id: parsedData.id,
            name: parsedData.name,
            role: parsedData.role
          });
        }
      } catch (error) {
        console.error('Error loading user role:', error);
      }
    };

    requestCameraPermission();
    loadUserRole();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: BarCodeScannerResultType, data: string }) => {
    setScanned(true);

    try {
      const qrData = JSON.parse(data);

      // Determine the expected QR code type based on user role
      let isValidQR = false;
      let targetType = '';

      if (role === 'kepsek') {
        // Kepsek can scan guru QR codes
        isValidQR = qrData.type === 'guru';
        targetType = 'guru';
      } else if (role === 'guru') {
        // Guru can scan murid QR codes
        isValidQR = qrData.type === 'murid';
        targetType = 'murid';
      }

      if (isValidQR) {
        // Record attendance using Firebase service
        if (scannerInfo) {
          await recordAttendance(qrData.id, qrData.name, targetType, scannerInfo.id, scannerInfo.role);
          Alert.alert(
            'Absensi Berhasil',
            `Berhasil mencatat kehadiran ${targetType}: ${qrData.name}`,
            [
              {
                text: 'Lanjutkan',
                onPress: () => setScanned(false)
              }
            ]
          );
        } else {
          Alert.alert(
            'Kesalahan',
            'Informasi pengguna tidak ditemukan',
            [
              {
                text: 'OK',
                onPress: () => setScanned(false)
              }
            ]
          );
        }
      } else {
        Alert.alert(
          'QR Tidak Valid',
          `Anda sebagai ${role} tidak dapat memindai QR code ${qrData.type}`,
          [
            {
              text: 'OK',
              onPress: () => setScanned(false)
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Kesalahan',
        'Data QR code tidak valid',
        [
          {
            text: 'Coba Lagi',
            onPress: () => setScanned(false)
          }
        ]
      );
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Meminta izin akses kamera...</ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Izin akses kamera tidak diberikan</ThemedText>
        <TouchableOpacity onPress={() => Linking.openSettings()}>
          <ThemedText style={styles.settingsButton}>Buka Pengaturan</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ThemedText style={styles.backButtonText}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>
          {role === 'kepsek' ? 'Scan QR Guru' : 'Scan QR Murid'}
        </ThemedText>
        <ThemedText style={styles.roleDescription}>
          {role === 'kepsek'
            ? 'Scan QR code guru untuk mencatat kehadiran guru'
            : 'Scan QR code murid untuk mencatat kehadiran murid'}
        </ThemedText>
      </ThemedView>

      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scanArea} />
        </View>
      </View>

      {scanned && (
        <ThemedView style={styles.scanResult}>
          <ThemedText>Membaca hasil...</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  roleDescription: {
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  scannerContainer: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 10,
  },
  scanResult: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
  },
  settingsButton: {
    color: '#2196F3',
    marginTop: 10,
  },
});