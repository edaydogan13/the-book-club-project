import React, { useState, useEffect } from 'react';
import { Book, Member } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { X, Save, Trash2, Star, BookOpen, Image as ImageIcon, Sparkles, Check, Globe } from 'lucide-react';
import { translateTextSync, translateTextWithAI } from '../utils/translator';

interface BookEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookToEdit: Book | null; // null if adding new book
  onSaveBook: (book: Book) => void;
  onDeleteBook?: (bookId: string) => void;
  members: Member[];
  language: Language;
}

const PRESET_COVERS = [
  { label: 'Suçlu Doğmak (Trevor Noah)', url: '/covers/suclu-dogmak.jpg' },
  { label: 'Born a Crime (English)', url: '/covers/born-a-crime.jpg' },
  { label: 'Duvar (Marlen Haushofer)', url: '/covers/duvar.jpg' },
  { label: 'The Wall (English)', url: '/covers/the-wall.jpg' },
  { label: 'Venedik\'te Ölüm (Thomas Mann)', url: '/covers/venedikte-olum.jpg' },
  { label: 'Death in Venice (English)', url: '/covers/death-in-venice.jpg' },
  { label: 'Zaman Sığınağı (Georgi Gospodinov)', url: '/covers/zaman-siginagi.jpg' },
  { label: 'Time Shelter (English)', url: '/covers/time-shelter.jpg' },
  { label: 'Ermiş (Halil Cibran)', url: '/covers/ermis.jpg' },
  { label: 'Ritüellerin Yok Oluşuna Dair', url: '/covers/rituellerin-yok-olusu.jpg' },
  { label: 'Nefaset Lokantası (Tuğba Doğan)', url: '/covers/nefaset-lokantasi.jpg' },
  { label: 'Kızıl Veba (Jack London)', url: '/covers/kizil-veba.jpg' },
  { label: 'Gece Yarısı Kütüphanesi (Matt Haig)', url: '/covers/gece-yarisi-kutuphanesi.jpg' },
];

