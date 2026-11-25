'use client';

import React from 'react';
import { ShieldCheck, Lock, BookOpenCheck } from 'lucide-react';
import { usePortal } from '@/context/PortalContext';
import RahnumaLogo from '@/components/RahnumaLogo';

export default function Footer() {
  const { setActiveView, navigateToDirectory, navigateToKnowledge } = usePortal();

  const jump = (view: 'home' | 'specialists' | 'fatwas' | 'knowledge' | 'submit-case' | 'safeguarding' | 'portal') => {
    setActiveView(view);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#022C22] text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <RahnumaLogo variant="dark" showSubtitle />
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Confidential Islamic and family counselling portal uniting verified religious
              scholarship, family mediation, mental wellbeing care, and crisis safeguarding.
            </p>
            <p className="mt-4 text-xs text-slate-400">
              Not an emergency responder. If you are in immediate physical danger, contact local
              emergency services right away.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Specialist Disciplines</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToDirectory({ discipline: 'Mufti / Islamic Scholar' })}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Mufti &amp; Islamic Scholars
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToDirectory({ discipline: 'Family Counsellor' })}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Family &amp; Marital Counsellors
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToDirectory({ discipline: 'Mental Health Specialist' })}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Mental Health Specialists
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToDirectory({ discipline: 'Islamic Legal Advisor' })}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Islamic Family Legal Advisors
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Knowledge &amp; Rulings</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToKnowledge('fatwas', 'Talaq & Khula')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Talaq &amp; Khula Rulings
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToKnowledge('fatwas', 'Inheritance (Mirath)')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Inheritance &amp; Mirath Shares
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToKnowledge('knowledge', 'Parenting & Custody')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Parenting &amp; Custody Guides
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToKnowledge('knowledge', 'Marital Conflict')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Household Boundary Guides
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Portal Access &amp; Safety</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => jump('submit-case')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Submit a Confidential Case
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jump('safeguarding')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Crisis Safeguarding &amp; Helplines
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => jump('portal')}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Member &amp; Specialist Portal
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Oladoc-inspired 3 Trust Pillars Bar */}
        <div className="mt-12 grid grid-cols-1 gap-6 border-y border-[#0A4A3A] py-8 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <BookOpenCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" />
            <div>
              <p className="text-sm font-semibold text-white">Verified Scholars &amp; Practitioners</p>
              <p className="mt-0.5 text-xs text-slate-300/80">
                All rulings are authored and peer-reviewed by qualified scholars.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" />
            <div>
              <p className="text-sm font-semibold text-white">Confidential &amp; Discreet</p>
              <p className="mt-0.5 text-xs text-slate-300/80">
                Your identity stays anonymous and your data secure—with pseudonym protection and
                recording disabled by default.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#F59E0B]" />
            <div>
              <p className="text-sm font-semibold text-white">Safeguarding First</p>
              <p className="mt-0.5 text-xs text-slate-300/80">
                High-risk domestic or self-harm cases route directly to trained human triage.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 text-xs text-slate-300/80 sm:flex-row sm:items-center">
          <p>Rahnuma Islamic &amp; Family Counselling Portal</p>
          <p>Confidential Islamic Guidance, Mediation &amp; Safeguarding Platform</p>
        </div>
      </div>
    </footer>
  );
}
