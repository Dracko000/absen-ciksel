import { sign, verify } from 'jsonwebtoken';
import { compare, hash } from 'bcryptjs';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

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
  const client = await db.connect();

  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

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

    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  } finally {
    client.release();
  }
};

// Get user from token
export const getUserFromToken = async (token?: string) => {
  if (!token) {
    throw new Error('Access token is required');
  }

  try {
    const decoded = verifyToken(token);
    const client = await db.connect();

    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1 AND isActive = true',
        [decoded.id]
      );

      const user = result.rows[0];

      if (!user) {
        throw new Error('User not found or inactive');
      }

      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } finally {
      client.release();
    }
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

  const client = await db.connect();

  try {
    const result = await client.query(
      `INSERT INTO users (id, userId, name, email, password, role, barcodeData, classId, subject)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [uuidv4(), userId, name, email, hashedPassword, role, barcodeData, classId || null, subject || null]
    );

    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = result.rows[0];

    return userWithoutPassword;
  } finally {
    client.release();
  }
};