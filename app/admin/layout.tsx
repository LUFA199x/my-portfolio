'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authStorage, api } from '@/lib/api'
import type { AdminUser } from '@/lib/admin-types'
import { AdminUserContext, ToastProvider } from './_components'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const Icons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Projects: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  Testimonials: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Services: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ),
  Inquiries: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Subscribers: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Users: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  SignOut: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
}

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    label: 'Content',
    items: [
      { label: 'Dashboard',    href: '/admin',               Icon: Icons.Dashboard },
      { label: 'Projects',     href: '/admin/projects',      Icon: Icons.Projects  },
      { label: 'Testimonials', href: '/admin/testimonials',  Icon: Icons.Testimonials },
      { label: 'Services',     href: '/admin/services',      Icon: Icons.Services  },
    ],
  },
  {
    label: 'Engagement',
    items: [
      { label: 'Inquiries',    href: '/admin/inquiries',     Icon: Icons.Inquiries    },
      { label: 'Subscribers',  href: '/admin/subscribers',   Icon: Icons.Subscribers  },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Settings',     href: '/admin/settings',      Icon: Icons.Settings },
      { label: 'Users',        href: '/admin/users',         Icon: Icons.Users    },
    ],
  },
]

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ user, pathname, onLogout, onClose }: {
  user: AdminUser | null
  pathname: string
  onLogout: () => void
  onClose?: () => void
}) {
  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  return (
    <div
      style={{
        width: 240,
        minHeight: '100vh',
        background: '#0d0d0d',
        borderRight: '1px solid #181818',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 0',
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div style={{ padding: '4px 20px 20px', borderBottom: '1px solid #181818' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 18, fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.2 }}>
              ARHDAY
            </h1>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '3px 0 0' }}>
              Admin Portal
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
              <Icons.X />
            </button>
          )}
        </div>

        {/* User chip */}
        {user && (
          <div style={{ marginTop: 16, padding: '10px 12px', background: '#161616', borderRadius: 10, border: '1px solid #222' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'rgba(232,76,13,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 600, color: '#E84C0D', flexShrink: 0,
              }}>
                {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.85)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || user.email}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: '1px 0 0', letterSpacing: '0.04em' }}>
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', padding: '0 8px', margin: '0 0 6px' }}>
              {section.label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {section.items.map(({ label, href, Icon }) => {
                const active = isActive(href)
                return (
                  <a
                    key={href}
                    href={href}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: active ? 500 : 400,
                      color: active ? '#E84C0D' : 'rgba(255,255,255,0.5)',
                      background: active ? 'rgba(232,76,13,0.08)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'color 0.15s, background 0.15s',
                      borderLeft: active ? '2px solid #E84C0D' : '2px solid transparent',
                    }}
                  >
                    <Icon />
                    {label}
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '16px 12px 4px', borderTop: '1px solid #181818' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 8,
            fontSize: 13,
            color: 'rgba(255,255,255,0.35)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
        >
          <Icons.SignOut />
          Sign out
        </button>
      </div>
    </div>
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [verified, setVerified] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = useCallback(async () => {
    const refreshToken = authStorage.getRefreshToken()
    const base = process.env.NEXT_PUBLIC_API_URL
    if (refreshToken && base) {
      await fetch(`${base}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {})
    }
    authStorage.clear()
    router.replace('/admin/login')
  }, [router])

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

    api.get<AdminUser>('/auth/me', token).then((res) => {
      if (res.success && res.data) {
        setUser(res.data)
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

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  if (!verified) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#E84C0D', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (pathname === '/admin/login') {
    return <ToastProvider>{children}</ToastProvider>
  }

  return (
    <AdminUserContext.Provider value={user}>
      <ToastProvider>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: 'white' }}>
          {/* Desktop sidebar */}
          <div style={{ display: 'none' }} className="admin-sidebar-desktop">
            <Sidebar user={user} pathname={pathname} onLogout={handleLogout} />
          </div>

          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40, backdropFilter: 'blur(2px)' }}
            />
          )}

          {/* Mobile sidebar */}
          <div
            style={{
              position: 'fixed',
              top: 0, left: 0, bottom: 0,
              zIndex: 50,
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.25s ease',
            }}
            className="admin-sidebar-mobile"
          >
            <Sidebar user={user} pathname={pathname} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Persistent desktop sidebar (hidden on mobile via CSS) */}
          <div className="admin-sidebar-static">
            <Sidebar user={user} pathname={pathname} onLogout={handleLogout} />
          </div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Mobile topbar */}
            <div className="admin-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #181818', background: '#0d0d0d' }}>
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}
              >
                <Icons.Menu />
              </button>
              <span style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 16, fontWeight: 700, color: 'white' }}>ARHDAY</span>
              <div style={{ width: 28 }} />
            </div>

            <main style={{ flex: 1, padding: '36px 40px', maxWidth: 1280, width: '100%' }} className="admin-main">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </AdminUserContext.Provider>
  )
}
