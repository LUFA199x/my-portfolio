'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: '/admin',
    });

    if (error) {
      setError('Invalid credentials. Please try again.');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[40%] border-r border-[#1a1a18] p-10 bg-[#0d0d0c]">
        <div>
          <p className="font-display text-3xl tracking-[0.15em] text-[#f5f0eb]">ARHDAY</p>
          <p className="font-mono text-[9px] text-[#2a2927] tracking-widest uppercase mt-1">
            Admin CMS
          </p>
        </div>
        <div className="space-y-6">
          <div className="h-px w-12 bg-[#c8b89a]/30" />
          <p className="text-[#2e2d2b] text-xs font-light leading-relaxed max-w-[220px]">
            Manage your portfolio, invoices, and client relationships — all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Projects', desc: 'Upload & publish' },
              { label: 'Invoices', desc: 'Track payments' },
              { label: 'Clients', desc: 'CRM database' },
              { label: 'Analytics', desc: 'Site insights' },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-xl border border-[#1a1a18] bg-[#0a0a0a]">
                <p className="font-mono text-[9px] text-[#3a3835] tracking-widest uppercase mb-1">
                  {item.label}
                </p>
                <p className="text-[#2a2927] text-[10px] font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="font-mono text-[9px] text-[#1e1d1b] tracking-widest uppercase">
          © {new Date().getFullYear()} Adegheosa
        </p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <p className="font-display text-2xl tracking-[0.15em] text-[#f5f0eb]">ARHDAY</p>
            <p className="font-mono text-[9px] text-[#2a2927] tracking-widest uppercase mt-0.5">Admin CMS</p>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl tracking-wide text-[#f5f0eb] leading-none mb-2">
              SIGN IN
            </h1>
            <p className="text-[#3a3835] text-xs font-light">
              Access the Adegheosa dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[9px] text-[#3a3835] tracking-widest uppercase block mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-[#0f0f0e] border border-[#1e1d1b] text-[#f5f0eb] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#c8b89a]/50 focus:bg-[#111110] transition-all duration-200 placeholder:text-[#2a2927] admin-input"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="font-mono text-[9px] text-[#3a3835] tracking-widest uppercase block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full bg-[#0f0f0e] border border-[#1e1d1b] text-[#f5f0eb] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#c8b89a]/50 focus:bg-[#111110] transition-all duration-200 placeholder:text-[#2a2927] admin-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 py-2.5 px-3.5 rounded-xl bg-red-500/8 border border-red-500/15">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs font-mono">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f5f0eb] text-[#0a0a0a] font-medium py-3.5 rounded-xl text-sm hover:bg-[#c8b89a] transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed mt-2 tracking-wide"
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="mt-8 font-mono text-[9px] text-[#1e1d1b] tracking-widest uppercase text-center">
            Restricted access · Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
}
