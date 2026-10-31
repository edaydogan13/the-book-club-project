// Bilingual Auto-Translation Utility for Books & Friends
// Supports instant synchronous translation via dictionary + heuristic engine,
// and asynchronous high-precision translation via server-side Gemini API (/api/translate).

import { Language } from '../translations';
import { Member } from '../types';

// Extended dictionary for reading club roles, bios, quotes, goals, and site phrases
const PHRASE_MAP_EN_TO_TR: Record<string, string> = {
  // --- All 6 Members' Exact Roles ---
  'Sustainability Specialist & Urban Narrator': 'Sürdürülebilirlik Uzmanı & Kent Anlatıcısı',
  'Founder': 'Kurucu (Founder)',
  'Kurucu (Founder)': 'Kurucu (Founder)',
  'Founder & Curator': 'Kurucu & Küratör',
  'Club Host & Founder': 'Kulüp Kurucusu & Moderatör',
  'Curator & Web Architect': 'Küratör & Web Mimarı',
  'Software Engineer & Biographic Thinker': 'Yazılım Mühendisi & Biyografik Düşünür',
  'Co-founder & Classicist': 'Kurucu Ortak & Klasik Edebiyat Tutkunu',
  'Senior Consultant & Dystopia Explorer': 'Kıdemli Danışman & Distopya Araştırmacısı',
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

  // --- All 6 Members' Exact Bios ---
  'Environmental engineer and sustainability specialist (M.Sc. from King’s College London). Host of Environmental Sustainability Podcast. Exploring ecology, circular systems, urban memory, and architectural poetics.':
    'Çevre mühendisi ve sürdürülebilirlik uzmanı (King’s College London M.Sc.). Çevresel Sürdürülebilirlik Podcast sunucusu ve IAF Türkiye ATTI Lideri. Ekoloji, döngüsel ekonomi, kentsel bellek ve edebiyatta mekan anlatılarına derin bir ilgi duyuyor.',
  
  'Founder of the Books & Friends book club. Working in procurement and operational management at Digital Turbine in Istanbul. Passionate about philosophy, critical thinking, and gathering minds around deep literary salons since November 2025.':
    'Books & Friends kitap kulübünün kurucusu. İstanbul merkezli Digital Turbine bünyesinde satın alma ve operasyonel yönetim alanında çalışıyor. Felsefe, eleştirel düşünce ve insanları derin edebiyat sohbetleri etrafında bir araya getirme tutkusuyla kulübümüzü Kasım 2025’te hayata geçirdi.',
  
  'Architect and curator of the Books & Friends platform. Former product marketing leader across global tech ventures (Insider, Talabat, Bluedot). Focused on tactile book aesthetics, timeless wisdom, and intentional slow-reading rituals.':
    'Books & Friends platformunun mimarı ve küratörü. Teknoloji girişimlerinde ürün liderliği ve pazarlama rolleri üstlendi (Insider, Talabat, Bluedot). Dokunsal kitap tasarımları, zamansız fikirler ve topluluk odaklı derin okuma pratikleri üzerine odaklanıyor.',
  
  'Full-stack software engineer building web and mobile ecosystems. Passionate reader of life design, autobiographical memory, and human resilience. Recommended Born a Crime by Trevor Noah.':
    'Yazılım mühendisi ve full-stack geliştirici. Web ve mobil ekosistemler inşa ediyor; yaşam tasarımı, otobiyografik hafıza ve insanın direnç kapasitesi üzerine yazılan eserlerin tutkulu bir okuru. Kulübümüzün açılış kitabı olan ve şu an okuduğumuz Suçlu Doğmak’ı önerdi.',
  
  'Co-founder and CEO of Bluedot (YC-backed, acquired by Epic Charging), Forbes 30 Under 30 alumnus. Passionate devotee of classical prose, existential modernism, and aesthetic philosophy.':
    'Bluedot’ın kurucu ortağı ve CEO’su (Y Combinator destekli, Epic Charging tarafından satın alındı), Forbes 30 Under 30 listesinde yer aldı. Klasik edebiyat, varoluşçu kurgu ve estetik felsefe tutkunu.',
  
  'Senior Business Consultant leading digital transformation and mobility innovations at Mercedes-Benz. Yoga practitioner and advocate for women in leadership. Avid reader of speculative isolation and dystopian philosophy.':
    'Mercedes-Benz Otomotiv bünyesinde Senior Business Consultant olarak inovasyon ve dijital dönüşüm süreçlerine liderlik ediyor. Yıldız Teknik Üniversitesi mezunu, yoga uygulayıcısı ve kadınların teknolojideki gücünü savunan bir konuşmacı. İzolasyon ve distopik edebiyat tutkunu.',

  // --- All 6 Members' Exact Quotes ---
  'To love a city is to embrace its melancholy as your own fate.':
    'Bir şehri sevmek, onun hüznünü kendi kaderin olarak kabul etmektir.',
  'To discover one’s true voice is to touch the reality behind the showcase.':
    'Kendi sesini bulmak, vitrinin ötesindeki hakikate dokunabilmektir.',
  'Desire is a contract you make with yourself to be unhappy until you get what you want. — Naval Ravikant':
    'Arzu, istediğini elde edene kadar mutsuz kalmak üzere kendinle yaptığın bir sözleşmedir. — Naval Ravikant',
  'We build our way forward through thoughtful experiments.':
    'Yolumuzu düşünceli deneylerle inşa ederiz.',
  'Art is the most noble expression of the infinite solitude concealed within man.':
    'Sanat, insanın içinde gizlenen sonsuz yalnızlığın en asil ifadesidir.',
  'Time is the greatest shelter; walls merely serve to draw temporary borders.':
    'Zaman en büyük sığınaktır; duvarlar ise yalnızca sınırları çizmeye yarar.',

  // --- Common Reading Goals & Stats ---
  'Founding Member (Nov 2025)': 'Kurucu Üye (Kasım 2025)',
  'Member (2026)': 'Üye (2026)',
  '24 books (20 completed)': '24 kitap (20 tamamlandı)',
  '30 books (25 completed)': '30 kitap (25 tamamlandı)',
  '28 books (24 completed)': '28 kitap (24 tamamlandı)',
  '26 books (22 completed)': '26 kitap (22 tamamlandı)',
  '24 books (21 completed)': '24 kitap (21 tamamlandı)',
  '24 books (12 completed)': '24 kitap (12 tamamlandı)',
  '20 books (10 completed)': '20 kitap (10 tamamlandı)',
  '18 books (9 completed)': '18 kitap (9 tamamlandı)',
  '15 books (8 completed)': '15 kitap (8 tamamlandı)',
  '12 books (6 completed)': '12 kitap (6 tamamlandı)',
  '30 books (15 completed)': '30 kitap (15 tamamlandı)',

  // --- Hero & General ---
  'Six readers.': 'Altı okur.',
  'One book': 'Ayda bir',
  'a month.': 'kitap.',
  'We are a small circle of friends who read one book every month together, prioritizing depth over velocity.': 'Her ay birlikte tek bir kitap okuyan, hız yerine derinliği seçen küçük bir arkadaş çevresiyiz.',
  'ISTANBUL · DUBAI · NYC · SAN FRANCISCO · EST. NOV 2025': 'İSTANBUL · DUBAİ · NYC · SAN FRANCISCO · KASIM 2025',
  'books read together': 'birlikte okunan kitap',
  'pages turned': 'çevrilen sayfa',
  'members': 'üye',

  // --- Genres ---
  'Autobiography & Social Satire': 'Otobiyografi & Sosyal Hiciv',
  'Memoir & Literary Geography': 'Anı & Edebi Coğrafya',
  'Dystopian Classic & Solitude': 'Distopya & Varoluşçu Klasik',
  'Modernist Novella & Aesthetics': 'Modernist Novella & Estetik',
  'Speculative Fiction & Memory': 'Spekülatif Kurgu & Bellek',
  'Philosophical Essay & Consciousness': 'Felsefi Deneme & Bilinç',
  'Philosophy & Wealth Creation': 'Felsefe & Zenginlik Yaratımı',
  'Toltec Wisdom & Mindfulness': 'Toltek Bilgeliği & Farkındalık',
  'Design Thinking & Personal Growth': 'Tasarım Odaklı Düşünme & Gelişim',
  'Cultural Criticism & Philosophy': 'Kültürel Eleştiri & Felsefe',
  'Spiritual Wisdom & Poetic Philosophy': 'Manevi Bilgelik & Şiirsel Felsefe',
  'Contemporary Philosophy & Cultural Criticism': 'Çağdaş Felsefe & Kültürel Eleştiri',
  'Contemporary Turkish Literature & Fiction': 'Çağdaş Türk Edebiyatı & Roman',
  'Post-Apocalyptic Classic & Social Fiction': 'Kıyamet Sonrası Klasik & Toplum Kurgusu',
  'Philosophical Fiction & Parallel Realities': 'Felsefi Kurgu & Paralel Evrenler',
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
  'Urban Geography': 'Kentsel Coğrafya',
  'Ecological Literature': 'Ekolojik Edebiyat',
  'Memoir & City': 'Anı & Şehir',
  'Environmental Philosophy': 'Çevre Felsefesi',
  'Aesthetics & Existentialism': 'Estetik & Varoluşçuluk',
  'Modernist Novellas': 'Modernist Anlatılar',
  'Founders Prose': 'Girişimci Düzyazısı',
  'Mental Models': 'Zihinsel Modeller',
  'Ancient Wisdom': 'Kadim Bilgelik',
  'Speculative Thought': 'Spekülatif Düşünce',
  'Personal Growth': 'Kişisel Gelişim',
  'Cultural Criticism': 'Kültürel Eleştiri',
  'Philosophy of Perception': 'Algı Felsefesi',
  'Sociology': 'Sosyoloji',
  'Modern Classics': 'Modern Klasikler',
};

