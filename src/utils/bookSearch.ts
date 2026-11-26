export type BookSearchLangFilter = 'both' | 'en' | 'tr';

export interface BookSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  year?: number;
  pages?: number;
  genre?: string;
  synopsis?: string;
  coverUrl?: string;
  language: 'en' | 'tr' | 'other';
  isbn10?: string;
  isbn13?: string;
  amazonTrUrl: string;
  amazonEnUrl: string;
  source: 'google' | 'openlibrary' | 'apple';
}

const AFFILIATE_TAG_TR = 'edaydogannn-21';
const AFFILIATE_TAG_EN = 'edaydogannn-20';

export function buildAmazonSearchUrl(
  query: string,
  store: 'tr' | 'en'
): string {
  const cleaned = query.trim();
  if (store === 'tr') {
    return `https://www.amazon.com.tr/s?k=${encodeURIComponent(cleaned)}&i=stripbooks&tag=${AFFILIATE_TAG_TR}`;
  }
  return `https://www.amazon.com/s?k=${encodeURIComponent(cleaned)}&i=stripbooks&tag=${AFFILIATE_TAG_EN}`;
}

function normalizeCoverUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  let url = raw.replace(/^http:\/\//i, 'https://');
  url = url.replace('&edge=curl', '');
  return url;
}

function parseYear(publishedDate?: string | number): number | undefined {
  if (typeof publishedDate === 'number' && publishedDate > 1000) return publishedDate;
  if (typeof publishedDate === 'string') {
    const match = publishedDate.match(/(\d{4})/);
    if (match) return parseInt(match[1], 10);
  }
  return undefined;
}

function hasTurkishChars(text: string): boolean {
  return /[çÇğĞıİöÖşŞüÜ]/.test(text);
}

function mapGoogleVolume(item: any): BookSearchResult | null {
  const info = item?.volumeInfo;
  if (!info || !info.title) return null;

  const title = String(info.title).trim();
  const authors = Array.isArray(info.authors) && info.authors.length > 0
    ? info.authors.join(', ')
    : 'Unknown Author';

  const identifiers = Array.isArray(info.industryIdentifiers) ? info.industryIdentifiers : [];
  const isbn13 = identifiers.find((id: any) => id.type === 'ISBN_13')?.identifier;
  const isbn10 = identifiers.find((id: any) => id.type === 'ISBN_10')?.identifier;

  const rawLang = String(info.language || '').toLowerCase();
  const lang: 'en' | 'tr' | 'other' =
    rawLang.startsWith('tr') ? 'tr' : rawLang.startsWith('en') ? 'en' : 'other';

  const coverUrl = normalizeCoverUrl(
    info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail
  );

  const searchTerm = isbn13 || isbn10 || `${title} ${authors}`;

  return {
    id: `gb-${item.id || `${title}-${authors}`}`,
    title,
    subtitle: info.subtitle ? String(info.subtitle).trim() : undefined,
    author: authors,
    year: parseYear(info.publishedDate),
    pages: typeof info.pageCount === 'number' && info.pageCount > 0 ? info.pageCount : undefined,
    genre: Array.isArray(info.categories) && info.categories.length > 0
      ? String(info.categories[0])
      : undefined,
    synopsis: info.description ? String(info.description).trim() : undefined,
    coverUrl,
    language: lang,
    isbn10,
    isbn13,
    amazonTrUrl: buildAmazonSearchUrl(searchTerm, 'tr'),
    amazonEnUrl: buildAmazonSearchUrl(searchTerm, 'en'),
    source: 'google',
  };
}

