import { v4 as uuidv4 } from 'uuid';
import { generateToken, verifyToken, UserRole } from './jwt-edge'; // Use Edge-compatible JWT functions
import { hashPassword, comparePassword } from './jwt'; // Use Node.js-only hashing functions

// Re-export functions so other modules can import them from auth
export { UserRole, hashPassword, comparePassword, generateToken, verifyToken };

// Note: PostgreSQL client is dynamically imported in functions that run server-side only

// Authenticate user
export const authenticateUser = async (email: string, password: string) => {
  const { sql } = await import('./db');
  const db = sql();

  // Using template literals for the query
  const result = await db`SELECT * FROM users WHERE email = ${email}`;

  const user = result[0];

  if (!user || !await comparePassword(password, user.password)) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  const token = await generateToken({ // Await this as it's now async
    id: user.id,
    email: user.email,
    role: user.role as UserRole
  });

  // Remove password from returned user object
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

// Get user from token
export const getUserFromToken = async (token?: string) => {
  if (!token) {
    throw new Error('Access token is required');
  }

  try {
    const decoded = await verifyToken(token); // Await this as it's now async

    const { sql } = await import('./db');
    const db = sql();

    const result = await db`SELECT * FROM users WHERE id = ${decoded.id} AND isActive = true`;

    const user = result[0];

    if (!user) {
      throw new Error('User not found or inactive');
    }

    // Remove password from returned user object
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
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

// Check if user exists by email
export const checkUserExists = async (email: string): Promise<boolean> => {
  const { sql } = await import('./db');
  const db = sql();

  const result = await db`SELECT id FROM users WHERE email = ${email}`;

  return result.length > 0;
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
  // Check if user already exists
  const exists = await checkUserExists(email);
  if (exists) {
    throw new Error(`User with email ${email} already exists`);
  }

  const hashedPassword = await hashPassword(password);

  // Create barcode data containing user info
  const barcodeData = JSON.stringify({
    userId,
    name,
    role
  });

  const { sql } = await import('./db');
  const db = sql();

  const result = await db`
    INSERT INTO users (id, userId, name, email, password, role, barcodeData, classId, subject)
    VALUES (${uuidv4()}, ${userId}, ${name}, ${email}, ${hashedPassword}, ${role}, ${barcodeData}, ${classId || null}, ${subject || null})
    RETURNING *
  `;

  // Remove password from returned user object
  const { password: _, ...userWithoutPassword } = result[0];

  return userWithoutPassword;
};