const PHRASE_MAP_TR_TO_EN: Record<string, string> = {
  // --- All 6 Members' Exact Roles ---
  'Sürdürülebilirlik Uzmanı & Kent Anlatıcısı': 'Sustainability Specialist & Urban Narrator',
  'Kurucu (Founder)': 'Founder',
  'Kurucu & Küratör': 'Founder & Curator',
  'Kulüp Kurucusu & Moderatör': 'Club Host & Founder',
  'Küratör & Web Mimarı': 'Curator & Web Architect',
  'Yazılım Mühendisi & Biyografik Düşünür': 'Software Engineer & Biographic Thinker',
  'Kurucu Ortak & Klasik Edebiyat Tutkunu': 'Co-founder & Classicist',
  'Kıdemli Danışman & Distopya Araştırmacısı': 'Senior Consultant & Dystopia Explorer',
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

  // --- All 6 Members' Exact Bios ---
  'Çevre mühendisi ve sürdürülebilirlik uzmanı (King’s College London M.Sc.). Çevresel Sürdürülebilirlik Podcast sunucusu ve IAF Türkiye ATTI Lideri. Ekoloji, döngüsel ekonomi, kentsel bellek ve edebiyatta mekan anlatılarına derin bir ilgi duyuyor.':
    'Environmental engineer and sustainability specialist (M.Sc. from King’s College London). Host of Environmental Sustainability Podcast. Exploring ecology, circular systems, urban memory, and architectural poetics.',
  
  'Books & Friends kitap kulübünün kurucusu. İstanbul merkezli Digital Turbine bünyesinde satın alma ve operasyonel yönetim alanında çalışıyor. Felsefe, eleştirel düşünce ve insanları derin edebiyat sohbetleri etrafında bir araya getirme tutkusuyla kulübümüzü Kasım 2025’te hayata geçirdi.':
    'Founder of the Books & Friends book club. Working in procurement and operational management at Digital Turbine in Istanbul. Passionate about philosophy, critical thinking, and gathering minds around deep literary salons since November 2025.',
  
  'Books & Friends platformunun mimarı ve küratörü. Teknoloji girişimlerinde ürün liderliği ve pazarlama rolleri üstlendi (Insider, Talabat, Bluedot). Dokunsal kitap tasarımları, zamansız fikirler ve topluluk odaklı derin okuma pratikleri üzerine odaklanıyor.':
    'Architect and curator of the Books & Friends platform. Former product marketing leader across global tech ventures (Insider, Talabat, Bluedot). Focused on tactile book aesthetics, timeless wisdom, and intentional slow-reading rituals.',
  
  'Yazılım mühendisi ve full-stack geliştirici. Web ve mobil ekosistemler inşa ediyor; yaşam tasarımı, otobiyografik hafıza ve insanın direnç kapasitesi üzerine yazılan eserlerin tutkulu bir okuru. Kulübümüzün açılış kitabı olan ve şu an okuduğumuz Suçlu Doğmak’ı önerdi.':
    'Full-stack software engineer building web and mobile ecosystems. Passionate reader of life design, autobiographical memory, and human resilience. Recommended Born a Crime by Trevor Noah.',
  
  'Bluedot’ın kurucu ortağı ve CEO’su (Y Combinator destekli, Epic Charging tarafından satın alındı), Forbes 30 Under 30 listesinde yer aldı. Klasik edebiyat, varoluşçu kurgu ve estetik felsefe tutkunu.':
    'Co-founder and CEO of Bluedot (YC-backed, acquired by Epic Charging), Forbes 30 Under 30 alumnus. Passionate devotee of classical prose, existential modernism, and aesthetic philosophy.',
  
  'Mercedes-Benz Otomotiv bünyesinde Senior Business Consultant olarak inovasyon ve dijital dönüşüm süreçlerine liderlik ediyor. Yıldız Teknik Üniversitesi mezunu, yoga uygulayıcısı ve kadınların teknolojideki gücünü savunan bir konuşmacı. İzolasyon ve distopik edebiyat tutkunu.':
    'Senior Business Consultant leading digital transformation and mobility innovations at Mercedes-Benz. Yoga practitioner and advocate for women in leadership. Avid reader of speculative isolation and dystopian philosophy.',

  // --- All 6 Members' Exact Quotes ---
  'Bir şehri sevmek, onun hüznünü kendi kaderin olarak kabul etmektir.':
    'To love a city is to embrace its melancholy as your own fate.',
  'Kendi sesini bulmak, vitrinin ötesindeki hakikate dokunabilmektir.':
    'To discover one’s true voice is to touch the reality behind the showcase.',
  'Arzu, istediğini elde edene kadar mutsuz kalmak üzere kendinle yaptığın bir sözleşmedir. — Naval Ravikant':
    'Desire is a contract you make with yourself to be unhappy until you get what you want. — Naval Ravikant',
  'Yolumuzu düşünceli deneylerle inşa ederiz.':
    'We build our way forward through thoughtful experiments.',
  'Sanat, insanın içinde gizlenen sonsuz yalnızlığın en asil ifadesidir.':
    'Art is the most noble expression of the infinite solitude concealed within man.',
  'Zaman en büyük sığınaktır; duvarlar ise yalnızca sınırları çizmeye yarar.':
    'Time is the greatest shelter; walls merely serve to draw temporary borders.',

  // --- Reading Goals & Stats ---
  'Kurucu Üye (Kasım 2025)': 'Founding Member (Nov 2025)',
  'Üye (2026)': 'Member (2026)',
  '24 kitap (20 tamamlandı)': '24 books (20 completed)',
  '30 kitap (25 tamamlandı)': '30 books (25 completed)',
  '28 kitap (24 tamamlandı)': '28 books (24 completed)',
  '26 kitap (22 tamamlandı)': '26 books (22 completed)',
  '24 kitap (21 tamamlandı)': '24 books (21 completed)',
  '24 kitap (12 tamamlandı)': '24 books (12 completed)',
  '20 kitap (10 tamamlandı)': '20 books (10 completed)',
  '18 kitap (9 tamamlandı)': '18 books (9 completed)',
  '15 kitap (8 tamamlandı)': '15 books (8 completed)',
  '12 kitap (6 tamamlandı)': '12 books (6 completed)',
  '30 kitap (15 tamamlandı)': '30 books (15 completed)',

  // --- Hero & General ---
  'Altı okur.': 'Six readers.',
  'Ayda bir': 'One book',
  'kitap.': 'a month.',
  'Her ay birlikte tek bir kitap okuyan, hız yerine derinliği seçen küçük bir arkadaş çevresiyiz.': 'We are a small circle of friends who read one book every month together, prioritizing depth over velocity.',
  'İSTANBUL · DUBAİ · NYC · SAN FRANCISCO · KASIM 2025': 'ISTANBUL · DUBAI · NYC · SAN FRANCISCO · EST. NOV 2025',
  'birlikte okunan kitap': 'books read together',
  'çevrilen sayfa': 'pages turned',
  'üye': 'members',

  // --- Genres ---
  'Otobiyografi & Sosyal Hiciv': 'Autobiography & Social Satire',
  'Anı & Edebi Coğrafya': 'Memoir & Literary Geography',
  'Distopya & Varoluşçu Klasik': 'Dystopian Classic & Solitude',
  'Modernist Novella & Estetik': 'Modernist Novella & Aesthetics',
  'Spekülatif Kurgu & Bellek': 'Speculative Fiction & Memory',
  'Felsefi Deneme & Bilinç': 'Philosophical Essay & Consciousness',
  'Felsefe & Zenginlik Yaratımı': 'Philosophy & Wealth Creation',
  'Toltek Bilgeliği & Farkındalık': 'Toltec Wisdom & Mindfulness',
  'Tasarım Odaklı Düşünme & Gelişim': 'Design Thinking & Personal Growth',
  'Kültürel Eleştiri & Felsefe': 'Cultural Criticism & Philosophy',
  'Manevi Bilgelik & Şiirsel Felsefe': 'Spiritual Wisdom & Poetic Philosophy',
  'Çağdaş Felsefe & Kültürel Eleştiri': 'Contemporary Philosophy & Cultural Criticism',
  'Çağdaş Türk Edebiyatı & Roman': 'Contemporary Turkish Literature & Fiction',
  'Kıyamet Sonrası Klasik & Toplum Kurgusu': 'Post-Apocalyptic Classic & Social Fiction',
  'Felsefi Kurgu & Paralel Evrenler': 'Philosophical Fiction & Parallel Realities',
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
  'Kentsel Coğrafya': 'Urban Geography',
  'Ekolojik Edebiyat': 'Ecological Literature',
  'Anı & Şehir': 'Memoir & City',
  'Çevre Felsefesi': 'Environmental Philosophy',
  'Estetik & Varoluşçuluk': 'Aesthetics & Existentialism',
  'Modernist Anlatılar': 'Modernist Novellas',
  'Girişimci Düzyazısı': 'Founders Prose',
  'Zihinsel Modeller': 'Mental Models',
  'Kadim Bilgelik': 'Ancient Wisdom',
  'Spekülatif Düşünce': 'Speculative Thought',
  'Kişisel Gelişim': 'Personal Growth',
  'Kültürel Eleştiri': 'Cultural Criticism',
  'Algı Felsefesi': 'Philosophy of Perception',
  'Sosyoloji': 'Sociology',
  'Modern Klasikler': 'Modern Classics',
};

