import React, { useState } from 'react';
import { Member, ReferralApplication, AuthUser } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle, 
  Lock, 
  Users, 
  Sparkles,
  BookOpen,
  Filter,
  ShieldCheck,
  Check,
  Archive,
  UserPlus,
  Compass
} from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  members: Member[];
  referrals: ReferralApplication[];
  onSubmitReferral: (app: Omit<ReferralApplication, 'id' | 'status' | 'submittedAt'>) => void;
  onUpdateStatus: (id: string, status: 'approved' | 'declined') => void;
  currentUser?: AuthUser | null;
  isAdmin?: boolean;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  language,
  members,
  referrals,
  onSubmitReferral,
  onUpdateStatus,
  currentUser = null,
  isAdmin = false,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const isLoggedIn = Boolean(currentUser);

  // Tabs: 'newsletter' | 'referral' | 'queue'
  const [activeTab, setActiveTab] = useState<'newsletter' | 'referral' | 'queue'>('newsletter');
  
  // Newsletter form state
  const [nlName, setNlName] = useState('');
  const [nlEmail, setNlEmail] = useState('');
  const [nlInterests, setNlInterests] = useState('');
  const [nlSuccess, setNlSuccess] = useState(false);

  // Referral form state
  const [refName, setRefName] = useState('');
  const [refEmail, setRefEmail] = useState('');
  const [referringMemberId, setReferringMemberId] = useState(members[0]?.id || 'eda-aydogan');
  const [refFavoriteBook, setRefFavoriteBook] = useState('');
  const [refReason, setRefReason] = useState('');
  const [refSuccess, setRefSuccess] = useState(false);

  // Queue filter state
  const [queueFilter, setQueueFilter] = useState<'all' | 'newsletter' | 'referral'>('all');

  // Handle Newsletter Submission
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlName.trim() || !nlEmail.trim()) return;

    onSubmitReferral({
      applicantName: nlName.trim(),
      applicantEmail: nlEmail.trim(),
      referringMemberId: 'newsletter',
      referringMemberName: 'Books & Friends Salon',
      reason: nlInterests.trim() ? `Literary Interests: ${nlInterests.trim()}` : 'Monthly Salon Newsletter & Reading Guides',
      favoriteBook: nlInterests.trim() || 'Salon Dispatch',
      submissionType: 'newsletter',
    });

    // Send email dispatch to edaydogannn@gmail.com with subject: "newsletter submission for Books & Friends"
    const subject = encodeURIComponent("newsletter submission for Books & Friends");
    const body = encodeURIComponent(
      `New Newsletter Subscriber for Books & Friends:\n\n` +
      `Name: ${nlName.trim()}\n` +
      `Email: ${nlEmail.trim()}\n` +
      `Literary Focus / Interests: ${nlInterests.trim() || 'General Salon Dispatch'}\n` +
      `Date: ${new Date().toLocaleString()}`
    );

    try {
      const mailtoLink = `mailto:edaydogannn@gmail.com?subject=${subject}&body=${body}`;
      const link = document.createElement('a');
      link.href = mailtoLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Background link
    }

    setNlSuccess(true);
    setNlName('');
    setNlEmail('');
    setNlInterests('');
  };

  // Handle Joining / Referral Submission
  const handleReferralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refName.trim() || !refEmail.trim() || !refReason.trim()) return;

    const sponsor = members.find(m => m.id === referringMemberId);
    const sponsorName = sponsor ? sponsor.name : 'Eda Aydoğan';

    onSubmitReferral({
      applicantName: refName.trim(),
      applicantEmail: refEmail.trim(),
      referringMemberId,
      referringMemberName: sponsorName,
      favoriteBook: refFavoriteBook.trim() || 'Undisclosed',
      reason: refReason.trim(),
      submissionType: 'referral',
    });

    // Send email dispatch to edaydogannn@gmail.com with subject: "referral submission for Books & Friends"
    const subject = encodeURIComponent("referral submission for Books & Friends");
    const body = encodeURIComponent(
      `New Membership Referral Application for Books & Friends:\n\n` +
      `Applicant Name: ${refName.trim()}\n` +
      `Email: ${refEmail.trim()}\n` +
      `Referring Member Sponsor: ${sponsorName}\n` +
      `Impactful / Key Book: ${refFavoriteBook.trim()}\n` +
      `Statement & Interests:\n${refReason.trim()}\n\n` +
      `Date: ${new Date().toLocaleString()}`
    );

    try {
      const mailtoLink = `mailto:edaydogannn@gmail.com?subject=${subject}&body=${body}`;
      const link = document.createElement('a');
      link.href = mailtoLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Background link
    }

    setRefSuccess(true);
    setRefName('');
    setRefEmail('');
    setRefFavoriteBook('');
    setRefReason('');
  };

  // Filtered queue items
  const filteredReferrals = referrals.filter(app => {
    if (queueFilter === 'newsletter') {
      return app.submissionType === 'newsletter' || app.referringMemberId === 'newsletter';
    }
    if (queueFilter === 'referral') {
      return app.submissionType === 'referral' || app.referringMemberId !== 'newsletter';
    }
    return true;
  });

  const newsletterSubmissionsCount = referrals.filter(
    app => app.submissionType === 'newsletter' || app.referringMemberId === 'newsletter'
  ).length;
  const referralSubmissionsCount = referrals.filter(
    app => app.submissionType === 'referral' || (app.referringMemberId && app.referringMemberId !== 'newsletter')
  ).length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-stone-200 bg-[#FBFBFA]">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#C45B38]" />
            <span className="font-mono text-xs uppercase tracking-wider text-stone-700 font-semibold">
              Books & Friends · {language === 'en' ? 'Salon Dispatch & Access' : 'Bülten ve Katılım'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs: 2 separate public sections + Queue ONLY for logged-in users */}
        <div className="px-5 sm:px-6 pt-3 pb-2 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl text-xs w-full sm:w-auto">
            {/* Section 1: Newsletter */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('newsletter');
                setNlSuccess(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'newsletter'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#C45B38]" />
              <span>{language === 'en' ? 'Newsletter' : 'Bülten Aboneliği'}</span>
            </button>

            {/* Section 2: Joining / Referral */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('referral');
                setRefSuccess(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'referral'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-700" />
              <span>{language === 'en' ? 'Join / Referral' : 'Kulübe Katıl / Referans'}</span>
            </button>

            {/* Section 3: Queue - ONLY FOR LOGGED-IN USERS */}
            {isLoggedIn && (
              <button
                type="button"
                onClick={() => setActiveTab('queue')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'queue'
                    ? 'bg-stone-900 text-white shadow-xs font-semibold'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200'
                }`}
                title={language === 'en' ? 'Review Submission Queue (Logged-in only)' : 'Başvuru Kuyruğu (Yalnızca giriş yapanlar)'}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'en' ? 'Review Queue' : 'Başvuru Kuyruğu'}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'queue' ? 'bg-white/20 text-white' : 'bg-stone-300 text-stone-800'
                }`}>
                  {referrals.length}
                </span>
              </button>
            )}
          </div>

          {/* Quick Indicator if logged-in */}
          {isLoggedIn && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-stone-500 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>{currentUser?.displayName?.split(' ')[0]} ({currentUser?.role})</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {/* ========================================================= */}
          {/* SECTION 1: NEWSLETTER SUBMISSION                          */}
          {/* ========================================================= */}
          {activeTab === 'newsletter' && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs text-stone-700 space-y-1.5">
                <div className="flex items-center gap-2 font-serif text-sm font-semibold text-stone-900">
                  <BookOpen className="w-4 h-4 text-[#C45B38]" />
                  <span>{language === 'en' ? 'The Salon Dispatch — Curated Monthly Notes' : 'Salon Bülteni — Aylık Edebi Notlar'}</span>
                </div>
                <p className="leading-relaxed text-stone-600">
                  {language === 'en'
                    ? 'Subscribe to receive our monthly reading reflections, essay recommendations, private discussion summaries, and curated book releases directly in your inbox.'
                    : 'Aylık okuma notlarımızı, kulüp içi deneme önerilerimizi ve seçilmiş yeni baskı tavsiyelerini doğrudan e-postanızda almak için bültenimize kaydolun.'}
                </p>
              </div>

              {nlSuccess ? (
                <div className="py-8 text-center space-y-3.5 animate-in fade-in duration-200">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    {language === 'en' ? 'Subscribed to Salon Dispatch!' : 'Bültene Başarıyla Abone Olundu!'}
                  </h3>
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 max-w-md mx-auto text-left space-y-1">
                    <p className="font-semibold">
                      {language === 'en' 
                        ? 'Thank you! You will receive our monthly dispatch and curatorial reading guides.' 
                        : 'Teşekkürler! Aylık bültenimiz ve seçilmiş okuma rehberlerimiz e-postanıza iletilecektir.'}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-mono">
                      Subject: newsletter submission for Books & Friends
                    </p>
                    <p className="text-[11px] text-emerald-700 font-mono">
                      Recipient: edaydogannn@gmail.com
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNlSuccess(false)}
                      className="px-4 py-2 text-xs font-semibold bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 cursor-pointer"
                    >
                      {language === 'en' ? 'Subscribe another email' : 'Farklı bir e-posta kaydet'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 cursor-pointer"
                    >
                      {language === 'en' ? 'Close' : 'Kapat'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1">
                        {language === 'en' ? 'Your Name *' : 'Adınız Soyadınız *'}
                      </label>
                      <input
                        type="text"
                        value={nlName}
                        onChange={(e) => setNlName(e.target.value)}
                        placeholder={language === 'en' ? 'e.g. Leyla Erbil' : 'Örn. Leyla Erbil'}
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1">
                        {language === 'en' ? 'Email Address *' : 'E-posta Adresiniz *'}
                      </label>
                      <input
                        type="email"
                        value={nlEmail}
                        onChange={(e) => setNlEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      {language === 'en' ? 'Reading Interests & Focus (Optional)' : 'İlgi Alanları & Tercih Edilen Türler (İsteğe bağlı)'}
                    </label>
                    <input
                      type="text"
                      value={nlInterests}
                      onChange={(e) => setNlInterests(e.target.value)}
                      placeholder={language === 'en' ? 'e.g. Philosophy, Modern Classics, Existentialism...' : 'Örn. Felsefe, Modern Klasikler, Varoluşçuluk...'}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      {language === 'en' 
                        ? 'We tailor our monthly book picks to match reader interests.' 
                        : 'Aylık kitap önerilerimizi okur ilgi alanlarına göre şekillendiriyoruz.'}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#C45B38] hover:bg-[#a94827] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Subscribe to Salon Dispatch' : 'Bültene Abone Ol'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 2: JOINING / REFERRAL SUBMISSION                  */}
          {/* ========================================================= */}
          {activeTab === 'referral' && (
            <div className="space-y-5">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1.5">
                <div className="flex items-center gap-2 font-serif text-sm font-semibold text-stone-900">
                  <Lock className="w-4 h-4 text-stone-700" />
                  <span>{language === 'en' ? 'Books & Friends · Member Referral & Salon Access' : 'Books & Friends · Üye Referansı ve Kulüp Başvurusu'}</span>
                </div>
                <p className="leading-relaxed">
                  {t.modalNewsletterDesc}
                </p>
              </div>

              {refSuccess ? (
                <div className="py-8 text-center space-y-3.5 animate-in fade-in duration-200">
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
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRefSuccess(false)}
                      className="px-4 py-2 text-xs font-semibold bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 cursor-pointer"
                    >
                      {language === 'en' ? 'Submit another application' : 'Başka bir başvuru gönder'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 cursor-pointer"
                    >
                      {language === 'en' ? 'Done' : 'Tamamla'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReferralSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      {t.modalSponsorLabel}
                    </label>
                    <select
                      value={referringMemberId}
                      onChange={(e) => setReferringMemberId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium focus:outline-none focus:border-[#C45B38] cursor-pointer"
                      required
                    >
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1">
                        {t.modalNameLabel}
                      </label>
                      <input
                        type="text"
                        value={refName}
                        onChange={(e) => setRefName(e.target.value)}
                        placeholder="Full name"
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-800 mb-1">
                        {t.modalEmailLabel}
                      </label>
                      <input
                        type="email"
                        value={refEmail}
                        onChange={(e) => setRefEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      {t.modalFavoriteBookLabel}
                    </label>
                    <input
                      type="text"
                      value={refFavoriteBook}
                      onChange={(e) => setRefFavoriteBook(e.target.value)}
                      placeholder="Title and author..."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-800 mb-1">
                      {t.modalReasonLabel}
                    </label>
                    <textarea
                      rows={3}
                      value={refReason}
                      onChange={(e) => setRefReason(e.target.value)}
                      placeholder="Share your literary interests and what you look forward to in the salon..."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.modalSubmitBtn}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 3: REVIEW QUEUE (LOGGED-IN USERS ONLY)            */}
          {/* ========================================================= */}
          {activeTab === 'queue' && isLoggedIn && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>{language === 'en' ? 'Submission & Referral Queue' : 'Başvuru ve Bülten Kuyruğu'}</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    {language === 'en' ? 'Managed by club members & curators' : 'Kulüp üyeleri ve yöneticiler tarafından incelenir'}
                  </p>
                </div>

                {/* Queue Filter Tabs */}
                <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setQueueFilter('all')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      queueFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {language === 'en' ? 'All' : 'Tümü'} ({referrals.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQueueFilter('newsletter')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      queueFilter === 'newsletter' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {language === 'en' ? 'Newsletters' : 'Bülten'} ({newsletterSubmissionsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setQueueFilter('referral')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      queueFilter === 'referral' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {language === 'en' ? 'Referrals' : 'Referans'} ({referralSubmissionsCount})
                  </button>
                </div>
              </div>

              {filteredReferrals.length === 0 ? (
                <div className="py-12 text-center text-stone-500 space-y-2">
                  <p className="text-xs italic">
                    {language === 'en' ? 'No submissions currently in this queue view.' : 'Bu görünümde bekleyen başvuru bulunmamaktadır.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReferrals.map((app) => {
                    const isNewsletter = app.submissionType === 'newsletter' || app.referringMemberId === 'newsletter';
                    return (
                      <div
                        key={app.id}
                        className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2.5 transition-all hover:border-stone-300"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-stone-900 text-sm">
                                {app.applicantName}
                              </p>
                              {/* Type Badge */}
                              <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] uppercase font-bold tracking-wider ${
                                isNewsletter 
                                  ? 'bg-blue-100 text-blue-900 border border-blue-200' 
                                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                              }`}>
                                {isNewsletter 
                                  ? (language === 'en' ? 'Newsletter Subscriber' : 'Bülten Abonesi') 
                                  : (language === 'en' ? 'Salon Referral' : 'Kulüp Referansı')}
                              </span>
                            </div>
                            <p className="text-stone-500 text-[11px] font-mono mt-0.5">
                              {app.applicantEmail} · {app.submittedAt}
                            </p>
                          </div>

                          <span className={`px-2.5 py-1 rounded-md font-mono text-[10px] uppercase font-semibold shrink-0 ${
                            app.status === 'approved' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : app.status === 'declined' 
                              ? 'bg-rose-100 text-rose-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        {/* Submission Details */}
                        <div className="p-3 bg-white rounded-xl border border-stone-200 text-stone-700 space-y-1">
                          {!isNewsletter && (
                            <>
                              <p className="text-stone-800">
                                <span className="font-semibold text-stone-900">{language === 'en' ? 'Sponsoring Member:' : 'Referans Üye:'} </span>
                                <span>{app.referringMemberName}</span>
                              </p>
                              <p className="text-stone-800">
                                <span className="font-medium text-stone-900">{language === 'en' ? 'Shift Book:' : 'Önemli Kitap:'} </span>
                                <span className="italic">{app.favoriteBook}</span>
                              </p>
                            </>
                          )}
                          <p className="text-stone-600 italic">
                            "{app.reason}"
                          </p>
                        </div>

                        {/* Action Buttons for Logged-In Users */}
                        {app.status === 'pending' && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(app.id, 'approved')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-medium transition-colors cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isNewsletter ? (language === 'en' ? 'Approve Subscription' : 'Aboneliği Onayla') : (language === 'en' ? 'Approve Referral' : 'Referansı Onayla')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(app.id, 'declined')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                              <span>{language === 'en' ? 'Archive' : 'Arşivle'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
