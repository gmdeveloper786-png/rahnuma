'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  User,
  BookOpenCheck,
  HeartHandshake,
  Brain,
  Scale,
  ClipboardList,
  FileCheck2,
  ShieldCheck,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  Send,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus,
  Calendar,
  FileText,
  ArrowRight,
  Download,
  Sparkles,
  Laptop,
  Settings,
  ShieldAlert,
  ExternalLink,
  Bookmark,
} from 'lucide-react';
import { usePortal } from '@/context/PortalContext';
import { ALL_CASE_STATUSES } from '@/types/rahnuma';
import type {
  CaseStatus,
  FatwaStatus,
  PortalRole,
  RolePermissionSet,
  SchoolOfThought,
  SpecialistDiscipline,
  SpecialistProfile,
} from '@/types/rahnuma';

const ROLES: Array<{
  id: PortalRole;
  label: string;
  shortDesc: string;
  icon: typeof User;
}> = [
  {
    id: 'user',
    label: 'Registered User',
    shortDesc: 'Own cases, appointments, async chat & privacy settings',
    icon: User,
  },
  {
    id: 'mufti',
    label: 'Mufti / Scholar',
    shortDesc: 'Fatwa adjudication, peer review, citations & publishing',
    icon: BookOpenCheck,
  },
  {
    id: 'family_counsellor',
    label: 'Family Counsellor',
    shortDesc: 'Assigned marital/family cases, slots & session notes',
    icon: HeartHandshake,
  },
  {
    id: 'mental_health',
    label: 'Mental Health Specialist',
    shortDesc: 'Assigned trauma/grief cases, clinical notes & sessions',
    icon: Brain,
  },
  {
    id: 'legal_advisor',
    label: 'Islamic Legal Advisor',
    shortDesc: 'Assigned Nikah/Mahr/custody cases & legal counsel notes',
    icon: Scale,
  },
  {
    id: 'case_manager',
    label: 'Case Manager',
    shortDesc: 'Intake triage, safeguarding escalation & specialist routing',
    icon: ClipboardList,
  },
  {
    id: 'knowledge_moderator',
    label: 'Knowledge Moderator',
    shortDesc: '4-gate anonymization, de-identified guides & takedowns',
    icon: FileCheck2,
  },
  {
    id: 'admin',
    label: 'Administrator',
    shortDesc: 'Specialist credentials, operations, templates & audit logs',
    icon: ShieldCheck,
  },
  {
    id: 'super_admin',
    label: 'Super Administrator',
    shortDesc: 'RBAC permission matrix, mandatory 2FA & SLA governance',
    icon: KeyRound,
  },
];

const PERMISSION_COLUMNS: Array<{
  key: keyof RolePermissionSet;
  label: string;
  shortLabel: string;
}> = [
  { key: 'submitCasesAndBook', label: 'Submit Cases & Book', shortLabel: 'Submit/Book' },
  { key: 'reviewAndApproveFatwas', label: 'Review & Publish Fatwas', shortLabel: 'Fatwas' },
  { key: 'manageAssignedConsultations', label: 'Manage Own Consultations', shortLabel: 'Consults' },
  { key: 'writePrivateClinicalNotes', label: 'Write Private Notes', shortLabel: 'Private Notes' },
  { key: 'triageAndEscalateCases', label: 'Triage & Escalate Cases', shortLabel: 'Triage' },
  { key: 'moderateAndPublishKnowledge', label: 'Moderate Knowledge Hub', shortLabel: 'Moderate Hub' },
  { key: 'manageOperationsAndAudit', label: 'Operations & Audit', shortLabel: 'Ops & Audit' },
  { key: 'governRolesAndPolicies', label: 'Govern RBAC & Security', shortLabel: 'Govern RBAC' },
];

