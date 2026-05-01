'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { authStorage, api } from '@/lib/api'
import type { Inquiry, InquiryStatus } from '@/lib/admin-types'
import { PageLoader, Badge, btnStyles, Spinner, inputStyle, useToast } from '../../_components'

const STATUSES: InquiryStatus[] = ['PENDING', 'READ', 'REPLIED', 'ARCHIVED']

export default function InquiryDetailPage() {
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<InquiryStatus>('PENDING')

  useEffect(() => {
    const token = authStorage.getAccessToken() ?? undefined
    api.get<Inquiry>(`/contact/${params.id}`, token).then((res) => {
      if (res.success && res.data) {
        setInquiry(res.data)
        setNotes(res.data.notes ?? '')
        setStatus(res.data.status)
        // Auto-mark as read
        if (res.data.status === 'PENDING') {
          api.patch(`/contact/${params.id}`, { status: 'READ' }, token)
          setStatus('READ')
          setInquiry((i) => i ? { ...i, status: 'READ' } : i)
        }
      }
      setLoading(false)
    })
  }, [params.id])

  const save = async () => {
    setSaving(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.patch(`/contact/${params.id}`, { status, notes }, token)
    setSaving(false)
    if (res.success) {
      toast('Inquiry updated')
      setInquiry((i) => i ? { ...i, status, notes } : i)
    } else {
      toast('Failed to save', 'error')
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    })

  if (loading) return <PageLoader />
  if (!inquiry) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
      Inquiry not found. <Link href="/admin/inquiries" style={{ color: '#E84C0D' }}>Go back</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link href="/admin/inquiries" style={{ ...btnStyles.ghost, padding: '7px 12px' }}>← Back</Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'white', margin: 0 }}>
              {inquiry.name}
            </h1>
            <Badge label={inquiry.status} />
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '3px 0 0' }}>
            {formatDate(inquiry.createdAt)}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Contact info */}
        <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 16px' }}>
            Contact details
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Name', value: inquiry.name },
              { label: 'Email', value: inquiry.email },
              { label: 'Location', value: inquiry.location ?? '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                <p style={{ fontSize: 13, color: 'white', margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 14px' }}>
            Message
          </p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {inquiry.message}
          </p>
        </div>

        {/* Status + Notes */}
        <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 16px' }}>
            Management
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' }}>Status</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    style={{
                      padding: '5px 14px', borderRadius: 20, fontSize: 12,
                      border: `1px solid ${status === s ? '#E84C0D' : '#2a2a2a'}`,
                      background: status === s ? 'rgba(232,76,13,0.12)' : 'transparent',
                      color: status === s ? '#E84C0D' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px' }}>Internal notes</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add notes for yourself (not visible to the client)…"
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={save} disabled={saving} style={{ ...btnStyles.primary, opacity: saving ? 0.7 : 1 }}>
                {saving ? <><Spinner size={14} /> Saving…</> : 'Save changes'}
              </button>
              <a
                href={`mailto:${inquiry.email}?subject=Re: Your photography inquiry`}
                style={btnStyles.ghost}
              >
                Reply via email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
