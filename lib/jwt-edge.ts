import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET || 'fallback_secret_for_development';
const secret = new TextEncoder().encode(JWT_SECRET);

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER'
}

// Generate JWT token
export const generateToken = async (payload: { id: string; email: string; role: UserRole }) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
};

// Verify JWT token
export const verifyToken = async (token: string) => {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as { id: string; email: string; role: UserRole };
  } catch (error) {
    throw new Error('Invalid token');
  }
};