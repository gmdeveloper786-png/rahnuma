'use client';

import React, { useMemo, useState } from 'react';
import {
  ShieldAlert,
  Lock,
  PhoneCall,
  CheckCircle2,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Paperclip,
  X,
  Clock,
} from 'lucide-react';
import { usePortal } from '@/context/PortalContext';
import { evaluateSafeguardingSignals } from '@/lib/storage';
import type { AttachmentMeta, ConsultationMode } from '@/types/rahnuma';

const CASE_CATEGORIES = [
  'Marital Conflict',
  'Talaq & Khula',
  'Parenting & Custody',
  'Inheritance (Mirath)',
  'Financial Rights',
  'Grief & Emotional Distress',
  'Domestic Safety Support',
  'Crisis & Safeguarding',
];

const HELPLINES = [
  {
    region: 'Pakistan — Emergency Police / Rescue',
    number: '15 / 1122',
    detail: 'Immediate physical danger, assault, or medical emergency',
  },
  {
    region: 'Pakistan — Ministry of Human Rights Helpline',
    number: '1099',
    detail: 'Free legal advice and domestic protection support',
  },
  {
    region: 'Pakistan — Umang Mental Health Helpline',
    number: '0311-7786264',
    detail: '24/7 confidential emotional distress & suicide support',
  },
  {
    region: 'International — Emergency Services',
    number: '999 / 911 / 112',
    detail: 'Contact local emergency services in your country immediately',
  },
];

