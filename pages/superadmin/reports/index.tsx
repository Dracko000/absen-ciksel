import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { exportAttendanceToExcel, exportStatsToExcel } from '@/lib/excel';
import { UserRole } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

const SuperAdminReports = () => {
  const { state } = useAuth();

  // Check authentication and role on the client-side
  useEffect(() => {
    if (state.user && state.user.role !== UserRole.SUPERADMIN) {
      // Redirect unauthorized users
      window.location.href = '/unauthorized';
    }
  }, [state.user]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  const handleDateChange = (type: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleExport = async (type: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    setLoading(true);
    
    try {
      // Convert string dates to Date objects
      let start: Date, end: Date;
      
      if (type === 'daily') {
        const today = new Date();
        start = new Date(today);
        start.setHours(0, 0, 0, 0);
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
      } else if (type === 'weekly') {
        const today = new Date();
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
      } else if (type === 'monthly') {
        const today = new Date();
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
      } else { // custom
        start = new Date(dateRange.startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
      }
      
      const token = localStorage.getItem('token'); // Get token from local storage
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch teacher attendance records via API
      const teacherResponse = await fetch(
        `/api/attendance/by-type?attendanceType=GURU&startDate=${encodeURIComponent(start.toISOString())}&endDate=${encodeURIComponent(end.toISOString())}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!teacherResponse.ok) {
        const teacherError = await teacherResponse.json();
        throw new Error(teacherError.error || 'Failed to fetch teacher attendance records');
      }

      const teacherData = await teacherResponse.json();
      if (!teacherData.success) {
        throw new Error(teacherData.error || 'Failed to fetch teacher attendance records');
      }
      const teacherRecords = teacherData.data || [];

      // Fetch student attendance records via API
      const studentResponse = await fetch(
        `/api/attendance/by-type?attendanceType=MURID&startDate=${encodeURIComponent(start.toISOString())}&endDate=${encodeURIComponent(end.toISOString())}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!studentResponse.ok) {
        const studentError = await studentResponse.json();
        throw new Error(studentError.error || 'Failed to fetch student attendance records');
      }

      const studentData = await studentResponse.json();
      if (!studentData.success) {
        throw new Error(studentData.error || 'Failed to fetch student attendance records');
      }
      const studentRecords = studentData.data || [];

      // Create date string for filename
      const dateStr = `${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}`;

      // Export teacher attendance
      exportAttendanceToExcel(teacherRecords, `Laporan_Kehadiran_Guru_${type}_${dateStr}`, 'GURU');

      // Export student attendance
      exportAttendanceToExcel(studentRecords, `Laporan_Kehadiran_Siswa_${type}_${dateStr}`, 'MURID');

      // Get teacher stats via API
      const teacherStatsResponse = await fetch(
        `/api/attendance?operation=summary&attendanceType=GURU&startDate=${encodeURIComponent(start.toISOString())}&endDate=${encodeURIComponent(end.toISOString())}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!teacherStatsResponse.ok) {
        const teacherStatsError = await teacherStatsResponse.json();
        throw new Error(teacherStatsError.error || 'Failed to fetch teacher stats');
      }

      const teacherStatsData = await teacherStatsResponse.json();
      if (!teacherStatsData.success) {
        throw new Error(teacherStatsData.error || 'Failed to fetch teacher stats');
      }
      const teacherStats = teacherStatsData.data;
      exportStatsToExcel(teacherStats, `Statistik_Kehadiran_Guru_${type}_${dateStr}`, 'Guru');

      // Get student stats via API
      const studentStatsResponse = await fetch(
        `/api/attendance?operation=summary&attendanceType=MURID&startDate=${encodeURIComponent(start.toISOString())}&endDate=${encodeURIComponent(end.toISOString())}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!studentStatsResponse.ok) {
        const studentStatsError = await studentStatsResponse.json();
        throw new Error(studentStatsError.error || 'Failed to fetch student stats');
      }

      const studentStatsData = await studentStatsResponse.json();
      if (!studentStatsData.success) {
        throw new Error(studentStatsData.error || 'Failed to fetch student stats');
      }
      const studentStats = studentStatsData.data;
      exportStatsToExcel(studentStats, `Statistik_Kehadiran_Siswa_${type}_${dateStr}`, 'Siswa');
      
      alert('Ekspor laporan berhasil!');
    } catch (error) {
      console.error('Error exporting reports:', error);
      alert('Terjadi kesalahan saat mengekspor laporan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userRole="SUPERADMIN">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Kehadiran</h1>
        <p className="text-gray-600">Ekspor laporan kehadiran guru dan siswa</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Ekspor Laporan</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleExport('daily')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Harian'}
          </button>
          
          <button
            onClick={() => handleExport('weekly')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Mingguan'}
          </button>
          
          <button
            onClick={() => handleExport('monthly')}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Bulanan'}
          </button>
          
          <button
            onClick={() => handleExport('custom')}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Rentang Tanggal'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Jenis Laporan Tersedia</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Laporan kehadiran guru dan siswa</li>
          <li>Statistik kehadiran harian, mingguan, dan bulanan</li>
          <li>Data dapat diekspor dalam format Excel (.xlsx)</li>
          <li>Filter berdasarkan rentang tanggal tertentu</li>
        </ul>
      </div>
    </Layout>
  );
};

export default SuperAdminReports;