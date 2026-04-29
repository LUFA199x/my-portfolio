import rateLimit from 'express-rate-limit'
import { config } from '../config'
import { sendError } from '../shared/utils/response'

// ─────────────────────────────────────────────────────────
// Default limiter — applied globally
// ─────────────────────────────────────────────────────────
export const defaultLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 'Too many requests, please try again later.', 429, 'RATE_LIMIT_EXCEEDED')
  },
})

// ─────────────────────────────────────────────────────────
// Strict limiter — for contact form / auth endpoints
// ─────────────────────────────────────────────────────────
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.RATE_LIMIT_CONTACT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      'You have submitted too many requests. Please wait before trying again.',
      429,
      'RATE_LIMIT_EXCEEDED'
    )
  },
})

// ─────────────────────────────────────────────────────────
// Auth limiter — prevent brute-force login attacks
// ─────────────────────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skipSuccessfulRequests: true, // only count failed attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      'Too many failed login attempts. Account temporarily locked.',
      429,
      'RATE_LIMIT_EXCEEDED'
    )
  },
})
