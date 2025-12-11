import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { state } = useAuth();
  
  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            type="button"
            className="mr-4 text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            {state.user?.role === 'SUPERADMIN' ? 'Superadmin Dashboard' : 
             state.user?.role === 'ADMIN' ? 'Admin Dashboard' : 
             'User Dashboard'}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-1 text-gray-500 hover:text-gray-700">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div className="flex items-center">
                <div className="text-sm text-gray-700">
                  <div>{state.user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{state.user?.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;