import { useState, useEffect } from 'react';
import { withAuth } from '@/utils/withAuth';
import Layout from '@/components/layout/Layout';
import { UserRole } from '@/lib/auth';
import { getUserAttendance } from '@/lib/attendance';
import { useAuth } from '@/context/AuthContext';

const UserDashboard = () => {
  const { state } = useAuth();
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get user's attendance for the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get user's attendance records for this month
        const userAttendance = await getUserAttendance(state.user?.id, startOfMonth, endOfMonth);

        // Calculate stats
        const total = userAttendance.length;
        const present = userAttendance.filter((att: any) => att.status === 'PRESENT').length;
        const absent = userAttendance.filter((att: any) => att.status === 'ABSENT').length;
        const late = userAttendance.filter((att: any) => att.status === 'LATE').length;

        setAttendanceStats({
          total,
          present,
          absent,
          late,
          attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0
        });

        // Set recent attendance (last 5 records)
        setRecentAttendance(userAttendance.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (state.user?.id) {
      fetchStats();
    }
  }, [state]);

  if (loading) {
    return (
      <Layout userRole="USER">
        <div className="flex items-center justify-center h-64">
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="USER">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Siswa</h1>
        <p className="text-gray-600">Selamat datang, Murid</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Kehadiran</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {attendanceStats?.total || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Kehadiran Bulan Ini</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {attendanceStats?.present || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Tingkat Kehadiran</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {attendanceStats ? `${attendanceStats.attendanceRate}%` : '0%'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Terlambat</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {attendanceStats?.late || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Statistik Kehadiran</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Hadir</span>
                <span className="text-sm font-medium text-gray-700">{attendanceStats?.present || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full"
                  style={{ width: `${attendanceStats ? (attendanceStats.present / (attendanceStats.total || 1)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Tidak Hadir</span>
                <span className="text-sm font-medium text-gray-700">{attendanceStats?.absent || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-600 h-2.5 rounded-full"
                  style={{ width: `${attendanceStats ? (attendanceStats.absent / (attendanceStats.total || 1)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Terlambat</span>
                <span className="text-sm font-medium text-gray-700">{attendanceStats?.late || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-yellow-500 h-2.5 rounded-full"
                  style={{ width: `${attendanceStats ? (attendanceStats.late / (attendanceStats.total || 1)) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Riwayat Kehadiran Terbaru</h2>
          {recentAttendance.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentAttendance.map((record: any, index: number) => (
                <li key={index} className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.status}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                          record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Tidak ada riwayat kehadiran</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(UserDashboard, { requiredRoles: [UserRole.USER] });