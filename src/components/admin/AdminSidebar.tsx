'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const links = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    href: '/admin/projects',
    label: 'Projects',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4 13H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M7 10V13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/invoices',
    label: 'Invoices',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 1.5H9L12 4.5V12.5H2V1.5Z" rx="1" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M9 1.5V4.5H12" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M4.5 6.5H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4.5 8.5H7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/clients',
    label: 'Clients',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M1.5 12.5C1.5 10.015 4.015 8 7 8C9.985 8 12.5 10.015 12.5 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-[#1a1a18] flex-col justify-between py-7 px-4 hidden md:flex z-40">
      {/* Logo + nav */}
      <div>
        <div className="px-3 mb-8">
          <Link
            href="/admin"
            className="font-display text-2xl tracking-[0.15em] text-[#f5f0eb] hover:text-[#c8b89a] transition-colors block"
          >
            ARHDAY
          </Link>
          <p className="font-mono text-[8px] text-[#2a2927] tracking-[0.3em] uppercase mt-0.5">
            Admin Panel
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1a1a18] mx-3 mb-5" />

        <nav className="flex flex-col gap-0.5">
          {links.map((link) => {
            const isActive =
              link.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono tracking-widest uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-[#c8b89a]/10 text-[#c8b89a] border border-[#c8b89a]/20'
                    : 'text-[#6b6763] hover:text-[#c0bab3] hover:bg-[#111110] border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-[#c8b89a]' : 'text-[#3a3835]'}>
                  {link.icon}
                </span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div>
        <div className="h-px bg-[#1a1a18] mx-3 mb-4" />
        <div className="flex flex-col gap-0.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-mono text-[#3a3835] hover:text-[#9a9590] hover:bg-[#111110] tracking-widest uppercase transition-all duration-200"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 2H2C1.45 2 1 2.45 1 3V11C1 11.55 1.45 12 2 12H10C10.55 12 11 11.55 11 11V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M8 1H12V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 1L6 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            View Site
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-mono text-[#3a3835] hover:text-red-400 hover:bg-red-500/5 tracking-widest uppercase transition-all duration-200"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 1H2C1.45 1 1 1.45 1 2V11C1 11.55 1.45 12 2 12H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M9 9L12 6.5L9 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 6.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
