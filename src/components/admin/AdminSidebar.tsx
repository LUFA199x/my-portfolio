'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const links = [
  { href: '/admin', label: 'Dashboard', icon: '◻' },
  { href: '/admin/projects', label: 'Projects', icon: '◈' },
  { href: '/admin/invoices', label: 'Invoices', icon: '◇' },
  { href: '/admin/clients', label: 'Clients', icon: '○' },
  { href: '/admin/services', label: 'Services', icon: '◑' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-[#1a1a18] flex-col justify-between py-8 px-5 hidden md:flex z-40">
      {/* Logo */}
      <div>
        <Link
          href="/admin"
          className="font-display text-2xl tracking-widest text-[#f5f0eb] hover:text-[#c8b89a] transition-colors block mb-1"
        >
          ARHDAY
        </Link>
        <p className="font-mono text-[9px] text-[#3a3835] tracking-widest uppercase mb-10">
          Admin CMS
        </p>

        {/* Nav links */}
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive =
              link.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono tracking-widest uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-[#c8b89a]/10 text-[#c8b89a] border border-[#c8b89a]/20'
                    : 'text-[#9a9590] hover:text-[#f5f0eb] hover:bg-[#0f0f0e] border border-transparent'
                }`}
              >
                <span className="text-sm">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-2 text-[10px] font-mono text-[#3a3835] hover:text-[#f5f0eb] tracking-widest uppercase transition-colors"
        >
          ↗ View Site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-mono text-[#3a3835] hover:text-red-400 hover:bg-red-500/5 tracking-widest uppercase transition-all duration-200 border border-transparent hover:border-red-500/10"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
