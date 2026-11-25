'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  FileCheck2,
  Lock,
  Menu,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { usePortal, VIEW_PATHS } from '@/context/PortalContext';
import RahnumaLogo from '@/components/RahnumaLogo';
import type { PortalView } from '@/types/rahnuma';

const SAFEGUARDING_RESOURCES = [
  {
    id: 'sg_crisis',
    title: 'Crisis Safeguarding & Emergency Helplines',
    subtitle: 'Immediate protection, 15 / 1122 / 1099 helplines & no-forced-mediation policy',
    href: VIEW_PATHS.safeguarding,
    keywords: 'abuse domestic violence child suicide self harm crisis emergency helpline protection safety threat coercive',
  },
  {
    id: 'sg_case',
    title: 'Submit a Confidential Private Case',
    subtitle: 'Pseudonym-protected intake with automatic safeguarding triage',
    href: VIEW_PATHS['submit-case'],
    keywords: 'private case submit confidential intake domestic abuse child abuse khula divorce nikah',
  },
];

const TOPBAR_POINTS = [
  {
    text: 'Book a free consultation—your identity stays anonymous and your data secure.',
    cta: 'Book Free Consultation →',
    href: VIEW_PATHS.specialists,
    icon: ShieldCheck,
  },
  {
    text: '100% Confidential · Pseudonym Protection & Discreet Notifications',
    cta: 'Submit Private Case →',
    href: VIEW_PATHS['submit-case'],
    icon: Lock,
  },
  {
    text: 'Verified Muftis, Family Counsellors, Psychologists & Legal Advisors Online',
    cta: 'Browse Specialists →',
    href: VIEW_PATHS.specialists,
    icon: Sparkles,
  },
];

const NAV_ITEMS: Array<{ view: PortalView; label: string; href: string }> = [
  { view: 'specialists', label: 'Specialists', href: VIEW_PATHS.specialists },
  { view: 'fatwas', label: 'Fatwas', href: VIEW_PATHS.fatwas },
  { view: 'knowledge', label: 'Knowledge Hub', href: VIEW_PATHS.knowledge },
  { view: 'submit-case', label: 'Private Case', href: VIEW_PATHS['submit-case'] },
  { view: 'safeguarding', label: 'Safeguarding', href: VIEW_PATHS.safeguarding },
];

