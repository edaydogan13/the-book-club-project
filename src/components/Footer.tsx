import React from 'react';
import { PageView } from '../types';
import { Language, TRANSLATIONS } from '../translations';

interface FooterProps {
  onNavigate: (view: PageView) => void;
  onOpenReferral: () => void;
  language?: Language;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenReferral,
  language = 'en',
}) => {
  const t = TRANSLATIONS[language];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, view: PageView) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onNavigate(view);
  };

  return (
    <footer className="border-t border-stone-200 bg-[#F7F5F0] text-stone-600 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-6 max-w-md space-y-2.5">
            <span className="font-serif text-2xl font-bold text-stone-900 tracking-tight block">
              Books &amp; Friends
            </span>
            <p className="text-stone-600 leading-relaxed text-xs">
              {t.footerAbout}
            </p>
            <p className="text-xs text-stone-700 pt-1">
              <span className="font-mono uppercase text-[10px] tracking-wider text-stone-500 mr-2">
                {language === 'en' ? 'Contact:' : 'İletişim:'}
              </span>
              <a
                href="mailto:hello@booksnfriends.com"
                className="font-mono text-[#C45B38] hover:underline font-medium"
              >
                hello@booksnfriends.com
              </a>
            </p>
          </div>

          <div className="md:col-span-3 space-y-2">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-stone-900 font-bold">
              {language === 'en' ? 'Literary Navigation' : 'Site Haritası'}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="/"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t.navBookshelf}
                </a>
              </li>
              <li>
                <a
                  href="/book-of-month"
                  onClick={(e) => handleNavClick(e, 'book-of-month')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t.navBookOfMonth}
                </a>
              </li>
              <li>
                <a
                  href="/members"
                  onClick={(e) => handleNavClick(e, 'members')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {t.navMembers}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenReferral}
                  className="hover:text-stone-900 transition-colors text-stone-800 font-medium cursor-pointer text-left"
                >
                  {t.btnNewsletter}
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-stone-900 font-bold">
              {language === 'en' ? 'Club & Legal' : 'Kulüp ve Yasal'}
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="/about"
                  onClick={(e) => handleNavClick(e, 'about')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'About Us' : 'Hakkımızda'}
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Contact' : 'İletişim'}
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => handleNavClick(e, 'terms')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Terms of Use' : 'Kullanım Koşulları'}
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={(e) => handleNavClick(e, 'privacy')}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Privacy Policy' : 'Gizlilik Politikası'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400">
          <p>© {new Date().getFullYear()} Books &amp; Friends. {language === 'en' ? 'Crafted for tactile literary contemplation.' : 'Dokunsal edebi derinlik için tasarlandı.'}</p>
          <p className="mt-2 sm:mt-0 font-mono">
            {language === 'en' ? 'Founded by Cemre Şirin · Curated by Eda Aydoğan' : 'Kurucu: Cemre Şirin · Küratör: Eda Aydoğan'}
          </p>
        </div>
      </div>
    </footer>
  );
};
