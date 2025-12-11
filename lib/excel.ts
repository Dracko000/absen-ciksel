import { utils, writeFile } from 'xlsx';

// Export attendance records to Excel file
export const exportAttendanceToExcel = (
  attendanceRecords: any[], 
  fileName: string, 
  attendanceType: 'GURU' | 'MURID' = 'MURID'
) => {
  // Prepare data for export
  const exportData = attendanceRecords.map(record => ({
    'ID Pengguna': record.user?.userId || record.userId,
    'Nama': record.user?.name || 'N/A',
    'Tanggal': new Date(record.date).toLocaleDateString('id-ID'),
    'Waktu': new Date(record.date).toLocaleTimeString('id-ID'),
    'Status': record.status,
    'Catatan': record.note || '',
    'Diacara oleh': record.recordedBy || 'N/A'
  }));

  // Create worksheet
  const worksheet = utils.json_to_sheet(exportData);
  
  // Create workbook
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, `Kehadiran ${attendanceType === 'GURU' ? 'Guru' : 'Siswa'}`);
  
  // Adjust column widths
  const range = utils.decode_range(worksheet['!ref'] || '');
  const cols = [];
  for (let C = 0; C <= range.e.c; ++C) {
    cols[C] = { wch: 15 }; // Set default width
  }
  worksheet['!cols'] = cols;
  
  // Export the file
  writeFile(workbook, `${fileName}.xlsx`);
};

// Export user data to Excel
export const exportUsersToExcel = (users: any[], fileName: string, role: 'SUPERADMIN' | 'ADMIN' | 'USER') => {
  const exportData = users.map(user => ({
    'ID Pengguna': user.userId,
    'Nama': user.name,
    'Email': user.email,
    'Peran': user.role,
    'Aktif': user.isActive ? 'Ya' : 'Tidak',
    'Tanggal Dibuat': new Date(user.createdAt).toLocaleDateString('id-ID'),
    'Kelas': user.classId || '-',
    'Mata Pelajaran': user.subject || '-'
  }));

  const worksheet = utils.json_to_sheet(exportData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, `Data ${role === 'SUPERADMIN' ? 'Kepala Sekolah' : role === 'ADMIN' ? 'Guru' : 'Siswa'}`);
  
  const range = utils.decode_range(worksheet['!ref'] || '');
  const cols = [];
  for (let C = 0; C <= range.e.c; ++C) {
    cols[C] = { wch: 15 };
  }
  worksheet['!cols'] = cols;
  
  writeFile(workbook, `${fileName}.xlsx`);
};

// Export statistics to Excel
export const exportStatsToExcel = (stats: any, fileName: string, period: string) => {
  const exportData = [
    { 'Statistik': 'Jumlah Total', 'Nilai': stats.total },
    { 'Statistik': 'Hadir', 'Nilai': stats.present },
    { 'Statistik': 'Tidak Hadir', 'Nilai': stats.absent },
    { 'Statistik': 'Terlambat', 'Nilai': stats.late },
    { 'Statistik': 'Tingkat Kehadiran', 'Nilai': `${stats.attendanceRate}%` }
  ];

  const worksheet = utils.json_to_sheet(exportData);
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, `Statistik ${period}`);
  
  // Set column widths
  worksheet['!cols'] = [{ wch: 20 }, { wch: 15 }];
  
  writeFile(workbook, `${fileName}.xlsx`);
};