export type PortalRole =
  | 'user'
  | 'mufti'
  | 'family_counsellor'
  | 'mental_health'
  | 'legal_advisor'
  | 'case_manager'
  | 'knowledge_moderator'
  | 'admin'
  | 'super_admin';

export type PortalView =
  | 'home'
  | 'specialists'
  | 'fatwas'
  | 'knowledge'
  | 'submit-case'
  | 'safeguarding'
  | 'portal';

export type CaseStatus =
  | 'Submitted'
  | 'Pending Triage'
  | 'Urgent Review'
  | 'Awaiting Assignment'
  | 'Assigned'
  | 'In Consultation'
  | 'Awaiting Response'
  | 'Follow-Up Required'
  | 'Resolved'
  | 'Closed'
  | 'Reopened';

export const ALL_CASE_STATUSES: CaseStatus[] = [
  'Submitted',
  'Pending Triage',
  'Urgent Review',
  'Awaiting Assignment',
  'Assigned',
  'In Consultation',
  'Awaiting Response',
  'Follow-Up Required',
  'Resolved',
  'Closed',
  'Reopened',
];

export type ConsultationMode = 'video' | 'audio' | 'text' | 'written';

export type SpecialistDiscipline =
  | 'Mufti / Islamic Scholar'
  | 'Family Counsellor'
  | 'Mental Health Specialist'
  | 'Islamic Legal Advisor';

export type SchoolOfThought =
  | 'Hanafi'
  | 'Shafii'
  | 'Maliki'
  | 'Hanbali'
  | 'Comparative Fiqh';

export type FatwaStatus =
  | 'Submitted'
  | 'In Review'
  | 'Peer Review'
  | 'Published'
  | 'Superseded'
  | 'Archived'
  | 'Withdrawn';

export type AppointmentStatus =
  | 'Confirmed'
  | 'Completed'
  | 'Rescheduled'
  | 'Cancelled';

export interface AttachmentMeta {
  id: string;
  name: string;
  sizeLabel: string;
  type: string;
}

