import { sign, verify } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'fallback_secret_for_development';

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