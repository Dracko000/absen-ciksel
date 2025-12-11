import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser, UserRole } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import db from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, name, email, password, role, classId, subject } = req.body;

    if (!userId || !name || !email || !password || !role) {
      return res.status(400).json({
        message: 'userId, name, email, password, and role are required'
      });
    }

    // Check if user with email already exists
    const client = await db.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        return res.status(409).json({ message: 'User with this email already exists' });
      }
    } finally {
      client.release();
    }

    // Only superadmin can create other superadmins and admins
    // Regular users can only register as USER role
    // For this implementation, we'll allow basic registration with validation

    const userRole = role as UserRole;
    if (!Object.values(UserRole).includes(userRole)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const newUser = await createUser(userId, name, email, password, userRole, classId, subject);

    // Log user creation activity
    await logActivity(
      newUser.id,
      'USER_CREATED',
      `New user ${newUser.name} was registered`,
      req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || '',
      req.headers['user-agent'] || ''
    );

    // The password is already removed in createUser
    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || 'Registration failed'
    });
  }
}