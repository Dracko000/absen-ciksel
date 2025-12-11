import { PrismaClient } from '@prisma/client';

// Declare global for Prisma client in development
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma: PrismaClient = 
  global.prisma || 
  new PrismaClient({
    log: ['query']
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;