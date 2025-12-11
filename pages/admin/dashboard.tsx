// pages/admin/dashboard.tsx
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/jwt';

const AdminDashboard: React.FC = () => {
  const { state } = useAuth();

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

  return (
    <DashboardLayout title="Dasbor Admin">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Total Siswa</h3>
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ringkasan Kelas</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Statistik Hari Ini:</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Jumlah Siswa Hadir: 0</li>
              <li>Jumlah Siswa Tidak Hadir: 0</li>
              <li>Persentase Kehadiran: 0%</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Fitur-fitur:</h3>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Input Data Absensi</li>
              <li>Manajemen Siswa</li>
              <li>Laporan Absensi</li>
              <li>Ekspor ke Excel</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;