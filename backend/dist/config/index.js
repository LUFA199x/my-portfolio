"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ─────────────────────────────────────────────────────────
// Schema — validates all env vars at startup
// ─────────────────────────────────────────────────────────
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('4000').transform(Number),
    API_VERSION: zod_1.z.string().default('v1'),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    REDIS_TTL: zod_1.z.string().default('3600').transform(Number),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    ALLOWED_ORIGINS: zod_1.z.string().default('http://localhost:3000'),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().min(1),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1),
    CLOUDINARY_API_SECRET: zod_1.z.string().min(1),
    CLOUDINARY_UPLOAD_FOLDER: zod_1.z.string().default('arhday'),
    SENDGRID_API_KEY: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().email().default('noreply@arhday.com'),
    EMAIL_FROM_NAME: zod_1.z.string().default('ARHDAY Photography'),
    ADMIN_EMAIL: zod_1.z.string().email().default('bookarhday@gmail.com'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().default('900000').transform(Number),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().default('100').transform(Number),
    RATE_LIMIT_CONTACT_MAX: zod_1.z.string().default('5').transform(Number),
    FRONTEND_URL: zod_1.z.string().default('http://localhost:3000'),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_DIR: zod_1.z.string().default('logs'),
});
function validateEnv() {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
        const errors = result.error.errors
            .map((e) => `  • ${e.path.join('.')}: ${e.message}`)
            .join('\n');
        throw new Error(`\n❌ Invalid environment variables:\n${errors}\n`);
    }
    return result.data;
}
exports.config = validateEnv();
//# sourceMappingURL=index.js.map