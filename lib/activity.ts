import { v4 as uuidv4 } from 'uuid';
// Note: PostgreSQL client is imported dynamically in functions that run server-side only

// Log user activity
export const logActivity = async (
  userId: string,
  action: string,
  description: string,
  ipAddress?: string,
  userAgent?: string
) => {
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
    const result = await client.query(
      `INSERT INTO activity_logs (id, userId, action, description, ipAddress, userAgent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uuidv4(), userId, action, description, ipAddress || null, userAgent || null]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error logging activity:', error);
    throw error;
  } finally {
    client.release();
    await pool.end(); // Close the pool connection
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
      SELECT al.*, u.name, u.email
      FROM activity_logs al
      JOIN users u ON al.userId = u.id
      WHERE al.userId = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (startDate && endDate) {
      query += ` AND al.timestamp >= $${paramIndex} AND al.timestamp <= $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    }

    query += ` ORDER BY al.timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
    await pool.end(); // Close the pool connection
  }
};

// Get all activity logs (for admin/superadmin)
export const getAllActivityLogs = async (
  startDate?: Date,
  endDate?: Date,
  limit: number = 50,
  offset: number = 0
) => {
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
      SELECT al.id, al.userId, al.action, al.description, al.ipAddress, al.userAgent, al.timestamp,
             u.name, u.email, u.role
      FROM activity_logs al
      JOIN users u ON al.userId = u.id
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (startDate && endDate) {
      query += ` WHERE al.timestamp >= $${paramIndex} AND al.timestamp <= $${paramIndex + 1}`;
      params.push(startDate, endDate);
      paramIndex += 2;
    } else {
      query += ` WHERE 1=1`; // Ensure WHERE clause exists for consistency
    }

    query += ` ORDER BY al.timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Math.min(limit, 100), offset); // Cap the limit to prevent excessive data loading

    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
    await pool.end(); // Close the pool connection
  }
};

// Get activity statistics
export const getActivityStats = async (userId?: string) => {
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
    let totalQuery = 'SELECT COUNT(*) as total FROM activity_logs';
    let todayQuery = 'SELECT COUNT(*) as today FROM activity_logs WHERE timestamp::date = CURRENT_DATE';
    const params: any[] = [];

    if (userId) {
      totalQuery += ' WHERE userId = $1';
      todayQuery += ' AND userId = $2';
      params.push(userId, userId);
    }

    const totalResult = await client.query(totalQuery, params);
    const todayResult = await client.query(todayQuery, params);

    return {
      total: parseInt(totalResult.rows[0].total),
      today: parseInt(todayResult.rows[0].today)
    };
  } finally {
    client.release();
    await pool.end(); // Close the pool connection
  }
};