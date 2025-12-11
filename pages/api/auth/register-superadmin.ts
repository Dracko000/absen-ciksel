import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser, checkUserExists, hashPassword, UserRole } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

type ApiResponse = {
  success: boolean;
  message: string;
  error?: string;
};

// This endpoint requires a special registration token that's not exposed publicly
const handler = async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { token, userData } = req.body;

    // Verify the special registration token (in a real app, this would be stored securely)
    const SPECIAL_REGISTRATION_TOKEN = process.env.SUPERADMIN_REGISTRATION_TOKEN;
    if (!SPECIAL_REGISTRATION_TOKEN || token !== SPECIAL_REGISTRATION_TOKEN) {
      return res.status(403).json({ success: false, message: 'Invalid registration token' });
    }

    const { userId, name, email, password, classId, subject } = userData;

    if (!userId || !name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: userId, name, email, password' 
      });
    }

    // Check if user already exists
    const exists = await checkUserExists(email);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate a unique ID for the user
    const uniqueUserId = uuidv4();

    // Create superadmin user
    await createUser(
      uniqueUserId,
      name,
      email,
      password, // createUser handles hashing internally
      UserRole.SUPERADMIN,
      classId,
      subject
    );

    return res.status(201).json({ 
      success: true, 
      message: 'Superadmin account created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating superadmin:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// We don't want to use the regular withAuth here since this is a special registration endpoint
export default handler;