export default function Header() {
  const {
    store,
    activeView,
    isAuthenticated,
    navigateToDirectory,
    navigateToKnowledge,
    logEmptySearch,
  } = usePortal();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 40);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return {
        specialists: store.specialists.slice(0, 3),
        fatwas: store.fatwas.filter((f) => f.status === 'Published').slice(0, 3),
        articles: store.articles.filter((a) => a.status === 'Published').slice(0, 2),
        safeguarding: SAFEGUARDING_RESOURCES,
      };
    }

    const specialists = store.specialists
      .filter(
        (s) =>
          s.name.toLowerCase().includes(normalizedQuery) ||
          s.discipline.toLowerCase().includes(normalizedQuery) ||
          s.title.toLowerCase().includes(normalizedQuery) ||
          s.specialties.some((sp) => sp.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, 4);

    const fatwas = store.fatwas
      .filter(
        (f) =>
          f.status === 'Published' &&
          (f.questionTitle.toLowerCase().includes(normalizedQuery) ||
            f.category.toLowerCase().includes(normalizedQuery) ||
            f.referenceCode.toLowerCase().includes(normalizedQuery) ||
            f.scholarName.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, 4);

    const articles = store.articles
      .filter(
        (a) =>
          a.status === 'Published' &&
          (a.title.toLowerCase().includes(normalizedQuery) ||
            a.category.toLowerCase().includes(normalizedQuery) ||
            a.summary.toLowerCase().includes(normalizedQuery))
      )
      .slice(0, 4);

    const safeguarding = SAFEGUARDING_RESOURCES.filter(
      (sg) =>
        sg.title.toLowerCase().includes(normalizedQuery) ||
        sg.subtitle.toLowerCase().includes(normalizedQuery) ||
        sg.keywords.includes(normalizedQuery)
    );

    return { specialists, fatwas, articles, safeguarding };
  }, [normalizedQuery, store.specialists, store.fatwas, store.articles]);

  const totalMatches =
    searchResults.specialists.length +
    searchResults.fatwas.length +
    searchResults.articles.length +
    searchResults.safeguarding.length;

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const navigateToResult = (href: string) => {
    closeSearch();
    setMobileOpen(false);
    router.push(href);
  };

  const closeMenu = () => {
    setMobileOpen(false);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      {/* Continuous Announcement Topbar Slider */}
      <div
        aria-label="Confidential consultation announcements"
        className="overflow-hidden border-b border-emerald-900/40 bg-[#022C22] text-white"
      >
        <div className="animate-topbar-marquee py-1.5 sm:py-2">
          {[0, 1].map((dupIdx) => (
            <div key={dupIdx} aria-hidden={dupIdx === 1} className="flex shrink-0 items-center">
              {TOPBAR_POINTS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={`${dupIdx}-${idx}`}
                    className="flex items-center gap-2 px-4 text-[11px] font-medium text-emerald-50 sm:gap-2.5 sm:px-7 sm:text-xs"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[#F59E0B]" />
                    <span className="whitespace-nowrap">{item.text}</span>
                    <Link
                      href={item.href}
                      tabIndex={dupIdx === 1 ? -1 : undefined}
                      onClick={closeMenu}
                      className="whitespace-nowrap font-semibold text-[#F59E0B] underline-offset-2 hover:text-amber-300 hover:underline"
                    >
                      {item.cta}
                    </Link>
                    <span aria-hidden="true" className="ml-4 h-1 w-1 rounded-full bg-emerald-500/60" />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-6 sm:px-6 lg:gap-8 lg:px-8">
        {/* Zone 1: Brand Logo */}
        <Link
          href="/"
          onClick={closeMenu}
          aria-label="Rahnuma Home"
          className="whitespace-nowrap shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] focus-visible:ring-offset-2"
        >
          <RahnumaLogo variant="light" />
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

        {/* Zone 3: Global Search + Primary Action */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            type="button"
            aria-label="Search specialists, fatwas, or safeguarding resources"
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-600 transition-colors hover:border-[#064E3B]/40 hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] md:w-auto md:px-3"
          >
            <Search className="h-4 w-4 text-[#064E3B]" />
            <span className="hidden md:inline">Search...</span>
          </button>

          <Link
            href={VIEW_PATHS.portal}
            onClick={closeMenu}
            className={`whitespace-nowrap shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#064E3B] focus-visible:ring-offset-2 sm:px-4 sm:text-sm ${
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
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

      {/* Global Search Palette Modal */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Global portal search"
          onClick={closeSearch}
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/50 px-4 pt-16 backdrop-blur-[2px] sm:pt-24"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!normalizedQuery) return;
                if (totalMatches === 0) {
                  logEmptySearch(searchQuery);
                }
                const firstHref =
                  searchResults.safeguarding[0]?.href ||
                  (searchResults.specialists[0]
                    ? `/specialists/${searchResults.specialists[0].id}`
                    : null) ||
                  (searchResults.fatwas[0] ? `/fatwas/${searchResults.fatwas[0].id}` : null) ||
                  (searchResults.articles[0]
                    ? `/knowledge/${searchResults.articles[0].slug}`
                    : null);
                if (firstHref) {
                  navigateToResult(firstHref);
                } else {
                  closeSearch();
                  navigateToDirectory({ query: searchQuery });
                }
              }}
              className="flex items-center gap-3 border-b border-slate-200 px-4 py-3"
            >
              <Search className="h-5 w-5 shrink-0 text-[#064E3B]" />
              <input
                ref={searchInputRef}
                id="global-portal-search"
                name="globalSearch"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Muftis, Khula, Mirath, domestic abuse, safeguarding..."
                className="h-9 flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-medium text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                aria-label="Close global search"
                onClick={closeSearch}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </form>

            <div className="max-h-[65vh] divide-y divide-slate-100 overflow-y-auto p-3">
              {totalMatches === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-semibold text-slate-900">
                    No direct matches for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try searching across the full Specialist Directory or Fatwa Repository.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        logEmptySearch(searchQuery);
                        const q = searchQuery;
                        closeSearch();
                        navigateToDirectory({ query: q });
                      }}
                      className="rounded-lg bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                    >
                      Search Specialists
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logEmptySearch(searchQuery);
                        const q = searchQuery;
                        closeSearch();
                        navigateToKnowledge('fatwas', 'All', q);
                      }}
                      className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Search Fatwas
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {searchResults.safeguarding.length > 0 && (
                    <div className="py-2">
                      <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                        Safeguarding &amp; Confidential Intake
                      </p>
                      {searchResults.safeguarding.map((sg) => (
                        <button
                          key={sg.id}
                          type="button"
                          onClick={() => navigateToResult(sg.href)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-rose-50/70"
                        >
                          <div className="flex items-start gap-3">
                            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                            <div>
                              <p className="text-xs font-semibold text-slate-900">{sg.title}</p>
                              <p className="text-[11px] text-slate-500">{sg.subtitle}</p>
                            </div>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.specialists.length > 0 && (
                    <div className="py-2">
                      <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#064E3B]">
                        Verified Specialists
                      </p>
                      {searchResults.specialists.map((spec) => (
                        <button
                          key={spec.id}
                          type="button"
                          onClick={() => navigateToResult(`/specialists/${spec.id}`)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#ECFDF5]/60"
                        >
                          <div className="flex items-start gap-3">
                            <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#064E3B]" />
                            <div>
                              <p className="text-xs font-semibold text-slate-900">{spec.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {spec.discipline} · {spec.specialties.slice(0, 2).join(', ')}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.fatwas.length > 0 && (
                    <div className="py-2">
                      <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                        Verified Fatwas
                      </p>
                      {searchResults.fatwas.map((fatwa) => (
                        <button
                          key={fatwa.id}
                          type="button"
                          onClick={() => navigateToResult(`/fatwas/${fatwa.id}`)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-amber-50/60"
                        >
                          <div className="flex items-start gap-3">
                            <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
                            <div>
                              <p className="text-xs font-semibold text-slate-900">
                                {fatwa.questionTitle}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {fatwa.referenceCode} · {fatwa.category} · {fatwa.scholarName}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.articles.length > 0 && (
                    <div className="py-2">
                      <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Knowledge Guides
                      </p>
                      {searchResults.articles.map((art) => (
                        <button
                          key={art.id}
                          type="button"
                          onClick={() => navigateToResult(`/knowledge/${art.slug}`)}
                          className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-start gap-3">
                            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                            <div>
                              <p className="text-xs font-semibold text-slate-900">{art.title}</p>
                              <p className="text-[11px] text-slate-500">
                                {art.category} · {art.readMinutes} min read
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#064E3B]">
                <Lock className="h-3 w-3" />
                Your identity stays anonymous and your data secure.
              </span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
