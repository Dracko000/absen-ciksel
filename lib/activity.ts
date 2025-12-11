// lib/activity.ts
import { pool } from './db';

export const logActivity = async (
  userId: string,
  action: string,
  description: string,
  ipAddress: string,
  userAgent: string
) => {
  const client = await pool.connect();

  try {
    await client.query(
      `INSERT INTO activity_logs (userId, action, description, ipAddress, userAgent)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, action, description, ipAddress, userAgent]
    );
  } finally {
    client.release();
  }
};