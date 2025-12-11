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
      // If not authenticated, redirect to login page immediately
      router.replace('/login');
    }
  }, [state.isAuthenticated, state.user, router]);

  // Don't render anything - just redirect immediately
  return null;
}