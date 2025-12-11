import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  userRole: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const roleRoutes: { [key: string]: { name: string; path: string }[] } = {
  SUPERADMIN: [
    { name: 'Dashboard', path: '/superadmin/dashboard' },
    { name: 'Manage Teachers', path: '/superadmin/teachers' },
    { name: 'View Teacher Attendance', path: '/superadmin/attendance/teachers' },
    { name: 'Reports', path: '/superadmin/reports' },
  ],
  ADMIN: [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Manage Students', path: '/admin/students' },
    { name: 'Take Student Attendance', path: '/admin/attendance' },
    { name: 'View Attendance', path: '/admin/attendance/view' },
    { name: 'Reports', path: '/admin/reports' },
  ],
  USER: [
    { name: 'My Attendance', path: '/user/attendance' },
    { name: 'Profile', path: '/user/profile' },
  ],
};

const Sidebar: React.FC<SidebarProps> = ({ userRole, isOpen, setIsOpen }) => {
  const router = useRouter();
  const { logout } = useAuth();
  
  const routes = roleRoutes[userRole] || [];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white transition duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-xl font-bold">Absensi Sekolah</span>
        </div>

        <nav className="mt-5 px-4">
          <ul>
            {routes.map((route, index) => (
              <li key={index} className="mb-2">
                <Link 
                  href={route.path}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    router.pathname === route.path 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span>{route.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-8 pt-8 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;