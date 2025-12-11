import { v4 as uuidv4 } from 'uuid';
// Note: PostgreSQL client is imported dynamically in functions that run server-side only

// Get attendance records for a specific user
export const getUserAttendance = async (userId: string, startDate?: Date, endDate?: Date) => {
  const { Pool } = await import('pg');

  const DATABASE_URL = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // For NeonDB compatibility
    }
  });

  const client = await pool.connect();

  try {
    let query = `
      SELECT a.id, a.userId, a.date, a.status, a.note, a.recordedBy, a.attendanceType,
             u.name, u.userId as userUserId
      FROM attendance a
      JOIN users u ON a.userId = u.id
      WHERE a.userId = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (startDate && endDate) {
      query += ` AND a.date >= $${paramIndex} AND a.date <= $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    query += ` ORDER BY a.date DESC LIMIT 100`; // Add limit to prevent large result sets

    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
    await pool.end(); // Close the pool connection
  }
};

// Get attendance records by type (teacher or student) for admin/superadmin
export const getAttendanceByType = async (attendanceType: string, recordedBy?: string, startDate?: Date, endDate?: Date) => {
  const { Pool } = await import('pg');

  const DATABASE_URL = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // For NeonDB compatibility
    }
  });

  const client = await pool.connect();

  try {
    let query = `
      SELECT a.id, a.userId, a.date, a.status, a.note, a.recordedBy, a.attendanceType,
             u.name, u.userId as userUserId, u.email
      FROM attendance a
      JOIN users u ON a.userId = u.id
      WHERE a.attendanceType = $1
    `;
    const params: any[] = [attendanceType];
    let paramIndex = 2;

    if (recordedBy) {
      query += ` AND a.recordedBy = $${paramIndex}`;
      params.push(recordedBy);
      paramIndex++;
    }

    if (startDate && endDate) {
      query += ` AND a.date >= $${paramIndex} AND a.date <= $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    query += ` ORDER BY a.date DESC LIMIT 200`; // Add limit to prevent large result sets

    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
    await pool.end(); // Close the pool connection
  }
};

// Get attendance statistics
export const getAttendanceStats = async (userId: string, attendanceType?: string, date?: Date) => {
  const { Pool } = await import('pg');

  const DATABASE_URL = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // For NeonDB compatibility
    }
  });

  const client = await pool.connect();

  try {
    let query = 'SELECT status, date FROM attendance WHERE userId = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (attendanceType) {
      query += ` AND attendanceType = $${paramIndex}`;
      params.push(attendanceType);
      paramIndex++;
    }

    if (date) {
      // Get records for a specific date
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      query += ` AND date >= $${paramIndex} AND date <= $${paramIndex + 1}`;
      params.push(start, end);
      paramIndex += 2;
    }

    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
    await pool.end(); // Close the pool connection
  }
};

// Get attendance summary for dashboard
export const getAttendanceSummary = async (attendanceType: string, startDate?: Date, endDate?: Date) => {
  const { Pool } = await import('pg');

  const DATABASE_URL = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // For NeonDB compatibility
    }
  });

  const client = await pool.connect();

  try {
    // Get total count
    let totalCountQuery = 'SELECT COUNT(*) as total FROM attendance WHERE attendanceType = $1';
    let params: any[] = [attendanceType];
    let paramIndex = 2;

    if (startDate && endDate) {
      totalCountQuery += ` AND date >= $${paramIndex} AND date <= $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    const totalResult = await client.query(totalCountQuery, params);
    const total = parseInt(totalResult.rows[0].total);

    // Get present count
    let presentCountQuery = 'SELECT COUNT(*) as count FROM attendance WHERE attendanceType = $1 AND status = \'PRESENT\'';
    params = [attendanceType];
    paramIndex = 2;

    if (startDate && endDate) {
      presentCountQuery += ` AND date >= $${paramIndex} AND date <= $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    const presentResult = await client.query(presentCountQuery, params);
    const present = parseInt(presentResult.rows[0].count);

    // Get absent count
    let absentCountQuery = 'SELECT COUNT(*) as count FROM attendance WHERE attendanceType = $1 AND status = \'ABSENT\'';
    params = [attendanceType];
    paramIndex = 2;

    if (startDate && endDate) {
      absentCountQuery += ` AND date >= $${paramIndex} AND date <= $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    const absentResult = await client.query(absentCountQuery, params);
    const absent = parseInt(absentResult.rows[0].count);

    // Get late count
    let lateCountQuery = 'SELECT COUNT(*) as count FROM attendance WHERE attendanceType = $1 AND status = \'LATE\'';
    params = [attendanceType];
    paramIndex = 2;

    if (startDate && endDate) {
      lateCountQuery += ` AND date >= $${paramIndex} AND date <= $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    const lateResult = await client.query(lateCountQuery, params);
    const late = parseInt(lateResult.rows[0].count);

    return {
      total,
      present,
      absent,
      late,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0
    };
  } finally {
    client.release();
    await pool.end(); // Close the pool connection
  }
};

// Get today's attendance for a user
export const getTodaysAttendance = async (userId: string, attendanceType: string) => {
  const { Pool } = await import('pg');

  const DATABASE_URL = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // For NeonDB compatibility
    }
  });

  const client = await pool.connect();

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await client.query(
      `SELECT * FROM attendance
       WHERE userId = $1
       AND attendanceType = $2
       AND date >= $3
       AND date < $4`,
      [userId, attendanceType, today, tomorrow]
    );

    return result.rows;
  } finally {
    client.release();
    await pool.end(); // Close the pool connection
  }
};