import { PrismaClient } from '@prisma/client'

// Extend the global object type to include prisma
declare global {
  var prisma: PrismaClient | undefined
}

// Create the Prisma client instance
const createPrismaClient = () => {
  if (typeof window !== 'undefined') {
    // Browser should not have access to Prisma client
    throw new Error('Prisma client should not be used in browser')
  }

  // In server environments (Node.js)
  const globalForPrisma = global as typeof global & {
    prisma: PrismaClient
  }

  const prismaClient = globalForPrisma.prisma || new PrismaClient()

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient
  }

  return prismaClient
}

const prisma = createPrismaClient()

export default prisma