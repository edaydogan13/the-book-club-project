// Bilingual Auto-Translation Utility for Books & Friends
// Supports instant synchronous translation via dictionary + heuristic engine,
// and asynchronous high-precision translation via server-side Gemini API (/api/translate).

import { Language } from '../translations';
import { GENRE_MAP_EN, GENRE_MAP_TR } from '../data/initialData';

// Extended dictionary for common reading club roles, goals, and site phrases
const PHRASE_MAP_EN_TO_TR: Record<string, string> = {
  // Roles
  'Club Host & Founder': 'Kulüp Kurucusu & Moderatör',
  'Founder & Curator': 'Kurucu & Küratör',
  'Co-Host & Salon Coordinator': 'Eş Moderatör & Salon Koordinatörü',
  'Literary Archivist & Curator': 'Edebi Arşivci & Küratör',
  'Salon Contributor & Essayist': 'Salon Katılımcısı & Deneme Yazarı',
  'Curator & Discussion Catalyst': 'Küratör & Tartışma Kolaylaştırıcısı',
  'Book Club Curator & Member': 'Kitap Kulübü Küratörü & Üyesi',
  'Club Curator & Reader': 'Kulüp Küratörü & Okur',
  'Curator': 'Küratör',
  'Reader': 'Okur',
  'Admin': 'Yönetici',
  'Member': 'Üye',
  
  // Reading Goals & Stats
  'Founding Member (Nov 2025)': 'Kurucu Üye (Kasım 2025)',
  'Member (2026)': 'Üye (2026)',
  '24 books (12 completed)': '24 kitap (12 tamamlandı)',
  '20 books (10 completed)': '20 kitap (10 tamamlandı)',
  '18 books (9 completed)': '18 kitap (9 tamamlandı)',
  '15 books (8 completed)': '15 kitap (8 tamamlandı)',
  '12 books (6 completed)': '12 kitap (6 tamamlandı)',
  '30 books (15 completed)': '30 kitap (15 tamamlandı)',
  
  // Hero & General
  'Six readers.': 'Altı okur.',
  'One book': 'Ayda bir',
  'a month.': 'kitap.',
  'We are a small circle of friends who read one book every month together, prioritizing depth over velocity.': 'Her ay birlikte tek bir kitap okuyan, hız yerine derinliği seçen küçük bir arkadaş çevresiyiz.',
  'ISTANBUL · DUBAI · NYC · SAN FRANCISCO · EST. NOV 2025': 'İSTANBUL · DUBAİ · NYC · SAN FRANCISCO · KASIM 2025',
  'books read together': 'birlikte okunan kitap',
  'pages turned': 'çevrilen sayfa',
  'members': 'üye',
  
  // Genres
  ...GENRE_MAP_TR,
  'Literary Fiction': 'Edebi Kurgu',
  'Philosophy': 'Felsefe',
  'Fiction': 'Kurgu',
  'Non-Fiction': 'Kurgu Dışı',
  'Memoir': 'Anı',
  'Autobiography': 'Otobiyografi',
  'History': 'Tarih',
  'Poetry': 'Şiir',
  'Psychology': 'Psikoloji',
  'Essay': 'Deneme',
  'Classics': 'Klasikler',
  'Science Fiction': 'Bilim Kurgu',
  'Dystopia': 'Distopya',
};

const PHRASE_MAP_TR_TO_EN: Record<string, string> = {
  // Roles
  'Kulüp Kurucusu & Moderatör': 'Club Host & Founder',
  'Kurucu & Küratör': 'Founder & Curator',
  'Eş Moderatör & Salon Koordinatörü': 'Co-Host & Salon Coordinator',
  'Edebi Arşivci & Küratör': 'Literary Archivist & Curator',
  'Salon Katılımcısı & Deneme Yazarı': 'Salon Contributor & Essayist',
  'Küratör & Tartışma Kolaylaştırıcısı': 'Curator & Discussion Catalyst',
  'Kitap Kulübü Küratörü & Üyesi': 'Book Club Curator & Member',
  'Kulüp Küratörü & Okur': 'Club Curator & Reader',
  'Küratör': 'Curator',
  'Okur': 'Reader',
  'Yönetici': 'Admin',
  'Üye': 'Member',
  
  // Reading Goals & Stats
  'Kurucu Üye (Kasım 2025)': 'Founding Member (Nov 2025)',
  'Üye (2026)': 'Member (2026)',
  '24 kitap (12 tamamlandı)': '24 books (12 completed)',
  '20 kitap (10 tamamlandı)': '20 books (10 completed)',
  '18 kitap (9 tamamlandı)': '18 books (9 completed)',
  '15 kitap (8 tamamlandı)': '15 books (8 completed)',
  '12 kitap (6 tamamlandı)': '12 books (6 completed)',
  '30 kitap (15 tamamlandı)': '30 books (15 completed)',
  
  // Hero & General
  'Altı okur.': 'Six readers.',
  'Ayda bir': 'One book',
  'kitap.': 'a month.',
  'Her ay birlikte tek bir kitap okuyan, hız yerine derinliği seçen küçük bir arkadaş çevresiyiz.': 'We are a small circle of friends who read one book every month together, prioritizing depth over velocity.',
  'İSTANBUL · DUBAİ · NYC · SAN FRANCISCO · KASIM 2025': 'ISTANBUL · DUBAI · NYC · SAN FRANCISCO · EST. NOV 2025',
  'birlikte okunan kitap': 'books read together',
  'çevrilen sayfa': 'pages turned',
  'üye': 'members',
  
  // Genres
  ...GENRE_MAP_EN,
  'Edebi Kurgu': 'Literary Fiction',
  'Felsefe': 'Philosophy',
  'Kurgu': 'Fiction',
  'Kurgu Dışı': 'Non-Fiction',
  'Anı': 'Memoir',
  'Otobiyografi': 'Autobiography',
  'Tarih': 'History',
  'Şiir': 'Poetry',
  'Psikoloji': 'Psychology',
  'Deneme': 'Essay',
  'Klasikler': 'Classics',
  'Bilim Kurgu': 'Science Fiction',
  'Distopya': 'Dystopia',
};

