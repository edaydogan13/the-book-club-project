import React, { useState } from 'react';
import { Language } from '../translations';
import {
  BookSearchLangFilter,
  BookSearchResult,
  buildAmazonSearchUrl,
  searchBooksOnline,
} from '../utils/bookSearch';
import {
  Search,
  Loader2,
  ExternalLink,
  BookOpen,
  Check,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

interface BookSearchBarProps {
  language: Language;
  onSelectBookResult: (result: BookSearchResult) => void;
}

export const BookSearchBar: React.FC<BookSearchBarProps> = ({
  language,
  onSelectBookResult,
}) => {
  const [query, setQuery] = useState('');
  const [editionFilter, setEditionFilter] = useState<BookSearchLangFilter>('both');
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [brokenCovers, setBrokenCovers] = useState<Record<string, boolean>>({});

  const runSearch = async (overrideFilter?: BookSearchLangFilter) => {
    const activeFilter = overrideFilter ?? editionFilter;
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setHasSearched(true);
    setSelectedId(null);
    setBrokenCovers({});
    try {
      const items = await searchBooksOnline(trimmed, activeFilter);
      setResults(items);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      runSearch();
    }
  };

  const handleSelect = (item: BookSearchResult) => {
    setSelectedId(item.id);
    onSelectBookResult(item);
  };

  const trimmedQuery = query.trim();
  const directAmazonTr = buildAmazonSearchUrl(trimmedQuery || 'bestseller books', 'tr');
  const directAmazonEn = buildAmazonSearchUrl(trimmedQuery || 'bestseller books', 'en');

  return (
    <div className="p-4 bg-gradient-to-br from-amber-50/80 via-[#FAF8F5] to-stone-50 border border-amber-200/80 rounded-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#C45B38]/10 text-[#C45B38] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">
              {language === 'en'
                ? 'Quick Book Search — Amazon & Global Catalog (EN / TR)'
                : 'Hızlı Kitap Arama — Amazon & Küresel Katalog (TR / EN)'}
            </h4>
            <p className="text-[11px] text-stone-500">
              {language === 'en'
                ? 'Search in English or Turkish to autofill title, author, cover, and Amazon links—or enter manually below.'
                : 'İngilizce veya Türkçe arayıp başlık, yazar, kapak ve Amazon bağlantılarını otomatik doldurun ya da aşağıdan manuel girin.'}
            </p>
          </div>
        </div>
      </div>

      {/* Edition Language Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="text-stone-500 font-mono uppercase tracking-wider mr-1">
          {language === 'en' ? 'Edition:' : 'Dil:'}
        </span>
        {(
          [
            { id: 'both', labelEn: 'All (EN + TR)', labelTr: 'Tümü (TR + EN)' },
            { id: 'en', labelEn: 'English (Amazon.com)', labelTr: 'İngilizce (Amazon.com)' },
            { id: 'tr', labelEn: 'Turkish (Amazon.com.tr)', labelTr: 'Türkçe (Amazon.com.tr)' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setEditionFilter(tab.id);
              if (query.trim()) {
                runSearch(tab.id);
              }
            }}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              editionFilter === tab.id
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {language === 'en' ? tab.labelEn : tab.labelTr}
          </button>
        ))}
      </div>

      {/* Search Input & Action Button */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              language === 'en'
                ? 'Search book title, author, or ISBN (e.g. Born a Crime, Saatleri Ayarlama Enstitüsü)...'
                : 'Kitap adı, yazar veya ISBN ara (örn. Suçlu Doğmak, Saatleri Ayarlama Enstitüsü)...'
            }
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#C45B38] focus:border-[#C45B38]"
          />
        </div>
        <button
          type="button"
          onClick={() => runSearch()}
          disabled={isSearching || !trimmedQuery}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{language === 'en' ? 'Searching...' : 'Aranıyor...'}</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Search Book' : 'Kitap Ara'}</span>
            </>
          )}
        </button>
      </div>

      {/* Direct Amazon Search Links */}
      {trimmedQuery && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600">
          <span className="font-mono text-[10px] uppercase text-stone-400">
            {language === 'en' ? 'Open directly on Amazon:' : 'Doğrudan Amazon’da aç:'}
          </span>
          <a
            href={directAmazonTr}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-stone-200 hover:border-stone-400 text-stone-800 font-medium"
          >
            <span>Amazon.com.tr</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
          <a
            href={directAmazonEn}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-stone-200 hover:border-stone-400 text-stone-800 font-medium"
          >
            <span>Amazon.com</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </a>
        </div>
      )}

      {/* Search Results List */}
      {hasSearched && !isSearching && results.length === 0 && (
        <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs text-stone-600 text-center">
          {language === 'en'
            ? 'No matching editions returned. Try a shorter title/author or fill in the manual fields below.'
            : 'Eşleşen sonuç bulunamadı. Daha kısa bir başlık/yazar deneyin veya aşağıdan manuel olarak doldurun.'}
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {results.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                className={`p-2.5 bg-white rounded-lg border transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'border-[#C45B38] ring-1 ring-[#C45B38]/30 bg-amber-50/40'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="w-10 h-14 bg-stone-200 rounded overflow-hidden shrink-0 border border-stone-200 flex items-center justify-center">
                  {item.coverUrl && !brokenCovers[item.id] ? (
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onError={() => setBrokenCovers((prev) => ({ ...prev, [item.id]: true }))}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-4 h-4 text-stone-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-stone-600 truncate">
                        {item.author}
                        {item.year ? ` · ${item.year}` : ''}
                        {item.pages ? ` · ${item.pages}p` : ''}
                      </p>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase shrink-0 font-semibold ${
                        item.language === 'tr'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : item.language === 'en'
                          ? 'bg-sky-50 text-sky-800 border border-sky-200'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {item.language.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[10px]">
                      <a
                        href={item.amazonTrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-500 hover:text-stone-900 underline inline-flex items-center gap-0.5"
                      >
                        <span>Amazon TR</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <a
                        href={item.amazonEnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-stone-500 hover:text-stone-900 underline inline-flex items-center gap-0.5"
                      >
                        <span>Amazon US</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#C45B38] hover:bg-[#a94827] text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>{language === 'en' ? 'Autofilled' : 'Dolduruldu'}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>{language === 'en' ? 'Use This Book' : 'Seç ve Doldur'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