async function fetchGoogleBooks(query: string, langRestrict?: 'en' | 'tr', maxResults = 8): Promise<BookSearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    printType: 'books',
    maxResults: String(maxResults),
  });
  if (langRestrict) {
    params.set('langRestrict', langRestrict);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];
    return items
      .map(mapGoogleVolume)
      .filter((x: BookSearchResult | null): x is BookSearchResult => Boolean(x));
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchOpenLibrary(query: string, langFilter: BookSearchLangFilter): Promise<BookSearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    limit: '8',
    fields: 'key,title,subtitle,author_name,first_publish_year,number_of_pages_median,subject,cover_i,isbn,language',
  });
  if (langFilter === 'tr') params.set('language', 'tur');
  if (langFilter === 'en') params.set('language', 'eng');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(`https://openlibrary.org/search.json?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    const docs = Array.isArray(data?.docs) ? data.docs : [];
    return docs
      .filter((d: any) => d?.title)
      .map((d: any, idx: number): BookSearchResult => {
        const title = String(d.title).trim();
        const author = Array.isArray(d.author_name) && d.author_name.length > 0
          ? d.author_name.slice(0, 2).join(', ')
          : 'Unknown Author';
        const isbns: string[] = Array.isArray(d.isbn) ? d.isbn : [];
        const isbn13 = isbns.find((x) => String(x).length === 13);
        const isbn10 = isbns.find((x) => String(x).length === 10);
        const langs: string[] = Array.isArray(d.language) ? d.language : [];
        let language: 'en' | 'tr' | 'other' = 'other';
        if (
          hasTurkishChars(title) ||
          hasTurkishChars(author) ||
          langFilter === 'tr' ||
          (langs.includes('tur') && !langs.includes('eng'))
        ) {
          language = 'tr';
        } else if (langFilter === 'en' || langs.includes('eng')) {
          language = 'en';
        } else if (langs.includes('tur')) {
          language = 'tr';
        }
        const searchTerm = isbn13 || isbn10 || `${title} ${author}`;
        return {
          id: `ol-${d.key || idx}`,
          title,
          subtitle: d.subtitle ? String(d.subtitle).trim() : undefined,
          author,
          year: typeof d.first_publish_year === 'number' ? d.first_publish_year : undefined,
          pages: typeof d.number_of_pages_median === 'number' ? d.number_of_pages_median : undefined,
          genre: Array.isArray(d.subject) && d.subject.length > 0 ? String(d.subject[0]) : undefined,
          coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg` : undefined,
          language,
          isbn10,
          isbn13,
          amazonTrUrl: buildAmazonSearchUrl(searchTerm, 'tr'),
          amazonEnUrl: buildAmazonSearchUrl(searchTerm, 'en'),
          source: 'openlibrary',
        };
      });
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchAppleBooks(query: string, langFilter: BookSearchLangFilter): Promise<BookSearchResult[]> {
  const params = new URLSearchParams({
    term: query,
    media: 'ebook',
    country: 'us',
    limit: '8',
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(`https://itunes.apple.com/search?${params.toString()}`, {
      signal: controller.signal,
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data?.results) ? data.results : [];
    return items
      .filter((item: any) => item?.trackName)
      .map((item: any, idx: number): BookSearchResult => {
        const title = String(item.trackName).trim();
        const author = item.artistName ? String(item.artistName).trim() : 'Unknown Author';
        const coverRaw = item.artworkUrl100 ? String(item.artworkUrl100).replace('100x100bb', '512x512bb') : undefined;
        const lang: 'en' | 'tr' | 'other' =
          langFilter === 'tr' || hasTurkishChars(title) ? 'tr' : 'en';
        const searchTerm = `${title} ${author}`;
        return {
          id: `ab-${item.trackId || idx}`,
          title,
          author,
          year: parseYear(item.releaseDate),
          genre: Array.isArray(item.genres) && item.genres.length > 0 ? String(item.genres[0]) : undefined,
          synopsis: item.description ? String(item.description).trim() : undefined,
          coverUrl: normalizeCoverUrl(coverRaw),
          language: lang,
          amazonTrUrl: buildAmazonSearchUrl(searchTerm, 'tr'),
          amazonEnUrl: buildAmazonSearchUrl(searchTerm, 'en'),
          source: 'apple',
        };
      });
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchBooksOnline(
  query: string,
  langFilter: BookSearchLangFilter = 'both'
): Promise<BookSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  let combined: BookSearchResult[] = [];

  if (langFilter === 'both') {
    const [enRes, trRes, generalRes] = await Promise.all([
      fetchGoogleBooks(trimmed, 'en', 5),
      fetchGoogleBooks(trimmed, 'tr', 5),
      fetchGoogleBooks(trimmed, undefined, 4),
    ]);
    // Interleave TR and EN results so both Turkish and English editions show prominently
    const maxLen = Math.max(enRes.length, trRes.length);
    for (let i = 0; i < maxLen; i++) {
      if (enRes[i]) combined.push(enRes[i]);
      if (trRes[i]) combined.push(trRes[i]);
    }
    combined.push(...generalRes);
  } else {
    combined = await fetchGoogleBooks(trimmed, langFilter, 8);
  }

  // Fallback to Open Library if Google Books returned nothing (e.g. rate limits)
  if (combined.length === 0) {
    if (langFilter === 'both') {
      const [enOl, trOl, genOl] = await Promise.all([
        fetchOpenLibrary(trimmed, 'en'),
        fetchOpenLibrary(trimmed, 'tr'),
        fetchOpenLibrary(trimmed, 'both'),
      ]);
      const maxLen = Math.max(enOl.length, trOl.length);
      for (let i = 0; i < maxLen; i++) {
        if (enOl[i]) combined.push(enOl[i]);
        if (trOl[i]) combined.push(trOl[i]);
      }
      combined.push(...genOl);
    } else {
      combined = await fetchOpenLibrary(trimmed, langFilter);
      if (combined.length === 0) {
        combined = await fetchOpenLibrary(trimmed, 'both');
      }
    }
  }

  // Secondary fallback to Apple Books catalog if both Google Books & Open Library yielded nothing
  if (combined.length === 0) {
    combined = await fetchAppleBooks(trimmed, langFilter);
  }

  // Deduplicate by normalized title + author + language
  const seen = new Set<string>();
  const deduped: BookSearchResult[] = [];
  for (const item of combined) {
    const key = `${item.title.toLowerCase()}::${item.author.toLowerCase()}::${item.language}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  return deduped.slice(0, 10);
}