function PermissionRestrictedNotice({
  permissionLabel,
  roleLabel,
}: {
  permissionLabel: string;
  roleLabel: string;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-6">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <h3 className="font-display text-sm font-bold text-slate-900">
            Access Restricted by RBAC Policy
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">
            The permission <strong>{permissionLabel}</strong> is currently disabled for{' '}
            <strong>{roleLabel}</strong> by organizational policy. Contact a{' '}
            <strong>Super Administrator</strong> if access is required for your role.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RoleWorkspacesView() {
  const {
    store,
    isAuthenticated,
    activeRole,
    activeRolePermissions,
    activeSpecialistId,
    currentUser,
    loginWithCredentials,
    logout,
    registerMember,
    updateCurrentUser,
    revokeSession,
    setActiveView,
    setAskFatwaModalOpen,
    openBookingModal,
    updateCaseStatus,
    assignCase,
    nominateCaseForEducation,
    addClinicalNote,
    addReferral,
    routeFatwaToScholar,
    updateFatwaReview,
    rescheduleAppointment,
    deliverConsultationSummary,
    cancelAppointment,
    sendMessage,
    addSpecialistSlot,
    toggleSpecialistVerification,
    addSpecialist,
    updateSpecialist,
    createKnowledgeArticle,
    submitSpecialistReview,
    resetPassword,
    updateArticleChecklist,
    updatePortalSettings,
    updateRolePermission,
    setMandatoryStaff2FA,
    toggleUserTwoFactor,
    savedFatwaIds,
    savedSpecialistIds,
    savedArticleIds,
    toggleBookmark,
    setSelectedSpecialistId,
    pushToast,
  } = usePortal();

  // Authentication Gate sub-state
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPseudonym, setRegPseudonym] = useState('');
  const [regUsePseudonym, setRegUsePseudonym] = useState(true);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  // Member sub-state
  const [userTab, setUserTab] = useState<'cases' | 'appointments' | 'fatwas' | 'privacy'>('cases');
  const [userThreadId, setUserThreadId] = useState<string>('apt_501');
  const [chatDraft, setChatDraft] = useState('');
  const [pseudonymDrafts, setPseudonymDrafts] = useState<Record<string, string>>({});
  const [rescheduleTargetId, setRescheduleTargetId] = useState<string | null>(null);
  const [rescheduleSlotId, setRescheduleSlotId] = useState<string>('');
  const [reviewAptId, setReviewAptId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewContext, setReviewContext] = useState<string>('');
  const [reviewQuote, setReviewQuote] = useState<string>('');

  // Mufti sub-state
  const [muftiTab, setMuftiTab] = useState<'fatwas' | 'consultations'>('fatwas');
  const [selectedFatwaId, setSelectedFatwaId] = useState<string>(
    store.fatwas.find((f) => f.status !== 'Published')?.id || store.fatwas[0]?.id || ''
  );
  const activeFatwa = useMemo(
    () => store.fatwas.find((f) => f.id === selectedFatwaId) || store.fatwas[0],
    [selectedFatwaId, store.fatwas]
  );
  const [fatwaAnswerDraft, setFatwaAnswerDraft] = useState(activeFatwa?.rulingAnswer || '');
  const [fatwaRefsDraft, setFatwaRefsDraft] = useState(
    activeFatwa?.references.join('\n') || ''
  );
  const [fatwaSchoolDraft, setFatwaSchoolDraft] = useState<SchoolOfThought>(
    activeFatwa?.schoolOfThought || 'Hanafi'
  );
  const [fatwaRevisionDraft, setFatwaRevisionDraft] = useState(activeFatwa?.revisionNote || '');

  // Specialist practitioner sub-state (shared cleanly across Family Counsellor, Mental Health, Legal Advisor, Mufti consults)
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [practitionerThreadId, setPractitionerThreadId] = useState<string>('');
  const [selectedAptId, setSelectedAptId] = useState<string>('');
  const [clinicalNoteDraft, setClinicalNoteDraft] = useState('');
  const [referralDiscipline, setReferralDiscipline] =
    useState<SpecialistDiscipline>('Islamic Legal Advisor');
  const [referralReason, setReferralReason] = useState('');
  const [newSlotDate, setNewSlotDate] = useState('Sat, Nov 28');
  const [newSlotTime, setNewSlotTime] = useState('11:00 AM');
  const [attendanceDraft, setAttendanceDraft] = useState<'Scheduled' | 'Attended' | 'Missed'>('Attended');
  const [summaryDraft, setSummaryDraft] = useState('');

  // Case Manager sub-state
  const [triageFilter, setTriageFilter] = useState<'all' | 'urgent' | 'unassigned'>('all');
  const [managerTab, setManagerTab] = useState<'cases' | 'fatwa_routing'>('cases');

  // Knowledge Moderator sub-state
  const [modFilter, setModFilter] = useState<'all' | 'pending' | 'takedown'>('all');
  const [articleSummaryEdits, setArticleSummaryEdits] = useState<Record<string, string>>({});
  const [showCreateArticle, setShowCreateArticle] = useState(false);
  const [newArtTitle, setNewArtTitle] = useState('');
  const [newArtCategory, setNewArtCategory] = useState('Talaq & Khula');
  const [newArtType, setNewArtType] = useState<'Educational Article' | 'Anonymized Case Guide'>(
    'Educational Article'
  );
  const [newArtSummary, setNewArtSummary] = useState('');
  const [newArtIslamic, setNewArtIslamic] = useState('');
  const [newArtCivil, setNewArtCivil] = useState('');
  const [newArtCounselling, setNewArtCounselling] = useState('');
  const [newArtReadMinutes, setNewArtReadMinutes] = useState(5);
  const [newArtApprovedBy, setNewArtApprovedBy] = useState('Mufti Muhammad Qasim Attari');

  // Admin sub-state
  const [adminTab, setAdminTab] = useState<'specialists' | 'appointments' | 'audit' | 'settings'>(
    'specialists'
  );
  const [showSpecialistForm, setShowSpecialistForm] = useState(false);
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null);
  const [specName, setSpecName] = useState('');
  const [specDiscipline, setSpecDiscipline] = useState<SpecialistDiscipline>('Family Counsellor');
  const [specTitle, setSpecTitle] = useState('');
  const [specCredentials, setSpecCredentials] = useState('');
  const [specExperience, setSpecExperience] = useState(8);
  const [specFee, setSpecFee] = useState(2000);
  const [specWaitTime, setSpecWaitTime] = useState('Under 24 Hrs');
  const [specLanguages, setSpecLanguages] = useState('English, Urdu');
  const [specSpecialties, setSpecSpecialties] = useState('Marital Conflict, Parenting & Custody');
  const [specBio, setSpecBio] = useState('');
  const [specImageKey, setSpecImageKey] = useState<SpecialistProfile['imageKey']>('counsellor');
  const [specCouplesMediation, setSpecCouplesMediation] = useState(true);
  const [discountPctDraft, setDiscountPctDraft] = useState(store.settings.communityDiscountPercent);
  const [discountCodeDraft, setDiscountCodeDraft] = useState(store.settings.discountCode);
  const [discreetSubjectDraft, setDiscreetSubjectDraft] = useState(
    store.settings.discreetEmailSubject
  );
  const [staffingDraft, setStaffingDraft] = useState(store.settings.staffingHoursNote);

  // Super Admin sub-state
  const [superTab, setSuperTab] = useState<'rbac' | 'security' | 'audit'>('rbac');
  const [escalationOwnerDraft, setEscalationOwnerDraft] = useState(store.settings.escalationOwner);
  const [responseLimitDraft, setResponseLimitDraft] = useState(store.settings.responseLimitHours);
  const [auditFilter, setAuditFilter] = useState<'all' | 'governance' | 'safeguarding'>('all');

  const activeRoleMeta = ROLES.find((r) => r.id === activeRole) || ROLES[0];

  const grantedCapabilities = useMemo(
    () =>
      PERMISSION_COLUMNS.filter((col) => activeRolePermissions[col.key]).map((col) => col.shortLabel),
    [activeRolePermissions]
  );

  // Strict Member data isolation
  const userCases = useMemo(
    () => store.cases.filter((c) => c.userId === currentUser.id),
    [store.cases, currentUser.id]
  );
  const userAppointments = useMemo(
    () => store.appointments.filter((a) => a.userId === currentUser.id),
    [store.appointments, currentUser.id]
  );
  const userFatwas = useMemo(
    () => store.fatwas.filter((f) => f.submittedByUserId === currentUser.id),
    [store.fatwas, currentUser.id]
  );
  const effectiveUserThreadId = useMemo(() => {
    if (userAppointments.some((a) => a.id === userThreadId)) return userThreadId;
    return userAppointments[0]?.id ?? '';
  }, [userAppointments, userThreadId]);

  // Strict Specialist data isolation (each specialist ONLY sees their own assigned cases, appointments, slots, threads, and authored notes)
  const specialistProfile = useMemo(
    () => store.specialists.find((s) => s.id === activeSpecialistId) || null,
    [store.specialists, activeSpecialistId]
  );
  const specialistCases = useMemo(
    () =>
      activeSpecialistId
        ? store.cases.filter((c) => c.assignedSpecialistId === activeSpecialistId)
        : [],
    [store.cases, activeSpecialistId]
  );
  const specialistAppointments = useMemo(
    () =>
      activeSpecialistId
        ? store.appointments.filter((a) => a.specialistId === activeSpecialistId)
        : [],
    [store.appointments, activeSpecialistId]
  );
  const effectiveCaseId = useMemo(() => {
    if (specialistCases.some((c) => c.id === selectedCaseId)) return selectedCaseId;
    return specialistCases[0]?.id ?? '';
  }, [specialistCases, selectedCaseId]);
  const effectiveSpecialistThreadId = useMemo(() => {
    if (specialistAppointments.some((a) => a.id === practitionerThreadId)) return practitionerThreadId;
    return specialistAppointments[0]?.id ?? '';
  }, [specialistAppointments, practitionerThreadId]);
  const effectiveSpecialistAptId = useMemo(() => {
    if (specialistAppointments.some((a) => a.id === selectedAptId)) return selectedAptId;
    return specialistAppointments[0]?.id ?? '';
  }, [specialistAppointments, selectedAptId]);

  const activeUserThreadMessages = useMemo(
    () => store.messages.filter((m) => m.threadId === effectiveUserThreadId),
    [store.messages, effectiveUserThreadId]
  );
  const activeSpecialistThreadMessages = useMemo(
    () => store.messages.filter((m) => m.threadId === effectiveSpecialistThreadId),
    [store.messages, effectiveSpecialistThreadId]
  );

  const triageCases = useMemo(
    () =>
      store.cases.filter((c) => {
        if (triageFilter === 'urgent') {
          return c.isSafeguardingFlagged || c.status === 'Urgent Review';
        }
        if (triageFilter === 'unassigned') return !c.assignedSpecialistId;
        return true;
      }),
    [store.cases, triageFilter]
  );

  const moderatedArticles = useMemo(
    () =>
      store.articles.filter((a) => {
        if (modFilter === 'pending') return a.status === 'Pending Review' || a.status === 'Draft';
        if (modFilter === 'takedown') return Boolean(a.takedownRequested);
        return true;
      }),
    [store.articles, modFilter]
  );

  const muftiScholars = useMemo(
    () => store.specialists.filter((s) => s.discipline === 'Mufti / Islamic Scholar'),
    [store.specialists]
  );

  const staffUsers = useMemo(
    () => store.users.filter((u) => u.role !== 'user'),
    [store.users]
  );

  const filteredGovernanceLogs = useMemo(
    () =>
      store.auditLogs.filter((log) => {
        if (auditFilter === 'governance') return log.targetType === 'Governance' || log.targetType === 'Account';
        if (auditFilter === 'safeguarding') return log.targetType === 'Safeguarding';
        return true;
      }),
    [store.auditLogs, auditFilter]
  );

  const handleSelectFatwaForEdit = (id: string) => {
    setSelectedFatwaId(id);
    const found = store.fatwas.find((f) => f.id === id);
    if (found) {
      setFatwaAnswerDraft(found.rulingAnswer);
      setFatwaRefsDraft(found.references.join('\n'));
      setFatwaSchoolDraft(found.schoolOfThought);
      setFatwaRevisionDraft(found.revisionNote || '');
    }
  };

  const handleSendChat = (e: React.FormEvent, threadId: string) => {
    e.preventDefault();
    if (!chatDraft.trim() || !threadId) return;
    sendMessage(threadId, chatDraft);
    setChatDraft('');
  };

  const handleExportMemberData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      account: {
        name: currentUser.name,
        pseudonym: currentUser.pseudonym,
        email: currentUser.email,
      },
      cases: userCases,
      appointments: userAppointments,
      fatwaRequests: userFatwas,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rahnuma-privacy-export-${currentUser.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast('Personal Privacy Data Exported', 'Downloaded JSON archive locally.');
  };

  const pseudonymValue =
    pseudonymDrafts[currentUser.id] !== undefined
      ? pseudonymDrafts[currentUser.id]
      : currentUser.pseudonym;

  const isPractitionerWorkspace =
    activeRole === 'family_counsellor' ||
    activeRole === 'mental_health' ||
    activeRole === 'legal_advisor';

  const practitionerConfig = useMemo(() => {
    if (activeRole === 'mental_health') {
      return {
        sectionTitle: 'Trauma-Informed Clinical Care & Patient Sessions',
        notesTitle: 'Private Clinical Assessment Notes',
        notesPlaceholder: 'Document confidential psychological observations (visible only to you)...',
        defaultReferral: 'Family Counsellor' as SpecialistDiscipline,
      };
    }
    if (activeRole === 'legal_advisor') {
      return {
        sectionTitle: 'Islamic & Civil Family Law Counsel',
        notesTitle: 'Private Legal Counsel Notes',
        notesPlaceholder: 'Document Nikahnama, Mahr, or statutory filing notes (visible only to you)...',
        defaultReferral: 'Mufti / Islamic Scholar' as SpecialistDiscipline,
      };
    }
    return {
      sectionTitle: 'Family & Marital Systems Counselling',
      notesTitle: 'Private Family Session Notes',
      notesPlaceholder: 'Document confidential family session progress (visible only to you)...',
      defaultReferral: 'Islamic Legal Advisor' as SpecialistDiscipline,
    };
  }, [activeRole]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginEmail.includes('@') || !loginPassword) {
      setAuthError('Please enter your email address and password.');
      return;
    }
    const res = loginWithCredentials(loginEmail, loginPassword);
    if (!res.ok) {
      setAuthError(res.error || 'Invalid credentials.');
      return;
    }
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (regName.trim().length < 2 || !regEmail.includes('@')) {
      setAuthError('Please enter your full name and a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    const res = registerMember({
      name: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      pseudonym: regPseudonym,
      usePseudonym: regUsePseudonym,
    });
    if (!res.ok) {
      setAuthError(res.error || 'Registration could not be completed.');
      return;
    }
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegPseudonym('');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!resetEmail.includes('@')) {
      setAuthError('Please enter your registered email address.');
      return;
    }
    if (resetNewPassword.length < 6) {
      setAuthError('New password must be at least 6 characters.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setAuthError('New passwords do not match.');
      return;
    }
    const res = resetPassword(resetEmail, resetNewPassword);
    if (!res.ok) {
      setAuthError(res.error || 'Could not reset password.');
      return;
    }
    setLoginEmail(resetEmail);
    setLoginPassword('');
    setResetEmail('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setAuthMode('login');
  };

  if (!isAuthenticated) {
    const portalAccessAccounts = store.users.filter((u) => Boolean(u.password));
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Sign In / Create Account Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#064E3B]">
              <Lock className="h-4 w-4" />
              <span>Encrypted Portal Access</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Sign In to Rahnuma Portal
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Access your personal member workspace or authorized practitioner dashboard.
            </p>

            <div className="mt-5 flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              {(
                [
                  ['login', 'Sign In'],
                  ['register', 'Create Account'],
                  ['reset', 'Forgot Password'],
                ] as const
              ).map(([tab, lbl]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setAuthMode(tab);
                    setAuthError('');
                  }}
                  className={`flex-1 rounded-lg py-2 transition-colors ${
                    authMode === tab ? 'bg-white text-[#064E3B] shadow-sm' : 'text-slate-600'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="portal-login-email"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Email Address *
                  </label>
                  <input
                    id="portal-login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@rahnuma.org"
                    className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm focus:border-[#064E3B] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="portal-login-password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Password *
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="portal-login-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-11 w-full rounded-lg border border-slate-300 pl-3.5 pr-10 text-sm focus:border-[#064E3B] focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {authError && <p className="text-xs font-semibold text-rose-700">{authError}</p>}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#064E3B] py-3 text-sm font-semibold text-white hover:bg-[#053B2D]"
                >
                  Sign In
                </button>
              </form>
            )}

            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3.5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="portal-reg-name"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Full Name *
                    </label>
                    <input
                      id="portal-reg-name"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Your full name"
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="portal-reg-phone"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Mobile Number
                    </label>
                    <input
                      id="portal-reg-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+92 300 0000000"
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="portal-reg-email"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Email Address *
                  </label>
                  <input
                    id="portal-reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.org"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="portal-reg-pseudonym"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Protected Pseudonym (Recommended)
                  </label>
                  <input
                    id="portal-reg-pseudonym"
                    name="pseudonym"
                    type="text"
                    value={regPseudonym}
                    onChange={(e) => setRegPseudonym(e.target.value)}
                    placeholder="e.g., Member S.K. (Protected)"
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="portal-reg-password"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Password *
                    </label>
                    <input
                      id="portal-reg-password"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="portal-reg-confirm-password"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Confirm Password *
                    </label>
                    <input
                      id="portal-reg-confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    />
                  </div>
                </div>

                <label
                  htmlFor="portal-reg-use-pseudonym"
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  <input
                    id="portal-reg-use-pseudonym"
                    name="usePseudonym"
                    type="checkbox"
                    checked={regUsePseudonym}
                    onChange={(e) => setRegUsePseudonym(e.target.checked)}
                    className="rounded border-slate-300 text-[#064E3B]"
                  />
                  <span>Display pseudonym instead of real name to specialists</span>
                </label>

                {authError && <p className="text-xs font-semibold text-rose-700">{authError}</p>}

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#064E3B] py-3 text-sm font-semibold text-white hover:bg-[#053B2D]"
                >
                  Create &amp; Verify Member Account
                </button>
              </form>
            )}

            {authMode === 'reset' && (
              <form onSubmit={handleResetSubmit} className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="portal-reset-email"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Registered Email Address *
                  </label>
                  <input
                    id="portal-reset-email"
                    name="resetEmail"
                    type="email"
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@example.org"
                    className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="portal-reset-new-password"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      New Password *
                    </label>
                    <input
                      id="portal-reset-new-password"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="portal-reset-confirm-password"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Confirm New Password *
                    </label>
                    <input
                      id="portal-reset-confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                    />
                  </div>
                </div>
                {authError && <p className="text-xs font-semibold text-rose-700">{authError}</p>}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#064E3B] py-3 text-sm font-semibold text-white hover:bg-[#053B2D]"
                >
                  Reset Password
                </button>
              </form>
            )}

            <p className="mt-5 flex items-center justify-center gap-1.5 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#064E3B]" />
              <span>Your identity stays anonymous and your data secure.</span>
            </p>
          </div>

          {/* Right: Pre-Seeded Role Access Directory for Testing */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 lg:col-span-6">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-display text-base font-bold text-slate-900">
                  Authorized Role Login Credentials
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Sign in with any role below to verify isolated permissions and dashboards.
                </p>
              </div>
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#064E3B]" />
            </div>

            <div className="mt-4 space-y-2">
              {portalAccessAccounts.map((acc) => {
                const roleLabel = ROLES.find((r) => r.id === acc.role)?.label || acc.role;
                return (
                  <div
                    key={acc.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900">
                        {roleLabel}{' '}
                        <span className="font-normal text-slate-500">· {acc.name}</span>
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-600">
                        {acc.email} · Pass: {acc.password}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setLoginEmail(acc.email);
                        setLoginPassword(acc.password || '');
                        setAuthError('');
                      }}
                      className="shrink-0 rounded-md border border-[#064E3B] px-2.5 py-1 text-[11px] font-semibold text-[#064E3B] hover:bg-[#ECFDF5]"
                    >
                      Use Credentials
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Isolated Authenticated Role Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold text-[#064E3B]">
              Signed in as {currentUser.name} ({currentUser.email})
              {activeRole !== 'user' && store.settings.mandatoryStaff2FA
                ? currentUser.twoFactorEnabled
                  ? ' · 2FA Verified'
                  : ' · 2FA Required by Policy'
                : currentUser.twoFactorEnabled
                ? ' · 2FA Active'
                : ''}
            </p>
            <h1 className="mt-0.5 font-display text-xl font-bold text-slate-900">
              {activeRoleMeta.label} Dashboard
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">{activeRoleMeta.shortDesc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView('home')}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Public Site
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Live Granted Permissions Summary */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-1.5 text-slate-700">
            <Lock className="h-3.5 w-3.5 shrink-0 text-[#064E3B]" />
            <span className="font-semibold text-slate-900">Authorized Permissions:</span>
            <span>
              {grantedCapabilities.length > 0
                ? grantedCapabilities.join(' · ')
                : 'Read-only access'}
            </span>
          </div>
          {activeSpecialistId && specialistProfile && (
            <span className="font-mono text-[11px] text-slate-500">
              Practitioner Profile: {specialistProfile.discipline}
            </span>
          )}
        </div>
      </div>

      {/* 1. REGISTERED USER WORKSPACE */}
      {activeRole === 'user' && (
        <div className="mt-6 space-y-6">
          {!activeRolePermissions.submitCasesAndBook && (
            <PermissionRestrictedNotice
              permissionLabel="Submit Cases & Book Consultations"
              roleLabel="Registered User"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
              {(
                [
                  ['cases', `My Cases (${userCases.length})`],
                  ['appointments', `Appointments & Chat (${userAppointments.length})`],
                  ['fatwas', `My Fatwa Requests (${userFatwas.length})`],
                  ['privacy', 'Account, Sessions & Privacy'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setUserTab(id)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                    userTab === id
                      ? 'bg-[#064E3B] text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {activeRolePermissions.submitCasesAndBook && (
                <>
                  <button
                    type="button"
                    onClick={() => setAskFatwaModalOpen(true)}
                    className="whitespace-nowrap rounded-lg border border-[#064E3B] px-3.5 py-2 text-xs font-semibold text-[#064E3B] hover:bg-[#ECFDF5]"
                  >
                    Ask a Mufti
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('submit-case')}
                    className="whitespace-nowrap rounded-lg bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                  >
                    New Private Case
                  </button>
                </>
              )}
            </div>
          </div>

          {userTab === 'cases' && (
            <div className="space-y-4">
              {userCases.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm font-semibold text-slate-900">
                    No private cases submitted yet under {currentUser.name}
                  </p>
                  {activeRolePermissions.submitCasesAndBook && (
                    <button
                      type="button"
                      onClick={() => setActiveView('submit-case')}
                      className="mt-3 rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white"
                    >
                      Submit Your First Case
                    </button>
                  )}
                </div>
              ) : (
                userCases.map((c) => {
                  const events = store.caseTimeline.filter((tl) => tl.caseId === c.id);
                  return (
                    <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="max-w-2xl">
                          <p className="font-mono text-xs text-slate-500">
                            {c.id} · {c.category} · Language: {c.preferredLanguage} · Updated{' '}
                            {c.updatedAt}
                          </p>
                          <h2 className="mt-1 font-display text-base font-bold text-slate-900">
                            {c.title}
                          </h2>
                          <p className="mt-1.5 text-sm text-slate-600">{c.narrative}</p>
                          {c.attachments && c.attachments.length > 0 && (
                            <p className="mt-2 text-xs text-slate-500">
                              Attachments: {c.attachments.map((a) => a.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${
                              c.isSafeguardingFlagged
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-[#ECFDF5] text-[#064E3B]'
                            }`}
                          >
                            Status: {c.status}
                          </span>
                          <p className="mt-1.5 text-xs text-slate-500">
                            {c.assignedSpecialistName
                              ? `Assigned: ${c.assignedSpecialistName}`
                              : 'Awaiting specialist assignment'}
                          </p>
                          {(c.status === 'Resolved' || c.status === 'Closed') &&
                            activeRolePermissions.submitCasesAndBook && (
                              <button
                                type="button"
                                onClick={() => updateCaseStatus(c.id, 'Reopened')}
                                className="mt-2 text-xs font-semibold text-[#064E3B] hover:underline"
                              >
                                Reopen Case
                              </button>
                            )}
                        </div>
                      </div>

                      {events.length > 0 && (
                        <div className="mt-4 border-t border-slate-100 pt-3">
                          <p className="text-[11px] font-semibold text-slate-500">Case Timeline</p>
                          <div className="mt-1.5 space-y-1">
                            {events.slice(0, 3).map((ev) => (
                              <p key={ev.id} className="text-xs text-slate-600">
                                <span className="font-mono text-[11px] text-slate-400">
                                  {ev.timestamp}
                                </span>{' '}
                                — {ev.label} ({ev.actor})
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {userTab === 'appointments' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="space-y-3 lg:col-span-5">
                {userAppointments.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
                    No appointments scheduled.
                    {activeRolePermissions.submitCasesAndBook && (
                      <button
                        type="button"
                        onClick={() => setActiveView('specialists')}
                        className="mt-3 block w-full rounded-lg bg-[#064E3B] py-2 text-xs font-semibold text-white"
                      >
                        Browse Specialists
                      </button>
                    )}
                  </div>
                ) : (
                  userAppointments.map((apt) => {
                    const spec = store.specialists.find((s) => s.id === apt.specialistId);
                    const openForResched = spec?.slots.filter((sl) => !sl.isBooked) || [];
                    return (
                      <div
                        key={apt.id}
                        onClick={() => setUserThreadId(apt.id)}
                        className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                          effectiveUserThreadId === apt.id
                            ? 'border-[#064E3B] bg-[#ECFDF5]/70'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{apt.specialistName}</p>
                            <p className="text-xs text-slate-500">{apt.specialistDiscipline}</p>
                          </div>
                          <span className="text-xs font-semibold text-[#064E3B]">
                            {apt.status} · {apt.attendanceStatus}
                          </span>
                        </div>
                        <p className="mt-2 font-mono text-xs text-slate-600 tabular-nums">
                          {apt.slotDate} · {apt.slotTime} · Mode: {apt.mode.toUpperCase()}
                        </p>
                        {apt.deliveredSummary && (
                          <div className="mt-2.5 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700">
                            <span className="font-semibold text-[#064E3B]">
                              Delivered Summary:{' '}
                            </span>
                            {apt.deliveredSummary}
                          </div>
                        )}

                        {activeRolePermissions.submitCasesAndBook && (
                          <div
                            className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex gap-3">
                              {apt.status !== 'Cancelled' && openForResched.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRescheduleTargetId(
                                      rescheduleTargetId === apt.id ? null : apt.id
                                    );
                                    setRescheduleSlotId(openForResched[0].id);
                                  }}
                                  className="font-semibold text-[#064E3B] hover:underline"
                                >
                                  Reschedule
                                </button>
                              )}
                              {spec && (
                                <button
                                  type="button"
                                  onClick={() => openBookingModal(spec)}
                                  className="font-semibold text-emerald-700 hover:underline"
                                >
                                  Book Follow-Up
                                </button>
                              )}
                              {apt.status !== 'Cancelled' &&
                                !store.reviews.some((r) => r.appointmentId === apt.id) && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReviewAptId(reviewAptId === apt.id ? null : apt.id);
                                      setReviewRating(5);
                                      setReviewContext(apt.specialistDiscipline);
                                      setReviewQuote('');
                                    }}
                                    className="font-semibold text-amber-700 hover:underline"
                                  >
                                    Leave Review
                                  </button>
                                )}
                            </div>
                            {apt.status === 'Confirmed' && (
                              <button
                                type="button"
                                onClick={() => cancelAppointment(apt.id)}
                                className="font-semibold text-rose-700 hover:underline"
                              >
                                Cancel Slot
                              </button>
                            )}
                          </div>
                        )}

                        {reviewAptId === apt.id && (
                          <div
                            className="mt-3 space-y-2 border-t border-slate-100 pt-2.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center gap-2">
                              <select
                                aria-label="Session rating"
                                value={reviewRating}
                                onChange={(e) => setReviewRating(Number(e.target.value))}
                                className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs"
                              >
                                <option value={5}>5 Stars</option>
                                <option value={4}>4 Stars</option>
                                <option value={3}>3 Stars</option>
                                <option value={2}>2 Stars</option>
                                <option value={1}>1 Star</option>
                              </select>
                              <input
                                type="text"
                                aria-label="Review topic"
                                value={reviewContext}
                                onChange={(e) => setReviewContext(e.target.value)}
                                placeholder="Topic (e.g., Family Guidance)"
                                className="h-8 flex-1 rounded-lg border border-slate-300 px-2.5 text-xs"
                              />
                            </div>
                            <textarea
                              rows={2}
                              aria-label="Review feedback"
                              value={reviewQuote}
                              onChange={(e) => setReviewQuote(e.target.value)}
                              placeholder="Share confidential feedback (min 10 characters)..."
                              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReviewAptId(null)}
                                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={reviewQuote.trim().length < 10}
                                onClick={() => {
                                  submitSpecialistReview({
                                    specialistId: apt.specialistId,
                                    appointmentId: apt.id,
                                    context: reviewContext || apt.specialistDiscipline,
                                    rating: reviewRating,
                                    quote: reviewQuote,
                                  });
                                  setReviewAptId(null);
                                  setReviewQuote('');
                                }}
                                className="rounded-lg bg-[#064E3B] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                              >
                                Submit Review
                              </button>
                            </div>
                          </div>
                        )}

                        {rescheduleTargetId === apt.id && openForResched.length > 0 && (
                          <div
                            className="mt-3 flex gap-2 border-t border-slate-100 pt-2.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={rescheduleSlotId}
                              onChange={(e) => setRescheduleSlotId(e.target.value)}
                              className="h-8 flex-1 rounded-lg border border-slate-300 bg-white px-2 text-xs"
                            >
                              {openForResched.map((sl) => (
                                <option key={sl.id} value={sl.id}>
                                  {sl.date} — {sl.time}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                rescheduleAppointment(apt.id, rescheduleSlotId);
                                setRescheduleTargetId(null);
                              }}
                              className="rounded-lg bg-[#064E3B] px-3 text-xs font-semibold text-white"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex flex-col rounded-xl border border-slate-200 bg-white lg:col-span-7">
                <div className="border-b border-slate-200 px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      Private Async Consultation Thread
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Lock className="h-3.5 w-3.5 text-emerald-600" /> Recording Disabled
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-[#064E3B]">
                    Your identity stays anonymous and your data secure.
                  </p>
                </div>
                <div className="max-h-80 flex-1 space-y-3 overflow-y-auto p-5">
                  {activeUserThreadMessages.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-500">
                      No messages in this thread yet. Send a private note below to begin.
                    </p>
                  ) : (
                    activeUserThreadMessages.map((msg) => {
                      const mine = msg.senderRole === 'user';
                      return (
                        <div
                          key={msg.id}
                          className={`rounded-xl p-3.5 text-xs ${
                            mine
                              ? 'ml-8 bg-[#064E3B] text-white'
                              : 'mr-8 border border-slate-200 bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 opacity-80">
                            <span className="font-semibold">{msg.senderName}</span>
                            <span className="font-mono text-[11px]">{msg.createdAt}</span>
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed">{msg.body}</p>
                        </div>
                      );
                    })
                  )}
                </div>
                {activeRolePermissions.submitCasesAndBook && effectiveUserThreadId && (
                  <form
                    onSubmit={(e) => handleSendChat(e, effectiveUserThreadId)}
                    className="flex gap-2 border-t border-slate-200 p-3"
                  >
                    <input
                      type="text"
                      value={chatDraft}
                      onChange={(e) => setChatDraft(e.target.value)}
                      placeholder="Write a confidential follow-up message..."
                      className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm focus:border-[#064E3B] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#064E3B] px-4 text-xs font-semibold text-white hover:bg-[#053B2D]"
                    >
                      <Send className="h-3.5 w-3.5" /> Send
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {userTab === 'fatwas' && (
            <div className="space-y-3">
              {userFatwas.map((f) => (
                <div key={f.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-xs text-slate-500">
                        {f.referenceCode} · {f.category} · {f.schoolOfThought}
                      </p>
                      <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                        {f.questionTitle}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{f.questionBody}</p>
                    </div>
                    <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                      {f.status}
                    </span>
                  </div>
                  {f.rulingAnswer && (
                    <div className="mt-4 border-t border-slate-100 pt-3 text-sm text-slate-800">
                      <p className="text-xs font-semibold text-[#064E3B]">
                        Scholarly Answer ({f.scholarName}):
                      </p>
                      <p className="mt-1">{f.rulingAnswer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {userTab === 'privacy' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-6">
                <h2 className="font-display text-base font-bold text-slate-900">
                  Identity, 2FA &amp; Notification Privacy
                </h2>
                <div className="mt-4 space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Protected Pseudonym
                    </label>
                    <div className="mt-1.5 flex gap-2">
                      <input
                        type="text"
                        value={pseudonymValue}
                        onChange={(e) =>
                          setPseudonymDrafts((prev) => ({
                            ...prev,
                            [currentUser.id]: e.target.value,
                          }))
                        }
                        className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => updateCurrentUser({ pseudonym: pseudonymValue })}
                        className="rounded-lg bg-[#064E3B] px-4 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={currentUser.usePseudonym}
                      onChange={(e) => updateCurrentUser({ usePseudonym: e.target.checked })}
                      className="rounded border-slate-300 text-[#064E3B]"
                    />
                    Display pseudonym instead of real name to specialists
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={currentUser.discreetNotifications}
                      onChange={(e) =>
                        updateCurrentUser({ discreetNotifications: e.target.checked })
                      }
                      className="rounded border-slate-300 text-[#064E3B]"
                    />
                    Enable discreet notifications (neutral email/SMS subject)
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={currentUser.twoFactorEnabled}
                      onChange={(e) =>
                        updateCurrentUser({ twoFactorEnabled: e.target.checked })
                      }
                      className="rounded border-slate-300 text-[#064E3B]"
                    />
                    Enable Two-Factor Authentication (Optional for members, mandatory for staff)
                  </label>

                  <div className="border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={handleExportMemberData}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Privacy Data Export (JSON)
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6 lg:col-span-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Laptop className="h-4 w-4 text-[#064E3B]" />
                    <span>Active Devices &amp; Session Revocation</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {currentUser.sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{sess.deviceName}</p>
                          <p className="text-slate-500">
                            {sess.location} · {sess.lastActive}
                          </p>
                        </div>
                        {sess.isCurrent ? (
                          <span className="font-semibold text-emerald-700">Current</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => revokeSession(sess.id)}
                            className="font-semibold text-rose-700 hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-[#D97706] fill-[#D97706]" />
                    <h2 className="font-display text-base font-bold text-slate-900">
                      Bookmarked Specialists, Rulings &amp; Guides
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 tabular-nums">
                    {savedSpecialistIds.length} specialists · {savedFatwaIds.length} fatwas ·{' '}
                    {savedArticleIds.length} guides
                  </p>

                  {savedSpecialistIds.length === 0 &&
                  savedFatwaIds.length === 0 &&
                  savedArticleIds.length === 0 ? (
                    <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                      No bookmarked items yet. Bookmark specialists, fatwas, or educational guides
                      across the portal to access them here.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4 text-xs">
                      {savedSpecialistIds.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="font-semibold text-slate-600">Bookmarked Specialists</p>
                          {store.specialists
                            .filter((s) => savedSpecialistIds.includes(s.id))
                            .map((s) => (
                              <div
                                key={s.id}
                                className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-semibold text-slate-800">{s.name}</p>
                                  <p className="truncate text-[11px] text-slate-500">
                                    {s.discipline}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedSpecialistId(s.id)}
                                    className="font-semibold text-[#064E3B] hover:underline"
                                  >
                                    View Profile
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleBookmark('specialist', s.id)}
                                    className="font-medium text-rose-700 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {savedFatwaIds.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="font-semibold text-slate-600">Bookmarked Fatwas</p>
                          {store.fatwas
                            .filter((f) => savedFatwaIds.includes(f.id))
                            .map((f) => (
                              <div
                                key={f.id}
                                className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-slate-800">
                                    {f.questionTitle}
                                  </p>
                                  <p className="truncate font-mono text-[11px] text-slate-500">
                                    {f.referenceCode} · {f.schoolOfThought}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                  <Link
                                    href={`/fatwas/${f.id}`}
                                    className="font-semibold text-[#064E3B] hover:underline"
                                  >
                                    Open
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => toggleBookmark('fatwa', f.id)}
                                    className="font-medium text-rose-700 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {savedArticleIds.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="font-semibold text-slate-600">
                            Bookmarked Educational Guides
                          </p>
                          {store.articles
                            .filter((a) => savedArticleIds.includes(a.id))
                            .map((a) => (
                              <div
                                key={a.id}
                                className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                              >
                                <span className="truncate font-medium text-slate-800">
                                  {a.title}
                                </span>
                                <div className="flex shrink-0 items-center gap-3">
                                  <Link
                                    href={`/knowledge/${a.slug}`}
                                    className="font-semibold text-[#064E3B] hover:underline"
                                  >
                                    Open
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => toggleBookmark('article', a.id)}
                                    className="font-medium text-rose-700 hover:underline"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. MUFTI / ISLAMIC SCHOLAR WORKSPACE */}
      {activeRole === 'mufti' && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">New &amp; In-Review Questions</p>
              <p className="mt-1 font-mono text-2xl font-bold text-[#064E3B] tabular-nums">
                {
                  store.fatwas.filter(
                    (f) => f.status === 'Submitted' || f.status === 'In Review'
                  ).length
                }
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Awaiting Peer Review</p>
              <p className="mt-1 font-mono text-2xl font-bold text-amber-700 tabular-nums">
                {store.fatwas.filter((f) => f.status === 'Peer Review').length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Published Rulings</p>
              <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                {store.fatwas.filter((f) => f.status === 'Published').length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">Scholar Open Slots</p>
              <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {specialistProfile?.slots.filter((sl) => !sl.isBooked).length ?? 0}
              </p>
            </div>
          </div>

          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:w-fit">
            <button
              type="button"
              onClick={() => setMuftiTab('fatwas')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                muftiTab === 'fatwas'
                  ? 'bg-[#064E3B] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Fatwa Adjudication Queue ({store.fatwas.length})
            </button>
            <button
              type="button"
              onClick={() => setMuftiTab('consultations')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                muftiTab === 'consultations'
                  ? 'bg-[#064E3B] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Scholarly Consultations &amp; Slots ({specialistAppointments.length})
            </button>
          </div>

          {muftiTab === 'fatwas' &&
            (!activeRolePermissions.reviewAndApproveFatwas ? (
              <PermissionRestrictedNotice
                permissionLabel="Review & Publish Fatwas"
                roleLabel="Mufti / Islamic Scholar"
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-3 lg:col-span-5">
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Scholarly Fatwa Queue ({store.fatwas.length})
                  </h2>
                  {store.fatwas.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFatwaForEdit(f.id)}
                      className={`w-full rounded-xl border p-4 text-left transition-colors ${
                        activeFatwa?.id === f.id
                          ? 'border-[#064E3B] bg-[#ECFDF5]/80'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-slate-500">{f.referenceCode}</span>
                        <span
                          className={`font-semibold ${
                            f.status === 'Published'
                              ? 'text-emerald-700'
                              : f.status === 'Peer Review'
                              ? 'text-amber-700'
                              : f.status === 'Archived' || f.status === 'Withdrawn'
                              ? 'text-slate-500'
                              : 'text-[#064E3B]'
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-bold text-slate-900">{f.questionTitle}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {f.category} · {f.schoolOfThought} · Scholar: {f.scholarName}
                      </p>
                    </button>
                  ))}
                </div>

                {activeFatwa && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                      <div>
                        <p className="font-mono text-xs text-slate-500">
                          {activeFatwa.referenceCode} · Version {activeFatwa.version}
                        </p>
                        <h2 className="mt-1 font-display text-lg font-bold text-slate-900">
                          {activeFatwa.questionTitle}
                        </h2>
                      </div>
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
                        {activeFatwa.status}
                      </span>
                    </div>

                    <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="text-xs font-semibold text-slate-500">Question Narrative</p>
                      <p className="mt-1">{activeFatwa.questionBody}</p>
                      {activeFatwa.attachments && activeFatwa.attachments.length > 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          Attached files: {activeFatwa.attachments.map((a) => a.name).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 space-y-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            School-of-Thought Context
                          </label>
                          <select
                            value={fatwaSchoolDraft}
                            onChange={(e) => setFatwaSchoolDraft(e.target.value as SchoolOfThought)}
                            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                          >
                            <option value="Hanafi">Hanafi</option>
                            <option value="Maliki">Maliki</option>
                            <option value="Shafii">Shafii</option>
                            <option value="Hanbali">Hanbali</option>
                            <option value="Comparative Fiqh">Comparative Fiqh</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Route by Specialization
                          </label>
                          <select
                            value={activeFatwa.assignedScholarId}
                            onChange={(e) => routeFatwaToScholar(activeFatwa.id, e.target.value)}
                            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                          >
                            {muftiScholars.map((ms) => (
                              <option key={ms.id} value={ms.id}>
                                {ms.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
                          Draft Scholarly Ruling &amp; Pastoral Advice
                        </label>
                        <textarea
                          rows={5}
                          value={fatwaAnswerDraft}
                          onChange={(e) => setFatwaAnswerDraft(e.target.value)}
                          placeholder="Write clear, compassionate, cited Islamic guidance..."
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
                          Quran, Hadith &amp; Fiqh References (one per line)
                        </label>
                        <textarea
                          rows={3}
                          value={fatwaRefsDraft}
                          onChange={(e) => setFatwaRefsDraft(e.target.value)}
                          placeholder="e.g. Surah Al-Baqarah 2:229"
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
                          Correction / Supersession Note (Optional)
                        </label>
                        <input
                          type="text"
                          value={fatwaRevisionDraft}
                          onChange={(e) => setFatwaRevisionDraft(e.target.value)}
                          placeholder="e.g., Clarified Iddah verification requirement"
                          className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {(
                          [
                            ['In Review', 'Save Draft'],
                            ['Peer Review', 'Send to Peer Review'],
                            ['Published', 'Approve & Publish'],
                            ['Superseded', 'Mark Superseded'],
                            ['Archived', 'Archive'],
                            ['Withdrawn', 'Withdraw'],
                          ] as Array<[FatwaStatus, string]>
                        ).map(([nextStatus, btnLabel]) => (
                          <button
                            key={nextStatus}
                            type="button"
                            onClick={() =>
                              updateFatwaReview({
                                fatwaId: activeFatwa.id,
                                rulingAnswer: fatwaAnswerDraft,
                                references: fatwaRefsDraft
                                  .split('\n')
                                  .map((x) => x.trim())
                                  .filter(Boolean),
                                schoolOfThought: fatwaSchoolDraft,
                                status: nextStatus,
                                revisionNote: fatwaRevisionDraft,
                              })
                            }
                            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                              nextStatus === 'Published'
                                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                                : nextStatus === 'Withdrawn'
                                ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                                : 'border border-slate-300 text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            {btnLabel}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

          {muftiTab === 'consultations' &&
            (!activeRolePermissions.manageAssignedConsultations ? (
              <PermissionRestrictedNotice
                permissionLabel="Manage Own Consultations"
                roleLabel="Mufti / Islamic Scholar"
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Calendar className="h-4 w-4 text-[#064E3B]" />
                    <span>Publish Scholar Consultation Slot</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <input
                      type="text"
                      value={newSlotDate}
                      onChange={(e) => setNewSlotDate(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                    />
                    <input
                      type="text"
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        activeSpecialistId &&
                        addSpecialistSlot(activeSpecialistId, newSlotDate, newSlotTime)
                      }
                      className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#064E3B] py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                    >
                      <Plus className="h-3.5 w-3.5" /> Publish Slot
                    </button>
                  </div>
                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                    <p className="font-semibold text-slate-700">Your Listed Slots</p>
                    {specialistProfile?.slots.map((sl) => (
                      <div
                        key={sl.id}
                        className="flex items-center justify-between rounded bg-slate-50 px-2.5 py-1.5"
                      >
                        <span className="font-mono text-slate-700">
                          {sl.date} · {sl.time}
                        </span>
                        <span
                          className={`font-semibold ${
                            sl.isBooked ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {sl.isBooked ? 'Booked' : 'Open'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-7">
                  <h3 className="text-sm font-bold text-slate-900">
                    Your Booked Religious Consultations ({specialistAppointments.length})
                  </h3>
                  {specialistAppointments.length === 0 ? (
                    <p className="mt-4 text-xs text-slate-500">
                      No consultations currently booked with {currentUser.name}. Any bookings made
                      through the Specialists directory will appear here automatically.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2.5">
                      {specialistAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="rounded-lg border border-slate-200 p-3.5 text-xs"
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>{apt.userDisplayName}</span>
                            <span className="font-mono text-[#064E3B]">
                              {apt.slotDate} · {apt.slotTime}
                            </span>
                          </div>
                          <p className="mt-1 text-slate-500">
                            Mode: {apt.mode.toUpperCase()} · Status: {apt.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 3, 4, 5. DISCIPLINE-ISOLATED PRACTITIONER WORKSPACES (Family Counsellor / Mental Health / Legal Advisor) */}
      {isPractitionerWorkspace && (
        <div className="mt-6 space-y-6">
          {!activeRolePermissions.manageAssignedConsultations ? (
            <PermissionRestrictedNotice
              permissionLabel="Manage Assigned Consultations"
              roleLabel={activeRoleMeta.label}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">My Assigned Cases</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[#064E3B] tabular-nums">
                    {specialistCases.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">My Scheduled Sessions</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {specialistAppointments.filter((a) => a.status !== 'Cancelled').length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">My Private Notes</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-amber-700 tabular-nums">
                    {store.clinicalNotes.filter((n) => n.authorId === currentUser.id).length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Open Calendar Slots</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                    {specialistProfile?.slots.filter((sl) => !sl.isBooked).length ?? 0}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-[#ECFDF5]/80 px-4 py-2.5 text-xs text-slate-700">
                <strong className="text-[#064E3B]">{practitionerConfig.sectionTitle}:</strong> You
                only see cases assigned to <strong>{currentUser.name}</strong>, your own client
                threads, and notes authored exclusively by your account.
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="font-display text-sm font-bold text-slate-900">
                      Assigned Cases ({specialistCases.length})
                    </h2>
                    <div className="mt-3 space-y-2">
                      {specialistCases.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No cases currently assigned to you.
                        </p>
                      ) : (
                        specialistCases.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => setSelectedCaseId(c.id)}
                            className={`cursor-pointer rounded-lg border p-3 text-xs ${
                              effectiveCaseId === c.id
                                ? 'border-[#064E3B] bg-[#ECFDF5]/80'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex justify-between font-mono text-slate-500">
                              <span>{c.id}</span>
                              <span className="font-sans font-semibold text-[#064E3B]">
                                {c.status}
                              </span>
                            </div>
                            <p className="mt-1 font-semibold text-slate-900">{c.title}</p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              Client: {c.displayName} · {c.preferredLanguage}
                            </p>
                            {(c.status === 'Resolved' || c.status === 'Closed') &&
                              !c.nominatedForEducation && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    nominateCaseForEducation(c.id);
                                  }}
                                  className="mt-2 inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                                >
                                  <Sparkles className="h-3.5 w-3.5" /> Nominate for Knowledge Hub
                                </button>
                              )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Practitioner Availability Calendar */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Calendar className="h-4 w-4 text-[#064E3B]" />
                      <span>My Availability Slots</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <input
                        type="text"
                        value={newSlotDate}
                        onChange={(e) => setNewSlotDate(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                      />
                      <input
                        type="text"
                        value={newSlotTime}
                        onChange={(e) => setNewSlotTime(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          activeSpecialistId &&
                          addSpecialistSlot(activeSpecialistId, newSlotDate, newSlotTime)
                        }
                        className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#064E3B] py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                      >
                        <Plus className="h-3.5 w-3.5" /> Publish Slot
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 lg:col-span-8">
                  {/* Scoped Async Message Thread */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Client Async Consultation Thread
                      </h3>
                      {specialistAppointments.length > 0 && (
                        <select
                          value={effectiveSpecialistThreadId}
                          onChange={(e) => setPractitionerThreadId(e.target.value)}
                          className="h-8 rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                        >
                          {specialistAppointments.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.userDisplayName} · {a.slotDate} ({a.id})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="mt-3 max-h-56 space-y-2.5 overflow-y-auto">
                      {activeSpecialistThreadMessages.length === 0 ? (
                        <p className="py-4 text-center text-xs text-slate-500">
                          No messages in this consultation thread yet.
                        </p>
                      ) : (
                        activeSpecialistThreadMessages.map((m) => (
                          <div
                            key={m.id}
                            className={`rounded-lg p-3 text-xs ${
                              m.senderRole === 'user'
                                ? 'border border-slate-200 bg-slate-50 text-slate-800'
                                : 'bg-[#ECFDF5] text-slate-900'
                            }`}
                          >
                            <div className="flex justify-between font-semibold">
                              <span>{m.senderName}</span>
                              <span className="font-mono text-[11px] text-slate-500">
                                {m.createdAt}
                              </span>
                            </div>
                            <p className="mt-1 text-sm">{m.body}</p>
                          </div>
                        ))
                      )}
                    </div>
                    {effectiveSpecialistThreadId && (
                      <form
                        onSubmit={(e) => handleSendChat(e, effectiveSpecialistThreadId)}
                        className="mt-3 flex gap-2"
                      >
                        <input
                          type="text"
                          value={chatDraft}
                          onChange={(e) => setChatDraft(e.target.value)}
                          placeholder="Reply to your assigned client discreetly..."
                          className="h-10 flex-1 rounded-lg border border-slate-300 px-3 text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-[#064E3B] px-4 text-xs font-semibold text-white"
                        >
                          Send Reply
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Attendance & Written Summary Delivery (Scoped to own appointments) */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <h3 className="text-sm font-bold text-slate-900">
                      Session Attendance &amp; Written Summary Delivery
                    </h3>
                    {specialistAppointments.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-500">
                        No sessions assigned to {currentUser.name} yet.
                      </p>
                    ) : (
                      <>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <select
                            value={effectiveSpecialistAptId}
                            onChange={(e) => setSelectedAptId(e.target.value)}
                            className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                          >
                            {specialistAppointments.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.userDisplayName} — {a.slotDate} ({a.id})
                              </option>
                            ))}
                          </select>
                          <select
                            value={attendanceDraft}
                            onChange={(e) =>
                              setAttendanceDraft(
                                e.target.value as 'Scheduled' | 'Attended' | 'Missed'
                              )
                            }
                            className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                          >
                            <option value="Attended">Attendance: Attended</option>
                            <option value="Scheduled">Attendance: Scheduled</option>
                            <option value="Missed">Attendance: Missed</option>
                          </select>
                        </div>
                        <textarea
                          rows={2}
                          value={summaryDraft}
                          onChange={(e) => setSummaryDraft(e.target.value)}
                          placeholder="Write post-session guidance summary delivered directly to the Member Dashboard..."
                          className="mt-3 w-full rounded-lg border border-slate-300 p-2.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!summaryDraft.trim() || !effectiveSpecialistAptId) return;
                            deliverConsultationSummary({
                              appointmentId: effectiveSpecialistAptId,
                              attendanceStatus: attendanceDraft,
                              deliveredSummary: summaryDraft,
                            });
                            setSummaryDraft('');
                          }}
                          className="mt-2 rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white"
                        >
                          Save Attendance &amp; Deliver Summary
                        </button>
                      </>
                    )}
                  </div>

                  {/* Private Notes (Permission Gated + Strict Author Isolation) + Cross-Discipline Referral */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {!activeRolePermissions.writePrivateClinicalNotes ? (
                      <PermissionRestrictedNotice
                        permissionLabel="Write Private Notes"
                        roleLabel={activeRoleMeta.label}
                      />
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">
                            {practitionerConfig.notesTitle} ({effectiveCaseId || 'None'})
                          </h3>
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            <Lock className="h-3 w-3" /> Author-Only Access
                          </span>
                        </div>
                        <div className="mt-3 space-y-2">
                          {store.clinicalNotes
                            .filter(
                              (n) =>
                                n.caseId === effectiveCaseId && n.authorId === currentUser.id
                            )
                            .map((n) => (
                              <div
                                key={n.id}
                                className="rounded-lg bg-slate-50 p-3 text-xs text-slate-700"
                              >
                                <p className="font-mono text-[11px] text-slate-500">
                                  {n.createdAt}
                                </p>
                                <p className="mt-1">{n.content}</p>
                              </div>
                            ))}
                        </div>
                        {effectiveCaseId && (
                          <>
                            <textarea
                              rows={3}
                              value={clinicalNoteDraft}
                              onChange={(e) => setClinicalNoteDraft(e.target.value)}
                              placeholder={practitionerConfig.notesPlaceholder}
                              className="mt-3 w-full rounded-lg border border-slate-300 p-2.5 text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                addClinicalNote(effectiveCaseId, clinicalNoteDraft);
                                setClinicalNoteDraft('');
                              }}
                              className="mt-2 w-full rounded-lg bg-[#064E3B] py-2 text-xs font-semibold text-white"
                            >
                              Save Private Note
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <h3 className="text-sm font-bold text-slate-900">
                        Cross-Discipline Referral ({effectiveCaseId || 'None'})
                      </h3>
                      <div className="mt-3 space-y-2">
                        {store.referrals
                          .filter((r) => r.caseId === effectiveCaseId)
                          .map((r) => (
                            <div
                              key={r.id}
                              className="rounded-lg bg-amber-50 p-3 text-xs text-amber-950"
                            >
                              <p className="font-semibold">To: {r.toDiscipline}</p>
                              <p className="mt-0.5">{r.reason}</p>
                            </div>
                          ))}
                      </div>
                      {effectiveCaseId && (
                        <>
                          <select
                            value={referralDiscipline}
                            onChange={(e) =>
                              setReferralDiscipline(e.target.value as SpecialistDiscipline)
                            }
                            className="mt-3 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                          >
                            <option value="Islamic Legal Advisor">Islamic Legal Advisor</option>
                            <option value="Mufti / Islamic Scholar">Mufti / Islamic Scholar</option>
                            <option value="Mental Health Specialist">
                              Mental Health Specialist
                            </option>
                            <option value="Family Counsellor">Family Counsellor</option>
                          </select>
                          <textarea
                            rows={2}
                            value={referralReason}
                            onChange={(e) => setReferralReason(e.target.value)}
                            placeholder="Reason for permitted referral..."
                            className="mt-2 w-full rounded-lg border border-slate-300 p-2.5 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              addReferral(effectiveCaseId, referralDiscipline, referralReason);
                              setReferralReason('');
                            }}
                            className="mt-2 w-full rounded-lg border border-[#064E3B] py-2 text-xs font-semibold text-[#064E3B] hover:bg-[#ECFDF5]"
                          >
                            Issue Permitted Referral
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 6. CASE MANAGER WORKSPACE */}
      {activeRole === 'case_manager' && (
        <div className="mt-6 space-y-5">
          {!activeRolePermissions.triageAndEscalateCases ? (
            <PermissionRestrictedNotice
              permissionLabel="Triage & Escalate Cases"
              roleLabel="Case Manager"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 text-xs sm:grid-cols-3">
                <div>
                  <span className="font-semibold text-slate-900">Staffing Hours:</span>{' '}
                  <span className="text-slate-600">{store.settings.staffingHoursNote}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Escalation Owner:</span>{' '}
                  <span className="text-slate-600">{store.settings.escalationOwner}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Urgent SLA:</span>{' '}
                  <span className="font-mono text-rose-700 tabular-nums">
                    {store.settings.responseLimitHours} hrs max
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setManagerTab('cases')}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                      managerTab === 'cases'
                        ? 'bg-[#064E3B] text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Case Triage Queue ({store.cases.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setManagerTab('fatwa_routing')}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                      managerTab === 'fatwa_routing'
                        ? 'bg-[#064E3B] text-white'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Religious Query Routing ({store.fatwas.length})
                  </button>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                  <Lock className="h-3.5 w-3.5 text-emerald-700" />
                  <span>
                    Privacy Boundary: Private clinical &amp; counselling notes are hidden from Case
                    Managers.
                  </span>
                </div>
              </div>

              {managerTab === 'cases' && (
                <>
                  <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:w-fit">
                    {(
                      [
                        ['all', `All Cases (${store.cases.length})`],
                        [
                          'urgent',
                          `Safeguarding Urgent (${
                            store.cases.filter((c) => c.isSafeguardingFlagged).length
                          })`,
                        ],
                        [
                          'unassigned',
                          `Unassigned (${
                            store.cases.filter((c) => !c.assignedSpecialistId).length
                          })`,
                        ],
                      ] as const
                    ).map(([k, lbl]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setTriageFilter(k)}
                        className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                          triageFilter === k
                            ? 'bg-[#064E3B] text-white'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {triageCases.map((c) => (
                      <div
                        key={c.id}
                        className={`rounded-xl border bg-white p-5 ${
                          c.isSafeguardingFlagged ? 'border-rose-300' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                          <div className="max-w-2xl">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-mono font-semibold text-slate-600">
                                {c.id}
                              </span>
                              <span className="text-slate-400">·</span>
                              <span className="font-medium text-slate-700">{c.category}</span>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-600">Member: {c.displayName}</span>
                              {c.isSafeguardingFlagged && (
                                <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 font-semibold text-rose-800">
                                  <AlertTriangle className="h-3.5 w-3.5" /> Safeguarding Escalation
                                </span>
                              )}
                            </div>
                            <h3 className="mt-1.5 font-display text-base font-bold text-slate-900">
                              {c.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">{c.narrative}</p>

                            {c.couplesMediationBlocked && (
                              <p className="mt-2 text-xs font-semibold text-rose-700">
                                Policy Lock: Couples mediation disabled due to safety/coercion
                                indicators. Assign only to individual trauma or legal care.
                              </p>
                            )}

                            {(c.status === 'Resolved' || c.status === 'Closed') &&
                              !c.nominatedForEducation && (
                                <button
                                  type="button"
                                  onClick={() => nominateCaseForEducation(c.id)}
                                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline"
                                >
                                  <Sparkles className="h-3.5 w-3.5" /> Nominate Resolved Case for
                                  Educational Review
                                </button>
                              )}
                          </div>

                          <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:w-72 lg:flex-col">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500">
                                Case Status (11-Stage Workflow)
                              </label>
                              <select
                                value={c.status}
                                onChange={(e) =>
                                  updateCaseStatus(c.id, e.target.value as CaseStatus)
                                }
                                className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium"
                              >
                                {ALL_CASE_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-500">
                                Assign Authorized Specialist
                              </label>
                              <select
                                value={c.assignedSpecialistId || ''}
                                onChange={(e) => {
                                  if (e.target.value) assignCase(c.id, e.target.value);
                                }}
                                className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium"
                              >
                                <option value="">-- Select Specialist --</option>
                                {store.specialists
                                  .filter((s) =>
                                    c.couplesMediationBlocked ? !s.supportsCouplesMediation : true
                                  )
                                  .map((s) => (
                                    <option key={s.id} value={s.id}>
                                      {s.name} ({s.discipline})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {managerTab === 'fatwa_routing' && (
                <div className="space-y-3">
                  {store.fatwas.map((f) => (
                    <div
                      key={f.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="font-mono text-xs text-slate-500">
                          {f.referenceCode} · {f.category} · Status: {f.status}
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-900">{f.questionTitle}</p>
                      </div>
                      <div className="sm:w-64">
                        <label className="block text-[11px] font-semibold text-slate-500">
                          Assigned Mufti / Scholar
                        </label>
                        <select
                          value={f.assignedScholarId}
                          onChange={(e) => routeFatwaToScholar(f.id, e.target.value)}
                          className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                        >
                          {muftiScholars.map((ms) => (
                            <option key={ms.id} value={ms.id}>
                              {ms.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 7. KNOWLEDGE MODERATOR WORKSPACE */}
      {activeRole === 'knowledge_moderator' && (
        <div className="mt-6 space-y-6">
          {!activeRolePermissions.moderateAndPublishKnowledge ? (
            <PermissionRestrictedNotice
              permissionLabel="Moderate Knowledge Hub"
              roleLabel="Knowledge Moderator"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Pending Review Guides</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-amber-700 tabular-nums">
                    {
                      store.articles.filter(
                        (a) => a.status === 'Pending Review' || a.status === 'Draft'
                      ).length
                    }
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Published Guides</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                    {store.articles.filter((a) => a.status === 'Published').length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Takedown Requests</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-rose-700 tabular-nums">
                    {store.articles.filter((a) => a.takedownRequested).length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Empty-Search Gaps</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[#064E3B] tabular-nums">
                    {store.emptySearches.length}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
                  {(
                    [
                      ['all', `All Guides (${store.articles.length})`],
                      [
                        'pending',
                        `Pending Gate (${
                          store.articles.filter((a) => a.status === 'Pending Review').length
                        })`,
                      ],
                      [
                        'takedown',
                        `Takedown Requests (${
                          store.articles.filter((a) => a.takedownRequested).length
                        })`,
                      ],
                    ] as const
                  ).map(([k, lbl]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setModFilter(k)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                        modFilter === k
                          ? 'bg-[#064E3B] text-white'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                    <Lock className="h-3.5 w-3.5 text-emerald-700" />
                    <span>
                      Privacy Boundary: Moderators review de-identified summaries only, never raw
                      case files.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateArticle((prev) => !prev)}
                    className="rounded-lg bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                  >
                    {showCreateArticle ? 'Close Article Form' : '+ Create New Article'}
                  </button>
                </div>
              </div>

              {showCreateArticle && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newArtTitle.trim().length < 5 || newArtSummary.trim().length < 15) return;
                    createKnowledgeArticle({
                      title: newArtTitle,
                      category: newArtCategory,
                      type: newArtType,
                      summary: newArtSummary,
                      islamicGuidance: newArtIslamic || newArtSummary,
                      civilConsiderations:
                        newArtCivil ||
                        'Verify local family-law documentation and legal protections where applicable.',
                      counsellingOptions:
                        newArtCounselling ||
                        'Book an individual or family consultation through the Rahnuma directory.',
                      readMinutes: newArtReadMinutes,
                      approvedBy: newArtApprovedBy,
                    });
                    setNewArtTitle('');
                    setNewArtSummary('');
                    setNewArtIslamic('');
                    setNewArtCivil('');
                    setNewArtCounselling('');
                    setShowCreateArticle(false);
                  }}
                  className="space-y-4 rounded-xl border border-emerald-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-display text-sm font-bold text-slate-900">
                        Create New Standalone Educational Guide
                      </h3>
                      <p className="text-xs text-slate-500">
                        Saved to the moderation queue so it can pass the 4-step verification gate
                        before publishing.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700">
                        Article Title *
                      </label>
                      <input
                        type="text"
                        required
                        minLength={5}
                        value={newArtTitle}
                        onChange={(e) => setNewArtTitle(e.target.value)}
                        placeholder="e.g., Understanding Spousal Financial Rights in Nikah"
                        className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Category
                      </label>
                      <select
                        value={newArtCategory}
                        onChange={(e) => setNewArtCategory(e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                      >
                        <option value="Talaq & Khula">Talaq &amp; Khula</option>
                        <option value="Marital Conflict">Marital Conflict</option>
                        <option value="Inheritance (Mirath)">Inheritance (Mirath)</option>
                        <option value="Parenting & Custody">Parenting &amp; Custody</option>
                        <option value="Financial Rights">Financial Rights</option>
                        <option value="Grief & Emotional Distress">Grief &amp; Emotional Distress</option>
                        <option value="Domestic Safety Support">Domestic Safety Support</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Guide Type
                      </label>
                      <select
                        value={newArtType}
                        onChange={(e) =>
                          setNewArtType(
                            e.target.value as 'Educational Article' | 'Anonymized Case Guide'
                          )
                        }
                        className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                      >
                        <option value="Educational Article">Educational Article</option>
                        <option value="Anonymized Case Guide">Anonymized Case Guide</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Reviewing Scholar / Panel
                      </label>
                      <input
                        type="text"
                        value={newArtApprovedBy}
                        onChange={(e) => setNewArtApprovedBy(e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Read Time (Minutes)
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={30}
                        value={newArtReadMinutes}
                        onChange={(e) => setNewArtReadMinutes(Number(e.target.value))}
                        className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Executive Summary (De-identified) *
                    </label>
                    <textarea
                      rows={2}
                      required
                      minLength={15}
                      value={newArtSummary}
                      onChange={(e) => setNewArtSummary(e.target.value)}
                      placeholder="Concise, neutral educational overview..."
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Islamic Guidance
                      </label>
                      <textarea
                        rows={3}
                        value={newArtIslamic}
                        onChange={(e) => setNewArtIslamic(e.target.value)}
                        placeholder="Authorized scholarly principles & references..."
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Civil-Law Considerations
                      </label>
                      <textarea
                        rows={3}
                        value={newArtCivil}
                        onChange={(e) => setNewArtCivil(e.target.value)}
                        placeholder="Relevant statutory or documentation notes..."
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Counselling Options
                      </label>
                      <textarea
                        rows={3}
                        value={newArtCounselling}
                        onChange={(e) => setNewArtCounselling(e.target.value)}
                        placeholder="Recommended support pathways..."
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateArticle(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                    >
                      Save Draft to Moderation Queue
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-8">
                  {moderatedArticles.map((art) => {
                    const editedSummary =
                      articleSummaryEdits[art.id] !== undefined
                        ? articleSummaryEdits[art.id]
                        : art.summary;
                    return (
                      <div key={art.id} className="rounded-xl border border-slate-200 bg-white p-5">
                        <div className="flex flex-col justify-between gap-5">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span>{art.type}</span>
                              <span>·</span>
                              <span>{art.category}</span>
                              <span>·</span>
                              <strong className="text-slate-800">{art.status}</strong>
                              {art.sourceCaseId && <span>· Origin Case: {art.sourceCaseId}</span>}
                              {art.takedownRequested && (
                                <span className="rounded bg-rose-100 px-2 py-0.5 font-semibold text-rose-800">
                                  Takedown / Correction Requested
                                </span>
                              )}
                            </div>
                            <h3 className="mt-1 font-display text-base font-bold text-slate-900">
                              {art.title}
                            </h3>
                            <textarea
                              rows={2}
                              value={editedSummary}
                              onChange={(e) =>
                                setArticleSummaryEdits((prev) => ({
                                  ...prev,
                                  [art.id]: e.target.value,
                                }))
                              }
                              className="mt-2 w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-700"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs sm:grid-cols-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={art.consentVerified}
                                onChange={(e) =>
                                  updateArticleChecklist({
                                    articleId: art.id,
                                    summary: editedSummary,
                                    consentVerified: e.target.checked,
                                    piiStripped: art.piiStripped,
                                    safeguardingReviewed: art.safeguardingReviewed,
                                    scholarApproved: art.scholarApproved,
                                  })
                                }
                              />
                              1. Consent Verified
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={art.piiStripped}
                                onChange={(e) =>
                                  updateArticleChecklist({
                                    articleId: art.id,
                                    summary: editedSummary,
                                    consentVerified: art.consentVerified,
                                    piiStripped: e.target.checked,
                                    safeguardingReviewed: art.safeguardingReviewed,
                                    scholarApproved: art.scholarApproved,
                                  })
                                }
                              />
                              2. PII Removed
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={art.safeguardingReviewed}
                                onChange={(e) =>
                                  updateArticleChecklist({
                                    articleId: art.id,
                                    summary: editedSummary,
                                    consentVerified: art.consentVerified,
                                    piiStripped: art.piiStripped,
                                    safeguardingReviewed: e.target.checked,
                                    scholarApproved: art.scholarApproved,
                                  })
                                }
                              />
                              3. Safeguarding Check
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={art.scholarApproved}
                                onChange={(e) =>
                                  updateArticleChecklist({
                                    articleId: art.id,
                                    summary: editedSummary,
                                    consentVerified: art.consentVerified,
                                    piiStripped: art.piiStripped,
                                    safeguardingReviewed: art.safeguardingReviewed,
                                    scholarApproved: e.target.checked,
                                  })
                                }
                              />
                              4. Scholar Approved
                            </label>
                          </div>

                          <div className="flex gap-2">
                            {art.status !== 'Published' && (
                              <button
                                type="button"
                                disabled={
                                  !(
                                    art.consentVerified &&
                                    art.piiStripped &&
                                    art.safeguardingReviewed &&
                                    art.scholarApproved
                                  )
                                }
                                onClick={() =>
                                  updateArticleChecklist({
                                    articleId: art.id,
                                    summary: editedSummary,
                                    consentVerified: art.consentVerified,
                                    piiStripped: art.piiStripped,
                                    safeguardingReviewed: art.safeguardingReviewed,
                                    scholarApproved: art.scholarApproved,
                                    publishNow: true,
                                  })
                                }
                                className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                              >
                                Publish Guide
                              </button>
                            )}
                            {art.status === 'Published' && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateArticleChecklist({
                                    articleId: art.id,
                                    summary: editedSummary,
                                    consentVerified: art.consentVerified,
                                    piiStripped: art.piiStripped,
                                    safeguardingReviewed: art.safeguardingReviewed,
                                    scholarApproved: art.scholarApproved,
                                    withdrawNow: true,
                                  })
                                }
                                className="rounded-lg border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                              >
                                Withdraw / Takedown
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="h-fit rounded-xl border border-slate-200 bg-white p-5 lg:col-span-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <FileText className="h-4 w-4 text-[#064E3B]" />
                    <span>Empty-Search Analytics</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Unmatched visitor searches highlight needed educational guides for scholars and
                    moderators.
                  </p>
                  <div className="mt-4 space-y-2">
                    {store.emptySearches.map((es) => (
                      <div
                        key={es.id}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                      >
                        <span className="font-medium text-slate-800">&ldquo;{es.query}&rdquo;</span>
                        <span className="font-mono text-[11px] text-slate-500">{es.timestamp}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('knowledge')}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#064E3B] hover:underline"
                  >
                    Open Public Knowledge Hub <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 8. ADMINISTRATOR WORKSPACE */}
      {activeRole === 'admin' && (
        <div className="mt-6 space-y-6">
          {!activeRolePermissions.manageOperationsAndAudit ? (
            <PermissionRestrictedNotice
              permissionLabel="Operations & Audit Management"
              roleLabel="Administrator"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Total Cases</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {store.cases.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Safeguarding Flagged</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-rose-700 tabular-nums">
                    {store.cases.filter((c) => c.isSafeguardingFlagged).length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Verified Specialists</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[#064E3B] tabular-nums">
                    {store.specialists.filter((s) => s.isVerified).length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Active Appointments</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                    {store.appointments.filter((a) => a.status !== 'Cancelled').length}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
                  {(
                    [
                      ['specialists', 'Specialist Credentials'],
                      ['appointments', 'Appointments Roster'],
                      ['audit', 'Operational Audit Logs'],
                      ['settings', 'Templates & Discounts'],
                    ] as const
                  ).map(([tab, lbl]) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setAdminTab(tab)}
                      className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold ${
                        adminTab === tab
                          ? 'bg-[#064E3B] text-white'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                  <Lock className="h-3.5 w-3.5 text-emerald-700" />
                  <span>
                    Scope Boundary: Clinical notes hidden; RBAC &amp; security policy managed by
                    Super Admin.
                  </span>
                </div>
              </div>

              {adminTab === 'specialists' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-slate-600">
                      Onboard new verified practitioners or edit credentials, fees, and specialties.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSpecId(null);
                        setSpecName('');
                        setSpecDiscipline('Family Counsellor');
                        setSpecTitle('');
                        setSpecCredentials('');
                        setSpecExperience(8);
                        setSpecFee(2000);
                        setSpecWaitTime('Under 24 Hrs');
                        setSpecLanguages('English, Urdu');
                        setSpecSpecialties('Marital Conflict, Parenting & Custody');
                        setSpecBio('');
                        setSpecImageKey('counsellor');
                        setSpecCouplesMediation(true);
                        setShowSpecialistForm((prev) => !prev);
                      }}
                      className="rounded-lg bg-[#064E3B] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                    >
                      {showSpecialistForm && !editingSpecId
                        ? 'Close Onboarding Form'
                        : '+ Onboard Specialist'}
                    </button>
                  </div>

                  {showSpecialistForm && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (specName.trim().length < 3 || specTitle.trim().length < 3) return;
                        const parsedLangs = specLanguages
                          .split(',')
                          .map((x) => x.trim())
                          .filter(Boolean);
                        const parsedSpecs = specSpecialties
                          .split(',')
                          .map((x) => x.trim())
                          .filter(Boolean);
                        if (editingSpecId) {
                          updateSpecialist(editingSpecId, {
                            name: specName,
                            discipline: specDiscipline,
                            title: specTitle,
                            credentials: specCredentials,
                            experienceYears: specExperience,
                            feeAmount: specFee,
                            waitTime: specWaitTime,
                            languages: parsedLangs,
                            specialties: parsedSpecs,
                            bio: specBio,
                            imageKey: specImageKey,
                            supportsCouplesMediation: specCouplesMediation,
                          });
                        } else {
                          addSpecialist({
                            name: specName,
                            discipline: specDiscipline,
                            title: specTitle,
                            credentials: specCredentials || 'Verified Rahnuma Practitioner',
                            experienceYears: specExperience,
                            feeAmount: specFee,
                            waitTime: specWaitTime,
                            languages: parsedLangs,
                            specialties: parsedSpecs,
                            bio:
                              specBio ||
                              'Provides confidential Islamic and family counselling within Rahnuma ethical guidelines.',
                            imageKey: specImageKey,
                            supportsCouplesMediation: specCouplesMediation,
                          });
                        }
                        setShowSpecialistForm(false);
                        setEditingSpecId(null);
                      }}
                      className="space-y-4 rounded-xl border border-emerald-200 bg-white p-5"
                    >
                      <h3 className="font-display text-sm font-bold text-slate-900">
                        {editingSpecId ? 'Edit Specialist Profile' : 'Onboard New Specialist'}
                      </h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            minLength={3}
                            value={specName}
                            onChange={(e) => setSpecName(e.target.value)}
                            placeholder="e.g., Mufti Salman Raza"
                            className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Discipline
                          </label>
                          <select
                            value={specDiscipline}
                            onChange={(e) =>
                              setSpecDiscipline(e.target.value as SpecialistDiscipline)
                            }
                            className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                          >
                            <option value="Mufti / Islamic Scholar">Mufti / Islamic Scholar</option>
                            <option value="Family Counsellor">Family Counsellor</option>
                            <option value="Mental Health Specialist">
                              Mental Health Specialist
                            </option>
                            <option value="Islamic Legal Advisor">Islamic Legal Advisor</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Avatar Portrait (Privacy Policy)
                          </label>
                          <select
                            value={specImageKey}
                            onChange={(e) =>
                              setSpecImageKey(e.target.value as SpecialistProfile['imageKey'])
                            }
                            className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                          >
                            <option value="counsellor">Female Privacy Avatar (Faceless)</option>
                            <option value="mufti">Mufti Portrait (Senior)</option>
                            <option value="mufti_bilal">Mufti Portrait (Scholar)</option>
                            <option value="psychologist">Male Specialist Portrait</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Professional Title *
                          </label>
                          <input
                            type="text"
                            required
                            minLength={3}
                            value={specTitle}
                            onChange={(e) => setSpecTitle(e.target.value)}
                            placeholder="e.g., Senior Family & Marital Counsellor"
                            className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Credentials
                          </label>
                          <input
                            type="text"
                            value={specCredentials}
                            onChange={(e) => setSpecCredentials(e.target.value)}
                            placeholder="e.g., Alimiyyah, MS Family Psychology"
                            className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Experience (Yrs)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={specExperience}
                            onChange={(e) => setSpecExperience(Number(e.target.value))}
                            className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Fee (PKR, 0 = Free)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={500}
                            value={specFee}
                            onChange={(e) => setSpecFee(Number(e.target.value))}
                            className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Wait Time
                          </label>
                          <input
                            type="text"
                            value={specWaitTime}
                            onChange={(e) => setSpecWaitTime(e.target.value)}
                            className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Languages (comma)
                          </label>
                          <input
                            type="text"
                            value={specLanguages}
                            onChange={(e) => setSpecLanguages(e.target.value)}
                            className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700">
                            Specialties (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={specSpecialties}
                            onChange={(e) => setSpecSpecialties(e.target.value)}
                            className="mt-1 h-9 w-full rounded-lg border border-slate-300 px-3 text-xs"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex h-9 cursor-pointer items-center gap-2 text-xs text-slate-700">
                            <input
                              type="checkbox"
                              checked={specCouplesMediation}
                              onChange={(e) => setSpecCouplesMediation(e.target.checked)}
                              className="rounded border-slate-300 text-[#064E3B]"
                            />
                            <span>Supports non-coercive couples mediation</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">
                          Bio / Practice Summary
                        </label>
                        <textarea
                          rows={2}
                          value={specBio}
                          onChange={(e) => setSpecBio(e.target.value)}
                          placeholder="Brief biography and areas of guidance..."
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSpecialistForm(false);
                            setEditingSpecId(null);
                          }}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-[#064E3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                        >
                          {editingSpecId ? 'Save Profile Changes' : 'Add to Directory'}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Practitioner</th>
                          <th className="px-4 py-3 font-semibold">Discipline</th>
                          <th className="px-4 py-3 font-semibold">Experience &amp; Fee</th>
                          <th className="px-4 py-3 font-semibold">Status</th>
                          <th className="px-4 py-3 text-right font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {store.specialists.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-900">{s.name}</td>
                            <td className="px-4 py-3 text-slate-600">{s.discipline}</td>
                            <td className="px-4 py-3 font-mono tabular-nums">
                              {s.experienceYears} yrs ·{' '}
                              {s.feeAmount === 0 ? 'Free' : `PKR ${s.feeAmount}`}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 font-semibold ${
                                  s.isVerified ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {s.isVerified ? 'Verified' : 'Pending Review'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingSpecId(s.id);
                                    setSpecName(s.name);
                                    setSpecDiscipline(s.discipline);
                                    setSpecTitle(s.title);
                                    setSpecCredentials(s.credentials);
                                    setSpecExperience(s.experienceYears);
                                    setSpecFee(s.feeAmount);
                                    setSpecWaitTime(s.waitTime);
                                    setSpecLanguages(s.languages.join(', '));
                                    setSpecSpecialties(s.specialties.join(', '));
                                    setSpecBio(s.bio);
                                    setSpecImageKey(s.imageKey);
                                    setSpecCouplesMediation(s.supportsCouplesMediation);
                                    setShowSpecialistForm(true);
                                  }}
                                  className="font-semibold text-slate-700 hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleSpecialistVerification(s.id)}
                                  className="font-semibold text-[#064E3B] hover:underline"
                                >
                                  {s.isVerified ? 'Revoke Verification' : 'Approve Credentials'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {adminTab === 'appointments' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Appointment ID</th>
                        <th className="px-4 py-3 font-semibold">Client</th>
                        <th className="px-4 py-3 font-semibold">Specialist</th>
                        <th className="px-4 py-3 font-semibold">Schedule</th>
                        <th className="px-4 py-3 font-semibold">Mode &amp; Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {store.appointments.map((apt) => (
                        <tr key={apt.id}>
                          <td className="px-4 py-3 font-mono text-slate-500">{apt.id}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {apt.userDisplayName}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {apt.specialistName} · {apt.specialistDiscipline}
                          </td>
                          <td className="px-4 py-3 font-mono tabular-nums text-slate-600">
                            {apt.slotDate} · {apt.slotTime}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#064E3B]">
                            {apt.mode.toUpperCase()} · {apt.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {adminTab === 'audit' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Operational Portal Audit Logs
                    </h3>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                        <th className="px-4 py-2.5 font-semibold">Actor</th>
                        <th className="px-4 py-2.5 font-semibold">Action</th>
                        <th className="px-4 py-2.5 font-semibold">Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {store.auditLogs.slice(0, 16).map((log) => (
                        <tr key={log.id}>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 tabular-nums">
                            {log.timestamp}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-slate-800">
                            {log.actorName}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">{log.action}</td>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">
                            {log.targetType} · {log.targetId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {adminTab === 'settings' && (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                    <Settings className="h-4 w-4 text-[#064E3B]" />
                    <span>Notification Templates, Fee Discounts &amp; Staffing Hours</span>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Community Discount Code
                      </label>
                      <input
                        type="text"
                        value={discountCodeDraft}
                        onChange={(e) => setDiscountCodeDraft(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 font-mono text-sm uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Discount Percentage (%)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={discountPctDraft}
                        onChange={(e) => setDiscountPctDraft(Number(e.target.value))}
                        className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Discreet Notification Subject Line
                      </label>
                      <input
                        type="text"
                        value={discreetSubjectDraft}
                        onChange={(e) => setDiscreetSubjectDraft(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">
                        Staffing Hours &amp; Triage Coverage
                      </label>
                      <input
                        type="text"
                        value={staffingDraft}
                        onChange={(e) => setStaffingDraft(e.target.value)}
                        className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updatePortalSettings({
                        discountCode: discountCodeDraft.toUpperCase(),
                        communityDiscountPercent: discountPctDraft,
                        discreetEmailSubject: discreetSubjectDraft,
                        staffingHoursNote: staffingDraft,
                      })
                    }
                    className="mt-4 rounded-lg bg-[#064E3B] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#053B2D]"
                  >
                    Save Operational Settings
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 9. SUPER ADMINISTRATOR GOVERNANCE WORKSPACE */}
      {activeRole === 'super_admin' && (
        <div className="mt-6 space-y-6">
          {!activeRolePermissions.governRolesAndPolicies ? (
            <PermissionRestrictedNotice
              permissionLabel="Govern RBAC & Security Policies"
              roleLabel="Super Administrator"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Protected Portal Roles</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-[#064E3B] tabular-nums">
                    {ROLES.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Staff 2FA Compliance</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-emerald-700 tabular-nums">
                    {staffUsers.filter((u) => u.twoFactorEnabled).length}/{staffUsers.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Mandatory Staff 2FA</p>
                  <p
                    className={`mt-1 text-sm font-bold ${
                      store.settings.mandatoryStaff2FA ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {store.settings.mandatoryStaff2FA ? 'Enforced' : 'Optional'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Safeguarding SLA Limit</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-rose-700 tabular-nums">
                    {store.settings.responseLimitHours} hrs
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
                  {(
                    [
                      ['rbac', 'RBAC Permission Matrix'],
                      ['security', '2FA & Safeguarding Governance'],
                      ['audit', 'Security & Governance Audit Trail'],
                    ] as const
                  ).map(([tab, lbl]) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSuperTab(tab)}
                      className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold ${
                        superTab === tab
                          ? 'bg-[#064E3B] text-white'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                  <Lock className="h-3.5 w-3.5 text-emerald-700" />
                  <span>
                    Privacy Separation: Clinical notes remain inaccessible even to Super Admin.
                  </span>
                </div>
              </div>

              {superTab === 'rbac' && (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="font-display text-base font-bold text-slate-900">
                      Live Role-Based Access Control (RBAC) Permission Matrix
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Changes take effect immediately across every role dashboard and are recorded
                      in the Governance Audit Trail.
                    </p>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        {PERMISSION_COLUMNS.map((col) => (
                          <th key={col.key} className="px-3 py-3 text-center font-semibold">
                            {col.shortLabel}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ROLES.map((r) => {
                        const perms = store.rolePermissions[r.id];
                        return (
                          <tr key={r.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                              {r.label}
                            </td>
                            {PERMISSION_COLUMNS.map((col) => {
                              const lockedSelfGovernance =
                                r.id === 'super_admin' && col.key === 'governRolesAndPolicies';
                              return (
                                <td key={col.key} className="px-3 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    aria-label={`${r.label} ${col.label}`}
                                    disabled={lockedSelfGovernance}
                                    checked={Boolean(perms?.[col.key])}
                                    onChange={(e) =>
                                      updateRolePermission(r.id, col.key, e.target.checked)
                                    }
                                    className="h-4 w-4 rounded border-slate-300 text-[#064E3B] disabled:opacity-50"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {superTab === 'security' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="rounded-xl border border-slate-200 bg-white p-6 lg:col-span-7">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="font-display text-base font-bold text-slate-900">
                          Privileged Staff Two-Factor Authentication (2FA)
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                          PDF §7 mandates 2FA for scholars, counsellors, case managers, moderators,
                          and administrators.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                        <input
                          type="checkbox"
                          checked={store.settings.mandatoryStaff2FA}
                          onChange={(e) => setMandatoryStaff2FA(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-[#064E3B]"
                        />
                        Enforce Mandatory Staff 2FA
                      </label>
                    </div>

                    <div className="mt-4 divide-y divide-slate-100">
                      {staffUsers.map((staff) => (
                        <div
                          key={staff.id}
                          className="flex items-center justify-between py-2.5 text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{staff.name}</p>
                            <p className="text-slate-500">
                              {ROLES.find((r) => r.id === staff.role)?.label} · {staff.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-semibold ${
                                staff.twoFactorEnabled ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {staff.twoFactorEnabled ? '2FA Active' : '2FA Missing'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                toggleUserTwoFactor(staff.id, !staff.twoFactorEnabled)
                              }
                              className="rounded border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              {staff.twoFactorEnabled ? 'Disable' : 'Enforce 2FA'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-fit rounded-xl border border-slate-200 bg-white p-6 lg:col-span-5">
                    <h2 className="font-display text-base font-bold text-slate-900">
                      Safeguarding Escalation &amp; SLA Governance
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Designate the accountable safeguarding escalation lead and maximum SLA response
                      window.
                    </p>
                    <div className="mt-4 space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700">
                          Escalation Owner
                        </label>
                        <input
                          type="text"
                          value={escalationOwnerDraft}
                          onChange={(e) => setEscalationOwnerDraft(e.target.value)}
                          className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700">
                          Urgent Safeguarding SLA Limit (Hours)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={48}
                          value={responseLimitDraft}
                          onChange={(e) => setResponseLimitDraft(Number(e.target.value))}
                          className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 font-mono text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updatePortalSettings({
                            escalationOwner: escalationOwnerDraft,
                            responseLimitHours: responseLimitDraft,
                          })
                        }
                        className="w-full rounded-lg bg-[#064E3B] py-2.5 text-xs font-semibold text-white hover:bg-[#053B2D]"
                      >
                        Save Safeguarding Governance Policy
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {superTab === 'audit' && (
                <div className="space-y-4">
                  <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:w-fit">
                    {(
                      [
                        ['all', `All Events (${store.auditLogs.length})`],
                        ['governance', 'Governance & Security'],
                        ['safeguarding', 'Safeguarding Escalations'],
                      ] as const
                    ).map(([k, lbl]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setAuditFilter(k)}
                        className={`rounded-lg px-3.5 py-2 text-xs font-semibold ${
                          auditFilter === k
                            ? 'bg-[#064E3B] text-white'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                          <th className="px-4 py-2.5 font-semibold">Actor &amp; Role</th>
                          <th className="px-4 py-2.5 font-semibold">Action</th>
                          <th className="px-4 py-2.5 font-semibold">Target</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredGovernanceLogs.slice(0, 24).map((log) => (
                          <tr key={log.id}>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 tabular-nums">
                              {log.timestamp}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-slate-800">
                              {log.actorName}{' '}
                              <span className="font-mono text-[11px] text-slate-500">
                                ({log.actorRole})
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-600">{log.action}</td>
                            <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500">
                              {log.targetType} · {log.targetId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
