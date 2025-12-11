// pages/user/dashboard.tsx
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/jwt';

const UserDashboard: React.FC = () => {
  const { state } = useAuth();

  // Check if user has USER role
  if (state.user?.role !== UserRole.USER) {
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
    <DashboardLayout title="Dasbor Siswa">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Status Kehadiran</h3>
          <p className="mt-2 text-2xl font-semibold text-blue-600">Belum Hadir</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900">Kelas</h3>
          <p className="mt-2 text-2xl font-semibold text-green-600">{state.user?.classId || 'Tidak Ada Data'}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Pribadi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p><span className="font-medium">Nama:</span> {state.user?.name}</p>
            <p><span className="font-medium">ID Pengguna:</span> {state.user?.userId}</p>
            <p><span className="font-medium">Email:</span> {state.user?.email}</p>
          </div>
          <div>
            <p><span className="font-medium">Kelas:</span> {state.user?.classId || 'Tidak Ditentukan'}</p>
            <p><span className="font-medium">Mata Pelajaran:</span> {state.user?.subject || 'Tidak Ditentukan'}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium text-gray-700">Panduan Penggunaan:</h3>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Scan barcode Anda untuk mencatat kehadiran</li>
            <li>Periksa jadwal kelas Anda secara berkala</li>
            <li>Laporan kehadiran dapat dilihat dalam fitur laporan</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;