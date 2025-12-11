// pages/api/attendance/data.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    // Get query parameters
    const { type, userId, startDate, endDate } = req.query;

    // Import the attendance functions dynamically 
    const { getUserAttendance, getAttendanceByType, getAttendanceSummary } = await import('@/lib/attendance');

    let result;

    if (type === 'user' && userId) {
      // Get user's own attendance records
      if (user.id !== userId && user.role !== 'SUPERADMIN') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      result = await getUserAttendance(userId as string, start, end);
    } 
    else if (type === 'byType' && req.query.attendanceType) {
      // Get attendance records by type (teacher or student)
      const recordedBy = req.query.recordedBy as string | undefined;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      result = await getAttendanceByType(req.query.attendanceType as string, recordedBy, start, end);
    } 
    else if (type === 'summary') {
      // Get attendance summary
      const attendanceType = req.query.attendanceType as string;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      result = await getAttendanceSummary(attendanceType, start, end);
    } 
    else {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }

    res.status(200).json({
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || 'Attendance data retrieval failed'
    });
  }
}