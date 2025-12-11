// pages/api/attendance/report.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';
import { pool } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify the token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : undefined;

    const user = await getUserFromToken(token);

    // Only ADMIN or SUPERADMIN can get reports
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        message: 'Access denied. ADMIN or SUPERADMIN role required.' 
      });
    }

    if (req.method === 'GET') {
      const { startDate, endDate, classId } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          message: 'startDate and endDate parameters are required' 
        });
      }

      const client = await pool.connect();

      try {
        // Build the query based on user role and optional classId
        let query = `
          SELECT a.*, u.name as student_name, u.userId as student_id 
          FROM attendance a
          JOIN users u ON a.userId = u.id
          WHERE a.date >= $1 AND a.date <= $2
        `;
        
        const queryParams: any[] = [startDate, endDate];
        let paramIndex = 3;

        // If it's an ADMIN, only get attendance for their class
        if (user.role === 'ADMIN') {
          query += ` AND u.classId = $${paramIndex}`;
          queryParams.push(user.classId);
          paramIndex++;
        } else if (classId) {
          // If SUPERADMIN wants to filter by a specific class
          query += ` AND u.classId = $${paramIndex}`;
          queryParams.push(classId);
          paramIndex++;
        }

        query += ` ORDER BY a.date DESC, u.name`;

        const result = await client.query(query, queryParams);

        res.status(200).json({ attendance: result.rows });
      } finally {
        client.release();
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in attendance report API:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
}