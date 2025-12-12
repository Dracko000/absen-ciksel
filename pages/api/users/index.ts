// pages/api/users/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify the token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;

    const user = await getUserFromToken(token);

    // Only allow SUPERADMIN to access all users
    if (user.role !== 'SUPERADMIN') {
      return res.status(403).json({
        message: 'Access denied. SUPERADMIN role required.'
      });
    }

    if (req.method === 'GET') {
      // Get all users with pagination
      const { page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const db = sql();

      // Count total users for pagination metadata
      const countResult = await db`SELECT COUNT(*) FROM users`;
      const total = parseInt(countResult[0].count, 10);

      // Select only required fields to reduce payload
      const result = await db`
        SELECT id, userId, name, email, role, classId, subject, isActive, createdAt
        FROM users
        ORDER BY createdAt DESC
        LIMIT ${Number(limit)} OFFSET ${offset}
      `;

      // Remove sensitive information before sending
      const users = result.map(user => ({
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        classId: user.classId,
        subject: user.subject,
        isActive: user.isActive,
        createdAt: user.createdAt
      }));

      res.status(200).json({
        users,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
          limit: Number(limit)
        }
      });
    } else if (req.method === 'POST') {
      // Create a new user (only SUPERADMIN can do this)
      const { userId, name, email, password, role, classId, subject } = req.body;

      if (!userId || !name || !email || !password || !role) {
        return res.status(400).json({
          message: 'Missing required fields'
        });
      }

      // Validate role
      if (!['SUPERADMIN', 'ADMIN', 'USER'].includes(role)) {
        return res.status(400).json({
          message: 'Invalid role specified'
        });
      }

      const db = sql();

      // Check if user already exists
      const existingUser = await db`SELECT id FROM users WHERE email = ${email}`;

      if (existingUser.length > 0) {
        return res.status(400).json({
          message: 'User with this email already exists'
        });
      }

      // Hash the password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create barcode data
      const barcodeData = JSON.stringify({
        userId,
        name,
        role
      });

      // Create the user
      const result = await db`
        INSERT INTO users (userId, name, email, password, role, barcodeData, classId, subject)
        VALUES (${userId}, ${name}, ${email}, ${hashedPassword}, ${role}, ${barcodeData}, ${classId || null}, ${subject || null})
        RETURNING id, userId, name, email, role, classId, subject, isActive, createdAt
      `;

      const newUser = result[0];

      // Remove sensitive info
      const { password: _, ...safeUser } = newUser;

      res.status(201).json({ user: safeUser });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in users API:', error);
    res.status(500).json({
      message: error.message || 'Internal server error'
    });
  }
}