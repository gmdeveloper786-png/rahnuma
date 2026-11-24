'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValueEvent, useScroll, useSpring } from 'motion/react';
import { ArrowLeft, Bookmark } from 'lucide-react';

export default function ReadingProgressBar({
  targetRef,
  backHref,
  backLabel,
  metaText,
  isBookmarked,
  onToggleBookmark,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  backHref: string;
  backLabel: string;
  metaText: string;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start 80px', 'end end'],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.001,
  });

  const [percent, setPercent] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const clamped = Math.max(0, Math.min(1, latest));
    setPercent(Math.round(clamped * 100));
  });

  return (
    <div className="sticky top-16 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-[#064E3B]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{backLabel}</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="hidden font-mono text-[11px] text-slate-500 tabular-nums sm:inline">
            {metaText}
          </span>
          <span className="font-mono text-[11px] font-medium text-slate-500 tabular-nums">
            {percent}% read
          </span>
          <button
            type="button"
            aria-pressed={isBookmarked}
            onClick={onToggleBookmark}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
              isBookmarked
                ? 'border-amber-300 bg-amber-50 text-[#D97706]'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark
              className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-[#D97706] text-[#D97706]' : ''}`}
            />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </div>

      {/* Subtle top reading progress track */}
      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-[3px] w-full bg-slate-100"
      >
        <motion.div
          style={{ scaleX }}
          className="h-full w-full origin-left bg-gradient-to-r from-[#064E3B] via-[#059669] to-[#D97706]"
        />
      </div>
    </div>
  );
}
