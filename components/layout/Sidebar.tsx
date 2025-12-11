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

  // Determine icon based on role
  const getRoleIcon = () => {
    switch(userRole) {
      case 'SUPERADMIN': return '👑';
      case 'ADMIN': return '👤';
      case 'USER': return '👤';
      default: return '👤';
    }
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
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white transition duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0 shadow-2xl`}
      >
        <div className="flex items-center justify-center h-16 bg-blue-900 border-b border-blue-700">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🏫</span>
            <span className="text-lg font-bold">Absensi Sekolah</span>
          </div>
        </div>

        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center">
            <span className="text-xl mr-2">{getRoleIcon()}</span>
            <div>
              <div className="text-sm font-medium capitalize">{userRole.toLowerCase()}</div>
              <div className="text-xs opacity-80">Akses terbatas</div>
            </div>
          </div>
        </div>

        <nav className="mt-4 px-2">
          <ul>
            {routes.map((route, index) => (
              <li key={index} className="mb-1">
                <Link
                  href={route.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    router.pathname === route.path
                      ? 'bg-white bg-opacity-10 text-white shadow-inner'
                      : 'text-blue-100 hover:bg-white hover:bg-opacity-10 hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <span className="font-medium">{route.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-blue-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-red-200 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;