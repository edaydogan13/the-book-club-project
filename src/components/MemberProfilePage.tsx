import React, { useState } from 'react';
import { Member, Book, AuthUser } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { 
  getMemberRole, 
  getMemberBio, 
  getMemberQuote, 
  getMemberGoal, 
  getMemberCurrentlyReading, 
  getBookTitle, 
  getBookCover 
} from '../data/initialData';
import { translateTextSync, translateTextWithAI } from '../utils/translator';
import { 
  Linkedin, 
  ExternalLink, 
  Edit3, 
  Plus, 
  Save, 
  X, 
  BookMarked,
  Quote,
  Target,
  ShieldCheck,
  UserCheck,
  Lock,
  Trash2,
  Sparkles,
  Check,
  Star,
  BookOpen,
  Image as ImageIcon,
  Library,
  Flame,
  Upload,
  Camera,
  Layers,
  Grid,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TactileBookSpine } from './TactileBookSpine';

const PRESET_AVATARS = [
  { label: 'Cemre Şirin', url: '/members/cemresirin.webp?v=2' },
  { label: 'Eda Aydoğan', url: '/members/edaaydogan.jpg' },
  { label: 'Can Mert', url: '/members/canmert.jpg' },
  { label: 'Ferhat Babacan', url: '/members/ferhatbabacan.webp' },
  { label: 'Gizem Yeniçıkan', url: '/members/gizemyenicikan.jpg' },
  { label: 'Gökçe Nur Uysal', url: '/members/gokcenuruysal.jpg' },
];

