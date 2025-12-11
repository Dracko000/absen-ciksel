import { useState } from 'react';
import { withAuth } from '@/utils/withAuth';
import Layout from '@/components/layout/Layout';
import { getAttendanceSummary, getAttendanceByType } from '@/lib/attendance';
import { exportAttendanceToExcel, exportStatsToExcel } from '@/lib/excel';
import { UserRole } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

const AdminReports = () => {
  const { state } = useAuth();
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
      
      // Fetch attendance records for students under this teacher
      const studentRecords = await getAttendanceByType('MURID', state.user.id, start, end);
      
      // Create date string for filename
      const dateStr = `${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}`;
      
      // Export student attendance
      exportAttendanceToExcel(studentRecords, `Laporan_Kehadiran_Siswa_${type}_${dateStr}`, 'MURID');
      
      // Get and export student stats
      const studentStats = await getAttendanceSummary('MURID', start, end);
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
    <Layout userRole="ADMIN">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Kehadiran</h1>
        <p className="text-gray-600">Ekspor laporan kehadiran siswa</p>
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
          <li>Laporan kehadiran siswa</li>
          <li>Statistik kehadiran harian, mingguan, dan bulanan</li>
          <li>Data dapat diekspor dalam format Excel (.xlsx)</li>
          <li>Filter berdasarkan rentang tanggal tertentu</li>
        </ul>
      </div>
    </Layout>
  );
};

export default withAuth(AdminReports, { requiredRoles: [UserRole.ADMIN] });