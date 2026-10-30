import React from 'react';
import { Member, AuthUser } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { Globe, Lock, ShieldCheck, UserCheck, User, CloudCheck, RefreshCw, AlertCircle } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'members' | 'book-of-month';
  onNavigate: (view: 'home' | 'members' | 'book-of-month') => void;
  onOpenNewsletter: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  currentUser: AuthUser | null;
  language: Language;
  onToggleLanguage: () => void;
  members: Member[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  brandName?: string;
  syncStatus?: 'synced' | 'syncing' | 'error';
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenNewsletter,
  onOpenAdmin,
  isAdmin,
  currentUser,
  language,
  onToggleLanguage,
  brandName,
  syncStatus = 'synced',
  onManualSync,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16 sm:h-20">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity cursor-pointer"
          >
            {brandName || t.brand}
          </button>

          {/* Zone 2: 3 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-stone-600">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                currentView === 'home' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
              }`}
            >
              {t.navBookshelf}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('book-of-month')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                currentView === 'book-of-month' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
              }`}
            >
              {t.navBookOfMonth}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('members')}
              className={`hover:text-stone-900 transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer ${
                currentView === 'members' ? 'text-stone-950 font-semibold border-b-2 border-stone-900' : ''
              }`}
            >
              {t.navMembers}
            </button>
          </nav>

          {/* Zone 3: Authentication, Language toggle & Primary Action */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Cloud Sync Status Indicator */}
            {syncStatus === 'syncing' ? (
              <div 
                className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-amber-800 bg-amber-50/80 rounded-lg border border-amber-200"
                title={language === 'en' ? 'Synchronizing with salon backend...' : 'Salon sunucusuyla eşitleniyor...'}
              >
                <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                <span className="hidden md:inline">{language === 'en' ? 'Saving...' : 'Kaydediliyor...'}</span>
              </div>
            ) : syncStatus === 'error' ? (
              <button 
                type="button"
                onClick={onManualSync}
                className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-[#BF360C] bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
                title={language === 'en' ? 'Sync error. Click to retry.' : 'Eşitleme hatası. Tekrar denemek için tıklayın.'}
              >
                <AlertCircle className="w-3 h-3 text-[#BF360C]" />
                <span className="hidden md:inline">{language === 'en' ? 'Retry' : 'Tekrar dene'}</span>
              </button>
            ) : (
              <button 
                type="button"
                onClick={onManualSync}
                className="hidden md:flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-stone-500 hover:text-stone-800 rounded-lg transition-colors cursor-pointer"
                title={language === 'en' ? 'Salon data synchronized across sessions. Click to check for updates.' : 'Salon verileri oturumlar arasında güncel. Yenilemek için tıklayın.'}
              >
                <CloudCheck className="w-3.5 h-3.5 text-stone-400" />
                <span className="text-[10px] uppercase tracking-wider">{language === 'en' ? 'Synced' : 'Eşit'}</span>
              </button>
            )}

            {/* User / Member / Admin Login Button */}
            <button
              type="button"
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border cursor-pointer ${
                currentUser?.role === 'admin' 
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-xs'
                  : currentUser?.role === 'member'
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300 shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
              }`}
              title={
                currentUser 
                  ? `${t.authLoggedInAs} ${currentUser.displayName} (${currentUser.role === 'admin' ? t.authAdminBadge : t.authMemberBadge})` 
                  : t.authLogin
              }
              aria-label={currentUser ? currentUser.displayName : t.authLogin}
            >
              {currentUser?.role === 'admin' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              ) : currentUser?.role === 'member' ? (
                currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                )
              ) : (
                <Lock className="w-3.5 h-3.5 text-stone-500" />
              )}
              <span className="font-mono text-[11px] hidden sm:inline max-w-[120px] truncate">
                {currentUser 
                  ? `${currentUser.displayName.split(' ')[0]} (${currentUser.role === 'admin' ? t.authAdminBadge : t.authMemberBadge})`
                  : t.authLogin}
              </span>
            </button>

            {/* TR / EN Language Toggle */}
            <button
              type="button"
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors border border-stone-200 cursor-pointer"
              title="Toggle TR / EN"
              aria-label="Toggle language between Turkish and English"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span className="font-mono">{language === 'en' ? 'TR' : 'EN'}</span>
            </button>

            {/* "Sign up for our newsletter" primary button */}
            <button
              type="button"
              onClick={onOpenNewsletter}
              className="px-3.5 sm:px-4 py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              {t.btnNewsletter}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
