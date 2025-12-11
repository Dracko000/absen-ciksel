// pages/superadmin/users.tsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/jwt';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const UsersManagement: React.FC = () => {
  const { state } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  // Loading state for initial fetch or when adding/deleting (affects main user list display)
  const [loading, setLoading] = useState(true);
  // Specific loading state for fetching users via pagination
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(10); // Keep limit fixed for now
  const [paginationMeta, setPaginationMeta] = useState<{current: number, pages: number, total: number, limit: number} | null>(null);
  const [newUser, setNewUser] = useState({
    userId: '',
    name: '',
    email: '',
    password: '',
    role: 'USER',
    classId: '',
    subject: ''
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

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true); // Use specific loading state for fetching users
      try {
        const response = await fetch(`/api/users?page=${currentPage}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users || []);
          // Update pagination metadata
          setPaginationMeta(data.pagination);
        } else {
          console.error('Error fetching users:', data.message);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false); // Still set global loading false after initial load
        setLoadingUsers(false); // And reset specific loading state
      }
    };

    fetchUsers();
  }, [currentPage]); // Add currentPage to dependency array

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(newUser)
      });

      const result = await response.json();

      if (response.ok) {
        // Reset form and hide it
        setNewUser({
          userId: '',
          name: '',
          email: '',
          password: '',
          role: 'USER',
          classId: '',
          subject: ''
        });
        setShowAddForm(false);
        // Refetch users to include the new one, keeping the current page
        // This will reload the current page of users
        const response = await fetch(`/api/users?page=${currentPage}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users || []);
          // Update pagination metadata in case total count changed
          setPaginationMeta(data.pagination);
        } else {
          console.error('Error refetching users after add:', data.message);
        }
      } else {
        alert(result.message || 'Gagal menambahkan pengguna');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Gagal menambahkan pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (response.ok) {
        // Refetch users to reflect the deletion, keeping the current page
        // This handles cases like deleting the last user on the last page
        const response = await fetch(`/api/users?page=${currentPage}&limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users || []);
          // Update pagination metadata in case total count changed
          setPaginationMeta(data.pagination);
          // If the current page is now empty and it's not the first page,
          // consider navigating to the previous page
          if (data.users.length === 0 && currentPage > 1) {
            setCurrentPage(prev => prev - 1);
          }
        } else {
          console.error('Error refetching users after delete:', data.message);
        }
      } else {
        const result = await response.json();
        alert(result.message || 'Gagal menghapus pengguna');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus pengguna');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (paginationMeta?.pages || 1)) {
        setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manajemen Pengguna">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Memuat data pengguna...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manajemen Pengguna">
      <div className="mb-6">
        <Button 
          onClick={() => setShowAddForm(!showAddForm)} 
          variant="primary"
        >
          {showAddForm ? 'Batal' : 'Tambah Pengguna Baru'}
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tambah Pengguna Baru</h3>
          <form onSubmit={handleAddUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="ID Pengguna"
                type="text"
                required
                value={newUser.userId}
                onChange={(e) => setNewUser({...newUser, userId: e.target.value})}
              />
              <Input
                label="Nama Lengkap"
                type="text"
                required
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
              <Input
                label="Email"
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
              <Input
                label="Kata Sandi"
                type="password"
                required
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peran
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USER">Siswa</option>
                  <option value="ADMIN">Guru</option>
                  <option value="SUPERADMIN">Super Admin</option>
                </select>
              </div>
              <Input
                label="ID Kelas (jika siswa/guru)"
                type="text"
                value={newUser.classId}
                onChange={(e) => setNewUser({...newUser, classId: e.target.value})}
              />
              <Input
                label="Mata Pelajaran (jika guru)"
                type="text"
                value={newUser.subject}
                onChange={(e) => setNewUser({...newUser, subject: e.target.value})}
              />
            </div>
            <div className="mt-4">
              <Button type="submit" variant="success" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Pengguna'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peran</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.userId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' : 
                      user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.classId || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900 mr-4"
                  >
                    Hapus
                  </button>
                  <button className="text-blue-600 hover:text-blue-900">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loadingUsers && (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada data pengguna.</p>
          </div>
        )}
        {/* Pagination Controls */}
        {!loadingUsers && paginationMeta && paginationMeta.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="text-sm text-gray-700">
              Menampilkan {((paginationMeta.current - 1) * paginationMeta.limit) + 1} - {Math.min(paginationMeta.current * paginationMeta.limit, paginationMeta.total)} dari {paginationMeta.total} pengguna
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(paginationMeta.current - 1)}
                disabled={paginationMeta.current === 1}
                className={`px-3 py-1 rounded-md ${paginationMeta.current === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md">
                {paginationMeta.current} dari {paginationMeta.pages}
              </span>
              <button
                onClick={() => handlePageChange(paginationMeta.current + 1)}
                disabled={paginationMeta.current === paginationMeta.pages}
                className={`px-3 py-1 rounded-md ${paginationMeta.current === paginationMeta.pages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UsersManagement;