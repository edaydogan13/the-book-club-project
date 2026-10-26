import React, { useState, useRef, useEffect } from 'react';
import { Book, BookComment, VideoReview, AuthUser } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { 
  getBookTitle, 
  getBookCover, 
  getBookSynopsis, 
  getBookQuote, 
  getBookGenre, 
  getBookMonth,
  getCommentText,
  getCommentQuote,
  getVideoTitle,
  getVideoNotes,
  getBookBinding
} from '../data/initialData';
import { 
  X, 
  ExternalLink, 
  ShoppingBag, 
  Video, 
  VideoOff,
  Upload, 
  MessageSquare, 
  Star, 
  Quote, 
  Play,
  Edit3,
  ShieldCheck
} from 'lucide-react';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onAddComment: (bookId: string, comment: Omit<BookComment, 'id' | 'timestamp'>) => void;
  onUpdateVideo: (bookId: string, video: VideoReview) => void;
  language?: Language;
  isAdmin?: boolean;
  currentUser?: AuthUser | null;
  initialOpenVideoUpload?: boolean;
  onEditBook?: (book: Book) => void;
  onSetBookOfMonth?: (bookId: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onAddComment,
  onUpdateVideo,
  language = 'en',
  isAdmin = false,
  currentUser = null,
  initialOpenVideoUpload = false,
  onEditBook,
  onSetBookOfMonth,
}) => {
  if (!book) return null;

  const canUploadVideo = isAdmin || Boolean(currentUser);
  const t = TRANSLATIONS[language];
  const title = getBookTitle(book, language);
  const coverUrl = getBookCover(book, language);
  const synopsis = getBookSynopsis(book, language);
  const quote = getBookQuote(book, language);
  const genre = getBookGenre(book, language);
  const month = getBookMonth(book, language);

  const [activeTab, setActiveTab] = useState<'overview' | 'discussion' | 'video'>('overview');
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentAuthor, setNewCommentAuthor] = useState(currentUser?.displayName || (isAdmin ? 'Eda Aydoğan' : ''));
  const [newCommentRating, setNewCommentRating] = useState(5);
  const [newCommentQuote, setNewCommentQuote] = useState('');

  // Video upload & update state
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSpeaker, setVideoSpeaker] = useState(currentUser?.displayName || (isAdmin ? 'Eda Aydoğan' : ''));
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoNotes, setVideoNotes] = useState('');
  const [localVideoPreview, setLocalVideoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialOpenVideoUpload && canUploadVideo) {
      setActiveTab('video');
      setIsUploadingVideo(true);
    } else {
      setActiveTab('overview');
      setIsUploadingVideo(false);
    }
  }, [book?.id, initialOpenVideoUpload, canUploadVideo]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayMonth = language === 'en' ? 'October 2026' : 'Ekim 2026';

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    onAddComment(book.id, {
      authorName: newCommentAuthor,
      text: newCommentText.trim(),
      rating: newCommentRating,
      favoriteQuote: newCommentQuote.trim() || undefined,
    });

    setNewCommentText('');
    setNewCommentQuote('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalVideoPreview(url);
    }
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = localVideoPreview || videoUrlInput || 'https://www.w3schools.com/html/mov_bbb.mp4';
    
    onUpdateVideo(book.id, {
      id: `vid-${Date.now()}`,
      title: videoTitle.trim() || `${book.title} — ${t.videoReflection}`,
      speaker: videoSpeaker,
      videoUrl: finalUrl,
      notes: videoNotes.trim() || (language === 'en' ? 'Recorded during the monthly salon reflection session.' : 'Aylık salon tartışması sırasında kaydedildi.'),
      recordedDate: displayMonth,
      duration: '4:20 min'
    });

    setIsUploadingVideo(false);
    setLocalVideoPreview(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#FBFBFA] rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white/80">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-sm border border-amber-200/60 font-semibold">
              {book.isBookOfMonth ? displayMonth : book.month}
            </span>
            <span className="text-xs text-stone-500">
              {language === 'en' ? 'Suggested by' : 'Öneren'} <strong className="text-stone-800">{book.suggesterName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="hidden sm:flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'overview' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.modalDetailsTab}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('discussion')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'discussion' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.modalComments} ({book.comments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'video' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {book.videoReview ? (
                  <Video className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <VideoOff className="w-3.5 h-3.5 text-stone-400" />
                )}
                <span>{t.modalVideoTab}</span>
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  book.videoReview 
                    ? 'bg-emerald-100 text-emerald-800 font-bold' 
                    : 'bg-stone-200 text-stone-500'
                }`}>
                  {book.videoReview ? '1' : '0'}
                </span>
              </button>
            </div>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 ml-1">
                {onSetBookOfMonth && !book.isBookOfMonth && (
                  <button
                    type="button"
                    onClick={() => {
                      onSetBookOfMonth(book.id);
                    }}
                    className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                    title={language === 'en' ? 'Set as Book of the Month' : 'Ayın Kitabı Yap'}
                  >
                    <span>⭐</span>
                    <span>{language === 'en' ? 'Set as Current' : 'Ayın Kitabı Yap'}</span>
                  </button>
                )}

                {onEditBook && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEditBook(book);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-colors shadow-xs cursor-pointer"
                    title={language === 'en' ? 'Edit Book Details (Admin)' : 'Kitap Bilgilerini Düzenle (Yönetici)'}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                    <span>{language === 'en' ? 'Edit Book' : 'Kitabı Düzenle'}</span>
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors ml-2 cursor-pointer"
              aria-label={t.modalClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex border-b border-stone-200 bg-stone-50 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 text-center font-medium border-b-2 ${
              activeTab === 'overview' ? 'border-stone-900 text-stone-900 font-semibold' : 'border-transparent text-stone-500'
            }`}
          >
            {t.modalDetailsTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('discussion')}
            className={`flex-1 py-2.5 text-center font-medium border-b-2 ${
              activeTab === 'discussion' ? 'border-stone-900 text-stone-900 font-semibold' : 'border-transparent text-stone-500'
            }`}
          >
            {t.modalComments} ({book.comments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-2.5 text-center font-medium border-b-2 ${
              activeTab === 'video' ? 'border-stone-900 text-stone-900 font-semibold' : 'border-transparent text-stone-500'
            }`}
          >
            {t.modalVideoTab} ({book.videoReview ? '1' : '0'})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Left Column: Clean Book Cover Presentation with Page Count */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div 
                  className="relative w-[210px] sm:w-[240px] h-[310px] sm:h-[350px] rounded-r-lg rounded-l-xs shadow-2xl overflow-hidden border-l-2 border-white/30 bg-stone-900 flex flex-col justify-between"
                >
                  {/* Clean Original Book Cover Image */}
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div 
                      className="w-full h-full p-6 flex flex-col justify-between text-white"
                      style={{ backgroundColor: book.coverColor }}
                    >
                      <div>
                        <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">{month}</span>
                      </div>
                      <div className="text-center my-auto">
                        <h3 className="font-serif text-2xl font-bold">{title}</h3>
                        <p className="text-xs opacity-80 mt-1">{book.author}</p>
                      </div>
                    </div>
                  )}

                  {/* Subtle Spine shadow fold on left */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/35 via-transparent to-transparent pointer-events-none z-10" />

                  {/* Page Count Badge on the div */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="font-mono text-xs text-white bg-stone-950/80 px-2.5 py-1 rounded-md shadow-md backdrop-blur-xs border border-white/10 font-medium">
                      {book.pages} {t.pagesUnit}
                    </span>
                  </div>
                </div>

                {/* Physical Specifications */}
                <div className="w-full mt-5 bg-stone-100/80 rounded-xl p-3.5 border border-stone-200 text-xs text-stone-600 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-500">{t.modalBinding}</span>
                    <span className="font-medium text-stone-900">{getBookBinding(book.physicalDetails.binding, language)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">{t.modalCurator}</span>
                    <span className="font-medium text-stone-900">{book.suggesterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">{t.modalRating}</span>
                    <span className="font-medium text-amber-700">★ {book.rating} / 5</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Narrative, Themes & Verified Affiliate Buy Links */}
              <div className="md:col-span-7 space-y-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-wider mb-1">
                    <span>{genre}</span>
                    <span aria-hidden="true">·</span>
                    <span>{book.year}</span>
                    <span aria-hidden="true">·</span>
                    <span>{language === 'en' ? `Curated by ${book.suggesterName}` : `${book.suggesterName} tarafından önerildi`}</span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight">
                    {title}
                  </h1>
                  {book.originalTitle && book.originalTitle !== title && (
                    <p className="text-xs text-stone-500 italic mt-0.5 font-serif">
                      {book.originalTitle}
                    </p>
                  )}
                  <p className="text-base text-stone-700 font-medium mt-1">
                    {book.author}
                  </p>
                </div>

                {/* Synopsis */}
                <div className="prose prose-stone text-stone-600 text-sm leading-relaxed">
                  <p>
                    {synopsis}
                  </p>
                </div>

                {/* Featured Quote */}
                {quote && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-xl">
                    <div className="flex gap-2">
                      <Quote className="w-3.5 h-3.5 text-[#C45B38] shrink-0 mt-0.5" />
                      <p className="font-serif italic text-stone-800 text-xs sm:text-sm leading-relaxed">
                        “{quote}”
                      </p>
                    </div>
                  </div>
                )}

                {/* Salon Video Review Status Banner */}
                {book.videoReview ? (
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <Video className="w-4 h-4 text-emerald-700" />
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
                          {book.videoReview.speaker || book.suggesterName} · {book.videoReview.duration}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('video')}
                      className="px-3 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5 shrink-0"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{t.watchSalonVideo}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-dashed border-stone-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center shrink-0">
                        <VideoOff className="w-4 h-4 text-stone-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800">
                          {t.noVideoTitle}
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {language === 'en'
                            ? 'No recorded video reflection uploaded yet for this edition.'
                            : 'Bu edisyon için henüz yüklenmiş bir video incelemesi bulunmuyor.'}
                        </p>
                      </div>
                    </div>
                    {canUploadVideo && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('video');
                          setIsUploadingVideo(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5 shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5 text-stone-600" />
                        <span>{t.uploadSalonVideo}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* BUY LINKS SECTION */}
                <div className="pt-4 border-t border-stone-200">
                  <div className="flex items-center gap-1.5 mb-3">
                    <ShoppingBag className="w-4 h-4 text-stone-800" />
                    <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                      {t.modalAcquire}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Turkish Edition Buy Link */}
                    <a
                      href={book.buyLinks.tr.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-800 rounded-xl transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1">
                          <span>🇹🇷 {t.botmBuyTurkish}</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-colors" />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-stone-900">{book.buyLinks.tr.store}</p>
                        <p className="text-xs font-semibold text-stone-800 font-mono mt-0.5">
                          {book.buyLinks.tr.price}
                        </p>
                      </div>
                      <div className="mt-2 text-[10px] text-stone-400 font-mono flex items-center justify-between border-t border-stone-100 pt-1">
                        <span>Tag: {book.buyLinks.tr.affiliateTag}</span>
                        <span className="text-emerald-700 font-medium">{language === 'en' ? 'Buy →' : 'Satın Al →'}</span>
                      </div>
                    </a>

                    {/* English Edition Buy Link */}
                    <a
                      href={book.buyLinks.en.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-800 rounded-xl transition-all shadow-xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1">
                          <span>🇬🇧 {t.botmBuyEnglish}</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-900 transition-colors" />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium text-stone-900">{book.buyLinks.en.store}</p>
                        <p className="text-xs font-semibold text-stone-800 font-mono mt-0.5">
                          {book.buyLinks.en.price}
                        </p>
                      </div>
                      <div className="mt-2 text-[10px] text-stone-400 font-mono flex items-center justify-between border-t border-stone-100 pt-1">
                        <span>Tag: {book.buyLinks.en.affiliateTag}</span>
                        <span className="text-emerald-700 font-medium">{language === 'en' ? 'Buy →' : 'Satın Al →'}</span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DISCUSSION & COMMENTS TAB */}
          {activeTab === 'discussion' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  {language === 'en' ? 'Member Reflections & Salon Notes' : 'Üye İncelemeleri ve Salon Notları'}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {language === 'en' ? 'Perspectives from the 6 members and referred readers.' : '6 üye ve davetli okurların edebi yorumları.'}
                </p>
              </div>

              {/* List of comments */}
              <div className="space-y-3">
                {book.comments.length === 0 ? (
                  <p className="text-sm text-stone-500 italic py-6 text-center">
                    {language === 'en' ? 'No reflections recorded yet. Be the first to share your perspective!' : 'Henüz bir yorum kaydedilmedi. İlk görüşü siz paylaşın!'}
                  </p>
                ) : (
                  book.comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="p-4 bg-white border border-stone-200 rounded-xl shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-stone-800 text-stone-100 text-xs font-serif flex items-center justify-center font-bold">
                            {comment.authorName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-stone-900 leading-none">
                              {comment.authorName}
                            </p>
                            <span className="text-[10px] text-stone-400 font-mono">{comment.timestamp}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-500 text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < Math.floor(comment.rating) ? 'fill-current' : 'text-stone-200'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                        {getCommentText(comment, language)}
                      </p>

                      {getCommentQuote(comment, language) && (
                        <div className="mt-2.5 pl-3 border-l-2 border-[#C45B38] text-xs italic text-stone-600">
                          “{getCommentQuote(comment, language)}”
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleCommentSubmit} className="p-4 bg-stone-100/80 rounded-xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-stone-700 font-semibold">
                  {t.modalAddReflection}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">{language === 'en' ? 'Your Name' : 'Adınız'}</label>
                    <select
                      value={newCommentAuthor}
                      onChange={(e) => setNewCommentAuthor(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:outline-none"
                    >
                      <option value="Cemre Şirin">Cemre Şirin (Founder)</option>
                      <option value="Eda Aydoğan">Eda Aydoğan (Curator)</option>
                      <option value="Mert (Can Mert)">Mert (Can Mert)</option>
                      <option value="Ferhat Babacan">Ferhat Babacan</option>
                      <option value="Gizem Yeniçıkan">Gizem Yeniçıkan</option>
                      <option value="Gökçe Nur Uysal">Gökçe Nur Uysal</option>
                      <option value="Guest Reader">{language === 'en' ? 'Guest Reader' : 'Misafir Okur'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-stone-600 mb-1">{t.modalRating}</label>
                    <select
                      value={newCommentRating}
                      onChange={(e) => setNewCommentRating(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:outline-none"
                    >
                      <option value={5}>★★★★★ (5/5)</option>
                      <option value={4.5}>★★★★☆ (4.5/5)</option>
                      <option value={4}>★★★★☆ (4/5)</option>
                      <option value={3.5}>★★★☆☆ (3.5/5)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-600 mb-1">{language === 'en' ? 'Favorite Line or Quote (Optional)' : 'Alıntı (İsteğe Bağlı)'}</label>
                  <input
                    type="text"
                    value={newCommentQuote}
                    onChange={(e) => setNewCommentQuote(e.target.value)}
                    placeholder={language === 'en' ? "An unforgettable sentence..." : "Metinden unutulmaz bir cümle..."}
                    className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-600 mb-1">{language === 'en' ? 'Reflection / Critique' : 'Yorum / Değerlendirme'}</label>
                  <textarea
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={language === 'en' ? "What did this book provoke in you?" : "Bu kitap sizde nasıl bir düşünce uyandırdı?"}
                    className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
                >
                  {t.modalPublishBtn}
                </button>
              </form>
            </div>
          )}

          {/* VIDEO UPLOAD & DISCUSSION SECTION */}
          {activeTab === 'video' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">
                    {t.modalCloudStorageTitle}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    {t.modalCloudStorageDesc}
                  </p>
                </div>
                {canUploadVideo && (
                  <button
                    type="button"
                    onClick={() => setIsUploadingVideo(!isUploadingVideo)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors border border-stone-300 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingVideo ? (language === 'en' ? 'Cancel' : 'İptal') : t.modalUploadVideoBtn}</span>
                  </button>
                )}
              </div>

              {/* Upload Form */}
              {canUploadVideo && isUploadingVideo && (
                <form onSubmit={handleSaveVideo} className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-amber-900 font-bold">
                    {t.modalUploadVideoBtn}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-700 mb-1">{language === 'en' ? 'Video Title' : 'Video Başlığı'}</label>
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder={`${book.title} — ${t.videoReflection}`}
                        className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-700 mb-1">{language === 'en' ? 'Speaker' : 'Konuşmacı'}</label>
                      <input
                        type="text"
                        value={videoSpeaker}
                        onChange={(e) => setVideoSpeaker(e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-stone-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-700 mb-1">{language === 'en' ? 'Choose Video File (.mp4, .webm) or Link' : 'Video Dosyası Seç (.mp4) veya Bağlantı Yapıştır'}</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-stone-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                    />
                    <div className="mt-2 text-stone-400 text-[11px]">{language === 'en' ? 'or paste direct cloud storage video URL' : 'veya bulut depolama video URL’si girin'}</div>
                    <input
                      type="url"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder={t.modalVideoUrlPlaceholder}
                      className="mt-1 w-full text-xs p-2 bg-white border border-stone-300 rounded-md"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                  >
                    {language === 'en' ? 'Save Video to Book Record' : 'Videoyu Kitap Kaydına Kaydet'}
                  </button>
                </form>
              )}

              {/* Video Player Display or Dedicated No-Video Uploaded View */}
              {book.videoReview || localVideoPreview ? (
                <div className="bg-stone-900 rounded-2xl overflow-hidden shadow-xl border border-stone-800">
                  <div className="relative aspect-video bg-black flex items-center justify-center">
                    <video
                      controls
                      className="w-full h-full object-contain"
                      src={localVideoPreview || book.videoReview?.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                    >
                      {language === 'en' ? 'Your browser does not support video playback.' : 'Tarayıcınız video oynatmayı desteklemiyor.'}
                    </video>
                  </div>

                  {/* Video Info Footer */}
                  {book.videoReview && (
                    <div className="p-4 sm:p-5 bg-stone-900 text-stone-200 border-t border-stone-800">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-1">
                        <span className="font-serif font-bold text-white text-base sm:text-lg">
                          {getVideoTitle(book.videoReview, title, language)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-stone-300 text-xs bg-stone-800 px-2.5 py-0.5 rounded border border-stone-700">
                            {book.videoReview.duration}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase font-semibold">
                            {t.videoUploadedBadge}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-stone-400 mt-2 flex flex-wrap items-center gap-2">
                        <span>{language === 'en' ? 'Speaker:' : 'Konuşmacı:'} <strong className="text-stone-200 font-medium">{book.videoReview.speaker}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>{language === 'en' ? (book.videoReview.recordedDateEn || book.videoReview.recordedDate) : book.videoReview.recordedDate}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-stone-500">{t.cloudArchived}</span>
                      </div>

                      {getVideoNotes(book.videoReview, language) && (
                        <p className="text-xs text-stone-300 mt-3 pt-3 border-t border-stone-800/80 leading-relaxed font-light">
                          {getVideoNotes(book.videoReview, language)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Dedicated "No Video Uploaded" Empty State */
                <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-8 sm:p-12 text-center shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-800">
                    <VideoOff className="w-8 h-8 text-amber-700" />
                  </div>

                  <h4 className="font-serif text-2xl sm:text-3xl font-normal text-stone-900 tracking-tight">
                    {t.noVideoTitle}
                  </h4>
                  
                  <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
                    {canUploadVideo 
                      ? t.noVideoDesc 
                      : (language === 'en' 
                          ? 'No video review or recorded salon reflection has been uploaded for this book yet.' 
                          : 'Bu kitap için henüz kaydedilmiş bir salon video incelemesi bulunmuyor.')}
                  </p>

                  {canUploadVideo && (
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsUploadingVideo(true)}
                        className="px-4 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{t.uploadSalonVideo}</span>
                      </button>
                    </div>
                  )}

                  <div className="mt-6 pt-5 border-t border-stone-200 text-[11px] text-stone-400 font-mono">
                    {language === 'en' 
                      ? 'Supported formats: .mp4, .webm, or direct streaming URLs from cloud storage' 
                      : 'Desteklenen formatlar: .mp4, .webm veya bulut depolama doğrudan akış bağlantıları'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
