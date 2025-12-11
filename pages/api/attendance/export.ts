// pages/api/attendance/export.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';
import { pool } from '@/lib/db';
import * as XLSX from 'xlsx';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify the token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : undefined;

    const user = await getUserFromToken(token);

    // Only ADMIN or SUPERADMIN can export data
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        message: 'Access denied. ADMIN or SUPERADMIN role required.' 
      });
    }

    if (req.method === 'GET') {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          message: 'startDate and endDate parameters are required' 
        });
      }

      const client = await pool.connect();

      try {
        // Query to get attendance records for the specified date range
        const result = await client.query(
          `SELECT a.*, u.name as student_name, u.userId as student_id 
           FROM attendance a
           JOIN users u ON a.userId = u.id
           WHERE a.date >= $1 AND a.date <= $2
           ORDER BY a.date DESC, u.name`,
          [startDate, endDate]
        );

        // Format the data for Excel
        const formattedData = result.rows.map(record => ({
          'Nama Siswa': record.student_name,
          'ID Siswa': record.student_id,
          'Tanggal': new Date(record.date).toLocaleDateString('id-ID'),
          'Status': record.status,
          'Catatan': record.note || '',
          'Metode': record.attendanceType
        }));

        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Create a worksheet from the formatted data
        const ws = XLSX.utils.json_to_sheet(formattedData);
        
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Laporan Kehadiran');
        
        // Generate the Excel file as a buffer
        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
        
        // Set the appropriate headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=laporan-kehadiran-${startDate}-to-${endDate}.xlsx`);
        
        // Send the buffer as response
        res.send(buffer);
      } finally {
        client.release();
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in attendance export API:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
}