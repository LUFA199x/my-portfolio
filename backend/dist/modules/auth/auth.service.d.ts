import { LoginInput, ChangePasswordInput } from './auth.schema';
export declare class AuthService {
    login(input: LoginInput, meta: {
        ip?: string;
        userAgent?: string;
    }): Promise<{
        tokens: import("../../shared/utils/jwt").TokenPair;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        tokens: import("../../shared/utils/jwt").TokenPair;
    }>;
    logout(refreshToken: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    changePassword(userId: string, input: ChangePasswordInput): Promise<void>;
    getProfile(userId: string): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        name: string | null;
        avatar: string | null;
        createdAt: Date;
    }>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map