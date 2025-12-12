import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarCodeScanner } from 'expo-barcode-scanner';
import QRCode from 'react-native-qrcode-svg';
import { TouchableOpacity as TouchableOpacityGesture } from 'react-native-gesture-handler';
import { getAttendanceByDateRange } from '@/services/firebase';

export default function MuridDashboard() {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          if (parsedData.role !== 'murid') {
            Alert.alert('Akses Ditolak', 'Anda tidak memiliki akses ke halaman ini');
            router.back();
            return;
          }
          setUserInfo(parsedData);

          // Load attendance history for this user
          loadAttendanceHistory(parsedData.id);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };

    loadUserInfo();
  }, []);

  const loadAttendanceHistory = async (userId: string) => {
    try {
      // Get attendance for the last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      // Fetch attendance data for this user
      const attendanceData = await getAttendanceByDateRange(startStr, endStr, 'murid');

      // Filter only this user's attendance
      const userAttendance = attendanceData.filter(record => record.userId === userId);

      setAttendanceHistory(userAttendance);
    } catch (error) {
      console.error('Error loading attendance history:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      router.replace('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Dashboard Murid</ThemedText>
        {userInfo && (
          <ThemedText style={styles.welcomeText}>Selamat datang, {userInfo.name}</ThemedText>
        )}
      </ThemedView>

      <ScrollView style={styles.content}>
        <ThemedView style={styles.qrSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>QR Code Anda</ThemedText>
          <ThemedText style={styles.qrDescription}>
            Tunjukkan QR Code ini saat diabsen oleh guru
          </ThemedText>

          <View style={styles.qrContainer}>
            {userInfo && (
              <QRCode
                value={JSON.stringify({ id: userInfo.id, name: userInfo.name, type: 'murid', timestamp: Date.now() })}
                size={200}
                bgColor="white"
                fgColor="black"
              />
            )}
          </View>
        </ThemedView>

        <ThemedView style={styles.attendanceSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Riwayat Absensi (30 hari terakhir)</ThemedText>
          {attendanceHistory.length > 0 ? (
            <View>
              {attendanceHistory.map((record, index) => (
                <View key={index} style={styles.attendanceItem}>
                  <ThemedText style={styles.attendanceDate}>
                    {new Date(record.timestamp).toLocaleDateString('id-ID')}
                  </ThemedText>
                  <ThemedText style={styles.attendanceTime}>
                    {new Date(record.timestamp).toLocaleTimeString('id-ID')}
                  </ThemedText>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText style={styles.noAttendance}>Belum ada riwayat absensi</ThemedText>
          )}
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
  attendanceSection: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 20,
  },
  attendanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  attendanceDate: {
    fontSize: 14,
  },
  attendanceTime: {
    fontSize: 14,
    color: '#666',
  },
  noAttendance: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#888',
  },
  logoutButton: {
    backgroundColor: '#f44336',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});