export interface SessionDevice {
  id: string;
  deviceName: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export type BookmarkTargetType = 'fatwa' | 'specialist' | 'article';

export interface BookmarkCollection {
  fatwas: string[];
  specialists: string[];
  articles: string[];
}

export type ActivityItemType = 'fatwa' | 'article' | 'specialist' | 'case' | 'appointment';

export type ActivityInteractionKind =
  | 'Viewed'
  | 'Bookmarked'
  | 'Marked Helpful'
  | 'Submitted'
  | 'Booked';

export interface RecentActivityItem {
  key: string;
  type: ActivityItemType;
  itemId: string;
  title: string;
  subtitle: string;
  href: string;
  interaction: ActivityInteractionKind;
  timestamp: string;
  updatedAtMs: number;
}

export interface UserAccount {
  id: string;
  name: string;
  pseudonym: string;
  usePseudonym: boolean;
  email: string;
  password?: string;
  phone: string;
  role: PortalRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  discreetNotifications: boolean;
  preferredMode: ConsultationMode;
  savedArticleIds: string[];
  savedFatwaIds: string[];
  savedSpecialistIds: string[];
  sessions: SessionDevice[];
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  isBooked: boolean;
}

export interface SpecialistProfile {
  id: string;
  userId: string;
  name: string;
  discipline: SpecialistDiscipline;
  title: string;
  credentials: string;
  languages: string[];
  specialties: string[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  satisfiedPercent: number;
  waitTime: string;
  feeAmount: number;
  isVerified: boolean;
  isAvailableOnline: boolean;
  supportsCouplesMediation: boolean;
  bio: string;
  imageKey: 'mufti' | 'mufti_bilal' | 'counsellor' | 'psychologist' | 'legal' | 'hero';
  slots: TimeSlot[];
}

export interface FatwaItem {
  id: string;
  referenceCode: string;
  questionTitle: string;
  questionBody: string;
  submittedByUserId: string;
  submittedByDisplay: string;
  assignedScholarId: string;
  scholarName: string;
  schoolOfThought: SchoolOfThought;
  rulingAnswer: string;
  references: string[];
  attachments?: AttachmentMeta[];
  category: string;
  status: FatwaStatus;
  issuedAt: string;
  reviewedAt: string;
  version: string;
  revisionNote?: string;
  helpfulCount: number;
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: 'Anonymized Case Guide' | 'Educational Article';
  summary: string;
  islamicGuidance: string;
  civilConsiderations: string;
  counsellingOptions: string;
  sourceCaseId?: string;
  consentVerified: boolean;
  piiStripped: boolean;
  safeguardingReviewed: boolean;
  scholarApproved: boolean;
  approvedBy: string;
  publishedAt: string;
  nextReviewDate: string;
  readMinutes: number;
  helpfulCount: number;
  revisionNumber: string;
  takedownRequested?: boolean;
  status: 'Draft' | 'Pending Review' | 'Published' | 'Withdrawn';
}

export interface PrivateClinicalNote {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface CaseReferral {
  id: string;
  caseId: string;
  fromSpecialistName: string;
  toDiscipline: SpecialistDiscipline;
  reason: string;
  createdAt: string;
}

export interface CaseTimelineEvent {
  id: string;
  caseId: string;
  label: string;
  actor: string;
  timestamp: string;
}

export interface CounsellingCase {
  id: string;
  userId: string;
  displayName: string;
  title: string;
  category: string;
  narrative: string;
  preferredLanguage: 'English' | 'Urdu';
  requestedHelpType: ConsultationMode;
  attachments?: AttachmentMeta[];
  status: CaseStatus;
  isSafeguardingFlagged: boolean;
  riskSignals: string[];
  couplesMediationBlocked: boolean;
  discreetMode: boolean;
  assignedSpecialistId?: string;
  assignedSpecialistName?: string;
  createdAt: string;
  updatedAt: string;
  nominatedForEducation: boolean;
}

export interface Appointment {
  id: string;
  caseId?: string;
  userId: string;
  userDisplayName: string;
  specialistId: string;
  specialistName: string;
  specialistDiscipline: SpecialistDiscipline;
  mode: ConsultationMode;
  slotId: string;
  slotDate: string;
  slotTime: string;
  status: AppointmentStatus;
  attendanceStatus: 'Scheduled' | 'Attended' | 'Missed';
  fee: number;
  discountApplied: number;
  discreetReminder: boolean;
  notesSummary?: string;
  deliveredSummary?: string;
  recordingEnabled: false;
  createdAt: string;
}

export interface ConsultationMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: PortalRole;
  body: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorRole: PortalRole;
  actorName: string;
  action: string;
  targetType: 'Case' | 'Fatwa' | 'Article' | 'Appointment' | 'Specialist' | 'Safeguarding' | 'Account' | 'Governance';
  targetId: string;
  timestamp: string;
}

export interface EmptySearchLog {
  id: string;
  query: string;
  timestamp: string;
}

export interface PortalSettings {
  communityDiscountPercent: number;
  discountCode: string;
  discreetEmailSubject: string;
  staffingHoursNote: string;
  escalationOwner: string;
  responseLimitHours: number;
  mandatoryStaff2FA: boolean;
}

export interface RolePermissionSet {
  submitCasesAndBook: boolean;
  reviewAndApproveFatwas: boolean;
  manageAssignedConsultations: boolean;
  writePrivateClinicalNotes: boolean;
  triageAndEscalateCases: boolean;
  moderateAndPublishKnowledge: boolean;
  manageOperationsAndAudit: boolean;
  governRolesAndPolicies: boolean;
}

export interface SpecialistReview {
  id: string;
  specialistId: string;
  appointmentId?: string;
  userId: string;
  authorDisplay: string;
  context: string;
  rating: number;
  quote: string;
  createdAt: string;
}

export interface RahnumaStore {
  users: UserAccount[];
  specialists: SpecialistProfile[];
  reviews: SpecialistReview[];
  fatwas: FatwaItem[];
  articles: KnowledgeArticle[];
  cases: CounsellingCase[];
  caseTimeline: CaseTimelineEvent[];
  clinicalNotes: PrivateClinicalNote[];
  referrals: CaseReferral[];
  appointments: Appointment[];
  messages: ConsultationMessage[];
  auditLogs: AuditLogEntry[];
  emptySearches: EmptySearchLog[];
  settings: PortalSettings;
  rolePermissions: Record<PortalRole, RolePermissionSet>;
}
