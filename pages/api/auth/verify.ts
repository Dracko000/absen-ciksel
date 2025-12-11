import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    const user = await getUserFromToken(token);
    
    res.status(200).json({
      authenticated: true,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        classId: user.classId,
        subject: user.subject
      }
    });
  } catch (error: any) {
    res.status(401).json({ 
      authenticated: false,
      message: error.message || 'Token verification failed' 
    });
  }
}