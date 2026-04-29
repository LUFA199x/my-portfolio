import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'

const { combine, timestamp, printf, colorize, errors, json } = winston.format

const LOG_DIR = process.env.LOG_DIR || 'logs'
const LOG_LEVEL = process.env.LOG_LEVEL || 'info'
const IS_PROD = process.env.NODE_ENV === 'production'

// ─────────────────────────────────────────────────────────
// Formats
// ─────────────────────────────────────────────────────────
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
    return `${timestamp} [${level}] ${stack || message}${metaStr}`
  })
)

const prodFormat = combine(timestamp(), errors({ stack: true }), json())

// ─────────────────────────────────────────────────────────
// Transports
// ─────────────────────────────────────────────────────────
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: IS_PROD ? prodFormat : devFormat,
  }),
]

if (IS_PROD) {
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: prodFormat,
    }),
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: prodFormat,
    })
  )
}

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports,
  exitOnError: false,
})