export const BookEditModal: React.FC<BookEditModalProps> = ({
  isOpen,
  onClose,
  bookToEdit,
  onSaveBook,
  onDeleteBook,
  members,
  language,
}) => {
  const isNew = !bookToEdit;

  // Language tab inside modal: 'tr' | 'en'
  const [activeTab, setActiveTab] = useState<'tr' | 'en'>(language === 'en' ? 'en' : 'tr');

  // Bilingual fields
  const [titleTr, setTitleTr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [genreTr, setGenreTr] = useState('');
  const [genreEn, setGenreEn] = useState('');
  const [synopsisTr, setSynopsisTr] = useState('');
  const [synopsisEn, setSynopsisEn] = useState('');
  const [favoriteQuoteTr, setFavoriteQuoteTr] = useState('');
  const [favoriteQuoteEn, setFavoriteQuoteEn] = useState('');
  const [coverImageUrlTr, setCoverImageUrlTr] = useState('');
  const [coverImageUrlEn, setCoverImageUrlEn] = useState('');

  // Universal metadata
  const [originalTitle, setOriginalTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState(2025);
  const [pages, setPages] = useState(300);
  const [suggesterName, setSuggesterName] = useState('');
  const [suggesterId, setSuggesterId] = useState('');
  const [month, setMonth] = useState('October 2026');
  const [isBookOfMonth, setIsBookOfMonth] = useState(false);
  const [coverColor, setCoverColor] = useState('#2C3E50');
  const [accentColor, setAccentColor] = useState('#E67E22');
  const [spineTextColor, setSpineTextColor] = useState('#FFFFFF');
  const [rating, setRating] = useState(5);
  const [themesStr, setThemesStr] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    setActiveTab(language === 'en' ? 'en' : 'tr');
    if (bookToEdit) {
      setTitleTr(bookToEdit.title || '');
      setTitleEn(bookToEdit.titleEn || bookToEdit.originalTitle || bookToEdit.title || '');
      setGenreTr(bookToEdit.genre || '');
      setGenreEn(bookToEdit.genreEn || bookToEdit.genre || '');
      setSynopsisTr(bookToEdit.synopsis || '');
      setSynopsisEn(bookToEdit.synopsisEn || bookToEdit.synopsis || '');
      setFavoriteQuoteTr(bookToEdit.favoriteQuote || '');
      setFavoriteQuoteEn(bookToEdit.favoriteQuoteEn || bookToEdit.favoriteQuote || '');
      setCoverImageUrlTr(bookToEdit.coverImageUrlTr || bookToEdit.coverImageUrl || '');
      setCoverImageUrlEn(bookToEdit.coverImageUrlEn || bookToEdit.coverImageUrl || '');

      setOriginalTitle(bookToEdit.originalTitle || '');
      setAuthor(bookToEdit.author);
      setYear(bookToEdit.year);
      setPages(bookToEdit.pages);
      setSuggesterName(bookToEdit.suggesterName);
      setSuggesterId(bookToEdit.suggesterId);
      setMonth(bookToEdit.month);
      setIsBookOfMonth(!!bookToEdit.isBookOfMonth);
      setCoverColor(bookToEdit.coverColor || '#2C3E50');
      setAccentColor(bookToEdit.accentColor || '#E67E22');
      setSpineTextColor(bookToEdit.spineTextColor || '#FFFFFF');
      setRating(bookToEdit.rating || 5);
      setThemesStr((bookToEdit.themes || []).join(', '));
    } else {
      // New book defaults
      setTitleTr('');
      setTitleEn('');
      setGenreTr('Edebi Kurgu');
      setGenreEn('Literary Fiction');
      setSynopsisTr('');
      setSynopsisEn('');
      setFavoriteQuoteTr('');
      setFavoriteQuoteEn('');
      setCoverImageUrlTr('');
      setCoverImageUrlEn('');

      setOriginalTitle('');
      setAuthor('');
      setYear(2025);
      setPages(320);
      setSuggesterName(members[0]?.name || 'Eda Aydoğan');
      setSuggesterId(members[0]?.id || 'eda-aydogan');
      setMonth(language === 'en' ? 'November 2026' : 'Kasım 2026');
      setIsBookOfMonth(false);
      setCoverColor('#1A365D');
      setAccentColor('#F6AD55');
      setSpineTextColor('#FFFFFF');
      setRating(5);
      setThemesStr('Memory, Identity, Society');
    }
  }, [bookToEdit, isOpen, members, language]);

  if (!isOpen) return null;

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    const selected = members.find(m => m.id === memberId);
    if (selected) {
      setSuggesterId(selected.id);
      setSuggesterName(selected.name);
    }
  };

  // 1-Click Auto-Translate from one language to the other
  const handleAutoTranslate = async (direction: 'tr-to-en' | 'en-to-tr') => {
    setIsTranslating(true);
    try {
      if (direction === 'tr-to-en') {
        const enTitle = translateTextSync(titleTr, 'tr', 'en');
        const enGenre = translateTextSync(genreTr, 'tr', 'en');
        const enSynopsis = translateTextSync(synopsisTr, 'tr', 'en');
        const enQuote = favoriteQuoteTr ? translateTextSync(favoriteQuoteTr, 'tr', 'en') : '';

        setTitleEn(enTitle);
        setGenreEn(enGenre);
        setSynopsisEn(enSynopsis);
        setFavoriteQuoteEn(enQuote);

        // Async refinement via AI in background
        if (titleTr) {
          translateTextWithAI(titleTr, 'tr', 'en').then(res => res && setTitleEn(res));
        }
        if (synopsisTr) {
          translateTextWithAI(synopsisTr, 'tr', 'en').then(res => res && setSynopsisEn(res));
        }
      } else {
        const trTitle = translateTextSync(titleEn, 'en', 'tr');
        const trGenre = translateTextSync(genreEn, 'en', 'tr');
        const trSynopsis = translateTextSync(synopsisEn, 'en', 'tr');
        const trQuote = favoriteQuoteEn ? translateTextSync(favoriteQuoteEn, 'en', 'tr') : '';

        setTitleTr(trTitle);
        setGenreTr(trGenre);
        setSynopsisTr(trSynopsis);
        setFavoriteQuoteTr(trQuote);

        if (titleEn) {
          translateTextWithAI(titleEn, 'en', 'tr').then(res => res && setTitleTr(res));
        }
        if (synopsisEn) {
          translateTextWithAI(synopsisEn, 'en', 'tr').then(res => res && setSynopsisTr(res));
        }
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-fill opposite language if blank
    const finalTitleTr = titleTr.trim() || translateTextSync(titleEn.trim(), 'en', 'tr') || titleEn.trim();
    const finalTitleEn = titleEn.trim() || translateTextSync(titleTr.trim(), 'tr', 'en') || titleTr.trim();
    
    if (!finalTitleTr && !finalTitleEn) return;
    if (!author.trim()) return;

    const finalGenreTr = genreTr.trim() || translateTextSync(genreEn.trim(), 'en', 'tr') || 'Edebi Kurgu';
    const finalGenreEn = genreEn.trim() || translateTextSync(genreTr.trim(), 'tr', 'en') || 'Literary Fiction';

    const finalSynopsisTr = synopsisTr.trim() || translateTextSync(synopsisEn.trim(), 'en', 'tr');
    const finalSynopsisEn = synopsisEn.trim() || translateTextSync(synopsisTr.trim(), 'tr', 'en');

    const finalQuoteTr = favoriteQuoteTr.trim() || (favoriteQuoteEn.trim() ? translateTextSync(favoriteQuoteEn.trim(), 'en', 'tr') : undefined);
    const finalQuoteEn = favoriteQuoteEn.trim() || (favoriteQuoteTr.trim() ? translateTextSync(favoriteQuoteTr.trim(), 'tr', 'en') : undefined);

    const finalCoverTr = coverImageUrlTr.trim() || coverImageUrlEn.trim() || bookToEdit?.coverImageUrlTr || bookToEdit?.coverImageUrl;
    const finalCoverEn = coverImageUrlEn.trim() || coverImageUrlTr.trim() || bookToEdit?.coverImageUrlEn || bookToEdit?.coverImageUrl;

    const themes = themesStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const bookId = bookToEdit?.id || `book-${Date.now()}`;

    const savedBook: Book = {
      ...(bookToEdit || {}),
      id: bookId,
      title: finalTitleTr,
      titleEn: finalTitleEn,
      originalTitle: originalTitle.trim() || undefined,
      author: author.trim(),
      year: Number(year) || 2025,
      pages: Number(pages) || 300,
      genre: finalGenreTr,
      genreEn: finalGenreEn,
      synopsis: finalSynopsisTr,
      synopsisEn: finalSynopsisEn,
      favoriteQuote: finalQuoteTr,
      favoriteQuoteEn: finalQuoteEn,
      suggesterId: suggesterId || members[0]?.id || 'eda-aydogan',
      suggesterName: suggesterName || members[0]?.name || 'Eda Aydoğan',
      month: month.trim(),
      monthEn: translateTextSync(month.trim(), 'tr', 'en') || month.trim(),
      monthTr: translateTextSync(month.trim(), 'en', 'tr') || month.trim(),
      isBookOfMonth: isBookOfMonth,
      coverColor: coverColor || '#2C3E50',
      accentColor: accentColor || '#E67E22',
      spineTextColor: spineTextColor || '#FFFFFF',
      coverPattern: bookToEdit?.coverPattern || 'arch',
      coverImageUrl: language === 'en' ? (finalCoverEn || finalCoverTr) : (finalCoverTr || finalCoverEn),
      coverImageUrlTr: finalCoverTr,
      coverImageUrlEn: finalCoverEn,
      rating: rating,
      themes: themes.length > 0 ? themes : ['Literature', 'Club Selection'],
      buyLinks: bookToEdit?.buyLinks || {
        tr: {
          store: 'Amazon TR',
          url: `https://www.amazon.com.tr/s?k=${encodeURIComponent(finalTitleTr)}`,
          language: 'TR',
          affiliateTag: 'edaydogannn-21'
        },
        en: {
          store: 'Amazon',
          url: `https://www.amazon.com/s?k=${encodeURIComponent(finalTitleEn)}`,
          language: 'EN',
          affiliateTag: 'edaydogannn-20'
        }
      },
      comments: bookToEdit?.comments || [],
      physicalDetails: bookToEdit?.physicalDetails || {
        binding: 'Paperback',
        thicknessMm: Math.max(18, Math.round(Number(pages) * 0.08)),
        format: '135 × 210 mm'
      }
    };

    onSaveBook(savedBook);
    onClose();
  };

  const handleDelete = () => {
    if (bookToEdit && onDeleteBook) {
      if (window.confirm(language === 'en' ? `Delete "${bookToEdit.title}" from club reading list?` : `"${bookToEdit.title}" kulüp okuma listesinden silinsin mi?`)) {
        onDeleteBook(bookToEdit.id);
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#FBFBFA] rounded-2xl shadow-2xl border border-stone-300 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center border border-amber-200">
              <BookOpen className="w-4 h-4 text-[#C45B38]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {isNew 
                  ? (language === 'en' ? 'Add New Book to Club Shelf' : 'Kulüp Rafına Yeni Kitap Ekle')
                  : (language === 'en' ? `Edit Book: ${bookToEdit.titleEn || bookToEdit.title}` : `Kitabı Düzenle: ${bookToEdit.title}`)}
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                {language === 'en' ? 'Bilingual Synchronization (TR & EN Auto-Updated)' : 'İki Dilli Eşzamanlama (TR & EN Otomatik Güncellenir)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bilingual Language Switcher Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-stone-100 border-b border-stone-200 text-xs">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <span className="font-semibold text-stone-700">
              {language === 'en' ? 'Edit Language:' : 'Düzenleme Dili:'}
            </span>
            <div className="inline-flex rounded-lg bg-stone-200 p-0.5 ml-1">
              <button
                type="button"
                onClick={() => setActiveTab('tr')}
                className={`px-3 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  activeTab === 'tr' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Türkçe (TR)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`px-3 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                  activeTab === 'en' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                English (EN)
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAutoTranslate(activeTab === 'tr' ? 'tr-to-en' : 'en-to-tr')}
            disabled={isTranslating}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title={activeTab === 'tr' ? 'Translate Turkish fields into English' : 'Translate English fields into Turkish'}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C45B38]" />
            <span>
              {isTranslating 
                ? (language === 'en' ? 'Translating...' : 'Çevriliyor...') 
                : activeTab === 'tr' 
                  ? 'TR → EN Çevir' 
                  : 'EN → TR Translate'}
            </span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Currently Reading / Book of the Month highlight toggle */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#C45B38]" />
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  {language === 'en' ? 'Book of the Month / Currently Reading' : 'Ayın Kitabı / Şu Anda Okunuyor'}
                </span>
                <span className="text-[11px] text-stone-600">
                  {language === 'en' ? 'Promote to homepage spotlight and hero indicator' : 'Anasayfa vitrinine ve şu an okunuyor rozetine yerleştir'}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isBookOfMonth}
                onChange={(e) => setIsBookOfMonth(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C45B38]"></div>
            </label>
          </div>

          {/* Bilingual Title Fields based on activeTab */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {activeTab === 'tr' ? 'Kitap Adı (Türkçe)' : 'Book Title (English)'} *
              </label>
              {activeTab === 'tr' ? (
                <input
                  type="text"
                  value={titleTr}
                  onChange={(e) => setTitleTr(e.target.value)}
                  placeholder="örn. Suçlu Doğmak"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 font-medium"
                  required
                />
              ) : (
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Born a Crime"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 font-medium"
                  required
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {activeTab === 'tr' ? 'Orijinal Adı / İngilizce Karşılığı' : 'Turkish Title Equivalent'}
              </label>
              {activeTab === 'tr' ? (
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Born a Crime"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              ) : (
                <input
                  type="text"
                  value={titleTr}
                  onChange={(e) => setTitleTr(e.target.value)}
                  placeholder="örn. Suçlu Doğmak"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {language === 'en' ? 'Author' : 'Yazar'} *
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Trevor Noah"
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {activeTab === 'tr' ? 'Tür (Türkçe)' : 'Genre (English)'}
              </label>
              {activeTab === 'tr' ? (
                <input
                  type="text"
                  value={genreTr}
                  onChange={(e) => setGenreTr(e.target.value)}
                  placeholder="örn. Anı / Hiciv"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              ) : (
                <input
                  type="text"
                  value={genreEn}
                  onChange={(e) => setGenreEn(e.target.value)}
                  placeholder="e.g. Memoir / Satire"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {language === 'en' ? 'Pages' : 'Sayfa'}
              </label>
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {language === 'en' ? 'Year' : 'Yıl'}
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {language === 'en' ? 'Rating' : 'Kulüp Puanı'}
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              >
                <option value={5}>★★★★★ (5/5)</option>
                <option value={4}>★★★★☆ (4/5)</option>
                <option value={3}>★★★☆☆ (3/5)</option>
                <option value={2}>★★☆☆☆ (2/5)</option>
                <option value={1}>★☆☆☆☆ (1/5)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {language === 'en' ? 'Suggested by Member' : 'Öneren Üye'}
              </label>
              <select
                value={suggesterId}
                onChange={handleMemberSelect}
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role.slice(0, 24)}...)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {language === 'en' ? 'Reading Month & Year' : 'Okuma Ayı ve Yılı'}
              </label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="e.g. October 2026"
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            </div>
          </div>

          {/* Cover Image & Presets for Active Tab */}
          <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-800">
                {activeTab === 'tr' ? 'Türkçe Kapak Görseli URL' : 'English Cover Image URL'}
              </label>
              <span className="text-[10px] text-stone-500 font-mono">
                {activeTab === 'tr' ? 'Türkçe arayüzde gösterilir' : 'Shown in English mode'}
              </span>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={activeTab === 'tr' ? coverImageUrlTr : coverImageUrlEn}
                onChange={(e) => {
                  if (activeTab === 'tr') {
                    setCoverImageUrlTr(e.target.value);
                  } else {
                    setCoverImageUrlEn(e.target.value);
                  }
                }}
                placeholder="/covers/suclu-dogmak.jpg or https://..."
                className="flex-1 text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono focus:outline-none"
              />
              {(activeTab === 'tr' ? coverImageUrlTr : coverImageUrlEn) && (
                <div className="w-12 h-16 bg-stone-200 rounded-md overflow-hidden border border-stone-300 shrink-0">
                  <img 
                    src={activeTab === 'tr' ? coverImageUrlTr : coverImageUrlEn} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] text-stone-500 font-mono uppercase block mb-1.5">
                {language === 'en' ? 'Quick Cover Presets:' : 'Hızlı Kapak Seçimi:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COVERS.map((preset) => {
                  const currentCover = activeTab === 'tr' ? coverImageUrlTr : coverImageUrlEn;
                  return (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        if (activeTab === 'tr') setCoverImageUrlTr(preset.url);
                        else setCoverImageUrlEn(preset.url);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                        currentCover === preset.url
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              {activeTab === 'tr' ? 'Özet & Kulüp Notu (Türkçe)' : 'Synopsis & Club Note (English)'}
            </label>
            {activeTab === 'tr' ? (
              <textarea
                rows={3}
                value={synopsisTr}
                onChange={(e) => setSynopsisTr(e.target.value)}
                placeholder="Kitap özeti ve kulüp değerlendirmesi..."
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            ) : (
              <textarea
                rows={3}
                value={synopsisEn}
                onChange={(e) => setSynopsisEn(e.target.value)}
                placeholder="Book synopsis and reading club commentary..."
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              {activeTab === 'tr' ? 'Öne Çıkan Alıntı (Türkçe)' : 'Favorite Quote (English)'}
            </label>
            {activeTab === 'tr' ? (
              <input
                type="text"
                value={favoriteQuoteTr}
                onChange={(e) => setFavoriteQuoteTr(e.target.value)}
                placeholder="Kitaptan unutulmaz bir cümle..."
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 italic"
              />
            ) : (
              <input
                type="text"
                value={favoriteQuoteEn}
                onChange={(e) => setFavoriteQuoteEn(e.target.value)}
                placeholder="A memorable line from the book..."
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 italic"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              {language === 'en' ? 'Themes (comma separated)' : 'Temalar (virgülle ayırın)'}
            </label>
            <input
              type="text"
              value={themesStr}
              onChange={(e) => setThemesStr(e.target.value)}
              placeholder="Apartheid, Humor, Identity, Resistance"
              className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
            {!isNew && onDeleteBook ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Delete Book' : 'Kitabı Sil'}</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'Vazgeç'}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C45B38] hover:bg-[#A84B2C] text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{language === 'en' ? 'Save Volume' : 'Kitabı Kaydet'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
