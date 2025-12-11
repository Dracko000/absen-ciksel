import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser, UserRole, checkUserExists } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const runtime = 'nodejs'; // Use Node.js runtime due to bcryptjs usage in lib/auth via createUser

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, name, email, password, role, classId, subject } = req.body;

    // Validate required fields
    if (!userId || !name || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'userId, name, email, password, and role are required' 
      });
    }

    // Check if user already exists
    const exists = await checkUserExists(email);
    if (exists) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Create the user
    const user = await createUser(userId, name, email, password, role as UserRole, classId, subject);

    // Log registration activity
    await logActivity(
      user.id,
      'USER_REGISTERED',
      `${user.name} registered with role ${user.role}`,
      req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || '',
      req.headers['user-agent'] || ''
    );

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || 'Registration failed'
    });
  }
}