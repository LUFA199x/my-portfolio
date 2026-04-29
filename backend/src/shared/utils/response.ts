import { Response } from 'express'

// ─────────────────────────────────────────────────────────
// Typed response envelope
// ─────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  meta?: PaginationMeta
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// ─────────────────────────────────────────────────────────
// Response builders
// ─────────────────────────────────────────────────────────
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200,
  meta?: PaginationMeta
): void => {
  const body: ApiResponse<T> = { success: true }
  if (message) body.message = message
  if (data !== undefined) body.data = data
  if (meta) body.meta = meta

  res.status(statusCode).json(body)
}

export const sendCreated = <T>(res: Response, data: T, message?: string): void => {
  sendSuccess(res, data, message ?? 'Created successfully', 201)
}

export const sendNoContent = (res: Response): void => {
  res.status(204).send()
}

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  details?: unknown
): void => {
  const body: ApiResponse = {
    success: false,
    error: { code, message },
  }
  if (details) body.error!.details = details

  res.status(statusCode).json(body)
}

// ─────────────────────────────────────────────────────────
// Pagination builder
// ─────────────────────────────────────────────────────────
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  return {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

export function parsePagination(query: Record<string, string | undefined>) {
  const page = Math.max(1, parseInt(query.page ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '10', 10)))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}
