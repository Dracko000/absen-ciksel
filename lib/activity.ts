import prisma from '@/lib/prisma';

// Log user activity
export const logActivity = async (
  userId: string, 
  action: string, 
  description: string, 
  ipAddress?: string, 
  userAgent?: string
) => {
  try {
    const activity = await prisma.activityLog.create({
      data: {
        userId,
        action,
        description,
        ipAddress: ipAddress || '',
        userAgent: userAgent || ''
      }
    });
    
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  }
};

// Get user activity logs
export const getUserActivityLogs = async (
  userId: string, 
  startDate?: Date, 
  endDate?: Date, 
  limit: number = 50,
  offset: number = 0
) => {
  const whereClause: any = { userId };
  
  if (startDate && endDate) {
    whereClause.timestamp = {
      gte: startDate,
      lte: endDate
    };
  }
  
  return await prisma.activityLog.findMany({
    where: whereClause,
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });
};

// Get all activity logs (for admin/superadmin)
export const getAllActivityLogs = async (
  startDate?: Date, 
  endDate?: Date, 
  limit: number = 50,
  offset: number = 0
) => {
  const whereClause: any = {};
  
  if (startDate && endDate) {
    whereClause.timestamp = {
      gte: startDate,
      lte: endDate
    };
  }
  
  return await prisma.activityLog.findMany({
    where: whereClause,
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true
        }
      }
    }
  });
};

// Get activity statistics
export const getActivityStats = async (userId?: string) => {
  const whereClause: any = {};
  
  if (userId) {
    whereClause.userId = userId;
  }
  
  const total = await prisma.activityLog.count({
    where: whereClause
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayCount = await prisma.activityLog.count({
    where: {
      ...whereClause,
      timestamp: {
        gte: today,
        lt: tomorrow
      }
    }
  });
  
  return {
    total,
    today: todayCount
  };
};