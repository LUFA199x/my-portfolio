"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors"); // must be first — patches express to forward async errors
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const logger_1 = require("./shared/utils/logger");
// Route modules
const auth_routes_1 = require("./modules/auth/auth.routes");
const projects_routes_1 = require("./modules/projects/projects.routes");
const contact_routes_1 = require("./modules/contact/contact.routes");
const testimonials_routes_1 = require("./modules/testimonials/testimonials.routes");
const services_routes_1 = require("./modules/services/services.routes");
const subscribers_routes_1 = require("./modules/subscribers/subscribers.routes");
const uploads_routes_1 = require("./modules/uploads/uploads.routes");
const app = (0, express_1.default)();
// ─────────────────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // handled by Next.js frontend
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowed = config_1.config.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
        if (!origin || allowed.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// ─────────────────────────────────────────────────────────
// General Middleware
// ─────────────────────────────────────────────────────────
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '2mb' }));
// HTTP request logging
app.use((0, morgan_1.default)(config_1.config.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger_1.logger.http(msg.trim()) },
    skip: (req) => req.url === '/health',
}));
// Global rate limiting
app.use(rateLimit_middleware_1.defaultLimiter);
// ─────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        env: config_1.config.NODE_ENV,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? '1.0.0',
    });
});
// ─────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────
const API = `/api/${config_1.config.API_VERSION}`;
app.use(`${API}/auth`, auth_routes_1.authRouter);
app.use(`${API}/projects`, projects_routes_1.projectsRouter);
app.use(`${API}/contact`, contact_routes_1.contactRouter);
app.use(`${API}/testimonials`, testimonials_routes_1.testimonialsRouter);
app.use(`${API}/services`, services_routes_1.servicesRouter);
app.use(`${API}/subscribers`, subscribers_routes_1.subscribersRouter);
app.use(`${API}/uploads`, uploads_routes_1.uploadsRouter);
// ─────────────────────────────────────────────────────────
// Error Handling (must be last)
// ─────────────────────────────────────────────────────────
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map