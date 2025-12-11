import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { UserRole } from '@/lib/auth';
import { useAuth } from '@/context/AuthContext';

const SuperAdminDashboard = () => {
  const { state } = useAuth();

  // Check authentication and role on the client-side
  useEffect(() => {
    if (state.user && state.user.role !== UserRole.SUPERADMIN) {
      // Redirect unauthorized users
      window.location.href = '/unauthorized';
    }
  }, [state.user]);
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

        const token = localStorage.getItem('token'); // Get token from local storage
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Get teacher attendance stats for today via API
        const teacherResponse = await fetch(
          `/api/attendance?operation=summary&attendanceType=GURU&startDate=${encodeURIComponent(startOfDay.toISOString())}&endDate=${encodeURIComponent(endOfDay.toISOString())}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!teacherResponse.ok) {
          const teacherError = await teacherResponse.json();
          throw new Error(teacherError.error || 'Failed to fetch teacher attendance stats');
        }

        const teacherData = await teacherResponse.json();
        if (teacherData.success) {
          setTeacherStats(teacherData.data);
        }

        // Get student attendance stats for today via API
        const studentResponse = await fetch(
          `/api/attendance?operation=summary&attendanceType=MURID&startDate=${encodeURIComponent(startOfDay.toISOString())}&endDate=${encodeURIComponent(endOfDay.toISOString())}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!studentResponse.ok) {
          const studentError = await studentResponse.json();
          throw new Error(studentError.error || 'Failed to fetch student attendance stats');
        }

        const studentData = await studentResponse.json();
        if (studentData.success) {
          setStudentStats(studentData.data);
        }
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

export default SuperAdminDashboard;