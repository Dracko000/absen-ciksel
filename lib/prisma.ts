// Use dynamic import to avoid build issues with Next.js 16 and Prisma v7
let prisma: any;

if (typeof window === 'undefined') {
  // Server-side
  const { PrismaClient } = require('@prisma/client');

  // Declare global for Prisma client in development
  if (process.env.NODE_ENV !== 'production') {
    if (!global.prisma) {
      global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
  } else {
    prisma = new PrismaClient();
  }
} else {
  // Client-side - should not happen in API routes, but just in case
  prisma = null;
}

export default prisma;