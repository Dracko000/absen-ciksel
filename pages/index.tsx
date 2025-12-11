import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

export default function Home() {
  const { state } = useAuth();
  const router = useRouter();

  // If authenticated, redirect to the appropriate dashboard
  if (state.isAuthenticated) {
    if (state.user?.role === 'SUPERADMIN') {
      router.push('/superadmin/dashboard');
    } else if (state.user?.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/user/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Absensi Sekolah</title>
        <meta name="description" content="Sistem Absensi Sekolah Berbasis Barcode" />
      </Head>
      
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Absensi Sekolah
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Sistem absensi berbasis barcode untuk sekolah
          </p>
        </div>
        
        <div className="mt-8">
          <button
            onClick={() => router.push('/login')}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Masuk ke Akun
          </button>
        </div>
      </div>
    </div>
  );
}