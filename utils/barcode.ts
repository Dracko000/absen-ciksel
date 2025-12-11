// Barcode utility functions
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate user barcode data containing user ID, name and role
export const generateBarcodeData = (userId: string, name: string, role: string): string => {
  return JSON.stringify({
    userId,
    name,
    role,
    timestamp: Date.now()
  });
};

// Parse barcode data to extract user information
export const parseBarcodeData = (barcodeData: string): { userId: string; name: string; role: string } | null => {
  try {
    const parsed = JSON.parse(barcodeData);
    if (parsed.userId && parsed.name && parsed.role) {
      return {
        userId: parsed.userId,
        name: parsed.name,
        role: parsed.role
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing barcode data:', error);
    return null;
  }
};

// Validate user from barcode data
export const validateUserFromBarcode = async (barcodeData: string) => {
  const parsedData = parseBarcodeData(barcodeData);
  
  if (!parsedData) {
    throw new Error('Invalid barcode data');
  }

  // Find user in database
  const user = await prisma.user.findUnique({
    where: { 
      barcodeData // The full JSON string is stored as barcodeData in the database
    },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      role: true,
      isActive: true
    }
  });

  if (!user) {
    throw new Error('User not found for this barcode');
  }

  if (!user.isActive) {
    throw new Error('User account is deactivated');
  }

  return user;
};

// Validate user by ID (alternative to barcode)
export const validateUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      barcodeData: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.isActive) {
    throw new Error('User account is deactivated');
  }

  return user;
};