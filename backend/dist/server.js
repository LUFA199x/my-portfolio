"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const logger_1 = require("./shared/utils/logger");
let server;
// ─────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────
async function start() {
    try {
        await (0, database_1.connectDatabase)();
        (0, redis_1.getRedisClient)(); // initialise Redis connection
        server = app_1.default.listen(config_1.config.PORT, () => {
            logger_1.logger.info(`
  ┌──────────────────────────────────────────┐
  │  🚀  ARHDAY API                          │
  │  Env:    ${config_1.config.NODE_ENV.padEnd(32)}│
  │  Port:   ${String(config_1.config.PORT).padEnd(32)}│
  │  API:    /api/${config_1.config.API_VERSION.padEnd(29)}│
  └──────────────────────────────────────────┘
      `);
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                logger_1.logger.error(`Port ${config_1.config.PORT} is already in use`);
            }
            else {
                logger_1.logger.error('Server error:', err);
            }
            process.exit(1);
        });
    }
    catch (err) {
        logger_1.logger.error('Failed to start server:', err);
        process.exit(1);
    }
}
// ─────────────────────────────────────────────────────────
// Graceful shutdown — finish in-flight requests before exiting
// ─────────────────────────────────────────────────────────
async function shutdown(signal) {
    logger_1.logger.info(`${signal} received — shutting down gracefully`);
    server?.close(async () => {
        logger_1.logger.info('HTTP server closed');
        await (0, database_1.disconnectDatabase)();
        logger_1.logger.info('Shutdown complete');
        process.exit(0);
    });
    // Force exit after 10s if graceful shutdown hangs
    setTimeout(() => {
        logger_1.logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10_000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
// Catch unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    logger_1.logger.error('Unhandled rejection:', reason);
});
process.on('uncaughtException', (err) => {
    logger_1.logger.error('Uncaught exception:', err);
    process.exit(1);
});
start();
//# sourceMappingURL=server.js.map