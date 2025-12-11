import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { state } = useAuth();
  const router = useRouter();

  // If authenticated, redirect to the appropriate dashboard
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      if (state.user.role === 'SUPERADMIN') {
        router.push('/superadmin/dashboard');
      } else if (state.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    } else {
      // If not authenticated, redirect to login page
      router.push('/login');
    }
  }, [state.isAuthenticated, state.user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-gray-600">Mengarahkan ke halaman login...</p>
      </div>
    </div>
  );
}