'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  MessageSquarePlus,
  Scale,
  ShieldCheck,
  ThumbsUp,
} from 'lucide-react';
import { usePortal } from '@/context/PortalContext';
import { MEDIA_ASSETS } from '@/lib/media';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import { ArticleDetailSkeleton } from '@/components/Skeletons';

export default function KnowledgeDetailView({
  mode,
  itemKey,
}: {
  mode: 'fatwa' | 'article';
  itemKey: string;
}) {
  const {
    store,
    isHydrated,
    isBookmarked,
    toggleBookmark,
    markHelpful,
    requestArticleTakedown,
    navigateToDirectory,
    setAskFatwaModalOpen,
    openBookingModal,
    recordActivity,
  } = usePortal();

  const articleRef = useRef<HTMLElement | null>(null);
  const decodedKey = decodeURIComponent(itemKey);

  const fatwa = useMemo(() => {
    if (mode !== 'fatwa') return undefined;
    return store.fatwas.find(
      (f) => f.id === decodedKey || f.referenceCode.toLowerCase() === decodedKey.toLowerCase()
    );
  }, [decodedKey, mode, store.fatwas]);

  const article = useMemo(() => {
    if (mode !== 'article') return undefined;
    return store.articles.find(
      (a) => a.slug === decodedKey || a.id === decodedKey
    );
  }, [decodedKey, mode, store.articles]);

  const assignedScholar = useMemo(() => {
    if (!fatwa) return undefined;
    return store.specialists.find((s) => s.id === fatwa.assignedScholarId);
  }, [fatwa, store.specialists]);

  const relatedFatwas = useMemo(() => {
    if (!fatwa) return [];
    return store.fatwas
      .filter((f) => f.status === 'Published' && f.id !== fatwa.id)
      .slice(0, 2);
  }, [fatwa, store.fatwas]);

  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return store.articles
      .filter((a) => a.status === 'Published' && a.id !== article.id)
      .slice(0, 2);
  }, [article, store.articles]);

  const lastTrackedViewRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isHydrated) return;
    if (mode === 'fatwa' && fatwa) {
      const viewKey = `fatwa:${fatwa.id}`;
      if (lastTrackedViewRef.current === viewKey) return;
      lastTrackedViewRef.current = viewKey;
      recordActivity({
        key: viewKey,
        type: 'fatwa',
        itemId: fatwa.id,
        title: fatwa.questionTitle,
        subtitle: `${fatwa.referenceCode} · ${fatwa.schoolOfThought}`,
        href: `/fatwas/${fatwa.id}`,
        interaction: 'Viewed',
      });
    } else if (mode === 'article' && article) {
      const viewKey = `article:${article.id}`;
      if (lastTrackedViewRef.current === viewKey) return;
      lastTrackedViewRef.current = viewKey;
      recordActivity({
        key: viewKey,
        type: 'article',
        itemId: article.id,
        title: article.title,
        subtitle: `${article.type} · ${article.readMinutes} min read`,
        href: `/knowledge/${article.slug}`,
        interaction: 'Viewed',
      });
    }
  }, [article, fatwa, isHydrated, mode, recordActivity]);

  if (!isHydrated) {
    return <ArticleDetailSkeleton />;
  }

  if (mode === 'fatwa') {
    if (!fatwa) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-10">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Verified Fatwa Not Found
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              The requested ruling could not be found in the published archive.
            </p>
            <Link
              href="/fatwas"
              className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#053B2D]"
            >
              Return to Fatwa Repository <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      );
    }

    const saved = isBookmarked('fatwa', fatwa.id);

    return (
      <>
        <ReadingProgressBar
          targetRef={articleRef}
          backHref="/fatwas"
          backLabel="Back to Verified Fatwas"
          metaText={`${fatwa.referenceCode} · ${fatwa.schoolOfThought}`}
          isBookmarked={saved}
          onToggleBookmark={() => toggleBookmark('fatwa', fatwa.id)}
        />

        <article
          ref={articleRef}
          className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
        >
          {/* Editorial Header */}
          <header className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#064E3B]">
              <BookOpen className="h-4 w-4" />
              <span>Verified Scholarly Ruling</span>
              <span className="text-slate-300">·</span>
              <span>{fatwa.category}</span>
              <span className="text-slate-300">·</span>
              <span className="font-mono text-slate-600">{fatwa.schoolOfThought}</span>
            </div>

            <h1
              className="mt-3 font-display text-2xl font-bold leading-snug text-slate-900 sm:text-3xl"
              style={{ textWrap: 'balance' }}
            >
              {fatwa.questionTitle}
            </h1>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {fatwa.scholarName}
                </span>
                <span className="inline-flex items-center gap-1 font-mono tabular-nums">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Issued {fatwa.issuedAt}
                </span>
                <span className="font-mono text-slate-500 tabular-nums">
                  {fatwa.referenceCode} · {fatwa.version}
                </span>
              </div>

              <button
                type="button"
                onClick={() => markHelpful('fatwa', fatwa.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#064E3B] hover:text-[#064E3B] tabular-nums"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                Helpful ({fatwa.helpfulCount})
              </button>
            </div>
          </header>

          {/* Long-Form Body Sections */}
          <div className="mt-6 space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Submitted Question
              </p>
              <p className="mt-2.5 text-base leading-relaxed text-slate-800">
                {fatwa.questionBody}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#064E3B]">
                <Scale className="h-4 w-4" />
                <span>Authenticated Scholarly Ruling ({fatwa.schoolOfThought})</span>
              </div>

              <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-800">
                <p>{fatwa.rulingAnswer}</p>
                <p className="text-sm leading-relaxed text-slate-600">
                  Every Islamic ruling depends carefully on exact spoken wording, context,
                  witnesses, and documented agreements. While general jurisprudence clarifies
                  foundational obligations, personal marital, financial, or inheritance disputes
                  should always be verified directly with a qualified scholar who can review your
                  specific facts confidentially.
                </p>
              </div>

              {fatwa.revisionNote && (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-[#ECFDF5]/70 px-4 py-3 text-xs text-[#064E3B]">
                  <strong>Editorial Revision Note ({fatwa.version}):</strong> {fatwa.revisionNote}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Classical &amp; Scriptural References
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Primary Quranic, Hadith, and classical fiqh citations verified during peer review (
                {fatwa.reviewedAt}).
              </p>
              <ol className="mt-4 space-y-2.5 pl-5 text-sm text-slate-700 list-decimal">
                {fatwa.references.map((ref, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {ref}
                  </li>
                ))}
              </ol>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Applying This Guidance &amp; Next Steps
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-4 text-sm leading-relaxed text-slate-700 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">Need Situation-Specific Clarity?</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Submit a private question using a protected pseudonym if your circumstances
                    involve unique contracts, custody schedules, or verbal statements.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAskFatwaModalOpen(true)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#064E3B] hover:underline"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" /> Ask a Private Religious Question
                  </button>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">
                    Speak With a Specialist in {fatwa.category}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Connect with verified scholars, family counsellors, or Islamic legal advisors for
                    confidential video, audio, or async text guidance.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateToDirectory({ specialty: fatwa.category })}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#064E3B] hover:underline"
                  >
                    Browse Matching Specialists <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {assignedScholar && (
              <section className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    <Image
                      src={MEDIA_ASSETS[assignedScholar.imageKey]}
                      alt={assignedScholar.name}
                      fill
                      sizes="64px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#064E3B]">Authoring Scholar</p>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {assignedScholar.name}
                    </h3>
                    <p className="text-xs text-slate-600">{assignedScholar.credentials}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link
                    href={`/specialists/${assignedScholar.id}`}
                    className="rounded-lg border border-[#064E3B] px-3.5 py-2 text-xs font-semibold text-[#064E3B] hover:bg-[#ECFDF5]"
                  >
                    View Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => openBookingModal(assignedScholar)}
                    className="rounded-lg bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                  >
                    Book Consultation
                  </button>
                </div>
              </section>
            )}

            {relatedFatwas.length > 0 && (
              <section className="pt-2">
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Related Verified Rulings
                </h2>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {relatedFatwas.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/fatwas/${rel.id}`}
                      className="group rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:border-[#064E3B]/40 hover:shadow-sm"
                    >
                      <p className="font-mono text-[11px] text-slate-500">
                        {rel.referenceCode} · {rel.schoolOfThought}
                      </p>
                      <h3 className="mt-1.5 font-display text-sm font-bold text-slate-900 group-hover:text-[#064E3B]">
                        {rel.questionTitle}
                      </h3>
                      <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#064E3B]">
                        Read ruling <ArrowRight className="h-3.5 w-3.5" />
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </>
    );
  }

  // Knowledge Article Detail Page
  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-10">
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Educational Guide Not Found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The requested knowledge guide could not be found in the published hub.
          </p>
          <Link
            href="/knowledge"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#053B2D]"
          >
            Return to Knowledge Hub <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const savedArticle = isBookmarked('article', article.id);

  return (
    <>
      <ReadingProgressBar
        targetRef={articleRef}
        backHref="/knowledge"
        backLabel="Back to Knowledge Hub"
        metaText={`${article.readMinutes} min read · ${article.revisionNumber}`}
        isBookmarked={savedArticle}
        onToggleBookmark={() => toggleBookmark('article', article.id)}
      />

      <article
        ref={articleRef}
        className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
      >
        <header className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#064E3B]">
            <BookOpen className="h-4 w-4" />
            <span>{article.type}</span>
            <span className="text-slate-300">·</span>
            <span>{article.category}</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-slate-500">{article.revisionNumber}</span>
          </div>

          <h1
            className="mt-3 font-display text-2xl font-bold leading-snug text-slate-900 sm:text-3xl"
            style={{ textWrap: 'balance' }}
          >
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Reviewed by {article.approvedBy}
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {article.readMinutes} min read
              </span>
              <span className="font-mono text-slate-500 tabular-nums">
                Published {article.publishedAt}
              </span>
            </div>

            <button
              type="button"
              onClick={() => markHelpful('article', article.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#064E3B] hover:text-[#064E3B] tabular-nums"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Helpful ({article.helpfulCount})
            </button>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-[#ECFDF5] px-5 py-4 text-xs leading-relaxed text-[#064E3B]">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Consent-Verified &amp; De-Identified Derivative Guide:</strong> Published only
              after explicit member consent, complete removal of direct and indirect identifiers,
              safeguarding review, and scholarly verification.
            </span>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-slate-900">
              1. Case Context Summary
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700">{article.summary}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-slate-900">
              2. Authorized Islamic Guidance
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700">
              {article.islamicGuidance}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-slate-900">
              3. Civil-Law &amp; Documentation Considerations
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700">
              {article.civilConsiderations}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-slate-900">
              4. Counselling &amp; Support Pathways
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700">
              {article.counsellingOptions}
            </p>
            <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
              <Link
                href="/submit-case"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
              >
                Open Confidential Case <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => navigateToDirectory({ specialty: article.category })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Consult a Specialist in {article.category}
              </button>
            </div>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-xs text-slate-500">
            <span className="tabular-nums">
              Approved by {article.approvedBy} · Next scheduled review: {article.nextReviewDate}
            </span>
            <button
              type="button"
              onClick={() => requestArticleTakedown(article.id)}
              className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:text-rose-700"
            >
              <Flag className="h-3.5 w-3.5" /> Request Correction / Takedown
            </button>
          </footer>

          {relatedArticles.length > 0 && (
            <section className="pt-2">
              <h2 className="font-display text-lg font-bold text-slate-900">
                More Educational Guides
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/knowledge/${rel.slug}`}
                    className="group rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:border-[#064E3B]/40 hover:shadow-sm"
                  >
                    <p className="text-[11px] font-semibold text-[#064E3B]">
                      {rel.type} · {rel.readMinutes} min read
                    </p>
                    <h3 className="mt-1.5 font-display text-sm font-bold text-slate-900 group-hover:text-[#064E3B]">
                      {rel.title}
                    </h3>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#064E3B]">
                      Read guide <ArrowRight className="h-3.5 w-3.5" />
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
}
