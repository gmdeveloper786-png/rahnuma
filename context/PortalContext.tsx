'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { rahnumaRepo } from '@/lib/storage';
import { SEED_STORE } from '@/lib/seed-data';
import type {
  AttachmentMeta,
  BookmarkCollection,
  BookmarkTargetType,
  CaseStatus,
  ConsultationMode,
  FatwaStatus,
  PortalRole,
  PortalSettings,
  PortalView,
  RahnumaStore,
  RecentActivityItem,
  RolePermissionSet,
  SchoolOfThought,
  SpecialistDiscipline,
  SpecialistProfile,
  UserAccount,
} from '@/types/rahnuma';

export type ToastTone = 'success' | 'warning' | 'info' | 'bookmark';

export interface ToastAction {
  label: string;
  view?: PortalView;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs: number;
  action?: ToastAction;
}

interface PortalContextValue {
  store: RahnumaStore;
  isHydrated: boolean;
  activeView: PortalView;
  setActiveView: (view: PortalView) => void;
  isAuthenticated: boolean;
  activeRole: PortalRole;
  activeRolePermissions: RolePermissionSet;
  activeSpecialistId: string | null;
  currentUser: UserAccount;
  loginWithCredentials: (
    email: string,
    password: string
  ) => { ok: boolean; error?: string };
  logout: () => void;
  updateCurrentUser: (patch: Partial<UserAccount>) => void;
  registerMember: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    pseudonym: string;
    usePseudonym: boolean;
  }) => { ok: boolean; error?: string };
  revokeSession: (sessionId: string) => void;

  directoryFilter: { query: string; discipline: string; specialty: string };
  setDirectoryFilter: (f: { query: string; discipline: string; specialty: string }) => void;
  navigateToDirectory: (opts?: { query?: string; discipline?: string; specialty?: string }) => void;

  knowledgeQuery: string;
  setKnowledgeQuery: (q: string) => void;
  knowledgeCategory: string;
  setKnowledgeCategory: (c: string) => void;
  navigateToKnowledge: (view: 'fatwas' | 'knowledge', category?: string, query?: string) => void;

  selectedSpecialistId: string | null;
  setSelectedSpecialistId: (id: string | null) => void;
  bookingModalSpecialist: SpecialistProfile | null;
  openBookingModal: (specialist: SpecialistProfile) => void;
  closeBookingModal: () => void;

  isAskFatwaModalOpen: boolean;
  setAskFatwaModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;

  submitCase: (payload: {
    title: string;
    category: string;
    narrative: string;
    preferredLanguage: 'English' | 'Urdu';
    requestedHelpType: ConsultationMode;
    discreetMode: boolean;
    attachments?: AttachmentMeta[];
  }) => { isFlagged: boolean; caseId: string };
  updateCaseStatus: (caseId: string, status: CaseStatus) => void;
  assignCase: (caseId: string, specialistId: string) => void;
  nominateCaseForEducation: (caseId: string) => void;
  addClinicalNote: (caseId: string, content: string) => void;
  addReferral: (caseId: string, toDiscipline: SpecialistDiscipline, reason: string) => void;

  submitFatwaQuestion: (payload: {
    questionTitle: string;
    questionBody: string;
    category: string;
    schoolOfThought: SchoolOfThought;
    attachments?: AttachmentMeta[];
  }) => string;
  routeFatwaToScholar: (fatwaId: string, scholarId: string) => void;
  updateFatwaReview: (payload: {
    fatwaId: string;
    rulingAnswer: string;
    references: string[];
    schoolOfThought: SchoolOfThought;
    status: FatwaStatus;
    revisionNote?: string;
  }) => void;

  bookAppointment: (payload: {
    specialistId: string;
    slotId: string;
    mode: ConsultationMode;
    discreetReminder: boolean;
    discountCode?: string;
    initialNote?: string;
  }) => boolean;
  rescheduleAppointment: (appointmentId: string, newSlotId: string) => void;
  deliverConsultationSummary: (payload: {
    appointmentId: string;
    attendanceStatus: 'Scheduled' | 'Attended' | 'Missed';
    deliveredSummary: string;
  }) => void;
  cancelAppointment: (appointmentId: string) => void;
  sendMessage: (threadId: string, body: string) => void;

  addSpecialistSlot: (specialistId: string, date: string, time: string) => void;
  toggleSpecialistVerification: (specialistId: string) => void;
  addSpecialist: (payload: {
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
  }) => void;
  updateSpecialist: (
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
    >
  ) => void;
  createKnowledgeArticle: (payload: {
    title: string;
    category: string;
    type: 'Anonymized Case Guide' | 'Educational Article';
    summary: string;
    islamicGuidance: string;
    civilConsiderations: string;
    counsellingOptions: string;
    readMinutes: number;
    approvedBy: string;
  }) => void;
  submitSpecialistReview: (payload: {
    specialistId: string;
    appointmentId?: string;
    context: string;
    rating: number;
    quote: string;
  }) => void;
  resetPassword: (email: string, newPassword: string) => { ok: boolean; error?: string };
  updateArticleChecklist: (payload: {
    articleId: string;
    consentVerified: boolean;
    piiStripped: boolean;
    safeguardingReviewed: boolean;
    scholarApproved: boolean;
    summary?: string;
    publishNow?: boolean;
    withdrawNow?: boolean;
  }) => void;
  requestArticleTakedown: (articleId: string) => void;
  updatePortalSettings: (patch: Partial<PortalSettings>) => void;
  updateRolePermission: (
    targetRole: PortalRole,
    permissionKey: keyof RolePermissionSet,
    enabled: boolean
  ) => void;
  setMandatoryStaff2FA: (enabled: boolean) => void;
  toggleUserTwoFactor: (userId: string, enabled: boolean) => void;

  markHelpful: (type: 'fatwa' | 'article', id: string) => void;
  savedFatwaIds: string[];
  savedSpecialistIds: string[];
  savedArticleIds: string[];
  isBookmarked: (type: BookmarkTargetType, id: string) => boolean;
  toggleBookmark: (type: BookmarkTargetType, id: string) => void;
  recentActivity: RecentActivityItem[];
  recordActivity: (item: Omit<RecentActivityItem, 'updatedAtMs' | 'timestamp'>) => void;
  clearRecentActivity: () => void;
  logEmptySearch: (query: string) => void;

  toasts: ToastItem[];
  pushToast: (
    title: string,
    description?: string,
    tone?: ToastTone,
    options?: { durationMs?: number; action?: ToastAction }
  ) => void;
  dismissToast: (id: string) => void;
}

