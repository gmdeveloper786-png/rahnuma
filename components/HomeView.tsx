'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Search,
  Video,
  BookOpen,
  ShieldAlert,
  FileCheck2,
  MessageSquareLock,
  Scale,
  HeartHandshake,
  Brain,
  Users,
  Landmark,
  Baby,
  ChevronDown,
  ChevronRight,
  Star,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Bookmark,
  History,
  FileText,
  UserCheck,
  Trash2,
} from 'lucide-react';
import { usePortal } from '@/context/PortalContext';
import { MEDIA_ASSETS } from '@/lib/media';
import type { SpecialistDiscipline } from '@/types/rahnuma';

const CONCERNS = [
  { label: 'Talaq & Khula', icon: Scale, bg: 'bg-amber-50 text-amber-700' },
  { label: 'Marital Conflict', icon: HeartHandshake, bg: 'bg-[#ECFDF5] text-[#064E3B]' },
  { label: 'Inheritance (Mirath)', icon: Landmark, bg: 'bg-emerald-50 text-emerald-700' },
  { label: 'Parenting & Custody', icon: Baby, bg: 'bg-teal-50 text-teal-800' },
  { label: 'Grief & Emotional Distress', icon: Brain, bg: 'bg-[#ECFDF5] text-[#064E3B]' },
  { label: 'Domestic Safety Support', icon: ShieldAlert, bg: 'bg-rose-50 text-rose-700' },
  { label: 'Financial Rights', icon: BookOpen, bg: 'bg-slate-100 text-slate-700' },
];

const DISCIPLINES: Array<{
  label: string;
  discipline: SpecialistDiscipline;
  icon: typeof Users;
  bg: string;
}> = [
  {
    label: 'Mufti & Islamic Scholar',
    discipline: 'Mufti / Islamic Scholar',
    icon: BookOpen,
    bg: 'bg-[#ECFDF5] text-[#064E3B]',
  },
  {
    label: 'Family Counsellor',
    discipline: 'Family Counsellor',
    icon: HeartHandshake,
    bg: 'bg-amber-50 text-amber-700',
  },
  {
    label: 'Mental Health Specialist',
    discipline: 'Mental Health Specialist',
    icon: Brain,
    bg: 'bg-emerald-50 text-emerald-700',
  },
  {
    label: 'Islamic Legal Advisor',
    discipline: 'Islamic Legal Advisor',
    icon: Scale,
    bg: 'bg-slate-100 text-slate-700',
  },
];

const FAQS = [
  {
    q: 'How does Rahnuma protect my identity and family privacy?',
    a: 'You can interact using a protected pseudonym across cases and fatwa submissions. Discreet notification mode suppresses sensitive previews, private clinical notes are hidden from general administrators, and audio/video recording is disabled by default.',
  },
  {
    q: 'Are fatwas generated automatically or reviewed by real scholars?',
    a: 'Every ruling published in the Rahnuma Verified Fatwa Repository is authored, cited with classical references and school-of-thought context, and explicitly approved by qualified scholars. Automated systems never issue religious rulings.',
  },
  {
    q: 'What happens if a case involves domestic abuse or emotional crisis?',
    a: 'Submissions indicating suicide risk, self-harm, domestic violence, or coercion trigger an immediate Crisis Safeguarding Pathway. Couples mediation is automatically blocked, local emergency guidance is shown, and trained human triage prioritizes urgent review.',
  },
  {
    q: 'Can I choose between video, audio, async text, or written Islamic consultations?',
    a: 'Yes. Each specialist profile supports flexible consultation modes—scheduled video or audio sessions, private asynchronous text threads inside your dashboard, or formal written Islamic guidance.',
  },
  {
    q: 'How are public educational case guides created without exposing clients?',
    a: 'A closed case can only inform an educational article after explicit user consent, full removal of direct and indirect identifiers, a separate safeguarding review, and substantive approval from an authorized scholar or counsellor.',
  },
];

