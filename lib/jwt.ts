import { compare, hash } from 'bcryptjs';

// Define user roles (re-exported from jwt-edge)
export { UserRole } from './jwt-edge';

// Hash password
export const hashPassword = async (password: string) => {
  return await hash(password, 12);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string) => {
  return await compare(password, hashedPassword);
};