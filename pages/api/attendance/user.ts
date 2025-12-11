import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/utils/withAuth';
import { getUserAttendance } from '@/lib/attendance';
import { cache } from '@/lib/cache';

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
  data?: AttendanceRecord[];
  error?: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Create cache key based on parameters
    const cacheKey = `attendance_user_${userId}_${startDate}_${endDate}`;

    // Try to get from cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.status(200).json({ success: true, data: cachedResult });
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
    const records = await getUserAttendance(userId as string, parsedStartDate, parsedEndDate);

    // Cache the result for 5 minutes (300,000 ms)
    cache.set(cacheKey, records, 300000);

    return res.status(200).json({ success: true, data: records });
  } catch (error: any) {
    console.error('Error fetching user attendance:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};

export default withAuth(handler);