// Check if string contains distinct Turkish characters
export function hasTurkishChars(text: string): boolean {
  return /[çÇğĞıİöÖşŞüÜ]/.test(text);
}

// Check if string looks like English
export function looksLikeEnglish(text: string): boolean {
  if (!text) return false;
  if (hasTurkishChars(text)) return false;
  const commonEnWords = /\b(the|and|of|to|in|is|with|from|by|for|on|at|as|an|this|that|city|narrator|specialist|engineer|consultant|explorer|founder|curator|melancholy|fate|embrace)\b/i;
  return commonEnWords.test(text);
}

// Fast local heuristic translation for instant responsive UI
export function translateTextSync(text: string, fromLang: Language, toLang: Language): string {
  if (!text || !text.trim() || fromLang === toLang) {
    return text || '';
  }

  const trimmed = text.trim();

  // Strip decorative quotation marks for dictionary matching
  const hasQuotes = (trimmed.startsWith('“') && trimmed.endsWith('”')) ||
                    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                    (trimmed.startsWith("'") && trimmed.endsWith("'"));
  const unquoted = hasQuotes ? trimmed.slice(1, -1).trim() : trimmed;
  
  // Exact dictionary match (both unquoted and original)
  if (toLang === 'tr') {
    if (PHRASE_MAP_EN_TO_TR[trimmed]) return PHRASE_MAP_EN_TO_TR[trimmed];
    if (PHRASE_MAP_EN_TO_TR[unquoted]) {
      const match = PHRASE_MAP_EN_TO_TR[unquoted];
      return hasQuotes ? `“${match}”` : match;
    }
  } else if (toLang === 'en') {
    if (PHRASE_MAP_TR_TO_EN[trimmed]) return PHRASE_MAP_TR_TO_EN[trimmed];
    if (PHRASE_MAP_TR_TO_EN[unquoted]) {
      const match = PHRASE_MAP_TR_TO_EN[unquoted];
      return hasQuotes ? `“${match}”` : match;
    }
  }

  // Handle goals like "X books (Y completed)"
  if (toLang === 'tr') {
    const goalMatch = trimmed.match(/^(\d+)\s+books?\s*\((.*)\)$/i);
    if (goalMatch) {
      const num = goalMatch[1];
      const inner = goalMatch[2].replace(/completed/i, 'tamamlandı').replace(/read/i, 'okundu');
      return `${num} kitap (${inner})`;
    }
  } else if (toLang === 'en') {
    const goalMatch = trimmed.match(/^(\d+)\s+kitap\s*\((.*)\)$/i);
    if (goalMatch) {
      const num = goalMatch[1];
      const inner = goalMatch[2].replace(/tamamlandı/i, 'completed').replace(/okundu/i, 'read');
      return `${num} books (${inner})`;
    }
  }

  // Handle "by Author" pattern
  if (toLang === 'en') {
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

  // Check sync dictionary first
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
  } catch {
    // Graceful fallback to local heuristic
  }

  return localSync;
}

