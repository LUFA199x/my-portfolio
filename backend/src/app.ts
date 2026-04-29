import 'express-async-errors' // must be first — patches express to forward async errors
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { config } from './config'
import { defaultLimiter } from './middleware/rateLimit.middleware'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'
import { logger } from './shared/utils/logger'

// Route modules
import { authRouter } from './modules/auth/auth.routes'
import { projectsRouter } from './modules/projects/projects.routes'
import { contactRouter } from './modules/contact/contact.routes'
import { testimonialsRouter } from './modules/testimonials/testimonials.routes'
import { servicesRouter } from './modules/services/services.routes'
import { subscribersRouter } from './modules/subscribers/subscribers.routes'
import { uploadsRouter } from './modules/uploads/uploads.routes'

const app = express()

// ─────────────────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // handled by Next.js frontend
  })
)

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = config.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      if (!origin || allowed.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ─────────────────────────────────────────────────────────
// General Middleware
// ─────────────────────────────────────────────────────────
app.use(compression())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true, limit: '2mb' }))

// HTTP request logging
app.use(
  morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/health',
  })
)

// Global rate limiting
app.use(defaultLimiter)

// ─────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    env: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  })
})

// ─────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────
const API = `/api/${config.API_VERSION}`

app.use(`${API}/auth`, authRouter)
app.use(`${API}/projects`, projectsRouter)
app.use(`${API}/contact`, contactRouter)
app.use(`${API}/testimonials`, testimonialsRouter)
app.use(`${API}/services`, servicesRouter)
app.use(`${API}/subscribers`, subscribersRouter)
app.use(`${API}/uploads`, uploadsRouter)

// ─────────────────────────────────────────────────────────
// Error Handling (must be last)
// ─────────────────────────────────────────────────────────
app.use(notFoundHandler)
app.use(errorHandler)

export default app
