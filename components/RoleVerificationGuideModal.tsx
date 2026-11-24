'use client';

import React, { useState } from 'react';
import { BookOpenCheck, CheckCircle2, Lock, ShieldAlert, X } from 'lucide-react';
import type { PortalRole } from '@/types/rahnuma';

interface TestStep {
  id: string;
  title: string;
  action: string;
  expected: string;
}

interface RoleGuide {
  role: PortalRole;
  label: string;
  scopeSummary: string;
  privacyRule: string;
  steps: TestStep[];
}

const ROLE_GUIDES: RoleGuide[] = [
  {
    role: 'user',
    label: 'Registered User',
    scopeSummary:
      'Private case submission, slot booking, async consultation chat, fatwa requests, reviews, and privacy/session controls.',
    privacyRule:
      'Only sees own submitted cases, own appointments, and own fatwa questions. Pseudonym Mode hides real name from specialists.',
    steps: [
      {
        id: 'usr-1',
        title: 'Submit a Confidential Case & Test Safeguarding',
        action:
          'Open Private Case (/submit-case), enter a title/narrative containing "domestic violence" or "suicide", and submit.',
        expected:
          'Live safeguarding alert appears, couples mediation is blocked, Discreet Mode is forced ON, and the case routes to Urgent Review.',
      },
      {
        id: 'usr-2',
        title: 'Book an Online Consultation',
        action:
          'Go to Specialists (/specialists), pick a practitioner, choose an open slot, optionally apply code RAHNUMA20, and confirm.',
        expected:
          'Slot becomes booked, discount applies if used, and the appointment appears in My Dashboard -> Appointments.',
      },
      {
        id: 'usr-3',
        title: 'Async Consultation Chat & Leave Review',
        action:
          'In My Dashboard -> Appointments, select an appointment, send a message in the thread, and click Leave Review.',
        expected:
          'Message persists in localStorage, and submitting a review updates the specialist rating, review count, and Home testimonials.',
      },
      {
        id: 'usr-4',
        title: 'Privacy, Pseudonym & Session Revocation',
        action:
          'Open Privacy & Security tab: update pseudonym, toggle Discreet Notifications or 2FA, and revoke an older device session.',
        expected:
          'Changes persist across reloads and Export Personal Data downloads a JSON archive of your account data.',
      },
    ],
  },
  {
    role: 'mufti',
    label: 'Mufti / Islamic Scholar',
    scopeSummary:
      'Fatwa adjudication queue, classical references, school-of-thought tagging, peer review, publishing, and assigned consultations.',
    privacyRule:
      'Never sees unassigned cases or other specialists’ private clinical notes. Automated systems never issue rulings.',
    steps: [
      {
        id: 'muf-1',
        title: 'Draft & Cite a Fatwa Ruling',
        action:
          'In Mufti Dashboard -> Fatwa Adjudication Queue, select a pending fatwa, write the ruling, add Quran/Fiqh references, and pick School of Thought.',
        expected:
          'Draft saves to localStorage with revision note and scholarly attribution.',
      },
      {
        id: 'muf-2',
        title: 'Publish Verified Ruling',
        action:
          'Change status to Published and click Save & Update Ruling, then visit /fatwas.',
        expected:
          'Ruling immediately appears in the public Verified Fatwa Repository with scholar name and references.',
      },
      {
        id: 'muf-3',
        title: 'Assigned Consultations & Slot Management',
        action:
          'Switch to My Consultations tab, reply to a client thread, deliver a session summary, or add a new availability slot.',
        expected:
          'Client sees the reply and delivered summary in their dashboard; new slot appears on /specialists.',
      },
    ],
  },
  {
    role: 'family_counsellor',
    label: 'Family Counsellor',
    scopeSummary:
      'Assigned marital/family cases, private session notes, cross-discipline referrals, async chat, and slot calendar.',
    privacyRule:
      'Isolated to assigned cases only. Private clinical notes are hidden from general Administrators and Case Managers.',
    steps: [
      {
        id: 'fc-1',
        title: 'Review Assigned Cases & Update Status',
        action:
          'Select an assigned case, inspect its timeline, and update status (e.g., In Consultation -> Follow-Up Required).',
        expected:
          'Status and timeline event update immediately and remain synced with the Member Dashboard.',
      },
      {
        id: 'fc-2',
        title: 'Write Private Family Session Notes',
        action:
          'Add a confidential session note in the Private Family Session Notes box.',
        expected:
          'Note is saved to localStorage and visible only to you (never exposed to general admins).',
      },
      {
        id: 'fc-3',
        title: 'Create Cross-Discipline Referral',
        action:
          'Submit a referral to Islamic Legal Advisor or Mental Health Specialist with a clear reason.',
        expected:
          'Referral attaches to the case timeline and logs an audit entry.',
      },
    ],
  },
  {
    role: 'mental_health',
    label: 'Mental Health Specialist',
    scopeSummary:
      'Trauma-informed clinical care, safeguarding-flagged individual cases, private clinical notes, and session summaries.',
    privacyRule:
      'Strict clinical confidentiality: notes are isolated to the authoring clinician; couples mediation is blocked on abuse cases.',
    steps: [
      {
        id: 'mh-1',
        title: 'Inspect Safeguarding-Flagged Case',
        action:
          'Open an assigned Urgent Review case and verify risk signals and Couples Mediation Blocked notice.',
        expected:
          'Case clearly displays detected safeguarding signals and enforces individual-only safety care.',
      },
      {
        id: 'mh-2',
        title: 'Record Private Clinical Assessment Notes',
        action:
          'Write a clinical observation note and verify it persists after refreshing.',
        expected:
          'Note saves under your specialist ID and remains hidden from Admin/User views.',
      },
      {
        id: 'mh-3',
        title: 'Deliver Post-Session Summary',
        action:
          'Select an appointment, mark attendance (Attended), and deliver a discreet guidance summary.',
        expected:
          'Member sees the delivered summary in their Appointments tab.',
      },
    ],
  },
  {
    role: 'legal_advisor',
    label: 'Islamic Legal Advisor',
    scopeSummary:
      'Jurisdiction-specific civil & Sharia family law counsel (Nikahnama, Mahr, Khula, custody), referrals, and legal notes.',
    privacyRule:
      'Isolated to assigned legal cases and appointments; private legal notes remain restricted.',
    steps: [
      {
        id: 'leg-1',
        title: 'Review Assigned Legal Case & Timeline',
        action:
          'Open an assigned case (e.g., Khula/custody) and check attachments metadata and referrals.',
        expected:
          'Case narrative, preferred language, and attachment metadata display cleanly.',
      },
      {
        id: 'leg-2',
        title: 'Add Legal Counsel Note & Reply',
        action:
          'Add a private legal counsel note and send a discreet reply in the client consultation thread.',
        expected:
          'Client receives the reply in their portal while private legal notes stay restricted.',
      },
    ],
  },
  {
    role: 'case_manager',
    label: 'Case Manager',
    scopeSummary:
      'Triage queue, urgent safeguarding escalation, specialist assignment, educational nomination, and fatwa routing.',
    privacyRule:
      'Can triage and route cases, but cannot read private clinical notes written by specialists.',
    steps: [
      {
        id: 'cm-1',
        title: 'Filter Urgent Safeguarding Queue',
        action:
          'Click the Urgent / Safeguarding filter tab to isolate high-risk cases.',
        expected:
          'All safeguarding-flagged and Urgent Review cases appear prioritized at the top.',
      },
      {
        id: 'cm-2',
        title: 'Assign Specialist (Safe Routing Guardrail)',
        action:
          'Assign a safeguarding-flagged case to a specialist; verify couples mediation stays blocked.',
        expected:
          'Case updates to Assigned, specialist receives it in their workspace, and audit log records the action.',
      },
      {
        id: 'cm-3',
        title: 'Nominate Resolved Case & Route Fatwas',
        action:
          'Nominate a closed/resolved case for Knowledge Hub education, then switch to Fatwa Routing tab to route a fatwa to a Mufti.',
        expected:
          'Nominated case creates a Pending Review draft for the Knowledge Moderator; fatwa routes to the chosen scholar.',
      },
    ],
  },
  {
    role: 'knowledge_moderator',
    label: 'Knowledge Moderator',
    scopeSummary:
      'Create standalone guides, edit de-identified summaries, enforce the 4-step publication gate, and process takedown requests.',
    privacyRule:
      'Sees only de-identified educational summaries—never raw private case files or client identities.',
    steps: [
      {
        id: 'km-1',
        title: 'Create a New Standalone Educational Article',
        action:
          'Click + Create New Article, fill title, category, summary, Islamic/civil guidance, and save.',
        expected:
          'New draft appears in Pending Gate queue ready for verification.',
      },
      {
        id: 'km-2',
        title: 'Complete 4-Step Verification Gate & Publish',
        action:
          'Check all 4 boxes (Consent Verified, PII Stripped, Safeguarding Reviewed, Scholar Approved) and click Publish.',
        expected:
          'Article becomes Published and immediately appears on /knowledge.',
      },
      {
        id: 'km-3',
        title: 'Check Empty-Search Gaps & Takedowns',
        action:
          'Inspect Empty-Search Gaps panel on the right and test withdrawing a Takedown-flagged guide.',
        expected:
          'Withdrawn guide is removed from public /knowledge listings.',
      },
    ],
  },
  {
    role: 'admin',
    label: 'Administrator',
    scopeSummary:
      'Specialist onboarding & editing, credential verification, appointment oversight, portal settings, and operational audit logs.',
    privacyRule:
      'Being an Administrator does NOT grant access to private clinical notes or raw confidential narratives.',
    steps: [
      {
        id: 'adm-1',
        title: 'Onboard & Edit a Specialist',
        action:
          'Click + Onboard Specialist to add a new practitioner, then click Edit on any row to update fee or credentials.',
        expected:
          'New/updated specialist immediately reflects on /specialists and Home directory.',
      },
      {
        id: 'adm-2',
        title: 'Toggle Credential Verification',
        action:
          'Click Revoke Verification or Approve Credentials on a specialist row.',
        expected:
          'Verification badge updates in real time and logs an audit entry.',
      },
      {
        id: 'adm-3',
        title: 'Update Discount Code & Discreet Email Subject',
        action:
          'Open Operational Settings tab, update discount % or discreet subject, and save.',
        expected:
          'New discount code and discreet notification subject apply across booking and case intake.',
      },
    ],
  },
  {
    role: 'super_admin',
    label: 'Super Administrator',
    scopeSummary:
      'Organization-wide RBAC permission matrix, mandatory staff 2FA policy, SLA escalation ownership, and full security audit.',
    privacyRule:
      'Governs roles and policies across all 9 roles while preserving clinical note isolation.',
    steps: [
      {
        id: 'sa-1',
        title: 'Toggle Live RBAC Permission Matrix',
        action:
          'In RBAC Governance tab, toggle a permission checkbox for any role (e.g., Approve Fatwas or Manage Operations).',
        expected:
          'Signing in as that role immediately reflects the granted/revoked capability.',
      },
      {
        id: 'sa-2',
        title: 'Enforce Mandatory Staff 2FA & SLA Settings',
        action:
          'Open Security & Safeguarding Policy tab, toggle Mandatory Staff 2FA, and update Escalation Owner / SLA hours.',
        expected:
          'Safeguarding page (/safeguarding) and staff headers immediately reflect the updated SLA and 2FA policy.',
      },
      {
        id: 'sa-3',
        title: 'Inspect Governance & Safeguarding Audit Logs',
        action:
          'Open Full Audit Logs tab and filter by Governance or Safeguarding.',
        expected:
          'Every role change, case triage, specialist edit, and password reset is timestamped and auditable.',
      },
    ],
  },
];

