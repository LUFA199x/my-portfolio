'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createInvoice } from '@/actions/invoices';
import { LineItem } from '@/types';

interface Option { id: string; name: string; }

export default function NewInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Option[]>([]);
  const [projects, setProjects] = useState<Option[]>([]);
  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', qty: 1, unit_price: 0 },
  ]);
  const [discount, setDiscount] = useState('0');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/clients').then((r) => r.json()).then(setClients).catch(() => {});
    fetch('/api/projects-list').then((r) => r.json()).then(setProjects).catch(() => {});
  }, []);

  const subtotal = lineItems.reduce((sum, li) => sum + li.qty * li.unit_price, 0);
  const total = subtotal - (parseFloat(discount) || 0);

  function updateLine(index: number, field: keyof LineItem, value: string | number) {
    setLineItems((prev) =>
      prev.map((li, i) => (i === index ? { ...li, [field]: value } : li))
    );
  }

  function addLine() {
    setLineItems((prev) => [...prev, { description: '', qty: 1, unit_price: 0 }]);
  }

  function removeLine(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) { setError('Please select a client.'); return; }
    if (lineItems.some((li) => !li.description)) { setError('All line items need a description.'); return; }

    setSubmitting(true);
    setError('');

    const result = await createInvoice({
      client_id: clientId,
      project_id: projectId || undefined,
      line_items: lineItems,
      discount: parseFloat(discount) || 0,
      due_date: dueDate || undefined,
      notes: notes || undefined,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push('/admin/invoices');
      router.refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/invoices" className="text-[10px] font-mono text-[#3a3835] hover:text-[#9a9590] tracking-widest uppercase transition-colors">
          ← Back to Invoices
        </Link>
        <h1 className="font-display text-5xl text-[#f5f0eb] tracking-wide mt-4">NEW INVOICE</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Client */}
        <div>
          <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">Client *</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full bg-[#0f0f0e] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          >
            <option value="">Select a client…</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {clients.length === 0 && (
            <p className="text-[9px] font-mono text-[#3a3835] mt-1">
              No clients yet —{' '}
              <Link href="/admin/clients" className="text-[#c8b89a] hover:underline">add one first</Link>
            </p>
          )}
        </div>

        {/* Project (optional) */}
        <div>
          <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">
            Linked Project <span className="normal-case">(optional)</span>
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-[#0f0f0e] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          >
            <option value="">No linked project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Line items */}
        <div>
          <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-3">Line Items</label>
          <div className="space-y-2">
            {lineItems.map((li, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                <input
                  type="text"
                  value={li.description}
                  onChange={(e) => updateLine(i, 'description', e.target.value)}
                  placeholder="Description"
                  required
                  className="bg-[#0f0f0e] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-[#3a3835]"
                />
                <input
                  type="number"
                  value={li.qty}
                  min="1"
                  onChange={(e) => updateLine(i, 'qty', parseInt(e.target.value) || 1)}
                  className="w-16 bg-[#0f0f0e] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-3 py-2.5 text-sm outline-none transition-colors text-center"
                  title="Qty"
                />
                <input
                  type="number"
                  value={li.unit_price}
                  min="0"
                  step="100"
                  onChange={(e) => updateLine(i, 'unit_price', parseFloat(e.target.value) || 0)}
                  className="w-28 bg-[#0f0f0e] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                  title="Unit price (₦)"
                  placeholder="₦ 0"
                />
                {lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    className="text-red-500/50 hover:text-red-400 text-sm transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLine}
            className="mt-2 text-[10px] font-mono text-[#3a3835] hover:text-[#9a9590] tracking-widest uppercase transition-colors"
          >
            + Add line item
          </button>
        </div>

        {/* Totals */}
        <div className="bg-[#0f0f0e] border border-[#1a1a18] rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs font-mono text-[#9a9590]">
            <span>Subtotal</span>
            <span>₦{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-mono text-[#9a9590]">Discount (₦)</span>
            <input
              type="number"
              value={discount}
              min="0"
              step="100"
              onChange={(e) => setDiscount(e.target.value)}
              className="w-28 bg-[#1a1a18] border border-[#2a2a28] text-[#f5f0eb] rounded-lg px-3 py-1.5 text-xs outline-none text-right"
            />
          </div>
          <div className="flex justify-between text-sm font-semibold text-[#f5f0eb] pt-1 border-t border-[#1a1a18]">
            <span>Total</span>
            <span>₦{Math.max(0, total).toLocaleString()}</span>
          </div>
        </div>

        {/* Due date + notes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-[#0f0f0e] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#3a3835] tracking-widest uppercase mb-2">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment instructions, etc."
              className="w-full bg-[#0f0f0e] border border-[#1a1a18] focus:border-[#3a3835] text-[#f5f0eb] rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#3a3835]"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-[#c8b89a] text-[#0a0a0a] font-semibold py-3 rounded-xl text-xs font-mono tracking-widest uppercase hover:bg-[#f5f0eb] transition-colors disabled:opacity-40"
          >
            {submitting ? 'Creating…' : 'Create Invoice'}
          </button>
          <Link
            href="/admin/invoices"
            className="px-6 py-3 border border-[#1a1a18] text-[#9a9590] rounded-xl text-xs font-mono tracking-widest uppercase hover:border-[#3a3835] hover:text-[#f5f0eb] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
