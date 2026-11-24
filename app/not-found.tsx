import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12 text-center">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECFDF5] text-[#064E3B]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <p className="mt-4 font-mono text-xs font-semibold text-[#064E3B]">404 · Page Not Found</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
          Rahnuma Portal Page Unavailable
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The page you requested could not be found or has moved. Return to the main portal to
          browse verified fatwas, specialists, or confidential support.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#064E3B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#053B2D]"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Rahnuma Home
        </Link>
      </div>
    </div>
  );
}