const PortalContext = createContext<PortalContextValue | null>(null);

const ROLE_SPECIALIST_ID: Partial<Record<PortalRole, string>> = {
  mufti: 'spec_mufti_tariq',
  family_counsellor: 'spec_amina',
  mental_health: 'spec_usman',
  legal_advisor: 'spec_maryam',
};

let clientStoreCache: RahnumaStore | null = null;
const storeListeners = new Set<() => void>();

function getClientStoreSnapshot(): RahnumaStore {
  if (!clientStoreCache) {
    clientStoreCache = rahnumaRepo.loadStore();
  }
  return clientStoreCache;
}

function getServerStoreSnapshot(): RahnumaStore {
  return SEED_STORE;
}

function subscribeStore(listener: () => void): () => void {
  storeListeners.add(listener);
  return () => {
    storeListeners.delete(listener);
  };
}

const emptySubscribe = () => () => {};

function setStore(updater: RahnumaStore | ((prev: RahnumaStore) => RahnumaStore)) {
  const current = getClientStoreSnapshot();
  const next = typeof updater === 'function' ? updater(current) : updater;
  clientStoreCache = rahnumaRepo.saveStore(next);
  storeListeners.forEach((listener) => listener());
}

let clientSessionCache: string | null | undefined = undefined;
const sessionListeners = new Set<() => void>();

function getClientSessionSnapshot(): string | null {
  if (clientSessionCache === undefined) {
    clientSessionCache = rahnumaRepo.getAuthSessionUserId();
  }
  return clientSessionCache;
}

function getServerSessionSnapshot(): string | null {
  return null;
}

function subscribeSession(listener: () => void): () => void {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}

function setAuthSession(userId: string | null) {
  clientSessionCache = userId;
  rahnumaRepo.setAuthSessionUserId(userId);
  sessionListeners.forEach((listener) => listener());
}

const EMPTY_BOOKMARKS: BookmarkCollection = { fatwas: [], specialists: [], articles: [] };
let clientBookmarkCache: BookmarkCollection | null = null;
const bookmarkListeners = new Set<() => void>();

function getClientBookmarkSnapshot(): BookmarkCollection {
  if (!clientBookmarkCache) {
    clientBookmarkCache = rahnumaRepo.getGuestBookmarks();
  }
  return clientBookmarkCache;
}

function getServerBookmarkSnapshot(): BookmarkCollection {
  return EMPTY_BOOKMARKS;
}

function subscribeBookmarks(listener: () => void): () => void {
  bookmarkListeners.add(listener);
  return () => {
    bookmarkListeners.delete(listener);
  };
}

function setGuestBookmarks(
  updater: BookmarkCollection | ((prev: BookmarkCollection) => BookmarkCollection)
) {
  const current = getClientBookmarkSnapshot();
  const next = typeof updater === 'function' ? updater(current) : updater;
  clientBookmarkCache = rahnumaRepo.saveGuestBookmarks(next);
  bookmarkListeners.forEach((listener) => listener());
}

const EMPTY_ACTIVITY: RecentActivityItem[] = [];
let clientActivityCache: RecentActivityItem[] | null = null;
const activityListeners = new Set<() => void>();

function getClientActivitySnapshot(): RecentActivityItem[] {
  if (!clientActivityCache) {
    clientActivityCache = rahnumaRepo.getRecentActivity();
  }
  return clientActivityCache;
}

function getServerActivitySnapshot(): RecentActivityItem[] {
  return EMPTY_ACTIVITY;
}

