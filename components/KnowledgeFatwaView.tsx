'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  BookOpen,
  ThumbsUp,
  Bookmark,
  ArrowUpRight,
  CheckCircle2,
  MessageSquarePlus,
} from 'lucide-react';
import { usePortal } from '@/context/PortalContext';
import { MEDIA_ASSETS } from '@/lib/media';
import { FatwaArchiveSkeleton } from '@/components/Skeletons';

const CATEGORIES = [
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

const SCHOOLS = ['All', 'Hanafi', 'Maliki', 'Shafii', 'Hanbali', 'Comparative Fiqh'];

export default function KnowledgeFatwaView({ mode }: { mode: 'fatwas' | 'knowledge' }) {
  const {
    store,
    isHydrated,
    knowledgeQuery,
    setKnowledgeQuery,
    knowledgeCategory,
    setKnowledgeCategory,
    setActiveView,
    setAskFatwaModalOpen,
    markHelpful,
    toggleBookmark,
    logEmptySearch,
    navigateToDirectory,
    savedFatwaIds,
    savedArticleIds,
    isBookmarked,
  } = usePortal();

  const [schoolFilter, setSchoolFilter] = useState('All');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const filterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    };
  }, []);

  const triggerArchiveSkeleton = () => {
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    setIsFiltering(true);
    filterTimerRef.current = setTimeout(() => {
      setIsFiltering(false);
    }, 220);
  };

  const publishedFatwas = useMemo(() => {
    return store.fatwas.filter((f) => {
      if (f.status !== 'Published') return false;
      if (knowledgeCategory !== 'All' && f.category !== knowledgeCategory) return false;
      if (schoolFilter !== 'All' && f.schoolOfThought !== schoolFilter) return false;
      if (bookmarkedOnly && !isBookmarked('fatwa', f.id)) return false;
      if (knowledgeQuery.trim()) {
        const q = knowledgeQuery.toLowerCase();
        const hay = `${f.questionTitle} ${f.questionBody} ${f.rulingAnswer} ${f.scholarName} ${f.category} ${f.referenceCode}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookmarkedOnly, isBookmarked, knowledgeCategory, knowledgeQuery, schoolFilter, store.fatwas]);

  const publishedArticles = useMemo(() => {
    return store.articles.filter((a) => {
      if (a.status !== 'Published') return false;
      if (knowledgeCategory !== 'All' && a.category !== knowledgeCategory) return false;
      if (bookmarkedOnly && !isBookmarked('article', a.id)) return false;
      if (knowledgeQuery.trim()) {
        const q = knowledgeQuery.toLowerCase();
        const hay = `${a.title} ${a.summary} ${a.islamicGuidance} ${a.civilConsiderations} ${a.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookmarkedOnly, isBookmarked, knowledgeCategory, knowledgeQuery, store.articles]);

  const itemsCount = mode === 'fatwas' ? publishedFatwas.length : publishedArticles.length;

  const handleSearchBlur = () => {
    if (knowledgeQuery.trim() && itemsCount === 0) {
      logEmptySearch(knowledgeQuery);
    }
  };

  if (!isHydrated) {
    return <FatwaArchiveSkeleton mode={mode} showBannerAndSidebar count={6} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Oladoc Health Blog Inspired Featured Banner */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-7">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#064E3B]">
              <BookOpen className="h-4 w-4" />
              <span>
                {mode === 'fatwas'
                  ? 'Verified Fatwa Repository · Scholarly Peer-Reviewed'
                  : 'Anonymized Case Knowledge Hub · Consent-Verified'}
              </span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              {mode === 'fatwas'
                ? 'Authenticated Islamic Rulings & Jurisprudential Guidance'
                : 'Educational Family Guides & Anonymized Case Learnings'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              {mode === 'fatwas'
                ? 'Every ruling is authored, cited with classical references, tagged with its school of thought, and reviewed by qualified scholars. Automated systems never issue religious rulings.'
                : 'Derived from real consultations only after explicit consent, complete removal of identifying details, safeguarding checks, and scholarly approval.'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setAskFatwaModalOpen(true)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
              >
                <MessageSquarePlus className="h-4 w-4" /> Ask a Private Religious Question
              </button>
              <button
                type="button"
                onClick={() => setActiveView(mode === 'fatwas' ? 'knowledge' : 'fatwas')}
                className="whitespace-nowrap rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {mode === 'fatwas' ? 'Switch to Case Guides' : 'Switch to Verified Fatwas'}
              </button>
            </div>
          </div>

          <div className="relative min-h-[200px] lg:col-span-5">
            <Image
              src={MEDIA_ASSETS.books}
              alt="Classical Islamic family jurisprudence library"
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* 2-Column Content Layout */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="knowledge-search"
                name="knowledgeQuery"
                aria-label="Search rulings or topics"
                type="text"
                value={knowledgeQuery}
                onChange={(e) => {
                  setKnowledgeQuery(e.target.value);
                  triggerArchiveSkeleton();
                }}
                onBlur={handleSearchBlur}
                placeholder="Search rulings or topics..."
                className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#064E3B] focus:outline-none"
              />
            </div>

            {mode === 'fatwas' && (
              <div className="mt-4">
                <label
                  htmlFor="fatwa-school-filter"
                  className="block text-xs font-semibold text-slate-700"
                >
                  School of Thought
                </label>
                <select
                  id="fatwa-school-filter"
                  name="schoolFilter"
                  value={schoolFilter}
                  onChange={(e) => {
                    setSchoolFilter(e.target.value);
                    triggerArchiveSkeleton();
                  }}
                  className="mt-1.5 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800 focus:border-[#064E3B] focus:outline-none"
                >
                  {SCHOOLS.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc === 'All' ? 'All Schools / Fiqh' : sc}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              aria-pressed={bookmarkedOnly}
              onClick={() => {
                setBookmarkedOnly((prev) => !prev);
                triggerArchiveSkeleton();
              }}
              className={`mt-4 flex h-9 w-full items-center justify-between rounded-lg border px-3 text-xs font-semibold transition-colors ${
                bookmarkedOnly
                  ? 'border-amber-300 bg-amber-50 text-[#D97706]'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <Bookmark
                  className={`h-3.5 w-3.5 ${
                    bookmarkedOnly ? 'fill-[#D97706] text-[#D97706]' : 'text-slate-500'
                  }`}
                />
                Bookmarked Only
              </span>
              <span className="font-mono tabular-nums">
                {mode === 'fatwas' ? savedFatwaIds.length : savedArticleIds.length}
              </span>
            </button>

            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-500">Categories</p>
              <nav className="mt-2 flex flex-col gap-0.5">
                {CATEGORIES.map((cat) => {
                  const active = knowledgeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setKnowledgeCategory(cat);
                        triggerArchiveSkeleton();
                      }}
                      className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#ECFDF5] font-semibold text-[#064E3B]'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat === 'All' ? 'View all topics' : cat}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="rounded-xl bg-[#064E3B] p-5 text-white">
            <h3 className="font-display text-base font-bold">Need Private Guidance?</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
              Public articles cannot replace personal consultation for sensitive marital or custody
              cases.
            </p>
            <button
              type="button"
              onClick={() => navigateToDirectory()}
              className="mt-4 w-full rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#064E3B] hover:bg-slate-100"
            >
              Consult a Specialist
            </button>
          </div>
        </aside>

        {/* Main 2-Column Content Grid */}
        <div className="lg:col-span-9" aria-busy={isFiltering}>
          {isFiltering ? (
            <FatwaArchiveSkeleton mode={mode} showBannerAndSidebar={false} count={6} />
          ) : itemsCount === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-base font-semibold text-slate-900">
                No verified entries matched &ldquo;{knowledgeQuery || knowledgeCategory}&rdquo;
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your search helps our scholars identify missing guides. You can ask a private
                question directly.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setKnowledgeQuery('');
                    setKnowledgeCategory('All');
                    setSchoolFilter('All');
                    setBookmarkedOnly(false);
                    triggerArchiveSkeleton();
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Reset Filters
                </button>
                <button
                  type="button"
                  onClick={() => setAskFatwaModalOpen(true)}
                  className="rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                >
                  Ask a Scholar
                </button>
              </div>
            </div>
          ) : mode === 'fatwas' ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {publishedFatwas.map((fatwa) => {
                const isSaved = isBookmarked('fatwa', fatwa.id);
                return (
                  <article
                    key={fatwa.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="font-mono text-slate-600">{fatwa.referenceCode}</span>
                        <span>
                          {fatwa.category} · {fatwa.schoolOfThought}
                        </span>
                      </div>
                      <h2 className="mt-2.5 font-display text-base font-bold leading-snug text-slate-900">
                        <Link
                          href={`/fatwas/${fatwa.id}`}
                          className="transition-colors hover:text-[#064E3B]"
                        >
                          {fatwa.questionTitle}
                        </Link>
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {fatwa.rulingAnswer}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-3.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          {fatwa.scholarName}
                        </span>
                        <span className="tabular-nums">{fatwa.issuedAt}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => markHelpful('fatwa', fatwa.id)}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#064E3B] tabular-nums"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" /> {fatwa.helpfulCount}
                          </button>
                          <button
                            type="button"
                            aria-pressed={isSaved}
                            onClick={() => toggleBookmark('fatwa', fatwa.id)}
                            aria-label="Bookmark fatwa"
                            className={`inline-flex items-center gap-1 text-xs ${
                              isSaved
                                ? 'font-semibold text-[#D97706]'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Bookmark
                              className={`h-3.5 w-3.5 ${
                                isSaved ? 'fill-[#D97706] text-[#D97706]' : ''
                              }`}
                            />{' '}
                            {isSaved ? 'Bookmarked' : 'Bookmark'}
                          </button>
                        </div>

                        <Link
                          href={`/fatwas/${fatwa.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#064E3B] hover:underline"
                        >
                          Read ruling <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {publishedArticles.map((art) => {
                const isSaved = isBookmarked('article', art.id);
                return (
                  <article
                    key={art.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-[#064E3B]">{art.type}</span>
                        <span className="tabular-nums">
                          {art.category} · {art.readMinutes} min read
                        </span>
                      </div>
                      <h2 className="mt-2.5 font-display text-base font-bold leading-snug text-slate-900">
                        <Link
                          href={`/knowledge/${art.slug}`}
                          className="transition-colors hover:text-[#064E3B]"
                        >
                          {art.title}
                        </Link>
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {art.summary}
                      </p>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-3.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="truncate font-medium text-slate-700">
                          Reviewed: {art.approvedBy}
                        </span>
                        <span className="shrink-0 tabular-nums">{art.publishedAt}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => markHelpful('article', art.id)}
                            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#064E3B] tabular-nums"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" /> {art.helpfulCount}
                          </button>
                          <button
                            type="button"
                            aria-pressed={isSaved}
                            onClick={() => toggleBookmark('article', art.id)}
                            aria-label="Bookmark knowledge guide"
                            className={`inline-flex items-center gap-1 text-xs ${
                              isSaved
                                ? 'font-semibold text-[#D97706]'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <Bookmark
                              className={`h-3.5 w-3.5 ${
                                isSaved ? 'fill-[#D97706] text-[#D97706]' : ''
                              }`}
                            />{' '}
                            {isSaved ? 'Bookmarked' : 'Bookmark'}
                          </button>
                        </div>

                        <Link
                          href={`/knowledge/${art.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#064E3B] hover:underline"
                        >
                          Read guide <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
