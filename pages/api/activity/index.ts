import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';
import { getUserActivityLogs, getAllActivityLogs, getActivityStats } from '@/lib/activity';

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

    // Parse query parameters
    const { startDate, endDate, limit = 50, offset = 0, userId } = req.query;

    // If userId is specified, only superadmin can access other users' logs
    if (userId && user.role !== 'SUPERADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Convert date strings to Date objects if provided
    const start = startDate ? new Date(startDate as string) : undefined;
    const end = endDate ? new Date(endDate as string) : undefined;

    let activityLogs;
    let stats;

    if (user.role === 'SUPERADMIN' && userId) {
      // Superadmin viewing specific user's logs
      activityLogs = await getUserActivityLogs(
        userId as string,
        start,
        end,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      stats = await getActivityStats(userId as string);
    } else if (user.role === 'SUPERADMIN') {
      // Superadmin viewing all logs
      activityLogs = await getAllActivityLogs(
        start,
        end,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      stats = await getActivityStats();
    } else {
      // Regular user viewing their own logs
      activityLogs = await getUserActivityLogs(
        user.id,
        start,
        end,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      stats = await getActivityStats(user.id);
    }

    res.status(200).json({
      logs: activityLogs,
      stats,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error: any) {
    res.status(401).json({
      message: error.message || 'Token verification failed'
    });
  }
}