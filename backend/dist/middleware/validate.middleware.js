"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
const AppError_1 = require("../shared/errors/AppError");
// ─────────────────────────────────────────────────────────
// Validates req.body / req.query / req.params against schema
// ─────────────────────────────────────────────────────────
function validate(schema) {
    return async (req, _res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Overwrite with sanitised/coerced values
            req.body = parsed.body ?? req.body;
            req.query = parsed.query ?? req.query;
            req.params = parsed.params ?? req.params;
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const details = err.errors.map((e) => ({
                    field: e.path.slice(1).join('.'), // strip leading 'body' / 'query'
                    message: e.message,
                }));
                next(new AppError_1.ValidationError('Validation failed', details));
            }
            else {
                next(err);
            }
        }
    };
}
//# sourceMappingURL=validate.middleware.js.map