function subscribeActivity(listener: () => void): () => void {
  activityListeners.add(listener);
  return () => {
    activityListeners.delete(listener);
  };
}

function setActivityStore(
  updater: RecentActivityItem[] | ((prev: RecentActivityItem[]) => RecentActivityItem[])
) {
  const current = getClientActivitySnapshot();
  const next = typeof updater === 'function' ? updater(current) : updater;
  clientActivityCache = rahnumaRepo.saveRecentActivity(next);
  activityListeners.forEach((listener) => listener());
}

export const VIEW_PATHS: Record<PortalView, string> = {
  home: '/',
  specialists: '/specialists',
  fatwas: '/fatwas',
  knowledge: '/knowledge',
  'submit-case': '/submit-case',
  safeguarding: '/safeguarding',
  portal: '/portal',
};

function getViewFromPathname(pathname: string | null): PortalView {
  if (!pathname || pathname === '/') return 'home';
  if (pathname === '/specialists' || pathname.startsWith('/specialists/')) return 'specialists';
  if (pathname === '/fatwas' || pathname.startsWith('/fatwas/')) return 'fatwas';
  if (pathname === '/knowledge' || pathname.startsWith('/knowledge/')) return 'knowledge';
  if (pathname === '/submit-case' || pathname.startsWith('/submit-case/')) return 'submit-case';
  if (pathname === '/safeguarding' || pathname.startsWith('/safeguarding/')) return 'safeguarding';
  if (pathname === '/portal' || pathname.startsWith('/portal/')) return 'portal';
  return 'home';
}

