import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { Language } from '../translations';
import { getBookCover, getBookTitle, getBookMonth } from '../data/initialData';
import { Eye } from 'lucide-react';

interface TactileBookCoverProps {
  book: Book;
  onSelect: (book: Book) => void;
  size?: 'md' | 'lg';
  language?: Language;
}

export const TactileBookCover: React.FC<TactileBookCoverProps> = ({
  book,
  onSelect,
  size = 'md',
  language = 'en',
}) => {
  const isLarge = size === 'lg';
  const coverUrl = getBookCover(book, language);
  const title = getBookTitle(book, language);
  const month = getBookMonth(book, language);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [coverUrl]);

  return (
    <div className="group relative flex flex-col items-center">
      {/* 3D Book Container */}
      <div
        onClick={() => onSelect(book)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(book);
          }
        }}
        className={`relative cursor-pointer transition-all duration-300 ease-out select-none preserve-3d group-hover:-translate-y-2 group-hover:rotate-[-1deg] ${
          isLarge ? 'w-[220px] h-[320px]' : 'w-[180px] h-[260px]'
        }`}
      >
        {/* Book Spine Edge (left physical 3D book thickness) */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-[14px] -translate-x-[12px] skew-y-[12deg] rounded-l-[2px] opacity-90 shadow-inner"
          style={{
            backgroundColor: book.coverColor,
            filter: 'brightness(0.75)',
          }}
        />

        {/* Physical Paper Pages Edge (right side) */}
        <div className="absolute right-0 top-1 bottom-1 w-[8px] translate-x-[6px] -skew-y-[12deg] bg-[#F4EFE6] border-r border-stone-300 shadow-sm flex flex-col justify-between py-1">
          <div className="w-full h-full bg-[repeating-linear-gradient(to_bottom,#F4EFE6,#F4EFE6_2px,#E5DEC9_3px)]" />
        </div>

        {/* Front Cover Card - Clean Original Book Cover with Page Count on the div */}
        <div
          className="relative w-full h-full rounded-r-[6px] rounded-l-[3px] overflow-hidden shadow-md group-hover:shadow-2xl transition-shadow border-l border-white/20"
          style={{ backgroundColor: book.coverColor || '#292524' }}
        >
          {coverUrl && !imgFailed ? (
            <div className="relative w-full h-full">
              {/* Clean Original Book Cover (English or Turkish edition) */}
              <img
                src={coverUrl}
                alt={`${title} cover`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                onError={() => setImgFailed(true)}
              />

              {/* Page count badge on the div */}
              <div className="absolute bottom-2 right-2 z-10">
                <span className="font-mono text-[10px] text-white/95 bg-black/75 px-2 py-0.5 rounded shadow-sm backdrop-blur-xs border border-white/10 font-medium">
                  {book.pages} p.
                </span>
              </div>

              {/* Optional Month / Club Pick Pill */}
              {book.isBookOfMonth && (
                <div className="absolute top-2 left-2 z-10">
                  <span className="text-[9px] font-mono tracking-wider bg-amber-400 text-stone-900 px-1.5 py-0.5 rounded-xs font-bold shadow-xs">
                    {language === 'en' ? 'CLUB PICK' : 'GÜNCEL'}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div 
              className="p-4 sm:p-5 h-full flex flex-col justify-between relative text-white select-none"
              style={{ backgroundColor: book.coverColor }}
            >
              {/* Decorative Frame */}
              <div className="absolute inset-2 border border-white/20 rounded-sm pointer-events-none" />

              <div className="flex items-start justify-between text-[10px] font-mono opacity-80 uppercase tracking-widest z-10">
                <span>{month}</span>
                {book.isBookOfMonth && (
                  <span className="bg-amber-400 text-stone-950 font-bold px-1 rounded-xs text-[9px]">
                    ★
                  </span>
                )}
              </div>

              <div className="text-center my-auto px-2 z-10">
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/70 block mb-1">
                  {book.author}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight drop-shadow-sm line-clamp-3">
                  {title}
                </h3>
                {book.originalTitle && book.originalTitle !== title && (
                  <p className="text-[10px] text-white/60 italic mt-1 font-serif line-clamp-1">
                    {book.originalTitle}
                  </p>
                )}
              </div>

              {/* Page count on the div */}
              <div className="flex justify-between items-center pt-2 border-t border-white/20 z-10 text-[10px] font-mono text-white/80">
                <span className="truncate max-w-[90px]">{book.genre}</span>
                <span>{book.pages} {language === 'en' ? 'p.' : 's.'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Book Base Shadow */}
      <div className="w-36 h-3 bg-stone-900/15 rounded-full blur-[4px] mt-2 group-hover:scale-x-110 group-hover:opacity-60 transition-all duration-300" />

      {/* Book Title & Author under the cover */}
      <div className="mt-2.5 text-center max-w-[180px]">
        <h4 className="font-serif text-sm font-semibold text-stone-900 leading-tight line-clamp-1">
          {title}
        </h4>
        <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">
          {book.author}
        </p>
        <button
          type="button"
          onClick={() => onSelect(book)}
          className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-stone-950 transition-colors py-0.5 px-2 rounded hover:bg-stone-200/60 cursor-pointer"
        >
          <Eye className="w-3 h-3 text-stone-400" />
          <span>{language === 'en' ? 'Examine Book' : 'İncele'}</span>
        </button>
      </div>
    </div>
  );
};
