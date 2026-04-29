import { PrismaClient } from '@prisma/client'
import { config } from './index'
import { logger } from '../shared/utils/logger'

// ─────────────────────────────────────────────────────────
// Prisma singleton — prevents multiple instances in dev
// ─────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      config.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [{ emit: 'event', level: 'error' }],
  })
}

export const prisma = globalThis.__prisma ?? createPrismaClient()

if (config.NODE_ENV === 'development') {
  globalThis.__prisma = prisma

  // Log slow queries in development
  prisma.$on('query' as never, (e: { query: string; duration: number }) => {
    if (e.duration > 100) {
      logger.warn(`Slow query (${e.duration}ms): ${e.query}`)
    }
  })

  prisma.$on('error' as never, (e: { message: string }) => {
    logger.error(`Prisma error: ${e.message}`)
  })
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect()
  logger.info('✅ Database connected')
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
  logger.info('Database disconnected')
}
