import React, { useState } from 'react';
import { Member, ReferralApplication } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle, 
  Lock, 
  Users, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  members: Member[];
  referrals: ReferralApplication[];
  onSubmitReferral: (app: Omit<ReferralApplication, 'id' | 'status' | 'submittedAt'>) => void;
  onUpdateStatus: (id: string, status: 'approved' | 'declined') => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  language,
  members,
  referrals,
  onSubmitReferral,
  onUpdateStatus,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'apply' | 'review'>('apply');
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [referringMemberId, setReferringMemberId] = useState(members[0]?.id || 'eda-aydogan');
  const [reason, setReason] = useState('');
  const [favoriteBook, setFavoriteBook] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantEmail.trim() || !reason.trim()) return;

    const sponsor = members.find(m => m.id === referringMemberId);
    const sponsorName = sponsor ? sponsor.name : 'Eda Aydoğan';

    onSubmitReferral({
      applicantName: applicantName.trim(),
      applicantEmail: applicantEmail.trim(),
      referringMemberId,
      referringMemberName: sponsorName,
      reason: reason.trim(),
      favoriteBook: favoriteBook.trim() || 'Undisclosed',
    });

    // Send email dispatch to edaydogannn@gmail.com with subject: "referral submission for Books & Friends"
    const subject = encodeURIComponent("referral submission for Books & Friends");
    const body = encodeURIComponent(
      `New Referral & Newsletter Submission for Books & Friends:\n\n` +
      `Applicant Name: ${applicantName.trim()}\n` +
      `Email: ${applicantEmail.trim()}\n` +
      `Referring Sponsor: ${sponsorName}\n` +
      `Impactful Book: ${favoriteBook.trim()}\n` +
      `Literary Reason / Message:\n${reason.trim()}\n\n` +
      `Date: ${new Date().toLocaleString()}`
    );

    // Trigger background mailto link for client mail client compatibility
    try {
      const mailtoLink = `mailto:edaydogannn@gmail.com?subject=${subject}&body=${body}`;
      const link = document.createElement('a');
      link.href = mailtoLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      // Click safely
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Ignored if popup blocked
    }

    setIsSuccess(true);
    setApplicantName('');
    setApplicantEmail('');
    setReason('');
    setFavoriteBook('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FBFBFA]">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-700" />
            <span className="font-mono text-xs uppercase tracking-wider text-stone-700 font-semibold">
              Books & Friends · {language === 'en' ? 'Newsletter & Referral' : 'Bülten ve Referans'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-0.5 bg-stone-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('apply')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'apply' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {language === 'en' ? 'Subscribe' : 'Kayıt Ol'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('review')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'review' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {language === 'en' ? `Queue (${referrals.length})` : `Kuyruk (${referrals.length})`}
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {activeTab === 'apply' ? (
            <div>
              {/* Charter Statement */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 mb-6 text-xs text-stone-600 space-y-1.5">
                <div className="flex items-center gap-2 font-serif text-sm font-semibold text-stone-900">
                  <Lock className="w-4 h-4 text-stone-700" />
                  <span>Books & Friends · Newsletter & Referral Access</span>
                </div>
                <p className="leading-relaxed">
                  {t.modalNewsletterDesc}
                </p>
              </div>

              {isSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    {t.modalSuccessTitle}
                  </h3>
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 max-w-md mx-auto text-left space-y-1">
                    <p className="font-semibold">{t.modalSuccessDesc}</p>
                    <p className="text-[11px] text-emerald-700 font-mono">
                      Subject: referral submission for Books & Friends
                    </p>
                    <p className="text-[11px] text-emerald-700 font-mono">
                      Recipient: edaydogannn@gmail.com
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-4 px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      {t.modalSponsorLabel}
                    </label>
                    <select
                      value={referringMemberId}
                      onChange={(e) => setReferringMemberId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium focus:ring-1 focus:ring-stone-400"
                      required
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        {t.modalNameLabel}
                      </label>
                      <input
                        type="text"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="Full name"
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        {t.modalEmailLabel}
                      </label>
                      <input
                        type="email"
                        value={applicantEmail}
                        onChange={(e) => setApplicantEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      {t.modalFavoriteBookLabel}
                    </label>
                    <input
                      type="text"
                      value={favoriteBook}
                      onChange={(e) => setFavoriteBook(e.target.value)}
                      placeholder="Title and author..."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      {t.modalReasonLabel}
                    </label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Share your literary interests and what you look forward to..."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.modalSubmitBtn}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Review & Member Verification Queue */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Referral & Newsletter Dispatch Log
                </h3>
                <span className="text-xs text-stone-500 font-mono">
                  to edaydogannn@gmail.com
                </span>
              </div>

              {referrals.length === 0 ? (
                <p className="text-xs text-stone-500 py-8 text-center italic">
                  No submissions currently in queue.
                </p>
              ) : (
                referrals.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-stone-900 text-sm">
                          {app.applicantName}
                        </p>
                        <p className="text-stone-500 text-[11px] font-mono">
                          {app.applicantEmail} · {app.submittedAt}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] uppercase font-semibold ${
                        app.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : app.status === 'declined' 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-stone-200 text-stone-700">
                      <span className="font-semibold text-stone-900">Sponsor: </span>
                      <span>{app.referringMemberName}</span>
                      <p className="mt-1 text-stone-600">
                        <span className="font-medium text-stone-900">Key Book: </span>
                        {app.favoriteBook}
                      </p>
                      <p className="mt-1.5 text-stone-600 italic">
                        "{app.reason}"
                      </p>
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(app.id, 'approved')}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-medium transition-colors"
                        >
                          Approve Newsletter & Guest
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(app.id, 'declined')}
                          className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-md text-[11px] font-medium transition-colors"
                        >
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
