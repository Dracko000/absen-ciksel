import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser, getUserFromToken } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const runtime = 'nodejs'; // Use Node.js runtime due to bcryptjs usage in lib/auth via authenticateUser

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const authResult = await authenticateUser(email, password);

    // Log login activity
    await logActivity(
      authResult.user.id,
      'LOGIN',
      `${authResult.user.name} logged in`,
      req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || '',
      req.headers['user-agent'] || ''
    );

    // Return user data and token
    // The password is already removed in authenticateUser
    res.status(200).json({
      message: 'Login successful',
      user: authResult.user,
      token: authResult.token
    });
  } catch (error: any) {
    res.status(401).json({
      message: error.message || 'Authentication failed'
    });
  }
}