interface RoleVerificationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: PortalRole;
}

export default function RoleVerificationGuideModal({
  isOpen,
  onClose,
  activeRole,
}: RoleVerificationGuideModalProps) {
  const isSuperAdmin = activeRole === 'super_admin';
  const [selectedFilter, setSelectedFilter] = useState<'all' | PortalRole>('all');
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const visibleGuides = isSuperAdmin
    ? selectedFilter === 'all'
      ? ROLE_GUIDES
      : ROLE_GUIDES.filter((g) => g.role === selectedFilter)
    : ROLE_GUIDES.filter((g) => g.role === activeRole);

  const toggleStep = (stepId: string) => {
    setCheckedSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Portal Verification Guide"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-[2px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-[#022C22] px-6 py-4 text-white">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F59E0B]">
              <BookOpenCheck className="h-4 w-4" />
              <span>
                {isSuperAdmin
                  ? 'Super Administrator · Complete A–Z Portal Verification Guide'
                  : `${visibleGuides[0]?.label || 'Role'} · Step-by-Step Verification Guide`}
              </span>
            </div>
            <h2 className="mt-1 font-display text-lg font-bold text-white">
              {isSuperAdmin
                ? 'End-to-End QA & Demo Test Cases (All 9 Roles)'
                : `How to Verify ${visibleGuides[0]?.label || 'Your Role'} Functionality`}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close verification guide"
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-100 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Super Admin Filter Bar */}
        {isSuperAdmin && (
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedFilter('all')}
                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-[#064E3B] text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                All 9 Roles (A–Z)
              </button>
              {ROLE_GUIDES.map((g) => (
                <button
                  key={g.role}
                  type="button"
                  onClick={() => setSelectedFilter(g.role)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                    selectedFilter === g.role
                      ? 'bg-[#064E3B] text-white'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {isSuperAdmin && selectedFilter === 'all' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
                <div>
                  <p className="font-bold">Recommended End-to-End Demo Flow (A → Z)</p>
                  <p className="mt-1 leading-relaxed text-amber-900">
                    1. <strong>User</strong> submits a private case / books a slot → 2.{' '}
                    <strong>Case Manager</strong> triages &amp; assigns specialist → 3.{' '}
                    <strong>Counsellor / Mufti / Legal</strong> writes private notes &amp; delivers
                    summary → 4. <strong>User</strong> leaves a review (rating updates live) → 5.{' '}
                    <strong>Knowledge Moderator</strong> passes 4-step gate &amp; publishes → 6.{' '}
                    <strong>Admin</strong> onboards/edits specialists → 7.{' '}
                    <strong>Super Admin</strong> governs RBAC, 2FA &amp; Audit Logs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {visibleGuides.map((guide) => (
            <div
              key={guide.role}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {guide.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-600">{guide.scopeSummary}</p>
                </div>
                <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-[11px] font-semibold text-[#064E3B]">
                  {guide.steps.filter((s) => checkedSteps[s.id]).length}/{guide.steps.length} Tested
                </span>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#064E3B]" />
                <span>
                  <strong>Privacy Boundary:</strong> {guide.privacyRule}
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {guide.steps.map((step, idx) => {
                  const isDone = Boolean(checkedSteps[step.id]);
                  return (
                    <label
                      key={step.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-xs transition-colors ${
                        isDone
                          ? 'border-emerald-200 bg-[#ECFDF5]/60'
                          : 'border-slate-200 bg-white hover:bg-slate-50/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleStep(step.id)}
                        className="mt-0.5 rounded border-slate-300 text-[#064E3B]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-[#064E3B]">
                            Step {idx + 1}
                          </span>
                          <span className="font-bold text-slate-900">{step.title}</span>
                          {isDone && (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          )}
                        </div>
                        <p className="mt-1 text-slate-700">
                          <strong>Test Action:</strong> {step.action}
                        </p>
                        <p className="mt-0.5 text-emerald-800">
                          <strong>Expected Result:</strong> {step.expected}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
          <span>All test changes persist locally in browser localStorage.</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#064E3B] px-4 py-2 font-semibold text-white hover:bg-[#053B2D]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
