'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

const STATS = [
  { label: 'Based in', value: 'Lagos, NG' },
  { label: 'Turnaround', value: '24 HRS' },
  { label: 'Style', value: 'Lifestyle · Editorial' },
  { label: 'Available', value: 'Worldwide' },
];

const HIGHLIGHTS = [
  'Light chaser since 2019',
  'Shot on Sony & Canon',
  'Film + Digital hybrid',
];

export default function About() {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-12%' });

  const { scrollYProgress } = useScroll({
    target: imgRef,
    offset: ['start end', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  const fadeUp = {
    hidden: { opacity: 0, y: 36 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: i * 0.1 },
    }),
  };

  return (
    <section ref={ref} className="py-24 md:py-40 px-6 md:px-10 border-t border-[#1e1d1b]">
      <div className="max-w-7xl mx-auto">

        {/* Section label */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex items-center gap-3 mb-16"
        >
          <span className="inline-block w-5 h-px bg-[#2e2d2b]" />
          <span className="font-mono-custom text-[10px] text-[#3a3835] tracking-[0.3em] uppercase">
            About Me
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">

          {/* Image */}
          <div ref={imgRef} className="relative overflow-hidden rounded-2xl aspect-[3/4] order-2 md:order-1 group">
            <motion.div style={{ y: imgY }} className="absolute inset-[-6%] h-[112%]">
              <Image
                src="https://framerusercontent.com/images/EF6WJMnsiwhE8sWOsmD1p4AY7E.jpg"
                alt="Adegheosa at work"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                unoptimized
              />
            </motion.div>

            {/* Overlay badge */}
            <div className="absolute top-5 left-5 bg-[#0a0a0a]/85 backdrop-blur-md border border-[#2a2927] rounded-full px-4 py-2">
              <span className="font-mono-custom text-[9px] text-[#c8b89a] tracking-widest uppercase">
                © 2024 Adegheosa
              </span>
            </div>

            {/* Highlights list on image bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent">
              <div className="flex flex-col gap-1">
                {HIGHLIGHTS.map((item, i) => (
                  <p key={i} className="font-mono-custom text-[9px] text-[#6b6763] tracking-widest">
                    — {item}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 md:order-2">
            <div className="overflow-hidden mb-1">
              <motion.h2
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className="font-display text-[clamp(3rem,7vw,7rem)] leading-[0.88] text-[#f5f0eb]"
              >
                PHOTOGRAPHY
              </motion.h2>
            </div>
            <div className="overflow-hidden mb-1">
              <motion.h2
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className="font-display text-[clamp(3rem,7vw,7rem)] leading-[0.88] text-[#f5f0eb]"
              >
                IS 20% LIGHT,
              </motion.h2>
            </div>
            <div className="overflow-hidden mb-10">
              <motion.h2
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className="font-display text-[clamp(3rem,7vw,7rem)] leading-[0.88] text-[#c8b89a]"
              >
                80% VIBE.
              </motion.h2>
            </div>

            <motion.p
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="text-[#6b6763] text-sm leading-[1.9] font-light max-w-xs mb-10"
            >
              Golden hour. Street noise. That one breath before the beat drops.
              I'm obsessed with chasing feeling through light and texture —
              from loud city nights to soft, sleepy mornings.
            </motion.p>

            {/* Pull quote */}
            <motion.blockquote
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="border-l-2 border-[#c8b89a]/40 pl-5 mb-12"
            >
              <p className="text-[#9a9590] text-sm italic font-light leading-relaxed">
                "Every frame is a conversation between the subject, the light, and what you feel."
              </p>
            </motion.blockquote>

            {/* Stats grid */}
            <motion.div
              custom={6}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="grid grid-cols-2 gap-x-8 gap-y-5 pt-8 border-t border-[#1e1d1b]"
            >
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-mono-custom text-[8px] text-[#2e2d2b] tracking-widest uppercase mb-1.5">
                    {stat.label}
                  </p>
                  <p className="text-[#9a9590] text-xs font-medium">{stat.value}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
