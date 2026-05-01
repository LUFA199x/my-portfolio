'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { authStorage, api } from '@/lib/api'
import type { Inquiry, InquiryStatus } from '@/lib/admin-types'
import { PageLoader, EmptyState, Badge, btnStyles, tableStyles, Pagination, useToast } from '../_components'

const STATUSES: Array<{ value: 'all' | InquiryStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'READ', label: 'Read' },
  { value: 'REPLIED', label: 'Replied' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export default function InquiriesPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Inquiry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'all' | InquiryStatus>('all')

  const limit = 20

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const token = authStorage.getAccessToken() ?? undefined
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (status !== 'all') params.set('status', status)
    const res = await api.get<Inquiry[]>(`/contact?${params}`, token)
    if (res.success && res.data) {
      setItems(Array.isArray(res.data) ? res.data : [])
      setTotal(res.meta?.total ?? 0)
    }
    setLoading(false)
  }, [page, status])

  useEffect(() => { fetchItems() }, [fetchItems])

  const updateStatus = async (id: string, newStatus: InquiryStatus) => {
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.patch(`/contact/${id}`, { status: newStatus }, token)
    if (res.success) {
      setItems((arr) => arr.map((x) => x.id === id ? { ...x, status: newStatus } : x))
      toast('Status updated')
    } else {
      toast('Failed to update status', 'error')
    }
  }

  const totalPages = Math.ceil(total / limit)

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>Inquiries</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{total} total messages</p>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #1e1e1e', paddingBottom: 0 }}>
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatus(s.value); setPage(1) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 14px', fontSize: 13,
              color: status === s.value ? 'white' : 'rgba(255,255,255,0.4)',
              borderBottom: status === s.value ? '2px solid #E84C0D' : '2px solid transparent',
              marginBottom: -1, transition: 'color 0.15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState title="No inquiries found" description="New contact form submissions will appear here." />
      ) : (
        <>
          <div style={tableStyles.wrapper}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableStyles.th}>From</th>
                  <th style={tableStyles.th}>Location</th>
                  <th style={tableStyles.th}>Message</th>
                  <th style={tableStyles.th}>Status</th>
                  <th style={tableStyles.th}>Date</th>
                  <th style={{ ...tableStyles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={tableStyles.td}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: 'white', margin: '0 0 1px' }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{item.email}</p>
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{item.location ?? '—'}</span>
                    </td>
                    <td style={tableStyles.td}>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.message}
                      </p>
                    </td>
                    <td style={tableStyles.td}>
                      <Badge label={item.status} />
                    </td>
                    <td style={tableStyles.td}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatDate(item.createdAt)}</span>
                    </td>
                    <td style={tableStyles.tdLast}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Link
                          href={`/admin/inquiries/${item.id}`}
                          style={{ ...btnStyles.ghost, padding: '5px 12px', fontSize: 12 }}
                        >
                          View
                        </Link>
                        {item.status === 'PENDING' && (
                          <button
                            onClick={() => updateStatus(item.id, 'READ')}
                            style={{ ...btnStyles.ghost, padding: '5px 12px', fontSize: 12 }}
                          >
                            Mark read
                          </button>
                        )}
                        {item.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => updateStatus(item.id, 'ARCHIVED')}
                            style={{ ...btnStyles.icon, fontSize: 12, padding: '5px 8px', color: 'rgba(255,255,255,0.3)' }}
                            title="Archive"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
                              <line x1="10" y1="12" x2="14" y2="12"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
