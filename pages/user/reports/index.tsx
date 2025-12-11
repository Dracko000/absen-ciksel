import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { exportAttendanceToExcel } from '@/lib/excel';
import { UserRole } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

const UserReports = () => {
  const { state } = useAuth();

  // Check authentication and role on the client-side
  useEffect(() => {
    if (state.user && state.user.role !== UserRole.USER) {
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
    if (!state.user?.id) {
      alert('User information not available');
      return;
    }
    
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

      // Fetch attendance records for this user via API
      const response = await fetch(
        `/api/attendance/user?userId=${state.user.id}&startDate=${encodeURIComponent(start.toISOString())}&endDate=${encodeURIComponent(end.toISOString())}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch attendance records');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch attendance records');
      }
      const attendanceRecords = data.data || [];

      // Create date string for filename
      const dateStr = `${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}`;

      // Export attendance records
      exportAttendanceToExcel(attendanceRecords, `Laporan_Kehadiran_Saya_${type}_${dateStr}`, 'MURID');
      
      alert('Ekspor laporan berhasil!');
    } catch (error) {
      console.error('Error exporting reports:', error);
      alert('Terjadi kesalahan saat mengekspor laporan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout userRole="USER">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Kehadiran Saya</h1>
        <p className="text-gray-600">Ekspor laporan kehadiran pribadi</p>
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
          <li>Laporan kehadiran pribadi</li>
          <li>Data dapat diekspor dalam format Excel (.xlsx)</li>
          <li>Filter berdasarkan rentang tanggal tertentu</li>
        </ul>
      </div>
    </Layout>
  );
};

export default UserReports;