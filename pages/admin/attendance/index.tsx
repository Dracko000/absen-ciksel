import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import dynamic from 'next/dynamic';
import { UserRole } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

// Dynamically import the barcode scanner to reduce initial bundle size
const BarcodeScanner = dynamic(() => import('@/components/barcode/BarcodeScanner'), {
  loading: () => <p>Loading scanner...</p>,
  ssr: false // Don't render on server side
});

const TakeStudentAttendance = () => {
  const { state } = useAuth();

  // Check authentication and role on the client-side
  useEffect(() => {
    if (state.user && state.user.role !== UserRole.ADMIN) {
      // Redirect unauthorized users
      window.location.href = '/unauthorized';
    }
  }, [state.user]);
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string>('PRESENT'); // PRESENT, ABSENT, LATE
  const [note, setNote] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleScan = async (decodedText: string) => {
    try {
      setErrorMessage('');

      // Validate user via API call instead of direct function call
      const response = await fetch('/api/validate-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({ barcodeData: decodedText })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error validating user from barcode');
      }

      const { user } = await response.json();

      // Only allow scanning students if current user is an admin
      if (user.role !== 'USER') {
        throw new Error('This barcode does not belong to a student');
      }

      setScannedUser(user);
    } catch (error: any) {
      setErrorMessage(error.message || 'Error validating user from barcode');
      setScannedUser(null);
    }
  };

  const handleError = (errorMessage: string) => {
    console.error('Barcode scanning error:', errorMessage);
  };

  const recordAttendance = async () => {
    if (!scannedUser) {
      setErrorMessage('No user scanned');
      return;
    }

    if (!state.user?.id) {
      setErrorMessage('User session error');
      return;
    }

    try {
      // Make API call to record attendance
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify({
          userId: scannedUser.id,
          attendanceType: 'MURID', // For student attendance
          status: attendanceStatus,
          recordedBy: state.user.id, // The logged-in user (teacher) is recording
          note: note || null,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error recording attendance');
      }

      // Log the attendance activity via API call instead of direct function call
      try {
        await fetch('/api/activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.token}`
          },
          body: JSON.stringify({
            action: 'ATTENDANCE_TAKEN',
            description: `Recorded ${attendanceStatus} attendance for student ${scannedUser.name}`,
          })
        });
      } catch (error) {
        console.error('Error logging activity:', error);
        // We don't want to fail the attendance recording if activity logging fails
      }

      setSuccessMessage(`Attendance recorded for ${scannedUser.name}`);
      setScannedUser(null);
      setNote('');

      // Optional: Add a delay before allowing the next scan
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Error recording attendance');
    }
  };

  return (
    <Layout userRole="ADMIN">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Ambil Kehadiran Siswa</h1>
        <p className="text-gray-600">Pindai barcode siswa untuk mencatat kehadiran</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pemindai Barcode</h2>
          <BarcodeScanner 
            onScan={handleScan} 
            onError={handleError} 
          />
          
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}
          
          {successMessage && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detail Siswa</h2>
          
          {scannedUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">{scannedUser.name}</h3>
                <p className="text-gray-600">ID: {scannedUser.userId}</p>
                <p className="text-gray-600">Role: {scannedUser.role}</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Kehadiran
                  </label>
                  <select
                    value={attendanceStatus}
                    onChange={(e) => setAttendanceStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PRESENT">Hadir</option>
                    <option value="ABSENT">Tidak Hadir</option>
                    <option value="LATE">Terlambat</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Catatan tambahan..."
                  />
                </div>
                
                <button
                  onClick={recordAttendance}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Catat Kehadiran
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
              <p className="text-gray-500">Silakan pindai barcode siswa</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TakeStudentAttendance;