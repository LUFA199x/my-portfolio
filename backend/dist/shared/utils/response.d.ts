import { Response } from 'express';
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    meta?: PaginationMeta;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: number, meta?: PaginationMeta) => void;
export declare const sendCreated: <T>(res: Response, data: T, message?: string) => void;
export declare const sendNoContent: (res: Response) => void;
export declare const sendError: (res: Response, message: string, statusCode?: number, code?: string, details?: unknown) => void;
export declare function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta;
export declare function parsePagination(query: Record<string, string | undefined>): {
    page: number;
    limit: number;
    skip: number;
};
//# sourceMappingURL=response.d.ts.map