// pages/api/attendance/students.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';
import { sql } from '@/lib/db';

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
      const { classId, page = 1, limit = 10 } = req.query;

      if (!classId) {
        return res.status(400).json({
          message: 'classId parameter is required'
        });
      }

      const offset = (Number(page) - 1) * Number(limit);
      const db = sql();

      // Count total students for pagination metadata
      const countResult = await db`
        SELECT COUNT(*) FROM users WHERE role = ${'USER'} AND classId = ${classId}
      `;
      const total = parseInt(countResult[0].count, 10);

      // Query to get students in the specified class with pagination
      // Only select the fields required by the attendance page to reduce payload
      const result = await db`
        SELECT id, userId, name
        FROM users
        WHERE role = ${'USER'} AND classId = ${classId}
        ORDER BY name
        LIMIT ${Number(limit)} OFFSET ${offset}
      `;

      res.status(200).json({
        students: result,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
          limit: Number(limit)
        }
      });
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