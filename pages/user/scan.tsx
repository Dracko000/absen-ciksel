// pages/user/scan.tsx
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/jwt';
import BarcodeScanner from '@/components/BarcodeScanner';
import Button from '@/components/ui/Button';

const AttendanceScanPage: React.FC = () => {
  const { state } = useAuth();
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Check if user has USER role
  if (state.user?.role !== UserRole.USER) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Akses Ditolak</h1>
          <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  const handleScanSuccess = async (decodedText: string) => {
    setScanResult(decodedText);
    setScanning(false);
    setLoading(true);
    setError('');
    
    try {
      // Record attendance
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          attendanceData: [{
            userId: state.user?.id,
            date: new Date().toISOString(),
            status: 'PRESENT',
            attendanceType: 'BARCODE',
            note: 'Attendance via barcode scan'
          }],
          recordedBy: state.user?.id
        })
      });

      const result = await response.json();

      if (response.ok) {
        setAttendanceStatus('Kehadiran berhasil dicatat!');
      } else {
        setError(result.message || 'Gagal mencatat kehadiran');
      }
    } catch (err) {
      console.error('Error recording attendance:', err);
      setError('Gagal mencatat kehadiran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanError = (error: any) => {
    console.error('Scan error:', error);
  };

  const handleRetry = () => {
    setScanning(true);
    setScanResult(null);
    setAttendanceStatus('');
    setError('');
  };

  return (
    <DashboardLayout title="Scan Kehadiran">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Scan Barcode untuk Absensi</h2>
            <p className="text-gray-600 mt-2">Arahkan kamera ke barcode Anda untuk mencatat kehadiran</p>
          </div>

          {scanning ? (
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <BarcodeScanner
                  onScanSuccess={handleScanSuccess}
                  onScanError={handleScanError}
                  fps={10}
                  qrbox={250}
                />
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-lg font-medium text-gray-800 mb-2">Kode Terbaca:</p>
                <p className="break-all text-sm font-mono bg-white p-2 rounded border">
                  {scanResult}
                </p>
              </div>
              
              {loading && (
                <div className="mt-4 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {attendanceStatus && (
                <div className="mt-4 p-3 bg-green-100 text-green-700 rounded text-center">
                  {attendanceStatus}
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-center">
                  {error}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center">
            <Button 
              onClick={handleRetry}
              variant={scanning ? 'secondary' : 'primary'}
            >
              {scanning ? 'Batal Scan' : 'Ulangi Scan'}
            </Button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Petunjuk Penggunaan:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
              <li>Pastikan kamera perangkat Anda aktif dan izin kamera diberikan</li>
              <li>Tunjukkan barcode Anda ke kamera perangkat</li>
              <li>Sistem akan mencatat kehadiran Anda secara otomatis</li>
              <li>Anda juga dapat menggunakan ID siswa Anda sebagai alternatif</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AttendanceScanPage;