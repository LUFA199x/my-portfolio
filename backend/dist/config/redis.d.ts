import Redis from 'ioredis';
export declare function getRedisClient(): Redis;
export declare const cache: {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
};
export declare const CACHE_KEYS: {
    readonly projects: "projects:all";
    readonly project: (slug: string) => string;
    readonly testimonials: "testimonials:all";
    readonly services: "services:all";
    readonly settings: "settings:all";
};
//# sourceMappingURL=redis.d.ts.map