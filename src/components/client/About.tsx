'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const STATS = [
  { label: 'Shoot Dates', value: 'Flexible' },
  { label: 'Turnaround', value: '24HRS' },
  { label: 'Location', value: 'Anywhere w/ Light' },
];

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-15%' });

  const { scrollYProgress } = useScroll({
    target: imgRef,
    offset: ['start end', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: i * 0.1 },
    }),
  };

  return (
    <section ref={ref} className="py-24 md:py-40 px-6 md:px-10 border-t border-[#1e1d1b]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">

        {/* Left — Image */}
        <div ref={imgRef} className="relative overflow-hidden rounded-2xl aspect-[3/4] order-2 md:order-1">
          <motion.div style={{ y: imgY }} className="absolute inset-[-8%] h-[116%]">
            <Image
              src="https://framerusercontent.com/images/EF6WJMnsiwhE8sWOsmD1p4AY7E.jpg"
              alt="Adegheosa at work"
              fill
              className="object-cover"
              unoptimized
            />
          </motion.div>
          {/* Overlay badge */}
          <div className="absolute top-6 left-6 bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#1e1d1b] rounded-full px-4 py-2">
            <span className="font-mono-custom text-[10px] text-[#c8b89a] tracking-widest uppercase">
              © 2024 Adegheosa
            </span>
          </div>
        </div>

        {/* Right — Text */}
        <div className="order-1 md:order-2">
          <motion.span
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="font-mono-custom text-xs text-[#3a3835] tracking-[0.3em] uppercase block mb-6"
          >
            (About Me)
          </motion.span>

          <div className="overflow-hidden mb-2">
            <motion.h2
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="font-display text-[clamp(3rem,7vw,7rem)] leading-none text-[#f5f0eb]"
            >
              PHOTOGRAPHY
            </motion.h2>
          </div>
          <div className="overflow-hidden mb-2">
            <motion.h2
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="font-display text-[clamp(3rem,7vw,7rem)] leading-none text-[#f5f0eb]"
            >
              IS 20% LIGHT,
            </motion.h2>
          </div>
          <div className="overflow-hidden mb-8">
            <motion.h2
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="font-display text-[clamp(3rem,7vw,7rem)] leading-none text-[#c8b89a]"
            >
              80% VIBE.
            </motion.h2>
          </div>

          <motion.p
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="text-[#9a9590] text-sm leading-relaxed font-light max-w-xs mb-12"
          >
            Golden hour. Street noise. That one breath before the beat drops.
            I'm obsessed with chasing feeling through light and texture. My work
            is about capturing what can't be said — from loud city nights to
            soft, sleepy mornings.
          </motion.p>

          {/* Stats row */}
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid grid-cols-3 gap-4 border-t border-[#1e1d1b] pt-8"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-mono-custom text-[9px] text-[#3a3835] tracking-widest uppercase mb-1">
                  {stat.label}
                </p>
                <p className="text-[#f5f0eb] text-xs font-medium">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
