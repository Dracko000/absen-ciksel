import prisma from '@/lib/server/prisma';

// Get attendance records for a specific user
export const getUserAttendance = async (userId: string, startDate?: Date, endDate?: Date) => {
  const whereClause: any = { userId };
  
  if (startDate && endDate) {
    whereClause.date = {
      gte: startDate,
      lte: endDate
    };
  }
  
  return await prisma.attendance.findMany({
    where: whereClause,
    orderBy: { date: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          userId: true
        }
      }
    }
  });
};

// Get attendance records by type (teacher or student) for admin/superadmin
export const getAttendanceByType = async (attendanceType: string, recordedBy?: string, startDate?: Date, endDate?: Date) => {
  const whereClause: any = { attendanceType };
  
  if (recordedBy) {
    whereClause.recordedBy = recordedBy;
  }
  
  if (startDate && endDate) {
    whereClause.date = {
      gte: startDate,
      lte: endDate
    };
  }
  
  return await prisma.attendance.findMany({
    where: whereClause,
    orderBy: { date: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          userId: true,
          email: true
        }
      }
    }
  });
};

// Get attendance statistics
export const getAttendanceStats = async (userId: string, attendanceType?: string, date?: Date) => {
  const today = date || new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const whereClause: any = {
    userId,
    date: {
      gte: today,
      lt: tomorrow
    }
  };
  
  if (attendanceType) {
    whereClause.attendanceType = attendanceType;
  }
  
  return await prisma.attendance.findMany({
    where: whereClause,
    select: {
      status: true,
      date: true
    }
  });
};

// Get attendance summary for dashboard
export const getAttendanceSummary = async (attendanceType: string, startDate?: Date, endDate?: Date) => {
  const whereClause: any = { attendanceType };
  
  if (startDate && endDate) {
    whereClause.date = {
      gte: startDate,
      lte: endDate
    };
  }
  
  const total = await prisma.attendance.count({
    where: whereClause
  });
  
  const presentCount = await prisma.attendance.count({
    where: {
      ...whereClause,
      status: 'PRESENT'
    }
  });
  
  const absentCount = await prisma.attendance.count({
    where: {
      ...whereClause,
      status: 'ABSENT'
    }
  });
  
  const lateCount = await prisma.attendance.count({
    where: {
      ...whereClause,
      status: 'LATE'
    }
  });
  
  return {
    total,
    present: presentCount,
    absent: absentCount,
    late: lateCount,
    attendanceRate: total > 0 ? Math.round((presentCount / total) * 100) : 0
  };
};

// Get today's attendance for a user
export const getTodaysAttendance = async (userId: string, attendanceType: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return await prisma.attendance.findMany({
    where: {
      userId,
      attendanceType,
      date: {
        gte: today,
        lt: tomorrow
      }
    }
  });
};