export default function CaseIntakeSafeguardingView({
  mode,
}: {
  mode: 'submit-case' | 'safeguarding';
}) {
  const { store, currentUser, submitCase, setActiveView } = usePortal();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Marital Conflict');
  const [preferredLanguage, setPreferredLanguage] = useState<'English' | 'Urdu'>('English');
  const [narrative, setNarrative] = useState('');
  const [requestedHelpType, setRequestedHelpType] = useState<ConsultationMode>('text');
  const [discreetMode, setDiscreetMode] = useState(currentUser.discreetNotifications);
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);
  const [submittedResult, setSubmittedResult] = useState<{
    caseId: string;
    isFlagged: boolean;
  } | null>(null);
  const [formError, setFormError] = useState('');

  const liveSafeguarding = useMemo(
    () => evaluateSafeguardingSignals(`${title} ${narrative}`, category),
    [category, narrative, title]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const mapped: AttachmentMeta[] = Array.from(files).map((file, idx) => ({
      id: `att_${Date.now()}_${idx}`,
      name: file.name,
      sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      type: file.type || 'document',
    }));
    setAttachments((prev) => [...prev, ...mapped]);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 5 || narrative.trim().length < 15) {
      setFormError(
        'Please provide a brief title and at least a short description of your situation.'
      );
      return;
    }
    setFormError('');
    const result = submitCase({
      title,
      category,
      narrative,
      preferredLanguage,
      requestedHelpType,
      discreetMode,
      attachments,
    });
    setSubmittedResult(result);
    setTitle('');
    setNarrative('');
    setAttachments([]);
  };

  if (mode === 'safeguarding') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-rose-950">
                  Crisis Safeguarding &amp; Immediate Protection
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-rose-900">
                  <strong>Important Notice:</strong> Rahnuma is an online counselling and religious
                  guidance portal—it is <strong>not an emergency responder</strong>. If you or a
                  child are in immediate physical danger or experiencing thoughts of self-harm,
                  please call your local emergency service immediately.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="whitespace-nowrap shrink-0 rounded-lg border border-rose-300 bg-white px-3.5 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-100"
            >
              Quick Safe Exit
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {HELPLINES.map((h) => (
            <div key={h.region} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-900">{h.region}</h2>
                <span className="inline-flex items-center gap-1 font-mono text-sm font-bold text-rose-700 tabular-nums">
                  <PhoneCall className="h-4 w-4" /> {h.number}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-600">{h.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Safeguarding Governance &amp; Escalation Ownership
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-700 sm:grid-cols-3">
            <div>
              <p className="font-semibold text-slate-900">Staffing &amp; Duty Hours</p>
              <p className="mt-1">{store.settings.staffingHoursNote}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Escalation Ownership</p>
              <p className="mt-1">{store.settings.escalationOwner}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Urgent Triage Response Target</p>
              <p className="mt-1 font-mono tabular-nums">
                Within {store.settings.responseLimitHours} hours (outside hours: emergency fallback)
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                1. No Forced Couples Mediation
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Situations involving domestic violence, threats, or coercive control are
                automatically blocked from couples mediation and assigned solely to individual
                safety and legal care.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                2. Discreet Household Privacy
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Discreet Mode masks notification subjects, protects your identity behind a
                pseudonym, and keeps clinical safety notes strictly restricted to trained staff.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                3. Trained Human Escalation
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Risk indicators flag your submission directly into Urgent Review for trained human
                triage—automated screening never replaces human clinical judgment.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={() => setActiveView('submit-case')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#053B2D]"
            >
              Submit a Confidential Safeguarding Request <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#064E3B]">
                <Lock className="h-4 w-4" />
                <span>Confidential Case Intake · Protected Member Portal</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Quick Exit
              </button>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Submit a Private Case for Guidance
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Your submission receives a unique tracking ID and is triaged privately by an
              authorized Case Coordinator.
            </p>

            {liveSafeguarding.isFlagged && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-950"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
                  <div>
                    <p className="text-sm font-bold">
                      Safeguarding Pathway Activated — Immediate Support Notice
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-rose-900">
                      Detected indicators: {liveSafeguarding.signals.join(', ')}. Rahnuma is not an
                      emergency service; if you are in danger call <strong>15 / 1122 / 1099</strong>{' '}
                      (or local emergency services). Submitting this form will route directly to{' '}
                      <strong>Urgent Review</strong>, enable Discreet Mode, and block couples
                      mediation routing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {submittedResult && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-sm font-bold">
                      Case {submittedResult.caseId} Recorded Confidentially
                    </p>
                    <p className="mt-1 text-xs text-emerald-900">
                      {submittedResult.isFlagged
                        ? 'Your case has been marked Urgent Review under the Safeguarding Pathway with Discreet Mode active.'
                        : 'Your case is now in Pending Triage. You can track live progress and coordinator updates inside your Portal.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveView('portal')}
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 underline"
                    >
                      Open Case in Portal <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="case-title"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Case Title / Summary *
                </label>
                <input
                  id="case-title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Requesting guidance on Khula and child custody arrangements"
                  className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#064E3B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="case-category"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Issue Category *
                  </label>
                  <select
                    id="case-category"
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-[#064E3B] focus:outline-none"
                  >
                    {CASE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="case-language"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Preferred Language *
                  </label>
                  <select
                    id="case-language"
                    name="preferredLanguage"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value as 'English' | 'Urdu')}
                    className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-[#064E3B] focus:outline-none"
                  >
                    <option value="English">English</option>
                    <option value="Urdu">Urdu (Consultation)</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="case-mode"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Preferred Support Mode *
                  </label>
                  <select
                    id="case-mode"
                    name="requestedHelpType"
                    value={requestedHelpType}
                    onChange={(e) => setRequestedHelpType(e.target.value as ConsultationMode)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 focus:border-[#064E3B] focus:outline-none"
                  >
                    <option value="text">Private Async Text</option>
                    <option value="written">Written Guidance</option>
                    <option value="audio">Scheduled Audio</option>
                    <option value="video">Scheduled Video</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="case-narrative"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Confidential Narrative *
                </label>
                <textarea
                  id="case-narrative"
                  name="narrative"
                  rows={5}
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  placeholder="Describe your situation, questions, and any safety or household privacy preferences..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#064E3B] focus:outline-none"
                />
              </div>

              {/* Optional Supporting Attachments (local metadata) */}
              <div>
                <p className="block text-xs font-semibold text-slate-700">
                  Optional Supporting Material (Nikahnama, Documents)
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="case-attachments"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>Attach File Reference</span>
                    <input
                      id="case-attachments"
                      name="attachments"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Protected attachment reference restricted strictly to your assigned care team.
                  </span>
                </div>
                {attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700"
                      >
                        <span className="font-medium">{att.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">{att.sizeLabel}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) => prev.filter((x) => x.id !== att.id))
                          }
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label
                  htmlFor="case-discreet-mode"
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    id="case-discreet-mode"
                    name="discreetMode"
                    type="checkbox"
                    checked={discreetMode}
                    onChange={(e) => setDiscreetMode(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#064E3B]"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-900">
                      Enable Discreet Notification Mode
                    </span>
                    <p className="mt-0.5 text-slate-600">
                      Submitting as{' '}
                      <strong>
                        {currentUser.usePseudonym ? currentUser.pseudonym : currentUser.name}
                      </strong>
                      . Alerts use neutral subject line: &ldquo;{store.settings.discreetEmailSubject}
                      &rdquo;.
                    </p>
                  </div>
                </label>
              </div>

              {formError && <p className="text-xs font-semibold text-rose-700">{formError}</p>}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#064E3B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#053B2D] sm:w-auto"
              >
                Submit Confidential Case
              </button>
            </form>
          </div>
        </div>

        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <EyeOff className="h-4 w-4 text-[#064E3B]" />
              <span>Privacy Controls Active</span>
            </div>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-600">
              <li>
                Identity displayed:{' '}
                {currentUser.usePseudonym ? currentUser.pseudonym : currentUser.name}
              </li>
              <li>Private practitioner notes are hidden from general administrators.</li>
              <li>Audio/video recording is disabled by default.</li>
              <li>Closed cases are never published without explicit consent &amp; PII removal.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Clock className="h-4 w-4 text-[#064E3B]" />
              <span>Triage Hours &amp; Response</span>
            </div>
            <p className="mt-2 text-xs text-slate-600">{store.settings.staffingHoursNote}</p>
            <p className="mt-2 text-xs text-slate-600">
              Escalation Lead: <span className="font-semibold">{store.settings.escalationOwner}</span>
            </p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50 p-5">
            <h2 className="text-sm font-bold text-rose-950">Need Urgent Help Right Now?</h2>
            <p className="mt-1 text-xs leading-relaxed text-rose-900">
              If someone is threatening your safety or you feel overwhelmed by self-harm thoughts,
              reach emergency services immediately.
            </p>
            <div className="mt-3 space-y-1.5 font-mono text-xs text-rose-900 tabular-nums">
              <p>Emergency Rescue: 15 / 1122</p>
              <p>Protection Helpline: 1099</p>
              <p>Crisis Support: 0311-7786264</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
