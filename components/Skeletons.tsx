'use client';

import React from 'react';
import type { PortalView } from '@/types/rahnuma';

export function SpecialistCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col justify-between gap-6 rounded-xl border border-slate-200 bg-white p-6 lg:flex-row lg:items-center"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="h-24 w-24 shrink-0 animate-pulse rounded-full border border-slate-200 bg-slate-200" />
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="h-5 w-48 animate-pulse rounded-md bg-slate-200" />
            <div className="h-4 w-4 animate-pulse rounded-full bg-emerald-100" />
          </div>
          <div className="h-4 w-64 animate-pulse rounded-md bg-emerald-100/80" />
          <div className="h-3.5 w-80 max-w-full animate-pulse rounded-md bg-slate-100" />
          <div className="h-3.5 w-72 max-w-full animate-pulse rounded-md bg-slate-100" />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
            <div className="h-3.5 w-24 animate-pulse rounded bg-amber-100/80" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-3.5 w-20 animate-pulse rounded bg-slate-100" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-3.5 w-24 animate-pulse rounded bg-emerald-100/80" />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:w-52 lg:flex-col">
        <div className="h-9 w-full animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
        <div className="h-9 w-full animate-pulse rounded-lg bg-[#064E3B]/20" />
      </div>
    </div>
  );
}

