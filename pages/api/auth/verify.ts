import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : undefined;

    if (!token) {
      return res.status(401).json({ 
        authenticated: false, 
        message: 'No token provided' 
      });
    }

    // Verify the token and get user
    const user = await getUserFromToken(token);

    res.status(200).json({
      authenticated: true,
      user
    });
  } catch (error: any) {
    res.status(401).json({
      authenticated: false,
      message: error.message || 'Invalid token'
    });
  }
}