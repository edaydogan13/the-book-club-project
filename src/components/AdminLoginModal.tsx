import React, { useState } from 'react';
import { Language, TRANSLATIONS } from '../translations';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CheckCircle, 
  LogOut, 
  Users, 
  BookOpen, 
  Mail, 
  Sparkles,
  ArrowRight,
  Edit3,
  Plus
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  isAdmin: boolean;
  onSetIsAdmin: (status: boolean) => void;
  onNavigate: (view: 'home' | 'members' | 'book-of-month') => void;
  onOpenReferrals?: () => void;
  onOpenEditSite?: () => void;
  onOpenAddBook?: () => void;
  onOpenAddMember?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  language,
  isAdmin,
  onSetIsAdmin,
  onNavigate,
  onOpenReferrals,
  onOpenEditSite,
  onOpenAddBook,
  onOpenAddMember,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSetIsAdmin(true);
    setSuccessNotice(true);
    setErrorMsg('');
    setTimeout(() => {
      setSuccessNotice(false);
    }, 2000);
  };

  const handleLogout = () => {
    onSetIsAdmin(false);
    setPassword('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#FBFBFA] rounded-2xl border border-stone-300 shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
          aria-label={t.modalClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-200">
            <Lock className="w-5 h-5 text-[#C45B38]" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
              {t.adminLoginTitle}
            </h3>
            <p className="text-[11px] font-mono text-[#C45B38] font-semibold mt-0.5">
              {isAdmin ? t.adminActive : t.adminPassHint}
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed mb-6">
          {t.adminLoginDesc}
        </p>

        {isAdmin ? (
          /* Logged In State with Admin Controls */
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-emerald-900">
                  {language === 'en' ? 'Authenticated as Eda Aydoğan' : 'Eda Aydoğan olarak yetkilendirildi'}
                </p>
                <p className="text-emerald-700 mt-1 leading-relaxed">
                  {t.adminEditMembersDesc}
                </p>
              </div>
            </div>

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
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-semibold transition-colors border border-amber-300"
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
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium transition-colors border border-stone-200"
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
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium transition-colors border border-stone-200"
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
                className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium transition-colors border border-stone-200"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-stone-600" />
                  <span>{language === 'en' ? 'Edit Member Profiles & Shelves' : 'Üye Profillerini ve Rafları Düzenle'}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-stone-400" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigate('book-of-month');
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium transition-colors border border-stone-200"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-stone-600" />
                  <span>{language === 'en' ? 'Manage Book of the Month & Video' : 'Ayın Kitabını ve Videoyu Yönet'}</span>
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
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium transition-colors border border-stone-200"
                >
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-stone-600" />
                    <span>{language === 'en' ? 'Review Referral Submissions' : 'Referans Başvurularını İncele'}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </button>
              )}
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
              <span className="text-[11px] text-stone-400 font-mono">
                Admin: edaydogannn@gmail.com
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.adminSignOut}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In Form */
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Quick 1-Click Authentication Button for Curator */}
            <button
              type="button"
              onClick={() => handleLogin()}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>{t.adminSignInAs}</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-3 text-[11px] text-stone-400 font-mono uppercase">
                {language === 'en' ? 'or enter passcode' : 'veya şifreyle'}
              </span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-stone-600 font-semibold mb-1">
                {t.adminPasswordLabel}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-medium transition-colors"
            >
              {t.adminEnterBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
