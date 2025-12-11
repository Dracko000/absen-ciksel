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
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
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
      try {
        const response = await fetch('/api/users', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setUsers(data.users || []);
        } else {
          console.error('Error fetching users:', data.message);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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
        // Add the new user to the list
        setUsers([...users, result.user]);
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
        setUsers(users.filter(user => user.id !== userId));
      } else {
        const result = await response.json();
        alert(result.message || 'Gagal menghapus pengguna');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Gagal menghapus pengguna');
    }
  };

  if (loading && users.length === 0) {
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
        {users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada data pengguna.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UsersManagement;