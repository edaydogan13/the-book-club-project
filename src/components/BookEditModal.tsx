import React, { useState, useEffect } from 'react';
import { Book, Member } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { X, Save, Trash2, Star, BookOpen, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

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
  { label: 'Duvar (Marlen Haushofer)', url: '/covers/duvar.jpg' },
  { label: 'Venedik\'te Ölüm (Thomas Mann)', url: '/covers/venedikte-olum.jpg' },
  { label: 'Zaman Sığınağı (Georgi Gospodinov)', url: '/covers/zaman-siginagi.jpg' },
  { label: 'Gece Yarısı Kütüphanesi (Matt Haig)', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Algı Kapıları (Aldous Huxley)', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80' },
  { label: 'Naval Ravikant (Eric Jorgenson)', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80' },
  { label: 'Beşinci Anlaşma (Don Miguel Ruiz)', url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=600&q=80' },
  { label: 'Designing Your Life (Evans & Burnett)', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=600&q=80' },
  { label: 'Vitrinde Yaşamak (Nurdan Gürbilek)', url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80' },
  { label: 'İstanbul (Orhan Pamuk)', url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80' },
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

  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState(2025);
  const [pages, setPages] = useState(300);
  const [genre, setGenre] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [suggesterName, setSuggesterName] = useState('');
  const [suggesterId, setSuggesterId] = useState('');
  const [month, setMonth] = useState('October 2026');
  const [isBookOfMonth, setIsBookOfMonth] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverColor, setCoverColor] = useState('#2C3E50');
  const [accentColor, setAccentColor] = useState('#E67E22');
  const [spineTextColor, setSpineTextColor] = useState('#FFFFFF');
  const [rating, setRating] = useState(5);
  const [themesStr, setThemesStr] = useState('');

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setOriginalTitle(bookToEdit.originalTitle || '');
      setAuthor(bookToEdit.author);
      setYear(bookToEdit.year);
      setPages(bookToEdit.pages);
      setGenre(bookToEdit.genre);
      setSynopsis(bookToEdit.synopsis);
      setFavoriteQuote(bookToEdit.favoriteQuote || '');
      setSuggesterName(bookToEdit.suggesterName);
      setSuggesterId(bookToEdit.suggesterId);
      setMonth(bookToEdit.month);
      setIsBookOfMonth(!!bookToEdit.isBookOfMonth);
      setCoverImageUrl(bookToEdit.coverImageUrl || '');
      setCoverColor(bookToEdit.coverColor || '#2C3E50');
      setAccentColor(bookToEdit.accentColor || '#E67E22');
      setSpineTextColor(bookToEdit.spineTextColor || '#FFFFFF');
      setRating(bookToEdit.rating || 5);
      setThemesStr((bookToEdit.themes || []).join(', '));
    } else {
      // New book defaults
      setTitle('');
      setOriginalTitle('');
      setAuthor('');
      setYear(2025);
      setPages(320);
      setGenre('Literary Fiction');
      setSynopsis('');
      setFavoriteQuote('');
      setSuggesterName(members[0]?.name || 'Eda Aydoğan');
      setSuggesterId(members[0]?.id || 'eda-aydogan');
      setMonth('November 2026');
      setIsBookOfMonth(false);
      setCoverImageUrl('');
      setCoverColor('#1A365D');
      setAccentColor('#F6AD55');
      setSpineTextColor('#FFFFFF');
      setRating(5);
      setThemesStr('Memory, Identity, Society');
    }
  }, [bookToEdit, isOpen, members]);

  if (!isOpen) return null;

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memberId = e.target.value;
    const selected = members.find(m => m.id === memberId);
    if (selected) {
      setSuggesterId(selected.id);
      setSuggesterName(selected.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    const themes = themesStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const bookId = bookToEdit?.id || `book-${Date.now()}`;

    const savedBook: Book = {
      ...(bookToEdit || {}),
      id: bookId,
      title: title.trim(),
      originalTitle: originalTitle.trim() || undefined,
      author: author.trim(),
      year: Number(year) || 2025,
      pages: Number(pages) || 300,
      genre: genre.trim(),
      synopsis: synopsis.trim(),
      favoriteQuote: favoriteQuote.trim() || undefined,
      suggesterId: suggesterId || members[0]?.id || 'eda-aydogan',
      suggesterName: suggesterName || members[0]?.name || 'Eda Aydoğan',
      month: month.trim(),
      isBookOfMonth: isBookOfMonth,
      coverColor: coverColor || '#2C3E50',
      accentColor: accentColor || '#E67E22',
      spineTextColor: spineTextColor || '#FFFFFF',
      coverPattern: bookToEdit?.coverPattern || 'arch',
      coverImageUrl: coverImageUrl.trim() || undefined,
      rating: rating,
      themes: themes.length > 0 ? themes : ['Literature', 'Club Selection'],
      buyLinks: bookToEdit?.buyLinks || {
        tr: {
          store: 'Amazon TR',
          url: `https://www.amazon.com.tr/s?k=${encodeURIComponent(title)}`,
          language: 'TR',
          affiliateTag: 'edaydogannn-21'
        },
        en: {
          store: 'Amazon',
          url: `https://www.amazon.com/s?k=${encodeURIComponent(title)}`,
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
                  : (language === 'en' ? `Edit Book: ${bookToEdit.title}` : `Kitabı Düzenle: ${bookToEdit.title}`)}
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                {language === 'en' ? 'Full Volume Details & Attributes' : 'Detaylı Cilt Özellikleri ve Ayarları'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {language === 'en' ? 'Title (Turkish or Translated)' : 'Kitap Adı'} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Suçlu Doğmak"
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {language === 'en' ? 'Original Title' : 'Orijinal Adı'}
              </label>
              <input
                type="text"
                value={originalTitle}
                onChange={(e) => setOriginalTitle(e.target.value)}
                placeholder="e.g. Born a Crime"
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
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
                {language === 'en' ? 'Genre' : 'Tür'}
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Memoir / Social Satire"
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
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

          {/* Cover Image & Presets */}
          <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
            <label className="block text-xs font-semibold text-stone-800">
              {language === 'en' ? 'Book Cover Image URL' : 'Kapak Görseli URL'}
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="/covers/suclu-dogmak.jpg or https://..."
                className="flex-1 text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono focus:outline-none"
              />
              {coverImageUrl && (
                <div className="w-12 h-16 bg-stone-200 rounded-md overflow-hidden border border-stone-300 shrink-0">
                  <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] text-stone-500 font-mono uppercase block mb-1.5">
                {language === 'en' ? 'Quick Cover Presets:' : 'Hızlı Kapak Seçimi:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COVERS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setCoverImageUrl(preset.url)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                      coverImageUrl === preset.url
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
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

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              {language === 'en' ? 'Synopsis & Club Note' : 'Özet & Kulüp Notu'}
            </label>
            <textarea
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              {language === 'en' ? 'Favorite Quote' : 'Öne Çıkan Alıntı'}
            </label>
            <input
              type="text"
              value={favoriteQuote}
              onChange={(e) => setFavoriteQuote(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 italic"
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
                className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'İptal'}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'en' ? 'Save Book' : 'Kitabı Kaydet'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
