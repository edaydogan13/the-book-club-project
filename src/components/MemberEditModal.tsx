import React, { useState, useEffect } from 'react';
import { Member } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { X, Save, Trash2, Users, Linkedin, Sparkles, Upload, Camera } from 'lucide-react';

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

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [readingGoal2026, setReadingGoal2026] = useState('');
  const [currentlyReading, setCurrentlyReading] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [joinedYear, setJoinedYear] = useState('Founding Member (Nov 2025)');

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
    if (memberToEdit) {
      setName(memberToEdit.name);
      setRole(memberToEdit.role);
      setBio(memberToEdit.bio);
      setLinkedinUrl(memberToEdit.linkedinUrl);
      setAvatarUrl(memberToEdit.avatarUrl);
      setReadingGoal2026(memberToEdit.readingGoal2026);
      setCurrentlyReading(memberToEdit.currentlyReading);
      setFavoriteQuote(memberToEdit.favoriteQuote);
      setJoinedYear(memberToEdit.joinedYear || 'Founding Member (Nov 2025)');
    } else {
      setName('');
      setRole('Club Curator & Reader');
      setBio('');
      setLinkedinUrl('https://www.linkedin.com/in/');
      setAvatarUrl('/members/edaaydogan.jpg');
      setReadingGoal2026('24 books (12 completed)');
      setCurrentlyReading('Suçlu Doğmak by Trevor Noah');
      setFavoriteQuote('');
      setJoinedYear('Member (2026)');
    }
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const memberId = memberToEdit?.id || name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const updated: Member = {
      ...(memberToEdit || {
        favoriteGenres: ['Literary Fiction', 'Philosophy'],
        books: []
      }),
      id: memberId,
      name: name.trim(),
      role: role.trim(),
      bio: bio.trim(),
      linkedinUrl: linkedinUrl.trim(),
      avatarUrl: avatarUrl.trim() || '/members/edaaydogan.jpg',
      readingGoal2026: readingGoal2026.trim(),
      currentlyReading: currentlyReading.trim(),
      favoriteQuote: favoriteQuote.trim(),
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
                {language === 'en' ? 'Curator Directory & Library Ownership' : 'Küratör Dizini ve Kitaplık Sahibi'}
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
                {language === 'en' ? 'Role & Specialization' : 'Rol & Uzmanlık'}
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Founder & Literary Director"
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              {language === 'en' ? 'Biography / Profile Summary' : 'Biyografi / Profil Özeti'}
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1 flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>{language === 'en' ? 'LinkedIn Profile URL' : 'LinkedIn Profil Linki'}</span>
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/..."
              className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 font-mono"
            />
          </div>

          {/* Avatar Photo Upload & Presets */}
          <div className="p-4 bg-white border border-stone-300 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#C45B38]" />
                <span>{language === 'en' ? 'Profile Picture / Member Portrait' : 'Profil Fotoğrafı'}</span>
              </label>
              {avatarUrl && avatarUrl.startsWith('data:') && (
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  {language === 'en' ? '✓ Custom Upload Ready' : '✓ Yeni Görsel Yüklendi'}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Preview with Hover Upload Trigger */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-200 border-2 border-stone-300 shadow-xs shrink-0 group">
                <img
                  src={avatarUrl}
                  alt={name || 'Preview'}
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
                  <span>{language === 'en' ? 'Upload' : 'Yükle'}</span>
                </button>
              </div>

              {/* Upload Input & Drop Box */}
              <div className="flex-1 w-full space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="admin-modal-photo-file"
                />

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDropPhoto}
                  className={`border-2 border-dashed rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 transition-all ${
                    isDragging 
                      ? 'border-[#C45B38] bg-amber-50/70' 
                      : 'border-stone-300 bg-stone-50 hover:border-[#C45B38]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#C45B38] shrink-0 border border-stone-200">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-stone-800">
                        {language === 'en' ? 'Upload photo from device' : 'Cihazdan fotoğraf yükle'}
                      </p>
                      <p className="text-[10px] text-stone-500">
                        {language === 'en' ? 'PNG, JPG, WebP (Max 5MB)' : 'PNG, JPG, WebP (Maks 5MB)'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#C45B38] hover:bg-[#a94827] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                  >
                    {language === 'en' ? 'Upload Photo' : 'Fotoğraf Yükle'}
                  </button>
                </div>

                {uploadError && (
                  <p className="text-[11px] text-rose-600 font-medium">{uploadError}</p>
                )}

                {/* Direct URL input */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-stone-500 font-mono shrink-0">
                    {language === 'en' ? 'Or URL:' : 'Veya URL:'}
                  </span>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setUploadError(null);
                    }}
                    placeholder="/members/cemresirin.webp or https://..."
                    className="flex-1 text-[11px] p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono focus:outline-none focus:border-[#C45B38]"
                  />
                </div>
              </div>
            </div>

            {/* Existing Presets */}
            <div className="pt-2 border-t border-stone-200/80">
              <span className="text-[10px] text-stone-500 font-mono uppercase block mb-1.5">
                {language === 'en' ? 'Or choose existing member portrait:' : 'Veya mevcut üye portresi seçin:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(preset.url);
                      setUploadError(null);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                      avatarUrl === preset.url
                        ? 'bg-[#C45B38] text-white border-[#C45B38] font-semibold'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {language === 'en' ? '2026 Reading Target' : '2026 Okuma Hedefi'}
              </label>
              <input
                type="text"
                value={readingGoal2026}
                onChange={(e) => setReadingGoal2026(e.target.value)}
                placeholder="24 books (20 completed)"
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                {language === 'en' ? 'Currently Reading' : 'Şu Anda Okuyor'}
              </label>
              <input
                type="text"
                value={currentlyReading}
                onChange={(e) => setCurrentlyReading(e.target.value)}
                placeholder="Suçlu Doğmak by Trevor Noah"
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              {language === 'en' ? 'Favorite Quote' : 'Favori Alıntı'}
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
            {!isNew && onDeleteMember ? (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Delete Member' : 'Üyeyi Sil'}</span>
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
                <span>{language === 'en' ? 'Save Member' : 'Üyeyi Kaydet'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