export function SpecialistListSkeleton({
  showHeaderAndFilters = true,
  count = 4,
}: {
  showHeaderAndFilters?: boolean;
  count?: number;
}) {
  return (
    <div
      role="status"
      aria-label="Loading verified specialists"
      className={showHeaderAndFilters ? 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8' : ''}
    >
      <span className="sr-only">Loading verified specialists...</span>

      {showHeaderAndFilters && (
        <>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <div className="h-8 w-80 max-w-full animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-slate-100" />
            </div>
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-12">
            <div className="h-10 animate-pulse rounded-lg bg-slate-100 lg:col-span-4" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100 lg:col-span-3" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100 lg:col-span-3" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-100 lg:col-span-2" />
          </div>
        </>
      )}

      <div className={showHeaderAndFilters ? 'mt-6 space-y-4' : 'space-y-4'}>
        {Array.from({ length: count }).map((_, idx) => (
          <SpecialistCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
}

export function SpecialistProfileSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading specialist profile"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading specialist profile...</span>
      <div className="h-5 w-44 animate-pulse rounded bg-slate-200" />

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-5">
            <div className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-slate-200" />
            <div className="space-y-2.5">
              <div className="h-7 w-56 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-64 animate-pulse rounded bg-emerald-100/80" />
              <div className="h-3.5 w-72 animate-pulse rounded bg-slate-100" />
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-20 animate-pulse rounded-md bg-slate-100" />
                <div className="h-6 w-24 animate-pulse rounded-md bg-slate-100" />
                <div className="h-6 w-20 animate-pulse rounded-md bg-slate-100" />
              </div>
            </div>
          </div>
          <div className="flex gap-6 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0">
            <div className="h-12 w-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-12 w-20 animate-pulse rounded-lg bg-slate-100" />
            <div className="h-12 w-20 animate-pulse rounded-lg bg-slate-100" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="h-12 animate-pulse rounded-xl border border-slate-200 bg-white" />
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
        <div className="lg:col-span-4">
          <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  );
}

export function FatwaCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-3.5 w-32 animate-pulse rounded bg-emerald-100/80" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-3.5 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-3.5 w-11/12 animate-pulse rounded bg-slate-100" />
          <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3.5">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-36 animate-pulse rounded bg-slate-200" />
          <div className="h-3.5 w-20 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-4 w-10 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-14 animate-pulse rounded bg-amber-100/70" />
          </div>
          <div className="h-4 w-20 animate-pulse rounded bg-[#064E3B]/20" />
        </div>
      </div>
    </div>
  );
}

export function FatwaArchiveSkeleton({
  mode = 'fatwas',
  showBannerAndSidebar = true,
  count = 6,
}: {
  mode?: 'fatwas' | 'knowledge';
  showBannerAndSidebar?: boolean;
  count?: number;
}) {
  return (
    <div
      role="status"
      aria-label={mode === 'fatwas' ? 'Loading verified fatwa archive' : 'Loading knowledge hub'}
      className={showBannerAndSidebar ? 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8' : ''}
    >
      <span className="sr-only">
        {mode === 'fatwas' ? 'Loading verified fatwa archive...' : 'Loading knowledge hub...'}
      </span>

      {showBannerAndSidebar && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="space-y-3 p-6 sm:p-8 lg:col-span-7">
              <div className="h-4 w-56 animate-pulse rounded bg-emerald-100" />
              <div className="h-8 w-11/12 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
              <div className="flex gap-3 pt-2">
                <div className="h-9 w-48 animate-pulse rounded-lg bg-[#064E3B]/25" />
                <div className="h-9 w-40 animate-pulse rounded-lg bg-slate-100" />
              </div>
            </div>
            <div className="min-h-[200px] animate-pulse bg-slate-200 lg:col-span-5" />
          </div>
        </div>
      )}

      {showBannerAndSidebar ? (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <aside className="space-y-6 lg:col-span-3">
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100" />
              {mode === 'fatwas' && (
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="h-9 w-full animate-pulse rounded-lg bg-slate-100" />
                </div>
              )}
              <div className="space-y-2 pt-2">
                <div className="h-3.5 w-20 animate-pulse rounded bg-slate-200" />
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="h-8 w-full animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            </div>
            <div className="h-36 animate-pulse rounded-xl bg-[#064E3B]/20" />
          </aside>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:col-span-9">
            {Array.from({ length: count }).map((_, idx) => (
              <FatwaCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: count }).map((_, idx) => (
            <FatwaCardSkeleton key={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HomePortalSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading Rahnuma portal"
      className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading Rahnuma portal...</span>
      {/* Hero Banner Skeleton */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#064E3B] via-[#043D2F] to-[#022C22] p-6 sm:p-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="h-4 w-64 animate-pulse rounded bg-white/20" />
            <div className="h-10 w-11/12 animate-pulse rounded-lg bg-white/25" />
            <div className="h-10 w-3/4 animate-pulse rounded-lg bg-white/20" />
            <div className="h-4 w-full max-w-lg animate-pulse rounded bg-white/15" />
            <div className="mt-4 h-14 w-full animate-pulse rounded-xl bg-white/95" />
          </div>
          <div className="hidden min-h-[260px] animate-pulse rounded-xl bg-white/10 lg:col-span-5 lg:block" />
        </div>
      </div>

      {/* 5 Service Pillars Skeleton */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="h-11 w-11 animate-pulse rounded-lg bg-[#ECFDF5]" />
            <div className="mt-4 h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>

      {/* Featured Specialists Strip Skeleton */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 animate-pulse rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-emerald-100" />
              </div>
            </div>
            <div className="mt-4 h-3 w-full animate-pulse rounded bg-slate-100" />
            <div className="mt-5 flex gap-2">
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-8 flex-1 animate-pulse rounded-lg bg-[#064E3B]/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArticleDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading article detail"
      className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading article detail...</span>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="h-4 w-56 animate-pulse rounded bg-emerald-100" />
        <div className="mt-3 h-8 w-11/12 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-2 h-8 w-2/3 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-5 flex gap-4 border-t border-slate-100 pt-4">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-6 space-y-5">
        <div className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-50" />
        <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

export function PortalSkeleton({
  activeView,
  pathname,
}: {
  activeView: PortalView;
  pathname?: string | null;
}) {
  if (pathname?.startsWith('/specialists/')) {
    return <SpecialistProfileSkeleton />;
  }
  if (pathname?.startsWith('/fatwas/') || pathname?.startsWith('/knowledge/')) {
    return <ArticleDetailSkeleton />;
  }
  if (activeView === 'specialists') {
    return <SpecialistListSkeleton showHeaderAndFilters count={4} />;
  }
  if (activeView === 'fatwas' || activeView === 'knowledge') {
    return <FatwaArchiveSkeleton mode={activeView} showBannerAndSidebar count={6} />;
  }
  if (activeView === 'home') {
    return <HomePortalSkeleton />;
  }
  return (
    <div
      role="status"
      aria-label="Loading portal workspace"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading portal workspace...</span>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-4 w-48 animate-pulse rounded bg-emerald-100" />
        <div className="mt-2 h-7 w-72 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-2 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white lg:col-span-7" />
        <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white lg:col-span-5" />
      </div>
    </div>
  );
}
