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
  // Loading state: true only during initial load of students list
  const [loading, setLoading] = useState(true);
  // Specific loading state for attendance fetching (when date changes or attendance is viewed)
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<{[key: string]: string}>({});

  // Pagination state for students
  const [currentPageStudents, setCurrentPageStudents] = useState<number>(1);
  const [limitStudents] = useState<number>(10); // Keep limit fixed for now
  const [studentPaginationMeta, setStudentPaginationMeta] = useState<{current: number, pages: number, total: number, limit: number} | null>(null);

  // Pagination state for attendance records (when viewing)
  const [currentPageAttendance, setCurrentPageAttendance] = useState<number>(1);
  const [limitAttendance] = useState<number>(10); // Keep limit fixed for now
  const [attendancePaginationMeta, setAttendancePaginationMeta] = useState<{current: number, pages: number, total: number, limit: number} | null>(null);

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
      setLoading(true); // Set loading true at the start of fetching students
      try {
        const response = await fetch(`/api/attendance/students?classId=${state.user?.classId}&page=${currentPageStudents}&limit=${limitStudents}`, {
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
          // Update pagination metadata
          setStudentPaginationMeta(data.pagination);
        } else {
          console.error('Error fetching students:', data.message);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false); // Set loading false after fetching students is done
      }
    };

    if (state.user?.classId) {
      fetchStudents();
    }
  }, [state.user, currentPageStudents]); // Add currentPageStudents to dependency array

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      setLoadingAttendance(true); // Set specific loading state for attendance
      try {
        const response = await fetch(`/api/attendance?date=${selectedDate}&page=${currentPageAttendance}&limit=${limitAttendance}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setAttendanceRecords(data.attendance || []);
          // Update pagination metadata for attendance
          setAttendancePaginationMeta(data.pagination);
        } else {
          console.error('Error fetching attendance:', data.message);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoadingAttendance(false); // Reset specific loading state for attendance
      }
    };

    if (selectedDate) {
      fetchAttendanceRecords();
    }
  }, [selectedDate, currentPageAttendance]); // Add currentPageAttendance to dependency array

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceStatus(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handlePageChangeStudents = (newPage: number) => {
    if (newPage >= 1 && newPage <= (studentPaginationMeta?.pages || 1)) {
        setCurrentPageStudents(newPage);
    }
  };

  const handleSaveAttendance = async () => {
    setLoadingAttendance(true); // Use attendance loading state for save operation

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
        // Optionally refetch attendance records for the current date/page after saving
        // fetchAttendanceRecords(); // You might need to call this explicitly or trigger the useEffect
      } else {
        alert(result.message || 'Gagal menyimpan data kehadiran');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Gagal menyimpan data kehadiran');
    } finally {
      setLoadingAttendance(false);
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
              disabled={loadingAttendance}
            >
              {loadingAttendance ? 'Menyimpan...' : 'Simpan Kehadiran'}
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
        {/* Pagination Controls for Students */}
        {studentPaginationMeta && studentPaginationMeta.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-700">
              Menampilkan {((studentPaginationMeta.current - 1) * studentPaginationMeta.limit) + 1} - {Math.min(studentPaginationMeta.current * studentPaginationMeta.limit, studentPaginationMeta.total)} dari {studentPaginationMeta.total} siswa
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChangeStudents(studentPaginationMeta.current - 1)}
                disabled={studentPaginationMeta.current === 1}
                className={`px-3 py-1 rounded-md ${studentPaginationMeta.current === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md">
                {studentPaginationMeta.current} dari {studentPaginationMeta.pages}
              </span>
              <button
                onClick={() => handlePageChangeStudents(studentPaginationMeta.current + 1)}
                disabled={studentPaginationMeta.current === studentPaginationMeta.pages}
                className={`px-3 py-1 rounded-md ${studentPaginationMeta.current === studentPaginationMeta.pages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;