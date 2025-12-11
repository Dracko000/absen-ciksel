// components/ui/Navbar.tsx
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const { state, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href={state.isAuthenticated ? '/' : '/'} className="text-xl font-bold text-blue-600">
                Absensi Sekolah
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {state.isAuthenticated && state.user && (
                <>
                  <Link
                    href={`/${state.user.role.toLowerCase()}/dashboard`}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={`/${state.user.role.toLowerCase()}/attendance`}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Absensi
                  </Link>
                  {state.user.role === 'SUPERADMIN' && (
                    <Link
                      href="/superadmin/users"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      Pengguna
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {state.isAuthenticated && state.user ? (
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  Halo, {state.user.name}
                </span>
                <button
                  onClick={logout}
                  className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;