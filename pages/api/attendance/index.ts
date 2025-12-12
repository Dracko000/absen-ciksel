// pages/api/attendance/index.ts
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

    if (req.method === 'GET') {
      // Get attendance records for a specific date
      const { date, page = 1, limit = 10 } = req.query;

      if (!date) {
        return res.status(400).json({
          message: 'Date parameter is required'
        });
      }

      const offset = (Number(page) - 1) * Number(limit);
      const db = sql();

      // Count total attendance records for the specified date for pagination metadata
      const countResult = await db`
        SELECT COUNT(*)
        FROM attendance a
        JOIN users u ON a.userId = u.id
        WHERE DATE(a.date) = ${date}
      `;
      const total = parseInt(countResult[0].count, 10);

      // Query to get attendance records for the specified date with pagination
      // Select only required fields to reduce payload
      const result = await db`
        SELECT a.userId, a.status, a.date, u.name as student_name
        FROM attendance a
        JOIN users u ON a.userId = u.id
        WHERE DATE(a.date) = ${date}
        ORDER BY u.name
        LIMIT ${Number(limit)} OFFSET ${offset}
      `;

      res.status(200).json({
        attendance: result,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
          limit: Number(limit)
        }
      });
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

      const db = sql();

      // Process attendance records individually since Neon serverless doesn't support transactions in the same way
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
        const existingRecord = await db`
          SELECT id FROM attendance WHERE userId = ${userId} AND DATE(date) = ${date}
        `;

        if (existingRecord.length > 0) {
          // Update existing record
          await db`
            UPDATE attendance
            SET status = ${status}, note = ${note || null}, recordedBy = ${recordedBy}, attendanceType = ${attendanceType || 'DAILY'}, updatedAt = CURRENT_TIMESTAMP
            WHERE userId = ${userId} AND DATE(date) = ${date}
          `;
        } else {
          // Insert new record
          await db`
            INSERT INTO attendance (userId, date, status, note, recordedBy, attendanceType)
            VALUES (${userId}, ${date}, ${status}, ${note || null}, ${recordedBy}, ${attendanceType || 'DAILY'})
          `;
        }
      }

      res.status(200).json({ message: 'Attendance records saved successfully' });
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