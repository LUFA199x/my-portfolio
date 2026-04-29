import bcrypt from 'bcryptjs'
import { prisma } from '../../config/database'
import {
  signTokenPair,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../../shared/utils/jwt'
import {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} from '../../shared/errors/AppError'
import { LoginInput, ChangePasswordInput } from './auth.schema'

export class AuthService {
  // ─────────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────────
  async login(
    input: LoginInput,
    meta: { ip?: string; userAgent?: string }
  ) {
    const user = await prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw new UnauthorizedError('Invalid email or password')

    const passwordValid = await bcrypt.compare(input.password, user.password)
    if (!passwordValid) throw new UnauthorizedError('Invalid email or password')

    const tokens = signTokenPair({ sub: user.id, email: user.email, role: user.role })

    // Persist refresh token
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        ipAddress: meta.ip,
        userAgent: meta.userAgent,
        expiresAt: getRefreshTokenExpiry(),
      },
    })

    return {
      tokens,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    }
  }

  // ─────────────────────────────────────────────────
  // Refresh access token
  // ─────────────────────────────────────────────────
  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken)

    const session = await prisma.session.findUnique({ where: { refreshToken } })
    if (!session || session.expiresAt < new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } })
      throw new UnauthorizedError('Refresh token invalid or expired')
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user) throw new UnauthorizedError('User not found')

    const tokens = signTokenPair({ sub: user.id, email: user.email, role: user.role })

    // Rotate refresh token (token rotation for security)
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: tokens.refreshToken,
        expiresAt: getRefreshTokenExpiry(),
      },
    })

    return { tokens }
  }

  // ─────────────────────────────────────────────────
  // Logout (invalidate session)
  // ─────────────────────────────────────────────────
  async logout(refreshToken: string): Promise<void> {
    await prisma.session.deleteMany({ where: { refreshToken } })
  }

  // ─────────────────────────────────────────────────
  // Logout all sessions (security action)
  // ─────────────────────────────────────────────────
  async logoutAll(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } })
  }

  // ─────────────────────────────────────────────────
  // Change password
  // ─────────────────────────────────────────────────
  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundError('User')

    const valid = await bcrypt.compare(input.currentPassword, user.password)
    if (!valid) throw new BadRequestError('Current password is incorrect')

    const hashed = await bcrypt.hash(input.newPassword, 12)
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

    // Invalidate all sessions after password change
    await this.logoutAll(userId)
  }

  // ─────────────────────────────────────────────────
  // Get profile
  // ─────────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
    })
    if (!user) throw new NotFoundError('User')
    return user
  }
}

export const authService = new AuthService()