export default function HomeView() {
  const {
    store,
    setActiveView,
    navigateToDirectory,
    navigateToKnowledge,
    setSelectedSpecialistId,
    openBookingModal,
    setAskFatwaModalOpen,
    isBookmarked,
    toggleBookmark,
    recentActivity,
    clearRecentActivity,
  } = usePortal();

  const [heroTopic, setHeroTopic] = useState('All');
  const [heroQuery, setHeroQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroTopic === 'Verified Fatwas') {
      navigateToKnowledge('fatwas', 'All', heroQuery);
      return;
    }
    if (heroTopic === 'Knowledge Guides') {
      navigateToKnowledge('knowledge', 'All', heroQuery);
      return;
    }
    navigateToDirectory({
      query: heroQuery,
      specialty: heroTopic === 'All' ? 'All' : heroTopic,
    });
  };

  const featuredSpecialists = store.specialists.slice(0, 4);
  const recentItems = recentActivity.slice(0, 5);

  return (
    <div className="pb-16">
      {/* 1. Oladoc-Inspired Hero Search Banner */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#064E3B] via-[#043D2F] to-[#022C22] text-white">
          <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
            <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:col-span-7 lg:py-12">
              <p className="text-xs font-medium tracking-wide text-amber-300">
                Confidential guidance · Verified scholarship · Online counselling
              </p>
              <h1
                className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[42px]"
                style={{ textWrap: 'balance' }}
              >
                Find and Consult <span className="text-[#F59E0B]">Trusted Scholars</span> &amp;
                Family Counsellors
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200 sm:text-base">
                Search verified fatwas, submit private marital or inheritance queries, and book
                confidential online sessions with qualified Muftis, therapists, and legal advisors.
              </p>

              {/* Unified Search Widget */}
              <form
                onSubmit={handleHeroSearch}
                className="mt-7 flex flex-col gap-2 rounded-xl bg-white p-2 shadow-sm sm:flex-row sm:items-center"
              >
                <select
                  id="hero-search-category"
                  name="category"
                  aria-label="Select search category"
                  value={heroTopic}
                  onChange={(e) => setHeroTopic(e.target.value)}
                  className="h-11 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 focus:border-[#064E3B] focus:outline-none sm:w-48"
                >
                  <option value="All">All Concerns</option>
                  <option value="Talaq & Khula">Talaq &amp; Khula</option>
                  <option value="Marital Conflict">Marital Conflict</option>
                  <option value="Inheritance (Mirath)">Inheritance (Mirath)</option>
                  <option value="Parenting & Custody">Parenting &amp; Custody</option>
                  <option value="Grief & Emotional Distress">Grief &amp; Distress</option>
                  <option value="Verified Fatwas">Search Fatwas</option>
                  <option value="Knowledge Guides">Search Guides</option>
                </select>

                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="hero-search-query"
                    name="query"
                    aria-label="Search scholars, fatwas, or topics"
                    type="text"
                    value={heroQuery}
                    onChange={(e) => setHeroQuery(e.target.value)}
                    placeholder="Scholars, fatwas, Khula, custody, Mirath..."
                    className="h-11 w-full rounded-lg bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="h-11 whitespace-nowrap shrink-0 rounded-lg bg-[#064E3B] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#053B2D]"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right editorial counselling studio */}
            <div className="relative hidden min-h-[320px] lg:col-span-5 lg:block">
              <Image
                src={MEDIA_ASSETS.hero}
                alt="Serene Islamic and family counselling consultation studio"
                fill
                priority
                sizes="(min-width: 1024px) 42vw, 100vw"
                referrerPolicy="no-referrer"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#043D2F] via-[#043D2F]/45 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#022C22]/75 to-transparent" />
              <div className="absolute bottom-4 right-4 left-6 flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-[#022C22]/80 px-4 py-2.5 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B]/20 text-[#F59E0B]">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">100% Confidential Sessions</p>
                    <p className="text-[11px] text-emerald-200">
                      Verified Muftis · Family Counsellors · Legal Advisors
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Oladoc 5-Card Service Pillars Strip */}
      <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <button
            type="button"
            onClick={() => navigateToDirectory()}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-[#064E3B]/40 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#064E3B]">
              <Video className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-slate-900 group-hover:text-[#064E3B]">
                Online Counselling
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Scheduled video, audio, or private async text sessions.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAskFatwaModalOpen(true)}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-[#064E3B]/40 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-slate-900 group-hover:text-[#064E3B]">
                Ask a Mufti
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Submit a private religious query for scholarly review.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('submit-case')}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-[#064E3B]/40 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <MessageSquareLock className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-slate-900 group-hover:text-[#064E3B]">
                Confidential Case
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Guided triage with unique Case ID &amp; discreet alerts.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigateToKnowledge('fatwas')}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-[#064E3B]/40 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#064E3B]">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-slate-900 group-hover:text-[#064E3B]">
                Verified Fatwas
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Authenticated rulings cited by school of thought.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('safeguarding')}
            className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 text-left transition-all hover:border-rose-300 hover:shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-slate-900 group-hover:text-rose-700">
                Crisis Safeguarding
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Immediate support pathways &amp; protection resources.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* 2b. Recent Activity Section (Last 3-5 Viewed or Interacted Items) */}
      <section aria-labelledby="recent-activity-heading" className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ECFDF5] text-[#064E3B]">
              <History className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2
                id="recent-activity-heading"
                className="font-display text-lg font-bold text-slate-900 sm:text-xl"
              >
                Recent Activity
              </h2>
              <p className="text-xs text-slate-600">
                Quickly return to the last items you viewed, bookmarked, or submitted.
              </p>
            </div>
          </div>

          {recentItems.length > 0 && (
            <button
              type="button"
              onClick={clearRecentActivity}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Activity</span>
            </button>
          )}
        </div>

        {recentItems.length === 0 ? (
          <div className="mt-4 flex flex-col justify-between gap-4 rounded-xl border border-dashed border-slate-300 bg-white p-5 sm:flex-row sm:items-center">
            <p className="text-xs leading-relaxed text-slate-600">
              No recent activity yet. As you read verified fatwas, explore educational guides, view
              specialist profiles, or submit cases, your last 5 items will appear here.
            </p>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/fatwas"
                className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Browse Fatwas
              </Link>
              <Link
                href="/specialists"
                className="whitespace-nowrap rounded-lg bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
              >
                Explore Specialists
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {recentItems.map((item) => {
              const Icon =
                item.type === 'fatwa'
                  ? BookOpen
                  : item.type === 'article'
                  ? FileText
                  : item.type === 'specialist'
                  ? UserCheck
                  : MessageSquareLock;
              const iconBg =
                item.interaction === 'Bookmarked'
                  ? 'bg-amber-50 text-[#D97706]'
                  : item.type === 'case'
                  ? 'bg-teal-50 text-[#0F766E]'
                  : 'bg-[#ECFDF5] text-[#064E3B]';
              const typeLabel =
                item.type === 'fatwa'
                  ? 'Fatwa'
                  : item.type === 'article'
                  ? 'Knowledge Guide'
                  : item.type === 'specialist'
                  ? 'Specialist'
                  : 'Private Case';

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-slate-50 sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-[#064E3B]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {typeLabel} · {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden text-right sm:block">
                      <p
                        className={`text-xs font-semibold ${
                          item.interaction === 'Bookmarked'
                            ? 'text-[#D97706]'
                            : 'text-[#064E3B]'
                        }`}
                      >
                        {item.interaction}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400 tabular-nums">
                        {item.timestamp}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#064E3B]" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Oladoc Circular Grids: Specialists & Concerns */}
      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
              Consult Verified Specialists Online
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Connect with vetted scholars, family therapists, clinical psychologists, and legal advisors.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateToDirectory()}
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-sm font-semibold text-[#064E3B] hover:underline"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {DISCIPLINES.map((d) => {
            const Icon = d.icon;
            return (
              <button
                key={d.discipline}
                type="button"
                onClick={() => navigateToDirectory({ discipline: d.discipline })}
                className="group flex flex-col items-center rounded-xl border border-slate-200 bg-white p-6 text-center transition-all hover:border-[#064E3B]/40 hover:shadow-sm"
              >
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${d.bg} transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <span className="mt-3 text-sm font-semibold text-slate-800 group-hover:text-[#064E3B]">
                  {d.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-12 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
              Browse Guidance by Concern
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Explore scholar-reviewed fatwas and anonymized family case guides.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateToKnowledge('knowledge')}
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-sm font-semibold text-[#064E3B] hover:underline"
          >
            Knowledge Hub <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {CONCERNS.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => navigateToKnowledge('fatwas', c.label)}
                className="group flex flex-col items-center rounded-xl border border-slate-200 bg-white px-3 py-5 text-center transition-all hover:border-[#064E3B]/40 hover:shadow-sm"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${c.bg} transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="mt-3 text-xs font-semibold leading-snug text-slate-800 group-hover:text-[#064E3B]">
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Oladoc-Style Featured Specialists Listing */}
      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
              Verified Scholars &amp; Family Practitioners
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Transparent qualifications, languages, and real-time slot availability.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateToDirectory()}
            className="inline-flex items-center gap-1 whitespace-nowrap shrink-0 text-sm font-semibold text-[#064E3B] hover:underline"
          >
            Browse Directory <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {featuredSpecialists.map((spec) => (
            <motion.div
              key={spec.id}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  <Image
                    src={MEDIA_ASSETS[spec.imageKey]}
                    alt={spec.name}
                    fill
                    sizes="80px"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate font-display text-base font-bold text-slate-900">
                      {spec.name}
                    </h3>
                    {spec.isVerified && (
                      <CheckCircle2
                        aria-label="Verified credentials"
                        className="h-4 w-4 shrink-0 text-emerald-600"
                      />
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#064E3B]">{spec.discipline}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{spec.credentials}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 tabular-nums">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-slate-900">
                      <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      {spec.rating.toFixed(1)} ({spec.reviewCount})
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="whitespace-nowrap">{spec.experienceYears} Yrs Exp</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="whitespace-nowrap">{spec.satisfiedPercent}% Satisfied</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-row gap-2 sm:w-44 sm:flex-col">
                <button
                  type="button"
                  aria-pressed={isBookmarked('specialist', spec.id)}
                  onClick={() => toggleBookmark('specialist', spec.id)}
                  className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isBookmarked('specialist', spec.id)
                      ? 'border-amber-300 bg-amber-50 text-[#D97706]'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark
                    className={`h-3.5 w-3.5 ${
                      isBookmarked('specialist', spec.id) ? 'fill-[#D97706] text-[#D97706]' : ''
                    }`}
                  />
                  {isBookmarked('specialist', spec.id) ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSpecialistId(spec.id);
                  }}
                  className="flex-1 whitespace-nowrap rounded-lg border border-[#064E3B] px-3 py-2 text-center text-xs font-semibold text-[#064E3B] transition-colors hover:bg-[#ECFDF5]"
                >
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={() => openBookingModal(spec)}
                  className="flex-1 whitespace-nowrap rounded-lg bg-[#064E3B] px-3 py-2 text-center text-xs font-semibold text-white transition-colors hover:bg-[#053B2D]"
                >
                  {spec.feeAmount === 0
                    ? 'Book Free Session'
                    : `Book · PKR ${spec.feeAmount.toLocaleString()}`}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Community Feedback & Safeguarding Assurance (Claim-to-Proof Adjacency) */}
      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#064E3B]">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Confidentiality &amp; Ethical Boundaries
              </div>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                Built for Sensitive Family Matters Without Judgment
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Rahnuma maintains clear boundaries between religious rulings, psychological care,
                civil family law, and crisis protection. Pseudonyms and discreet notifications keep
                you safe at every step.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveView('submit-case')}
                  className="whitespace-nowrap rounded-lg bg-[#064E3B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#053B2D]"
                >
                  Open Private Case
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('portal')}
                  className="whitespace-nowrap rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Sign In to Portal
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
              {store.reviews.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-[#F8FAFC] p-4"
                >
                  <div>
                    <div className="flex gap-0.5 text-[#F59E0B]">
                      {Array.from({ length: t.rating }).map((_, s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-700">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                  <div className="mt-4 border-t border-slate-200 pt-3">
                    <p className="text-xs font-semibold text-slate-900">{t.authorDisplay}</p>
                    <p className="text-[11px] text-slate-500">{t.context}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Oladoc-Style Frequently Asked Questions */}
      <section className="mx-auto mt-14 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Everything you need to know about privacy, verified fatwas, and online counselling.
          </p>
        </div>

        <div className="mt-7 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {FAQS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="text-sm font-semibold text-slate-900">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm leading-relaxed text-slate-600">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
