"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_KEYS = exports.cache = void 0;
exports.getRedisClient = getRedisClient;
const ioredis_1 = __importDefault(require("ioredis"));
const index_1 = require("./index");
const logger_1 = require("../shared/utils/logger");
// ─────────────────────────────────────────────────────────
// Redis client singleton
// ─────────────────────────────────────────────────────────
let redisClient = null;
function getRedisClient() {
    if (redisClient)
        return redisClient;
    redisClient = new ioredis_1.default(index_1.config.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        retryStrategy(times) {
            if (times > 5) {
                logger_1.logger.warn('Redis max retries exceeded — running without cache');
                return null; // stop retrying
            }
            return Math.min(times * 100, 3000);
        },
    });
    redisClient.on('connect', () => logger_1.logger.info('✅ Redis connected'));
    redisClient.on('error', (err) => logger_1.logger.warn(`Redis error: ${err.message}`));
    redisClient.on('close', () => logger_1.logger.warn('Redis connection closed'));
    return redisClient;
}
// ─────────────────────────────────────────────────────────
// Cache helpers
// ─────────────────────────────────────────────────────────
exports.cache = {
    async get(key) {
        try {
            const client = getRedisClient();
            const data = await client.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null; // degrade gracefully
        }
    },
    async set(key, value, ttlSeconds = index_1.config.REDIS_TTL) {
        try {
            const client = getRedisClient();
            await client.setex(key, ttlSeconds, JSON.stringify(value));
        }
        catch {
            // degrade gracefully
        }
    },
    async del(key) {
        try {
            const client = getRedisClient();
            await client.del(key);
        }
        catch {
            // degrade gracefully
        }
    },
    async invalidatePattern(pattern) {
        try {
            const client = getRedisClient();
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(...keys);
            }
        }
        catch {
            // degrade gracefully
        }
    },
};
exports.CACHE_KEYS = {
    projects: 'projects:all',
    project: (slug) => `projects:${slug}`,
    testimonials: 'testimonials:all',
    services: 'services:all',
    settings: 'settings:all',
};
//# sourceMappingURL=redis.js.map