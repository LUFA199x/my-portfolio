'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function ContactCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section
      ref={ref}
      className="relative py-28 md:py-44 px-6 md:px-10 border-t border-[#1e1d1b] overflow-hidden"
    >
      {/* Watermark text */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <span className="font-display text-[22vw] text-[#0f0f0e] leading-none whitespace-nowrap">
          LET'S GO
        </span>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: headline */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="inline-block w-5 h-px bg-[#2e2d2b]" />
              <span className="font-mono-custom text-[10px] text-[#3a3835] tracking-[0.3em] uppercase">
                Ready to Shoot?
              </span>
              {/* Availability badge */}
              <span className="inline-flex items-center gap-1.5 font-mono-custom text-[8px] tracking-widest uppercase px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-ring inline-block" />
                Available
              </span>
            </motion.div>

            <div className="overflow-hidden mb-2">
              <motion.h2
                initial={{ y: '110%' }}
                animate={isInView ? { y: '0%' } : {}}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.08 }}
                className="font-display text-[clamp(3rem,8vw,8.5rem)] text-[#f5f0eb] leading-[0.88]"
              >
                READY TO
              </motion.h2>
            </div>
            <div className="overflow-hidden mb-2">
              <motion.h2
                initial={{ y: '110%' }}
                animate={isInView ? { y: '0%' } : {}}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.14 }}
                className="font-display text-[clamp(3rem,8vw,8.5rem)] text-[#f5f0eb] leading-[0.88]"
              >
                SHOOT
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: '110%' }}
                animate={isInView ? { y: '0%' } : {}}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.2 }}
                className="font-display text-[clamp(3rem,8vw,8.5rem)] text-[#c8b89a] leading-[0.88]"
              >
                SOMETHING REAL?
              </motion.h2>
            </div>
          </div>

          {/* Right: actions + info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.35 }}
            className="flex flex-col gap-6"
          >
            <p className="text-[#6b6763] text-sm leading-[1.9] font-light max-w-xs">
              Whether it's a personal project, brand campaign, or a vibe you
              can't quite describe — reach out and let's figure it out together.
            </p>

            <div className="flex flex-col gap-3">
              <a
                href="mailto:adegheosa@email.com"
                className="group inline-flex items-center justify-between gap-3 bg-[#f5f0eb] text-[#0a0a0a] px-7 py-4 rounded-2xl text-sm font-medium tracking-wide hover:bg-[#c8b89a] transition-colors duration-300"
              >
                <span>adegheosa@email.com</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300 text-base">→</span>
              </a>

              <a
                href="https://instagram.com/adegheosa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between gap-3 border border-[#2a2927] hover:border-[#3a3835] text-[#6b6763] hover:text-[#9a9590] px-7 py-4 rounded-2xl text-sm font-mono-custom tracking-widest uppercase transition-all duration-300"
              >
                <span>@adegheosa</span>
                <span>↗</span>
              </a>
            </div>

            {/* Quick info row */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#1a1a18]">
              <div>
                <p className="font-mono-custom text-[8px] text-[#2a2927] tracking-widest uppercase mb-1">Response time</p>
                <p className="text-[#6b6763] text-xs">Within 24 hours</p>
              </div>
              <div>
                <p className="font-mono-custom text-[8px] text-[#2a2927] tracking-widest uppercase mb-1">Location</p>
                <p className="text-[#6b6763] text-xs">Lagos + Worldwide</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
