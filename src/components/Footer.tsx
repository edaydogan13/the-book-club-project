import React from 'react';
import { Language, TRANSLATIONS } from '../translations';

interface FooterProps {
  onNavigate: (view: 'home' | 'members' | 'book-of-month') => void;
  onOpenReferral: () => void;
  language?: Language;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  onOpenReferral,
  language = 'en',
}) => {
  const t = TRANSLATIONS[language];

  return (
    <footer className="border-t border-stone-200 bg-[#F7F5F0] text-stone-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="max-w-md space-y-2">
            <span className="font-serif text-2xl font-bold text-stone-900 tracking-tight block">
              Books & Friends
            </span>
            <p className="text-stone-600 leading-relaxed text-xs">
              {t.footerAbout}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-stone-900 font-bold">
              {language === 'en' ? 'Literary Navigation' : 'Site Haritası'}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t.navBookshelf}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('book-of-month')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t.navBookOfMonth}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('members')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t.navMembers}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenReferral}
                  className="hover:text-stone-900 transition-colors text-stone-800 font-medium cursor-pointer"
                >
                  {t.btnNewsletter}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400">
          <p>© {new Date().getFullYear()} Books & Friends. {language === 'en' ? 'Crafted for tactile literary contemplation.' : 'Dokunsal edebi derinlik için tasarlandı.'}</p>
          <p className="mt-2 sm:mt-0 font-mono">
            {language === 'en' ? 'Founded by Cemre Şirin · Curated by Eda Aydoğan' : 'Kurucu: Cemre Şirin · Küratör: Eda Aydoğan'}
          </p>
        </div>
      </div>
    </footer>
  );
};
