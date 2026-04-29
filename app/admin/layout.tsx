'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authStorage, api } from '@/lib/api'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setVerified(true)
      return
    }

    const token = authStorage.getAccessToken()
    if (!token) {
      router.replace('/admin/login')
      return
    }

    api.get('/auth/me', token).then((data) => {
      if (data.success) {
        setVerified(true)
      } else {
        authStorage.clear()
        router.replace('/admin/login')
      }
    }).catch(() => {
      authStorage.clear()
      router.replace('/admin/login')
    })
  }, [router, pathname])

  const handleLogout = async () => {
    const refreshToken = authStorage.getRefreshToken()
    if (refreshToken) {
      const base = process.env.NEXT_PUBLIC_API_URL
      if (base) {
        await fetch(`${base}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {})
      }
    }
    authStorage.clear()
    router.replace('/admin/login')
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-[var(--black)] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[var(--orange)] animate-spin" />
      </div>
    )
  }

  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <div
        className="fixed top-0 left-0 h-full w-56 flex flex-col py-8 px-5"
        style={{ borderRight: '1px solid #1a1a1a', background: '#0d0d0d' }}
      >
        <div className="mb-10">
          <h1 className="font-display text-white text-lg" style={{ fontStyle: 'italic' }}>ARHDAY</h1>
          <p className="text-white/30 text-xs mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Projects', href: '/admin/projects' },
            { label: 'Testimonials', href: '/admin/testimonials' },
            { label: 'Services', href: '/admin/services' },
            { label: 'Inquiries', href: '/admin/inquiries' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                color: pathname === item.href ? 'var(--orange)' : 'rgba(255,255,255,0.5)',
                background: pathname === item.href ? 'rgba(232,76,13,0.1)' : 'transparent',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="text-left px-3 py-2 text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Main content */}
      <div className="ml-56 p-8">{children}</div>
    </div>
  )
}
