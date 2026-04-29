"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
const index_1 = require("./index");
const logger_1 = require("../shared/utils/logger");
function createPrismaClient() {
    return new client_1.PrismaClient({
        log: index_1.config.NODE_ENV === 'development'
            ? [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'error' },
                { emit: 'event', level: 'warn' },
            ]
            : [{ emit: 'event', level: 'error' }],
    });
}
exports.prisma = globalThis.__prisma ?? createPrismaClient();
if (index_1.config.NODE_ENV === 'development') {
    globalThis.__prisma = exports.prisma;
    // Log slow queries in development
    exports.prisma.$on('query', (e) => {
        if (e.duration > 100) {
            logger_1.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
    });
    exports.prisma.$on('error', (e) => {
        logger_1.logger.error(`Prisma error: ${e.message}`);
    });
}
async function connectDatabase() {
    await exports.prisma.$connect();
    logger_1.logger.info('✅ Database connected');
}
async function disconnectDatabase() {
    await exports.prisma.$disconnect();
    logger_1.logger.info('Database disconnected');
}
//# sourceMappingURL=database.js.map