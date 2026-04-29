import { Request, Response, NextFunction } from 'express'
import { Role } from '@prisma/client'
import { extractBearerToken, verifyAccessToken, JwtPayload } from '../shared/utils/jwt'
import { UnauthorizedError, ForbiddenError } from '../shared/errors/AppError'
import { prisma } from '../config/database'

// ─────────────────────────────────────────────────────────
// Extend Express Request with authenticated user
// ─────────────────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

export interface AuthenticatedUser {
  id: string
  email: string
  role: Role
  name?: string | null
}

// ─────────────────────────────────────────────────────────
// Require valid JWT
// ─────────────────────────────────────────────────────────
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req.headers.authorization)
  const payload: JwtPayload = verifyAccessToken(token)

  // Verify user still exists in DB
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, name: true },
  })

  if (!user) {
    throw new UnauthorizedError('User account no longer exists')
  }

  req.user = user
  next()
}

// ─────────────────────────────────────────────────────────
// Optional auth — attaches user if token present, no error if missing
// ─────────────────────────────────────────────────────────
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.headers.authorization) {
      next()
      return
    }
    const token = extractBearerToken(req.headers.authorization)
    const payload = verifyAccessToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, name: true },
    })
    if (user) req.user = user
  } catch {
    // silently ignore — optional auth
  }
  next()
}

// ─────────────────────────────────────────────────────────
// Role guard factory
// ─────────────────────────────────────────────────────────
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError()
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(`Requires one of: ${roles.join(', ')}`)
    }
    next()
  }
}

// Convenience guards
export const requireAdmin = requireRole(Role.ADMIN, Role.SUPER_ADMIN)
export const requireSuperAdmin = requireRole(Role.SUPER_ADMIN)
