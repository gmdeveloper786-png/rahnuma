'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePortal, VIEW_PATHS } from '@/context/PortalContext';
import type { PortalView } from '@/types/rahnuma';

const NAV_ITEMS: Array<{ view: PortalView; label: string; href: string }> = [
  { view: 'specialists', label: 'Specialists', href: VIEW_PATHS.specialists },
  { view: 'fatwas', label: 'Fatwas', href: VIEW_PATHS.fatwas },
  { view: 'knowledge', label: 'Knowledge Hub', href: VIEW_PATHS.knowledge },
  { view: 'submit-case', label: 'Private Case', href: VIEW_PATHS['submit-case'] },
  { view: 'safeguarding', label: 'Safeguarding', href: VIEW_PATHS.safeguarding },
];

export default function Header() {
  const { activeView, isAuthenticated } = usePortal();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMenu = () => {
    setMobileOpen(false);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <Link
          href="/"
          onClick={closeMenu}
          className="whitespace-nowrap shrink-0 text-left font-display text-xl font-bold tracking-tight text-[#064E3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] focus-visible:ring-offset-2"
        >
          RAHNUMA
        </Link>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.view;
            return (
              <Link
                key={item.view}
                href={item.href}
                onClick={closeMenu}
                className={`whitespace-nowrap shrink-0 border-b-2 py-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] ${
                  isActive
                    ? 'border-[#064E3B] text-[#064E3B] font-semibold'
                    : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={VIEW_PATHS.portal}
            onClick={closeMenu}
            className={`whitespace-nowrap shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] focus-visible:ring-offset-2 ${
              activeView === 'portal'
                ? 'bg-[#022C22] text-white'
                : 'bg-[#064E3B] text-white hover:bg-[#053B2D]'
            }`}
          >
            {isAuthenticated ? 'My Dashboard' : 'Portal Sign In'}
          </Link>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.view}
                href={item.href}
                onClick={closeMenu}
                className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  activeView === item.view
                    ? 'bg-[#ECFDF5] text-[#064E3B] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
