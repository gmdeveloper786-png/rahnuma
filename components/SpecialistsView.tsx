'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Star,
  CheckCircle2,
  ArrowLeft,
  Video,
  Phone,
  MessageSquareLock,
  FileText,
  Clock,
  ShieldCheck,
  Calendar,
  Bookmark,
} from 'lucide-react';
import { usePortal } from '@/context/PortalContext';
import { MEDIA_ASSETS } from '@/lib/media';
import { SpecialistListSkeleton, SpecialistProfileSkeleton } from '@/components/Skeletons';
import type { ConsultationMode, SpecialistProfile } from '@/types/rahnuma';

const DISCIPLINES = [
  'All',
  'Mufti / Islamic Scholar',
  'Family Counsellor',
  'Mental Health Specialist',
  'Islamic Legal Advisor',
];

const SPECIALTIES = [
  'All',
  'Talaq & Khula',
  'Marital Conflict',
  'Inheritance (Mirath)',
  'Parenting & Custody',
  'Grief & Emotional Distress',
  'Domestic Safety Support',
  'Financial Rights',
  'Marriage & Nikah',
];

const MODE_LABELS: Array<{ id: ConsultationMode; label: string; icon: typeof Video }> = [
  { id: 'video', label: 'Video Call', icon: Video },
  { id: 'audio', label: 'Audio Call', icon: Phone },
  { id: 'text', label: 'Async Text', icon: MessageSquareLock },
  { id: 'written', label: 'Written Guidance', icon: FileText },
];

