const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  error?: { code: string; message: string; details?: unknown }
}

async function apiFetch<T>(path: string, init: RequestInit = {}, token?: string): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  }
  try {
    const res = await fetch(`${BASE}${path}`, { ...init, headers })
    return res.json() as Promise<ApiResponse<T>>
  } catch {
    return { success: false, error: { code: 'NETWORK_ERROR', message: 'Network error' } }
  }
}

export const api = {
  get: <T>(path: string, token?: string) =>
    apiFetch<T>(path, { method: 'GET' }, token),
  post: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }, token),
  patch: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token),
  del: <T>(path: string, token?: string) =>
    apiFetch<T>(path, { method: 'DELETE' }, token),
}

// ─── Auth helpers (localStorage — admin only) ───────────────────────────────
export const authStorage = {
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  },
  getAccessToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  },
  getRefreshToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
  },
  clear() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  },
}
