'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStorage } from '@/lib/api'

export default function AdminLoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authStorage.getAccessToken()) {
      router.replace('/admin')
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email || !form.password) return

    setLoading(true)
    setError(null)

    const base = process.env.NEXT_PUBLIC_API_URL
    if (!base) {
      setError('API URL is not configured.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (data.success && data.data?.tokens) {
        authStorage.setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken)
        router.replace('/admin')
      } else {
        setError(data.error?.message ?? 'Invalid email or password.')
      }
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--black)] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-white text-3xl mb-2" style={{ fontStyle: 'italic' }}>
            Admin
          </h1>
          <p className="text-white/40 text-sm">ARHDAY Photography</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-8 flex flex-col gap-5"
          style={{ border: '1px solid #222', background: '#111' }}
        >
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@arhday.com"
              required
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="form-input w-full"
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: '#ff4444' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !form.email || !form.password}
            className="w-full py-3 rounded-xl text-white text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--orange)', border: 'none' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeOpacity="0.3" />
                  <path d="M21 12a9 9 0 0 1-9 9" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
