import Link from 'next/link';
import { getInvoices, markInvoicePaid, cancelInvoice } from '@/actions/invoices';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices();

  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);

  const unpaid = invoices.filter((i) => i.status === 'unpaid');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-[10px] text-[#3a3835] tracking-widest uppercase mb-2">CMS</p>
          <h1 className="font-display text-5xl text-[#f5f0eb] tracking-wide">INVOICES</h1>
        </div>
        <Link
          href="/admin/invoices/new"
          className="inline-flex items-center gap-2 bg-[#c8b89a] text-[#0a0a0a] px-5 py-2.5 rounded-xl text-xs font-mono tracking-widest uppercase hover:bg-[#f5f0eb] transition-colors font-semibold"
        >
          + New Invoice
        </Link>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Paid', value: formatCurrency(totalPaid), accent: true },
          { label: 'Unpaid', value: String(unpaid.length), warn: unpaid.length > 0 },
          { label: 'Total Invoices', value: String(invoices.length) },
          { label: 'Cancelled', value: String(invoices.filter((i) => i.status === 'cancelled').length) },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 border ${s.accent ? 'bg-[#c8b89a]/10 border-[#c8b89a]/20' : 'bg-[#0f0f0e] border-[#1a1a18]'}`}>
            <p className="font-mono text-[9px] text-[#3a3835] tracking-widest uppercase mb-2">{s.label}</p>
            <p className={`font-display text-3xl leading-none ${s.accent ? 'text-[#c8b89a]' : s.warn ? 'text-orange-400' : 'text-[#f5f0eb]'}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-[#1a1a18] rounded-2xl">
          <p className="text-[#3a3835] text-sm font-mono tracking-widest uppercase mb-4">No invoices yet</p>
          <Link href="/admin/invoices/new" className="text-[#c8b89a] text-xs font-mono hover:text-[#f5f0eb] transition-colors">
            Create first invoice →
          </Link>
        </div>
      ) : (
        <div className="bg-[#0f0f0e] border border-[#1a1a18] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-[#1a1a18]">
            {['Invoice', 'Client', 'Total', 'Due', 'Status'].map((h) => (
              <span key={h} className="text-[9px] font-mono text-[#3a3835] tracking-widest uppercase">{h}</span>
            ))}
          </div>

          {invoices.map((inv) => {
            async function handlePaid() {
              'use server';
              await markInvoicePaid(inv.id);
            }
            async function handleCancel() {
              'use server';
              await cancelInvoice(inv.id);
            }

            const statusStyles: Record<string, string> = {
              paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
              unpaid: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
              draft: 'bg-[#1a1a18] text-[#3a3835] border-[#1a1a18]',
              cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
            };

            return (
              <div
                key={inv.id}
                className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center px-5 py-4 border-b border-[#1a1a18] last:border-0 hover:bg-[#111110] transition-colors"
              >
                <div>
                  <p className="text-[#f5f0eb] text-xs font-medium">{inv.invoice_number}</p>
                  {inv.bumpa_payment_url && (
                    <a
                      href={inv.bumpa_payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-mono text-[#c8b89a] hover:underline"
                    >
                      Payment link ↗
                    </a>
                  )}
                </div>

                <div>
                  <p className="text-[#9a9590] text-xs">{inv.client?.name ?? '—'}</p>
                  <p className="text-[#3a3835] text-[10px] font-mono">{inv.client?.email ?? ''}</p>
                </div>

                <p className="text-[#f5f0eb] text-xs font-medium">{formatCurrency(inv.total)}</p>

                <p className="text-[#3a3835] text-[10px] font-mono">
                  {inv.due_date ? formatDate(inv.due_date) : '—'}
                </p>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full border ${statusStyles[inv.status] ?? statusStyles.draft}`}
                  >
                    {inv.status}
                  </span>
                  {inv.status === 'unpaid' && (
                    <form action={handlePaid}>
                      <button
                        type="submit"
                        className="text-[9px] font-mono text-emerald-500/70 hover:text-emerald-400 tracking-widest uppercase transition-colors"
                      >
                        Mark Paid
                      </button>
                    </form>
                  )}
                  {(inv.status === 'unpaid' || inv.status === 'draft') && (
                    <form action={handleCancel}>
                      <button
                        type="submit"
                        className="text-[9px] font-mono text-red-500/50 hover:text-red-400 tracking-widest uppercase transition-colors"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
