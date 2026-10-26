import React, { useState, useRef } from 'react';
import { Book } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { TactileBookSpine } from './TactileBookSpine';
import { TactileBookCover } from './TactileBookCover';
import { 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  Grid, 
  Sparkles,
  Search,
  BookOpen,
  Plus
} from 'lucide-react';

interface TactileBookshelfProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  title?: string;
  subtitle?: string;
  shelfOwnerName?: string;
  language?: Language;
  isAdmin?: boolean;
  onAddBook?: () => void;
}

export const TactileBookshelf: React.FC<TactileBookshelfProps> = ({
  books,
  onSelectBook,
  title,
  subtitle,
  shelfOwnerName,
  language = 'en',
  isAdmin = false,
  onAddBook,
}) => {
  const t = TRANSLATIONS[language];
  const [viewMode, setViewMode] = useState<'spines' | 'covers'>('covers');
  const [selectedSuggester, setSelectedSuggester] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const shelfScrollRef = useRef<HTMLDivElement>(null);

  const displayTitle = title || t.shelfTitle;
  const displaySubtitle = subtitle || t.shelfSubtitle;

  // Extract unique suggesters
  const suggesters = Array.from(new Set(books.map(b => b.suggesterName)));

  // Filter books
  const filteredBooks = books.filter(book => {
    const matchesSuggester = selectedSuggester === 'all' || book.suggesterName === selectedSuggester;
    const query = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(query) ||
      (book.titleEn && book.titleEn.toLowerCase().includes(query)) ||
      (book.originalTitle && book.originalTitle.toLowerCase().includes(query)) ||
      book.author.toLowerCase().includes(query) ||
      book.genre.toLowerCase().includes(query) ||
      (book.genreEn && book.genreEn.toLowerCase().includes(query));
    return matchesSuggester && matchesSearch;
  });

  const scrollShelf = (direction: 'left' | 'right') => {
    if (shelfScrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      shelfScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full py-6 sm:py-8">
      {/* Shelf Header & Architectural Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest mb-1">
            <BookOpen className="w-3.5 h-3.5 text-stone-600" />
            <span>
              {shelfOwnerName 
                ? (language === 'en' ? `${shelfOwnerName}'s Library` : `${shelfOwnerName} Kütüphanesi`) 
                : t.shelfAnthology}
            </span>
            <span aria-hidden="true">·</span>
            <span>{filteredBooks.length} {t.shelfEditions}</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
            {displayTitle}
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            {displaySubtitle}
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.shelfSearchPlaceholder}
              className="pl-8 pr-3 py-1.5 text-xs bg-stone-100 hover:bg-stone-50 focus:bg-white border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 w-44 sm:w-52 transition-all"
            />
          </div>

          {/* Suggester Filter */}
          {!shelfOwnerName && suggesters.length > 1 && (
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <select
                value={selectedSuggester}
                onChange={(e) => setSelectedSuggester(e.target.value)}
                className="text-xs bg-transparent text-stone-700 font-medium px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="all">{t.shelfAllCurators}</option>
                {suggesters.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg border border-stone-200">
            <button
              type="button"
              onClick={() => setViewMode('covers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'covers'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title={t.shelfCoversView}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{t.shelfCoversView}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('spines')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'spines'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title={t.shelfSpinesView}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">{t.shelfSpinesView}</span>
            </button>
          </div>

          {/* Admin Add Book Button */}
          {isAdmin && onAddBook && (
            <button
              type="button"
              onClick={onAddBook}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-colors shadow-xs cursor-pointer"
              title={language === 'en' ? 'Add New Book (Admin)' : 'Yeni Kitap Ekle (Yönetici)'}
            >
              <Plus className="w-3.5 h-3.5 text-amber-800" />
              <span>{language === 'en' ? '+ Add Book' : '+ Kitap Ekle'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Bookshelf Presentation Area */}
      {viewMode === 'spines' ? (
        <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#FAF8F5] to-[#F3EFEA] border border-[#E8E2D7] p-4 sm:p-8 overflow-hidden shadow-xs">
          {/* Subtle architectural wall backlight glow */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
          
          {/* Navigation Scroll Buttons */}
          <button
            type="button"
            onClick={() => scrollShelf('left')}
            aria-label="Scroll shelf left"
            className="absolute left-2 sm:left-4 top-[48%] -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 text-stone-700 shadow-md hover:bg-stone-900 hover:text-white transition-all backdrop-blur-xs border border-stone-200 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollShelf('right')}
            aria-label="Scroll shelf right"
            className="absolute right-2 sm:right-4 top-[48%] -translate-y-1/2 z-30 p-2 rounded-full bg-white/90 text-stone-700 shadow-md hover:bg-stone-900 hover:text-white transition-all backdrop-blur-xs border border-stone-200 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Horizontal Scrollable Shelf of Vertical Standing Books */}
          <div
            ref={shelfScrollRef}
            className="flex items-end gap-2.5 sm:gap-4 overflow-x-auto px-6 sm:px-12 pt-16 pb-2 scroll-smooth no-scrollbar select-none"
            style={{
              minHeight: '360px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {filteredBooks.length === 0 ? (
              <div className="w-full py-16 text-center text-stone-500">
                <p className="font-serif text-lg">{t.shelfNotFound}</p>
                <button
                  type="button"
                  onClick={() => { setSelectedSuggester('all'); setSearchQuery(''); }}
                  className="mt-2 text-xs text-stone-800 underline hover:text-black cursor-pointer"
                >
                  {t.shelfReset}
                </button>
              </div>
            ) : (
              filteredBooks.map((book) => (
                <TactileBookSpine
                  key={book.id}
                  book={book}
                  onSelect={onSelectBook}
                  language={language}
                />
              ))
            )}
          </div>

          {/* Architectural Wooden Shelf Ledge */}
          <div className="relative w-full z-20">
            {/* Top Ledge Surface */}
            <div className="h-5 w-full shelf-ledge rounded-t-xs" />
            {/* Front Beveled Face of the Wooden Shelf */}
            <div className="h-6 w-full bg-[#C8C1B3] border-t border-white/50 border-b border-[#A89F90] flex items-center justify-between px-4 text-[11px] font-mono text-[#5A5245] shadow-sm">
              <span className="tracking-widest uppercase">
                {shelfOwnerName 
                  ? `${shelfOwnerName.toUpperCase()} — ${language === 'en' ? 'PERSONAL LEDGER' : 'KİŞİSEL RAF'}` 
                  : t.shelfA1}
              </span>
              <span className="hidden sm:inline opacity-75">
                {t.shelfSolidBirch}
              </span>
            </div>
            {/* Under-shelf cast shadow */}
            <div className="h-4 w-full bg-gradient-to-b from-[#1C1917]/15 to-transparent" />
          </div>

          {/* Bottom subtle guidance */}
          <div className="mt-3 flex items-center justify-between text-xs text-stone-500 px-2">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.shelfTapHint}</span>
            </span>
            <span className="hidden sm:inline font-mono text-[11px]">
              {t.shelfDragHint}
            </span>
          </div>
        </div>
      ) : (
        /* Flat Cover Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 p-6 bg-stone-50/50 rounded-2xl border border-stone-200">
          {filteredBooks.map((book) => (
            <TactileBookCover
              key={book.id}
              book={book}
              onSelect={onSelectBook}
              language={language}
            />
          ))}
        </div>
      )}
    </section>
  );
};
