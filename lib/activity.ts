// lib/activity.ts
import { sql } from './db';

export const logActivity = async (
  userId: string,
  action: string,
  description: string,
  ipAddress: string,
  userAgent: string
) => {
  const db = sql();

  await db`
    INSERT INTO activity_logs (userId, action, description, ipAddress, userAgent)
    VALUES (${userId}, ${action}, ${description}, ${ipAddress}, ${userAgent})
  `;
};