// Batch translate an object of string fields via Gemini with local sync fallback
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
    for (const { keySource, keyTarget } of fieldsToTranslate) {
      const val = source[keySource];
      const currentTargetVal = result[keyTarget];
      // Only request server translation if sync translation couldn't find a dictionary match
      if (typeof val === 'string' && val.trim() && currentTargetVal === val) {
        payload[keySource as string] = val;
      }
    }

    if (Object.keys(payload).length > 0) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

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
            if (aiTranslated && typeof aiTranslated === 'string' && aiTranslated.trim()) {
              result[keyTarget] = aiTranslated.trim() as any;
            }
          }
        }
      }
    }
  } catch {
    // Fallback sync values remain
  }

  return result;
}

// Synchronously ensure all member bilingual fields are populated and translated
export function translateMemberBilingualSync(member: Member): Member {
  // Check role
  let roleTr = member.role || '';
  let roleEn = member.roleEn || '';
  if (looksLikeEnglish(roleTr)) {
    if (!roleEn) roleEn = roleTr;
    roleTr = translateTextSync(roleTr, 'en', 'tr');
  } else if (!roleEn || roleEn === roleTr) {
    roleEn = translateTextSync(roleTr, 'tr', 'en');
  } else if (hasTurkishChars(roleEn)) {
    roleEn = translateTextSync(roleEn, 'tr', 'en');
  }

  // Check bio
  let bioTr = member.bio || '';
  let bioEn = member.bioEn || '';
  if (looksLikeEnglish(bioTr)) {
    if (!bioEn) bioEn = bioTr;
    bioTr = translateTextSync(bioTr, 'en', 'tr');
  } else if (!bioEn || bioEn === bioTr) {
    bioEn = translateTextSync(bioTr, 'tr', 'en');
  } else if (hasTurkishChars(bioEn)) {
    bioEn = translateTextSync(bioEn, 'tr', 'en');
  }

  // Check quote
  let quoteTr = member.favoriteQuote || '';
  let quoteEn = member.favoriteQuoteEn || '';
  if (looksLikeEnglish(quoteTr)) {
    if (!quoteEn) quoteEn = quoteTr;
    quoteTr = translateTextSync(quoteTr, 'en', 'tr');
  } else if (!quoteEn || quoteEn === quoteTr) {
    quoteEn = translateTextSync(quoteTr, 'tr', 'en');
  } else if (hasTurkishChars(quoteEn)) {
    quoteEn = translateTextSync(quoteEn, 'tr', 'en');
  }

  // Check goal
  let goalTr = member.readingGoal2026 || '';
  let goalEn = member.readingGoal2026En || '';
  if (looksLikeEnglish(goalTr)) {
    if (!goalEn) goalEn = goalTr;
    goalTr = translateTextSync(goalTr, 'en', 'tr');
  } else if (!goalEn || goalEn === goalTr) {
    goalEn = translateTextSync(goalTr, 'tr', 'en');
  } else if (hasTurkishChars(goalEn)) {
    goalEn = translateTextSync(goalEn, 'tr', 'en');
  }

  // Check currently reading
  let readingTr = member.currentlyReading || '';
  let readingEn = member.currentlyReadingEn || '';
  if (!readingEn || readingEn === readingTr) {
    readingEn = translateTextSync(readingTr, 'tr', 'en');
  }
  if (!readingTr || readingTr === readingEn) {
    readingTr = translateTextSync(readingEn, 'en', 'tr');
  }

  return {
    ...member,
    role: roleTr,
    roleEn,
    bio: bioTr,
    bioEn,
    favoriteQuote: quoteTr,
    favoriteQuoteEn: quoteEn,
    readingGoal2026: goalTr,
    readingGoal2026En: goalEn,
    currentlyReading: readingTr,
    currentlyReadingEn: readingEn,
  };
}
