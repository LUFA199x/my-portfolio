'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Service } from '@/types';

interface Props {
  services: Service[];
}

const SERVICE_META: Record<string, { desc: string; tag: string }> = {
  photography:        { desc: 'Full-spectrum creative shoots — lifestyle, editorial, commercial.', tag: 'Most Popular' },
  portrait:           { desc: 'Raw, intimate, real. No poses. Just presence.', tag: 'Personal' },
  'fashion-shoots':   { desc: 'Where garments become stories. Texture, movement, mood.', tag: 'Editorial' },
  street:             { desc: 'Unfiltered city life. Candid, honest, kinetic.', tag: 'Documentary' },
  'creative-direction': { desc: 'Full vision from concept to final frame.', tag: 'Premium' },
  couples:            { desc: 'Two people, one vibe. Soft moments, bold frames.', tag: 'Personal' },
  'iphone-shots':     { desc: "The device changes. The eye doesn't.", tag: 'Accessible' },
  film:               { desc: 'Grain, warmth, permanence. Shot on analog.', tag: 'Specialty' },
};

export default function ServicesSection({ services }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8%' });

  return (
    <section ref={ref} className="py-24 md:py-40 px-6 md:px-10 border-t border-[#1e1d1b]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-5"
            >
              <span className="inline-block w-5 h-px bg-[#2e2d2b]" />
              <span className="font-mono-custom text-[10px] text-[#3a3835] tracking-[0.3em] uppercase">
                Services
              </span>
            </motion.div>
            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: '100%' }}
                animate={isInView ? { y: '0%' } : {}}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="font-display text-[clamp(2.5rem,6vw,6rem)] text-[#f5f0eb] leading-[0.9]"
              >
                WHAT I
              </motion.h2>
            </div>
            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: '100%' }}
                animate={isInView ? { y: '0%' } : {}}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.07 }}
                className="font-display text-[clamp(2.5rem,6vw,6rem)] text-[#c8b89a] leading-[0.9]"
              >
                OFFER.
              </motion.h2>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-2"
          >
            <span className="font-mono-custom text-[9px] text-[#2e2d2b] tracking-[0.25em] uppercase">
              0{services.length} offerings
            </span>
          </motion.div>
        </div>

        {/* Services list */}
        <div className="divide-y divide-[#1a1a18]">
          {services.map((service, i) => {
            const meta = SERVICE_META[service.slug];
            const isActive = activeIndex === i;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                  delay: 0.05 * i,
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
                className="group"
              >
                <Link
                  href="/projects"
                  className="flex items-center justify-between py-5 md:py-7 transition-colors duration-150"
                >
                  {/* Left: index + name */}
                  <div className="flex items-center gap-5 md:gap-10 min-w-0">
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      isActive ? 'border-[#c8b89a]/50 bg-[#c8b89a]/10' : 'border-[#1e1d1b]'
                    }`}>
                      <span className="font-mono-custom text-[8px] text-[#3a3835] tracking-wider">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3
                      className={`font-display text-[clamp(1.6rem,3.5vw,4rem)] leading-none transition-colors duration-200 truncate ${
                        isActive ? 'text-[#c8b89a]' : 'text-[#f5f0eb]'
                      }`}
                    >
                      {service.name.toUpperCase()}
                    </h3>
                    {/* Tag badge */}
                    {meta?.tag && (
                      <AnimatePresence>
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="hidden md:inline-block font-mono-custom text-[8px] tracking-widest uppercase px-2.5 py-1 bg-[#c8b89a]/10 text-[#c8b89a] border border-[#c8b89a]/20 rounded-full flex-shrink-0"
                          >
                            {meta.tag}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Right: desc + arrow */}
                  <div className="flex items-center gap-6 ml-4 flex-shrink-0">
                    <AnimatePresence>
                      {isActive && meta?.desc && (
                        <motion.span
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.22 }}
                          className="hidden lg:block font-light text-[11px] text-[#6b6763] max-w-[200px] text-right leading-relaxed"
                        >
                          {meta.desc}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    <motion.span
                      animate={{
                        x: isActive ? 3 : 0,
                        color: isActive ? '#c8b89a' : '#2a2927',
                      }}
                      transition={{ duration: 0.18 }}
                      className="text-lg"
                    >
                      ↗
                    </motion.span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 pt-10 border-t border-[#1a1a18] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <p className="text-[#3a3835] text-xs font-light max-w-xs leading-relaxed">
            Don't see what you're looking for? Let's talk — every shoot is custom.
          </p>
          <a
            href="mailto:adegheosa@email.com"
            className="font-mono-custom text-[10px] text-[#c8b89a] tracking-[0.2em] uppercase border border-[#c8b89a]/30 hover:bg-[#c8b89a]/10 px-6 py-2.5 rounded-full transition-all duration-300 flex-shrink-0"
          >
            Let's Talk →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
