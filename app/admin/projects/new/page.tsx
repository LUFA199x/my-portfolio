'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authStorage, api } from '@/lib/api'
import { Field, inputStyle, selectStyle, btnStyles, Spinner, useToast } from '../../_components'

interface FormState {
  title: string
  category: string
  year: string
  summary: string
  description: string
  coverImage: string
  tags: string
  featured: boolean
  published: boolean
  order: string
}

const CATEGORIES = ['Wedding', 'Portrait', 'Event', 'Commercial', 'Nature', 'Street', 'Other']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR - i))

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [form, setForm] = useState<FormState>({
    title: '', category: '', year: String(CURRENT_YEAR),
    summary: '', description: '', coverImage: '',
    tags: '', featured: false, published: true, order: '0',
  })

  const set = (k: keyof FormState, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = () => {
    const e: typeof errors = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.category) e.category = 'Category is required'
    if (!form.year) e.year = 'Year is required'
    if (!form.summary.trim()) e.summary = 'Summary is required'
    if (!form.coverImage.trim()) e.coverImage = 'Cover image URL is required'
    if (form.coverImage && !isValidUrl(form.coverImage)) e.coverImage = 'Must be a valid URL'
    return e
  }

  const isValidUrl = (url: string) => {
    try { new URL(url); return true } catch { return false }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    const token = authStorage.getAccessToken() ?? undefined
    const payload = {
      title: form.title.trim(),
      category: form.category,
      year: form.year,
      summary: form.summary.trim(),
      description: form.description.trim() || undefined,
      coverImage: form.coverImage.trim(),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      featured: form.featured,
      published: form.published,
      order: parseInt(form.order, 10) || 0,
    }

    const res = await api.post('/projects', payload, token)
    setSaving(false)

    if (res.success) {
      toast('Project created successfully')
      router.push('/admin/projects')
    } else {
      toast(res.error?.message ?? 'Failed to create project', 'error')
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link href="/admin/projects" style={{ ...btnStyles.ghost, padding: '7px 12px' }}>← Back</Link>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: 0 }}>New project</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field label="Title" required error={errors.title}>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Sarah & Michael Wedding"
              style={inputStyle}
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Category" required error={errors.category}>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                style={selectStyle}
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Year" required error={errors.year}>
              <select
                value={form.year}
                onChange={(e) => set('year', e.target.value)}
                style={selectStyle}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Summary" required error={errors.summary}>
            <textarea
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
              placeholder="Short description (max 500 chars)"
              maxLength={500}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Detailed description (optional)"
              rows={5}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
            />
          </Field>

          <Field label="Cover image URL" required error={errors.coverImage}>
            <input
              value={form.coverImage}
              onChange={(e) => set('coverImage', e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              style={inputStyle}
            />
          </Field>

          <Field label="Tags" error={errors.tags}>
            <input
              value={form.tags}
              onChange={(e) => set('tags', e.target.value)}
              placeholder="wedding, outdoor, golden hour (comma-separated)"
              style={inputStyle}
            />
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
              {saving ? <><Spinner size={14} /> Saving…</> : 'Create project'}
            </button>
            <Link href="/admin/projects" style={btnStyles.ghost}>Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  )
}
