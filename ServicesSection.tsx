'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Service } from '@/types';

interface Props {
  services: Service[];
}

// Service descriptions for hover reveal
const SERVICE_META: Record<string, string> = {
  photography: 'Full-spectrum creative shoots — lifestyle, editorial, commercial.',
  portrait: 'Raw, intimate, real. No poses. Just presence.',
  'fashion-shoots': 'Where garments become stories. Texture, movement, mood.',
  street: 'Unfiltered city life. Candid, honest, kinetic.',
  'creative-direction': 'Full vision from concept to final frame.',
  couples: 'Two people, one vibe. Soft moments, bold frames.',
  'iphone-shots': 'The device changes. The eye doesn\'t.',
  film: 'Grain, warmth, permanence. Shot on analog.',
};

export default function ServicesSection({ services }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section ref={ref} className="py-24 md:py-40 px-6 md:px-10 border-t border-[#1e1d1b]">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div className="flex items-end justify-between mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(2.5rem,6vw,5rem)] text-[#f5f0eb] leading-none"
          >
            THAT'S MY<br />
            <span className="text-[#c8b89a]">SERVICES.</span>
          </motion.h2>

          <motion.span
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hidden md:block font-mono-custom text-xs text-[#3a3835] tracking-[0.2em] uppercase"
          >
            0{services.length} Offerings
          </motion.span>
        </div>

        {/* Services list */}
        <div className="divide-y divide-[#1e1d1b]">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.05 * i,
              }}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              className="group"
            >
              <Link
                href="/projects"
                className="flex items-center justify-between py-5 md:py-7"
              >
                {/* Index + Name */}
                <div className="flex items-center gap-6 md:gap-10">
                  <span className="font-mono-custom text-[10px] text-[#3a3835] w-6 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className={`font-display text-[clamp(1.8rem,4vw,4.5rem)] leading-none transition-colors duration-200 ${
                      activeIndex === i ? 'text-[#c8b89a]' : 'text-[#f5f0eb]'
                    }`}
                  >
                    {service.name.toUpperCase()}
                  </h3>
                </div>

                {/* Description + Arrow */}
                <div className="flex items-center gap-6 overflow-hidden">
                  <AnimatePresence>
                    {activeIndex === i && (
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.25 }}
                        className="hidden md:block font-light text-xs text-[#9a9590] max-w-[220px] text-right"
                      >
                        {SERVICE_META[service.slug] ?? ''}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  <motion.span
                    animate={{
                      x: activeIndex === i ? 4 : 0,
                      color: activeIndex === i ? '#c8b89a' : '#3a3835',
                    }}
                    transition={{ duration: 0.2 }}
                    className="text-xl shrink-0"
                  >
                    ↗
                  </motion.span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