function getSpecialistIdFromPathname(pathname: string | null): string | null {
  if (!pathname || !pathname.startsWith('/specialists/')) return null;
  const segment = pathname.slice('/specialists/'.length).split('/')[0];
  return segment ? decodeURIComponent(segment) : null;
}

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const store = useSyncExternalStore(
    subscribeStore,
    getClientStoreSnapshot,
    getServerStoreSnapshot
  );
  const authenticatedUserId = useSyncExternalStore(
    subscribeSession,
    getClientSessionSnapshot,
    getServerSessionSnapshot
  );
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const guestBookmarks = useSyncExternalStore(
    subscribeBookmarks,
    getClientBookmarkSnapshot,
    getServerBookmarkSnapshot
  );
  const recentActivity = useSyncExternalStore(
    subscribeActivity,
    getClientActivitySnapshot,
    getServerActivitySnapshot
  );

  const pathname = usePathname();
  const router = useRouter();
  const activeView = getViewFromPathname(pathname);
  const selectedSpecialistId = getSpecialistIdFromPathname(pathname);

  const setActiveView = useCallback(
    (view: PortalView) => {
      const target = VIEW_PATHS[view];
      if (pathname !== target) {
        router.push(target);
      }
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pathname, router]
  );

  const setSelectedSpecialistId = useCallback(
    (id: string | null) => {
      if (id) {
        router.push(`/specialists/${encodeURIComponent(id)}`);
      } else if (pathname?.startsWith('/specialists/')) {
        router.push('/specialists');
      }
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pathname, router]
  );

  const [directoryFilter, setDirectoryFilter] = useState({
    query: '',
    discipline: 'All',
    specialty: 'All',
  });
  const [knowledgeQuery, setKnowledgeQuery] = useState('');
  const [knowledgeCategory, setKnowledgeCategory] = useState('All');
  const [bookingModalSpecialist, setBookingModalSpecialist] = useState<SpecialistProfile | null>(
    null
  );
  const [isAskFatwaModalOpen, setAskFatwaModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback(
    (
      title: string,
      description?: string,
      tone: ToastTone = 'success',
      options?: { durationMs?: number; action?: ToastAction }
    ) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const durationMs = options?.durationMs ?? (tone === 'warning' ? 6500 : 4500);
      setToasts((prev) => [
        ...prev.slice(-3),
        {
          id,
          title,
          description,
          tone,
          durationMs,
          action: options?.action,
        },
      ]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const authenticatedUser = authenticatedUserId
    ? store.users.find((u) => u.id === authenticatedUserId) || null
    : null;
  const isAuthenticated = Boolean(authenticatedUser);
  const activeRole: PortalRole = authenticatedUser ? authenticatedUser.role : 'user';
  const currentUser = authenticatedUser || store.users[0];

  const activeRolePermissions = store.rolePermissions[activeRole];
  const activeSpecialistId = ROLE_SPECIALIST_ID[activeRole] ?? null;

  const loginWithCredentials: PortalContextValue['loginWithCredentials'] = useCallback(
    (email, password) => {
      const user = rahnumaRepo.authenticateUser(store, email, password);
      if (!user) {
        return {
          ok: false,
          error: 'Invalid email address or password. Please verify your credentials.',
        };
      }
      setAuthSession(user.id);
      pushToast(`Signed in as ${user.name}`, 'Secure portal session established.');
      return { ok: true };
    },
    [pushToast, store]
  );

  const logout = useCallback(() => {
    setAuthSession(null);
    pushToast('Signed out securely', 'Your portal session has ended.', 'info');
  }, [pushToast]);

  const registerMember: PortalContextValue['registerMember'] = useCallback(
    (payload) => {
      const duplicate = store.users.some(
        (u) => u.email.trim().toLowerCase() === payload.email.trim().toLowerCase()
      );
      if (duplicate) {
        return { ok: false, error: 'An account with this email address already exists.' };
      }
      const result = rahnumaRepo.registerMember(store, payload);
      setStore(result.store);
      setAuthSession(result.user.id);
      pushToast(
        'Account Created & Verified',
        `Signed in as ${result.user.usePseudonym ? result.user.pseudonym : result.user.name}`
      );
      return { ok: true };
    },
    [pushToast, store]
  );

  const revokeSession = useCallback(
    (sessionId: string) => {
      setStore((prev) => rahnumaRepo.revokeUserSession(prev, currentUser.id, sessionId));
      pushToast('Device session revoked');
    },
    [currentUser.id, pushToast]
  );

  const updateCurrentUser = useCallback(
    (patch: Partial<UserAccount>) => {
      setStore((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === currentUser.id ? { ...u, ...patch } : u)),
      }));
      pushToast('Profile & security settings updated');
    },
    [currentUser.id, pushToast]
  );

  const navigateToDirectory = useCallback(
    (opts?: { query?: string; discipline?: string; specialty?: string }) => {
      setDirectoryFilter({
        query: opts?.query ?? '',
        discipline: opts?.discipline ?? 'All',
        specialty: opts?.specialty ?? 'All',
      });
      router.push('/specialists');
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router]
  );

  const navigateToKnowledge = useCallback(
    (view: 'fatwas' | 'knowledge', category = 'All', query = '') => {
      setKnowledgeCategory(category);
      setKnowledgeQuery(query);
      router.push(VIEW_PATHS[view]);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router]
  );

  const openBookingModal = useCallback((specialist: SpecialistProfile) => {
    setBookingModalSpecialist(specialist);
  }, []);

  const closeBookingModal = useCallback(() => {
    setBookingModalSpecialist(null);
  }, []);

  const submitCase: PortalContextValue['submitCase'] = useCallback(
    (payload) => {
      const displayName = currentUser.usePseudonym ? currentUser.pseudonym : currentUser.name;
      const result = rahnumaRepo.submitCase(store, {
        userId: currentUser.id,
        displayName,
        ...payload,
      });
      setStore(result.store);
      if (result.createdCase.isSafeguardingFlagged) {
        pushToast(
          `Urgent Safeguarding Case ${result.createdCase.id} Logged`,
          'Routed immediately to Crisis Triage with Discreet Mode enabled.',
          'warning',
          { action: { label: 'Track Case', view: 'portal' } }
        );
      } else {
        pushToast(
          `Case ${result.createdCase.id} Submitted`,
          'A case coordinator will review and assign your preferred specialist.',
          'success',
          { action: { label: 'Track Case', view: 'portal' } }
        );
      }
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setActivityStore((prev) => {
        const entry: RecentActivityItem = {
          key: `case:${result.createdCase.id}`,
          type: 'case',
          itemId: result.createdCase.id,
          title: result.createdCase.title,
          subtitle: `${result.createdCase.id} · ${result.createdCase.category}`,
          href: '/portal',
          interaction: 'Submitted',
          timestamp,
          updatedAtMs: now.getTime(),
        };
        return [entry, ...prev.filter((item) => item.key !== entry.key)].slice(0, 8);
      });
      return {
        isFlagged: result.createdCase.isSafeguardingFlagged,
        caseId: result.createdCase.id,
      };
    },
    [currentUser, pushToast, store]
  );

  const updateCaseStatus = useCallback(
    (caseId: string, status: CaseStatus) => {
      setStore((prev) =>
        rahnumaRepo.updateCaseStatus(prev, {
          caseId,
          status,
          actorRole: activeRole,
          actorName: currentUser.name,
        })
      );
      pushToast(`Case ${caseId} updated to ${status}`);
    },
    [activeRole, currentUser.name, pushToast]
  );

  const assignCase = useCallback(
    (caseId: string, specialistId: string) => {
      setStore((prev) =>
        rahnumaRepo.assignCaseToSpecialist(prev, {
          caseId,
          specialistId,
          actorName: currentUser.name,
        })
      );
      pushToast(`Case ${caseId} assigned successfully`);
    },
    [currentUser.name, pushToast]
  );

  const nominateCaseForEducation = useCallback(
    (caseId: string) => {
      setStore((prev) =>
        rahnumaRepo.nominateCaseForEducation(prev, caseId, currentUser.name, activeRole)
      );
      pushToast(
        `Case ${caseId} Nominated for Knowledge Hub`,
        'Added to Knowledge Moderator Anonymization & Consent Queue.'
      );
    },
    [activeRole, currentUser.name, pushToast]
  );

  const addClinicalNote = useCallback(
    (caseId: string, content: string) => {
      if (!content.trim()) return;
      setStore((prev) =>
        rahnumaRepo.addClinicalNote(prev, {
          caseId,
          authorId: currentUser.id,
          authorName: currentUser.name,
          content,
        })
      );
      pushToast('Private practitioner note saved', 'Restricted strictly to authoring specialist.');
    },
    [currentUser.id, currentUser.name, pushToast]
  );

  const addReferral = useCallback(
    (caseId: string, toDiscipline: SpecialistDiscipline, reason: string) => {
      if (!reason.trim()) return;
      setStore((prev) =>
        rahnumaRepo.addReferral(prev, {
          caseId,
          fromSpecialistName: currentUser.name,
          actorRole: activeRole,
          toDiscipline,
          reason,
        })
      );
      pushToast(`Referral created for ${toDiscipline}`);
    },
    [activeRole, currentUser.name, pushToast]
  );

  const submitFatwaQuestion: PortalContextValue['submitFatwaQuestion'] = useCallback(
    (payload) => {
      const display = currentUser.usePseudonym ? currentUser.pseudonym : currentUser.name;
      const result = rahnumaRepo.submitFatwaQuestion(store, {
        userId: currentUser.id,
        submittedByDisplay: display,
        ...payload,
      });
      setStore(result.store);
      pushToast(
        `Question ${result.fatwa.referenceCode} Sent to Scholars`,
        'Track scholarly review progress inside your Member Portal.',
        'success',
        { action: { label: 'Track Question', view: 'portal' } }
      );
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setActivityStore((prev) => {
        const entry: RecentActivityItem = {
          key: `fatwa:${result.fatwa.id}`,
          type: 'fatwa',
          itemId: result.fatwa.id,
          title: result.fatwa.questionTitle,
          subtitle: `${result.fatwa.referenceCode} · ${result.fatwa.category}`,
          href: '/portal',
          interaction: 'Submitted',
          timestamp,
          updatedAtMs: now.getTime(),
        };
        return [entry, ...prev.filter((item) => item.key !== entry.key)].slice(0, 8);
      });
      return result.fatwa.referenceCode;
    },
    [currentUser, pushToast, store]
  );

  const routeFatwaToScholar = useCallback(
    (fatwaId: string, scholarId: string) => {
      setStore((prev) =>
        rahnumaRepo.routeFatwaToScholar(prev, fatwaId, scholarId, currentUser.name)
      );
      pushToast('Fatwa question routed to specialist scholar');
    },
    [currentUser.name, pushToast]
  );

  const updateFatwaReview: PortalContextValue['updateFatwaReview'] = useCallback(
    (payload) => {
      setStore((prev) =>
        rahnumaRepo.updateFatwaReview(prev, {
          ...payload,
          scholarName: currentUser.name,
        })
      );
      pushToast(
        payload.status === 'Published'
          ? 'Verified Fatwa Published to Repository'
          : `Fatwa moved to ${payload.status}`
      );
    },
    [currentUser.name, pushToast]
  );

  const bookAppointment: PortalContextValue['bookAppointment'] = useCallback(
    (payload) => {
      const displayName = currentUser.usePseudonym ? currentUser.pseudonym : currentUser.name;
      const result = rahnumaRepo.bookAppointment(store, {
        userId: currentUser.id,
        userDisplayName: displayName,
        ...payload,
      });
      if (!result.appointment) {
        pushToast('Slot no longer available', 'Please choose another slot.', 'warning');
        return false;
      }
      setStore(result.store);
      pushToast(
        'Consultation Confirmed',
        `${result.appointment.specialistName} · ${result.appointment.slotDate} at ${result.appointment.slotTime}`,
        'success',
        { action: { label: 'View Booking', view: 'portal' } }
      );
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setActivityStore((prev) => {
        const entry: RecentActivityItem = {
          key: `specialist:${result.appointment!.specialistId}`,
          type: 'specialist',
          itemId: result.appointment!.specialistId,
          title: result.appointment!.specialistName,
          subtitle: `${result.appointment!.slotDate} · ${result.appointment!.slotTime}`,
          href: `/specialists/${result.appointment!.specialistId}`,
          interaction: 'Booked',
          timestamp,
          updatedAtMs: now.getTime(),
        };
        return [entry, ...prev.filter((item) => item.key !== entry.key)].slice(0, 8);
      });
      return true;
    },
    [currentUser, pushToast, store]
  );

  const rescheduleAppointment = useCallback(
    (appointmentId: string, newSlotId: string) => {
      setStore((prev) =>
        rahnumaRepo.rescheduleAppointment(prev, appointmentId, newSlotId, currentUser.name)
      );
      pushToast('Appointment rescheduled to new time slot');
    },
    [currentUser.name, pushToast]
  );

  const deliverConsultationSummary: PortalContextValue['deliverConsultationSummary'] =
    useCallback(
      (payload) => {
        setStore((prev) =>
          rahnumaRepo.deliverConsultationSummary(prev, {
            ...payload,
            actorName: currentUser.name,
            actorRole: activeRole,
          })
        );
        pushToast('Written consultation summary & attendance saved');
      },
      [activeRole, currentUser.name, pushToast]
    );

  const cancelAppointment = useCallback(
    (appointmentId: string) => {
      setStore((prev) => rahnumaRepo.cancelAppointment(prev, appointmentId, currentUser.name));
      pushToast('Appointment cancelled and slot released', undefined, 'info');
    },
    [currentUser.name, pushToast]
  );

  const sendMessage = useCallback(
    (threadId: string, body: string) => {
      if (!body.trim()) return;
      const senderName =
        activeRole === 'user' && currentUser.usePseudonym
          ? currentUser.pseudonym
          : currentUser.name;
      setStore((prev) =>
        rahnumaRepo.sendMessage(prev, {
          threadId,
          senderId: currentUser.id,
          senderName,
          senderRole: activeRole,
          body,
        })
      );
    },
    [activeRole, currentUser]
  );

  const addSpecialistSlot = useCallback(
    (specialistId: string, date: string, time: string) => {
      setStore((prev) => rahnumaRepo.toggleSpecialistSlot(prev, specialistId, date, time));
      pushToast('Availability slot added', `${date} · ${time}`);
    },
    [pushToast]
  );

  const toggleSpecialistVerification = useCallback(
    (specialistId: string) => {
      setStore((prev) =>
        rahnumaRepo.toggleSpecialistVerification(prev, specialistId, currentUser.name)
      );
      pushToast('Specialist verification credential updated');
    },
    [currentUser.name, pushToast]
  );

  const updateArticleChecklist: PortalContextValue['updateArticleChecklist'] = useCallback(
    (payload) => {
      setStore((prev) =>
        rahnumaRepo.updateArticleChecklist(prev, {
          ...payload,
          actorName: currentUser.name,
          actorRole: activeRole,
        })
      );
      if (payload.withdrawNow) {
        pushToast('Article withdrawn from public repository', undefined, 'info');
      } else if (payload.publishNow) {
        pushToast('Anonymized Educational Guide Published');
      }
    },
    [activeRole, currentUser.name, pushToast]
  );

  const requestArticleTakedown = useCallback(
    (articleId: string) => {
      setStore((prev) => rahnumaRepo.requestArticleTakedown(prev, articleId));
      pushToast(
        'Correction / Takedown Review Requested',
        'Flagged in the Knowledge Moderator queue.',
        'info'
      );
    },
    [pushToast]
  );

  const updatePortalSettings = useCallback(
    (patch: Partial<PortalSettings>) => {
      setStore((prev) =>
        rahnumaRepo.updatePortalSettings(prev, patch, currentUser.name, activeRole)
      );
      pushToast('Portal policies & templates saved');
    },
    [activeRole, currentUser.name, pushToast]
  );

  const updateRolePermission = useCallback(
    (targetRole: PortalRole, permissionKey: keyof RolePermissionSet, enabled: boolean) => {
      setStore((prev) =>
        rahnumaRepo.updateRolePermission(
          prev,
          targetRole,
          permissionKey,
          enabled,
          currentUser.name
        )
      );
      pushToast(
        `Permission ${enabled ? 'Enabled' : 'Revoked'}`,
        `${targetRole} · ${permissionKey}`,
        'info'
      );
    },
    [currentUser.name, pushToast]
  );

  const setMandatoryStaff2FA = useCallback(
    (enabled: boolean) => {
      setStore((prev) => rahnumaRepo.setMandatoryStaff2FA(prev, enabled, currentUser.name));
      pushToast(
        enabled ? 'Mandatory Staff 2FA Enforced' : 'Mandatory Staff 2FA Relaxed',
        undefined,
        enabled ? 'success' : 'warning'
      );
    },
    [currentUser.name, pushToast]
  );

  const toggleUserTwoFactor = useCallback(
    (userId: string, enabled: boolean) => {
      setStore((prev) =>
        rahnumaRepo.toggleUserTwoFactor(prev, userId, enabled, currentUser.name)
      );
      pushToast(`Staff 2FA ${enabled ? 'Activated' : 'Disabled'} for ${userId}`);
    },
    [currentUser.name, pushToast]
  );

  const recordActivity = useCallback(
    (item: Omit<RecentActivityItem, 'updatedAtMs' | 'timestamp'>) => {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setActivityStore((prev) => {
        const entry: RecentActivityItem = {
          ...item,
          timestamp,
          updatedAtMs: now.getTime(),
        };
        return [entry, ...prev.filter((existing) => existing.key !== entry.key)].slice(0, 8);
      });
    },
    []
  );

  const clearRecentActivity = useCallback(() => {
    setActivityStore([]);
    pushToast('Recent activity cleared', undefined, 'info');
  }, [pushToast]);

  const markHelpful = useCallback(
    (type: 'fatwa' | 'article', id: string) => {
      setStore((prev) => rahnumaRepo.markHelpful(prev, type, id));
      if (type === 'fatwa') {
        const f = store.fatwas.find((x) => x.id === id);
        if (f) {
          recordActivity({
            key: `fatwa:${f.id}`,
            type: 'fatwa',
            itemId: f.id,
            title: f.questionTitle,
            subtitle: `${f.referenceCode} · ${f.schoolOfThought}`,
            href: `/fatwas/${f.id}`,
            interaction: 'Marked Helpful',
          });
        }
      } else {
        const a = store.articles.find((x) => x.id === id);
        if (a) {
          recordActivity({
            key: `article:${a.id}`,
            type: 'article',
            itemId: a.id,
            title: a.title,
            subtitle: `${a.type} · ${a.readMinutes} min read`,
            href: `/knowledge/${a.slug}`,
            interaction: 'Marked Helpful',
          });
        }
      }
      pushToast(
        'Thank you for your feedback',
        type === 'fatwa'
          ? 'Your helpful vote was recorded on this ruling.'
          : 'Your helpful vote was recorded on this guide.',
        'info'
      );
    },
    [pushToast, recordActivity, store.articles, store.fatwas]
  );

  const savedFatwaIds = useMemo(
    () => (authenticatedUser ? authenticatedUser.savedFatwaIds : guestBookmarks.fatwas),
    [authenticatedUser, guestBookmarks.fatwas]
  );
  const savedSpecialistIds = useMemo(
    () =>
      authenticatedUser
        ? authenticatedUser.savedSpecialistIds ?? []
        : guestBookmarks.specialists,
    [authenticatedUser, guestBookmarks.specialists]
  );
  const savedArticleIds = useMemo(
    () => (authenticatedUser ? authenticatedUser.savedArticleIds : guestBookmarks.articles),
    [authenticatedUser, guestBookmarks.articles]
  );

  const isBookmarked = useCallback(
    (type: BookmarkTargetType, id: string) => {
      if (type === 'fatwa') return savedFatwaIds.includes(id);
      if (type === 'specialist') return savedSpecialistIds.includes(id);
      return savedArticleIds.includes(id);
    },
    [savedArticleIds, savedFatwaIds, savedSpecialistIds]
  );

  const toggleBookmark = useCallback(
    (type: BookmarkTargetType, id: string) => {
      let added = false;

      if (authenticatedUser) {
        setStore((prev) => ({
          ...prev,
          users: prev.users.map((u) => {
            if (u.id !== authenticatedUser.id) return u;
            if (type === 'fatwa') {
              const exists = u.savedFatwaIds.includes(id);
              added = !exists;
              return {
                ...u,
                savedFatwaIds: exists
                  ? u.savedFatwaIds.filter((x) => x !== id)
                  : [...u.savedFatwaIds, id],
              };
            }
            if (type === 'specialist') {
              const currentSaved = u.savedSpecialistIds ?? [];
              const exists = currentSaved.includes(id);
              added = !exists;
              return {
                ...u,
                savedSpecialistIds: exists
                  ? currentSaved.filter((x) => x !== id)
                  : [...currentSaved, id],
              };
            }
            const exists = u.savedArticleIds.includes(id);
            added = !exists;
            return {
              ...u,
              savedArticleIds: exists
                ? u.savedArticleIds.filter((x) => x !== id)
                : [...u.savedArticleIds, id],
            };
          }),
        }));
      } else {
        setGuestBookmarks((prev) => {
          if (type === 'fatwa') {
            const exists = prev.fatwas.includes(id);
            added = !exists;
            return {
              ...prev,
              fatwas: exists ? prev.fatwas.filter((x) => x !== id) : [...prev.fatwas, id],
            };
          }
          if (type === 'specialist') {
            const exists = prev.specialists.includes(id);
            added = !exists;
            return {
              ...prev,
              specialists: exists
                ? prev.specialists.filter((x) => x !== id)
                : [...prev.specialists, id],
            };
          }
          const exists = prev.articles.includes(id);
          added = !exists;
          return {
            ...prev,
            articles: exists ? prev.articles.filter((x) => x !== id) : [...prev.articles, id],
          };
        });
      }

      if (added) {
        if (type === 'fatwa') {
          const f = store.fatwas.find((x) => x.id === id);
          if (f) {
            recordActivity({
              key: `fatwa:${f.id}`,
              type: 'fatwa',
              itemId: f.id,
              title: f.questionTitle,
              subtitle: `${f.referenceCode} · ${f.schoolOfThought}`,
              href: `/fatwas/${f.id}`,
              interaction: 'Bookmarked',
            });
          }
        } else if (type === 'specialist') {
          const s = store.specialists.find((x) => x.id === id);
          if (s) {
            recordActivity({
              key: `specialist:${s.id}`,
              type: 'specialist',
              itemId: s.id,
              title: s.name,
              subtitle: `${s.discipline} · ${s.waitTime}`,
              href: `/specialists/${s.id}`,
              interaction: 'Bookmarked',
            });
          }
        } else {
          const a = store.articles.find((x) => x.id === id);
          if (a) {
            recordActivity({
              key: `article:${a.id}`,
              type: 'article',
              itemId: a.id,
              title: a.title,
              subtitle: `${a.type} · ${a.readMinutes} min read`,
              href: `/knowledge/${a.slug}`,
              interaction: 'Bookmarked',
            });
          }
        }
      }

      const label =
        type === 'fatwa'
          ? 'Fatwa'
          : type === 'specialist'
          ? 'Specialist'
          : 'Knowledge guide';
      pushToast(
        added ? `${label} bookmarked` : `${label} removed from bookmarks`,
        added ? 'Saved for quick access across sessions.' : undefined,
        added ? 'bookmark' : 'info',
        added ? { action: { label: 'View Saved', view: 'portal' } } : undefined
      );
    },
    [authenticatedUser, pushToast, recordActivity, store.articles, store.fatwas, store.specialists]
  );

  const logEmptySearch = useCallback((query: string) => {
    setStore((prev) => rahnumaRepo.logEmptySearch(prev, query));
  }, []);

  const resetPassword = useCallback(
    (email: string, newPassword: string): { ok: boolean; error?: string } => {
      const result = rahnumaRepo.resetPassword(store, email, newPassword);
      if (!result.ok) {
        return { ok: false, error: result.error };
      }
      setStore(result.store);
      pushToast(
        'Password Reset Successfully',
        'You can now sign in with your new password.',
        'success'
      );
      return { ok: true };
    },
    [store, pushToast]
  );

  const addSpecialist = useCallback(
    (payload: {
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
    }) => {
      const res = rahnumaRepo.addSpecialist(store, payload, currentUser.name);
      setStore(res.store);
      pushToast(
        'Specialist Onboarded',
        `${res.specialist.name} is now live in the directory.`,
        'success'
      );
    },
    [store, currentUser.name, pushToast]
  );

  const updateSpecialist = useCallback(
    (
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
      >
    ) => {
      setStore((prev) => rahnumaRepo.updateSpecialist(prev, specialistId, patch, currentUser.name));
      pushToast('Specialist Updated', 'Changes saved to the directory.', 'success');
    },
    [currentUser.name, pushToast]
  );

  const createKnowledgeArticle = useCallback(
    (payload: {
      title: string;
      category: string;
      type: 'Anonymized Case Guide' | 'Educational Article';
      summary: string;
      islamicGuidance: string;
      civilConsiderations: string;
      counsellingOptions: string;
      readMinutes: number;
      approvedBy: string;
    }) => {
      const res = rahnumaRepo.createKnowledgeArticle(store, payload, currentUser.name);
      setStore(res.store);
      pushToast(
        'Article Draft Created',
        `"${res.article.title}" added to the moderation queue for checklist approval.`,
        'success'
      );
    },
    [store, currentUser.name, pushToast]
  );

  const submitSpecialistReview = useCallback(
    (payload: {
      specialistId: string;
      appointmentId?: string;
      context: string;
      rating: number;
      quote: string;
    }) => {
      const authorDisplay = currentUser.usePseudonym
        ? currentUser.pseudonym
        : currentUser.name;
      const res = rahnumaRepo.submitSpecialistReview(store, {
        ...payload,
        userId: currentUser.id,
        authorDisplay,
      });
      setStore(res.store);
      pushToast(
        'Thank You for Your Feedback',
        'Your confidential review has been saved and specialist ratings updated.',
        'success'
      );
    },
    [store, currentUser, pushToast]
  );

  return (
    <PortalContext.Provider
      value={{
        store,
        isHydrated,
        activeView,
        setActiveView,
        isAuthenticated,
        activeRole,
        activeRolePermissions,
        activeSpecialistId,
        currentUser,
        loginWithCredentials,
        logout,
        updateCurrentUser,
        registerMember,
        revokeSession,
        directoryFilter,
        setDirectoryFilter,
        navigateToDirectory,
        knowledgeQuery,
        setKnowledgeQuery,
        knowledgeCategory,
        setKnowledgeCategory,
        navigateToKnowledge,
        selectedSpecialistId,
        setSelectedSpecialistId,
        bookingModalSpecialist,
        openBookingModal,
        closeBookingModal,
        isAskFatwaModalOpen,
        setAskFatwaModalOpen,
        isAuthModalOpen,
        setAuthModalOpen,
        submitCase,
        updateCaseStatus,
        assignCase,
        nominateCaseForEducation,
        addClinicalNote,
        addReferral,
        submitFatwaQuestion,
        routeFatwaToScholar,
        updateFatwaReview,
        bookAppointment,
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
        requestArticleTakedown,
        updatePortalSettings,
        updateRolePermission,
        setMandatoryStaff2FA,
        toggleUserTwoFactor,
        markHelpful,
        savedFatwaIds,
        savedSpecialistIds,
        savedArticleIds,
        isBookmarked,
        toggleBookmark,
        recentActivity,
        recordActivity,
        clearRecentActivity,
        logEmptySearch,
        toasts,
        pushToast,
        dismissToast,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal(): PortalContextValue {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used inside PortalProvider');
  return ctx;
}
