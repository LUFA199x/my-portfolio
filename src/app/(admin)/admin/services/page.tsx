'use client';

import { useState, useEffect, useTransition } from 'react';
import { createService, deleteService } from '@/actions/services';
import { Service } from '@/types';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((data) => { setServices(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required.'); return; }
    setError('');

    startTransition(async () => {
      const result = await createService({ name, description: description || undefined, order_index: services.length });
      if (result.error) {
        setError(result.error);
      } else {
        // Reload services
        const res = await fetch('/api/services');
        if (res.ok) setServices(await res.json());
        setName('');
        setDescription('');
        setShowForm(false);
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    });
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] text-[#3a3835] tracking-widest uppercase mb-2">CMS</p>
          <h1 className="font-display text-5xl text-[#f5f0eb] tracking-wide">SERVICES</h1>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="inline-flex items-center gap-2 bg-[#c8b89a] text-[#0a0a0a] px-5 py-2.5 rounded-xl text-xs font-mono tracking-widest uppercase hover:bg-[#f5f0eb] transition-colors font-semibold"
        >
          {showForm ? '✕ Cancel' : '+ Add Service'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#0f0f0e] border border-[#1a1a18] rounded-2xl p-6 mb-6 space-y-4">
          <h2 className="font-mono text-xs text-[#f5f0eb] tracking-widest uppercase">New Service Category</h2>

          <div>
            <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fashion Editorial"
              className="w-full bg-[#0a0a0a] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#3a3835]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description…"
              className="w-full bg-[#0a0a0a] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#3a3835]"
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
            {isPending ? 'Saving…' : 'Save Service'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-[#3a3835] text-xs font-mono tracking-widest uppercase">Loading…</p>
      ) : services.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-[#1a1a18] rounded-2xl">
          <p className="text-[#3a3835] text-sm font-mono tracking-widest uppercase mb-4">No services yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-[#c8b89a] text-xs font-mono hover:text-[#f5f0eb] transition-colors"
          >
            Add your first service →
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-4 bg-[#0f0f0e] border border-[#1a1a18] rounded-xl px-5 py-4 hover:border-[#2a2a28] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-[#f5f0eb] text-sm font-medium">{service.name}</p>
                {service.description && (
                  <p className="text-[#3a3835] text-[10px] font-mono mt-0.5 truncate">{service.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[9px] font-mono text-[#3a3835] tracking-widest">/{service.slug}</span>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={isPending}
                  className="text-[10px] font-mono text-red-500/50 hover:text-red-400 tracking-widest uppercase transition-colors disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
