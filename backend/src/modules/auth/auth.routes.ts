import { Request, Response } from 'express'
import { Router } from 'express'
import { authService } from './auth.service'
import { loginSchema, refreshSchema, changePasswordSchema } from './auth.schema'
import { authenticate } from '../../middleware/auth.middleware'
import { authLimiter } from '../../middleware/rateLimit.middleware'
import { sendSuccess } from '../../shared/utils/response'
import { validate } from '../../middleware/validate.middleware'

// ─────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────
class AuthController {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    })
    sendSuccess(res, result, 'Login successful')
  }

  async refresh(req: Request, res: Response) {
    const { tokens } = await authService.refresh(req.body.refreshToken)
    sendSuccess(res, { tokens }, 'Tokens refreshed')
  }

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken)
    sendSuccess(res, null, 'Logged out successfully')
  }

  async logoutAll(req: Request, res: Response) {
    await authService.logoutAll(req.user!.id)
    sendSuccess(res, null, 'All sessions terminated')
  }

  async me(req: Request, res: Response) {
    const user = await authService.getProfile(req.user!.id)
    sendSuccess(res, user)
  }

  async changePassword(req: Request, res: Response) {
    await authService.changePassword(req.user!.id, req.body)
    sendSuccess(res, null, 'Password changed — please log in again')
  }
}

const ctrl = new AuthController()

// ─────────────────────────────────────────────────────────
// Routes — /api/v1/auth
// ─────────────────────────────────────────────────────────
export const authRouter = Router()

authRouter.post('/login', authLimiter, validate(loginSchema), (req, res) => ctrl.login(req, res))
authRouter.post('/refresh', validate(refreshSchema), (req, res) => ctrl.refresh(req, res))
authRouter.post('/logout', (req, res) => ctrl.logout(req, res))
authRouter.post('/logout-all', authenticate, (req, res) => ctrl.logoutAll(req, res))
authRouter.get('/me', authenticate, (req, res) => ctrl.me(req, res))
authRouter.patch('/change-password', authenticate, validate(changePasswordSchema), (req, res) =>
  ctrl.changePassword(req, res)
)
