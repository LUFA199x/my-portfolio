'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function ContactCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section
      ref={ref}
      className="relative py-32 md:py-48 px-6 md:px-10 border-t border-[#1e1d1b] overflow-hidden"
    >
      {/* Decorative large number */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span className="font-display text-[30vw] text-[#0f0f0e] leading-none">
          LET'S GO
        </span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-mono-custom text-xs text-[#3a3835] tracking-[0.3em] uppercase block mb-8"
        >
          Ready to Shoot?
        </motion.span>

        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: '100%' }}
            animate={isInView ? { y: '0%' } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="font-display text-[clamp(3rem,9vw,9rem)] text-[#f5f0eb] leading-none mb-4"
          >
            READY TO SHOOT
          </motion.h2>
        </div>
        <div className="overflow-hidden">
          <motion.h2
            initial={{ y: '100%' }}
            animate={isInView ? { y: '0%' } : {}}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            className="font-display text-[clamp(3rem,9vw,9rem)] text-[#c8b89a] leading-none mb-16"
          >
            SOMETHING REAL?
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="mailto:adegheosa@email.com"
            className="group inline-flex items-center gap-3 bg-[#f5f0eb] text-[#0a0a0a] px-8 py-4 rounded-full text-sm font-medium tracking-wide hover:bg-[#c8b89a] transition-colors duration-300"
          >
            Email Me
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </a>

          <a
            href="https://instagram.com/adegheosa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 border border-[#3a3835] text-[#f5f0eb] px-8 py-4 rounded-full text-sm font-mono-custom tracking-widest uppercase hover:border-[#c8b89a] hover:text-[#c8b89a] transition-all duration-300"
          >
            Instagram ↗
          </a>
        </motion.div>
      </div>
    </section>
  );
}
