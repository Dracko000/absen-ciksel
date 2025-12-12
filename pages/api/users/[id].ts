// pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';
import { sql } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  try {
    // Verify the token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;

    const user = await getUserFromToken(token);

    // Only allow SUPERADMIN to delete users
    if (user.role !== 'SUPERADMIN') {
      return res.status(403).json({
        message: 'Access denied. SUPERADMIN role required.'
      });
    }

    if (req.method === 'DELETE') {
      const db = sql();

      // Check if the user exists
      const existingUser = await db`
        SELECT id FROM users WHERE id = ${id}
      `;

      if (existingUser.length === 0) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      // Prevent deletion of the current user
      if (existingUser[0].id === user.id) {
        return res.status(400).json({
          message: 'Cannot delete your own account'
        });
      }

      // Delete the user
      await db`
        DELETE FROM users WHERE id = ${id}
      `;

      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error in user delete API:', error);
    res.status(500).json({
      message: error.message || 'Internal server error'
    });
  }
}