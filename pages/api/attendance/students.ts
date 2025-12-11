// pages/api/attendance/students.ts
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

    // Only ADMIN or SUPERADMIN can get students
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ 
        message: 'Access denied. ADMIN or SUPERADMIN role required.' 
      });
    }

    if (req.method === 'GET') {
      const { classId } = req.query;

      if (!classId) {
        return res.status(400).json({ 
          message: 'classId parameter is required' 
        });
      }

      const client = await pool.connect();

      try {
        // Query to get students in the specified class
        const result = await client.query(
          `SELECT id, userId, name, email, classId, subject, isActive, createdAt
           FROM users
           WHERE role = 'USER' AND classId = $1
           ORDER BY name`,
          [classId]
        );

        res.status(200).json({ students: result.rows });
      } finally {
        client.release();
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in students API:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
}