// pages/admin/attendance.tsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/jwt';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const AttendancePage: React.FC = () => {
  const { state } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<{[key: string]: string}>({});

  // Check if user has ADMIN role
  if (state.user?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Akses Ditolak</h1>
          <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  // Fetch students in the admin's class
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/attendance/students?classId=${state.user?.classId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setStudents(data.students || []);
          // Initialize attendance status for each student
          const initialStatus: {[key: string]: string} = {};
          data.students?.forEach((student: any) => {
            initialStatus[student.id] = 'PRESENT'; // Default to present
          });
          setAttendanceStatus(initialStatus);
        } else {
          console.error('Error fetching students:', data.message);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    if (state.user?.classId) {
      fetchStudents();
    }
  }, [state.user]);

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        const response = await fetch(`/api/attendance?date=${selectedDate}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setAttendanceRecords(data.attendance || []);
        } else {
          console.error('Error fetching attendance:', data.message);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    if (selectedDate) {
      fetchAttendanceRecords();
    }
  }, [selectedDate]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    
    try {
      // Prepare attendance data
      const attendanceData = students.map(student => ({
        userId: student.id,
        status: attendanceStatus[student.id] || 'ABSENT',
        date: selectedDate,
        attendanceType: 'DAILY',
        note: '' // Could add notes functionality later
      }));

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          attendanceData,
          recordedBy: state.user?.id
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert('Data kehadiran berhasil disimpan');
      } else {
        alert(result.message || 'Gagal menyimpan data kehadiran');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Gagal menyimpan data kehadiran');
    } finally {
      setLoading(false);
    }
  };

  if (loading && students.length === 0) {
    return (
      <DashboardLayout title="Absensi Siswa">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Memuat data siswa...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Absensi Siswa">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Button 
              onClick={handleSaveAttendance} 
              variant="success"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Kehadiran'}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Siswa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Kehadiran</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.userId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={attendanceStatus[student.id] || 'PRESENT'}
                    onChange={(e) => handleStatusChange(student.id, e.target.value)}
                    className="w-32 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PRESENT">Hadir</option>
                    <option value="ABSENT">Tidak Hadir</option>
                    <option value="LATE">Terlambat</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Note field could be added here if needed */}
                  <input
                    type="text"
                    placeholder="Catatan opsional"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada data siswa dalam kelas ini.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;