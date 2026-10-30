import React, { useState, useEffect } from 'react';
import { SiteContent } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { X, Save, RotateCcw, Sparkles, Type, BarChart2, Bell } from 'lucide-react';
import { INITIAL_SITE_CONTENT } from '../data/initialData';
import { translateTextSync, translateTextWithAI } from '../utils/translator';

interface EditSiteContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteContent: SiteContent;
  onSave: (updated: SiteContent) => void;
  language: Language;
}

export const EditSiteContentModal: React.FC<EditSiteContentModalProps> = ({
  isOpen,
  onClose,
  siteContent,
  onSave,
  language,
}) => {
  const [formData, setFormData] = useState<SiteContent>(siteContent);
  const [activeTab, setActiveTab] = useState<'hero' | 'stats' | 'general'>('hero');
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (language === 'en') {
      setFormData({
        ...siteContent,
        heroCities: siteContent.heroCitiesEn || siteContent.heroCities,
        heroLine1: siteContent.heroLine1En || siteContent.heroLine1,
        heroAccent: siteContent.heroAccentEn || siteContent.heroAccent,
        heroLine2: siteContent.heroLine2En || siteContent.heroLine2,
        heroSubtitle: siteContent.heroSubtitleEn || siteContent.heroSubtitle,
        statBooksLabel: siteContent.statBooksLabelEn || siteContent.statBooksLabel,
        statPagesLabel: siteContent.statPagesLabelEn || siteContent.statPagesLabel,
        statMembersLabel: siteContent.statMembersLabelEn || siteContent.statMembersLabel,
        announcement: siteContent.announcementEn || siteContent.announcement,
      });
    } else {
      setFormData(siteContent);
    }
  }, [siteContent, isOpen, language]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteContent = { ...formData };

    if (language === 'en') {
      updated.heroCitiesEn = formData.heroCities;
      updated.heroLine1En = formData.heroLine1;
      updated.heroAccentEn = formData.heroAccent;
      updated.heroLine2En = formData.heroLine2;
      updated.heroSubtitleEn = formData.heroSubtitle;
      updated.statBooksLabelEn = formData.statBooksLabel;
      updated.statPagesLabelEn = formData.statPagesLabel;
      updated.statMembersLabelEn = formData.statMembersLabel;
      updated.announcementEn = formData.announcement;

      updated.heroCities = translateTextSync(formData.heroCities, 'en', 'tr');
      updated.heroLine1 = translateTextSync(formData.heroLine1, 'en', 'tr');
      updated.heroAccent = translateTextSync(formData.heroAccent, 'en', 'tr');
      updated.heroLine2 = translateTextSync(formData.heroLine2, 'en', 'tr');
      updated.heroSubtitle = translateTextSync(formData.heroSubtitle, 'en', 'tr');
      updated.statBooksLabel = translateTextSync(formData.statBooksLabel, 'en', 'tr');
      updated.statPagesLabel = translateTextSync(formData.statPagesLabel, 'en', 'tr');
      updated.statMembersLabel = translateTextSync(formData.statMembersLabel, 'en', 'tr');
      updated.announcement = formData.announcement ? translateTextSync(formData.announcement, 'en', 'tr') : '';
    } else {
      updated.heroCities = formData.heroCities;
      updated.heroLine1 = formData.heroLine1;
      updated.heroAccent = formData.heroAccent;
      updated.heroLine2 = formData.heroLine2;
      updated.heroSubtitle = formData.heroSubtitle;
      updated.statBooksLabel = formData.statBooksLabel;
      updated.statPagesLabel = formData.statPagesLabel;
      updated.statMembersLabel = formData.statMembersLabel;
      updated.announcement = formData.announcement;

      updated.heroCitiesEn = translateTextSync(formData.heroCities, 'tr', 'en');
      updated.heroLine1En = translateTextSync(formData.heroLine1, 'tr', 'en');
      updated.heroAccentEn = translateTextSync(formData.heroAccent, 'tr', 'en');
      updated.heroLine2En = translateTextSync(formData.heroLine2, 'tr', 'en');
      updated.heroSubtitleEn = translateTextSync(formData.heroSubtitle, 'tr', 'en');
      updated.statBooksLabelEn = translateTextSync(formData.statBooksLabel, 'tr', 'en');
      updated.statPagesLabelEn = translateTextSync(formData.statPagesLabel, 'tr', 'en');
      updated.statMembersLabelEn = translateTextSync(formData.statMembersLabel, 'tr', 'en');
      updated.announcementEn = formData.announcement ? translateTextSync(formData.announcement, 'tr', 'en') : '';
    }

    onSave(updated);
    onClose();
  };

  const handleResetDefaults = () => {
    if (window.confirm(language === 'en' ? 'Reset site text & stats to defaults?' : 'Site metinleri ve istatistikleri varsayılana sıfırlansın mı?')) {
      setFormData(INITIAL_SITE_CONTENT);
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
              <Type className="w-4 h-4 text-[#C45B38]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {language === 'en' ? 'Edit Website Content & Statistics' : 'Site İçeriği ve İstatistikleri Düzenle'}
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                {language === 'en' ? 'Live Admin Content Editor' : 'Canlı Yönetici İçerik Editörü'}
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-stone-200 bg-stone-50 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {language === 'en' ? 'Hero & Headlines' : 'Başlık & Giriş'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {language === 'en' ? 'Club Stats & Counters' : 'İstatistikler & Sayaçlar'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'general'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {language === 'en' ? 'Brand & Announcement' : 'Marka & Duyuru'}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  {language === 'en' ? 'Cities Tagline & Established Date' : 'Şehirler ve Kuruluş Tarihi'}
                </label>
                <input
                  type="text"
                  value={formData.heroCities}
                  onChange={(e) => setFormData({ ...formData, heroCities: e.target.value })}
                  className="w-full text-xs font-mono p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                  required
                />
                <span className="text-[10px] text-stone-500 mt-1 block">
                  {language === 'en' ? 'Displayed above headline (e.g. ISTANBUL · DUBAI · NYC · EST. NOV 2025)' : 'Başlık üstünde görüntülenir'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    {language === 'en' ? 'Headline Line 1' : 'Başlık 1. Satır'}
                  </label>
                  <input
                    type="text"
                    value={formData.heroLine1}
                    onChange={(e) => setFormData({ ...formData, heroLine1: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    {language === 'en' ? 'Accent Italic Text' : 'Vurgulu İtalik Metin'}
                  </label>
                  <input
                    type="text"
                    value={formData.heroAccent}
                    onChange={(e) => setFormData({ ...formData, heroAccent: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500 text-[#C45B38] font-serif"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    {language === 'en' ? 'Headline Line 2' : 'Başlık 2. Satır'}
                  </label>
                  <input
                    type="text"
                    value={formData.heroLine2}
                    onChange={(e) => setFormData({ ...formData, heroLine2: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  {language === 'en' ? 'Hero Subtitle' : 'Giriş Açıklama Paragrafı'}
                </label>
                <textarea
                  rows={3}
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  {language === 'en' ? 'Club Start Date' : 'Kitap Kulübü Başlangıç Tarihi'}
                </label>
                <input
                  type="text"
                  value={formData.clubStartDate}
                  onChange={(e) => setFormData({ ...formData, clubStartDate: e.target.value })}
                  className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-500"
                  required
                />
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-500">
                {language === 'en' ? 'Customize the three key counters displayed on the homepage:' : 'Anasayfada gösterilen üç temel sayacı güncelleyin:'}
              </p>

              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs uppercase font-semibold text-stone-700">
                  <BarChart2 className="w-3.5 h-3.5 text-[#C45B38]" />
                  <span>1. {language === 'en' ? 'Books Read Counter' : 'Okunan Kitap Sayacı'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">{language === 'en' ? 'Value' : 'Değer'}</label>
                    <input
                      type="text"
                      value={formData.statBooksCount}
                      onChange={(e) => setFormData({ ...formData, statBooksCount: e.target.value })}
                      className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg font-serif text-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">{language === 'en' ? 'Label' : 'Etiket'}</label>
                    <input
                      type="text"
                      value={formData.statBooksLabel}
                      onChange={(e) => setFormData({ ...formData, statBooksLabel: e.target.value })}
                      className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs uppercase font-semibold text-stone-700">
                  <BarChart2 className="w-3.5 h-3.5 text-[#C45B38]" />
                  <span>2. {language === 'en' ? 'Pages Turned Counter' : 'Çevrilen Sayfa Sayacı'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">{language === 'en' ? 'Value' : 'Değer'}</label>
                    <input
                      type="text"
                      value={formData.statPagesCount}
                      onChange={(e) => setFormData({ ...formData, statPagesCount: e.target.value })}
                      className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg font-serif text-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">{language === 'en' ? 'Label' : 'Etiket'}</label>
                    <input
                      type="text"
                      value={formData.statPagesLabel}
                      onChange={(e) => setFormData({ ...formData, statPagesLabel: e.target.value })}
                      className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 font-mono text-xs uppercase font-semibold text-stone-700">
                  <BarChart2 className="w-3.5 h-3.5 text-[#C45B38]" />
                  <span>3. {language === 'en' ? 'Members Counter' : 'Üye Sayacı'}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">{language === 'en' ? 'Value' : 'Değer'}</label>
                    <input
                      type="text"
                      value={formData.statMembersCount}
                      onChange={(e) => setFormData({ ...formData, statMembersCount: e.target.value })}
                      className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg font-serif text-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">{language === 'en' ? 'Label' : 'Etiket'}</label>
                    <input
                      type="text"
                      value={formData.statMembersLabel}
                      onChange={(e) => setFormData({ ...formData, statMembersLabel: e.target.value })}
                      className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    {language === 'en' ? 'Brand Name' : 'Marka Adı'}
                  </label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-800 mb-1">
                    {language === 'en' ? 'Tagline' : 'Slogan'}
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-white border border-stone-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#C45B38]" />
                    <span className="text-xs font-semibold text-stone-800">
                      {language === 'en' ? 'Announcement Banner' : 'Üst Duyuru Bandı'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.showAnnouncement}
                      onChange={(e) => setFormData({ ...formData, showAnnouncement: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C45B38]"></div>
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={formData.announcement || ''}
                  onChange={(e) => setFormData({ ...formData, announcement: e.target.value })}
                  placeholder={language === 'en' ? 'Enter announcement text...' : 'Duyuru metnini girin...'}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer controls */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-stone-600 hover:text-stone-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Reset to Defaults' : 'Varsayılana Sıfırla'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
              >
                {language === 'en' ? 'Cancel' : 'İptal'}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'en' ? 'Save All Changes' : 'Tüm Değişiklikleri Kaydet'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
