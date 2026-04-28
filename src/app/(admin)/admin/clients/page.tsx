'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/actions/clients';
import { formatDate } from '@/lib/utils';
import { Client } from '@/types';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', instagram: '', notes: '',
  });

  useEffect(() => {
    fetch('/api/clients-full')
      .then((r) => r.json())
      .then((data) => { setClients(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setError('');

    startTransition(async () => {
      const result = await createClient({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        instagram: form.instagram || undefined,
        notes: form.notes || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.client) {
        setClients((prev) => [result.client!, ...prev]);
        setForm({ name: '', email: '', phone: '', instagram: '', notes: '' });
        setShowForm(false);
      }
    });
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] text-[#3a3835] tracking-widest uppercase mb-2">CMS</p>
          <h1 className="font-display text-5xl text-[#f5f0eb] tracking-wide">CLIENTS</h1>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="inline-flex items-center gap-2 bg-[#c8b89a] text-[#0a0a0a] px-5 py-2.5 rounded-xl text-xs font-mono tracking-widest uppercase hover:bg-[#f5f0eb] transition-colors font-semibold"
        >
          {showForm ? '✕ Cancel' : '+ Add Client'}
        </button>
      </div>

      {/* Add client form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#0f0f0e] border border-[#1a1a18] rounded-2xl p-6 mb-6 space-y-4"
        >
          <h2 className="font-mono text-xs text-[#f5f0eb] tracking-widest uppercase mb-4">New Client</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Name *" value={form.name} onChange={(v) => updateForm('name', v)} placeholder="Client name" />
            <Field label="Email" value={form.email} onChange={(v) => updateForm('email', v)} type="email" placeholder="email@example.com" />
            <Field label="Phone" value={form.phone} onChange={(v) => updateForm('phone', v)} placeholder="+234…" />
            <Field label="Instagram" value={form.instagram} onChange={(v) => updateForm('instagram', v)} placeholder="@handle" />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              rows={2}
              placeholder="Any notes about this client…"
              className="w-full bg-[#0a0a0a] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none placeholder:text-[#3a3835]"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="bg-[#c8b89a] text-[#0a0a0a] font-semibold px-6 py-2.5 rounded-xl text-xs font-mono tracking-widest uppercase hover:bg-[#f5f0eb] transition-colors disabled:opacity-40"
          >
            {isPending ? 'Saving…' : 'Save Client'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-[#3a3835] text-xs font-mono tracking-widest uppercase">Loading…</p>
      ) : clients.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-[#1a1a18] rounded-2xl">
          <p className="text-[#3a3835] text-sm font-mono tracking-widest uppercase mb-4">No clients yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-[#c8b89a] text-xs font-mono hover:text-[#f5f0eb] transition-colors"
          >
            Add your first client →
          </button>
        </div>
      ) : (
        <div className="bg-[#0f0f0e] border border-[#1a1a18] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[#1a1a18]">
            {['Name', 'Email', 'Phone / Instagram', 'Since'].map((h) => (
              <span key={h} className="text-[9px] font-mono text-[#3a3835] tracking-widest uppercase">{h}</span>
            ))}
          </div>
          {clients.map((client) => (
            <div
              key={client.id}
              className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 border-b border-[#1a1a18] last:border-0 hover:bg-[#111110] transition-colors"
            >
              <p className="text-[#f5f0eb] text-sm font-medium">{client.name}</p>
              <p className="text-[#9a9590] text-xs">{client.email ?? '—'}</p>
              <div>
                <p className="text-[#9a9590] text-xs">{client.phone ?? '—'}</p>
                {client.instagram && (
                  <p className="text-[#3a3835] text-[10px] font-mono">{client.instagram}</p>
                )}
              </div>
              <p className="text-[#3a3835] text-[10px] font-mono">{formatDate(client.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0a0a0a] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#3a3835]"
      />
    </div>
  );
}
