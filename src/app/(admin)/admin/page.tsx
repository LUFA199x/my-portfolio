import { getAllProjects } from '@/actions/projects';
import { getInvoices } from '@/actions/invoices';
import { getClients } from '@/actions/clients';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [projects, invoices, clients] = await Promise.all([
    getAllProjects(),
    getInvoices(),
    getClients(),
  ]);

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const unpaidCount = invoices.filter((i) => i.status === 'unpaid').length;
  const publishedProjects = projects.filter((p) => p.is_published).length;
  const draftProjects = projects.length - publishedProjects;

  const recentInvoices = invoices.slice(0, 6);
  const recentProjects = projects.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[9px] text-[#2a2927] tracking-widest uppercase mb-2">
            Overview
          </p>
          <h1 className="font-display text-5xl text-[#f5f0eb] tracking-wide leading-none">
            DASHBOARD
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[8px] text-emerald-400 tracking-widest uppercase px-2.5 py-1.5 bg-emerald-500/8 border border-emerald-500/15 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            System live
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          sub="All-time · paid invoices"
          variant="accent"
        />
        <StatCard
          label="Unpaid"
          value={String(unpaidCount)}
          sub={`of ${invoices.length} invoices`}
          variant={unpaidCount > 0 ? 'warn' : 'default'}
        />
        <StatCard
          label="Published"
          value={String(publishedProjects)}
          sub={`${draftProjects} draft${draftProjects !== 1 ? 's' : ''}`}
          variant="default"
        />
        <StatCard
          label="Clients"
          value={String(clients.length)}
          sub="On record"
          variant="default"
        />
      </div>

      {/* Quick actions */}
      <div>
        <p className="font-mono text-[9px] text-[#2a2927] tracking-widest uppercase mb-3">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: '/admin/projects/new', label: '+ New Project' },
            { href: '/admin/invoices/new', label: '+ New Invoice' },
            { href: '/admin/clients', label: '+ Add Client' },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="font-mono text-[10px] tracking-widest uppercase px-4 py-2 border border-[#1e1d1b] rounded-full text-[#6b6763] hover:border-[#c8b89a]/40 hover:text-[#c8b89a] transition-all duration-200"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Two-column: invoices + projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Invoices */}
        <div className="bg-[#0d0d0c] border border-[#1a1a18] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-mono text-[10px] text-[#9a9590] tracking-widest uppercase">
                Recent Invoices
              </h2>
            </div>
            <Link
              href="/admin/invoices"
              className="font-mono text-[9px] text-[#3a3835] hover:text-[#c8b89a] tracking-widest uppercase transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-0 divide-y divide-[#151514]">
            {recentInvoices.length === 0 && (
              <p className="text-[#2a2927] text-xs font-mono py-4">No invoices yet.</p>
            )}
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3 group"
              >
                <div className="min-w-0">
                  <p className="text-[#c0bab3] text-xs font-medium truncate">
                    {inv.invoice_number}
                  </p>
                  <p className="text-[#3a3835] text-[10px] font-mono mt-0.5 truncate">
                    {inv.client?.name ?? 'Unknown client'}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <span className="text-[#9a9590] text-xs tabular-nums">
                    {formatCurrency(inv.total)}
                  </span>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/admin/invoices/new"
            className="mt-5 w-full flex items-center justify-center gap-2 border border-[#1a1a18] hover:border-[#c8b89a]/30 text-[#3a3835] hover:text-[#c8b89a] py-2.5 rounded-xl text-[9px] font-mono tracking-widest uppercase transition-all duration-200"
          >
            + New Invoice
          </Link>
        </div>

        {/* Recent Projects */}
        <div className="bg-[#0d0d0c] border border-[#1a1a18] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-mono text-[10px] text-[#9a9590] tracking-widest uppercase">
              Recent Projects
            </h2>
            <Link
              href="/admin/projects"
              className="font-mono text-[9px] text-[#3a3835] hover:text-[#c8b89a] tracking-widest uppercase transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {recentProjects.length === 0 && (
              <p className="text-[#2a2927] text-xs font-mono col-span-2 py-4">No projects yet.</p>
            )}
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href="/admin/projects"
                className="group relative aspect-square rounded-xl overflow-hidden bg-[#111110]"
              >
                {project.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.cover_image}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/85 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-[#c0bab3] text-[10px] font-medium truncate leading-tight">
                    {project.title}
                  </p>
                  <span className={`text-[8px] font-mono tracking-widest uppercase ${
                    project.is_published ? 'text-emerald-400/70' : 'text-[#c8b89a]/60'
                  }`}>
                    {project.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/admin/projects/new"
            className="w-full flex items-center justify-center gap-2 border border-[#1a1a18] hover:border-[#c8b89a]/30 text-[#3a3835] hover:text-[#c8b89a] py-2.5 rounded-xl text-[9px] font-mono tracking-widest uppercase transition-all duration-200"
          >
            + Upload Project
          </Link>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <SummaryCard
          title="Paid this month"
          value={formatCurrency(
            invoices
              .filter((i) => {
                if (i.status !== 'paid' || !i.paid_at) return false;
                const d = new Date(i.paid_at);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              })
              .reduce((s, i) => s + i.total, 0),
          )}
        />
        <SummaryCard
          title="Avg invoice value"
          value={invoices.length > 0 ? formatCurrency(Math.round(totalRevenue / Math.max(invoices.filter((i) => i.status === 'paid').length, 1))) : '—'}
        />
        <SummaryCard
          title="Portfolio completion"
          value={projects.length > 0 ? `${Math.round((publishedProjects / projects.length) * 100)}%` : '—'}
        />
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  variant = 'default',
}: {
  label: string;
  value: string;
  sub: string;
  variant?: 'default' | 'accent' | 'warn';
}) {
  const styles = {
    default: 'bg-[#0d0d0c] border-[#1a1a18]',
    accent: 'bg-[#c8b89a]/8 border-[#c8b89a]/15',
    warn: 'bg-orange-500/5 border-orange-500/15',
  };
  const valueColor = {
    default: 'text-[#f5f0eb]',
    accent: 'text-[#c8b89a]',
    warn: 'text-orange-400',
  };

  return (
    <div className={`rounded-2xl p-5 border ${styles[variant]}`}>
      <p className="font-mono text-[8px] text-[#2a2927] tracking-widest uppercase mb-4">
        {label}
      </p>
      <p className={`font-display text-4xl leading-none mb-2 ${valueColor[variant]}`}>
        {value}
      </p>
      <p className="font-mono text-[9px] text-[#2a2927] tracking-wide">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    unpaid: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    draft: 'bg-[#1a1a18] text-[#3a3835] border-[#1a1a18]',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <span
      className={`text-[8px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full border flex-shrink-0 ${
        styles[status] ?? styles.draft
      }`}
    >
      {status}
    </span>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-[#0d0d0c] border border-[#1a1a18] rounded-2xl p-5 flex items-center justify-between">
      <p className="font-mono text-[9px] text-[#3a3835] tracking-widest uppercase">{title}</p>
      <p className="text-[#9a9590] text-sm font-medium tabular-nums">{value}</p>
    </div>
  );
}
