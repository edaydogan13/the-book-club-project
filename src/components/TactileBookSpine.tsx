import React, { useState } from 'react';
import { Book } from '../types';
import { Language } from '../translations';
import { getBookTitle, getBookMonth } from '../data/initialData';
import { Sparkles, ExternalLink, Bookmark, Trash2 } from 'lucide-react';

interface TactileBookSpineProps {
  book: Book;
  onSelect: (book: Book) => void;
  isSelected?: boolean;
  language?: Language;
  onRemove?: (bookId: string, e: React.MouseEvent) => void;
  isRemoveMode?: boolean;
}

export const TactileBookSpine: React.FC<TactileBookSpineProps> = ({
  book,
  onSelect,
  isSelected = false,
  language = 'en',
  onRemove,
  isRemoveMode = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const title = getBookTitle(book, language);
  const month = getBookMonth(book, language);

  // Dynamic spine width based on page count (tactile physical feel)
  const calculateSpineWidth = (pages: number) => {
    if (pages < 150) return 'w-[36px] sm:w-[42px]';
    if (pages < 250) return 'w-[42px] sm:w-[50px]';
    if (pages < 400) return 'w-[48px] sm:w-[58px]';
    return 'w-[54px] sm:w-[66px]';
  };

  // Subtle height variation for organic bookstore shelf aesthetic
  const calculateHeight = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variations = [
      'h-[260px] sm:h-[300px]',
      'h-[275px] sm:h-[315px]',
      'h-[290px] sm:h-[330px]',
      'h-[270px] sm:h-[308px]'
    ];
    return variations[hash % variations.length];
  };

  return (
    <div className="relative group shrink-0 flex flex-col items-center">
      {/* Floating Hover Tooltip Card (Bookstore browsing info) */}
      <div
        className={`absolute -top-36 left-1/2 -translate-x-1/2 z-40 w-56 p-3.5 bg-stone-900/95 text-stone-100 rounded-xl shadow-xl backdrop-blur-md transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
        }`}
      >
        <div className="text-[11px] font-mono text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
          <span>{month}</span>
          <span>{book.pages} p.</span>
        </div>
        <p className="font-serif text-sm font-semibold text-white leading-tight line-clamp-1">
          {title}
        </p>
        <p className="text-xs text-stone-300 mt-0.5 line-clamp-1">{book.author}</p>
        <div className="mt-2 pt-2 border-t border-stone-700/80 flex items-center justify-between text-[11px] text-stone-400">
          <span>
            {book.isPersonalExtra ? (
              <span className="text-amber-300 font-medium">
                ★ {language === 'en' ? 'Personal Read (Nov 2025+)' : 'Kişisel Okuma (Kas 2025+)'}
              </span>
            ) : (
              <>
                {language === 'en' ? 'Curated by' : 'Öneren:'} <strong className="text-stone-200">{book.suggesterName.split(' ')[0]}</strong>
              </>
            )}
          </span>
          <span className="text-amber-400">★ {book.rating}</span>
        </div>

        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(book.id, e);
            }}
            className="mt-2.5 w-full py-1.5 px-2 bg-rose-950/80 hover:bg-rose-700 text-rose-200 hover:text-white rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-800/60 shadow-xs"
          >
            <Trash2 className="w-3 h-3 text-rose-400" />
            <span>{language === 'en' ? 'Remove from Bookshelf' : 'Raftan Kaldır'}</span>
          </button>
        )}
      </div>

      {/* Ribbon Bookmark (Peeks out of the top for tactile look) */}
      <div 
        className={`w-3.5 h-6 absolute -top-3 z-10 transition-transform duration-300 ${
          isHovered ? '-translate-y-2' : ''
        }`}
        style={{
          backgroundColor: book.accentColor,
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 75%, 0% 100%)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}
      />

      {/* Direct Quick-Remove Action Button for Member Profile Bookshelf */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(book.id, e);
          }}
          title={language === 'en' ? `Remove "${title}" from shelf` : `"${title}" kitabını raftan kaldır`}
          className={`absolute -top-4 right-0 z-40 p-1.5 rounded-full bg-stone-900 text-stone-200 hover:bg-rose-600 hover:text-white shadow-md transition-all cursor-pointer border border-white/30 ${
            isRemoveMode 
              ? 'opacity-100 scale-100 ring-2 ring-rose-500 animate-pulse' 
              : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
          }`}
        >
          <Trash2 className="w-3 h-3 text-rose-300" />
        </button>
      )}

      {/* 3D Physical Spine Button */}
      <button
        type="button"
        onClick={(e) => {
          if (isRemoveMode && onRemove) {
            e.stopPropagation();
            onRemove(book.id, e);
          } else {
            onSelect(book);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        aria-label={`${title} by ${book.author}`}
        className={`relative ${calculateSpineWidth(book.pages)} ${calculateHeight(book.id)} rounded-t-[4px] rounded-b-[2px] cursor-pointer transition-all duration-300 ease-out preserve-3d focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-800 ${
          isHovered
            ? '-translate-y-5 scale-[1.03] rotate-[-1.5deg] z-30 book-shadow-hover'
            : isSelected
            ? '-translate-y-3 scale-[1.02] z-20 shadow-lg'
            : 'translate-y-0 z-10 shadow-md hover:shadow-xl'
        }`}
        style={{
          backgroundColor: book.coverColor,
          color: book.spineTextColor || '#ffffff',
          boxShadow: isHovered 
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.15)' 
            : '2px 0 8px rgba(0,0,0,0.18), -1px 0 3px rgba(0,0,0,0.12)'
        }}
      >
        {/* Realistic spine crease / light reflection gradient */}
        <div className="absolute inset-0 spine-crease rounded-t-[4px] rounded-b-[2px] pointer-events-none" />

        {/* Embossed Top Edge & Binding Ribs (physical book ridges) */}
        <div className="absolute top-4 left-0 right-0 h-[2px] bg-white/20 shadow-sm" />
        <div className="absolute top-5 left-0 right-0 h-[1px] bg-black/30" />
        <div className="absolute bottom-6 left-0 right-0 h-[2px] bg-white/20 shadow-sm" />
        <div className="absolute bottom-7 left-0 right-0 h-[1px] bg-black/30" />

        {/* Spine Content Container */}
        <div className="relative h-full w-full py-6 px-1 flex flex-col justify-between items-center select-none overflow-hidden">
          {/* Top publisher / club emblem */}
          <div className="flex flex-col items-center gap-1 opacity-85">
            <div className="w-2.5 h-2.5 border border-current rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-current rounded-full" />
            </div>
            {book.isBookOfMonth && (
              <span className="text-[8px] tracking-widest font-mono uppercase text-amber-300 font-bold">
                BOTM
              </span>
            )}
            {book.isPersonalExtra && (
              <span className="text-[7.5px] tracking-widest font-mono uppercase text-amber-200 font-bold px-0.5 rounded-xs bg-black/30">
                EXTRA
              </span>
            )}
          </div>

          {/* Vertical Book Title (Rotated 90 degrees like real international bookstore spine) */}
          <div className="flex-1 flex items-center justify-center my-2 max-h-[190px] overflow-hidden">
            <span
              className="text-center font-serif text-[13px] sm:text-[14px] font-semibold tracking-wide whitespace-nowrap block"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
                letterSpacing: '0.04em',
                textShadow: '0 1px 2px rgba(0,0,0,0.25)',
              }}
            >
              {title}
            </span>
          </div>

          {/* Author Name on bottom of spine */}
          <div className="flex flex-col items-center gap-1">
            <span
              className="font-sans text-[10px] sm:text-[11px] font-medium opacity-85 text-center leading-tight max-w-[90%] truncate"
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                maxHeight: '75px',
              }}
            >
              {book.author}
            </span>
            <span className="text-[8px] font-mono opacity-50 mt-1">
              {book.year}
            </span>
          </div>
        </div>

        {/* Tactile Book Page Edge (slight exposed paper side) */}
        <div className="absolute right-0 top-1 bottom-1 w-[2px] bg-[#EFECE6]/60 rounded-r-xs" />
      </button>

      {/* Book Foot Shadow on Shelf Floor */}
      <div
        className={`w-4/5 h-2.5 rounded-full transition-all duration-300 -mt-1 shelf-shadow ${
          isHovered ? 'scale-x-125 opacity-70 blur-[2px]' : 'scale-x-100 opacity-40'
        }`}
      />
    </div>
  );
};
