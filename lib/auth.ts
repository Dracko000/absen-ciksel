import { sign, verify } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';
import prisma from '@/lib/server/prisma';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';

// Define user roles
export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

// Generate JWT token
export const generateToken = (payload: { id: string; email: string; role: UserRole }) => {
  return sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

// Verify JWT token
export const verifyToken = (token: string) => {
  try {
    return verify(token, JWT_SECRET) as { id: string; email: string; role: UserRole };
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Hash password
export const hashPassword = async (password: string) => {
  return await hash(password, 12);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string) => {
  return await compare(password, hashedPassword);
};

// Authenticate user
export const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !await comparePassword(password, user.password)) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role as UserRole
  });

  return { user, token };
};

// Get user from token
export const getUserFromToken = async (token?: string) => {
  if (!token) {
    throw new Error('Access token is required');
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Check user role authorization
export const checkAuthorization = (
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean => {
  return requiredRoles.includes(userRole);
};

// Create user
export const createUser = async (
  userId: string,
  name: string,
  email: string,
  password: string,
  role: UserRole,
  classId?: string,
  subject?: string
) => {
  const hashedPassword = await hashPassword(password);
  
  // Create barcode data containing user info
  const barcodeData = JSON.stringify({
    userId,
    name,
    role
  });

  return await prisma.user.create({
    data: {
      userId,
      name,
      email,
      password: hashedPassword,
      role,
      barcodeData,
      classId,
      subject
    }
  });
};