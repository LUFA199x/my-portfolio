'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import type { AdminUser } from '@/lib/admin-types'

// ─── AdminUser Context ────────────────────────────────────────────────────────

export const AdminUserContext = createContext<AdminUser | null>(null)
export const useAdminUser = () => useContext(AdminUserContext)

// ─── Toast System ─────────────────────────────────────────────────────────────

interface Toast { id: string; message: string; type: 'success' | 'error' | 'info' }
interface ToastCtx { toast: (message: string, type?: Toast['type']) => void }

export const ToastContext = createContext<ToastCtx>({ toast: () => {} })
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])

  const colors: Record<Toast['type'], string> = {
    success: '#16a34a',
    error: '#dc2626',
    info: '#2563eb',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: '#1a1a1a',
              border: `1px solid ${colors[t.type]}40`,
              borderLeft: `3px solid ${colors[t.type]}`,
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 13,
              color: 'white',
              minWidth: 260,
              maxWidth: 380,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <span style={{ color: colors[t.type], flexShrink: 0 }}>
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Spinner ─────────────────────────────────────────────────────────────────

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="animate-spin"
      style={{ opacity: 0.5 }}
    >
      <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
      <path d="M21 12a9 9 0 0 1-9 9" />
    </svg>
  )
}

// ─── Page Loading ─────────────────────────────────────────────────────────────

export function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
      <Spinner size={28} />
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const badgeColors: Record<string, { bg: string; color: string; border: string }> = {
  PENDING:     { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  READ:        { bg: 'rgba(59,130,246,0.1)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  REPLIED:     { bg: 'rgba(22,163,74,0.1)',   color: '#4ade80', border: 'rgba(22,163,74,0.25)'  },
  ARCHIVED:    { bg: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: 'rgba(107,114,128,0.25)'},
  ACTIVE:      { bg: 'rgba(22,163,74,0.1)',   color: '#4ade80', border: 'rgba(22,163,74,0.25)'  },
  UNSUBSCRIBED:{ bg: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: 'rgba(107,114,128,0.25)'},
  ADMIN:       { bg: 'rgba(59,130,246,0.1)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  SUPER_ADMIN: { bg: 'rgba(232,76,13,0.1)',   color: '#E84C0D', border: 'rgba(232,76,13,0.25)'  },
  published:   { bg: 'rgba(22,163,74,0.1)',   color: '#4ade80', border: 'rgba(22,163,74,0.25)'  },
  draft:       { bg: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: 'rgba(107,114,128,0.25)'},
  featured:    { bg: 'rgba(232,76,13,0.1)',   color: '#E84C0D', border: 'rgba(232,76,13,0.25)'  },
  active:      { bg: 'rgba(22,163,74,0.1)',   color: '#4ade80', border: 'rgba(22,163,74,0.25)'  },
  inactive:    { bg: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: 'rgba(107,114,128,0.25)'},
}

export function Badge({ label }: { label: string }) {
  const c = badgeColors[label] ?? { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)' }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 9px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.03em',
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {label.replace(/_/g, ' ')}
    </span>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: number
}

export function Modal({ open, onClose, title, children, maxWidth = 520 }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          background: '#141414',
          border: '1px solid #242424',
          borderRadius: 16,
          width: '100%',
          maxWidth,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #1e1e1e' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'white', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4, borderRadius: 6, lineHeight: 1 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

export function ConfirmModal({
  open, onClose, onConfirm, title, message, confirmLabel = 'Delete', loading = false,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={400}>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={btnStyles.ghost}>Cancel</button>
        <button onClick={onConfirm} disabled={loading} style={btnStyles.danger}>
          {loading ? <Spinner size={14} /> : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: 12, textAlign: 'center' }}>
      {icon && <div style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 4 }}>{icon}</div>}
      <p style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{title}</p>
      {description && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{description}</p>}
      {action && <div style={{ marginTop: 8 }}>{action}</div>}
    </div>
  )
}

// ─── Form Field ───────────────────────────────────────────────────────────────

export function Field({
  label, error, required, children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
        {label}{required && <span style={{ color: '#E84C0D', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
    </div>
  )
}

// ─── Input / Textarea / Select styles ────────────────────────────────────────

export const inputStyle: React.CSSProperties = {
  background: '#0d0d0d',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 14,
  color: 'white',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s',
}

export const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
}

// ─── Shared button styles ─────────────────────────────────────────────────────

export const btnStyles = {
  primary: {
    background: '#E84C0D',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'opacity 0.15s',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  ghost: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.55)',
    border: '1px solid #2a2a2a',
    borderRadius: 8,
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 400,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'border-color 0.15s, color 0.15s',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  danger: {
    background: 'rgba(220,38,38,0.12)',
    color: '#f87171',
    border: '1px solid rgba(220,38,38,0.3)',
    borderRadius: 8,
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'opacity 0.15s',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  icon: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    borderRadius: 6,
    color: 'rgba(255,255,255,0.4)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s, background 0.15s',
  } as React.CSSProperties,
}

// ─── Table helpers ─────────────────────────────────────────────────────────────

export const tableStyles = {
  wrapper: {
    background: '#141414',
    border: '1px solid #1e1e1e',
    borderRadius: 12,
    overflow: 'hidden',
  } as React.CSSProperties,
  th: {
    padding: '11px 16px',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.07em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'left' as const,
    background: '#111111',
    borderBottom: '1px solid #1e1e1e',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  td: {
    padding: '13px 16px',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    borderBottom: '1px solid #1a1a1a',
    verticalAlign: 'middle' as const,
  } as React.CSSProperties,
  tdLast: {
    padding: '13px 16px',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    verticalAlign: 'middle' as const,
  } as React.CSSProperties,
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

export function Toggle({
  checked, onChange, disabled,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        background: checked ? '#E84C0D' : '#2a2a2a',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 19 : 3,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.2s',
        }}
      />
    </button>
  )
}

// ─── Pagination ────────────────────────────────────────────────────────────────

export function Pagination({ page, totalPages, onChange }: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', padding: '16px 0 4px' }}>
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        style={{ ...btnStyles.ghost, padding: '6px 12px', fontSize: 12, opacity: page <= 1 ? 0.4 : 1 }}
      >
        ← Prev
      </button>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: '0 8px' }}>
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        style={{ ...btnStyles.ghost, padding: '6px 12px', fontSize: 12, opacity: page >= totalPages ? 0.4 : 1 }}
      >
        Next →
      </button>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #1e1e1e',
        borderRadius: 12,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

export function StatCard({
  label, value, sub, accent, icon,
}: {
  label: string
  value: number | string
  sub?: string
  accent?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: 0 }}>{label}</p>
        {icon && <span style={{ color: 'rgba(255,255,255,0.2)' }}>{icon}</span>}
      </div>
      <p style={{ fontSize: 28, fontWeight: 600, color: accent ? '#E84C0D' : 'white', margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '6px 0 0' }}>{sub}</p>}
    </div>
  )
}
