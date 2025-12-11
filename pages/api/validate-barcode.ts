// pages/api/validate-barcode.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify the user's token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token is required' });
    }

    const user = await getUserFromToken(token);

    const { barcodeData } = req.body;

    if (!barcodeData) {
      return res.status(400).json({ message: 'Barcode data is required' });
    }

    // Find user in database using the barcode validation function
    const { validateUserFromBarcode } = await import('@/utils/barcode');
    const dbUser = await validateUserFromBarcode(barcodeData);

    res.status(200).json({
      message: 'User validated successfully',
      user: dbUser
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || 'Barcode validation failed'
    });
  }
}