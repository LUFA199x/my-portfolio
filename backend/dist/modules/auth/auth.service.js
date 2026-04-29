"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../../config/database");
const jwt_1 = require("../../shared/utils/jwt");
const AppError_1 = require("../../shared/errors/AppError");
class AuthService {
    // ─────────────────────────────────────────────────
    // Login
    // ─────────────────────────────────────────────────
    async login(input, meta) {
        const user = await database_1.prisma.user.findUnique({ where: { email: input.email } });
        if (!user)
            throw new AppError_1.UnauthorizedError('Invalid email or password');
        const passwordValid = await bcryptjs_1.default.compare(input.password, user.password);
        if (!passwordValid)
            throw new AppError_1.UnauthorizedError('Invalid email or password');
        const tokens = (0, jwt_1.signTokenPair)({ sub: user.id, email: user.email, role: user.role });
        // Persist refresh token
        await database_1.prisma.session.create({
            data: {
                userId: user.id,
                refreshToken: tokens.refreshToken,
                ipAddress: meta.ip,
                userAgent: meta.userAgent,
                expiresAt: (0, jwt_1.getRefreshTokenExpiry)(),
            },
        });
        return {
            tokens,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }
    // ─────────────────────────────────────────────────
    // Refresh access token
    // ─────────────────────────────────────────────────
    async refresh(refreshToken) {
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const session = await database_1.prisma.session.findUnique({ where: { refreshToken } });
        if (!session || session.expiresAt < new Date()) {
            if (session)
                await database_1.prisma.session.delete({ where: { id: session.id } });
            throw new AppError_1.UnauthorizedError('Refresh token invalid or expired');
        }
        const user = await database_1.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user)
            throw new AppError_1.UnauthorizedError('User not found');
        const tokens = (0, jwt_1.signTokenPair)({ sub: user.id, email: user.email, role: user.role });
        // Rotate refresh token (token rotation for security)
        await database_1.prisma.session.update({
            where: { id: session.id },
            data: {
                refreshToken: tokens.refreshToken,
                expiresAt: (0, jwt_1.getRefreshTokenExpiry)(),
            },
        });
        return { tokens };
    }
    // ─────────────────────────────────────────────────
    // Logout (invalidate session)
    // ─────────────────────────────────────────────────
    async logout(refreshToken) {
        await database_1.prisma.session.deleteMany({ where: { refreshToken } });
    }
    // ─────────────────────────────────────────────────
    // Logout all sessions (security action)
    // ─────────────────────────────────────────────────
    async logoutAll(userId) {
        await database_1.prisma.session.deleteMany({ where: { userId } });
    }
    // ─────────────────────────────────────────────────
    // Change password
    // ─────────────────────────────────────────────────
    async changePassword(userId, input) {
        const user = await database_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new AppError_1.NotFoundError('User');
        const valid = await bcryptjs_1.default.compare(input.currentPassword, user.password);
        if (!valid)
            throw new AppError_1.BadRequestError('Current password is incorrect');
        const hashed = await bcryptjs_1.default.hash(input.newPassword, 12);
        await database_1.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
        // Invalidate all sessions after password change
        await this.logoutAll(userId);
    }
    // ─────────────────────────────────────────────────
    // Get profile
    // ─────────────────────────────────────────────────
    async getProfile(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
        });
        if (!user)
            throw new AppError_1.NotFoundError('User');
        return user;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map