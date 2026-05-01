'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { authStorage, api } from '@/lib/api'
import type { Project } from '@/lib/admin-types'
import { Field, inputStyle, selectStyle, btnStyles, Spinner, PageLoader, useToast } from '../../../_components'

const CATEGORIES = ['Wedding', 'Portrait', 'Event', 'Commercial', 'Nature', 'Street', 'Other']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR - i))

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [projectDbId, setProjectDbId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    title: '', category: '', year: '', summary: '', description: '',
    coverImage: '', tags: '', featured: false, published: true, order: '0',
  })

  useEffect(() => {
    const token = authStorage.getAccessToken() ?? undefined
    api.get<Project>(`/projects/${params.id}`, token).then((res) => {
      if (res.success && res.data) {
        const p = res.data
        setProject(p)
        setProjectDbId(p.id)
        setForm({
          title: p.title, category: p.category, year: p.year,
          summary: p.summary, description: p.description ?? '',
          coverImage: p.coverImage, tags: p.tags.join(', '),
          featured: p.featured, published: p.published,
          order: String(p.order),
        })
      }
      setLoading(false)
    })
  }, [params.id])

  const set = (k: string, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.category) e.category = 'Category is required'
    if (!form.summary.trim()) e.summary = 'Summary is required'
    if (!form.coverImage.trim()) e.coverImage = 'Cover image URL is required'
    if (form.coverImage) {
      try { new URL(form.coverImage) } catch { e.coverImage = 'Must be a valid URL' }
    }
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.patch(`/projects/${projectDbId}`, {
      title: form.title.trim(),
      category: form.category,
      year: form.year,
      summary: form.summary.trim(),
      description: form.description.trim() || null,
      coverImage: form.coverImage.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      featured: form.featured,
      published: form.published,
      order: parseInt(form.order, 10) || 0,
    }, token)
    setSaving(false)

    if (res.success) {
      toast('Project updated')
      router.push('/admin/projects')
    } else {
      toast(res.error?.message ?? 'Failed to update project', 'error')
    }
  }

  if (loading) return <PageLoader />
  if (!project) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
      Project not found. <Link href="/admin/projects" style={{ color: '#E84C0D' }}>Go back</Link>
    </div>
  )

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link href="/admin/projects" style={{ ...btnStyles.ghost, padding: '7px 12px' }}>← Back</Link>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: 0 }}>Edit project</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>{project.slug}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field label="Title" required error={errors.title}>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} style={inputStyle} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Category" required error={errors.category}>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} style={selectStyle}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Year" required error={errors.year}>
              <select value={form.year} onChange={(e) => set('year', e.target.value)} style={selectStyle}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Summary" required error={errors.summary}>
            <textarea
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
              maxLength={500}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={5}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
            />
          </Field>

          <Field label="Cover image URL" required error={errors.coverImage}>
            <input value={form.coverImage} onChange={(e) => set('coverImage', e.target.value)} style={inputStyle} />
          </Field>

          <Field label="Tags (comma-separated)" error={errors.tags}>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} style={inputStyle} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Display order" error={errors.order}>
              <input
                type="number"
                value={form.order}
                onChange={(e) => set('order', e.target.value)}
                min={0}
                style={inputStyle}
              />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set('published', e.target.checked)}
                style={{ accentColor: '#E84C0D', width: 15, height: 15 }}
              />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Published</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                style={{ accentColor: '#E84C0D', width: 15, height: 15 }}
              />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Featured</span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            <button type="submit" disabled={saving} style={{ ...btnStyles.primary, opacity: saving ? 0.7 : 1 }}>
              {saving ? <><Spinner size={14} /> Saving…</> : 'Save changes'}
            </button>
            <Link href="/admin/projects" style={btnStyles.ghost}>Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  )
}
