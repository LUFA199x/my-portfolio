import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError } from 'zod'
import { ValidationError } from '../shared/errors/AppError'

// ─────────────────────────────────────────────────────────
// Validates req.body / req.query / req.params against schema
// ─────────────────────────────────────────────────────────
export function validate(schema: AnyZodObject) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })

      // Overwrite with sanitised/coerced values
      req.body = parsed.body ?? req.body
      req.query = parsed.query ?? req.query
      req.params = parsed.params ?? req.params

      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map((e) => ({
          field: e.path.slice(1).join('.'), // strip leading 'body' / 'query'
          message: e.message,
        }))
        next(new ValidationError('Validation failed', details))
      } else {
        next(err)
      }
    }
  }
}
