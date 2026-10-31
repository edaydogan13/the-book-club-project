import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { X, Save, Trash2, Users, Linkedin, Sparkles, Upload, Camera, Globe } from 'lucide-react';
import { translateTextSync, translateTextWithAI, translateMemberBilingualSync } from '../utils/translator';

interface MemberEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit: Member | null; // null if adding new member
  onSaveMember: (member: Member) => void;
  onDeleteMember?: (memberId: string) => void;
  language: Language;
}

const PRESET_AVATARS = [
  { label: 'Cemre Şirin', url: '/members/cemresirin.webp?v=2' },
  { label: 'Eda Aydoğan', url: '/members/edaaydogan.jpg' },
  { label: 'Can Mert', url: '/members/canmert.jpg' },
  { label: 'Ferhat Babacan', url: '/members/ferhatbabacan.webp' },
  { label: 'Gizem Yeniçıkan', url: '/members/gizemyenicikan.jpg' },
  { label: 'Gökçe Nur Uysal', url: '/members/gokcenuruysal.jpg' },
];

export const MemberEditModal: React.FC<MemberEditModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  onSaveMember,
  onDeleteMember,
  language,
}) => {
  const isNew = !memberToEdit;
  const [activeTab, setActiveTab] = useState<'tr' | 'en'>(language === 'en' ? 'en' : 'tr');

  const [name, setName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [joinedYear, setJoinedYear] = useState('Founding Member (Nov 2025)');

  // Bilingual fields
  const [roleTr, setRoleTr] = useState('');
  const [roleEn, setRoleEn] = useState('');
  const [bioTr, setBioTr] = useState('');
  const [bioEn, setBioEn] = useState('');
  const [goalTr, setGoalTr] = useState('');
  const [goalEn, setGoalEn] = useState('');
  const [readingTr, setReadingTr] = useState('');
  const [readingEn, setReadingEn] = useState('');
  const [quoteTr, setQuoteTr] = useState('');
  const [quoteEn, setQuoteEn] = useState('');

  const [isTranslating, setIsTranslating] = useState(false);

  // Upload photo states
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
        setAvatarUrl(dataUrl);
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

  useEffect(() => {
    setActiveTab(language === 'en' ? 'en' : 'tr');
    if (memberToEdit) {
      const sanitized = translateMemberBilingualSync(memberToEdit);
      setName(sanitized.name);
      setLinkedinUrl(sanitized.linkedinUrl);
      setAvatarUrl(sanitized.avatarUrl);
      setJoinedYear(sanitized.joinedYear || 'Founding Member (Nov 2025)');

      setRoleTr(sanitized.role || '');
      setRoleEn(sanitized.roleEn || '');
      setBioTr(sanitized.bio || '');
      setBioEn(sanitized.bioEn || '');
      setGoalTr(sanitized.readingGoal2026 || '');
      setGoalEn(sanitized.readingGoal2026En || '');
      setReadingTr(sanitized.currentlyReading || '');
      setReadingEn(sanitized.currentlyReadingEn || '');
      setQuoteTr(sanitized.favoriteQuote || '');
      setQuoteEn(sanitized.favoriteQuoteEn || '');
    } else {
      setName('');
      setLinkedinUrl('https://www.linkedin.com/in/');
      setAvatarUrl('/members/edaaydogan.jpg');
      setJoinedYear('Member (2026)');

      setRoleTr('Kulüp Küratörü & Okur');
      setRoleEn('Club Curator & Reader');
      setBioTr('');
      setBioEn('');
      setGoalTr('24 kitap (12 tamamlandı)');
      setGoalEn('24 books (12 completed)');
      setReadingTr('Suçlu Doğmak by Trevor Noah');
      setReadingEn('Born a Crime by Trevor Noah');
      setQuoteTr('');
      setQuoteEn('');
    }
  }, [memberToEdit, isOpen, language]);

  if (!isOpen) return null;

  const handleAutoTranslate = async (direction: 'tr-to-en' | 'en-to-tr') => {
    setIsTranslating(true);
    try {
      if (direction === 'tr-to-en') {
        const transRole = translateTextSync(roleTr, 'tr', 'en');
        const transBio = translateTextSync(bioTr, 'tr', 'en');
        const transGoal = translateTextSync(goalTr, 'tr', 'en');
        const transReading = translateTextSync(readingTr, 'tr', 'en');
        const transQuote = quoteTr ? translateTextSync(quoteTr, 'tr', 'en') : '';

        setRoleEn(transRole);
        setBioEn(transBio);
        setGoalEn(transGoal);
        setReadingEn(transReading);
        setQuoteEn(transQuote);

        if (bioTr) translateTextWithAI(bioTr, 'tr', 'en').then(res => res && setBioEn(res));
      } else {
        const transRole = translateTextSync(roleEn, 'en', 'tr');
        const transBio = translateTextSync(bioEn, 'en', 'tr');
        const transGoal = translateTextSync(goalEn, 'en', 'tr');
        const transReading = translateTextSync(readingEn, 'en', 'tr');
        const transQuote = quoteEn ? translateTextSync(quoteEn, 'en', 'tr') : '';

        setRoleTr(transRole);
        setBioTr(transBio);
        setGoalTr(transGoal);
        setReadingTr(transReading);
        setQuoteTr(transQuote);

        if (bioEn) translateTextWithAI(bioEn, 'en', 'tr').then(res => res && setBioTr(res));
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const memberId = memberToEdit?.id || name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const finalRoleTr = roleTr.trim() || translateTextSync(roleEn.trim(), 'en', 'tr') || 'Kulüp Küratörü & Okur';
    const finalRoleEn = roleEn.trim() || translateTextSync(roleTr.trim(), 'tr', 'en') || 'Club Curator & Reader';

    const finalBioTr = bioTr.trim() || translateTextSync(bioEn.trim(), 'en', 'tr');
    const finalBioEn = bioEn.trim() || translateTextSync(bioTr.trim(), 'tr', 'en');

    const finalGoalTr = goalTr.trim() || translateTextSync(goalEn.trim(), 'en', 'tr') || '24 kitap (12 tamamlandı)';
    const finalGoalEn = goalEn.trim() || translateTextSync(goalTr.trim(), 'tr', 'en') || '24 books (12 completed)';

    const finalReadingTr = readingTr.trim() || translateTextSync(readingEn.trim(), 'en', 'tr');
    const finalReadingEn = readingEn.trim() || translateTextSync(readingTr.trim(), 'tr', 'en');

    const finalQuoteTr = quoteTr.trim() || (quoteEn.trim() ? translateTextSync(quoteEn.trim(), 'en', 'tr') : '');
    const finalQuoteEn = quoteEn.trim() || (quoteTr.trim() ? translateTextSync(quoteTr.trim(), 'tr', 'en') : '');

    const updated: Member = {
      ...(memberToEdit || {
        favoriteGenres: ['Literary Fiction', 'Philosophy'],
        books: []
      }),
      id: memberId,
      name: name.trim(),
      role: finalRoleTr,
      roleEn: finalRoleEn,
      bio: finalBioTr,
      bioEn: finalBioEn,
      linkedinUrl: linkedinUrl.trim(),
      avatarUrl: avatarUrl.trim() || '/members/edaaydogan.jpg',
      readingGoal2026: finalGoalTr,
      readingGoal2026En: finalGoalEn,
      currentlyReading: finalReadingTr,
      currentlyReadingEn: finalReadingEn,
      favoriteQuote: finalQuoteTr,
      favoriteQuoteEn: finalQuoteEn,
      joinedYear: joinedYear.trim(),
    };

    onSaveMember(updated);
    onClose();
  };

  const handleDelete = () => {
    if (memberToEdit && onDeleteMember) {
      if (window.confirm(language === 'en' ? `Remove ${memberToEdit.name} from club members?` : `${memberToEdit.name} kulüp üyelerinden çıkarılsın mı?`)) {
        onDeleteMember(memberToEdit.id);
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
              <Users className="w-4 h-4 text-[#C45B38]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {isNew 
                  ? (language === 'en' ? 'Add New Club Member' : 'Yeni Kulüp Üyesi Ekle')
                  : (language === 'en' ? `Edit Member Profile: ${memberToEdit.name}` : `Üye Profilini Düzenle: ${memberToEdit.name}`)}
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                {language === 'en' ? 'Bilingual Curator Profile & Library' : 'İki Dilli Küratör Profili ve Kitaplık'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {language === 'en' ? 'Full Name' : 'Ad Soyad'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eda Aydoğan"
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {activeTab === 'tr' ? 'Kulüp Rolü (Türkçe)' : 'Club Role (English)'}
              </label>
              {activeTab === 'tr' ? (
                <input
                  type="text"
                  value={roleTr}
                  onChange={(e) => setRoleTr(e.target.value)}
                  placeholder="örn. Kulüp Kurucusu & Moderatör"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              ) : (
                <input
                  type="text"
                  value={roleEn}
                  onChange={(e) => setRoleEn(e.target.value)}
                  placeholder="e.g. Club Host & Founder"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              )}
            </div>
          </div>

          {/* Photo Upload & Presets */}
          <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
            <label className="block text-xs font-semibold text-stone-800">
              {language === 'en' ? 'Profile Photo' : 'Profil Fotoğrafı'}
            </label>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-stone-300 shrink-0 bg-stone-100 shadow-xs">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Upload Photo' : 'Fotoğraf Yükle'}</span>
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-[10px] text-stone-500 font-mono uppercase block mb-1">
                {language === 'en' ? 'Or choose existing member photo:' : 'Veya mevcut üye görseli seçin:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setAvatarUrl(preset.url)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                      avatarUrl === preset.url
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
              {activeTab === 'tr' ? 'Biyografi (Türkçe)' : 'Curator Bio (English)'}
            </label>
            {activeTab === 'tr' ? (
              <textarea
                rows={3}
                value={bioTr}
                onChange={(e) => setBioTr(e.target.value)}
                placeholder="Üyenin edebi ilgileri, okuma alışkanlıkları ve kulüp deneyimi..."
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            ) : (
              <textarea
                rows={3}
                value={bioEn}
                onChange={(e) => setBioEn(e.target.value)}
                placeholder="Curator's literary journey, reading habits, and club commentary..."
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {activeTab === 'tr' ? '2026 Okuma Hedefi (Türkçe)' : '2026 Reading Goal (English)'}
              </label>
              {activeTab === 'tr' ? (
                <input
                  type="text"
                  value={goalTr}
                  onChange={(e) => setGoalTr(e.target.value)}
                  placeholder="örn. 24 kitap (12 tamamlandı)"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              ) : (
                <input
                  type="text"
                  value={goalEn}
                  onChange={(e) => setGoalEn(e.target.value)}
                  placeholder="e.g. 24 books (12 completed)"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {activeTab === 'tr' ? 'Şu An Ne Okuyor? (Türkçe)' : 'Currently Reading (English)'}
              </label>
              {activeTab === 'tr' ? (
                <input
                  type="text"
                  value={readingTr}
                  onChange={(e) => setReadingTr(e.target.value)}
                  placeholder="örn. Suçlu Doğmak — Trevor Noah"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              ) : (
                <input
                  type="text"
                  value={readingEn}
                  onChange={(e) => setReadingEn(e.target.value)}
                  placeholder="e.g. Born a Crime by Trevor Noah"
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              {activeTab === 'tr' ? 'Favori Alıntı (Türkçe)' : 'Favorite Literary Quote (English)'}
            </label>
            {activeTab === 'tr' ? (
              <input
                type="text"
                value={quoteTr}
                onChange={(e) => setQuoteTr(e.target.value)}
                placeholder="Sevdiğiniz edebi bir alıntı..."
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 italic"
              />
            ) : (
              <input
                type="text"
                value={quoteEn}
                onChange={(e) => setQuoteEn(e.target.value)}
                placeholder="A memorable line from literature..."
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 italic"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              {language === 'en' ? 'LinkedIn Profile URL' : 'LinkedIn Profil Linki'}
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/..."
              className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
            {!isNew && onDeleteMember ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Remove Member' : 'Üyeyi Çıkar'}</span>
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
                <span>{language === 'en' ? 'Save Member' : 'Üyeyi Kaydet'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