const PRESET_COVERS = [
  { label: 'Classic Linen', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600' },
  { label: 'Leather Bound', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600' },
  { label: 'Modern Minimal', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600' },
  { label: 'Vintage Paper', url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=600' },
];

const PRESET_GENRES = [
  'Literary Fiction',
  'Philosophy',
  'Existentialism',
  'Magical Realism',
  'Dystopian',
  'Poetry',
  'World Literature',
  'Memoir',
  'Modern Classics',
  'History',
  'Psychology',
];

interface MemberProfilePageProps {
  members: Member[];
  selectedMemberId: string;
  onSelectMember: (id: string) => void;
  onUpdateMember: (updatedMember: Member) => void;
  onSelectBook: (book: Book) => void;
  language?: Language;
  isAdmin?: boolean;
  currentUser?: AuthUser | null;
  onOpenAdmin?: () => void;
  onOpenAuth?: () => void;
  onAddMember?: () => void;
  onDeleteMember?: (memberId: string) => void;
  clubBooks?: Book[];
  onAddBookToClub?: (book: Book) => void;
}

export const MemberProfilePage: React.FC<MemberProfilePageProps> = ({
  members,
  selectedMemberId,
  onSelectMember,
  onUpdateMember,
  onSelectBook,
  language = 'en',
  isAdmin = false,
  currentUser = null,
  onOpenAdmin,
  onOpenAuth,
  onAddMember,
  onDeleteMember,
  clubBooks = [],
  onAddBookToClub,
}) => {
  const t = TRANSLATIONS[language];
  const safeMembers = Array.isArray(members) ? members : [];
  const currentMember = safeMembers.find(m => m.id === selectedMemberId) || safeMembers[0] || null;
  const canEditCurrentProfile = Boolean(currentMember && (isAdmin || (currentUser?.role === 'member' && currentUser?.memberId === currentMember.id)));
  const isOwnProfile = Boolean(currentMember && currentUser?.role === 'member' && currentUser?.memberId === currentMember.id);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [bookFilter, setBookFilter] = useState<'all' | 'extra' | 'curated' | 'club'>('all');
  const [shelfViewMode, setShelfViewMode] = useState<'spines' | 'covers'>('spines');
  const shelfScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollShelf = (direction: 'left' | 'right') => {
    if (shelfScrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      shelfScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Edit form state
  const [editName, setEditName] = useState(currentMember?.name || '');
  const [editRole, setEditRole] = useState(currentMember?.role || '');
  const [editBio, setEditBio] = useState(currentMember?.bio || '');
  const [editLinkedin, setEditLinkedin] = useState(currentMember?.linkedinUrl || '');
  const [editAvatar, setEditAvatar] = useState(currentMember?.avatarUrl || '');
  const [editGoal, setEditGoal] = useState(currentMember?.readingGoal2026 || '');
  const [editCurrentReading, setEditCurrentReading] = useState(currentMember?.currentlyReading || '');
  const [editQuote, setEditQuote] = useState(currentMember?.favoriteQuote || '');
  const [editGenres, setEditGenres] = useState<string[]>(currentMember?.favoriteGenres || []);
  const [newGenreInput, setNewGenreInput] = useState('');

  const handleAddGenreTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (!editGenres.some(g => g.toLowerCase() === trimmed.toLowerCase())) {
      setEditGenres(prev => [...prev, trimmed]);
    }
    setNewGenreInput('');
  };

  const handleRemoveGenreTag = (tagToRemove: string) => {
    setEditGenres(prev => prev.filter(g => g !== tagToRemove));
  };
  
  // Profile photo upload state
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePhotoUpload = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError(language === 'en' ? 'Please select a valid image file.' : 'Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError(language === 'en' ? 'Image size must be under 5MB.' : 'Görsel boyutu 5MB altında olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setEditAvatar(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  const handleDropPhoto = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  // New book form state
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookYear, setNewBookYear] = useState(2025);
  const [newBookPages, setNewBookPages] = useState(320);
  const [newBookGenre, setNewBookGenre] = useState('Literary Fiction');
  const [newBookCoverUrl, setNewBookCoverUrl] = useState('');
  const [newBookColor, setNewBookColor] = useState('#2C3E50');
  const [newBookSynopsis, setNewBookSynopsis] = useState('');
  const [newBookQuote, setNewBookQuote] = useState('');
  const [newBookRating, setNewBookRating] = useState(5);
  const [alsoAddToClub, setAlsoAddToClub] = useState(true);

  // Sync edit form when switching members
  const handleSelectMember = (id: string) => {
    onSelectMember(id);
    const m = members.find(mem => mem.id === id);
    if (m) {
      setEditName(m.name);
      setEditRole(getMemberRole(m, language));
      setEditBio(getMemberBio(m, language));
      setEditLinkedin(m.linkedinUrl);
      setEditAvatar(m.avatarUrl);
      setEditGoal(getMemberGoal(m, language));
      setEditCurrentReading(getMemberCurrentlyReading(m, language));
      setEditQuote(getMemberQuote(m, language));
      setEditGenres(m.favoriteGenres || []);
      setNewGenreInput('');
      setIsEditing(false);
      setIsAddingBook(false);
      setBookFilter('all');
    }
  };

  // Automatically translate fields when language button is clicked
  const prevLangRef = React.useRef(language);
  React.useEffect(() => {
    if (prevLangRef.current !== language) {
      const fromLang = prevLangRef.current;
      const toLang = language;
      prevLangRef.current = language;

      if (isEditing) {
        // Automatically translate currently open editing inputs
        if (editRole) setEditRole(translateTextSync(editRole, fromLang, toLang));
        if (editBio) setEditBio(translateTextSync(editBio, fromLang, toLang));
        if (editQuote) setEditQuote(translateTextSync(editQuote, fromLang, toLang));
        if (editGoal) setEditGoal(translateTextSync(editGoal, fromLang, toLang));
        if (editCurrentReading) setEditCurrentReading(translateTextSync(editCurrentReading, fromLang, toLang));
      } else if (currentMember) {
        setEditName(currentMember.name);
        setEditRole(getMemberRole(currentMember, toLang));
        setEditBio(getMemberBio(currentMember, toLang));
        setEditLinkedin(currentMember.linkedinUrl);
        setEditAvatar(currentMember.avatarUrl);
        setEditGoal(getMemberGoal(currentMember, toLang));
        setEditCurrentReading(getMemberCurrentlyReading(currentMember, toLang));
        setEditQuote(getMemberQuote(currentMember, toLang));
        setEditGenres(currentMember.favoriteGenres || []);
      }
    }
  }, [language, isEditing, currentMember]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    let roleTr = '';
    let roleEn = '';
    let bioTr = '';
    let bioEn = '';
    let goalTr = '';
    let goalEn = '';
    let readingTr = '';
    let readingEn = '';
    let quoteTr = '';
    let quoteEn = '';

    if (language === 'en') {
      roleEn = editRole.trim();
      roleTr = translateTextSync(roleEn, 'en', 'tr');
      bioEn = editBio.trim();
      bioTr = translateTextSync(bioEn, 'en', 'tr');
      goalEn = editGoal.trim();
      goalTr = translateTextSync(goalEn, 'en', 'tr');
      readingEn = editCurrentReading.trim();
      readingTr = translateTextSync(readingEn, 'en', 'tr');
      quoteEn = editQuote.trim();
      quoteTr = editQuote.trim() ? translateTextSync(editQuote.trim(), 'en', 'tr') : '';
    } else {
      roleTr = editRole.trim();
      roleEn = translateTextSync(roleTr, 'tr', 'en');
      bioTr = editBio.trim();
      bioEn = translateTextSync(bioTr, 'tr', 'en');
      goalTr = editGoal.trim();
      goalEn = translateTextSync(goalTr, 'tr', 'en');
      readingTr = editCurrentReading.trim();
      readingEn = translateTextSync(readingTr, 'tr', 'en');
      quoteTr = editQuote.trim();
      quoteEn = editQuote.trim() ? translateTextSync(editQuote.trim(), 'tr', 'en') : '';
    }

    const updated: Member = {
      ...currentMember,
      name: editName.trim(),
      role: roleTr,
      roleEn: roleEn,
      bio: bioTr,
      bioEn: bioEn,
      favoriteGenres: editGenres,
      linkedinUrl: editLinkedin.trim(),
      avatarUrl: editAvatar.trim(),
      readingGoal2026: goalTr,
      readingGoal2026En: goalEn,
      currentlyReading: readingTr,
      currentlyReadingEn: readingEn,
      favoriteQuote: quoteTr,
      favoriteQuoteEn: quoteEn,
    };
    onUpdateMember(updated);
    setIsEditing(false);

    // If any field remained identical due to custom non-dictionary text, request AI batch translation in background
    const toL = language === 'en' ? 'tr' : 'en';
    const itemsToAiTranslate: Record<string, string> = {};
    if (language === 'en') {
      if (roleTr === roleEn && roleEn) itemsToAiTranslate['role'] = roleEn;
      if (bioTr === bioEn && bioEn) itemsToAiTranslate['bio'] = bioEn;
      if (quoteTr === quoteEn && quoteEn) itemsToAiTranslate['favoriteQuote'] = quoteEn;
    } else {
      if (roleEn === roleTr && roleTr) itemsToAiTranslate['roleEn'] = roleTr;
      if (bioEn === bioTr && bioTr) itemsToAiTranslate['bioEn'] = bioTr;
      if (quoteEn === quoteTr && quoteTr) itemsToAiTranslate['favoriteQuoteEn'] = quoteTr;
    }

    if (Object.keys(itemsToAiTranslate).length > 0) {
      fetch('/api/translate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToAiTranslate, to: toL })
      })
      .then(r => r.json())
      .then(data => {
        if (data.translated && typeof data.translated === 'object') {
          const aiUpdated: Member = { ...updated };
          if (data.translated.role) aiUpdated.role = data.translated.role;
          if (data.translated.bio) aiUpdated.bio = data.translated.bio;
          if (data.translated.favoriteQuote) aiUpdated.favoriteQuote = data.translated.favoriteQuote;
          if (data.translated.roleEn) aiUpdated.roleEn = data.translated.roleEn;
          if (data.translated.bioEn) aiUpdated.bioEn = data.translated.bioEn;
          if (data.translated.favoriteQuoteEn) aiUpdated.favoriteQuoteEn = data.translated.favoriteQuoteEn;
          onUpdateMember(aiUpdated);
        }
      })
      .catch(() => {});
    }
  };

  const handleAddBookToShelf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim() || !newBookAuthor.trim()) return;

    const bookId = `custom-${currentMember.id}-${Date.now()}`;

    let titleTr = '';
    let titleEn = '';
    let genreTr = '';
    let genreEn = '';
    let synopsisTr = '';
    let synopsisEn = '';
    let quoteTr = '';
    let quoteEn = '';

    if (language === 'en') {
      titleEn = newBookTitle.trim();
      titleTr = translateTextSync(titleEn, 'en', 'tr');
      genreEn = newBookGenre.trim() || 'Literature';
      genreTr = translateTextSync(genreEn, 'en', 'tr');
      synopsisEn = newBookSynopsis.trim() || `Curated by ${currentMember.name} for Books & Friends.`;
      synopsisTr = translateTextSync(synopsisEn, 'en', 'tr');
      quoteEn = newBookQuote.trim();
      quoteTr = quoteEn ? translateTextSync(quoteEn, 'en', 'tr') : '';
    } else {
      titleTr = newBookTitle.trim();
      titleEn = translateTextSync(titleTr, 'tr', 'en');
      genreTr = newBookGenre.trim() || 'Edebiyat';
      genreEn = translateTextSync(genreTr, 'tr', 'en');
      synopsisTr = newBookSynopsis.trim() || `${currentMember.name} tarafından Books & Friends için seçildi.`;
      synopsisEn = translateTextSync(synopsisTr, 'tr', 'en');
      quoteTr = newBookQuote.trim();
      quoteEn = quoteTr ? translateTextSync(quoteTr, 'tr', 'en') : '';
    }

    const newBook: Book = {
      id: bookId,
      title: titleTr,
      titleEn: titleEn,
      author: newBookAuthor.trim(),
      year: Number(newBookYear) || new Date().getFullYear(),
      pages: Number(newBookPages) || 280,
      genre: genreTr,
      genreEn: genreEn,
      synopsis: synopsisTr,
      synopsisEn: synopsisEn,
      favoriteQuote: quoteTr || undefined,
      favoriteQuoteEn: quoteEn || undefined,
      suggesterId: currentMember.id,
      suggesterName: currentMember.name,
      month: language === 'en' ? 'Personal Selection' : 'Kişisel Seçki',
      monthEn: 'Personal Selection',
      monthTr: 'Kişisel Seçki',
      coverColor: newBookColor,
      accentColor: '#C45B38',
      spineTextColor: '#FFFFFF',
      coverPattern: 'arch',
      coverImageUrl: newBookCoverUrl.trim() || undefined,
      coverImageUrlTr: newBookCoverUrl.trim() || undefined,
      coverImageUrlEn: newBookCoverUrl.trim() || undefined,
      rating: newBookRating,
      buyLinks: {
        tr: {
          store: 'Amazon TR',
          url: `https://www.amazon.com.tr/s?k=${encodeURIComponent(titleTr)}&tag=edaydogannn-21`,
          language: 'TR',
          price: '₺220',
          affiliateTag: 'edaydogannn-21'
        },
        en: {
          store: 'Amazon Global',
          url: `https://www.amazon.com/s?k=${encodeURIComponent(titleEn)}&tag=edaydogannn-20`,
          language: 'EN',
          price: '$18.00',
          affiliateTag: 'edaydogannn-20'
        }
      },
      comments: [
        {
          id: `comment-${Date.now()}`,
          authorName: currentMember.name,
          memberId: currentMember.id,
          rating: newBookRating,
          text: synopsisTr,
          textEn: synopsisEn,
          favoriteQuote: quoteTr || undefined,
          favoriteQuoteEn: quoteEn || undefined,
          timestamp: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'short', day: 'numeric', year: 'numeric' })
        }
      ],
      themes: [genreEn || genreTr],
      physicalDetails: {
        binding: 'Hardcover',
        thicknessMm: Math.max(14, Math.round((Number(newBookPages) || 280) / 12)),
        format: '14 × 21 cm'
      }
    };

    const updated: Member = {
      ...currentMember,
      books: [newBook, ...currentMember.books]
    };

    onUpdateMember(updated);

    // Also add to club shelf if requested
    if (alsoAddToClub && onAddBookToClub) {
      onAddBookToClub(newBook);
    }

    setIsAddingBook(false);
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookSynopsis('');
    setNewBookCoverUrl('');
    setNewBookQuote('');
    setNewBookPages(320);
    setNewBookYear(2025);

    if (language === 'en') {
      translateTextWithAI(titleEn, 'en', 'tr').then(aiTitleTr => {
        if (aiTitleTr && aiTitleTr !== titleTr) {
          const refinedBook = { ...newBook, title: aiTitleTr };
          const reUpdated: Member = {
            ...currentMember,
            books: [refinedBook, ...currentMember.books]
          };
          onUpdateMember(reUpdated);
        }
      });
    } else {
      translateTextWithAI(titleTr, 'tr', 'en').then(aiTitleEn => {
        if (aiTitleEn && aiTitleEn !== titleEn) {
          const refinedBook = { ...newBook, titleEn: aiTitleEn };
          const reUpdated: Member = {
            ...currentMember,
            books: [refinedBook, ...currentMember.books]
          };
          onUpdateMember(reUpdated);
        }
      });
    }
  };

  const handleRemoveBookFromMember = (bookId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentMember) return;
    const updated: Member = {
      ...currentMember,
      books: (currentMember.books || []).filter(b => b.id !== bookId)
    };
    onUpdateMember(updated);
  };

  // Curated check: checks if suggesterId matches or name matches
  const isCuratedByMember = (b: Book) => {
    return b.suggesterId === currentMember.id || 
           (currentMember && b.suggesterName && b.suggesterName.toLowerCase().includes(currentMember.name.split(' ')[0].toLowerCase()));
  };

  if (!currentMember) {
    return (
      <div className="w-full py-16 text-center text-stone-500 font-sans">
        <p>{language === 'en' ? 'Select a member profile to view their shelf.' : 'Kitaplığını görüntülemek için bir üye seçin.'}</p>
      </div>
    );
  }

  const isPersonalExtraBook = (b: Book) => Boolean(b.isPersonalExtra);
  const isCuratedClubBook = (b: Book) => isCuratedByMember(b) && !b.isPersonalExtra;

  const memberBooks = Array.isArray(currentMember.books) ? currentMember.books : [];
  const extraCount = memberBooks.filter(isPersonalExtraBook).length;
  const curatedCount = memberBooks.filter(isCuratedClubBook).length;
  const clubCount = memberBooks.length;

  const filteredBooks = memberBooks.filter(b => {
    if (bookFilter === 'extra') {
      return isPersonalExtraBook(b);
    }
    if (bookFilter === 'curated') {
      return isCuratedClubBook(b);
    }
    if (bookFilter === 'club') {
      return !isCuratedByMember(b) && !b.isPersonalExtra;
    }
    return true;
  });

  return (
    <div className="w-full py-6 sm:py-8 space-y-8">
      {/* Member Selector Bar & Pill Switcher */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-stone-500">
            Books & Friends · {language === 'en' ? 'Member Directory' : 'Üye Dizini'}
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
            {t.memberDirectoryTitle}
          </h2>
        </div>

        {/* Member Dropdown & Pill Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => handleSelectMember(member.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                member.id === currentMember.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-stone-300 overflow-hidden shrink-0">
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="whitespace-nowrap">{member.name}</span>
            </button>
          ))}

          {isAdmin && onAddMember && (
            <button
              type="button"
              onClick={onAddMember}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-colors shadow-xs cursor-pointer"
              title={language === 'en' ? 'Add New Member (Admin)' : 'Yeni Üye Ekle (Yönetici)'}
            >
              <Plus className="w-3.5 h-3.5 text-amber-800" />
              <span>{language === 'en' ? '+ Add Member' : '+ Üye Ekle'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Member Hero Profile Card */}
      <div className="relative bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-10 shadow-xs">
        {/* Admin/User Edit Button in corner */}
        <div className="absolute top-5 right-5 sm:top-6 sm:right-6">
          {canEditCurrentProfile ? (
            <button
              type="button"
              onClick={() => {
                if (!isEditing && currentMember) {
                  setEditName(currentMember.name);
                  setEditRole(getMemberRole(currentMember, language));
                  setEditBio(getMemberBio(currentMember, language));
                  setEditLinkedin(currentMember.linkedinUrl);
                  setEditAvatar(currentMember.avatarUrl);
                  setEditGoal(getMemberGoal(currentMember, language));
                  setEditCurrentReading(getMemberCurrentlyReading(currentMember, language));
                  setEditQuote(getMemberQuote(currentMember, language));
                  setEditGenres(currentMember.favoriteGenres || []);
                  setNewGenreInput('');
                }
                setIsEditing(!isEditing);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border cursor-pointer ${
                isAdmin 
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300 shadow-xs'
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> : <UserCheck className="w-3.5 h-3.5 text-emerald-700" />}
              <span>
                {isEditing 
                  ? t.memberCancelEdit 
                  : (isAdmin 
                      ? (language === 'en' ? 'Edit Profile (Admin)' : 'Profili Düzenle (Admin)')
                      : (language === 'en' ? 'Edit My Profile' : 'Profilimi Düzenle'))}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth || onOpenAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 transition-colors cursor-pointer"
              title={language === 'en' ? `Sign in as ${currentMember.name.split(' ')[0]} or Admin to edit` : `Düzenlemek için ${currentMember.name.split(' ')[0]} veya Yönetici olarak giriş yapın`}
            >
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>
                {language === 'en' ? 'Log in to Edit' : 'Düzenlemek İçin Giriş Yap'}
              </span>
            </button>
          )}
        </div>

        {isEditing ? (
          /* Profile Edit Mode */
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              {language === 'en' ? `Edit ${currentMember.name}'s Profile` : `${currentMember.name} Profilini Düzenle`}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">{language === 'en' ? 'Full Name' : 'Ad Soyad'}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">{t.memberRole}</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">{t.memberLinkedin}</label>
              <input
                type="url"
                value={editLinkedin}
                onChange={(e) => setEditLinkedin(e.target.value)}
                placeholder="https://www.linkedin.com/in/username"
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
              />
            </div>

            {/* Admin Member Photo Upload & Selector */}
            <div className="p-4 sm:p-5 bg-stone-50 border border-stone-300 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#C45B38]" />
                  <span>{language === 'en' ? 'Member Portrait Photo' : 'Üye Profil Fotoğrafı'}</span>
                </label>
                {editAvatar && editAvatar.startsWith('data:') && (
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    {language === 'en' ? '✓ New Photo Uploaded' : '✓ Yeni Fotoğraf Yüklendi'}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Photo Preview with Hover Upload Trigger */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-stone-200 border-2 border-stone-300 shadow-sm shrink-0 group">
                  <img
                    src={editAvatar}
                    alt={editName || 'Preview'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/members/edaaydogan.jpg';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-stone-950/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-medium transition-opacity cursor-pointer p-1 text-center"
                  >
                    <Upload className="w-4 h-4 mb-1" />
                    <span>{language === 'en' ? 'Click to Change' : 'Değiştir'}</span>
                  </button>
                </div>

                {/* File Upload Zone */}
                <div className="flex-1 w-full space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="admin-member-photo-file"
                  />

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDropPhoto}
                    className={`border-2 border-dashed rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 transition-all ${
                      isDragging 
                        ? 'border-[#C45B38] bg-amber-50/70' 
                        : 'border-stone-300 bg-white hover:border-[#C45B38]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-[#C45B38] shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-stone-800">
                          {language === 'en' ? 'Upload photo from device' : 'Cihazdan fotoğraf yükle'}
                        </p>
                        <p className="text-[10px] text-stone-500">
                          {language === 'en' ? 'PNG, JPG, WebP, GIF (Max 5MB)' : 'PNG, JPG, WebP (Maks 5MB)'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-[#C45B38] hover:bg-[#a94827] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      {language === 'en' ? 'Upload Photo' : 'Fotoğraf Yükle'}
                    </button>
                  </div>

                  {uploadError && (
                    <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
                  )}

                  {/* Or Manual URL Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-stone-500 font-mono shrink-0">
                      {language === 'en' ? 'Or image URL:' : 'Veya görsel URL:'}
                    </span>
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => {
                        setEditAvatar(e.target.value);
                        setUploadError(null);
                      }}
                      placeholder="https://... or /members/..."
                      className="flex-1 text-[11px] p-2 bg-white border border-stone-200 rounded-lg font-mono focus:outline-none focus:border-[#C45B38]"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Member Avatars */}
              <div className="pt-2 border-t border-stone-200/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 block mb-1.5">
                  {language === 'en' ? 'Or choose existing member portrait:' : 'Veya mevcut üye portresi seçin:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_AVATARS.map((p) => (
                    <button
                      key={p.url}
                      type="button"
                      onClick={() => {
                        setEditAvatar(p.url);
                        setUploadError(null);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer flex items-center gap-1.5 ${
                        editAvatar === p.url
                          ? 'bg-[#C45B38] text-white border-[#C45B38] font-semibold'
                          : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">{t.memberBio}</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">{t.memberGoal}</label>
                <input
                  type="text"
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  placeholder="36 books (28 completed)"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">{t.memberOnDesk}</label>
                <input
                  type="text"
                  value={editCurrentReading}
                  onChange={(e) => setEditCurrentReading(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">{language === 'en' ? 'Guiding Quote' : 'Yol Gösterici Alıntı'}</label>
              <input
                type="text"
                value={editQuote}
                onChange={(e) => setEditQuote(e.target.value)}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
              />
            </div>

            {/* Curatorial Focus & Profile Tags Editor */}
            <div className="p-4 sm:p-5 bg-stone-50 border border-stone-300 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C45B38]" />
                    <span>{language === 'en' ? 'Curatorial Focus & Profile Tags' : 'İlgi Alanları & Profil Tür Etiketleri'}</span>
                  </label>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {language === 'en' 
                      ? 'Add, edit, or remove the reading themes and genres shown on your profile.' 
                      : 'Profilinizde görünen edebi tür ve okuma ilgi alanlarını ekleyin veya kaldırın.'}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-stone-400">
                  {editGenres.length} {language === 'en' ? 'tags' : 'etiket'}
                </span>
              </div>

              {/* Active Tags Chip List with delete (x) */}
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white border border-stone-200 rounded-xl">
                {editGenres.length === 0 ? (
                  <span className="text-[11px] text-stone-400 italic">
                    {language === 'en' ? 'No tags yet. Add tags below or pick from recommendations.' : 'Henüz etiket eklenmedi. Aşağıdan ekleyin veya önerilerden seçin.'}
                  </span>
                ) : (
                  editGenres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-950 border border-amber-300 rounded-lg text-xs font-medium"
                    >
                      <span>{genre}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGenreTag(genre)}
                        className="text-amber-700 hover:text-rose-700 p-0.5 rounded-xs transition-colors cursor-pointer"
                        title={language === 'en' ? `Remove ${genre}` : `${genre} etiketini kaldır`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Custom Tag Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newGenreInput}
                  onChange={(e) => setNewGenreInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGenreTag(newGenreInput);
                    }
                  }}
                  placeholder={language === 'en' ? 'Type custom tag (e.g. Continental Philosophy)...' : 'Özel etiket yazın (örn. Kıta Felsefesi)...'}
                  className="flex-1 text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                />
                <button
                  type="button"
                  onClick={() => handleAddGenreTag(newGenreInput)}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap shadow-xs"
                >
                  {language === 'en' ? '+ Add Tag' : '+ Etiket Ekle'}
                </button>
              </div>

              {/* Suggested Preset Tags */}
              <div className="pt-2 border-t border-stone-200/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1.5">
                  {language === 'en' ? 'Recommended Literary Tags:' : 'Önerilen Edebi Etiketler:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_GENRES.map((preset) => {
                    const isAdded = editGenres.some(g => g.toLowerCase() === preset.toLowerCase());
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            handleRemoveGenreTag(preset);
                          } else {
                            handleAddGenreTag(preset);
                          }
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                          isAdded
                            ? 'bg-[#C45B38] text-white border-[#C45B38] font-medium shadow-xs'
                            : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        <span>{preset}</span>
                        {isAdded ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5 opacity-60" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Manage Profile Bookshelf (Remove Books Option) */}
            <div className="p-4 sm:p-5 bg-stone-50 border border-stone-300 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
                    <Library className="w-4 h-4 text-[#C45B38]" />
                    <span>{language === 'en' ? 'Manage Bookshelf (Remove Books)' : 'Profil Kitaplığını Yönet (Kitap Kaldırma)'}</span>
                  </label>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {language === 'en'
                      ? `Remove any book from ${currentMember.name}'s library. Collective club anthology stays untouched.`
                      : `${currentMember.name}'ın kütüphanesinden kitap kaldırın. Ortak kulüp arşivi korunur.`}
                  </p>
                </div>
                <span className="text-[11px] font-mono text-stone-500 font-semibold">
                  {currentMember.books?.length || 0} {language === 'en' ? 'books on shelf' : 'kitap'}
                </span>
              </div>

              {(!currentMember.books || currentMember.books.length === 0) ? (
                <div className="p-4 bg-white rounded-xl border border-stone-200 text-center text-xs text-stone-400 italic">
                  {language === 'en' ? 'No books currently on this member shelf.' : 'Bu üyenin rafında henüz kitap bulunmuyor.'}
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {currentMember.books.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3 hover:border-stone-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Cover Swatch / Image */}
                        <div
                          className="w-8 h-11 rounded-md shrink-0 border border-stone-200 overflow-hidden relative shadow-xs flex items-center justify-center"
                          style={{ backgroundColor: b.coverColor || '#2C3E50' }}
                        >
                          {getBookCover(b, language) ? (
                            <img
                              src={getBookCover(b, language)}
                              alt={getBookTitle(b, language)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[8px] font-mono text-white font-bold opacity-80 uppercase">
                              {b.pages}p
                            </span>
                          )}
                        </div>

                        {/* Title and Author */}
                        <div className="min-w-0">
                          <p className="font-serif text-xs font-bold text-stone-900 truncate">
                            {getBookTitle(b, language)}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">
                            {b.author} · {b.year} · {b.pages} {t.pagesUnit}
                          </p>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveBookFromMember(b.id, e)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 border border-rose-200 hover:border-rose-300 rounded-lg text-xs font-medium cursor-pointer transition-colors shrink-0 shadow-xs"
                        title={language === 'en' ? `Remove "${getBookTitle(b, language)}" from ${currentMember.name}'s bookshelf` : `"${getBookTitle(b, language)}" kitabını ${currentMember.name}'ın rafından kaldır`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>{language === 'en' ? 'Remove from Shelf' : 'Raftan Kaldır'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t.memberSaveProfile}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-300 cursor-pointer"
              >
                {t.memberCancelEdit}
              </button>

              {isAdmin && onDeleteMember && members.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(language === 'en' ? `Delete ${currentMember.name}?` : `${currentMember.name} silinsin mi?`)) {
                      onDeleteMember(currentMember.id);
                      setIsEditing(false);
                    }
                  }}
                  className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Delete Member' : 'Üyeyi Sil'}</span>
                </button>
              )}
            </div>
          </form>
        ) : (
          /* Profile Display Mode */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Member Portrait & Social */}
            <div className="md:col-span-4 flex flex-col items-center sm:items-start">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-md border-2 border-stone-100 bg-stone-200">
                <img
                  src={currentMember.avatarUrl}
                  alt={currentMember.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* LinkedIn & Links */}
              <div className="mt-4 w-full">
                <a
                  href={currentMember.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 w-full justify-center sm:justify-start px-3.5 py-2 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/15 text-[#0A66C2] rounded-xl text-xs font-semibold transition-colors border border-[#0A66C2]/20"
                >
                  <Linkedin className="w-4 h-4 fill-current" />
                  <span>LinkedIn {language === 'en' ? 'Background' : 'Profili'}</span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
                </a>
              </div>

              {/* Reading Stats */}
              <div className="w-full mt-4 p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-stone-500" />
                    <span>{t.memberGoal}</span>
                  </span>
                  <span className="font-semibold text-stone-900">{getMemberGoal(currentMember, language)}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600 border-t border-stone-200 pt-2">
                  <span className="flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5 text-stone-500" />
                    <span>{t.memberOnDesk}</span>
                  </span>
                  <span className="font-medium text-stone-800 truncate max-w-[150px]">
                    {getMemberCurrentlyReading(currentMember, language)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Bio & Curatorial Philosophy */}
            <div className="md:col-span-8 space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#C45B38] font-semibold">
                  {getMemberRole(currentMember, language)}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 leading-tight mt-0.5">
                  {currentMember.name}
                </h1>
              </div>

              <p className="text-sm text-stone-600 leading-relaxed">
                {getMemberBio(currentMember, language)}
              </p>

              {/* Guiding Quote */}
              <div className="p-3.5 bg-amber-50/50 rounded-xl border-l-2 border-[#C45B38]">
                <Quote className="w-3.5 h-3.5 text-[#C45B38] mb-1" />
                <p className="font-serif italic text-stone-800 text-xs sm:text-sm">
                  “{getMemberQuote(currentMember, language)}”
                </p>
              </div>

              {/* Favorite Literary Focus */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block mb-1.5">
                  {language === 'en' ? 'Curatorial Focus & Genres' : 'İlgi Alanları & Türler'}
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {currentMember.favoriteGenres.map((g, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md border border-stone-200"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Member's Personal Bookshelf & Library */}
      <div className="relative">
        {/* Shelf Action Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 px-1">
          <div>
            <div className="flex items-center gap-2">
              <Library className="w-5 h-5 text-[#C45B38]" />
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                {currentMember.name}{t.memberPersonalShelf}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {language === 'en' 
                ? `${filteredBooks.length} editions shown · ${extraCount > 0 ? `${extraCount} personal extra reads since Nov 2025` : 'curated volumes & club reads'}` 
                : `${filteredBooks.length} eser gösteriliyor · ${extraCount > 0 ? `${extraCount} kişisel ekstra okuma (Kasım 2025+)` : 'seçkiler ve kulüp okumaları'}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle: Spines vs Covers */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setShelfViewMode('spines')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  shelfViewMode === 'spines'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title={language === 'en' ? 'Tactile Spines View' : 'Dokunsal Sırt Görünümü'}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Spine View' : 'Sırt Görünümü'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShelfViewMode('covers')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  shelfViewMode === 'covers'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title={language === 'en' ? 'Grid Covers View' : 'Kapak Görünümü'}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Cover Grid' : 'Kapaklar'}</span>
              </button>
            </div>

            {canEditCurrentProfile ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRemoveMode(!isRemoveMode);
                    if (isAddingBook) setIsAddingBook(false);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer border ${
                    isRemoveMode
                      ? 'bg-rose-700 text-white border-rose-800 shadow-xs ring-2 ring-rose-400'
                      : 'bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border-stone-300'
                  }`}
                  title={language === 'en' ? 'Remove a book from this shelf' : 'Bu raftan bir kitap kaldır'}
                >
                  <Trash2 className={`w-3.5 h-3.5 ${isRemoveMode ? 'text-white' : 'text-rose-600'}`} />
                  <span>
                    {isRemoveMode 
                      ? (language === 'en' ? 'Done Removing' : 'Kaldırmayı Bitir') 
                      : (language === 'en' ? 'Remove Book' : 'Kitap Kaldır')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddingBook(!isAddingBook);
                    if (isRemoveMode) setIsRemoveMode(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#C45B38] text-white rounded-xl hover:bg-[#a94827] transition-all shadow-sm cursor-pointer hover:shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? '+ Add New Book' : '+ Yeni Kitap Ekle'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth || onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl transition-all cursor-pointer"
                title={language === 'en' ? `Log in as ${currentMember.name.split(' ')[0]} to manage shelf` : `Rafı yönetmek için ${currentMember.name.split(' ')[0]} olarak giriş yapın`}
              >
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span>{language === 'en' ? 'Manage Shelf (Log In)' : 'Rafı Yönet (Giriş Yap)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Remove Mode Guidance Banner */}
        {isRemoveMode && (
          <div className="mb-4 p-3 bg-rose-50/90 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-rose-700" />
              </div>
              <div>
                <p className="font-semibold text-rose-950">
                  {language === 'en' ? 'Remove Book Option Active' : 'Kitap Kaldırma Modu Aktif'}
                </p>
                <p className="text-[11px] text-rose-700">
                  {language === 'en'
                    ? `Click any volume or its trash badge on this shelf to remove it from ${currentMember.name}'s library. (Collective club books remain safe).`
                    : `Bu raftaki herhangi bir kitaba veya çöp kutusu simgesine tıklayarak ${currentMember.name}'ın kitaplığından kaldırabilirsiniz. (Kulüp ortak arşivi korunur).`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsRemoveMode(false)}
              className="px-3 py-1.5 bg-white hover:bg-rose-100 text-rose-900 font-semibold border border-rose-300 rounded-lg text-xs cursor-pointer shrink-0 transition-colors"
            >
              {language === 'en' ? 'Done' : 'Bitti'}
            </button>
          </div>
        )}

        {/* Filter Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3 mb-4">
          <button
            type="button"
            onClick={() => setBookFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              bookFilter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {language === 'en' ? 'All Shelf Volumes' : 'Tüm Ciltler'} ({clubCount})
          </button>

          {extraCount > 0 && (
            <button
              type="button"
              onClick={() => setBookFilter('extra')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                bookFilter === 'extra'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-950 hover:bg-amber-100 border border-amber-300'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{language === 'en' ? 'Personal Extra Reads (Nov 2025+)' : 'Ekstra Okumalar (Kasım 2025+)'} ({extraCount})</span>
            </button>
          )}

          {curatedCount > 0 && (
            <button
              type="button"
              onClick={() => setBookFilter('curated')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                bookFilter === 'curated'
                  ? 'bg-[#C45B38] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{language === 'en' ? `Curated by ${currentMember.name.split(' ')[0]}` : `${currentMember.name.split(' ')[0]} Seçkisi`} ({curatedCount})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setBookFilter('club')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              bookFilter === 'club'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {language === 'en' ? 'Club Anthology Read Together' : 'Ortak Kulüp Okumaları'} ({clubCount - curatedCount - extraCount})
          </button>
        </div>

        {/* Add Book to Personal Shelf Form */}
        {isAddingBook && (
          <form onSubmit={handleAddBookToShelf} className="p-5 sm:p-7 bg-white rounded-2xl border-2 border-[#C45B38]/30 shadow-xl mb-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C45B38]" />
                <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  {language === 'en' ? `Add a New Book to ${currentMember.name}'s Shelf` : `${currentMember.name}'ın Kütüphanesine Yeni Kitap Ekle`}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingBook(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer p-1 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'en' ? 'Book Title *' : 'Kitap Adı *'}
                </label>
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="e.g. Saatleri Ayarlama Enstitüsü"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'en' ? 'Author *' : 'Yazar *'}
                </label>
                <input
                  type="text"
                  value={newBookAuthor}
                  onChange={(e) => setNewBookAuthor(e.target.value)}
                  placeholder="e.g. Ahmet Hamdi Tanpınar"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'en' ? 'Publication Year' : 'Yayın Yılı'}
                </label>
                <input
                  type="number"
                  value={newBookYear}
                  onChange={(e) => setNewBookYear(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'en' ? 'Page Count' : 'Sayfa Sayısı'}
                </label>
                <input
                  type="number"
                  value={newBookPages}
                  onChange={(e) => setNewBookPages(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'en' ? 'Genre' : 'Tür'}
                </label>
                <input
                  type="text"
                  value={newBookGenre}
                  onChange={(e) => setNewBookGenre(e.target.value)}
                  placeholder="e.g. Philosophy, Modern Classic"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            {/* Cover Image URL & Presets */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {language === 'en' ? 'Cover Image URL (Optional)' : 'Kapak Görseli URL (İsteğe bağlı)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newBookCoverUrl}
                  onChange={(e) => setNewBookCoverUrl(e.target.value)}
                  placeholder="https://... or select a preset below"
                  className="flex-1 text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                />
                {newBookCoverUrl && (
                  <button
                    type="button"
                    onClick={() => setNewBookCoverUrl('')}
                    className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg cursor-pointer"
                  >
                    {language === 'en' ? 'Clear' : 'Temizle'}
                  </button>
                )}
              </div>

              {/* Presets thumbnail selector */}
              <div className="mt-2.5">
                <span className="text-[11px] text-stone-500 font-mono block mb-1.5">
                  {language === 'en' ? 'Or pick a quick cover preset:' : 'Veya hazır bir kapak seçin:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COVERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewBookCoverUrl(preset.url)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border cursor-pointer transition-colors ${
                        newBookCoverUrl === preset.url
                          ? 'bg-[#C45B38] text-white border-[#C45B38]'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3 opacity-70" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'en' ? 'Favorite Quote from Book' : 'Kitaptan Sevilen Alıntı'}
                </label>
                <input
                  type="text"
                  value={newBookQuote}
                  onChange={(e) => setNewBookQuote(e.target.value)}
                  placeholder="e.g. You are here..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {language === 'en' ? 'Spine Palette Color' : 'Cilt / Sırt Rengi'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newBookColor}
                    onChange={(e) => setNewBookColor(e.target.value)}
                    className="w-12 h-9 p-0.5 bg-stone-50 border border-stone-300 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono text-stone-600">{newBookColor}</span>
                  <div 
                    className="w-6 h-6 rounded-md shadow-xs border border-stone-300"
                    style={{ backgroundColor: newBookColor }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {language === 'en' ? 'Curator’s Note / Synopsis' : 'Küratör Notu / Açıklama'}
              </label>
              <textarea
                rows={2}
                value={newBookSynopsis}
                onChange={(e) => setNewBookSynopsis(e.target.value)}
                placeholder={language === 'en' ? `Why is this book meaningful to ${currentMember.name}?` : `Bu kitap ${currentMember.name} için neden özel?`}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
              />
            </div>

            {/* Checkbox: Also add to Collective Club Shelf */}
            <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <input
                type="checkbox"
                id="alsoAddToClub"
                checked={alsoAddToClub}
                onChange={(e) => setAlsoAddToClub(e.target.checked)}
                className="w-4 h-4 text-[#C45B38] rounded-xs cursor-pointer accent-[#C45B38]"
              />
              <label htmlFor="alsoAddToClub" className="text-xs text-stone-800 font-medium cursor-pointer">
                {language === 'en' 
                  ? 'Also add this book to the collective Books & Friends shelf' 
                  : 'Bu kitabı Books & Friends ortak kitaplığına da ekle'}
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#C45B38] hover:bg-[#a94827] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors"
              >
                {language === 'en' ? 'Save & Add Book to Library' : 'Kitabı Kütüphaneye Ekle'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddingBook(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'İptal'}
              </button>
            </div>
          </form>
        )}

        {/* Shelf Presentation: Tactile Spine View OR 2D Cover Grid View */}
        {filteredBooks.length === 0 ? (
          <div className="py-12 bg-stone-50 rounded-2xl border border-stone-200 text-center text-stone-500 space-y-3">
            <p className="text-xs italic">
              {language === 'en' ? 'No books matching this filter.' : 'Bu filtreye uygun kitap bulunamadı.'}
            </p>
            <button
              type="button"
              onClick={() => setBookFilter('all')}
              className="px-3.5 py-1.5 text-xs bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 font-medium cursor-pointer"
            >
              {language === 'en' ? 'Show All Volumes' : 'Tüm Ciltleri Göster'}
            </button>
          </div>
        ) : shelfViewMode === 'spines' ? (
          /* TACTILE SPINE VIEW */
          <div className="relative w-full rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#FAF8F5] to-[#F3EFEA] border border-[#E8E2D7] p-4 sm:p-8 overflow-hidden shadow-xs">
            {/* Subtle architectural wall backlight glow */}
            <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />

            {/* Navigation Scroll Buttons */}
            <button
              type="button"
              onClick={() => scrollShelf('left')}
              aria-label="Scroll shelf left"
              className="absolute left-2 sm:left-4 top-[48%] -translate-y-1/2 z-30 p-2 rounded-full bg-white/95 text-stone-700 shadow-md hover:bg-stone-900 hover:text-white transition-all backdrop-blur-xs border border-stone-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollShelf('right')}
              aria-label="Scroll shelf right"
              className="absolute right-2 sm:right-4 top-[48%] -translate-y-1/2 z-30 p-2 rounded-full bg-white/95 text-stone-700 shadow-md hover:bg-stone-900 hover:text-white transition-all backdrop-blur-xs border border-stone-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Horizontal Scrollable Shelf of Vertical Standing Book Spines */}
            <div
              ref={shelfScrollRef}
              className="flex items-end gap-2.5 sm:gap-4 overflow-x-auto px-6 sm:px-12 pt-16 pb-2 scroll-smooth no-scrollbar select-none"
              style={{
                minHeight: '360px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {filteredBooks.map((book) => (
                <TactileBookSpine
                  key={book.id}
                  book={book}
                  onSelect={isRemoveMode ? (b) => handleRemoveBookFromMember(b.id) : onSelectBook}
                  onRemove={canEditCurrentProfile ? handleRemoveBookFromMember : undefined}
                  isRemoveMode={isRemoveMode}
                  language={language}
                />
              ))}

              {/* Add Volume Bookend Button */}
              <button
                type="button"
                onClick={() => setIsAddingBook(true)}
                className="h-[270px] w-12 sm:w-14 shrink-0 rounded-t-[4px] rounded-b-[2px] border-2 border-dashed border-stone-400 hover:border-[#C45B38] bg-white/40 hover:bg-white/80 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-xs"
                title={language === 'en' ? '+ Add New Volume to Shelf' : '+ Rafa Yeni Cilt Ekle'}
              >
                <Plus className="w-4 h-4 text-stone-500 group-hover:text-[#C45B38] transition-colors" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-stone-500 group-hover:text-[#C45B38] [writing-mode:vertical-rl] rotate-180">
                  {language === 'en' ? '+ ADD VOLUME' : '+ CİLT EKLE'}
                </span>
              </button>
            </div>

            {/* Architectural Wooden Shelf Ledge */}
            <div className="relative w-full z-20">
              {/* Top Ledge Surface */}
              <div className="h-5 w-full shelf-ledge rounded-t-xs" />
              {/* Front Beveled Face of the Wooden Shelf */}
              <div className="h-6 w-full bg-[#C8C1B3] border-t border-white/50 border-b border-[#A89F90] flex items-center justify-between px-4 text-[11px] font-mono text-[#5A5245] shadow-sm">
                <span className="tracking-widest uppercase font-semibold">
                  {currentMember.name.toUpperCase()} — {language === 'en' ? 'PERSONAL LIBRARY LEDGER' : 'KİŞİSEL KÜTÜPHANE RAFI'}
                </span>
                <span className="hidden sm:inline opacity-75">
                  {filteredBooks.length} {t.shelfEditions} · {language === 'en' ? 'Solid Birch Spine Rack' : 'Doğal Huş Ağacı'}
                </span>
              </div>
              {/* Under-shelf cast shadow */}
              <div className="h-4 w-full bg-gradient-to-b from-[#1C1917]/15 to-transparent" />
            </div>

            {/* Bottom guidance */}
            <div className="mt-3 flex items-center justify-between text-xs text-stone-500 px-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {language === 'en' 
                    ? 'Hover any spine for details · Click to open reader notes & discussions' 
                    : 'Detaylar için sırtın üzerine gelin · Yorum ve alıntıları görmek için tıklayın'}
                </span>
              </span>
              <span className="font-mono text-[11px] text-stone-400">
                {filteredBooks.length} {t.shelfEditions}
              </span>
            </div>
          </div>
        ) : (
          /* 2D COVERS GRID VIEW */
          <div className="p-5 sm:p-6 bg-stone-50/80 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-serif text-lg font-bold text-stone-900">
                  {bookFilter === 'extra'
                    ? `${currentMember.name} — ${language === 'en' ? 'Personal Extra Reads (Nov 2025+)' : 'Kulüp İçi Ekstra Okumalar'}`
                    : bookFilter === 'curated'
                    ? `${currentMember.name} — ${language === 'en' ? 'Curated Selections' : 'Önerilen Seçkiler'}`
                    : bookFilter === 'club'
                    ? (language === 'en' ? 'Club Anthology Read Together' : 'Birlikte Okunan Kulüp Eserleri')
                    : `${currentMember.name} — ${language === 'en' ? 'Complete Library' : 'Eksiksiz Kütüphane'}`}
                  <span className="ml-2 text-sm text-stone-500 font-normal">({filteredBooks.length} {language === 'en' ? 'books' : 'kitap'})</span>
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">
                  {language === 'en' 
                    ? 'Click any volume to read discussions, book quotes, and reviews.' 
                    : 'Detayları, kulüp tartışmalarını ve alıntıları görmek için kitaba tıklayın.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredBooks.map((b) => {
                const isExtra = Boolean(b.isPersonalExtra);
                const isCurated = isCuratedClubBook(b);
                return (
                  <div
                    key={b.id}
                    onClick={isRemoveMode ? () => handleRemoveBookFromMember(b.id) : () => onSelectBook(b)}
                    className={`group bg-white p-3 rounded-2xl border transition-all cursor-pointer flex flex-col relative ${
                      isRemoveMode
                        ? 'border-rose-400 bg-rose-50/30 shadow-md ring-2 ring-rose-300 hover:border-rose-600'
                        : 'border-stone-200 hover:border-[#C45B38]/50 hover:shadow-md'
                    }`}
                  >
                    {/* Badge Strip */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start max-w-[85%]">
                      {isExtra && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-amber-800 text-white shadow-xs">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          <span>{language === 'en' ? 'Extra Read' : 'Ekstra Okuma'}</span>
                        </span>
                      )}
                      {isCurated && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#C45B38] text-white shadow-xs backdrop-blur-xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{language === 'en' ? 'Curated' : 'Öneri'}</span>
                        </span>
                      )}
                      {b.isBookOfMonth && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-stone-900 text-amber-300 shadow-xs">
                          <Flame className="w-2.5 h-2.5" />
                          <span>{language === 'en' ? 'Now Reading' : 'Okunuyor'}</span>
                        </span>
                      )}
                    </div>

                    {/* Delete button (only for member profile bookshelf) */}
                    {canEditCurrentProfile && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveBookFromMember(b.id, e)}
                        title={language === 'en' ? `Remove "${getBookTitle(b, language)}" from this shelf` : `"${getBookTitle(b, language)}" kitabını bu raftan kaldır`}
                        className={`absolute top-4 right-4 z-20 p-1.5 rounded-md cursor-pointer transition-all ${
                          isRemoveMode
                            ? 'opacity-100 bg-rose-600 text-white shadow-md ring-2 ring-rose-300 scale-105 animate-pulse'
                            : 'opacity-0 group-hover:opacity-100 bg-stone-900/80 hover:bg-rose-600 text-white shadow-xs'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Book Cover Image with resilient typographic underlay */}
                    <div 
                      className="aspect-[2/3] w-full rounded-xl overflow-hidden mb-2.5 relative border border-stone-200 shadow-xs flex flex-col justify-between p-2.5 text-white"
                      style={{ backgroundColor: b.coverColor || '#2C3E50' }}
                    >
                      <div className="flex justify-between items-start text-[9px] font-mono opacity-80 uppercase z-10">
                        <span>{b.year}</span>
                        <span>{b.pages}p</span>
                      </div>
                      <div className="z-10">
                        <span className="font-serif text-white text-xs font-bold leading-tight line-clamp-2 block">{getBookTitle(b, language)}</span>
                        <span className="text-[10px] text-stone-200 mt-0.5 line-clamp-1 block">{b.author}</span>
                      </div>
                      {getBookCover(b, language) ? (
                        <img
                          src={getBookCover(b, language)}
                          alt={getBookTitle(b, language)}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-20"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-stone-900/5 group-hover:bg-transparent transition-colors pointer-events-none z-30" />
                    </div>

                    {/* Book Information */}
                    <h5 className="font-serif text-xs font-bold text-stone-900 group-hover:text-[#C45B38] line-clamp-1 transition-colors">
                      {getBookTitle(b, language)}
                    </h5>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{b.author}</p>
                    
                    <div className="mt-auto pt-2 flex items-center justify-between text-[10px] font-mono text-stone-400 border-t border-stone-100">
                      <span>{b.year}</span>
                      <span>{b.pages} {t.pagesUnit}</span>
                    </div>
                  </div>
                );
              })}

              {/* Quick Add Volume Card */}
              <button
                type="button"
                onClick={() => setIsAddingBook(true)}
                className="group border-2 border-dashed border-stone-300 hover:border-[#C45B38] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer min-h-[180px] bg-white/50 hover:bg-white transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-stone-100 group-hover:bg-amber-100 group-hover:text-[#C45B38] text-stone-500 flex items-center justify-center transition-colors mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-serif text-xs font-bold text-stone-800 group-hover:text-[#C45B38]">
                  {language === 'en' ? '+ Add New Book' : '+ Yeni Kitap Ekle'}
                </span>
                <span className="text-[10px] text-stone-400 mt-1 max-w-[120px]">
                  {language === 'en' ? `Expand ${currentMember.name.split(' ')[0]}'s collection` : 'Koleksiyonu genişlet'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
