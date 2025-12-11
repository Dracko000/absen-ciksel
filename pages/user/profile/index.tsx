import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import UserBarcode from '@/components/barcode/UserBarcode';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/auth';

const UserProfile = () => {
  const { state } = useAuth();

  // Check authentication and role on the client-side
  useEffect(() => {
    if (state.user && state.user.role !== UserRole.USER) {
      // Redirect unauthorized users
      window.location.href = '/unauthorized';
    }
  }, [state.user]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (state.user) {
      setUserData(state.user);
    }
  }, [state]);

  if (!userData) {
    return (
      <Layout userRole="USER">
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userRole="USER">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Profil Saya</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Profil</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <p className="mt-1 text-gray-900">{userData.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{userData.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Pengguna</label>
              <p className="mt-1 text-gray-900 font-mono">{userData.userId}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Peran</label>
              <p className="mt-1 text-gray-900 capitalize">{userData.role}</p>
            </div>
            
            {userData.classId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Kelas</label>
                <p className="mt-1 text-gray-900">{userData.classId}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Barcode Saya</h2>
          
          <div className="flex flex-col items-center">
            {userData.barcodeData ? (
              <UserBarcode 
                userId={userData.userId} 
                name={userData.name} 
                role={userData.role} 
              />
            ) : (
              <p className="text-gray-500">Barcode belum tersedia</p>
            )}
            
            <p className="mt-4 text-sm text-gray-600 text-center">
              Tunjukkan barcode ini saat proses absensi
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;