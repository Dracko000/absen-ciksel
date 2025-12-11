import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/utils/withAuth';
import { 
  getAttendanceStats, 
  getAttendanceSummary,
  getTodaysAttendance
} from '@/lib/attendance';

// Define types
type AttendanceRecord = {
  id: string;
  userId: string;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  note?: string;
  recordedBy: string;
  attendanceType: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
};

type ApiResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { operation } = req.query;

    switch (operation) {
      case 'stats': {
        const { userId, attendanceType, date } = req.query;
        
        if (!userId) {
          return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        let parsedDate: Date | undefined;
        if (typeof date === 'string' && date) {
          parsedDate = new Date(date);
        }

        const stats = await getAttendanceStats(
          userId as string,
          typeof attendanceType === 'string' ? attendanceType : undefined,
          parsedDate
        );

        return res.status(200).json({ success: true, data: stats });
      }

      case 'summary': {
        const { attendanceType, startDate, endDate } = req.query;

        if (!attendanceType) {
          return res.status(400).json({ success: false, error: 'Attendance type is required' });
        }

        let parsedStartDate: Date | undefined;
        let parsedEndDate: Date | undefined;

        if (typeof startDate === 'string' && startDate) {
          parsedStartDate = new Date(startDate);
        }

        if (typeof endDate === 'string' && endDate) {
          parsedEndDate = new Date(endDate);
        }

        const summary = await getAttendanceSummary(
          attendanceType as string,
          parsedStartDate,
          parsedEndDate
        );

        return res.status(200).json({ success: true, data: summary });
      }

      case 'today': {
        const { userId, attendanceType } = req.query;

        if (!userId || !attendanceType) {
          return res.status(400).json({ success: false, error: 'User ID and attendance type are required' });
        }

        const records = await getTodaysAttendance(userId as string, attendanceType as string);

        return res.status(200).json({ success: true, data: records });
      }

      default:
        return res.status(400).json({ success: false, error: 'Invalid operation' });
    }
  } catch (error: any) {
    console.error('Error in attendance API:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};

export default withAuth(handler);