// pages/superadmin/dashboard.tsx
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/jwt';

const SuperAdminDashboard: React.FC = () => {
  const { state } = useAuth();

  // Check if user has SUPERADMIN role
  if (state.user?.role !== UserRole.SUPERADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Akses Ditolak</h1>
          <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Dasbor Super Admin">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Total Pengguna</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Total Absensi</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Kehadiran Hari Ini</h3>
          <p className="mt-2 text-3xl font-semibold text-purple-600">0</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ringkasan Sistem</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Fitur-fitur Utama:</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Manajemen Pengguna (Tambah, Edit, Hapus)</li>
              <li>Manajemen Kelas dan Mata Pelajaran</li>
              <li>Manajemen Data Absensi</li>
              <li>Laporan dan Ekspor Data</li>
              <li>Penetapan Pengguna sebagai Admin</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Statistik Sistem:</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Jumlah Total Pengguna: 0</li>
              <li>Jumlah Admin: 0</li>
              <li>Jumlah Siswa: 0</li>
              <li>Terakhir Login: Tidak ada data</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;