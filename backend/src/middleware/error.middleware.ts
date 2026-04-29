import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'
import { AppError } from '../shared/errors/AppError'
import { sendError } from '../shared/utils/response'
import { logger } from '../shared/utils/logger'
import { config } from '../config'

// ─────────────────────────────────────────────────────────
// Not Found handler (attach BEFORE error handler)
// ─────────────────────────────────────────────────────────
export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND')
}

// ─────────────────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────────────────
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log every error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  })

  // Operational errors (our own AppError subclasses)
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code)
    return
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    sendError(res, 'Validation failed', 422, 'VALIDATION_ERROR', details)
    return
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint
        sendError(res, 'A record with this value already exists', 409, 'CONFLICT')
        return
      case 'P2025': // Record not found
        sendError(res, 'Record not found', 404, 'NOT_FOUND')
        return
      case 'P2003': // Foreign key constraint
        sendError(res, 'Related record not found', 400, 'BAD_REQUEST')
        return
      default:
        sendError(res, 'Database error', 500, 'DATABASE_ERROR')
        return
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 'Invalid data provided', 400, 'BAD_REQUEST')
    return
  }

  // JWT errors (should be caught by auth middleware, but just in case)
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401, 'UNAUTHORIZED')
    return
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401, 'TOKEN_EXPIRED')
    return
  }

  // Multer file errors
  if (err.name === 'MulterError') {
    sendError(res, err.message, 400, 'FILE_UPLOAD_ERROR')
    return
  }

  // Unknown errors — don't leak stack traces in production
  const message = config.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  sendError(res, message, 500, 'INTERNAL_ERROR')
}
