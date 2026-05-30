// lib/db.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  // 1. Creamos un pool de conexiones nativo con la URL del .env
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // 2. Instanciamos el adaptador oficial de Prisma 7 para PostgreSQL
  const adapter = new PrismaPg(pool);
  
  // 3. Le pasamos el adaptador directamente al constructor
  prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
  }
}

export { prisma };