// pages/superadmin/reports.tsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/jwt';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const SuperAdminReportsPage: React.FC = () => {
  const { state } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

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

  const exportAllAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/attendance/export?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        }
      );
      
      if (response.ok) {
        // Create a blob from the response and download it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-kehadiran-semua-kelas-${dateRange.startDate}-to-${dateRange.endDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Gagal mengekspor data');
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Gagal mengekspor data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const exportAllUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      
      if (response.ok) {
        // Create a blob from the response and download it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daftar-pengguna-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Gagal mengekspor data pengguna');
      }
    } catch (error) {
      console.error('Error exporting users to Excel:', error);
      alert('Gagal mengekspor data pengguna. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Laporan Sistem">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Ekspor Data Sistem</h2>
        <p className="text-gray-600">Pilih jenis data yang ingin Anda ekspor ke format Excel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Laporan Kehadiran</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rentang Tanggal
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </div>
            </div>
            <Button 
              onClick={exportAllAttendance} 
              variant="success"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Mengekspor...' : 'Ekspor Laporan Kehadiran'}
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daftar Pengguna</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Ekspor daftar seluruh pengguna sistem (siswa, guru, admin, super admin)
              </p>
            </div>
            <Button 
              onClick={exportAllUsers} 
              variant="success"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Mengekspor...' : 'Ekspor Daftar Pengguna'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Catatan:</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
          <li>Laporan kehadiran mencakup semua data kehadiran dalam rentang tanggal yang dipilih</li>
          <li>Daftar pengguna mencakup semua akun dalam sistem dengan informasi peran dan kelas</li>
          <li>Fitur ekspor hanya tersedia untuk Super Admin</li>
          <li>File akan diunduh dalam format Excel (.xlsx)</li>
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminReportsPage;