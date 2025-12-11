// components/DashboardLayout.tsx
import React from 'react';
import Navbar from './ui/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { state } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  if (!state.isAuthenticated || !state.user) {
    return null; // Let the router handle redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {title}
              </h1>
            </div>
          </div>
          <div className="mt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;