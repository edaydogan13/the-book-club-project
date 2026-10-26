import React from 'react';
import { Book, AuthUser } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { 
  getBookTitle, 
  getBookCover, 
  getBookSynopsis, 
  getBookQuote, 
  getBookGenre,
  getCommentText,
  getVideoTitle,
  getBookBinding
} from '../data/initialData';
import { 
  ArrowRight, 
  MessageSquare, 
  Quote, 
  Video,
  VideoOff,
  Upload,
  Edit3
} from 'lucide-react';

interface BookOfTheMonthSectionProps {
  book: Book;
  language: Language;
  onSelectBook: (book: Book, openVideoUpload?: boolean) => void;
  isAdmin?: boolean;
  currentUser?: AuthUser | null;
  onEditBook?: (book: Book) => void;
}

export const BookOfTheMonthSection: React.FC<BookOfTheMonthSectionProps> = ({
  book,
  language,
  onSelectBook,
  isAdmin = false,
  currentUser = null,
  onEditBook,
}) => {
  const canUploadVideo = isAdmin || Boolean(currentUser);
  const t = TRANSLATIONS[language];
  const displayMonth = language === 'en' ? 'October 2026' : 'Ekim 2026';
  const title = getBookTitle(book, language);
  const coverUrl = getBookCover(book, language);
  const synopsis = getBookSynopsis(book, language);
  const quote = getBookQuote(book, language);
  const genre = getBookGenre(book, language);

  return (
    <section className="relative w-full py-8 sm:py-10 border-t border-b border-stone-200 bg-gradient-to-b from-[#FBFBFA] via-[#F7F4EE] to-[#FBFBFA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Closer to main holder card */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-800 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#C45B38] inline-block animate-pulse" />
              <span>{t.botmBadge} · {displayMonth}</span>
              <span aria-hidden="true">·</span>
              <span>{t.curatedBy}: {book.suggesterName}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-normal text-stone-900 tracking-tight">
              {t.botmTitle}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && onEditBook && (
              <button
                type="button"
                onClick={() => onEditBook(book)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-colors shadow-xs cursor-pointer"
                title={language === 'en' ? 'Edit Book of the Month Details' : 'Ayın Kitabını Düzenle'}
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                <span>{language === 'en' ? 'Edit Book & Notes' : 'Kitabı Düzenle'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectBook(book)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 hover:text-[#C45B38] transition-colors underline underline-offset-4 cursor-pointer"
            >
              <span>{t.botmViewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Hero Split Card - Main Holder with tightened inner padding & unified layout */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-5 sm:p-7 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Authentic Original Book Cover Presentation */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div 
              onClick={() => onSelectBook(book)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onSelectBook(book); }}
              className="relative w-[210px] sm:w-[240px] h-[310px] sm:h-[350px] rounded-r-xl rounded-l-xs shadow-xl overflow-hidden cursor-pointer group transition-all duration-300 hover:-translate-y-1.5 hover:rotate-[-1deg] border border-stone-300 bg-stone-900"
            >
              {/* Authentic Original Publisher Cover Image */}
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={`${title} cover`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}

              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-stone-950/40 pointer-events-none" />

              {/* Top Cover Badge with October month */}
              <div className="absolute top-3.5 inset-x-3.5 flex justify-between items-center text-[10px] font-mono text-white/90 uppercase tracking-widest z-10">
                <span className="bg-stone-900/75 px-2 py-0.5 rounded-xs backdrop-blur-xs">
                  {displayMonth}
                </span>
                <span className="bg-amber-400 text-stone-950 font-bold px-1.5 py-0.5 rounded-xs">
                  {book.rating} ★
                </span>
              </div>

              {/* Spine shadow edge */}
              <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Bottom Details Overlay */}
              <div className="absolute bottom-3.5 inset-x-3.5 text-white z-10">
                <span className="text-[10px] uppercase tracking-wider opacity-80 block mb-0.5">
                  {book.author}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight drop-shadow-sm">
                  {title}
                </h3>
                {book.originalTitle && book.originalTitle !== title && (
                  <p className="text-[11px] text-stone-300 italic mt-0.5">
                    {book.originalTitle}
                  </p>
                )}
                <div className="mt-2 pt-2 border-t border-white/25 flex items-center justify-between text-[10px] text-stone-300 font-mono">
                  <span>{getBookBinding(book.physicalDetails.binding, language)}</span>
                  <span>{book.pages} {t.pagesUnit}</span>
                </div>
              </div>
            </div>

            {/* Direct Affiliate Buy Links */}
            <div className="w-full max-w-sm mt-4 grid grid-cols-2 gap-2 text-center">
              <a
                href={book.buyLinks.tr.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded-xl text-xs font-medium transition-colors flex flex-col items-center"
              >
                <span className="font-semibold">{t.botmBuyTurkish}</span>
                <span className="text-[10px] text-stone-500 font-mono">{book.buyLinks.tr.store} ({book.buyLinks.tr.price})</span>
              </a>
              <a
                href={book.buyLinks.en.url}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition-colors flex flex-col items-center shadow-xs"
              >
                <span className="font-semibold">{t.botmBuyEnglish}</span>
                <span className="text-[10px] text-stone-400 font-mono">{book.buyLinks.en.store} ({book.buyLinks.en.price})</span>
              </a>
            </div>
          </div>

          {/* Right Column: Narrative, Comments & Video Review Teaser */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-wider mb-1">
                <span>{genre}</span>
                <span aria-hidden="true">·</span>
                <span>{displayMonth}</span>
                <span aria-hidden="true">·</span>
                <span>{language === 'en' ? `Curated by ${book.suggesterName}` : `${book.suggesterName} tarafından önerildi`}</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                {title}
              </h3>
              {book.originalTitle && book.originalTitle !== title && (
                <p className="text-xs text-stone-500 italic mt-0.5 font-serif">
                  {book.originalTitle}
                </p>
              )}
              <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
                {synopsis}
              </p>
            </div>

            {/* Excerpt Quote - Tighter to the main holder */}
            {quote && (
              <div className="p-3 sm:p-3.5 bg-[#FBF9F5] rounded-xl border-l-3 border-[#C45B38]">
                <Quote className="w-3 h-3 text-[#C45B38] mb-0.5" />
                <p className="font-serif italic text-stone-800 text-xs sm:text-sm leading-snug">
                  “{quote}”
                </p>
                <span className="text-[11px] text-stone-500 mt-1 block font-mono">
                  — {book.author}, <span className="italic">{title}</span>
                </span>
              </div>
            )}

            {/* Member Discussion Highlights */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-stone-600 font-bold flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                  <span>{t.memberCommentsCount} ({book.comments.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => onSelectBook(book)}
                  className="text-xs text-stone-700 hover:text-stone-950 font-medium underline cursor-pointer"
                >
                  {t.addYourThought}
                </button>
              </div>

              <div className="space-y-2">
                {book.comments.slice(0, 2).map((comment) => (
                  <div key={comment.id} className="p-3 bg-white rounded-xl border border-stone-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-stone-900">{comment.authorName}</span>
                      <span className="text-amber-500">★ {comment.rating}</span>
                    </div>
                    <p className="text-stone-600 line-clamp-2 leading-relaxed">
                      {getCommentText(comment, language)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Discussion / Reflection Section */}
            {book.videoReview ? (
              <div className="p-3 sm:p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-[#C45B38]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-stone-900">
                        {getVideoTitle(book.videoReview, title, language)}
                      </p>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase">
                        {t.videoUploadedBadge}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {book.videoReview.speaker || book.suggesterName} · {book.videoReview.duration} · {t.cloudArchived}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectBook(book)}
                  className="px-3 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>{t.watchSalonVideo}</span>
                </button>
              </div>
            ) : (
              /* No Video Uploaded View */
              <div className="p-3 sm:p-3.5 bg-[#FAF8F5] rounded-xl border border-dashed border-stone-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-stone-200/80 text-stone-500 flex items-center justify-center shrink-0">
                    <VideoOff className="w-4 h-4 text-stone-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800">
                      {t.noVideoTitle}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {t.noVideoBotmDesc}
                    </p>
                  </div>
                </div>
                {canUploadVideo && (
                  <button
                    type="button"
                    onClick={() => onSelectBook(book, true)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-stone-600" />
                    <span>{t.uploadSalonVideo}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
