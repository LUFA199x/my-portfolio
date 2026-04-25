import Link from 'next/link';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Work' },
  { href: '/contact', label: 'Contact' },
];

const SOCIAL_LINKS = [
  { href: 'https://instagram.com/adegheosa', label: 'Instagram' },
  { href: 'mailto:adegheosa@email.com', label: 'Email' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1e1d1b] px-6 md:px-10 pt-12 pb-8">
      <div className="max-w-7xl mx-auto">

        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-20 mb-12">

          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="font-display text-3xl tracking-[0.12em] text-[#f5f0eb] hover:text-[#c8b89a] transition-colors duration-300 block mb-3">
              ARHDAY
            </Link>
            <p className="text-[#3a3835] text-xs font-light leading-relaxed">
              Visual artist based in Lagos, Nigeria. Capturing life through
              lifestyle, portrait, and editorial photography.
            </p>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-10 md:gap-16">
            <div>
              <p className="font-mono-custom text-[9px] text-[#2a2927] tracking-[0.3em] uppercase mb-4">
                Navigate
              </p>
              <ul className="flex flex-col gap-2.5">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-mono-custom text-[10px] text-[#3a3835] hover:text-[#9a9590] tracking-widest uppercase transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-mono-custom text-[9px] text-[#2a2927] tracking-[0.3em] uppercase mb-4">
                Connect
              </p>
              <ul className="flex flex-col gap-2.5">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="font-mono-custom text-[10px] text-[#3a3835] hover:text-[#9a9590] tracking-widest uppercase transition-colors duration-200"
                    >
                      {link.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#1a1a18] mb-6" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono-custom text-[9px] text-[#2a2927] tracking-widest uppercase">
            © {year} Adegheosa. All rights reserved.
          </p>
          <p className="font-mono-custom text-[9px] text-[#1e1d1b] tracking-widest uppercase">
            Lagos, Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}
