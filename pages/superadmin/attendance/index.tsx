import { useState } from 'react';
import { withAuth } from '@/utils/withAuth';
import Layout from '@/components/layout/Layout';
import BarcodeScanner from '@/components/barcode/BarcodeScanner';
import { validateUserFromBarcode } from '@/utils/barcode';
import { logActivity } from '@/lib/activity';
import { UserRole } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

const TakeTeacherAttendance = () => {
  const { state } = useAuth();
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<string>('PRESENT'); // PRESENT, ABSENT, LATE
  const [note, setNote] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleScan = async (decodedText: string) => {
    try {
      setErrorMessage('');
      const user = await validateUserFromBarcode(decodedText);

      // Only allow scanning teachers if current user is a superadmin
      if (user.role !== 'ADMIN') {
        throw new Error('This barcode does not belong to a teacher');
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
      // Create attendance record
      const attendance = await prisma.attendance.create({
        data: {
          userId: scannedUser.id,
          attendanceType: 'GURU', // For teacher attendance
          date: new Date(),
          status: attendanceStatus,
          recordedBy: state.user.id, // The logged-in user (superadmin) is recording
          note: note || null,
        }
      });

      // Log the attendance activity
      await logActivity(
        state.user.id,
        'ATTENDANCE_TAKEN',
        `Recorded ${attendanceStatus} attendance for teacher ${scannedUser.name}`,
        '', // IP address
        '' // User agent
      );

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
    <Layout userRole="SUPERADMIN">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Ambil Kehadiran Guru</h1>
        <p className="text-gray-600">Pindai barcode guru untuk mencatat kehadiran</p>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detail Guru</h2>
          
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
              <p className="text-gray-500">Silakan pindai barcode guru</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(TakeTeacherAttendance, { requiredRoles: [UserRole.SUPERADMIN] });