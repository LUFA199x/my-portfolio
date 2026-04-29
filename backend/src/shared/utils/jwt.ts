import jwt from 'jsonwebtoken'
import { config } from '../../config'
import { UnauthorizedError } from '../errors/AppError'

export interface JwtPayload {
  sub: string   // user id
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

// ─────────────────────────────────────────────────────────
// Sign tokens
// ─────────────────────────────────────────────────────────
export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions)
}

export function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions)
}

export function signTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>): TokenPair {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  }
}

// ─────────────────────────────────────────────────────────
// Verify tokens
// ─────────────────────────────────────────────────────────
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.JWT_ACCESS_SECRET) as JwtPayload
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token expired')
    }
    throw new UnauthorizedError('Invalid access token')
  }
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token')
  }
}

// ─────────────────────────────────────────────────────────
// Extract token from header
// ─────────────────────────────────────────────────────────
export function extractBearerToken(authHeader?: string): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header')
  }
  return authHeader.slice(7)
}

// ─────────────────────────────────────────────────────────
// Get refresh token expiry as Date
// ─────────────────────────────────────────────────────────
export function getRefreshTokenExpiry(): Date {
  const days = parseInt(config.JWT_REFRESH_EXPIRES_IN.replace('d', ''), 10)
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}
