import React from 'react';
import { ShieldCheck, Type, BookPlus, Users, Mail, LogOut, Sparkles } from 'lucide-react';
import { Language, TRANSLATIONS } from '../translations';

interface AdminFloatingBarProps {
  isAdmin: boolean;
  onOpenEditSite: () => void;
  onOpenAddBook: () => void;
  onOpenAddMember: () => void;
  onOpenReferrals: () => void;
  onSignOut: () => void;
  language: Language;
}

export const AdminFloatingBar: React.FC<AdminFloatingBarProps> = ({
  isAdmin,
  onOpenEditSite,
  onOpenAddBook,
  onOpenAddMember,
  onOpenReferrals,
  onSignOut,
  language,
}) => {
  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] sm:max-w-2xl w-full px-2 pointer-events-auto">
      <div className="bg-stone-900/95 text-white backdrop-blur-md px-3 sm:px-4 py-2.5 rounded-2xl shadow-2xl border border-stone-700/80 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        {/* Status indicator */}
        <div className="flex items-center gap-2 pr-2 border-r border-stone-700 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] font-semibold text-amber-300 whitespace-nowrap">
            {language === 'en' ? 'Admin: Eda Aydoğan' : 'Yönetici: Eda Aydoğan'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenEditSite}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors border border-stone-700/80 cursor-pointer"
            title={language === 'en' ? 'Edit Website Content, Hero & Stats' : 'Site Metinleri ve İstatistikleri Düzenle'}
          >
            <Type className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{language === 'en' ? 'Edit Site Content' : 'Siteyi Düzenle'}</span>
            <span className="sm:hidden">{language === 'en' ? 'Site' : 'Site'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddBook}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors border border-stone-700/80 cursor-pointer"
            title={language === 'en' ? 'Add or Edit Books' : 'Kitap Ekle veya Düzenle'}
          >
            <BookPlus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{language === 'en' ? '+ Add Book' : '+ Kitap Ekle'}</span>
            <span className="sm:hidden">{language === 'en' ? '+ Book' : '+ Kitap'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddMember}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors border border-stone-700/80 cursor-pointer"
            title={language === 'en' ? 'Add or Edit Members' : 'Üye Ekle veya Düzenle'}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{language === 'en' ? '+ Add Member' : '+ Üye Ekle'}</span>
            <span className="sm:hidden">{language === 'en' ? '+ Member' : '+ Üye'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenReferrals}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors border border-stone-700/80 cursor-pointer"
            title={language === 'en' ? 'Review Referrals' : 'Başvuruları Gör'}
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{language === 'en' ? 'Referrals' : 'Başvurular'}</span>
          </button>
        </div>

        {/* Exit Admin */}
        <button
          type="button"
          onClick={onSignOut}
          className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors shrink-0 ml-1 cursor-pointer"
          title={language === 'en' ? 'Exit Admin Mode' : 'Yönetici Modundan Çık'}
          aria-label="Exit Admin Mode"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
