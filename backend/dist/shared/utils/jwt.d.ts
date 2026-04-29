export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;
export declare function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;
export declare function signTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>): TokenPair;
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function verifyRefreshToken(token: string): JwtPayload;
export declare function extractBearerToken(authHeader?: string): string;
export declare function getRefreshTokenExpiry(): Date;
//# sourceMappingURL=jwt.d.ts.map