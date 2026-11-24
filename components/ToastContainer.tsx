'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Info,
  ShieldAlert,
  X,
} from 'lucide-react';
import { usePortal } from '@/context/PortalContext';
import type { ToastItem, ToastTone } from '@/context/PortalContext';

const TONE_STYLES: Record<
  ToastTone,
  {
    container: string;
    accentBar: string;
    iconWrap: string;
    eyebrow: string;
    eyebrowColor: string;
    titleColor: string;
    descColor: string;
    actionColor: string;
    progressColor: string;
    Icon: typeof CheckCircle2;
    iconFill?: boolean;
  }
> = {
  success: {
    container: 'border-emerald-200/90 bg-white shadow-lg shadow-emerald-950/10',
    accentBar: 'bg-[#064E3B]',
    iconWrap: 'bg-[#ECFDF5] text-[#064E3B]',
    eyebrow: 'Rahnuma · Confirmed',
    eyebrowColor: 'text-[#064E3B]',
    titleColor: 'text-slate-900',
    descColor: 'text-slate-600',
    actionColor: 'text-[#064E3B] hover:text-[#053B2D]',
    progressColor: 'bg-[#064E3B]',
    Icon: CheckCircle2,
  },
  bookmark: {
    container: 'border-amber-200/90 bg-white shadow-lg shadow-amber-950/10',
    accentBar: 'bg-[#D97706]',
    iconWrap: 'bg-amber-50 text-[#D97706]',
    eyebrow: 'Rahnuma · Saved',
    eyebrowColor: 'text-[#D97706]',
    titleColor: 'text-slate-900',
    descColor: 'text-slate-600',
    actionColor: 'text-[#064E3B] hover:text-[#053B2D]',
    progressColor: 'bg-[#D97706]',
    Icon: Bookmark,
    iconFill: true,
  },
  info: {
    container: 'border-slate-200 bg-white shadow-lg shadow-slate-950/10',
    accentBar: 'bg-[#0F766E]',
    iconWrap: 'bg-teal-50 text-[#0F766E]',
    eyebrow: 'Rahnuma · Update',
    eyebrowColor: 'text-[#0F766E]',
    titleColor: 'text-slate-900',
    descColor: 'text-slate-600',
    actionColor: 'text-[#064E3B] hover:text-[#053B2D]',
    progressColor: 'bg-[#0F766E]',
    Icon: Info,
  },
  warning: {
    container: 'border-rose-300 bg-rose-50 shadow-lg shadow-rose-950/10',
    accentBar: 'bg-rose-700',
    iconWrap: 'bg-rose-100 text-rose-700',
    eyebrow: 'Rahnuma · Safeguarding Alert',
    eyebrowColor: 'text-rose-800',
    titleColor: 'text-rose-950',
    descColor: 'text-rose-900',
    actionColor: 'text-rose-900 hover:text-rose-950',
    progressColor: 'bg-rose-700',
    Icon: ShieldAlert,
  },
};

function ToastCard({
  toast,
  onDismiss,
  onNavigate,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
  onNavigate: (view: NonNullable<ToastItem['action']>['view']) => void;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const remainingRef = useRef<number>(toast.durationMs);
  const style = TONE_STYLES[toast.tone];
  const Icon = style.Icon;

  useEffect(() => {
    if (isPaused) return;
    const startedAt = Date.now();
    const delay = Math.max(0, remainingRef.current);
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, delay);

    return () => {
      clearTimeout(timer);
      const elapsed = Date.now() - startedAt;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    };
  }, [isPaused, onDismiss, toast.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      role={toast.tone === 'warning' ? 'alert' : 'status'}
      aria-live={toast.tone === 'warning' ? 'assertive' : 'polite'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border ${style.container}`}
    >
      <div className={`absolute inset-y-0 left-0 w-1 ${style.accentBar}`} aria-hidden="true" />

      <div className="flex items-start gap-3 py-3.5 pl-4 pr-3.5">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.iconWrap}`}
        >
          <Icon
            className={`h-4 w-4 ${style.iconFill ? 'fill-[#D97706] text-[#D97706]' : ''}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${style.eyebrowColor}`}>
            {style.eyebrow}
          </p>
          <p className={`mt-0.5 text-xs font-bold leading-snug ${style.titleColor}`}>
            {toast.title}
          </p>
          {toast.description && (
            <p className={`mt-0.5 text-xs leading-relaxed ${style.descColor}`}>
              {toast.description}
            </p>
          )}
          {toast.action?.view && (
            <button
              type="button"
              onClick={() => {
                onNavigate(toast.action?.view);
                onDismiss(toast.id);
              }}
              className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold underline underline-offset-2 ${style.actionColor}`}
            >
              {toast.action.label}
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>

        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="h-0.5 w-full bg-slate-100/80">
        <div
          className={`h-full w-full origin-left ${style.progressColor}`}
          style={{
            animationName: 'toast-shrink',
            animationDuration: `${toast.durationMs}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        />
      </div>
    </motion.div>
  );
}

export default function ToastContainer() {
  const { toasts, dismissToast, setActiveView } = usePortal();

  return (
    <div
      role="region"
      aria-label="Portal notifications"
      className="pointer-events-none fixed bottom-4 left-4 right-4 z-[60] flex flex-col gap-2.5 sm:bottom-5 sm:left-auto sm:right-5 sm:w-[390px]"
    >
      <AnimatePresence initial={false} mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
            onNavigate={(view) => {
              if (view) setActiveView(view);
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
