'use client'

import { useEffect, useState, useCallback } from 'react'
import { authStorage, api } from '@/lib/api'
import type { SiteSetting } from '@/lib/admin-types'
import { PageLoader, EmptyState, Field, inputStyle, btnStyles, Spinner, Card, useToast } from '../_components'

type SettingMap = Record<string, string>

const SETTING_GROUPS: Array<{ label: string; keys: string[]; descriptions?: Record<string, string> }> = [
  {
    label: 'Profile',
    keys: ['site_name', 'site_tagline', 'owner_name', 'owner_email', 'owner_phone', 'owner_location'],
    descriptions: {
      site_name: 'Your brand or business name',
      site_tagline: 'Short tagline shown on the homepage',
      owner_email: 'Contact email for inquiries',
    },
  },
  {
    label: 'Social media',
    keys: ['instagram_url', 'twitter_url', 'facebook_url', 'youtube_url', 'whatsapp_number'],
  },
  {
    label: 'SEO',
    keys: ['meta_title', 'meta_description', 'og_image_url'],
    descriptions: {
      meta_title: 'Page title for search engines (max 60 chars)',
      meta_description: 'Description for search engines (max 160 chars)',
    },
  },
]

const formatKey = (key: string) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const isLongValue = (key: string) =>
  key.includes('description') || key.includes('tagline')

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [values, setValues] = useState<SettingMap>({})
  const [original, setOriginal] = useState<SettingMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.get<SiteSetting[]>('/settings', token)
    if (res.success && Array.isArray(res.data)) {
      setSettings(res.data)
      const map: SettingMap = {}
      res.data.forEach((s) => { map[s.key] = s.value })
      setValues(map)
      setOriginal(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const changed = Object.keys(values).some((k) => values[k] !== original[k])

  const handleSave = async () => {
    const dirty = Object.entries(values)
      .filter(([k, v]) => v !== original[k])
      .map(([key, value]) => ({ key, value }))

    if (!dirty.length) return

    setSaving(true)
    const token = authStorage.getAccessToken() ?? undefined
    const res = await api.patch('/settings/batch', { settings: dirty }, token)
    setSaving(false)

    if (res.success) {
      toast('Settings saved')
      setOriginal({ ...values })
    } else {
      toast(res.error?.message ?? 'Failed to save settings', 'error')
    }
  }

  const allKeys = SETTING_GROUPS.flatMap((g) => g.keys)
  const ungrouped = settings.filter((s) => !allKeys.includes(s.key))

  if (loading) return <PageLoader />

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'white', margin: '0 0 4px' }}>Site settings</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            {changed ? 'You have unsaved changes' : 'All settings saved'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !changed}
          style={{ ...btnStyles.primary, opacity: !changed ? 0.4 : saving ? 0.7 : 1 }}
        >
          {saving ? <><Spinner size={14} /> Saving…</> : 'Save changes'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {SETTING_GROUPS.map((group) => {
          const groupKeys = group.keys.filter(
            (k) => values[k] !== undefined || settings.length === 0
          )
          if (groupKeys.length === 0 && settings.length > 0) return null
          return (
            <Card key={group.label} style={{ padding: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 20px' }}>
                {group.label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {group.keys.map((key) => (
                  <Field
                    key={key}
                    label={formatKey(key)}
                    error={undefined}
                  >
                    {isLongValue(key) ? (
                      <textarea
                        value={values[key] ?? ''}
                        onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical' }}
                        placeholder={group.descriptions?.[key] ?? `Enter ${formatKey(key).toLowerCase()}…`}
                      />
                    ) : (
                      <input
                        value={values[key] ?? ''}
                        onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                        style={inputStyle}
                        placeholder={group.descriptions?.[key] ?? `Enter ${formatKey(key).toLowerCase()}…`}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </Card>
          )
        })}

        {/* Ungrouped settings */}
        {ungrouped.length > 0 && (
          <Card style={{ padding: 24 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', margin: '0 0 20px' }}>
              Other
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {ungrouped.map((s) => (
                <Field key={s.key} label={s.label || formatKey(s.key)}>
                  <input
                    value={values[s.key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
                    style={inputStyle}
                  />
                </Field>
              ))}
            </div>
          </Card>
        )}

        {settings.length === 0 && (
          <EmptyState
            title="No settings configured"
            description="Settings will appear here once added to the database."
          />
        )}

        {/* Sticky save bar for long pages */}
        {changed && (
          <div style={{ position: 'sticky', bottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                ...btnStyles.primary,
                boxShadow: '0 8px 32px rgba(232,76,13,0.35)',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? <><Spinner size={14} /> Saving…</> : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
