import app from './app'
import { config } from './config'
import { connectDatabase, disconnectDatabase } from './config/database'
import { getRedisClient } from './config/redis'
import { logger } from './shared/utils/logger'

let server: ReturnType<typeof app.listen>

// ─────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────
async function start() {
  try {
    await connectDatabase()
    getRedisClient() // initialise Redis connection

    server = app.listen(config.PORT, () => {
      logger.info(`
  ┌──────────────────────────────────────────┐
  │  🚀  ARHDAY API                          │
  │  Env:    ${config.NODE_ENV.padEnd(32)}│
  │  Port:   ${String(config.PORT).padEnd(32)}│
  │  API:    /api/${config.API_VERSION.padEnd(29)}│
  └──────────────────────────────────────────┘
      `)
    })

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${config.PORT} is already in use`)
      } else {
        logger.error('Server error:', err)
      }
      process.exit(1)
    })
  } catch (err) {
    logger.error('Failed to start server:', err)
    process.exit(1)
  }
}

// ─────────────────────────────────────────────────────────
// Graceful shutdown — finish in-flight requests before exiting
// ─────────────────────────────────────────────────────────
async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`)

  server?.close(async () => {
    logger.info('HTTP server closed')
    await disconnectDatabase()
    logger.info('Shutdown complete')
    process.exit(0)
  })

  // Force exit after 10s if graceful shutdown hangs
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10_000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason)
})

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err)
  process.exit(1)
})

start()
