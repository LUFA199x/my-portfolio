"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const { combine, timestamp, printf, colorize, errors, json } = winston_1.default.format;
const LOG_DIR = process.env.LOG_DIR || 'logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const IS_PROD = process.env.NODE_ENV === 'production';
// ─────────────────────────────────────────────────────────
// Formats
// ─────────────────────────────────────────────────────────
const devFormat = combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}] ${stack || message}${metaStr}`;
}));
const prodFormat = combine(timestamp(), errors({ stack: true }), json());
// ─────────────────────────────────────────────────────────
// Transports
// ─────────────────────────────────────────────────────────
const transports = [
    new winston_1.default.transports.Console({
        format: IS_PROD ? prodFormat : devFormat,
    }),
];
if (IS_PROD) {
    transports.push(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join(LOG_DIR, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        maxSize: '20m',
        maxFiles: '14d',
        format: prodFormat,
    }), new winston_daily_rotate_file_1.default({
        filename: path_1.default.join(LOG_DIR, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '7d',
        format: prodFormat,
    }));
}
exports.logger = winston_1.default.createLogger({
    level: LOG_LEVEL,
    transports,
    exitOnError: false,
});
//# sourceMappingURL=logger.js.map