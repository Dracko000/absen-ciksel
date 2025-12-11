import { useState, useEffect } from 'react';
import { withAuth } from '@/utils/withAuth';
import Layout from '@/components/layout/Layout';
import { UserRole } from '@/lib/auth';
import { getAttendanceSummary } from '@/lib/attendance';
import { useAuth } from '@/context/AuthContext';

const SuperAdminDashboard = () => {
  const { state } = useAuth();
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [studentStats, setStudentStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Get teacher attendance stats for today
        const teacherStatsData = await getAttendanceSummary('GURU', startOfDay, endOfDay);
        setTeacherStats(teacherStatsData);

        // Get student attendance stats for today
        const studentStatsData = await getAttendanceSummary('MURID', startOfDay, endOfDay);
        setStudentStats(studentStatsData);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout userRole="SUPERADMIN">
        <div className="flex items-center justify-center h-64">
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="SUPERADMIN">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Superadmin</h1>
        <p className="text-gray-600">Selamat datang, Kepala Sekolah</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Guru</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">42</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Kehadiran Guru Hari Ini</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {teacherStats ? teacherStats.present : '...'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Siswa</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">1205</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Kehadiran Siswa Hari Ini</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {studentStats ? studentStats.present : '...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistik Kehadiran Guru</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Hadir</span>
                <span className="text-sm font-medium text-gray-700">{teacherStats?.present || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${teacherStats ? (teacherStats.present / (teacherStats.total || 1)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Tidak Hadir</span>
                <span className="text-sm font-medium text-gray-700">{teacherStats?.absent || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-600 h-2.5 rounded-full"
                  style={{ width: `${teacherStats ? (teacherStats.absent / (teacherStats.total || 1)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Terlambat</span>
                <span className="text-sm font-medium text-gray-700">{teacherStats?.late || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-yellow-500 h-2.5 rounded-full"
                  style={{ width: `${teacherStats ? (teacherStats.late / (teacherStats.total || 1)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistik Kehadiran Siswa</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Hadir</span>
                <span className="text-sm font-medium text-gray-700">{studentStats?.present || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${studentStats ? (studentStats.present / (studentStats.total || 1)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Tidak Hadir</span>
                <span className="text-sm font-medium text-gray-700">{studentStats?.absent || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-600 h-2.5 rounded-full"
                  style={{ width: `${studentStats ? (studentStats.absent / (studentStats.total || 1)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Terlambat</span>
                <span className="text-sm font-medium text-gray-700">{studentStats?.late || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-yellow-500 h-2.5 rounded-full"
                  style={{ width: `${studentStats ? (studentStats.late / (studentStats.total || 1)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(SuperAdminDashboard, { requiredRoles: [UserRole.SUPERADMIN] });