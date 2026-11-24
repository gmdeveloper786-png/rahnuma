'use client';

import React, { useState } from 'react';
import {
  X,
  Video,
  Phone,
  MessageSquareLock,
  FileText,
  Paperclip,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { usePortal } from '@/context/PortalContext';
import type { AttachmentMeta, ConsultationMode, SchoolOfThought } from '@/types/rahnuma';

export default function Modals() {
  const {
    store,
    bookingModalSpecialist,
    closeBookingModal,
    bookAppointment,
    isAskFatwaModalOpen,
    setAskFatwaModalOpen,
    submitFatwaQuestion,
    isAuthModalOpen,
    setAuthModalOpen,
    loginWithCredentials,
    registerMember,
    resetPassword,
    setActiveView,
    pushToast,
  } = usePortal();

  // Booking modal state
  const [mode, setMode] = useState<ConsultationMode>('text');
  const [slotId, setSlotId] = useState('');
  const [discreetReminder, setDiscreetReminder] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [initialNote, setInitialNote] = useState('');

  // Ask Fatwa modal state
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionBody, setQuestionBody] = useState('');
  const [category, setCategory] = useState('Talaq & Khula');
  const [school, setSchool] = useState<SchoolOfThought>('Hanafi');
  const [fatwaAttachments, setFatwaAttachments] = useState<AttachmentMeta[]>([]);
  const [fatwaError, setFatwaError] = useState('');

  // Auth modal state
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'reset'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPseudonym, setRegPseudonym] = useState('');
  const [regUsePseudonym, setRegUsePseudonym] = useState(true);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const openSlots = bookingModalSpecialist?.slots.filter((s) => !s.isBooked) || [];
  const resolvedSlotId = openSlots.some((s) => s.id === slotId) ? slotId : openSlots[0]?.id || '';

  const isCodeApplied =
    discountCode.trim().toUpperCase() === store.settings.discountCode.toUpperCase();
  const baseFee = bookingModalSpecialist?.feeAmount || 0;
  const discountedFee =
    isCodeApplied && baseFee > 0
      ? Math.max(
          0,
          baseFee - Math.round((baseFee * store.settings.communityDiscountPercent) / 100)
        )
      : baseFee;

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalSpecialist || !resolvedSlotId) return;
    const ok = bookAppointment({
      specialistId: bookingModalSpecialist.id,
      slotId: resolvedSlotId,
      mode,
      discreetReminder,
      discountCode,
      initialNote,
    });
    if (ok) {
      setInitialNote('');
      setDiscountCode('');
      closeBookingModal();
      setActiveView('portal');
    }
  };

  const handleFatwaAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const mapped: AttachmentMeta[] = Array.from(files).map((f, i) => ({
      id: `fatt_${Date.now()}_${i}`,
      name: f.name,
      sizeLabel: `${Math.max(1, Math.round(f.size / 1024))} KB`,
      type: f.type || 'document',
    }));
    setFatwaAttachments((prev) => [...prev, ...mapped]);
    e.target.value = '';
  };

  const handleAskFatwaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionTitle.trim().length < 6 || questionBody.trim().length < 15) {
      setFatwaError('Please enter a clear question title and sufficient context for the scholar.');
      return;
    }
    setFatwaError('');
    submitFatwaQuestion({
      questionTitle,
      questionBody,
      category,
      schoolOfThought: school,
      attachments: fatwaAttachments,
    });
    setQuestionTitle('');
    setQuestionBody('');
    setFatwaAttachments([]);
    setAskFatwaModalOpen(false);
    setActiveView('portal');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (authTab === 'login') {
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
      setAuthModalOpen(false);
    } else if (authTab === 'register') {
      if (regName.trim().length < 2 || !regEmail.includes('@') || regPassword.length < 6) {
        setAuthError('Please enter your name, valid email, and a password (min 6 characters).');
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
        setAuthError(res.error || 'Could not complete registration.');
        return;
      }
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegPseudonym('');
      setAuthModalOpen(false);
    } else if (authTab === 'reset') {
      if (!resetEmail.includes('@')) {
        setAuthError('Enter your registered email address.');
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
      setAuthTab('login');
    }
  };

  return (
    <>
      {/* Booking Consultation Modal */}
      {bookingModalSpecialist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form
            onSubmit={handleBookSubmit}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold text-[#064E3B]">
                  {bookingModalSpecialist.discipline}
                </p>
                <h2 className="mt-0.5 font-display text-lg font-bold text-slate-900">
                  Book Consultation with {bookingModalSpecialist.name}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close booking dialog"
                onClick={closeBookingModal}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Select Consultation Format
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    [
                      ['video', 'Video Session', Video],
                      ['audio', 'Audio Call', Phone],
                      ['text', 'Async Text Chat', MessageSquareLock],
                      ['written', 'Written Guidance', FileText],
                    ] as const
                  ).map(([id, label, Icon]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMode(id)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                        mode === id
                          ? 'border-[#064E3B] bg-[#ECFDF5] text-[#064E3B]'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Available Calendar Slot
                </label>
                {openSlots.length === 0 ? (
                  <p className="mt-1.5 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                    All slots are currently booked. Please select another specialist or submit a
                    Private Case for coordinator scheduling.
                  </p>
                ) : (
                  <select
                    value={resolvedSlotId}
                    onChange={(e) => setSlotId(e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium"
                  >
                    {openSlots.map((sl) => (
                      <option key={sl.id} value={sl.id}>
                        {sl.date} — {sl.time}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {baseFee > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Community Fee Discount Code (Try: {store.settings.discountCode})
                  </label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder={store.settings.discountCode}
                      className="h-9 flex-1 rounded-lg border border-slate-300 px-3 font-mono text-xs uppercase"
                    />
                    {isCodeApplied && (
                      <span className="text-xs font-semibold text-emerald-700">
                        {store.settings.communityDiscountPercent}% Off Applied
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Initial Message (Optional)
                </label>
                <textarea
                  rows={3}
                  value={initialNote}
                  onChange={(e) => setInitialNote(e.target.value)}
                  placeholder="Share brief background to start your confidential consultation..."
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={discreetReminder}
                  onChange={(e) => setDiscreetReminder(e.target.checked)}
                  className="rounded border-slate-300 text-[#064E3B]"
                />
                <span>Send discreet reminder (recording disabled by default)</span>
              </label>

              <p className="flex items-center gap-1.5 rounded-lg bg-[#ECFDF5] px-3 py-2 text-[11px] font-medium text-[#064E3B]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Your identity stays anonymous and your data secure.</span>
              </p>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={openSlots.length === 0}
                  className="rounded-lg bg-[#064E3B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#053B2D] disabled:bg-slate-300"
                >
                  {discountedFee === 0
                    ? 'Confirm Free Booking'
                    : `Confirm · PKR ${discountedFee.toLocaleString()}`}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Ask a Mufti / Scholar Modal */}
      {isAskFatwaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <form
            onSubmit={handleAskFatwaSubmit}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <p className="text-xs font-semibold text-[#064E3B]">Private Scholarly Submission</p>
                <h2 className="mt-0.5 font-display text-lg font-bold text-slate-900">
                  Ask a Verified Mufti / Islamic Scholar
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close fatwa submission dialog"
                onClick={() => setAskFatwaModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Question Subject *
                </label>
                <input
                  type="text"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="e.g., Rights regarding deferred Mahr during Khula"
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Topic</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                  >
                    <option value="Talaq & Khula">Talaq &amp; Khula</option>
                    <option value="Marriage & Nikah">Marriage &amp; Nikah</option>
                    <option value="Inheritance (Mirath)">Inheritance (Mirath)</option>
                    <option value="Parenting & Custody">Parenting &amp; Custody</option>
                    <option value="Financial Rights">Financial Rights</option>
                    <option value="Grief & Emotional Distress">Grief &amp; Distress</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Preferred School Context
                  </label>
                  <select
                    value={school}
                    onChange={(e) => setSchool(e.target.value as SchoolOfThought)}
                    className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                  >
                    <option value="Hanafi">Hanafi</option>
                    <option value="Maliki">Maliki</option>
                    <option value="Shafii">Shafii</option>
                    <option value="Hanbali">Hanbali</option>
                    <option value="Comparative Fiqh">Comparative Fiqh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Detailed Question *
                </label>
                <textarea
                  rows={4}
                  value={questionBody}
                  onChange={(e) => setQuestionBody(e.target.value)}
                  placeholder="Provide factual context clearly. Your real name remains hidden if Pseudonym Mode is enabled."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>Attach Supporting Document</span>
                  <input type="file" multiple onChange={handleFatwaAttach} className="hidden" />
                </label>
                {fatwaAttachments.length > 0 && (
                  <p className="mt-1.5 text-xs text-slate-600">
                    Attached: {fatwaAttachments.map((a) => a.name).join(', ')}
                  </p>
                )}
              </div>

              {fatwaError && <p className="text-xs font-semibold text-rose-700">{fatwaError}</p>}

              <p className="flex items-center gap-1.5 rounded-lg bg-[#ECFDF5] px-3 py-2 text-[11px] font-medium text-[#064E3B]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Your identity stays anonymous and your data secure.</span>
              </p>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={() => setAskFatwaModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#064E3B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#053B2D]"
                >
                  Submit to Scholarly Queue
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Member Registration / Account Switch / Password Reset Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[#064E3B]" />
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Member Account &amp; Recovery
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close account modal"
                onClick={() => setAuthModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex gap-1 rounded-lg bg-slate-100 p-1 text-xs font-semibold">
              {(
                [
                  ['login', 'Sign In'],
                  ['register', 'New Registration'],
                  ['reset', 'Password Reset'],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setAuthTab(tab);
                    setAuthError('');
                  }}
                  className={`flex-1 rounded-md py-1.5 transition-colors ${
                    authTab === tab ? 'bg-white text-[#064E3B] shadow-sm' : 'text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
              {authTab === 'login' && (
                <>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Email Address *"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password *"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                </>
              )}

              {authTab === 'register' && (
                <>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full Name *"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Email Address *"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create Password (min 6 chars) *"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Mobile Number (for optional OTP)"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                  <input
                    type="text"
                    value={regPseudonym}
                    onChange={(e) => setRegPseudonym(e.target.value)}
                    placeholder="Protected Pseudonym (e.g. Member S.K.)"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={regUsePseudonym}
                      onChange={(e) => setRegUsePseudonym(e.target.checked)}
                    />
                    <span>Protect identity using pseudonym by default</span>
                  </label>
                </>
              )}

              {authTab === 'reset' && (
                <>
                  <input
                    id="modal-reset-email"
                    name="resetEmail"
                    type="email"
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Registered Email Address *"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                  <input
                    id="modal-reset-new-password"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="New Password (min 6 chars) *"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                  <input
                    id="modal-reset-confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password *"
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                </>
              )}

              {authError && <p className="text-xs font-semibold text-rose-700">{authError}</p>}

              <button
                type="submit"
                className="w-full rounded-lg bg-[#064E3B] py-2.5 text-xs font-semibold text-white hover:bg-[#053B2D]"
              >
                {authTab === 'login'
                  ? 'Sign In to Portal'
                  : authTab === 'register'
                  ? 'Create & Verify Account'
                  : 'Reset Password'}
              </button>

              <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-medium text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#064E3B]" />
                <span>Your identity stays anonymous and your data secure.</span>
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
