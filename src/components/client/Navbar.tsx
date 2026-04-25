'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Work' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0a0a0a]/92 backdrop-blur-xl border-b border-[#1e1d1b]/80'
            : ''
        }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-2xl tracking-[0.15em] text-[#f5f0eb] hover:text-[#c8b89a] transition-colors duration-300 relative group"
        >
          ARHDAY
          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#c8b89a] group-hover:w-full transition-all duration-500" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative font-mono-custom text-[10px] tracking-[0.22em] uppercase transition-colors duration-300 group"
                style={{ color: isActive ? '#f5f0eb' : '#6b6763' }}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-[#c8b89a] transition-all duration-400 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="mailto:adegheosa@email.com"
            className="font-mono-custom text-[10px] tracking-[0.2em] uppercase border border-[#2a2927] hover:border-[#c8b89a] text-[#9a9590] hover:text-[#c8b89a] px-5 py-2 rounded-full transition-all duration-300"
          >
            Book a Shoot
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-[5px] p-1 z-50 relative"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="block w-5 h-px bg-[#f5f0eb] origin-center"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.2 }}
            className="block w-5 h-px bg-[#f5f0eb] origin-left"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="block w-5 h-px bg-[#f5f0eb] origin-center"
          />
        </button>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col px-8 pt-28 pb-12 justify-between"
          >
            {/* Nav links */}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, i) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    className="border-b border-[#1a1a18]"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block py-5 font-display text-[clamp(3rem,12vw,5rem)] leading-none tracking-wide transition-colors duration-200 ${
                        isActive ? 'text-[#c8b89a]' : 'text-[#f5f0eb]'
                      }`}
                    >
                      {link.label.toUpperCase()}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Bottom bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex items-center justify-between"
            >
              <div className="flex gap-6">
                <a
                  href="https://instagram.com/adegheosa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono-custom text-[10px] text-[#3a3835] hover:text-[#f5f0eb] tracking-widest uppercase transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Instagram
                </a>
                <a
                  href="mailto:adegheosa@email.com"
                  className="font-mono-custom text-[10px] text-[#3a3835] hover:text-[#f5f0eb] tracking-widest uppercase transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Email
                </a>
              </div>
              <a
                href="mailto:adegheosa@email.com"
                onClick={() => setMenuOpen(false)}
                className="font-mono-custom text-[10px] tracking-[0.2em] uppercase border border-[#2a2927] hover:border-[#c8b89a] text-[#9a9590] hover:text-[#c8b89a] px-5 py-2.5 rounded-full transition-all duration-300"
              >
                Book a Shoot
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
