import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/utils/withAuth';
import { getAttendanceByType } from '@/lib/attendance';

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
  email: string;
};

type ApiResponse = {
  success: boolean;
  data?: AttendanceRecord[];
  error?: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { attendanceType, recordedBy, startDate, endDate } = req.query;

    if (!attendanceType) {
      return res.status(400).json({ success: false, error: 'Attendance type is required' });
    }

    // Parse date range if provided
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (typeof startDate === 'string' && startDate) {
      parsedStartDate = new Date(startDate);
    }

    if (typeof endDate === 'string' && endDate) {
      parsedEndDate = new Date(endDate);
    }

    // Fetch attendance records
    const records = await getAttendanceByType(
      attendanceType as string,
      typeof recordedBy === 'string' ? recordedBy : undefined,
      parsedStartDate,
      parsedEndDate
    );

    return res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    console.error('Error fetching attendance by type:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};

export default withAuth(handler);