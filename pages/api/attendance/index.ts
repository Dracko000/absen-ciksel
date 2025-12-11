import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify the user's token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    const user = await getUserFromToken(token);

    const { userId, attendanceType, status, recordedBy, note } = req.body;

    if (!userId || !attendanceType || !status || !recordedBy) {
      return res.status(400).json({ 
        message: 'userId, attendanceType, status, and recordedBy are required' 
      });
    }

    const { Pool } = await import('pg');
    const { DATABASE_URL } = await import('process');
    
    const pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // For NeonDB compatibility
      }
    });

    const client = await pool.connect();
    
    try {
      // Insert attendance record
      const result = await client.query(
        `INSERT INTO attendance (id, userId, attendanceType, status, recordedBy, note, date) 
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
         RETURNING *`,
        [uuidv4(), userId, attendanceType, status, recordedBy, note || null]
      );

      res.status(200).json({
        message: 'Attendance recorded successfully',
        attendance: result.rows[0]
      });
    } finally {
      client.release();
      await pool.end(); // Close the pool connection
    }
  } catch (error: any) {
    res.status(500).json({ 
      message: error.message || 'Attendance recording failed' 
    });
  }
}