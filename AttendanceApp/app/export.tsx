import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAttendanceByDateRange } from '@/services/firebase';

export default function ExportScreen() {
  const [exporting, setExporting] = useState(false);
  const [role, setRole] = useState<string>('');

  // Initialize role
  React.useEffect(() => {
    const loadUserRole = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setRole(parsedData.role);
        }
      } catch (error) {
        console.error('Error loading user role:', error);
      }
    };

    loadUserRole();
  }, []);

  const exportToExcel = async (range: string) => {
    setExporting(true);

    try {
      // Calculate date range based on selection
      const endDate = new Date();
      let startDate = new Date();

      switch(range) {
        case 'harian':
          // For daily, just set start and end to today
          startDate = new Date(endDate);
          break;
        case 'mingguan':
          // For weekly, start from the beginning of the week (Sunday)
          const dayOfWeek = endDate.getDay();
          startDate.setDate(endDate.getDate() - dayOfWeek);
          break;
        case 'bulanan':
          // For monthly, start from the beginning of the month
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
          break;
        default:
          throw new Error('Invalid range');
      }

      // Format dates as strings
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      // Fetch attendance data from Firebase service
      let userTypeFilter = null;
      if (role === 'guru') {
        userTypeFilter = 'murid'; // Guru can only export student attendance
      } else if (role === 'kepsek') {
        // Kepsek can export all types, but we'll default to showing all for now
      }

      const attendanceData = await getAttendanceByDateRange(startStr, endStr, userTypeFilter);

      // Transform the data into the expected Excel format
      const excelData = attendanceData.map(record => ({
        'Nama': record.userName,
        'ID': record.userId,
        'Tipe': record.userType,
        'Tanggal': new Date(record.timestamp).toISOString().split('T')[0],
        'Waktu': new Date(record.timestamp).toLocaleTimeString('id-ID'),
        'Status': 'Hadir', // All records in our system are "Hadir"
        'Catatan': '-' // No notes in our mock system
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Absensi');

      // Generate Excel file
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      // Define file path
      const fileName = `Absensi_${range}_${startStr}_to_${endStr}.xlsx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Write file
      await FileSystem.writeAsStringAsync(
        fileUri,
        wbout,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      Alert.alert(
        'Export Berhasil',
        `File telah disimpan: ${fileName}`,
        [
          {
            text: 'OK',
            onPress: () => setExporting(false)
          }
        ]
      );
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Error',
        'Gagal mengekspor data',
        [
          {
            text: 'OK',
            onPress: () => setExporting(false)
          }
        ]
      );
    }
  };

  const handleExport = (range: string) => {
    if (exporting) return;

    exportToExcel(range);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ThemedText style={styles.backButtonText}>← Kembali</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Export Data Absensi</ThemedText>
        <ThemedText style={styles.roleDescription}>
          Pilih rentang waktu untuk mengekspor data absensi
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <TouchableOpacity
          style={[styles.optionButton, exporting && styles.disabledButton]}
          onPress={() => handleExport('harian')}
          disabled={exporting}
        >
          <ThemedText type="button" style={styles.optionButtonText}>
            {exporting ? 'Mengekspor...' : 'Harian'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, exporting && styles.disabledButton]}
          onPress={() => handleExport('mingguan')}
          disabled={exporting}
        >
          <ThemedText type="button" style={styles.optionButtonText}>
            {exporting ? 'Mengekspor...' : 'Mingguan'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, exporting && styles.disabledButton]}
          onPress={() => handleExport('bulanan')}
          disabled={exporting}
        >
          <ThemedText type="button" style={styles.optionButtonText}>
            {exporting ? 'Mengekspor...' : 'Bulanan'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  optionButton: {
    backgroundColor: '#FF9800',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  optionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});