export default function SpecialistsView() {
  const {
    store,
    isHydrated,
    isAuthenticated,
    setAuthModalOpen,
    directoryFilter,
    setDirectoryFilter,
    selectedSpecialistId,
    setSelectedSpecialistId,
    openBookingModal,
    bookAppointment,
    submitSpecialistReview,
    setActiveView,
    savedSpecialistIds,
    isBookmarked,
    toggleBookmark,
    recordActivity,
  } = usePortal();

  const [freeOnly, setFreeOnly] = useState(false);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isOpeningProfile, setIsOpeningProfile] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profileTab, setProfileTab] = useState<
    'overview' | 'slots' | 'reviews' | 'credentials' | 'faqs'
  >('overview');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContext, setReviewContext] = useState('');
  const [reviewQuote, setReviewQuote] = useState('');

  // Sticky booking form state inside Profile view
  const [stickyMode, setStickyMode] = useState<ConsultationMode>('text');
  const [stickySlotId, setStickySlotId] = useState('');
  const [stickyDiscreet, setStickyDiscreet] = useState(true);
  const [stickyNote, setStickyNote] = useState('');

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const triggerFilterSkeleton = () => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    setIsFiltering(true);
    transitionTimerRef.current = setTimeout(() => {
      setIsFiltering(false);
    }, 220);
  };

  const handleOpenProfile = (id: string) => {
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    setSelectedSpecialistId(id);
    setIsOpeningProfile(true);
    transitionTimerRef.current = setTimeout(() => {
      setIsOpeningProfile(false);
    }, 180);
  };

  const filteredSpecialists = useMemo(() => {
    return store.specialists.filter((s) => {
      if (directoryFilter.discipline !== 'All' && s.discipline !== directoryFilter.discipline) {
        return false;
      }
      if (
        directoryFilter.specialty !== 'All' &&
        !s.specialties.includes(directoryFilter.specialty)
      ) {
        return false;
      }
      if (freeOnly && s.feeAmount > 0) return false;
      if (bookmarkedOnly && !isBookmarked('specialist', s.id)) return false;
      if (directoryFilter.query.trim()) {
        const q = directoryFilter.query.toLowerCase();
        const hay = `${s.name} ${s.discipline} ${s.title} ${s.credentials} ${s.specialties.join(
          ' '
        )} ${s.languages.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookmarkedOnly, directoryFilter, freeOnly, isBookmarked, store.specialists]);

  const activeSpecialist: SpecialistProfile | undefined = useMemo(
    () => store.specialists.find((s) => s.id === selectedSpecialistId),
    [selectedSpecialistId, store.specialists]
  );

  const lastViewedSpecialistRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isHydrated || !activeSpecialist) return;
    if (lastViewedSpecialistRef.current === activeSpecialist.id) return;
    lastViewedSpecialistRef.current = activeSpecialist.id;
    recordActivity({
      key: `specialist:${activeSpecialist.id}`,
      type: 'specialist',
      itemId: activeSpecialist.id,
      title: activeSpecialist.name,
      subtitle: `${activeSpecialist.discipline} · ${activeSpecialist.waitTime}`,
      href: `/specialists/${activeSpecialist.id}`,
      interaction: 'Viewed',
    });
  }, [activeSpecialist, isHydrated, recordActivity]);

  if (!isHydrated) {
    return selectedSpecialistId ? (
      <SpecialistProfileSkeleton />
    ) : (
      <SpecialistListSkeleton showHeaderAndFilters count={4} />
    );
  }

  if (activeSpecialist) {
    if (isOpeningProfile) {
      return <SpecialistProfileSkeleton />;
    }
    const openSlots = activeSpecialist.slots.filter((sl) => !sl.isBooked);
    const chosenSlotId =
      openSlots.some((sl) => sl.id === stickySlotId) ? stickySlotId : openSlots[0]?.id || '';

    const handleStickyBook = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chosenSlotId) return;
      const ok = bookAppointment({
        specialistId: activeSpecialist.id,
        slotId: chosenSlotId,
        mode: stickyMode,
        discreetReminder: stickyDiscreet,
        initialNote: stickyNote,
      });
      if (ok) {
        setStickyNote('');
        setActiveView('portal');
      }
    };

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setSelectedSpecialistId(null)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#064E3B]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Specialist Directory
        </button>

        {/* Oladoc-style Specialist Header Card */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-start gap-5">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                <Image
                  src={MEDIA_ASSETS[activeSpecialist.imageKey]}
                  alt={activeSpecialist.name}
                  fill
                  sizes="96px"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-slate-900">
                    {activeSpecialist.name}
                  </h1>
                  {activeSpecialist.isVerified && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  )}
                </div>
                <p className="mt-0.5 text-sm font-semibold text-[#064E3B]">
                  {activeSpecialist.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">{activeSpecialist.credentials}</p>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 tabular-nums">
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                    <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    {activeSpecialist.rating.toFixed(1)} ({activeSpecialist.reviewCount} reviews)
                  </span>
                  <span className="text-slate-300">·</span>
                  <span>{activeSpecialist.experienceYears} Yrs Experience</span>
                  <span className="text-slate-300">·</span>
                  <span>{activeSpecialist.satisfiedPercent}% Satisfied</span>
                  <span className="text-slate-300">·</span>
                  <span>Languages: {activeSpecialist.languages.join(', ')}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <p className="text-xs text-slate-500">Consultation Fee</p>
              <p className="font-mono text-xl font-bold text-slate-900 tabular-nums">
                {activeSpecialist.feeAmount === 0
                  ? 'Free Community Care'
                  : `PKR ${activeSpecialist.feeAmount.toLocaleString()}`}
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Typical response: {activeSpecialist.waitTime}
              </p>
              <button
                type="button"
                aria-pressed={isBookmarked('specialist', activeSpecialist.id)}
                onClick={() => toggleBookmark('specialist', activeSpecialist.id)}
                className={`mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isBookmarked('specialist', activeSpecialist.id)
                    ? 'border-amber-300 bg-amber-50 text-[#D97706]'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark
                  className={`h-3.5 w-3.5 ${
                    isBookmarked('specialist', activeSpecialist.id)
                      ? 'fill-[#D97706] text-[#D97706]'
                      : ''
                  }`}
                />
                {isBookmarked('specialist', activeSpecialist.id)
                  ? 'Bookmarked Specialist'
                  : 'Bookmark Specialist'}
              </button>
            </div>
          </div>
        </div>

        {/* Oladoc-style Tabs + Sticky Right Booking Sidebar */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-8">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5">
              {(
                [
                  ['overview', 'Overview & Focus'],
                  ['slots', 'Available Slots'],
                  [
                    'reviews',
                    `Member Reviews (${
                      store.reviews.filter((r) => r.specialistId === activeSpecialist.id).length
                    })`,
                  ],
                  ['credentials', 'Credentials & Ethics'],
                  ['faqs', 'Session FAQs'],
                ] as const
              ).map(([tabId, label]) => (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => setProfileTab(tabId)}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                    profileTab === tabId
                      ? 'bg-[#064E3B] text-white'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
              {profileTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      About &amp; Practice Approach
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {activeSpecialist.bio}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="text-sm font-semibold text-slate-900">Core Areas of Guidance</h3>
                    <p className="mt-2 text-sm text-slate-700">
                      {activeSpecialist.specialties.join('  ·  ')}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-5">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Supported Consultation Formats
                    </h3>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {MODE_LABELS.map((m) => {
                        const Icon = m.icon;
                        return (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-700"
                          >
                            <Icon className="h-4 w-4 text-[#064E3B]" />
                            {m.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {profileTab === 'slots' && (
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Upcoming Consultation Slots
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Select any open time slot below or in the booking panel to reserve your session.
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {activeSpecialist.slots.map((sl) => (
                      <button
                        key={sl.id}
                        type="button"
                        disabled={sl.isBooked}
                        onClick={() => setStickySlotId(sl.id)}
                        className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-xs transition-colors ${
                          sl.isBooked
                            ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                            : chosenSlotId === sl.id
                            ? 'border-[#064E3B] bg-[#ECFDF5] text-[#064E3B]'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-[#064E3B]'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{sl.date}</p>
                          <p className="mt-0.5 font-mono tabular-nums">{sl.time}</p>
                        </div>
                        <span className="font-semibold">
                          {sl.isBooked ? 'Reserved' : chosenSlotId === sl.id ? 'Selected' : 'Open'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {profileTab === 'reviews' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      Confidential Member Reviews
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Published with protected pseudonyms. New reviews dynamically update this
                      practitioner&apos;s rating and satisfaction score.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {store.reviews.filter((r) => r.specialistId === activeSpecialist.id).length ===
                    0 ? (
                      <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                        No written testimonials yet for this practitioner. Be the first to share
                        confidential feedback below.
                      </p>
                    ) : (
                      store.reviews
                        .filter((r) => r.specialistId === activeSpecialist.id)
                        .map((rev) => (
                          <div
                            key={rev.id}
                            className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1 text-[#F59E0B]">
                                {Array.from({ length: rev.rating }).map((_, idx) => (
                                  <Star key={idx} className="h-3.5 w-3.5 fill-current" />
                                ))}
                              </div>
                              <span className="font-mono text-[11px] text-slate-400">
                                {rev.createdAt}
                              </span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-slate-700">
                              &ldquo;{rev.quote}&rdquo;
                            </p>
                            <p className="mt-2 text-[11px] font-semibold text-slate-900">
                              {rev.authorDisplay}{' '}
                              <span className="font-normal text-slate-500">· {rev.context}</span>
                            </p>
                          </div>
                        ))
                    )}
                  </div>

                  <div className="border-t border-slate-200 pt-5">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Share Your Consultation Feedback
                    </h3>
                    {!isAuthenticated ? (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                        <span>Sign in to submit a verified, pseudonym-protected review.</span>
                        <button
                          type="button"
                          onClick={() => setAuthModalOpen(true)}
                          className="rounded-lg bg-[#064E3B] px-3.5 py-2 font-semibold text-white hover:bg-[#053B2D]"
                        >
                          Sign In to Review
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (reviewQuote.trim().length < 10) return;
                          submitSpecialistReview({
                            specialistId: activeSpecialist.id,
                            context: reviewContext || activeSpecialist.specialties[0] || 'Consultation',
                            rating: reviewRating,
                            quote: reviewQuote,
                          });
                          setReviewContext('');
                          setReviewQuote('');
                          setReviewRating(5);
                        }}
                        className="mt-3 space-y-3"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="spec-review-rating"
                              className="block text-xs font-semibold text-slate-700"
                            >
                              Rating
                            </label>
                            <select
                              id="spec-review-rating"
                              name="reviewRating"
                              value={reviewRating}
                              onChange={(e) => setReviewRating(Number(e.target.value))}
                              className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                            >
                              <option value={5}>5 Stars — Excellent</option>
                              <option value={4}>4 Stars — Very Helpful</option>
                              <option value={3}>3 Stars — Satisfactory</option>
                              <option value={2}>2 Stars — Needs Improvement</option>
                              <option value={1}>1 Star — Unsatisfied</option>
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="spec-review-context"
                              className="block text-xs font-semibold text-slate-700"
                            >
                              Consultation Topic
                            </label>
                            <input
                              id="spec-review-context"
                              name="reviewContext"
                              type="text"
                              value={reviewContext}
                              onChange={(e) => setReviewContext(e.target.value)}
                              placeholder="e.g., Khula & Family Guidance"
                              className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            htmlFor="spec-review-quote"
                            className="block text-xs font-semibold text-slate-700"
                          >
                            Your Feedback *
                          </label>
                          <textarea
                            id="spec-review-quote"
                            name="reviewQuote"
                            rows={3}
                            required
                            minLength={10}
                            value={reviewQuote}
                            onChange={(e) => setReviewQuote(e.target.value)}
                            placeholder="Share how this session helped you (min 10 characters)..."
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                          />
                        </div>
                        <button
                          type="submit"
                          className="rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                        >
                          Submit Confidential Review
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {profileTab === 'credentials' && (
                <div className="space-y-4">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Verified Credentials &amp; Safeguarding Policy
                  </h2>
                  <p className="text-sm text-slate-700">
                    <strong>Qualifications:</strong> {activeSpecialist.credentials}
                  </p>
                  <p className="text-sm text-slate-700">
                    <strong>Couples Mediation Policy:</strong>{' '}
                    {activeSpecialist.supportsCouplesMediation
                      ? 'Available for mutual mediation only when safeguarding screening confirms zero coercion or domestic abuse.'
                      : 'Focuses strictly on individual wellbeing, trauma recovery, or legal rights protection.'}
                  </p>
                  <p className="text-sm text-slate-700">
                    <strong>Session Recording:</strong> Disabled by default across all audio and
                    video sessions to protect family confidentiality.
                  </p>
                </div>
              )}

              {profileTab === 'faqs' && (
                <div className="space-y-4 text-sm text-slate-700">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Consultation Questions
                  </h2>
                  <div>
                    <p className="font-semibold text-slate-900">Can I book using a pseudonym?</p>
                    <p className="mt-1 text-slate-600">
                      Yes. When your Member Profile has Pseudonym Mode enabled, only your protected
                      alias appears on appointment rosters.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      What happens if I choose Async Text Consultation?
                    </p>
                    <p className="mt-1 text-slate-600">
                      A private thread opens immediately in your Member Portal where you and the
                      specialist exchange structured replies securely without needing live camera
                      time.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Right Booking Panel (Oladoc pattern) */}
          <aside className="lg:sticky lg:top-24 lg:col-span-4">
            <form
              onSubmit={handleStickyBook}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="font-display text-base font-bold text-slate-900">
                Book Consultation
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Recording disabled by default · Discreet reminders
              </p>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700">
                  Consultation Format
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {MODE_LABELS.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setStickyMode(m.id)}
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                          stickyMode === m.id
                            ? 'border-[#064E3B] bg-[#ECFDF5] text-[#064E3B]'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700">
                  Select Available Slot
                </label>
                {openSlots.length === 0 ? (
                  <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    No open slots right now. Submit a Private Case for coordinator scheduling.
                  </p>
                ) : (
                  <select
                    value={chosenSlotId}
                    onChange={(e) => setStickySlotId(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-800 focus:border-[#064E3B] focus:outline-none"
                  >
                    {openSlots.map((sl) => (
                      <option key={sl.id} value={sl.id}>
                        {sl.date} — {sl.time}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-700">
                  Brief Context (Optional)
                </label>
                <textarea
                  rows={3}
                  value={stickyNote}
                  onChange={(e) => setStickyNote(e.target.value)}
                  placeholder="Share a short summary to open your consultation thread..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#064E3B] focus:outline-none"
                />
              </div>

              <label className="mt-3 flex items-start gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={stickyDiscreet}
                  onChange={(e) => setStickyDiscreet(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#064E3B]"
                />
                <span>Use discreet reminders (hide topic details in alerts)</span>
              </label>

              <button
                type="submit"
                disabled={openSlots.length === 0}
                className="mt-5 w-full rounded-lg bg-[#064E3B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#053B2D] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {activeSpecialist.feeAmount === 0
                  ? 'Confirm Free Consultation'
                  : `Confirm Booking · PKR ${activeSpecialist.feeAmount.toLocaleString()}`}
              </button>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-[#064E3B]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#064E3B]" />
                <span>Your identity stays anonymous and your data secure.</span>
              </div>
            </form>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Verified Scholars &amp; Counselling Specialists
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse qualified Muftis, family counsellors, clinical psychologists, and Islamic legal
            advisors.
          </p>
        </div>
        <p className="font-mono text-xs text-slate-500 tabular-nums">
          Showing {filteredSpecialists.length} verified practitioners
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-12">
        <div className="relative lg:col-span-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="directory-search"
            name="directorySearch"
            aria-label="Search specialists by name, credential, or topic"
            type="text"
            value={directoryFilter.query}
            onChange={(e) => {
              setDirectoryFilter({ ...directoryFilter, query: e.target.value });
              triggerFilterSkeleton();
            }}
            placeholder="Search by name, credential, or topic..."
            className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#064E3B] focus:outline-none"
          />
        </div>

        <select
          id="directory-discipline"
          name="discipline"
          aria-label="Filter by discipline"
          value={directoryFilter.discipline}
          onChange={(e) => {
            setDirectoryFilter({ ...directoryFilter, discipline: e.target.value });
            triggerFilterSkeleton();
          }}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-[#064E3B] focus:outline-none lg:col-span-2"
        >
          {DISCIPLINES.map((d) => (
            <option key={d} value={d}>
              {d === 'All' ? 'All Disciplines' : d}
            </option>
          ))}
        </select>

        <select
          id="directory-specialty"
          name="specialty"
          aria-label="Filter by concern"
          value={directoryFilter.specialty}
          onChange={(e) => {
            setDirectoryFilter({ ...directoryFilter, specialty: e.target.value });
            triggerFilterSkeleton();
          }}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-[#064E3B] focus:outline-none lg:col-span-2"
        >
          {SPECIALTIES.map((sp) => (
            <option key={sp} value={sp}>
              {sp === 'All' ? 'All Concerns & Topics' : sp}
            </option>
          ))}
        </select>

        <label
          htmlFor="directory-free-only"
          className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 lg:col-span-2"
        >
          <input
            id="directory-free-only"
            name="freeOnly"
            type="checkbox"
            checked={freeOnly}
            onChange={(e) => {
              setFreeOnly(e.target.checked);
              triggerFilterSkeleton();
            }}
            className="rounded border-slate-300 text-[#064E3B]"
          />
          <span>Free Support Only</span>
        </label>

        <button
          type="button"
          aria-pressed={bookmarkedOnly}
          onClick={() => {
            setBookmarkedOnly((prev) => !prev);
            triggerFilterSkeleton();
          }}
          className={`flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors lg:col-span-2 ${
            bookmarkedOnly
              ? 'border-amber-300 bg-amber-50 text-[#D97706]'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Bookmark
            className={`h-3.5 w-3.5 ${
              bookmarkedOnly ? 'fill-[#D97706] text-[#D97706]' : 'text-slate-500'
            }`}
          />
          <span>Bookmarked ({savedSpecialistIds.length})</span>
        </button>
      </div>

      {/* Listing Cards (Oladoc Horizontal Layout) */}
      <div className="mt-6 space-y-4" aria-busy={isFiltering}>
        {isFiltering ? (
          <SpecialistListSkeleton showHeaderAndFilters={false} count={4} />
        ) : filteredSpecialists.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-base font-semibold text-slate-900">
              No specialists match your current filters
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Reset filters or submit a Private Case for coordinator matching.
            </p>
            <button
              type="button"
              onClick={() => {
                setDirectoryFilter({ query: '', discipline: 'All', specialty: 'All' });
                setFreeOnly(false);
                setBookmarkedOnly(false);
                triggerFilterSkeleton();
              }}
              className="mt-4 rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredSpecialists.map((spec, idx) => {
            const openCount = spec.slots.filter((sl) => !sl.isBooked).length;
            return (
              <div
                key={spec.id}
                className="flex flex-col justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-sm lg:flex-row lg:items-center"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    <Image
                      src={MEDIA_ASSETS[spec.imageKey]}
                      alt={spec.name}
                      fill
                      priority={idx === 0}
                      sizes="96px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-lg font-bold text-slate-900">
                        {spec.name}
                      </h2>
                      {spec.isVerified && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#064E3B]">{spec.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{spec.credentials}</p>

                    <p className="mt-2 text-xs text-slate-500">
                      Focus: {spec.specialties.join(' · ')}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-700 tabular-nums">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                        <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                        {spec.rating.toFixed(1)} ({spec.reviewCount} reviews)
                      </span>
                      <div>
                        <span className="text-slate-400">Experience: </span>
                        <span className="font-semibold">{spec.experienceYears} Yrs</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Satisfied: </span>
                        <span className="font-semibold">{spec.satisfiedPercent}%</span>
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{spec.waitTime}</span>
                      </div>
                      <div className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{openCount} open slots</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:w-52 lg:flex-col">
                  <button
                    type="button"
                    aria-pressed={isBookmarked('specialist', spec.id)}
                    onClick={() => toggleBookmark('specialist', spec.id)}
                    className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-4 py-2 text-xs font-semibold transition-colors ${
                      isBookmarked('specialist', spec.id)
                        ? 'border-amber-300 bg-amber-50 text-[#D97706]'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Bookmark
                      className={`h-3.5 w-3.5 ${
                        isBookmarked('specialist', spec.id)
                          ? 'fill-[#D97706] text-[#D97706]'
                          : ''
                      }`}
                    />
                    {isBookmarked('specialist', spec.id) ? 'Bookmarked' : 'Bookmark'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenProfile(spec.id)}
                    className="whitespace-nowrap rounded-lg border border-[#064E3B] px-4 py-2.5 text-center text-xs font-semibold text-[#064E3B] transition-colors hover:bg-[#ECFDF5]"
                  >
                    View Profile &amp; Slots
                  </button>
                  <button
                    type="button"
                    onClick={() => openBookingModal(spec)}
                    className="whitespace-nowrap rounded-lg bg-[#064E3B] px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-[#053B2D]"
                  >
                    {spec.feeAmount === 0
                      ? 'Book Consultation · Free'
                      : `Book Consultation · PKR ${spec.feeAmount.toLocaleString()}`}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
