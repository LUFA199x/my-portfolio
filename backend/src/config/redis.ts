import Redis from 'ioredis'
import { config } from './index'
import { logger } from '../shared/utils/logger'

// ─────────────────────────────────────────────────────────
// Redis client singleton
// ─────────────────────────────────────────────────────────
let redisClient: Redis | null = null

export function getRedisClient(): Redis {
  if (redisClient) return redisClient

  redisClient = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    retryStrategy(times) {
      if (times > 5) {
        logger.warn('Redis max retries exceeded — running without cache')
        return null // stop retrying
      }
      return Math.min(times * 100, 3000)
    },
  })

  redisClient.on('connect', () => logger.info('✅ Redis connected'))
  redisClient.on('error', (err) => logger.warn(`Redis error: ${err.message}`))
  redisClient.on('close', () => logger.warn('Redis connection closed'))

  return redisClient
}

// ─────────────────────────────────────────────────────────
// Cache helpers
// ─────────────────────────────────────────────────────────
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient()
      const data = await client.get(key)
      return data ? (JSON.parse(data) as T) : null
    } catch {
      return null // degrade gracefully
    }
  },

  async set(key: string, value: unknown, ttlSeconds = config.REDIS_TTL): Promise<void> {
    try {
      const client = getRedisClient()
      await client.setex(key, ttlSeconds, JSON.stringify(value))
    } catch {
      // degrade gracefully
    }
  },

  async del(key: string): Promise<void> {
    try {
      const client = getRedisClient()
      await client.del(key)
    } catch {
      // degrade gracefully
    }
  },

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const client = getRedisClient()
      const keys = await client.keys(pattern)
      if (keys.length > 0) {
        await client.del(...keys)
      }
    } catch {
      // degrade gracefully
    }
  },
}

export const CACHE_KEYS = {
  projects: 'projects:all',
  project: (slug: string) => `projects:${slug}`,
  testimonials: 'testimonials:all',
  services: 'services:all',
  settings: 'settings:all',
} as const
