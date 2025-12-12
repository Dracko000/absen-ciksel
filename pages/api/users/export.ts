// pages/api/users/export.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';
import { sql } from '@/lib/db';
import * as XLSX from 'xlsx';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify the token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;

    const user = await getUserFromToken(token);

    // Only SUPERADMIN can export all users
    if (user.role !== 'SUPERADMIN') {
      return res.status(403).json({
        message: 'Access denied. SUPERADMIN role required.'
      });
    }

    if (req.method === 'GET') {
      const db = sql();

      // Query to get all users
      const result = await db`
        SELECT id, userId, name, email, role, classId, subject, isActive, createdAt
        FROM users
        ORDER BY role, name
      `;

      // Format the data for Excel
      const formattedData = result.map(user => ({
        'ID Pengguna': user.userId,
        'Nama': user.name,
        'Email': user.email,
        'Peran': user.role,
        'Kelas': user.classId || '',
        'Mata Pelajaran': user.subject || '',
        'Status Aktif': user.isActive ? 'Aktif' : 'Tidak Aktif',
        'Tanggal Dibuat': new Date(user.createdAt).toLocaleDateString('id-ID')
      }));

      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Create a worksheet from the formatted data
      const ws = XLSX.utils.json_to_sheet(formattedData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Daftar Pengguna');

      // Generate the Excel file as a buffer
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

      // Set the appropriate headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=daftar-pengguna-${new Date().toISOString().split('T')[0]}.xlsx`);

      // Send the buffer as response
      res.send(buffer);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in users export API:', error);
    res.status(500).json({
      message: error.message || 'Internal server error'
    });
  }
}