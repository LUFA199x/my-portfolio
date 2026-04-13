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

  const recentInvoices = invoices.slice(0, 5);
  const recentProjects = projects.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="font-mono text-[10px] text-[#3a3835] tracking-widest uppercase mb-2">
          Overview
        </p>
        <h1 className="font-display text-5xl text-[#f5f0eb] tracking-wide">
          DASHBOARD
        </h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          sub="All-time paid invoices"
          accent
        />
        <StatCard
          label="Unpaid Invoices"
          value={String(unpaidCount)}
          sub={`of ${invoices.length} total`}
          warn={unpaidCount > 0}
        />
        <StatCard
          label="Published Projects"
          value={String(publishedProjects)}
          sub={`${projects.length - publishedProjects} drafts`}
        />
        <StatCard
          label="Clients"
          value={String(clients.length)}
          sub="On record"
        />
      </div>

      {/* Two-column: recent invoices + recent projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Invoices */}
        <div className="bg-[#0f0f0e] border border-[#1a1a18] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-xs text-[#f5f0eb] tracking-widest uppercase">
              Recent Invoices
            </h2>
            <Link
              href="/admin/invoices"
              className="font-mono text-[10px] text-[#3a3835] hover:text-[#c8b89a] tracking-widest uppercase transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {recentInvoices.length === 0 && (
              <p className="text-[#3a3835] text-xs font-mono">No invoices yet.</p>
            )}
            {recentInvoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between py-3 border-b border-[#1a1a18] last:border-0"
              >
                <div>
                  <p className="text-[#f5f0eb] text-xs font-medium">
                    {inv.invoice_number}
                  </p>
                  <p className="text-[#3a3835] text-[10px] font-mono mt-0.5">
                    {inv.client?.name ?? 'Unknown client'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#f5f0eb] text-xs">
                    {formatCurrency(inv.total)}
                  </span>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/admin/invoices/new"
            className="mt-6 w-full flex items-center justify-center gap-2 border border-[#1a1a18] hover:border-[#c8b89a] text-[#9a9590] hover:text-[#c8b89a] py-2.5 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all duration-200"
          >
            + New Invoice
          </Link>
        </div>

        {/* Recent Projects */}
        <div className="bg-[#0f0f0e] border border-[#1a1a18] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-mono text-xs text-[#f5f0eb] tracking-widest uppercase">
              Recent Projects
            </h2>
            <Link
              href="/admin/projects"
              className="font-mono text-[10px] text-[#3a3835] hover:text-[#c8b89a] tracking-widest uppercase transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects`}
                className="group relative aspect-square rounded-xl overflow-hidden bg-[#1a1a18]"
              >
                {project.cover_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.cover_image}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                  />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[#f5f0eb] text-[10px] font-medium truncate">
                    {project.title}
                  </p>
                  {!project.is_published && (
                    <span className="text-[8px] font-mono text-[#c8b89a] tracking-widest uppercase">
                      Draft
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <Link
            href="/admin/projects/new"
            className="mt-4 w-full flex items-center justify-center gap-2 border border-[#1a1a18] hover:border-[#c8b89a] text-[#9a9590] hover:text-[#c8b89a] py-2.5 rounded-xl text-[10px] font-mono tracking-widest uppercase transition-all duration-200"
          >
            + Upload Project
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  accent,
  warn,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        accent
          ? 'bg-[#c8b89a]/10 border-[#c8b89a]/20'
          : 'bg-[#0f0f0e] border-[#1a1a18]'
      }`}
    >
      <p className="font-mono text-[9px] text-[#3a3835] tracking-widest uppercase mb-3">
        {label}
      </p>
      <p
        className={`font-display text-4xl leading-none mb-1 ${
          accent ? 'text-[#c8b89a]' : warn ? 'text-orange-400' : 'text-[#f5f0eb]'
        }`}
      >
        {value}
      </p>
      <p className="font-mono text-[9px] text-[#3a3835] tracking-wide">{sub}</p>
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
      className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full border ${
        styles[status] ?? styles.draft
      }`}
    >
      {status}
    </span>
  );
}
