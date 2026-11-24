import { SEED_STORE } from '@/lib/seed-data';
import type {
  Appointment,
  AttachmentMeta,
  BookmarkCollection,
  CaseReferral,
  CaseStatus,
  CaseTimelineEvent,
  ConsultationMessage,
  ConsultationMode,
  CounsellingCase,
  FatwaItem,
  FatwaStatus,
  KnowledgeArticle,
  PortalRole,
  PortalSettings,
  PrivateClinicalNote,
  RahnumaStore,
  RecentActivityItem,
  RolePermissionSet,
  SchoolOfThought,
  SpecialistDiscipline,
  SpecialistProfile,
  SpecialistReview,
  UserAccount,
} from '@/types/rahnuma';

const STORAGE_KEY = 'rahnuma_portal_store_v1';
const SESSION_KEY = 'rahnuma_auth_session_v1';
const BOOKMARKS_KEY = 'rahnuma_bookmarks_v1';
const ACTIVITY_KEY = 'rahnuma_recent_activity_v1';

const SAFEGUARDING_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  {
    pattern: /\b(suicide|suicidal|kill myself|end my life|self[- ]harm|cutting)\b/i,
    label: 'Self-harm or suicide indicator',
  },
  {
    pattern: /\b(domestic violence|physical abuse|beat|beating|hit me|choke|assault)\b/i,
    label: 'Domestic violence or physical harm',
  },
  {
    pattern: /\b(child abuse|minor abuse|sexual violence|molest|rape)\b/i,
    label: 'Child or sexual safety concern',
  },
  {
    pattern: /\b(threat|threatened|weapon|unsafe|confiscated my phone|trapped|coercive)\b/i,
    label: 'Coercive control or active threat',
  },
];

export function evaluateSafeguardingSignals(
  text: string,
  category: string
): {
  isFlagged: boolean;
  signals: string[];
} {
  const signals: string[] = [];
  for (const item of SAFEGUARDING_PATTERNS) {
    if (item.pattern.test(text)) {
      signals.push(item.label);
    }
  }
  if (category === 'Domestic Safety Support' || category === 'Crisis & Safeguarding') {
    if (!signals.includes('High-risk safety category selected')) {
      signals.push('High-risk safety category selected');
    }
  }
  return {
    isFlagged: signals.length > 0,
    signals,
  };
}

