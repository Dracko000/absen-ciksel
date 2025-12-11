import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/utils/withAuth';
import { getAllActivityLogs, getActivityStats } from '@/lib/activity';
import { cache } from '@/lib/cache';

// Define types
type ActivityLog = {
  id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  name: string;
  email: string;
  role: string;
};

type ApiResponse = {
  success: boolean;
  logs?: ActivityLog[];
  stats?: {
    total: number;
    today: number;
  };
  error?: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { startDate, endDate, limit = '50', offset = '0' } = req.query;

    // Create cache key based on parameters
    const cacheKey = `activity_logs_${startDate}_${endDate}_${limit}_${offset}`;

    // Try to get from cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.status(200).json({ success: true, logs: cachedResult.logs, stats: cachedResult.stats });
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

    const logs = await getAllActivityLogs(
      parsedStartDate,
      parsedEndDate,
      parseInt(limit as string) || 50,
      parseInt(offset as string) || 0
    );

    const stats = await getActivityStats();

    const result = { logs, stats };

    // Cache the result for 2 minutes (120,000 ms) since activity logs change frequently
    cache.set(cacheKey, result, 120000);

    return res.status(200).json({ success: true, logs, stats });
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    return res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
};

export default withAuth(handler);