// Fast local heuristic translation for instant responsive UI
export function translateTextSync(text: string, fromLang: Language, toLang: Language): string {
  if (!text || !text.trim() || fromLang === toLang) {
    return text || '';
  }

  const trimmed = text.trim();
  
  // Exact dictionary match
  if (fromLang === 'en' && toLang === 'tr') {
    if (PHRASE_MAP_EN_TO_TR[trimmed]) return PHRASE_MAP_EN_TO_TR[trimmed];
  } else if (fromLang === 'tr' && toLang === 'en') {
    if (PHRASE_MAP_TR_TO_EN[trimmed]) return PHRASE_MAP_TR_TO_EN[trimmed];
  }

  // Handle patterns like "X books (Y completed)"
  if (fromLang === 'en' && toLang === 'tr') {
    const goalMatch = trimmed.match(/^(\d+)\s+books?\s*\((.*)\)$/i);
    if (goalMatch) {
      const num = goalMatch[1];
      const inner = goalMatch[2].replace(/completed/i, 'tamamlandı').replace(/read/i, 'okundu');
      return `${num} kitap (${inner})`;
    }
  } else if (fromLang === 'tr' && toLang === 'en') {
    const goalMatch = trimmed.match(/^(\d+)\s+kitap\s*\((.*)\)$/i);
    if (goalMatch) {
      const num = goalMatch[1];
      const inner = goalMatch[2].replace(/tamamlandı/i, 'completed').replace(/okundu/i, 'read');
      return `${num} books (${inner})`;
    }
  }

  // Handle "by Author" pattern
  if (fromLang === 'tr' && toLang === 'en') {
    const byMatch = trimmed.match(/(.*)\s+(tarafından|yazan)\s*(.*)/i);
    if (byMatch) {
      return `${byMatch[1].trim()} by ${byMatch[3].trim()}`;
    }
  }

  return trimmed;
}

// Asynchronous high-fidelity translation via server-side Gemini endpoint
export async function translateTextWithAI(text: string, fromLang: Language, toLang: Language): Promise<string> {
  if (!text || !text.trim() || fromLang === toLang) {
    return text || '';
  }

  // Check sync cache/dictionary first
  const localSync = translateTextSync(text, fromLang, toLang);
  if (localSync !== text.trim()) {
    return localSync;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        from: fromLang,
        to: toLang,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.translatedText && typeof data.translatedText === 'string') {
        return data.translatedText.trim();
      }
    }
  } catch (err) {
    // Graceful fallback to local heuristic
  }

  return localSync;
}

// Batch translate an object of string fields
export async function autoTranslateFields<T extends Record<string, any>>(
  source: T,
  fieldsToTranslate: Array<{ keySource: keyof T; keyTarget: keyof T }>,
  fromLang: Language,
  toLang: Language
): Promise<T> {
  const result: T = { ...source };

  for (const { keySource, keyTarget } of fieldsToTranslate) {
    const val = source[keySource];
    if (typeof val === 'string' && val.trim()) {
      // Immediate sync translation first
      const syncVal = translateTextSync(val, fromLang, toLang);
      result[keyTarget] = syncVal as any;
    }
  }

  // Trigger server-side AI translation in the background and return promise
  try {
    const payload: Record<string, string> = {};
    for (const { keySource } of fieldsToTranslate) {
      const val = source[keySource];
      if (typeof val === 'string' && val.trim()) {
        payload[keySource as string] = val;
      }
    }

    if (Object.keys(payload).length > 0) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch('/api/translate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: payload,
          to: toLang,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.translated && typeof data.translated === 'object') {
          for (const { keySource, keyTarget } of fieldsToTranslate) {
            const aiTranslated = data.translated[keySource as string];
            if (aiTranslated && typeof aiTranslated === 'string') {
              result[keyTarget] = aiTranslated.trim() as any;
            }
          }
        }
      }
    }
  } catch (e) {
    // Fallback sync values remain
  }

  return result;
}