function nowFormatted(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function timeStampFormatted(): string {
  const d = new Date();
  const datePart = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
}

function cloneSeed(): RahnumaStore {
  return JSON.parse(JSON.stringify(SEED_STORE)) as RahnumaStore;
}

function migrateScholarName(value: string): string {
  return value
    .replace(/Mufti Tariq Mahmood/g, 'Mufti Muhammad Qasim Attari')
    .replace(/Mufti Bilal Ashraf/g, 'Mufti Muhammad Shafiq Attari');
}

function migrateLegacyRole(role: string): PortalRole {
  if (role === 'counsellor') return 'family_counsellor';
  return role as PortalRole;
}

function mergeWithSeedDefaults(parsed: Partial<RahnumaStore>): RahnumaStore {
  const base = cloneSeed();
  const isUpgradingFrom5Role = !parsed.rolePermissions;

  const existingUsers = (parsed.users ?? base.users).map((u) => {
    const normalizedRole = migrateLegacyRole(u.role as string);
    const seedUser = base.users.find((su) => su.id === u.id);
    return {
      ...u,
      role: normalizedRole,
      password: u.password ?? seedUser?.password ?? 'Member@123',
      emailVerified: u.emailVerified ?? true,
      twoFactorEnabled: u.twoFactorEnabled ?? seedUser?.twoFactorEnabled ?? false,
      savedArticleIds: u.savedArticleIds ?? seedUser?.savedArticleIds ?? [],
      savedFatwaIds: u.savedFatwaIds ?? seedUser?.savedFatwaIds ?? [],
      savedSpecialistIds: u.savedSpecialistIds ?? seedUser?.savedSpecialistIds ?? [],
      sessions: u.sessions ?? seedUser?.sessions ?? [],
    };
  });

  // Ensure all 9 role default users exist when upgrading an older localStorage store
  const existingUserIds = new Set(existingUsers.map((u) => u.id));
  const mergedUsers = [
    ...existingUsers,
    ...base.users.filter((su) => !existingUserIds.has(su.id)),
  ];

  const mergedRolePermissions: RahnumaStore['rolePermissions'] = { ...base.rolePermissions };
  if (parsed.rolePermissions) {
    (Object.keys(base.rolePermissions) as PortalRole[]).forEach((roleKey) => {
      if (parsed.rolePermissions?.[roleKey]) {
        mergedRolePermissions[roleKey] = {
          ...base.rolePermissions[roleKey],
          ...parsed.rolePermissions[roleKey],
        };
      }
    });
  }

  const parsedCases = (parsed.cases ?? base.cases).map((c) => ({
    ...c,
    preferredLanguage: c.preferredLanguage ?? 'English',
  }));
  const mergedCases = isUpgradingFrom5Role
    ? [
        ...parsedCases,
        ...base.cases.filter((bc) => !parsedCases.some((pc) => pc.id === bc.id)),
      ]
    : parsedCases;

  const parsedAppointments = (parsed.appointments ?? base.appointments).map((apt) => ({
    ...apt,
    attendanceStatus: apt.attendanceStatus ?? 'Scheduled',
    discountApplied: apt.discountApplied ?? 0,
  }));
  const mergedAppointments = isUpgradingFrom5Role
    ? [
        ...parsedAppointments,
        ...base.appointments.filter((ba) => !parsedAppointments.some((pa) => pa.id === ba.id)),
      ]
    : parsedAppointments;

  const parsedNotes = parsed.clinicalNotes ?? base.clinicalNotes;
  const mergedNotes = isUpgradingFrom5Role
    ? [
        ...parsedNotes,
        ...base.clinicalNotes.filter((bn) => !parsedNotes.some((pn) => pn.id === bn.id)),
      ]
    : parsedNotes;

  const parsedMessages = (parsed.messages ?? base.messages).map((m) => ({
    ...m,
    senderRole: migrateLegacyRole(m.senderRole as string),
  }));
  const mergedMessages = isUpgradingFrom5Role
    ? [
        ...parsedMessages,
        ...base.messages.filter((bm) => !parsedMessages.some((pm) => pm.id === bm.id)),
      ]
    : parsedMessages;

  const mergedAuditLogs = (parsed.auditLogs ?? base.auditLogs).map((log) => ({
    ...log,
    actorRole: migrateLegacyRole(log.actorRole as string),
  }));

  const mergedSpecialists = (parsed.specialists ?? base.specialists).map((s) => ({
    ...s,
    name: migrateScholarName(s.name),
    bio: migrateScholarName(s.bio),
    imageKey:
      s.id === 'spec_bilal' && s.imageKey === 'hero' ? ('mufti_bilal' as const) : s.imageKey,
  }));

  const normalizedUsers = mergedUsers.map((u) => ({
    ...u,
    name: migrateScholarName(u.name),
    pseudonym: migrateScholarName(u.pseudonym),
    email: u.email === 'mufti.tariq@rahnuma.org' ? 'mufti.qasim@rahnuma.org' : u.email,
  }));

  const normalizedFatwas = (parsed.fatwas ?? base.fatwas).map((f) => ({
    ...f,
    scholarName: migrateScholarName(f.scholarName),
  }));

  const normalizedCases = mergedCases.map((c) => ({
    ...c,
    assignedSpecialistName: c.assignedSpecialistName
      ? migrateScholarName(c.assignedSpecialistName)
      : undefined,
  }));

  const normalizedAppointments = mergedAppointments.map((a) => ({
    ...a,
    specialistName: migrateScholarName(a.specialistName),
  }));

  const normalizedMessages = mergedMessages.map((m) => ({
    ...m,
    senderName: migrateScholarName(m.senderName),
  }));

  const normalizedAuditLogs = mergedAuditLogs.map((log) => ({
    ...log,
    actorName: migrateScholarName(log.actorName),
  }));

  return {
    ...base,
    ...parsed,
    users: normalizedUsers,
    specialists: mergedSpecialists,
    reviews: parsed.reviews ?? base.reviews,
    fatwas: normalizedFatwas,
    cases: normalizedCases,
    appointments: normalizedAppointments,
    clinicalNotes: mergedNotes.map((n) => ({
      ...n,
      authorName: migrateScholarName(n.authorName),
    })),
    messages: normalizedMessages,
    auditLogs: normalizedAuditLogs,
    caseTimeline: parsed.caseTimeline ?? base.caseTimeline,
    settings: { ...base.settings, ...(parsed.settings || {}) },
    rolePermissions: mergedRolePermissions,
    articles: (parsed.articles ?? base.articles).map((a) => ({
      ...a,
      approvedBy: migrateScholarName(a.approvedBy),
      revisionNumber: a.revisionNumber ?? 'rev 1.0',
    })),
  };
}

export const rahnumaRepo = {
  loadStore(): RahnumaStore {
    if (typeof window === 'undefined') return cloneSeed();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = cloneSeed();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
      }
      const parsed = JSON.parse(raw) as Partial<RahnumaStore>;
      return mergeWithSeedDefaults(parsed);
    } catch {
      return cloneSeed();
    }
  },

  saveStore(store: RahnumaStore): RahnumaStore {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    }
    return store;
  },

  resetDemoStore(): RahnumaStore {
    const seeded = cloneSeed();
    return this.saveStore(seeded);
  },

  getAuthSessionUserId(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(SESSION_KEY) || null;
    } catch {
      return null;
    }
  },

  setAuthSessionUserId(userId: string | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (userId) {
        window.localStorage.setItem(SESSION_KEY, userId);
      } else {
        window.localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // Ignore storage access restrictions
    }
  },

  getGuestBookmarks(): BookmarkCollection {
    const empty: BookmarkCollection = { fatwas: [], specialists: [], articles: [] };
    if (typeof window === 'undefined') return empty;
    try {
      const raw = window.localStorage.getItem(BOOKMARKS_KEY);
      if (!raw) return empty;
      const parsed = JSON.parse(raw) as Partial<BookmarkCollection>;
      return {
        fatwas: Array.isArray(parsed.fatwas) ? parsed.fatwas : [],
        specialists: Array.isArray(parsed.specialists) ? parsed.specialists : [],
        articles: Array.isArray(parsed.articles) ? parsed.articles : [],
      };
    } catch {
      return empty;
    }
  },

  saveGuestBookmarks(bookmarks: BookmarkCollection): BookmarkCollection {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      } catch {
        // Ignore storage access restrictions
      }
    }
    return bookmarks;
  },

  getRecentActivity(): RecentActivityItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(ACTIVITY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as RecentActivityItem[]) : [];
    } catch {
      return [];
    }
  },

  saveRecentActivity(items: RecentActivityItem[]): RecentActivityItem[] {
    const trimmed = items.slice(0, 8);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(trimmed));
      } catch {
        // Ignore storage access restrictions
      }
    }
    return trimmed;
  },

  authenticateUser(store: RahnumaStore, email: string, password: string): UserAccount | null {
    const normalizedEmail = email.trim().toLowerCase();
    const match = store.users.find(
      (u) =>
        u.email.trim().toLowerCase() === normalizedEmail &&
        (u.password || 'Member@123') === password
    );
    return match || null;
  },

  registerMember(
    store: RahnumaStore,
    payload: {
      name: string;
      email: string;
      phone: string;
      password?: string;
      pseudonym: string;
      usePseudonym: boolean;
    }
  ): { store: RahnumaStore; user: UserAccount } {
    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      name: payload.name.trim(),
      pseudonym: payload.pseudonym.trim() || `Member ${payload.name.slice(0, 2).toUpperCase()}`,
      usePseudonym: payload.usePseudonym,
      email: payload.email.trim(),
      password: payload.password?.trim() || 'Member@123',
      phone: payload.phone.trim() || '+92 300 0000000',
      role: 'user',
      emailVerified: true,
      twoFactorEnabled: false,
      discreetNotifications: true,
      preferredMode: 'text',
      savedArticleIds: [],
      savedFatwaIds: [],
      savedSpecialistIds: [],
      sessions: [
        {
          id: `sess_${Date.now()}`,
          deviceName: 'Current Browser Session',
          location: 'Verified Web Session',
          lastActive: 'Active now',
          isCurrent: true,
        },
      ],
    };

    const nextStore: RahnumaStore = {
      ...store,
      users: [newUser, ...store.users],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'user',
          actorName: newUser.usePseudonym ? newUser.pseudonym : newUser.name,
          action: 'Registered & verified new member account',
          targetType: 'Account',
          targetId: newUser.id,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    };
    return { store: this.saveStore(nextStore), user: newUser };
  },

  revokeUserSession(store: RahnumaStore, userId: string, sessionId: string): RahnumaStore {
    const nextStore: RahnumaStore = {
      ...store,
      users: store.users.map((u) =>
        u.id === userId
          ? { ...u, sessions: u.sessions.filter((s) => s.id !== sessionId) }
          : u
      ),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'user',
          actorName: 'Account Holder',
          action: `Revoked active device session (${sessionId})`,
          targetType: 'Account',
          targetId: userId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    };
    return this.saveStore(nextStore);
  },

  submitCase(
    store: RahnumaStore,
    payload: {
      userId: string;
      displayName: string;
      title: string;
      category: string;
      narrative: string;
      preferredLanguage: 'English' | 'Urdu';
      requestedHelpType: ConsultationMode;
      discreetMode: boolean;
      attachments?: AttachmentMeta[];
    }
  ): { store: RahnumaStore; createdCase: CounsellingCase } {
    const evalResult = evaluateSafeguardingSignals(
      `${payload.title} ${payload.narrative}`,
      payload.category
    );
    const nextNum = 1046 + store.cases.length;
    const newCase: CounsellingCase = {
      id: `RHN-${nextNum}`,
      userId: payload.userId,
      displayName: payload.displayName,
      title: payload.title.trim(),
      category: payload.category,
      narrative: payload.narrative.trim(),
      preferredLanguage: payload.preferredLanguage,
      requestedHelpType: payload.requestedHelpType,
      attachments: payload.attachments ?? [],
      status: evalResult.isFlagged ? 'Urgent Review' : 'Pending Triage',
      isSafeguardingFlagged: evalResult.isFlagged,
      riskSignals: evalResult.signals,
      couplesMediationBlocked: evalResult.isFlagged,
      discreetMode: payload.discreetMode || evalResult.isFlagged,
      createdAt: nowFormatted(),
      updatedAt: nowFormatted(),
      nominatedForEducation: false,
    };

    const timelineEntry: CaseTimelineEvent = {
      id: `tl_${Date.now()}`,
      caseId: newCase.id,
      label: evalResult.isFlagged
        ? 'Safeguarding indicators detected — escalated to Urgent Review; mediation blocked'
        : 'Case submitted confidentially and queued for Case Manager triage',
      actor: payload.displayName,
      timestamp: timeStampFormatted(),
    };

    const nextStore: RahnumaStore = {
      ...store,
      cases: [newCase, ...store.cases],
      caseTimeline: [timelineEntry, ...store.caseTimeline],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'user',
          actorName: payload.displayName,
          action: evalResult.isFlagged
            ? 'Submitted case with safeguarding alert; auto-routed to Urgent Review'
            : 'Submitted confidential counselling case',
          targetType: evalResult.isFlagged ? 'Safeguarding' : 'Case',
          targetId: newCase.id,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    };
    return { store: this.saveStore(nextStore), createdCase: newCase };
  },

  updateCaseStatus(
    store: RahnumaStore,
    payload: {
      caseId: string;
      status: CaseStatus;
      actorRole: PortalRole;
      actorName: string;
    }
  ): RahnumaStore {
    const timelineEntry: CaseTimelineEvent = {
      id: `tl_${Date.now()}`,
      caseId: payload.caseId,
      label: `Status transitioned to ${payload.status}`,
      actor: payload.actorName,
      timestamp: timeStampFormatted(),
    };
    const nextStore: RahnumaStore = {
      ...store,
      cases: store.cases.map((c) =>
        c.id === payload.caseId
          ? { ...c, status: payload.status, updatedAt: nowFormatted() }
          : c
      ),
      caseTimeline: [timelineEntry, ...store.caseTimeline],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: payload.actorRole,
          actorName: payload.actorName,
          action: `Updated case status to ${payload.status}`,
          targetType: 'Case',
          targetId: payload.caseId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    };
    return this.saveStore(nextStore);
  },

  assignCaseToSpecialist(
    store: RahnumaStore,
    payload: {
      caseId: string;
      specialistId: string;
      actorName: string;
    }
  ): RahnumaStore {
    const specialist = store.specialists.find((s) => s.id === payload.specialistId);
    if (!specialist) return store;

    const timelineEntry: CaseTimelineEvent = {
      id: `tl_${Date.now()}`,
      caseId: payload.caseId,
      label: `Assigned to ${specialist.name} (${specialist.discipline})`,
      actor: payload.actorName,
      timestamp: timeStampFormatted(),
    };

    const nextStore: RahnumaStore = {
      ...store,
      cases: store.cases.map((c) =>
        c.id === payload.caseId
          ? {
              ...c,
              assignedSpecialistId: specialist.id,
              assignedSpecialistName: specialist.name,
              status:
                c.status === 'Pending Triage' || c.status === 'Urgent Review'
                  ? 'Assigned'
                  : c.status,
              updatedAt: nowFormatted(),
            }
          : c
      ),
      caseTimeline: [timelineEntry, ...store.caseTimeline],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'case_manager',
          actorName: payload.actorName,
          action: `Assigned case to ${specialist.name}`,
          targetType: 'Case',
          targetId: payload.caseId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    };
    return this.saveStore(nextStore);
  },

  nominateCaseForEducation(
    store: RahnumaStore,
    caseId: string,
    actorName: string,
    actorRole: PortalRole = 'family_counsellor'
  ): RahnumaStore {
    const target = store.cases.find((c) => c.id === caseId);
    if (!target || target.nominatedForEducation) return store;

    const draftArticle: KnowledgeArticle = {
      id: `art_nom_${Date.now()}`,
      slug: `case-guide-${caseId.toLowerCase()}`,
      title: `Educational Case Guide: ${target.category} Considerations`,
      category: target.category,
      type: 'Anonymized Case Guide',
      summary: `Generalized summary nominated from resolved case ${caseId}. Moderator must remove all direct and indirect identifiers prior to publication.`,
      islamicGuidance:
        'Pending Mufti / Scholar validation of Quranic and Prophetic family guidance applicable to this scenario.',
      civilConsiderations:
        'Pending verification of civil documentation and statutory protection principles.',
      counsellingOptions:
        'Consult an authorized Rahnuma specialist for personalized, confidential assessment.',
      sourceCaseId: caseId,
      consentVerified: false,
      piiStripped: false,
      safeguardingReviewed: false,
      scholarApproved: false,
      approvedBy: 'Pending Moderator & Scholar Review',
      publishedAt: 'Pending',
      nextReviewDate: 'Pending',
      readMinutes: 5,
      helpfulCount: 0,
      revisionNumber: 'rev 0.1',
      status: 'Pending Review',
    };

    const nextStore: RahnumaStore = {
      ...store,
      cases: store.cases.map((c) =>
        c.id === caseId ? { ...c, nominatedForEducation: true } : c
      ),
      articles: [draftArticle, ...store.articles],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole,
          actorName,
          action: `Nominated resolved case ${caseId} for anonymized educational review`,
          targetType: 'Article',
          targetId: draftArticle.id,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    };
    return this.saveStore(nextStore);
  },

  addClinicalNote(
    store: RahnumaStore,
    payload: {
      caseId: string;
      authorId: string;
      authorName: string;
      content: string;
    }
  ): RahnumaStore {
    const newNote: PrivateClinicalNote = {
      id: `note_${Date.now()}`,
      caseId: payload.caseId,
      authorId: payload.authorId,
      authorName: payload.authorName,
      content: payload.content.trim(),
      createdAt: timeStampFormatted(),
    };
    return this.saveStore({
      ...store,
      clinicalNotes: [newNote, ...store.clinicalNotes],
    });
  },

  addReferral(
    store: RahnumaStore,
    payload: {
      caseId: string;
      fromSpecialistName: string;
      actorRole?: PortalRole;
      toDiscipline: SpecialistDiscipline;
      reason: string;
    }
  ): RahnumaStore {
    const newReferral: CaseReferral = {
      id: `ref_${Date.now()}`,
      caseId: payload.caseId,
      fromSpecialistName: payload.fromSpecialistName,
      toDiscipline: payload.toDiscipline,
      reason: payload.reason.trim(),
      createdAt: nowFormatted(),
    };
    const timelineEntry: CaseTimelineEvent = {
      id: `tl_${Date.now()}`,
      caseId: payload.caseId,
      label: `Cross-discipline referral issued to ${payload.toDiscipline}`,
      actor: payload.fromSpecialistName,
      timestamp: timeStampFormatted(),
    };
    return this.saveStore({
      ...store,
      referrals: [newReferral, ...store.referrals],
      caseTimeline: [timelineEntry, ...store.caseTimeline],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: payload.actorRole ?? 'family_counsellor',
          actorName: payload.fromSpecialistName,
          action: `Issued referral to ${payload.toDiscipline}`,
          targetType: 'Case',
          targetId: payload.caseId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  submitFatwaQuestion(
    store: RahnumaStore,
    payload: {
      userId: string;
      submittedByDisplay: string;
      questionTitle: string;
      questionBody: string;
      category: string;
      schoolOfThought: SchoolOfThought;
      attachments?: AttachmentMeta[];
    }
  ): { store: RahnumaStore; fatwa: FatwaItem } {
    const refNum = 150 + store.fatwas.length;
    const fatwa: FatwaItem = {
      id: `fatwa_${Date.now()}`,
      referenceCode: `FTW-2026-0${refNum}`,
      questionTitle: payload.questionTitle.trim(),
      questionBody: payload.questionBody.trim(),
      submittedByUserId: payload.userId,
      submittedByDisplay: payload.submittedByDisplay,
      assignedScholarId: 'spec_mufti_tariq',
      scholarName: 'Mufti Muhammad Qasim Attari',
      schoolOfThought: payload.schoolOfThought,
      rulingAnswer: '',
      references: [],
      attachments: payload.attachments ?? [],
      category: payload.category,
      status: 'Submitted',
      issuedAt: 'Pending',
      reviewedAt: 'Pending',
      version: 'v0.1',
      helpfulCount: 0,
    };

    const nextStore: RahnumaStore = {
      ...store,
      fatwas: [fatwa, ...store.fatwas],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'user',
          actorName: payload.submittedByDisplay,
          action: `Submitted private religious question (${fatwa.referenceCode})`,
          targetType: 'Fatwa',
          targetId: fatwa.id,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    };
    return { store: this.saveStore(nextStore), fatwa };
  },

  routeFatwaToScholar(
    store: RahnumaStore,
    fatwaId: string,
    scholarId: string,
    actorName: string
  ): RahnumaStore {
    const scholar = store.specialists.find((s) => s.id === scholarId);
    if (!scholar) return store;
    return this.saveStore({
      ...store,
      fatwas: store.fatwas.map((f) =>
        f.id === fatwaId
          ? { ...f, assignedScholarId: scholar.id, scholarName: scholar.name }
          : f
      ),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'case_manager',
          actorName,
          action: `Routed religious query ${fatwaId} to ${scholar.name}`,
          targetType: 'Fatwa',
          targetId: fatwaId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  updateFatwaReview(
    store: RahnumaStore,
    payload: {
      fatwaId: string;
      rulingAnswer: string;
      references: string[];
      schoolOfThought: SchoolOfThought;
      status: FatwaStatus;
      scholarName: string;
      revisionNote?: string;
    }
  ): RahnumaStore {
    const isPublishing = payload.status === 'Published';
    return this.saveStore({
      ...store,
      fatwas: store.fatwas.map((f) =>
        f.id === payload.fatwaId
          ? {
              ...f,
              rulingAnswer: payload.rulingAnswer,
              references: payload.references,
              schoolOfThought: payload.schoolOfThought,
              status: payload.status,
              scholarName: payload.scholarName,
              revisionNote: payload.revisionNote ?? f.revisionNote,
              issuedAt: isPublishing ? nowFormatted() : f.issuedAt,
              reviewedAt: nowFormatted(),
              version: isPublishing
                ? f.version === 'v1.0'
                  ? 'v1.1'
                  : 'v1.0'
                : f.version,
            }
          : f
      ),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'mufti',
          actorName: payload.scholarName,
          action: `Updated fatwa status to ${payload.status}`,
          targetType: 'Fatwa',
          targetId: payload.fatwaId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  bookAppointment(
    store: RahnumaStore,
    payload: {
      userId: string;
      userDisplayName: string;
      specialistId: string;
      slotId: string;
      mode: ConsultationMode;
      discreetReminder: boolean;
      discountCode?: string;
      initialNote?: string;
    }
  ): { store: RahnumaStore; appointment?: Appointment } {
    const specialist = store.specialists.find((s) => s.id === payload.specialistId);
    const slot = specialist?.slots.find((sl) => sl.id === payload.slotId);
    if (!specialist || !slot || slot.isBooked) return { store };

    const codeValid =
      payload.discountCode &&
      payload.discountCode.trim().toUpperCase() === store.settings.discountCode.toUpperCase();
    const discountAmt =
      codeValid && specialist.feeAmount > 0
        ? Math.round((specialist.feeAmount * store.settings.communityDiscountPercent) / 100)
        : 0;
    const finalFee = Math.max(0, specialist.feeAmount - discountAmt);

    const appointment: Appointment = {
      id: `apt_${Date.now()}`,
      userId: payload.userId,
      userDisplayName: payload.userDisplayName,
      specialistId: specialist.id,
      specialistName: specialist.name,
      specialistDiscipline: specialist.discipline,
      mode: payload.mode,
      slotId: slot.id,
      slotDate: slot.date,
      slotTime: slot.time,
      status: 'Confirmed',
      attendanceStatus: 'Scheduled',
      fee: finalFee,
      discountApplied: discountAmt,
      discreetReminder: payload.discreetReminder,
      recordingEnabled: false,
      createdAt: nowFormatted(),
    };

    const initialMessages: ConsultationMessage[] = payload.initialNote?.trim()
      ? [
          {
            id: `msg_${Date.now()}`,
            threadId: appointment.id,
            senderId: payload.userId,
            senderName: payload.userDisplayName,
            senderRole: 'user',
            body: payload.initialNote.trim(),
            createdAt: timeStampFormatted(),
          },
        ]
      : [];

    const nextStore: RahnumaStore = {
      ...store,
      specialists: store.specialists.map((s) =>
        s.id === specialist.id
          ? {
              ...s,
              slots: s.slots.map((sl) =>
                sl.id === slot.id ? { ...sl, isBooked: true } : sl
              ),
            }
          : s
      ),
      appointments: [appointment, ...store.appointments],
      messages: [...initialMessages, ...store.messages],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'user',
          actorName: payload.userDisplayName,
          action: `Booked ${payload.mode} consultation with ${specialist.name} (${slot.date})`,
          targetType: 'Appointment',
          targetId: appointment.id,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    };
    return { store: this.saveStore(nextStore), appointment };
  },

  rescheduleAppointment(
    store: RahnumaStore,
    appointmentId: string,
    newSlotId: string,
    actorName: string
  ): RahnumaStore {
    const apt = store.appointments.find((a) => a.id === appointmentId);
    const spec = store.specialists.find((s) => s.id === apt?.specialistId);
    const nextSlot = spec?.slots.find((sl) => sl.id === newSlotId);
    if (!apt || !spec || !nextSlot || nextSlot.isBooked) return store;

    return this.saveStore({
      ...store,
      specialists: store.specialists.map((s) =>
        s.id === spec.id
          ? {
              ...s,
              slots: s.slots.map((sl) => {
                if (sl.id === apt.slotId) return { ...sl, isBooked: false };
                if (sl.id === nextSlot.id) return { ...sl, isBooked: true };
                return sl;
              }),
            }
          : s
      ),
      appointments: store.appointments.map((a) =>
        a.id === appointmentId
          ? {
              ...a,
              slotId: nextSlot.id,
              slotDate: nextSlot.date,
              slotTime: nextSlot.time,
              status: 'Rescheduled',
            }
          : a
      ),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'user',
          actorName,
          action: `Rescheduled appointment ${appointmentId} to ${nextSlot.date} ${nextSlot.time}`,
          targetType: 'Appointment',
          targetId: appointmentId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  deliverConsultationSummary(
    store: RahnumaStore,
    payload: {
      appointmentId: string;
      attendanceStatus: 'Scheduled' | 'Attended' | 'Missed';
      deliveredSummary: string;
      actorName: string;
      actorRole?: PortalRole;
    }
  ): RahnumaStore {
    return this.saveStore({
      ...store,
      appointments: store.appointments.map((a) =>
        a.id === payload.appointmentId
          ? {
              ...a,
              attendanceStatus: payload.attendanceStatus,
              status: payload.attendanceStatus === 'Attended' ? 'Completed' : a.status,
              deliveredSummary: payload.deliveredSummary.trim(),
            }
          : a
      ),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: payload.actorRole ?? 'family_counsellor',
          actorName: payload.actorName,
          action: `Delivered written consultation summary & updated attendance (${payload.attendanceStatus})`,
          targetType: 'Appointment',
          targetId: payload.appointmentId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  cancelAppointment(store: RahnumaStore, appointmentId: string, actorName: string): RahnumaStore {
    const target = store.appointments.find((a) => a.id === appointmentId);
    if (!target) return store;

    return this.saveStore({
      ...store,
      appointments: store.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: 'Cancelled' } : a
      ),
      specialists: store.specialists.map((s) =>
        s.id === target.specialistId
          ? {
              ...s,
              slots: s.slots.map((sl) =>
                sl.id === target.slotId ? { ...sl, isBooked: false } : sl
              ),
            }
          : s
      ),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'user',
          actorName,
          action: `Cancelled consultation appointment ${appointmentId}`,
          targetType: 'Appointment',
          targetId: appointmentId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  sendMessage(
    store: RahnumaStore,
    payload: {
      threadId: string;
      senderId: string;
      senderName: string;
      senderRole: PortalRole;
      body: string;
    }
  ): RahnumaStore {
    const msg: ConsultationMessage = {
      id: `msg_${Date.now()}`,
      threadId: payload.threadId,
      senderId: payload.senderId,
      senderName: payload.senderName,
      senderRole: payload.senderRole,
      body: payload.body.trim(),
      createdAt: timeStampFormatted(),
    };
    return this.saveStore({
      ...store,
      messages: [...store.messages, msg],
    });
  },

  toggleSpecialistSlot(
    store: RahnumaStore,
    specialistId: string,
    date: string,
    time: string
  ): RahnumaStore {
    return this.saveStore({
      ...store,
      specialists: store.specialists.map((s) =>
        s.id === specialistId
          ? {
              ...s,
              slots: [...s.slots, { id: `slot_${Date.now()}`, date, time, isBooked: false }],
            }
          : s
      ),
    });
  },

  toggleSpecialistVerification(
    store: RahnumaStore,
    specialistId: string,
    actorName: string
  ): RahnumaStore {
    return this.saveStore({
      ...store,
      specialists: store.specialists.map((s) =>
        s.id === specialistId ? { ...s, isVerified: !s.isVerified } : s
      ),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'admin',
          actorName,
          action: `Toggled verification credential for specialist ${specialistId}`,
          targetType: 'Specialist',
          targetId: specialistId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  updateArticleChecklist(
    store: RahnumaStore,
    payload: {
      articleId: string;
      consentVerified: boolean;
      piiStripped: boolean;
      safeguardingReviewed: boolean;
      scholarApproved: boolean;
      summary?: string;
      publishNow?: boolean;
      withdrawNow?: boolean;
      actorName: string;
      actorRole?: PortalRole;
    }
  ): RahnumaStore {
    const canPublish =
      payload.consentVerified &&
      payload.piiStripped &&
      payload.safeguardingReviewed &&
      payload.scholarApproved &&
      payload.publishNow;

    return this.saveStore({
      ...store,
      articles: store.articles.map((art) =>
        art.id === payload.articleId
          ? {
              ...art,
              summary: payload.summary !== undefined ? payload.summary : art.summary,
              consentVerified: payload.consentVerified,
              piiStripped: payload.piiStripped,
              safeguardingReviewed: payload.safeguardingReviewed,
              scholarApproved: payload.scholarApproved,
              status: payload.withdrawNow
                ? 'Withdrawn'
                : canPublish
                ? 'Published'
                : art.status,
              takedownRequested: payload.withdrawNow ? false : art.takedownRequested,
              publishedAt: canPublish ? nowFormatted() : art.publishedAt,
              nextReviewDate: canPublish ? 'May 23, 2027' : art.nextReviewDate,
              approvedBy: canPublish ? payload.actorName : art.approvedBy,
            }
          : art
      ),
      auditLogs:
        canPublish || payload.withdrawNow
          ? [
              {
                id: `aud_${Date.now()}`,
                actorRole: payload.actorRole ?? 'knowledge_moderator',
                actorName: payload.actorName,
                action: payload.withdrawNow
                  ? `Withdrew educational guide ${payload.articleId}`
                  : `Published anonymized educational guide ${payload.articleId} after 4-gate check`,
                targetType: 'Article',
                targetId: payload.articleId,
                timestamp: timeStampFormatted(),
              },
              ...store.auditLogs,
            ]
          : store.auditLogs,
    });
  },

  requestArticleTakedown(store: RahnumaStore, articleId: string): RahnumaStore {
    return this.saveStore({
      ...store,
      articles: store.articles.map((a) =>
        a.id === articleId ? { ...a, takedownRequested: true } : a
      ),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'user',
          actorName: 'Reader Feedback',
          action: `Submitted correction / takedown review request for article ${articleId}`,
          targetType: 'Article',
          targetId: articleId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  updatePortalSettings(
    store: RahnumaStore,
    patch: Partial<PortalSettings>,
    actorName: string,
    actorRole: PortalRole = 'admin'
  ): RahnumaStore {
    return this.saveStore({
      ...store,
      settings: { ...store.settings, ...patch },
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole,
          actorName,
          action: 'Updated portal scheduling, discount, or safeguarding policy settings',
          targetType: actorRole === 'super_admin' ? 'Governance' : 'Account',
          targetId: 'portal_settings',
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  updateRolePermission(
    store: RahnumaStore,
    targetRole: PortalRole,
    permissionKey: keyof RolePermissionSet,
    enabled: boolean,
    actorName: string
  ): RahnumaStore {
    return this.saveStore({
      ...store,
      rolePermissions: {
        ...store.rolePermissions,
        [targetRole]: {
          ...store.rolePermissions[targetRole],
          [permissionKey]: enabled,
        },
      },
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'super_admin',
          actorName,
          action: `${enabled ? 'Granted' : 'Revoked'} permission "${permissionKey}" for role ${targetRole}`,
          targetType: 'Governance',
          targetId: `${targetRole}.${permissionKey}`,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  setMandatoryStaff2FA(
    store: RahnumaStore,
    enabled: boolean,
    actorName: string
  ): RahnumaStore {
    return this.saveStore({
      ...store,
      settings: {
        ...store.settings,
        mandatoryStaff2FA: enabled,
      },
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'super_admin',
          actorName,
          action: `${enabled ? 'Enforced' : 'Relaxed'} mandatory 2FA policy for all privileged staff roles`,
          targetType: 'Governance',
          targetId: 'mandatoryStaff2FA',
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  toggleUserTwoFactor(
    store: RahnumaStore,
    userId: string,
    enabled: boolean,
    actorName: string
  ): RahnumaStore {
    return this.saveStore({
      ...store,
      users: store.users.map((u) =>
        u.id === userId ? { ...u, twoFactorEnabled: enabled } : u
      ),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'super_admin',
          actorName,
          action: `${enabled ? 'Enabled' : 'Disabled'} 2FA status for account ${userId}`,
          targetType: 'Governance',
          targetId: userId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  markHelpful(store: RahnumaStore, type: 'fatwa' | 'article', id: string): RahnumaStore {
    return this.saveStore({
      ...store,
      fatwas:
        type === 'fatwa'
          ? store.fatwas.map((f) =>
              f.id === id ? { ...f, helpfulCount: f.helpfulCount + 1 } : f
            )
          : store.fatwas,
      articles:
        type === 'article'
          ? store.articles.map((a) =>
              a.id === id ? { ...a, helpfulCount: a.helpfulCount + 1 } : a
            )
          : store.articles,
    });
  },

  logEmptySearch(store: RahnumaStore, query: string): RahnumaStore {
    const trimmed = query.trim();
    if (
      !trimmed ||
      store.emptySearches.some((e) => e.query.toLowerCase() === trimmed.toLowerCase())
    ) {
      return store;
    }
    return this.saveStore({
      ...store,
      emptySearches: [
        { id: `es_${Date.now()}`, query: trimmed, timestamp: timeStampFormatted() },
        ...store.emptySearches.slice(0, 14),
      ],
    });
  },

  resetPassword(
    store: RahnumaStore,
    email: string,
    newPassword: string
  ): { ok: boolean; store: RahnumaStore; error?: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const targetUser = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!targetUser) {
      return {
        ok: false,
        store,
        error: 'No account found with that email address.',
      };
    }
    if (newPassword.length < 6) {
      return {
        ok: false,
        store,
        error: 'New password must be at least 6 characters.',
      };
    }

    const nextStore = this.saveStore({
      ...store,
      users: store.users.map((u) =>
        u.id === targetUser.id ? { ...u, password: newPassword } : u
      ),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: targetUser.role,
          actorName: targetUser.name,
          action: 'Completed account password reset',
          targetType: 'Account',
          targetId: targetUser.id,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
    return { ok: true, store: nextStore };
  },

  addSpecialist(
    store: RahnumaStore,
    payload: {
      name: string;
      discipline: SpecialistDiscipline;
      title: string;
      credentials: string;
      languages: string[];
      specialties: string[];
      experienceYears: number;
      feeAmount: number;
      waitTime: string;
      bio: string;
      imageKey: SpecialistProfile['imageKey'];
      supportsCouplesMediation: boolean;
    },
    actorName: string
  ): { store: RahnumaStore; specialist: SpecialistProfile } {
    const id = `spec_${Date.now()}`;
    const specialist: SpecialistProfile = {
      id,
      userId: `usr_spec_${Date.now()}`,
      name: payload.name.trim(),
      discipline: payload.discipline,
      title: payload.title.trim(),
      credentials: payload.credentials.trim(),
      languages: payload.languages.length > 0 ? payload.languages : ['English', 'Urdu'],
      specialties:
        payload.specialties.length > 0 ? payload.specialties : ['Marital Conflict'],
      experienceYears: Math.max(1, payload.experienceYears),
      rating: 5.0,
      reviewCount: 0,
      satisfiedPercent: 100,
      waitTime: payload.waitTime.trim() || 'Under 24 Hrs',
      feeAmount: Math.max(0, payload.feeAmount),
      isVerified: true,
      isAvailableOnline: true,
      supportsCouplesMediation: payload.supportsCouplesMediation,
      bio: payload.bio.trim(),
      imageKey: payload.imageKey,
      slots: [
        { id: `slot_${Date.now()}_1`, date: 'Tomorrow, Nov 25', time: '11:00 AM', isBooked: false },
        { id: `slot_${Date.now()}_2`, date: 'Thu, Nov 26', time: '03:00 PM', isBooked: false },
      ],
    };

    const nextStore = this.saveStore({
      ...store,
      specialists: [specialist, ...store.specialists],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'admin',
          actorName,
          action: `Onboarded new specialist ${specialist.name} (${specialist.discipline})`,
          targetType: 'Specialist',
          targetId: specialist.id,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
    return { store: nextStore, specialist };
  },

  updateSpecialist(
    store: RahnumaStore,
    specialistId: string,
    patch: Partial<
      Pick<
        SpecialistProfile,
        | 'name'
        | 'discipline'
        | 'title'
        | 'credentials'
        | 'languages'
        | 'specialties'
        | 'experienceYears'
        | 'feeAmount'
        | 'waitTime'
        | 'bio'
        | 'imageKey'
        | 'supportsCouplesMediation'
      >
    >,
    actorName: string
  ): RahnumaStore {
    const existing = store.specialists.find((s) => s.id === specialistId);
    if (!existing) return store;
    const updatedName = patch.name?.trim() || existing.name;

    return this.saveStore({
      ...store,
      specialists: store.specialists.map((s) =>
        s.id === specialistId
          ? {
              ...s,
              ...patch,
              name: updatedName,
              title: patch.title !== undefined ? patch.title.trim() : s.title,
              credentials:
                patch.credentials !== undefined ? patch.credentials.trim() : s.credentials,
              bio: patch.bio !== undefined ? patch.bio.trim() : s.bio,
              waitTime: patch.waitTime !== undefined ? patch.waitTime.trim() : s.waitTime,
            }
          : s
      ),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'admin',
          actorName,
          action: `Updated specialist profile for ${updatedName}`,
          targetType: 'Specialist',
          targetId: specialistId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
  },

  createKnowledgeArticle(
    store: RahnumaStore,
    payload: {
      title: string;
      category: string;
      type: 'Anonymized Case Guide' | 'Educational Article';
      summary: string;
      islamicGuidance: string;
      civilConsiderations: string;
      counsellingOptions: string;
      readMinutes: number;
      approvedBy: string;
    },
    actorName: string
  ): { store: RahnumaStore; article: KnowledgeArticle } {
    const baseSlug = payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug || 'guide'}-${Date.now().toString().slice(-4)}`;
    const article: KnowledgeArticle = {
      id: `art_${Date.now()}`,
      slug,
      title: payload.title.trim(),
      category: payload.category,
      type: payload.type,
      summary: payload.summary.trim(),
      islamicGuidance: payload.islamicGuidance.trim(),
      civilConsiderations: payload.civilConsiderations.trim(),
      counsellingOptions: payload.counsellingOptions.trim(),
      consentVerified: payload.type === 'Educational Article',
      piiStripped: true,
      safeguardingReviewed: false,
      scholarApproved: false,
      approvedBy: payload.approvedBy.trim() || 'Pending Scholar Approval',
      publishedAt: 'Pending Approval',
      nextReviewDate: 'Nov 2027',
      readMinutes: Math.max(2, payload.readMinutes || 5),
      helpfulCount: 0,
      revisionNumber: 'rev 1.0',
      status: 'Pending Review',
    };

    const nextStore = this.saveStore({
      ...store,
      articles: [article, ...store.articles],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'knowledge_moderator',
          actorName,
          action: `Created new ${article.type} draft "${article.title}"`,
          targetType: 'Article',
          targetId: article.id,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
    return { store: nextStore, article };
  },

  submitSpecialistReview(
    store: RahnumaStore,
    payload: {
      specialistId: string;
      appointmentId?: string;
      userId: string;
      authorDisplay: string;
      context: string;
      rating: number;
      quote: string;
    }
  ): { store: RahnumaStore; review: SpecialistReview } {
    const clampedRating = Math.min(5, Math.max(1, Math.round(payload.rating)));
    const review: SpecialistReview = {
      id: `rev_${Date.now()}`,
      specialistId: payload.specialistId,
      appointmentId: payload.appointmentId,
      userId: payload.userId,
      authorDisplay: payload.authorDisplay,
      context: payload.context.trim() || 'Confidential Consultation',
      rating: clampedRating,
      quote: payload.quote.trim(),
      createdAt: nowFormatted(),
    };

    const nextSpecialists = store.specialists.map((s) => {
      if (s.id !== payload.specialistId) return s;
      const oldCount = s.reviewCount;
      const newCount = oldCount + 1;
      const newRating =
        oldCount === 0
          ? clampedRating
          : Number(((s.rating * oldCount + clampedRating) / newCount).toFixed(1));
      const oldSatisfied = (s.satisfiedPercent / 100) * oldCount;
      const newSatisfied = Math.round(
        ((oldSatisfied + (clampedRating >= 4 ? 1 : 0)) / newCount) * 100
      );
      return {
        ...s,
        reviewCount: newCount,
        rating: newRating,
        satisfiedPercent: newSatisfied,
      };
    });

    const nextStore = this.saveStore({
      ...store,
      specialists: nextSpecialists,
      reviews: [review, ...store.reviews],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          actorRole: 'user',
          actorName: payload.authorDisplay,
          action: `Submitted ${clampedRating}-star review for specialist ${payload.specialistId}`,
          targetType: 'Specialist',
          targetId: payload.specialistId,
          timestamp: timeStampFormatted(),
        },
        ...store.auditLogs,
      ],
    });
    return { store: nextStore, review };
  },
};
