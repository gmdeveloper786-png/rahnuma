'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';

const RING_RADIUS = 22;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function BackToTopButton() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100))) : 0;
      setProgress(pct);
      setVisible(scrollTop > 160);
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  const strokeDashoffset = RING_CIRCUMFERENCE - (progress / 100) * RING_CIRCUMFERENCE;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label={`Back to top (${progress}% scrolled)`}
          title={`Back to top (${progress}%)`}
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="group fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-slate-200/90 transition-transform hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        >
          {/* Circular SVG Progress Ring */}
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 52 52"
            aria-hidden="true"
          >
            <circle
              cx="26"
              cy="26"
              r={RING_RADIUS}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="3.2"
            />
            <circle
              cx="26"
              cy="26"
              r={RING_RADIUS}
              fill="none"
              stroke="#064E3B"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-100 ease-out"
            />
          </svg>

          {/* Inner Content: Arrow + Live Percentage */}
          <span className="relative z-10 flex flex-col items-center justify-center leading-none">
            <ArrowUp className="h-3.5 w-3.5 text-[#064E3B] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-[#D97706]" />
            <span className="mt-0.5 font-mono text-[10px] font-bold text-[#064E3B] tabular-nums">
              {progress}%
            </span>
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
