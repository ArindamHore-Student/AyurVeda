import { PrismaClient } from '@prisma/client';

// Avoid multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Add options to handle Vercel's read-only filesystem in production
const prismaClientSingleton = () => {
  return new PrismaClient({
    // On Vercel, disable query logging in production for performance
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    // Handle errors for read-only filesystem on Vercel
    errorFormat: 'pretty',
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma; 