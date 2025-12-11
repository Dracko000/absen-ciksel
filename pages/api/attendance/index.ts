// pages/api/attendance/index.ts
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

    if (req.method === 'GET') {
      // Get attendance records for a specific date
      const { date, page = 1, limit = 10 } = req.query;

      if (!date) {
        return res.status(400).json({
          message: 'Date parameter is required'
        });
      }

      const offset = (Number(page) - 1) * Number(limit);

      const client = await pool.connect();

      try {
        // Count total attendance records for the specified date for pagination metadata
        const countResult = await client.query(
          `SELECT COUNT(*)
           FROM attendance a
           JOIN users u ON a.userId = u.id
           WHERE DATE(a.date) = $1`,
          [date]
        );
        const total = parseInt(countResult.rows[0].count, 10);

        // Query to get attendance records for the specified date with pagination
        // Select only required fields to reduce payload
        const result = await client.query(
          `SELECT a.userId, a.status, a.date, u.name as student_name
           FROM attendance a
           JOIN users u ON a.userId = u.id
           WHERE DATE(a.date) = $1
           ORDER BY u.name
           LIMIT $2 OFFSET $3`,
          [date, Number(limit), offset]
        );

        res.status(200).json({
          attendance: result.rows,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total,
            limit: Number(limit)
          }
        });
      } finally {
        client.release();
      }
    } else if (req.method === 'POST') {
      // Record attendance (only ADMIN or SUPERADMIN can do this)
      if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
        return res.status(403).json({ 
          message: 'Access denied. ADMIN or SUPERADMIN role required.' 
        });
      }

      const { attendanceData, recordedBy } = req.body;

      if (!Array.isArray(attendanceData) || !recordedBy) {
        return res.status(400).json({ 
          message: 'attendanceData array and recordedBy are required' 
        });
      }

      const client = await pool.connect();

      try {
        // Use a transaction to ensure all attendance records are saved together
        await client.query('BEGIN');

        for (const record of attendanceData) {
          const { userId, date, status, attendanceType, note } = record;

          // Validate required fields
          if (!userId || !date || !status) {
            throw new Error(`Missing required fields for user ${userId}`);
          }

          // Validate status
          if (!['PRESENT', 'ABSENT', 'LATE'].includes(status)) {
            throw new Error(`Invalid status for user ${userId}: ${status}`);
          }

          // Check if attendance already exists for this user and date
          const existingRecord = await client.query(
            'SELECT id FROM attendance WHERE userId = $1 AND DATE(date) = $2',
            [userId, date]
          );

          if (existingRecord.rows.length > 0) {
            // Update existing record
            await client.query(
              `UPDATE attendance 
               SET status = $1, note = $2, recordedBy = $3, attendanceType = $4, updatedAt = CURRENT_TIMESTAMP
               WHERE userId = $5 AND DATE(date) = $6`,
              [status, note || null, recordedBy, attendanceType || 'DAILY', userId, date]
            );
          } else {
            // Insert new record
            await client.query(
              `INSERT INTO attendance (userId, date, status, note, recordedBy, attendanceType)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [userId, date, status, note || null, recordedBy, attendanceType || 'DAILY']
            );
          }
        }

        await client.query('COMMIT');

        res.status(200).json({ message: 'Attendance records saved successfully' });
      } catch (error: any) {
        await client.query('ROLLBACK');
        console.error('Error saving attendance:', error);
        res.status(500).json({ 
          message: error.message || 'Internal server error' 
        });
      } finally {
        client.release();
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in attendance API:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
}