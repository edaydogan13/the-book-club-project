import React, { useState } from 'react';
import { AuthUser } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { MEMBER_CREDENTIALS } from '../data/initialData';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  CheckCircle, 
  LogOut, 
  Users, 
  BookOpen, 
  Mail, 
  ArrowRight,
  Edit3,
  Plus,
  KeyRound
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
  onNavigate: (view: 'home' | 'members' | 'book-of-month') => void;
  onOpenReferrals?: () => void;
  onOpenEditSite?: () => void;
  onOpenAddBook?: () => void;
  onOpenAddMember?: () => void;
  onSelectMember?: (memberId: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  currentUser,
  onLogin,
  onLogout,
  onNavigate,
  onOpenReferrals,
  onOpenEditSite,
  onOpenAddBook,
  onOpenAddMember,
  onSelectMember,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const performLogin = (username: string, pass: string) => {
    setErrorMsg('');
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = pass.trim();

    const matchedCred = MEMBER_CREDENTIALS.find(
      c => c.username.toLowerCase() === cleanUser && c.password === cleanPass
    );

    if (matchedCred) {
      const userObj: AuthUser = {
        id: matchedCred.role === 'admin' ? 'admin' : (matchedCred.memberId || matchedCred.username),
        username: matchedCred.username,
        role: matchedCred.role,
        memberId: matchedCred.memberId,
        displayName: matchedCred.displayName,
        avatarUrl: matchedCred.avatarUrl,
      };

      onLogin(userObj);
      setSuccessNotice(`${userObj.displayName} (${matchedCred.role === 'admin' ? 'Admin' : 'Member'})`);
      setUsernameInput('');
      setPasswordInput('');

      setTimeout(() => {
        setSuccessNotice(null);
      }, 2500);
    } else {
      setErrorMsg(t.authInvalidCredentials);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setErrorMsg(language === 'en' ? 'Please enter a username.' : 'Lütfen kullanıcı adı girin.');
      return;
    }
    performLogin(usernameInput, passwordInput);
  };


  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#FBFBFA] rounded-2xl border border-stone-300 shadow-2xl p-6 sm:p-8 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label={t.modalClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${
            currentUser?.role === 'admin' 
              ? 'bg-amber-100 text-amber-900 border-amber-300' 
              : currentUser?.role === 'member'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : 'bg-stone-100 text-stone-800 border-stone-300'
          }`}>
            {currentUser?.role === 'admin' ? (
              <ShieldCheck className="w-6 h-6 text-[#C45B38]" />
            ) : currentUser?.role === 'member' ? (
              <UserCheck className="w-6 h-6 text-emerald-700" />
            ) : (
              <KeyRound className="w-5 h-5 text-stone-700" />
            )}
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              {t.adminLoginTitle}
            </h3>
            <p className="text-[11px] font-mono text-stone-500 font-medium mt-0.5">
              {currentUser 
                ? `${t.authLoggedInAs} ${currentUser.displayName} (${currentUser.role === 'admin' ? t.authAdminBadge : t.authMemberBadge})` 
                : (language === 'en' ? 'Sign in to edit your profile & shelves' : 'Profilinizi ve kitaplığınızı düzenlemek için giriş yapın')}
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">
              {language === 'en' ? `Welcome back, ${successNotice}!` : `Hoş geldiniz, ${successNotice}!`}
            </span>
          </div>
        )}

        {currentUser ? (
          /* ACTIVE SESSION VIEW */
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              currentUser.role === 'admin' 
                ? 'bg-amber-50/80 border-amber-200 text-amber-950' 
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}>
              {currentUser.avatarUrl ? (
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.displayName} 
                  className="w-12 h-12 rounded-xl object-cover border border-black/10 shrink-0 shadow-xs" 
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-stone-200 flex items-center justify-center font-bold text-stone-700 shrink-0">
                  {currentUser.displayName.charAt(0)}
                </div>
              )}
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-stone-900">
                    {currentUser.displayName}
                  </p>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold border ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}>
                    {currentUser.role === 'admin' ? t.authAdminBadge : t.authMemberBadge}
                  </span>
                </div>
                <p className="text-stone-600 mt-1 leading-relaxed">
                  {currentUser.role === 'admin' 
                    ? (language === 'en' 
                        ? 'Full administrative control: You can edit any part of the website, modify any member profile, add new books, and approve referrals.' 
                        : 'Tam yönetici yetkisi: Sitedeki tüm metinleri, tüm üye profillerini, rafları ve başvuruları düzenleyebilirsiniz.')
                    : (language === 'en'
                        ? `Logged in as ${currentUser.displayName}. You have permissions to edit your personal profile (photo, bio, quote, goals), your personal reading shelf, and post reflections under your name.`
                        : `${currentUser.displayName} olarak giriş yapıldı. Kendi profilinizi (fotoğraf, biyografi, alıntı), kendi rafınızı ve yorumlarınızı düzenleme yetkiniz var.`)}
                </p>
              </div>
            </div>

            {/* Direct Navigation Links for Member */}
            {currentUser.role === 'member' && currentUser.memberId && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectMember && currentUser.memberId) {
                      onSelectMember(currentUser.memberId);
                    }
                    onNavigate('members');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>
                      {language === 'en' ? `Go to My Profile & Personal Shelf (${currentUser.displayName})` : `Profilime ve Kitaplığıma Git (${currentUser.displayName})`}
                    </span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Admin Controls Area */}
            {currentUser.role === 'admin' && (
              <div className="pt-2 space-y-2">
                <p className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-bold">
                  {t.adminQuickActions}
                </p>

                {onOpenEditSite && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEditSite();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-semibold transition-colors border border-amber-300 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#C45B38]" />
                      <span>{language === 'en' ? 'Edit Website Content, Hero & Stats' : 'Site Metinleri, Giriş ve İstatistikleri Düzenle'}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-600" />
                  </button>
                )}

                {onOpenAddBook && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddBook();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium transition-colors border border-stone-200 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-stone-600" />
                      <span>{language === 'en' ? 'Add New Book to Club Shelf' : 'Kulüp Rafına Yeni Kitap Ekle'}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </button>
                )}

                {onOpenAddMember && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddMember();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium transition-colors border border-stone-200 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-stone-600" />
                      <span>{language === 'en' ? 'Add New Club Member' : 'Yeni Kulüp Üyesi Ekle'}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('members');
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium transition-colors border border-stone-200 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-stone-600" />
                    <span>{language === 'en' ? 'Edit Any Member Profile & Shelf' : 'Tüm Üye Profillerini ve Raflarını Düzenle'}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </button>

                {onOpenReferrals && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenReferrals();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium transition-colors border border-stone-200 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-stone-600" />
                      <span>{language === 'en' ? 'Review Referral Submissions' : 'Referans Başvurularını İncele'}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </button>
                )}
              </div>
            )}

            {/* Footer with Sign Out and Switch account */}
            <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
              <span className="text-[11px] text-stone-500 font-mono">
                {currentUser.username}
              </span>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  setSuccessNotice(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.authSignOut}</span>
              </button>
            </div>
          </div>
        ) : (
          /* LOGIN FORM VIEW */
          <div className="space-y-5">
            <p className="text-xs text-stone-600 leading-relaxed">
              {t.adminLoginDesc}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 font-semibold mb-1">
                  {t.authUsername}
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 font-semibold mb-1">
                  {t.authPassword}
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-medium">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.authSignInBtn}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
