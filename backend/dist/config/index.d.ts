export declare const config: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    API_VERSION: string;
    DATABASE_URL: string;
    REDIS_URL: string;
    REDIS_TTL: number;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    ALLOWED_ORIGINS: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    CLOUDINARY_UPLOAD_FOLDER: string;
    EMAIL_FROM: string;
    EMAIL_FROM_NAME: string;
    ADMIN_EMAIL: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    RATE_LIMIT_CONTACT_MAX: number;
    FRONTEND_URL: string;
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
    LOG_DIR: string;
    SENDGRID_API_KEY?: string | undefined;
};
export type Config = typeof config;
//# sourceMappingURL=index.d.ts.map