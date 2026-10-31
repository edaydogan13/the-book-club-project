import { Book, Member, SalonRSVP, ReferralApplication, SiteContent, UserCredential } from '../types';
import { Language } from '../translations';
import { translateTextSync, looksLikeEnglish, hasTurkishChars } from '../utils/translator';

export const AFFILIATE_EMAIL = 'edaydogannn@gmail.com';
export const AFFILIATE_TAG_TR = 'edaydogannn-21';
export const AFFILIATE_TAG_EN = 'edaydogannn-20';

// EXACT 11 CLUB BOOKS (Start Date: November 2025)
// Ordered starting with currently reading: Trevor Noah - Suçlu Doğmak
export const INITIAL_BOOKS: Book[] = [
  // 1. Trevor Noah — Suçlu Doğmak / Born a Crime (Suggested by Mert) — CURRENTLY READING (Book of the Month)
  {
    id: 'suclu-dogmak',
    title: 'Suçlu Doğmak',
    titleEn: 'Born a Crime',
    originalTitle: 'Born a Crime: Stories from a South African Childhood',
    author: 'Trevor Noah',
    year: 2016,
    pages: 304,
    genre: 'Otobiyografi & Sosyal Hiciv',
    genreEn: 'Autobiography & Social Satire',
    synopsis: 'Apartheid rejiminin en karanlık döneminde, varlığı yasalara göre bir "suç" olan melez bir çocuğun hayatta kalma, dil öğrenme ve annesinin sarsılmaz inancıyla şekillenen dokunaklı ve mizahi hikayesi.',
    synopsisEn: 'The compelling, inspiring, and comically inventive story of a young man coming of age in South Africa during the twilight of apartheid and the tumultuous days of freedom that followed.',
    favoriteQuote: 'Dil bir insana ait olduğunu hissettirir. İnsanlarla kendi dillerinde konuştuğunuzda kalplerine ulaşırsınız.',
    favoriteQuoteEn: 'Language, even more than color, defines who you are to people. When you make the effort to speak someone’s language, you enter their heart.',
    suggesterId: 'can-mert',
    suggesterName: 'Mert (Can Mert)',
    month: 'Ekim 2026',
    monthEn: 'October 2026',
    monthTr: 'Ekim 2026',
    isBookOfMonth: true,
    coverColor: '#BF360C',
    accentColor: '#FFCCBC',
    spineTextColor: '#FFFFFF',
    coverPattern: 'arch',
    coverImageUrl: '/covers/suclu-dogmak.jpg',
    coverImageUrlTr: '/covers/suclu-dogmak.jpg',
    coverImageUrlEn: '/covers/born-a-crime.jpg',
    rating: 5,
    buyLinks: {
      tr: {
        store: 'Pegasus Yayınları / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Suclu+Dogmak+Trevor+Noah&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺225',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Spiegel & Grau / Amazon',
        url: `https://www.amazon.com/s?k=Born+a+Crime+Trevor+Noah&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$16.00',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    // No video uploaded yet for Born a Crime (Salon reflection pending)
    comments: [
      {
        id: 'c-sd-1',
        authorName: 'Mert (Can Mert)',
        memberId: 'can-mert',
        rating: 5,
        text: 'Şu an kulüp olarak okuduğumuz bu kitap, inanılmaz zor bir tarihi trajediyi böylesine sıcak, esprili ve cesur bir dille anlatmasıyla hepimizi büyüledi.',
        textEn: 'Currently reading this together as a club, and it completely captivated us with how it recounts a harrowing historical tragedy through such warm, sharp, and fearless humor.',
        favoriteQuote: 'Dil bir insana ait olduğunu hissettirir. İnsanlarla kendi dillerinde konuştuğunuzda kalplerine ulaşırsınız.',
        favoriteQuoteEn: 'Language, even more than color, defines who you are to people. When you make the effort to speak someone’s language, you enter their heart.',
        timestamp: 'Oct 20, 2026'
      },
      {
        id: 'c-sd-2',
        authorName: 'Cemre Şirin',
        memberId: 'cemre-sirin',
        rating: 5,
        text: 'Trevor’ın annesi Patricia Nombuyiselo Noah’ın cesareti ve oğluna kazandırdığı özgür zihin yapısı kitabın asıl kalbi.',
        textEn: "Trevor's mother Patricia Nombuyiselo Noah's courage and the liberating, fierce mindset she instilled in her son are the true beating heart of this book.",
        timestamp: 'Oct 21, 2026'
      }
    ],
    themes: ['Apartheid Resistance', 'Maternal Devotion', 'Language as Power', 'Identity'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 24,
      format: '13.5 × 21 cm'
    }
  },

  // 2. Orhan Pamuk — İstanbul: Hatıralar ve Şehir (Suggested by Gökçe)
  {
    id: 'istanbul-pamuk',
    title: 'İstanbul: Hatıralar ve Şehir',
    titleEn: 'Istanbul: Memories and the City',
    originalTitle: 'Istanbul: Memories and the City',
    author: 'Orhan Pamuk',
    year: 2003,
    pages: 440,
    genre: 'Anı & Edebi Coğrafya',
    genreEn: 'Memoir & Literary Geography',
    synopsis: 'Pamuk’un çocukluk ve ilk gençlik anılarını Boğaziçi’nin siyah-beyaz hüznüyle, Batılılaşma sancılarıyla ve şehrin melankolik ruhuyla iç içe dokuduğu başyapıtı.',
    synopsisEn: 'A portrait of Istanbul through the eyes of Nobel laureate Orhan Pamuk, blending personal boyhood memoir with the collective melancholy (hüzün) that hangs over the Bosphorus.',
    favoriteQuote: 'İstanbul’un hüznü, sadece bir duygu değil, şehrin tarihiyle nefes alan ortak bir bakış açısıdır.',
    favoriteQuoteEn: 'The hüzün of Istanbul is not just the feeling of evocative pain, but an all-encompassing, poetic state of mind.',
    suggesterId: 'gokce-uysal',
    suggesterName: 'Gökçe Nur Uysal',
    month: 'Eylül 2026',
    monthEn: 'September 2026',
    monthTr: 'Eylül 2026',
    isBookOfMonth: false,
    coverColor: '#3E2723',
    accentColor: '#D7CCC8',
    spineTextColor: '#FFFFFF',
    coverPattern: 'typographic',
    coverImageUrl: '/covers/istanbul-tr.jpg',
    coverImageUrlTr: '/covers/istanbul-tr.jpg',
    coverImageUrlEn: '/covers/istanbul-en.jpg',
    rating: 4.8,
    buyLinks: {
      tr: {
        store: 'Yapı Kredi Yayınları / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Istanbul+Hatiralar+ve+Sehir+Orhan+Pamuk&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺280',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Vintage International / Amazon',
        url: `https://www.amazon.com/s?k=Istanbul+Memories+and+the+City+Orhan+Pamuk&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$17.00',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-ip-1',
        authorName: 'Gökçe Nur Uysal',
        memberId: 'gokce-uysal',
        rating: 5,
        text: 'Bir kentin belleği ile bir yazarın hafızasının nasıl birbirine kenetlendiğini anlatan, İstanbul sokaklarını adımlarken insanın içini titreten bir eser.',
        textEn: 'A poignant masterwork revealing how a city’s collective memory intertwines with a writer’s intimate boyhood, resonating deeply as you walk Istanbul’s historic streets.',
        timestamp: 'Sep 22, 2026'
      }
    ],
    themes: ['Hüzün (Melancholy)', 'Urban Geography', 'Bosphorus Architecture', 'Memory'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 32,
      format: '13.5 × 20 cm'
    }
  },

  // 3. Marlen Haushofer — Duvar (Suggested by Gizem)
  {
    id: 'duvar-haushofer',
    title: 'Duvar',
    titleEn: 'The Wall',
    originalTitle: 'Die Wand (The Wall)',
    author: 'Marlen Haushofer',
    year: 1963,
    pages: 288,
    genre: 'Distopik Klasik & Yalnızlık',
    genreEn: 'Dystopian Classic & Solitude',
    synopsis: 'Avusturya dağlarında bir av köşkünde uyanan ve dünyadan görünmez şeffaf bir duvarla izole olan bir kadının doğayla, hayvanlarla ve mutlak yalnızlıkla hayatta kalma mücadelesi.',
    synopsisEn: 'A woman wakes in an Austrian hunting lodge to discover that an invisible, impenetrable wall has separated her from the rest of the world, sparking a profound meditation on survival and companionship.',
    favoriteQuote: 'Yalnızlık beni korkutmuyordu artık; korkutan şey geçmişin yankılarıydı.',
    favoriteQuoteEn: 'Solitude was no longer what I feared; what terrified me were the echoes of the past.',
    suggesterId: 'gizem-yenicikan',
    suggesterName: 'Gizem Yeniçıkan',
    month: 'Ağustos 2026',
    monthEn: 'August 2026',
    monthTr: 'Ağustos 2026',
    isBookOfMonth: false,
    coverColor: '#37474F',
    accentColor: '#90A4AE',
    spineTextColor: '#FFFFFF',
    coverPattern: 'minimal',
    coverImageUrl: '/covers/duvar.jpg',
    coverImageUrlTr: '/covers/duvar.jpg',
    coverImageUrlEn: '/covers/the-wall.jpg',
    rating: 4.9,
    buyLinks: {
      tr: {
        store: 'Yapı Kredi Yayınları / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Duvar+Marlen+Haushofer&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺195',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'New Directions / Cleis Press / Amazon',
        url: `https://www.amazon.com/s?k=The+Wall+Marlen+Haushofer&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$16.95',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    videoReview: {
      id: 'vid-duvar-gizem',
      title: 'Duvar — Görünmez Sınırlar, Doğa ve Radikal Yalnızlık',
      titleEn: 'The Wall — Invisible Borders, Nature, and Radical Solitude',
      speaker: 'Gizem Yeniçıkan',
      duration: '5:40 min',
      recordedDate: 'Ağustos 2026',
      recordedDateEn: 'August 2026',
      notes: 'Marlen Haushofer’ın kült distopyası üzerine Gizem’in video değerlendirmesi: Şeffaf duvarın sembolizmi, insan merkezci dünyanın çöküşü ve doğayla kurulan sessiz barış.',
      notesEn: "Gizem's video reflection on Marlen Haushofer's cult dystopian classic: The symbolism of the transparent wall, collapse of anthropocentrism, and quiet peace found in nature.",
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    },
    comments: [
      {
        id: 'c-dh-1',
        authorName: 'Gizem Yeniçıkan',
        memberId: 'gizem-yenicikan',
        rating: 5,
        text: 'Modern uygarlığın tüm konforundan kopulduğunda insanın hayvanlarla kurduğu o yalın bağ ve dingin sabır kulübümüzü derinden etkiledi.',
        textEn: 'When stripped of modern civilization’s conveniences, the primal bond formed with animals and the serene patience of survival deeply resonated with our club.',
        timestamp: 'Aug 24, 2026'
      }
    ],
    themes: ['Radical Solitude', 'Nature vs Civilization', 'Female Resilience', 'Survival'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 21,
      format: '13 × 19.5 cm'
    }
  },

  // 4. Thomas Mann — Venedik'te Ölüm / Death in Venice (Suggested by Ferhat)
  {
    id: 'venedikte-olum',
    title: "Venedik'te Ölüm",
    titleEn: 'Death in Venice',
    originalTitle: 'Der Tod in Venedig (Death in Venice)',
    author: 'Thomas Mann',
    year: 1912,
    pages: 104,
    genre: 'Modernist Novella & Estetik',
    genreEn: 'Modernist Novella & Aesthetics',
    synopsis: 'Disiplin ve rasyonelliğin timsali yazar Gustav von Aschenbach’ın Venedik’te güzellik, arzu ve kolera salgını karşısında yaşadığı trajik estetik çözülüş.',
    synopsisEn: 'Thomas Mann’s haunting novella tracing writer Gustav von Aschenbach’s obsession with beauty and physical collapse against cholera-stricken Venice.',
    favoriteQuote: 'Güzellik, duyulur olanın tinsel olana açılan tek yoludur.',
    favoriteQuoteEn: 'For beauty, Phaedrus, take note well, beauty alone is godlike and visible at once.',
    suggesterId: 'ferhat-babacan',
    suggesterName: 'Ferhat Babacan',
    month: 'Haziran 2026',
    monthEn: 'June 2026',
    monthTr: 'Haziran 2026',
    isBookOfMonth: false,
    coverColor: '#B71C1C',
    accentColor: '#FF8A80',
    spineTextColor: '#FFFFFF',
    coverPattern: 'arch',
    coverImageUrl: '/covers/venedikte-olum.jpg',
    coverImageUrlTr: '/covers/venedikte-olum.jpg',
    coverImageUrlEn: '/covers/death-in-venice.jpg',
    rating: 4.8,
    buyLinks: {
      tr: {
        store: 'Can Yayınları / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Venedikte+Olum+Thomas+Mann&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺95',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Vintage Classics / Amazon',
        url: `https://www.amazon.com/s?k=Death+in+Venice+Thomas+Mann&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$12.00',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-vo-1',
        authorName: 'Ferhat Babacan',
        memberId: 'ferhat-babacan',
        rating: 5,
        text: 'Kusursuz bir form ile kontrol edilemeyen tutkunun çarpışması. Thomas Mann’ın cümle mimarisi kelimenin tam anlamıyla bir şaheser.',
        textEn: 'The devastating collision of Apollonian discipline and uncontrollable Dionysian obsession. Thomas Mann’s sentence architecture is a sheer masterpiece.',
        timestamp: 'Jun 26, 2026'
      }
    ],
    themes: ['Aesthetic Obsession', 'Dionysian vs Apollonian', 'Decadence', 'Mortality'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 9,
      format: '12.5 × 19.5 cm'
    }
  },

  // 6. Georgi Gospodinov — Zaman Sığınağı / Time Shelter (Suggested by Gizem)
  {
    id: 'zaman-siginagi',
    title: 'Zaman Sığınağı',
    titleEn: 'Time Shelter',
    originalTitle: 'Time Shelter (Времеуbeжище)',
    author: 'Georgi Gospodinov',
    year: 2020,
    pages: 392,
    genre: 'Spekülatif Kurgu & Hafıza',
    genreEn: 'Speculative Fiction & Memory',
    synopsis: '2023 Uluslararası Booker Ödülü kazananı. Alzheimer hastaları için geçmişin her on yılının yeniden inşa edildiği kliniklerin tüm kıtaya yayılarak nostaljiyi tehlikeli bir siyasi sığınağa dönüştürüşü.',
    synopsisEn: 'Winner of the International Booker Prize, a clinic for the past offers a promising treatment for Alzheimer’s sufferers, each floor reproducing a past decade in minute detail.',
    favoriteQuote: 'Geçmiş, insanın geleceğe tahammül edemediğinde sığındığı bir siperdir.',
    favoriteQuoteEn: 'The past is not only what happened to you. It is also what you dreamed and never came to pass.',
    suggesterId: 'gizem-yenicikan',
    suggesterName: 'Gizem Yeniçıkan',
    month: 'Mayıs 2026',
    monthEn: 'May 2026',
    monthTr: 'Mayıs 2026',
    isBookOfMonth: false,
    coverColor: '#004D40',
    accentColor: '#26A69A',
    spineTextColor: '#FFFFFF',
    coverPattern: 'typographic',
    coverImageUrl: '/covers/zaman-siginagi.jpg',
    coverImageUrlTr: '/covers/zaman-siginagi.jpg',
    coverImageUrlEn: '/covers/time-shelter.jpg',
    rating: 4.9,
    buyLinks: {
      tr: {
        store: 'Metis Yayınları / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Zaman+Siginagi+Georgi+Gospodinov&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺230',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Liveright / W. W. Norton / Amazon',
        url: `https://www.amazon.com/s?k=Time+Shelter+Georgi+Gospodinov&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$18.95',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-zs-1',
        authorName: 'Gizem Yeniçıkan',
        memberId: 'gizem-yenicikan',
        rating: 5,
        text: 'Nostaljinin bir teselli olmaktan çıkıp kolektif bir hastalığa dönüşmesini Gospodinov olağanüstü bir şiirsellikle anlatmış.',
        textEn: 'Gospodinov portrays nostalgia turning from a gentle solace into an infectious collective malady with breathtaking poetic brilliance.',
        timestamp: 'May 25, 2026'
      }
    ],
    themes: ['Memory and Amnesia', 'Weaponized Nostalgia', 'European History', 'Passage of Time'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 28,
      format: '13 × 19.5 cm'
    }
  },

  // 7. Aldous Huxley — Algı Kapıları / The Doors of Perception (Suggested by Cemre)
  {
    id: 'algi-kapilari',
    title: 'Algı Kapıları',
    titleEn: 'The Doors of Perception',
    originalTitle: 'The Doors of Perception',
    author: 'Aldous Huxley',
    year: 1954,
    pages: 96,
    genre: 'Felsefi Deneme & Bilinç',
    genreEn: 'Philosophical Essay & Consciousness',
    synopsis: 'Huxley’nin William Blake’ten ilhamla insan bilincinin sınırlarını, beynin indirgeyici vanasını ve estetik algının sonsuzluğunu sorguladığı çığır açıcı denemesi.',
    synopsisEn: 'Aldous Huxley’s profound philosophical essay chronicling his altered sensory perception and the nature of human mystical and visual consciousness.',
    favoriteQuote: 'Algı kapıları temizlenseydi, her şey insana olduğu gibi görünürdü: Sonsuz.',
    favoriteQuoteEn: 'If the doors of perception were cleansed, everything would appear to man as it is, infinite.',
    suggesterId: 'cemre-sirin',
    suggesterName: 'Cemre Şirin',
    month: 'Nisan 2026',
    monthEn: 'April 2026',
    monthTr: 'Nisan 2026',
    isBookOfMonth: false,
    coverColor: '#4A148C',
    accentColor: '#AB47BC',
    spineTextColor: '#FFFFFF',
    coverPattern: 'arch',
    coverImageUrl: '/covers/algi-kapilari-tr.jpg',
    coverImageUrlTr: '/covers/algi-kapilari-tr.jpg',
    coverImageUrlEn: '/covers/doors-of-perception-en.jpg',
    rating: 4.6,
    buyLinks: {
      tr: {
        store: 'İthaki / 6.45 / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Algi+Kapilari+Aldous+Huxley&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺110',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Harper Perennial / Amazon',
        url: `https://www.amazon.com/s?k=The+Doors+of+Perception+Aldous+Huxley&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$13.99',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-ak-1',
        authorName: 'Cemre Şirin',
        memberId: 'cemre-sirin',
        rating: 5,
        text: 'Rasyonalitenin bize dayattığı filtrelerin ötesine geçebilme olasılığı insanı hem ürpertiyor hem büyülüyor.',
        textEn: 'The possibility of transcending the utilitarian filters imposed by rationality is both chilling and profoundly mesmerizing.',
        timestamp: 'Apr 22, 2026'
      }
    ],
    themes: ['Limits of Consciousness', 'Aesthetic Epiphany', 'William Blake', 'Philosophy of Mind'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 8,
      format: '12.5 × 19 cm'
    }
  },

  // 8. Eric Jorgenson — The Almanack of Naval Ravikant (Suggested by Eda)
  {
    id: 'almanack-naval',
    title: 'The Almanack of Naval Ravikant',
    titleEn: 'The Almanack of Naval Ravikant',
    originalTitle: 'The Almanack of Naval Ravikant: A Guide to Wealth and Happiness',
    author: 'Eric Jorgenson',
    year: 2020,
    pages: 244,
    genre: 'Felsefe, Servet & Zihinsel Modeller',
    genreEn: 'Philosophy & Wealth Creation',
    synopsis: 'Silikon Vadisi’nin en özgün düşünürlerinden Naval Ravikant’ın servet inşası, özgürlük, yargı gücü ve iç huzur üzerine düşüncelerini derleyen modern bilgelik metni.',
    synopsisEn: 'A guide to wealth and happiness compiled from the wisdom, essays, and transcripts of Silicon Valley philosopher-investor Naval Ravikant by Eric Jorgenson.',
    favoriteQuote: 'Desire is a contract that you make with yourself to be unhappy until you get what you want.',
    favoriteQuoteEn: 'Desire is a contract you make with yourself to be unhappy until you get what you want.',
    suggesterId: 'eda-aydogan',
    suggesterName: 'Eda Aydoğan',
    month: 'Mart 2026',
    monthEn: 'March 2026',
    monthTr: 'Mart 2026',
    isBookOfMonth: false,
    coverColor: '#212121',
    accentColor: '#304FFE',
    spineTextColor: '#FFFFFF',
    coverPattern: 'minimal',
    coverImageUrl: '/covers/almanack-of-naval-tr.jpg',
    coverImageUrlTr: '/covers/almanack-of-naval-tr.jpg',
    coverImageUrlEn: '/covers/almanack-of-naval-en.jpg',
    rating: 4.9,
    buyLinks: {
      tr: {
        store: 'Kronik Kitap / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Almanack+of+Naval+Ravikant&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺295',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Amazon Global',
        url: `https://www.amazon.com/s?k=The+Almanack+of+Naval+Ravikant+Eric+Jorgenson&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$15.00',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-anr-1',
        authorName: 'Eda Aydoğan',
        memberId: 'eda-aydogan',
        rating: 5,
        text: 'Zamanı paradan üstün tutmak ve spesifik bilgi edinmenin önemi üzerine grubumuzda çok zihin açıcı sohbetler yaptık.',
        textEn: 'We had illuminating salon discussions on valuing time over money, cultivating specific knowledge, and building sovereign peace of mind.',
        timestamp: 'Mar 28, 2026'
      }
    ],
    themes: ['Specific Knowledge', 'Leverage', 'Peace of Mind', 'Mental Models'],
    physicalDetails: {
      binding: 'Hardcover',
      thicknessMm: 20,
      format: '14 × 21 cm'
    }
  },

  // 9. Don Miguel Ruiz — Beşinci Anlaşma / The Fifth Agreement (Suggested by Eda)
  {
    id: 'besinci-anlasma',
    title: 'Beşinci Anlaşma',
    titleEn: 'The Fifth Agreement',
    originalTitle: 'The Fifth Agreement: A Practical Guide to Self-Mastery',
    author: 'Don Miguel Ruiz & Don Jose Ruiz',
    year: 2009,
    pages: 248,
    genre: 'Toltek Bilgeliği & Farkındalık',
    genreEn: 'Toltec Wisdom & Mindfulness',
    synopsis: 'Dört Anlaşma’nın devamı niteliğindeki bu eser, kadim Toltek bilgeliğini "şüpheci ol ama dinlemeyi öğren" ilkesiyle taçlandırarak algı kalıplarımızı sorgulamamızı sağlar.',
    synopsisEn: 'Don Miguel Ruiz introduces the fifth agreement: Be skeptical, but learn to listen, unlocking the deepest level of authenticity and personal freedom.',
    favoriteQuote: 'Şüpheci ol ama dinlemeyi öğren. Gerçeğin senin savunmana ihtiyacı yoktur.',
    favoriteQuoteEn: 'Be skeptical, but learn to listen. The power of doubt clears away all lies.',
    suggesterId: 'eda-aydogan',
    suggesterName: 'Eda Aydoğan',
    month: 'Şubat 2026',
    monthEn: 'February 2026',
    monthTr: 'Şubat 2026',
    isBookOfMonth: false,
    coverColor: '#2E7D32',
    accentColor: '#FDD835',
    spineTextColor: '#FFFFFF',
    coverPattern: 'arch',
    coverImageUrl: '/covers/besinci-anlasma-tr.jpg',
    coverImageUrlTr: '/covers/besinci-anlasma-tr.jpg',
    coverImageUrlEn: '/covers/the-fifth-agreement-en.jpg',
    rating: 4.8,
    buyLinks: {
      tr: {
        store: 'Ötesi Yayıncılık / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Besinci+Anlasma+Don+Miguel+Ruiz&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺180',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Amber-Allen Publishing / Amazon',
        url: `https://www.amazon.com/s?k=The+Fifth+Agreement+Don+Miguel+Ruiz&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$14.50',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-5a-1',
        authorName: 'Eda Aydoğan',
        memberId: 'eda-aydogan',
        rating: 5,
        text: 'Zihnimizdeki semboller sisteminin nasıl bir hapishaneye dönüşebileceğini ve beşinci anlaşmanın getirdiği dinginliği tartıştık.',
        textEn: 'We explored how learned symbols can become an internal prison, and embraced the tranquil clarity offered by the fifth agreement.',
        timestamp: 'Feb 26, 2026'
      }
    ],
    themes: ['Toltec Philosophy', 'Self-Mastery', 'Authenticity', 'Radical Honesty'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 18,
      format: '13.5 × 19.5 cm'
    }
  },

  // 10. Dave Evans & Bill Burnett — Designing Your Life (Suggested by Mert)
  {
    id: 'designing-your-life',
    title: 'Designing Your Life',
    titleEn: 'Designing Your Life',
    originalTitle: 'Designing Your Life: How to Build a Well-Lived, Joyful Life',
    author: 'Bill Burnett & Dave Evans',
    year: 2016,
    pages: 272,
    genre: 'Tasarım Odaklı Düşünme & Kişisel Gelişim',
    genreEn: 'Design Thinking & Personal Growth',
    synopsis: 'Stanford Tasarım Programı kurucularının tasarım odaklı düşünme (design thinking) metodolojisini insan hayatına, kariyerine ve varoluşsal kararlarına uyarlayan ilham verici rehberi.',
    synopsisEn: 'Stanford Design Program founders apply design thinking methodology to human career choices, life fulfillment, and joyful future prototyping.',
    favoriteQuote: 'You are here. Life is not a problem to be solved, it is an experience to be designed.',
    favoriteQuoteEn: 'You are here. Life is not a problem to be solved, it is an experience to be designed.',
    suggesterId: 'can-mert',
    suggesterName: 'Mert (Can Mert)',
    month: 'Ocak 2026',
    monthEn: 'January 2026',
    monthTr: 'Ocak 2026',
    isBookOfMonth: false,
    coverColor: '#E65100',
    accentColor: '#FFB300',
    spineTextColor: '#FFFFFF',
    coverPattern: 'geometric',
    coverImageUrl: '/covers/designing-your-life-tr.jpg',
    coverImageUrlTr: '/covers/designing-your-life-tr.jpg',
    coverImageUrlEn: '/covers/designing-your-life-en.jpg',
    rating: 4.7,
    buyLinks: {
      tr: {
        store: 'Optimist Yayınları / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Designing+Your+Life+Bill+Burnett&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺240',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Knopf / Amazon Global',
        url: `https://www.amazon.com/s?k=Designing+Your+Life+Bill+Burnett&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$16.99',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-dyl-1',
        authorName: 'Mert (Can Mert)',
        memberId: 'can-mert',
        rating: 5,
        text: 'Bir mühendis olarak hayatı tek bir hedef doğrultusunda optimize etmek yerine prototiplerle denemek fikri ufkumu açtı.',
        textEn: 'As an engineer, approaching life not as a rigid optimization problem to be solved, but as prototypes to experience, broadened my perspective.',
        timestamp: 'Jan 24, 2026'
      }
    ],
    themes: ['Design Thinking', 'Prototyping Life', 'Career Navigation', 'Curiosity'],
    physicalDetails: {
      binding: 'Hardcover',
      thicknessMm: 22,
      format: '14 × 21.5 cm'
    }
  },

  // 11. Nurdan Gürbilek — Vitrinde Yaşamak (Suggested by Cemre)
  {
    id: 'vitrinde-yasamak',
    title: 'Vitrinde Yaşamak',
    titleEn: 'Living in the Display Window',
    originalTitle: "Vitrinde Yaşamak: 1980'lerin Kültürel İklimi",
    author: 'Nurdan Gürbilek',
    year: 1992,
    pages: 208,
    genre: 'Kültürel Eleştiri & Felsefe',
    genreEn: 'Cultural Criticism & Philosophy',
    synopsis: "1980'ler sonrasında Türkiye'de yaşanan köklü kültürel dönüşümü, mahremiyetin kamusallaşmasını, popüler kültürün ve vitrin estetiğinin gündelik hayatı nasıl kuşattığını incelikle çözümleyen temel bir başyapıt.",
    synopsisEn: "Nurdan Gürbilek’s penetrating cultural criticism examining Turkey’s post-1980 transformation, commodification of language, and the spectacle of privacy.",
    favoriteQuote: 'Vitrinin ışığı arttıkça, arka odaların karanlığı daha da koyulaşır.',
    favoriteQuoteEn: 'As the light of the showcase intensifies, the darkness in the back rooms deepens.',
    suggesterId: 'cemre-sirin',
    suggesterName: 'Cemre Şirin',
    month: 'Kasım 2025',
    monthEn: 'November 2025',
    monthTr: 'Kasım 2025',
    isBookOfMonth: false,
    coverColor: '#1A365D',
    accentColor: '#C45B38',
    spineTextColor: '#FFFFFF',
    coverPattern: 'typographic',
    coverImageUrl: '/covers/vitrinde-yasamak-tr.jpg',
    coverImageUrlTr: '/covers/vitrinde-yasamak-tr.jpg',
    coverImageUrlEn: '/covers/vitrinde-yasamak-en.jpg',
    rating: 5,
    buyLinks: {
      tr: {
        store: 'Metis Yayınları / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Vitrinde+Yasamak+Nurdan+Gurbilek&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺165',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Amazon Global & Bookshop',
        url: `https://www.amazon.com/s?k=Nurdan+Gurbilek+Vitrinde+Yasamak&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$18.00',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-vitrin-1',
        authorName: 'Cemre Şirin',
        memberId: 'cemre-sirin',
        rating: 5,
        text: 'Nurdan Gürbilek, 1980 sonrası Türkiye’de dilin, duyguların ve siyasetin vitrine çıkışını öyle bir neşterle inceliyor ki bugünün dijital çağını anlamak için de pusula niteliğinde.',
        textEn: 'Nurdan Gürbilek dissects the public spectacle of language and privacy in post-1980 Turkey with such razor precision that it remains an indispensable compass for understanding today’s digital era.',
        timestamp: 'Nov 14, 2025'
      }
    ],
    themes: ['Cultural Hegemony', 'Privacy vs Display', '1980s Transformation', 'Modernity in Turkey'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 16,
      format: '13 × 19.5 cm'
    }
  }
];

// EDA AYDOĞAN'S EXTRA PERSONAL BOOKS READ DURING THE BOOK CLUB (SINCE NOVEMBER 2025)
// These books are specifically added to Eda's personal shelf
export const EDA_EXTRA_BOOKS: Book[] = [
  // 1. Halil Cibran — Ermiş / The Prophet
  {
    id: 'eda-ermis',
    title: 'Ermiş',
    titleEn: 'The Prophet',
    originalTitle: 'The Prophet',
    author: 'Halil Cibran',
    year: 1923,
    pages: 112,
    genre: 'Ruhsal Bilgelik & Şiirsel Felsefe',
    genreEn: 'Spiritual Wisdom & Poetic Philosophy',
    synopsis: 'El-Mustafa’nın Orphalese kentinden ayrılmadan önce halkla sevgi, evlilik, çalışma, sevinç, keder, özgürlük, acı ve ölüm üzerine paylaştığı şiirsel bilgelik dersleri. Eda’nın Kasım 2025’ten bu yana kulüp dönemi boyunca okuduğu kişisel seçki.',
    synopsisEn: 'Kahlil Gibran’s poetic masterpiece on love, freedom, work, children, and death delivered by the prophet Almustafa before he departs the city of Orphalese.',
    favoriteQuote: 'Sevgi bir şey istemez, yalnız kendisini. Sevgi ne sahip olur ne de sahip olunur; çünkü sevgiye sevgi yeter.',
    favoriteQuoteEn: 'Love gives naught but itself and takes naught but from itself. Love possesses not nor would it be possessed; for love is sufficient unto love.',
    suggesterId: 'eda-aydogan',
    suggesterName: 'Eda Aydoğan',
    month: 'Kişisel Okuma · Kas 2025+',
    monthEn: 'Personal Read · Nov 2025+',
    monthTr: 'Kişisel Okuma · Kas 2025+',
    isBookOfMonth: false,
    isPersonalExtra: true,
    personalReadDate: 'November 2025',
    coverColor: '#5D4037',
    accentColor: '#FFD54F',
    spineTextColor: '#FFFFFF',
    coverPattern: 'geometric',
    coverImageUrl: '/covers/ermis-tr.jpg',
    coverImageUrlTr: '/covers/ermis-tr.jpg',
    coverImageUrlEn: '/covers/the-prophet-en.jpg',
    rating: 5,
    buyLinks: {
      tr: {
        store: 'İş Bankası Kültür Yayınları / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Ermis+Halil+Cibran&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺75',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Knopf / Amazon Global',
        url: `https://www.amazon.com/s?k=The+Prophet+Kahlil+Gibran&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$12.00',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-eda-ermis',
        authorName: 'Eda Aydoğan',
        memberId: 'eda-aydogan',
        rating: 5,
        text: 'Kulüp sürecinde tekrar döndüğüm ve her cümlesinde derin bir sükûnet bulduğum başucu eserim. Sevgiye ve içsel bağımsızlığa dair zamansız bir pusula.',
        textEn: 'A bedside sanctuary I returned to during our club journey, finding profound calm in every line. A timeless compass for love and inner independence.',
        favoriteQuote: 'Sevgi bir şey istemez, yalnız kendisini. Sevgi ne sahip olur ne de sahip olunur; çünkü sevgiye sevgi yeter.',
        timestamp: 'Nov 2025'
      }
    ],
    themes: ['Spiritual Wisdom', 'Love & Attachment', 'Poetic Thought', 'Inner Freedom'],
    physicalDetails: {
      binding: 'Hardcover',
      thicknessMm: 14,
      format: '12.5 × 19.5 cm'
    }
  },

  // 2. Byung-Chul Han — Ritüellerin Yok Oluşuna Dair / The Disappearance of Rituals
  {
    id: 'eda-ritueller',
    title: 'Ritüellerin Yok Oluşuna Dair',
    titleEn: 'The Disappearance of Rituals',
    originalTitle: 'Vom Verschwinden der Rituale: Eine Topologie der Gegenwart',
    author: 'Byung-Chul Han',
    year: 2019,
    pages: 120,
    genre: 'Çağdaş Felsefe & Kültürel Eleştiri',
    genreEn: 'Contemporary Philosophy & Cultural Criticism',
    synopsis: 'Dijitalleşme ve hız çağında toplumsal ritüellerin, ortak mekanların ve süreklilik hissinin nasıl kaybolduğunu; şeylerin ve zamanın nasıl salt tüketim nesnesine dönüştüğünü çözümleyen sarsıcı bir felsefi deneme.',
    synopsisEn: 'Byung-Chul Han examines how digital communication and hyper-production disintegrate communal rituals and shared temporal dwelling.',
    favoriteQuote: 'Ritüeller, zamana bir yurt verirler. Zamanın akışını duraklatıp ona bir ritim kazandırırlar.',
    favoriteQuoteEn: 'Rituals are to time what a house is to space; they make time inhabitable.',
    suggesterId: 'eda-aydogan',
    suggesterName: 'Eda Aydoğan',
    month: 'Kişisel Okuma · 2026',
    monthEn: 'Personal Read · 2026',
    monthTr: 'Kişisel Okuma · 2026',
    isBookOfMonth: false,
    isPersonalExtra: true,
    personalReadDate: 'January 2026',
    coverColor: '#263238',
    accentColor: '#FFAB00',
    spineTextColor: '#FFFFFF',
    coverPattern: 'minimal',
    coverImageUrl: '/covers/ritueller-tr.jpg',
    coverImageUrlTr: '/covers/ritueller-tr.jpg',
    coverImageUrlEn: '/covers/disappearance-of-rituals-en.jpg',
    rating: 5,
    buyLinks: {
      tr: {
        store: 'Metis Yayınları / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Rituellerin+Yok+Olusuna+Dair+Byung+Chul+Han&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺135',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Polity Press / Amazon Global',
        url: `https://www.amazon.com/s?k=The+Disappearance+of+Rituals+Byung-Chul+Han&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$16.95',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-eda-rituel',
        authorName: 'Eda Aydoğan',
        memberId: 'eda-aydogan',
        rating: 5,
        text: 'Aşırı iletişim ve narsisistik şeffaflık dünyasında ortak bağların neden aşındığını anlamak için mutlaka okunması gereken berrak bir düşünce eseri.',
        textEn: 'A lucid essay essential for comprehending why communal ties erode in an era of hyper-communication and narcissistic transparency.',
        favoriteQuote: 'Ritüeller, zamana bir yurt verirler. Zamanın akışını duraklatıp ona bir ritim kazandırırlar.',
        timestamp: 'Jan 2026'
      }
    ],
    themes: ['Philosophy of Time', 'Loss of Community', 'Digital Fatigue', 'Sacredness of Repetition'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 12,
      format: '13 × 19.5 cm'
    }
  },

  // 3. Tuğba Doğan — Nefaset Lokantası / Nefaset Restaurant
  {
    id: 'eda-nefaset',
    title: 'Nefaset Lokantası',
    titleEn: 'Nefaset Restaurant',
    originalTitle: 'Nefaset Lokantası',
    author: 'Tuğba Doğan',
    year: 2020,
    pages: 168,
    genre: 'Çağdaş Türk Edebiyatı & Roman',
    genreEn: 'Contemporary Turkish Literature & Fiction',
    synopsis: 'Hafıza, kentsel dönüşüm, geçmişin tatları ve bir lokantanın sıcaklığında kesişen kırılgan insan ilişkilerini incelikli bir edebiyat diliyle anlatan ödüllü roman.',
    synopsisEn: 'Tuğba Doğan’s evocative psychological novel exploring memory, solitary urban life, and emotional shelter in an old Istanbul eatery.',
    favoriteQuote: 'Hatırlamak, kaybolan bir lezzeti damağında aramak gibidir; zaman geçse de izi kalır.',
    favoriteQuoteEn: 'Remembering is like seeking a vanished flavor on your palate; even as time passes, its imprint remains.',
    suggesterId: 'eda-aydogan',
    suggesterName: 'Eda Aydoğan',
    month: 'Kişisel Okuma · 2026',
    monthEn: 'Personal Read · 2026',
    monthTr: 'Kişisel Okuma · 2026',
    isBookOfMonth: false,
    isPersonalExtra: true,
    personalReadDate: 'February 2026',
    coverColor: '#4A148C',
    accentColor: '#CE93D8',
    spineTextColor: '#FFFFFF',
    coverPattern: 'arch',
    coverImageUrl: '/covers/nefaset-lokantasi-tr.jpg',
    coverImageUrlTr: '/covers/nefaset-lokantasi-tr.jpg',
    coverImageUrlEn: '/covers/nefaset-lokantasi-en.jpg',
    rating: 4.8,
    buyLinks: {
      tr: {
        store: 'Yapı Kredi Yayınları / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Nefaset+Lokantasi+Tugba+Dogan&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺145',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Amazon Global',
        url: `https://www.amazon.com/s?k=Tugba+Dogan+Nefaset+Lokantasi&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$15.00',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-eda-nefaset',
        authorName: 'Eda Aydoğan',
        memberId: 'eda-aydogan',
        rating: 5,
        text: 'İstanbul’un kaybolan mekan hafızası ve insan ruhunun saklı odaları üzerine son derece zarif ve hisli bir anlatı.',
        textEn: 'An exquisite, soulful narrative reflecting on Istanbul’s vanishing architectural memory and the secluded chambers of the human spirit.',
        timestamp: 'Feb 2026'
      }
    ],
    themes: ['Urban Memory', 'Sensory Nostalgia', 'Fragile Connections', 'Istanbul Identity'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 16,
      format: '13.5 × 21 cm'
    }
  },

  // 4. Jack London — Kızıl Veba / The Scarlet Plague
  {
    id: 'eda-kizil-veba',
    title: 'Kızıl Veba',
    titleEn: 'The Scarlet Plague',
    originalTitle: 'The Scarlet Plague',
    author: 'Jack London',
    year: 1912,
    pages: 88,
    genre: 'Kıyamet Sonrası Klasik & Sosyal Kurgu',
    genreEn: 'Post-Apocalyptic Classic & Social Fiction',
    synopsis: '2013 yılında aniden patlak veren gizemli bir salgının uygarlığı çökertmesinden altmış yıl sonra, eski bir edebiyat profesörünün torunlarına insanlığın kaybolan sanatını ve kibrini anlatması.',
    synopsisEn: 'Jack London’s visionary 1912 post-apocalyptic novella exploring the fragility of human civilization when confronted with an unstoppable epidemic.',
    favoriteQuote: 'Uygarlık bir sabun köpüğü gibiydi; göz kamaştırıcı ve inanılmaz derecede kırılgandı.',
    favoriteQuoteEn: 'Civilization is like a soap bubble; radiant, dazzling, and inconceivably fragile.',
    suggesterId: 'eda-aydogan',
    suggesterName: 'Eda Aydoğan',
    month: 'Kişisel Okuma · 2026',
    monthEn: 'Personal Read · 2026',
    monthTr: 'Kişisel Okuma · 2026',
    isBookOfMonth: false,
    isPersonalExtra: true,
    personalReadDate: 'March 2026',
    coverColor: '#880E4F',
    accentColor: '#FF4081',
    spineTextColor: '#FFFFFF',
    coverPattern: 'typographic',
    coverImageUrl: '/covers/kizil-veba-tr.jpg',
    coverImageUrlTr: '/covers/kizil-veba-tr.jpg',
    coverImageUrlEn: '/covers/the-scarlet-plague-en.jpg',
    rating: 4.8,
    buyLinks: {
      tr: {
        store: 'İş Bankası Kültür Yayınları / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Kizil+Veba+Jack+London&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺65',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Macmillan / Amazon Global',
        url: `https://www.amazon.com/s?k=The+Scarlet+Plague+Jack+London&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$9.99',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-eda-kizil',
        authorName: 'Eda Aydoğan',
        memberId: 'eda-aydogan',
        rating: 5,
        text: 'Jack London’ın 1912’de kaleme aldığı bu vizyoner distopya, insan doğasının uygarlık örtüsü kalktığında ne denli vahşileşebileceğini ve kültürün kırılganlığını çarpıcı biçimde sergiliyor.',
        textEn: 'Jack London’s visionary 1912 novella strikingly showcases how fragile culture is and how savage human nature can become once the veneer of civilization dissolves.',
        timestamp: 'Mar 2026'
      }
    ],
    themes: ['Fragility of Civilization', 'Apocalyptic Foresight', 'Human Nature', 'Preservation of Knowledge'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 10,
      format: '12.5 × 19.5 cm'
    }
  },

  // 5. Matt Haig — Gece Yarısı Kütüphanesi / The Midnight Library (Eda's Extra Read)
  {
    id: 'eda-gece-yarisi',
    title: 'Gece Yarısı Kütüphanesi',
    titleEn: 'The Midnight Library',
    originalTitle: 'The Midnight Library',
    author: 'Matt Haig',
    year: 2020,
    pages: 288,
    genre: 'Felsefi Kurgu & Paralel Yaşamlar',
    genreEn: 'Philosophical Fiction & Parallel Realities',
    synopsis: 'Yaşam ile ölüm arasındaki o gizemli eşikte, verilmemiş kararların ve yaşanmamış pişmanlıkların her birinin ayrı bir kitaba dönüştüğü büyüleyici bir varoluş yolculuğu. Eda’nın kulüp dönemi boyunca okuduğu kişisel seçki.',
    synopsisEn: 'Between life and death there is a library where shelves go on forever. Nora Seed gets the chance to undo regrets and find what truly makes a life worth living.',
    favoriteQuote: 'Oynayabileceğin hayatlar sonsuz olabilir ama gerçekten yaşayabileceğin hayat sadece şu andır.',
    favoriteQuoteEn: 'You don’t have to understand life. You just have to live it.',
    suggesterId: 'eda-aydogan',
    suggesterName: 'Eda Aydoğan',
    month: 'Kişisel Okuma · 2026',
    monthEn: 'Personal Read · 2026',
    monthTr: 'Kişisel Okuma · 2026',
    isBookOfMonth: false,
    isPersonalExtra: true,
    personalReadDate: 'December 2025',
    coverColor: '#0D47A1',
    accentColor: '#64B5F6',
    spineTextColor: '#FFFFFF',
    coverPattern: 'geometric',
    coverImageUrl: '/covers/gece-yarisi-kutuphanesi-tr.jpg',
    coverImageUrlTr: '/covers/gece-yarisi-kutuphanesi-tr.jpg',
    coverImageUrlEn: '/covers/the-midnight-library-en.jpg',
    rating: 4.8,
    buyLinks: {
      tr: {
        store: 'Domingo Yayınevi / Amazon TR',
        url: `https://www.amazon.com.tr/s?k=Gece+Yarisi+Kutuphanesi+Matt+Haig&tag=${AFFILIATE_TAG_TR}`,
        language: 'TR',
        price: '₺210',
        affiliateTag: AFFILIATE_TAG_TR,
        badge: 'Amazon TR Partner'
      },
      en: {
        store: 'Viking / Penguin / Amazon',
        url: `https://www.amazon.com/s?k=The+Midnight+Library+Matt+Haig&tag=${AFFILIATE_TAG_EN}`,
        language: 'EN',
        price: '$14.99',
        affiliateTag: AFFILIATE_TAG_EN,
        badge: 'Amazon Associates'
      }
    },
    comments: [
      {
        id: 'c-eda-gyt',
        authorName: 'Eda Aydoğan',
        memberId: 'eda-aydogan',
        rating: 5,
        text: 'Pişmanlıklar kütüphanesini kapatıp elindeki hayatın değerini bilmek üzerine çok sıcak ve iyileştirici bir kitap.',
        textEn: 'A warm, deeply therapeutic exploration of closing the library of regrets and learning to appreciate the life you are actively living.',
        timestamp: 'Dec 2025'
      }
    ],
    themes: ['Regret & Possibility', 'Parallel Choices', 'Self-Forgiveness', 'Mental Health'],
    physicalDetails: {
      binding: 'Paperback',
      thicknessMm: 22,
      format: '14 × 21 cm'
    }
  }
];

// USER CREDENTIALS FOR AUTHENTICATION
export const MEMBER_CREDENTIALS: UserCredential[] = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    displayName: 'Admin (Eda Aydoğan)',
    avatarUrl: '/members/edaaydogan.jpg',
  },
  {
    username: 'Gizem123',
    password: 'gizem123',
    role: 'member',
    memberId: 'gizem-yenicikan',
    displayName: 'Gizem Yeniçıkan',
    avatarUrl: '/members/gizemyenicikan.jpg',
  },
  {
    username: 'Eda123',
    password: 'eda123',
    role: 'member',
    memberId: 'eda-aydogan',
    displayName: 'Eda Aydoğan',
    avatarUrl: '/members/edaaydogan.jpg',
  },
  {
    username: 'Cemre123',
    password: 'cemre123',
    role: 'member',
    memberId: 'cemre-sirin',
    displayName: 'Cemre Şirin',
    avatarUrl: '/members/cemresirin.webp?v=2',
  },
  {
    username: 'Mert123',
    password: 'mert123',
    role: 'member',
    memberId: 'can-mert',
    displayName: 'Mert (Can Mert)',
    avatarUrl: '/members/canmert.jpg',
  },
  {
    username: 'Ferhat123',
    password: 'ferhat123',
    role: 'member',
    memberId: 'ferhat-babacan',
    displayName: 'Ferhat Babacan',
    avatarUrl: '/members/ferhatbabacan.webp',
  },
  {
    username: 'Gokce123',
    password: 'gokce123',
    role: 'member',
    memberId: 'gokce-uysal',
    displayName: 'Gökçe Nur Uysal',
    avatarUrl: '/members/gokcenuruysal.jpg',
  },
];

// THE 6 MEMBERS OF BOOKS & FRIENDS
export const INITIAL_MEMBERS: Member[] = [
  // 1. Cemre Şirin (Founder)
  {
    id: 'cemre-sirin',
    name: 'Cemre Şirin',
    role: 'Kurucu (Founder)',
    roleEn: 'Founder',
    bio: 'Books & Friends kitap kulübünün kurucusu. İstanbul merkezli Digital Turbine bünyesinde satın alma ve operasyonel yönetim alanında çalışıyor. Felsefe, eleştirel düşünce ve insanları derin edebiyat sohbetleri etrafında bir araya getirme tutkusuyla kulübümüzü Kasım 2025’te hayata geçirdi.',
    bioEn: 'Founder of the Books & Friends book club. Working in procurement and operational management at Digital Turbine in Istanbul. Passionate about philosophy, critical thinking, and gathering minds around deep literary salons since November 2025.',
    favoriteGenres: ['Cultural Criticism', 'Philosophy of Perception', 'Sociology', 'Modern Classics'],
    readingGoal2026: '24 kitap (20 tamamlandı)',
    readingGoal2026En: '24 books (20 completed)',
    currentlyReading: 'Suçlu Doğmak by Trevor Noah',
    currentlyReadingEn: 'Born a Crime by Trevor Noah',
    linkedinUrl: 'https://www.linkedin.com/in/cemresirin/',
    avatarUrl: '/members/cemresirin.webp?v=2',
    joinedYear: 'Founder (Nov 2025)',
    favoriteQuote: 'Kendi sesini bulmak, vitrinin ötesindeki hakikate dokunabilmektir.',
    favoriteQuoteEn: 'To discover one’s true voice is to touch the reality behind the showcase.',
    books: [
      INITIAL_BOOKS[5], // Algı Kapıları (Curated by Cemre)
      INITIAL_BOOKS[9], // Vitrinde Yaşamak (Curated by Cemre)
      INITIAL_BOOKS[0], // Suçlu Doğmak
      INITIAL_BOOKS[1], // İstanbul
      INITIAL_BOOKS[2], // Duvar
      INITIAL_BOOKS[3], // Venedik'te Ölüm
      INITIAL_BOOKS[4], // Zaman Sığınağı
      INITIAL_BOOKS[6], // The Almanack of Naval Ravikant
      INITIAL_BOOKS[7], // Beşinci Anlaşma
      INITIAL_BOOKS[8], // Designing Your Life
    ]
  },

  // 2. Eda Aydoğan (Curator & Web Architect)
  {
    id: 'eda-aydogan',
    name: 'Eda Aydoğan',
    role: 'Küratör & Web Mimarı',
    roleEn: 'Curator & Web Architect',
    bio: 'Books & Friends platformunun mimarı ve küratörü. Teknoloji girişimlerinde ürün liderliği ve pazarlama rolleri üstlendi (Insider, Talabat, Bluedot). Dokunsal kitap tasarımları, zamansız fikirler ve topluluk odaklı derin okuma pratikleri üzerine odaklanıyor.',
    bioEn: 'Architect and curator of the Books & Friends platform. Former product marketing leader across global tech ventures (Insider, Talabat, Bluedot). Focused on tactile book aesthetics, timeless wisdom, and intentional slow-reading rituals.',
    favoriteGenres: ['Mental Models', 'Ancient Wisdom', 'Speculative Thought', 'Personal Growth'],
    readingGoal2026: '30 kitap (25 tamamlandı)',
    readingGoal2026En: '30 books (25 completed)',
    currentlyReading: 'Suçlu Doğmak by Trevor Noah',
    currentlyReadingEn: 'Born a Crime by Trevor Noah',
    linkedinUrl: 'https://www.linkedin.com/in/eda-aydogan/',
    avatarUrl: '/members/edaaydogan.jpg',
    joinedYear: 'Founding Member (Nov 2025)',
    favoriteQuote: 'Desire is a contract you make with yourself to be unhappy until you get what you want. — Naval Ravikant',
    favoriteQuoteEn: 'Desire is a contract you make with yourself to be unhappy until you get what you want. — Naval Ravikant',
    books: [
      INITIAL_BOOKS[6], // The Almanack of Naval Ravikant (Curated by Eda)
      INITIAL_BOOKS[7], // Beşinci Anlaşma (Curated by Eda)
      ...EDA_EXTRA_BOOKS, // 5 Extra Books Read Since Nov 2025 (Ermiş, Ritüeller, Nefaset, Kızıl Veba, Gece Yarısı)
      INITIAL_BOOKS[0], // Suçlu Doğmak
      INITIAL_BOOKS[1], // İstanbul
      INITIAL_BOOKS[2], // Duvar
      INITIAL_BOOKS[3], // Venedik'te Ölüm
      INITIAL_BOOKS[4], // Zaman Sığınağı
      INITIAL_BOOKS[5], // Algı Kapıları
      INITIAL_BOOKS[8], // Designing Your Life
      INITIAL_BOOKS[9], // Vitrinde Yaşamak
    ]
  },

  // 3. Mert (Can Mert)
  {
    id: 'can-mert',
    name: 'Mert (Can Mert)',
    role: 'Yazılım Mühendisi & Biyografik Düşünür',
    roleEn: 'Software Engineer & Biographic Thinker',
    bio: 'Yazılım mühendisi ve full-stack geliştirici. Web ve mobil ekosistemler inşa ediyor; yaşam tasarımı, otobiyografik hafıza ve insanın direnç kapasitesi üzerine yazılan eserlerin tutkulu bir okuru. Kulübümüzün açılış kitabı olan ve şu an okuduğumuz Suçlu Doğmak’ı önerdi.',
    bioEn: 'Full-stack software engineer building web and mobile ecosystems. Passionate reader of life design, autobiographical memory, and human resilience. Recommended Born a Crime by Trevor Noah.',
    favoriteGenres: ['Autobiography', 'Design Thinking', 'Philosophy of Technology', 'Resilience'],
    readingGoal2026: '24 kitap (21 tamamlandı)',
    readingGoal2026En: '24 books (21 completed)',
    currentlyReading: 'Suçlu Doğmak by Trevor Noah',
    currentlyReadingEn: 'Born a Crime by Trevor Noah',
    linkedinUrl: 'https://www.linkedin.com/in/canmert/',
    avatarUrl: '/members/canmert.jpg',
    joinedYear: 'Founding Member (Nov 2025)',
    favoriteQuote: 'We build our way forward through thoughtful experiments.',
    favoriteQuoteEn: 'We build our way forward through thoughtful experiments.',
    books: [
      INITIAL_BOOKS[0], // Suçlu Doğmak (Curated by Mert - Currently Reading)
      INITIAL_BOOKS[8], // Designing Your Life (Curated by Mert)
      INITIAL_BOOKS[1], // İstanbul
      INITIAL_BOOKS[2], // Duvar
      INITIAL_BOOKS[3], // Venedik'te Ölüm
      INITIAL_BOOKS[4], // Zaman Sığınağı
      INITIAL_BOOKS[5], // Algı Kapıları
      INITIAL_BOOKS[6], // The Almanack of Naval Ravikant
      INITIAL_BOOKS[7], // Beşinci Anlaşma
      INITIAL_BOOKS[9], // Vitrinde Yaşamak
    ]
  },

  // 4. Ferhat Babacan
  {
    id: 'ferhat-babacan',
    name: 'Ferhat Babacan',
    role: 'Kurucu Ortak & Klasik Edebiyat Tutkunu',
    roleEn: 'Co-founder & Classicist',
    bio: 'Bluedot’ın kurucu ortağı ve CEO’su (Y Combinator destekli, Epic Charging tarafından satın alındı), Forbes 30 Under 30 listesinde yer aldı. Klasik edebiyat, varoluşçu kurgu ve estetik felsefe tutkunu.',
    bioEn: 'Co-founder and CEO of Bluedot (YC-backed, acquired by Epic Charging), Forbes 30 Under 30 alumnus. Passionate devotee of classical prose, existential modernism, and aesthetic philosophy.',
    favoriteGenres: ['Classic Fiction', 'Aesthetics & Existentialism', 'Modernist Novellas', 'Founders Prose'],
    readingGoal2026: '28 kitap (24 tamamlandı)',
    readingGoal2026En: '28 books (24 completed)',
    currentlyReading: 'Suçlu Doğmak by Trevor Noah',
    currentlyReadingEn: 'Born a Crime by Trevor Noah',
    linkedinUrl: 'https://www.linkedin.com/in/ferhatbabacan/',
    avatarUrl: '/members/ferhatbabacan.webp',
    joinedYear: 'Founding Member (Nov 2025)',
    favoriteQuote: 'Sanat, insanın içinde gizlenen sonsuz yalnızlığın en asil ifadesidir.',
    favoriteQuoteEn: 'Art is the most noble expression of the infinite solitude concealed within man.',
    books: [
      INITIAL_BOOKS[3], // Venedik'te Ölüm (Curated by Ferhat)
      INITIAL_BOOKS[0], // Suçlu Doğmak
      INITIAL_BOOKS[1], // İstanbul
      INITIAL_BOOKS[2], // Duvar
      INITIAL_BOOKS[4], // Zaman Sığınağı
      INITIAL_BOOKS[5], // Algı Kapıları
      INITIAL_BOOKS[6], // The Almanack of Naval Ravikant
      INITIAL_BOOKS[7], // Beşinci Anlaşma
      INITIAL_BOOKS[8], // Designing Your Life
      INITIAL_BOOKS[9], // Vitrinde Yaşamak
    ]
  },

  // 5. Gizem Yeniçıkan
  {
    id: 'gizem-yenicikan',
    name: 'Gizem Yeniçıkan',
    role: 'Kıdemli Danışman & Distopya Araştırmacısı',
    roleEn: 'Senior Consultant & Dystopia Explorer',
    bio: 'Mercedes-Benz Otomotiv bünyesinde Senior Business Consultant olarak inovasyon ve dijital dönüşüm süreçlerine liderlik ediyor. Yıldız Teknik Üniversitesi mezunu, yoga uygulayıcısı ve kadınların teknolojideki gücünü savunan bir konuşmacı. İzolasyon ve distopik edebiyat tutkunu.',
    bioEn: 'Senior Business Consultant leading digital transformation and mobility innovations at Mercedes-Benz. Yoga practitioner and advocate for women in leadership. Avid reader of speculative isolation and dystopian philosophy.',
    favoriteGenres: ['Dystopian Fiction', 'Memory & Trauma', 'Speculative Thought', 'Ecological Solitude'],
    readingGoal2026: '26 kitap (22 tamamlandı)',
    readingGoal2026En: '26 books (22 completed)',
    currentlyReading: 'Suçlu Doğmak by Trevor Noah',
    currentlyReadingEn: 'Born a Crime by Trevor Noah',
    linkedinUrl: 'https://www.linkedin.com/in/gizemyenicikan/',
    avatarUrl: '/members/gizemyenicikan.jpg',
    joinedYear: 'Founding Member (Nov 2025)',
    favoriteQuote: 'Zaman en büyük sığınaktır; duvarlar ise yalnızca sınırları çizmeye yarar.',
    favoriteQuoteEn: 'Time is the greatest shelter; walls merely serve to draw temporary borders.',
    books: [
      INITIAL_BOOKS[2], // Duvar (Curated by Gizem)
      INITIAL_BOOKS[4], // Zaman Sığınağı (Curated by Gizem)
      INITIAL_BOOKS[0], // Suçlu Doğmak
      INITIAL_BOOKS[1], // İstanbul
      INITIAL_BOOKS[3], // Venedik'te Ölüm
      INITIAL_BOOKS[5], // Algı Kapıları
      INITIAL_BOOKS[6], // The Almanack of Naval Ravikant
      INITIAL_BOOKS[7], // Beşinci Anlaşma
      INITIAL_BOOKS[8], // Designing Your Life
      INITIAL_BOOKS[9], // Vitrinde Yaşamak
    ]
  },

  // 6. Gökçe Nur Uysal
  {
    id: 'gokce-uysal',
    name: 'Gökçe Nur Uysal',
    role: 'Sürdürülebilirlik Uzmanı & Kent Anlatıcısı',
    roleEn: 'Sustainability Specialist & Urban Narrator',
    bio: 'Çevre mühendisi ve sürdürülebilirlik uzmanı (King’s College London M.Sc.). Çevresel Sürdürülebilirlik Podcast sunucusu ve IAF Türkiye ATTI Lideri. Ekoloji, döngüsel ekonomi, kentsel bellek ve edebiyatta mekan anlatılarına derin bir ilgi duyuyor.',
    bioEn: 'Environmental engineer and sustainability specialist (M.Sc. from King’s College London). Host of Environmental Sustainability Podcast. Exploring ecology, circular systems, urban memory, and architectural poetics.',
    favoriteGenres: ['Urban Geography', 'Ecological Literature', 'Memoir & City', 'Environmental Philosophy'],
    readingGoal2026: '24 kitap (20 tamamlandı)',
    readingGoal2026En: '24 books (20 completed)',
    currentlyReading: 'Suçlu Doğmak by Trevor Noah',
    currentlyReadingEn: 'Born a Crime by Trevor Noah',
    linkedinUrl: 'https://www.linkedin.com/in/gokcenuruysal/',
    avatarUrl: '/members/gokcenuruysal.jpg',
    joinedYear: 'Founding Member (Nov 2025)',
    favoriteQuote: 'Bir şehri sevmek, onun hüznünü kendi kaderin olarak kabul etmektir.',
    favoriteQuoteEn: 'To love a city is to embrace its melancholy as your own fate.',
    books: [
      INITIAL_BOOKS[1], // İstanbul: Hatıralar ve Şehir (Curated by Gökçe)
      INITIAL_BOOKS[0], // Suçlu Doğmak
      INITIAL_BOOKS[2], // Duvar
      INITIAL_BOOKS[3], // Venedik'te Ölüm
      INITIAL_BOOKS[4], // Zaman Sığınağı
      INITIAL_BOOKS[5], // Algı Kapıları
      INITIAL_BOOKS[6], // The Almanack of Naval Ravikant
      INITIAL_BOOKS[7], // Beşinci Anlaşma
      INITIAL_BOOKS[8], // Designing Your Life
      INITIAL_BOOKS[9], // Vitrinde Yaşamak
    ]
  }
];

export const INITIAL_RSVPS: SalonRSVP[] = [];
export const INITIAL_REFERRALS: ReferralApplication[] = [];

export const INITIAL_SITE_CONTENT: SiteContent = {
  brandName: 'Books & Friends',
  tagline: 'Private Book Club',
  heroCities: 'İSTANBUL · DUBAİ · NYC · SAN FRANCISCO · KASIM 2025',
  heroCitiesEn: 'ISTANBUL · DUBAI · NYC · SAN FRANCISCO · EST. NOV 2025',
  heroLine1: 'Altı okur.',
  heroLine1En: 'Six readers.',
  heroAccent: 'Ayda bir',
  heroAccentEn: 'One book',
  heroLine2: 'kitap.',
  heroLine2En: 'a month.',
  heroSubtitle: 'Her ay birlikte tek bir kitap okuyan, hız yerine derinliği seçen küçük bir arkadaş çevresiyiz.',
  heroSubtitleEn: 'We are a small circle of friends who read one book every month together, prioritizing depth over velocity.',
  clubStartDate: 'Kasım 2025',
  statBooksCount: '10',
  statBooksLabel: 'birlikte okunan kitap',
  statBooksLabelEn: 'books read together',
  statPagesCount: '2.884',
  statPagesCountEn: '2,884',
  statPagesLabel: 'çevrilen sayfa',
  statPagesLabelEn: 'pages turned',
  statMembersCount: '6',
  statMembersLabel: 'üye',
  statMembersLabelEn: 'members',
  announcement: 'Kitap kulübümüz Kasım 2025’te başladı · Şu an okunan kitap: Trevor Noah: Suçlu Doğmak',
  announcementEn: 'Start date of the book club is November 2025 · Currently reading Trevor Noah: Born a Crime',
  showAnnouncement: false,
};

// LANGUAGE-AWARE ACCESSOR FUNCTIONS
export const GENRE_MAP_EN: Record<string, string> = {
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
};

export const GENRE_MAP_TR: Record<string, string> = {
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
};

export const getBookTitle = (book: Book | null | undefined, lang: Language): string => {
  if (!book) return '';
  if (lang === 'en') {
    return book.titleEn || book.title || book.originalTitle || '';
  }
  return book.title || book.titleEn || '';
};

export const getBookCover = (book: Book | null | undefined, lang: Language): string => {
  if (!book) return '';
  if (lang === 'en') {
    return book.coverImageUrlEn || book.coverImageUrl || '';
  }
  return book.coverImageUrlTr || book.coverImageUrl || '';
};

export const getBookSynopsis = (book: Book | null | undefined, lang: Language): string => {
  if (!book) return '';
  if (lang === 'en') {
    return book.synopsisEn || book.synopsis || '';
  }
  return book.synopsis || book.synopsisEn || '';
};

export const getBookQuote = (book: Book | null | undefined, lang: Language): string => {
  if (!book) return '';
  if (lang === 'en') {
    return book.favoriteQuoteEn || book.favoriteQuote || '';
  }
  return book.favoriteQuote || book.favoriteQuoteEn || '';
};

export const getBookGenre = (book: Book | null | undefined, lang: Language): string => {
  if (!book) return '';
  if (lang === 'en') {
    if (book.genreEn) return book.genreEn;
    if (book.genre && GENRE_MAP_EN[book.genre]) return GENRE_MAP_EN[book.genre];
    return book.genre || '';
  }
  if (book.genre) {
    if (GENRE_MAP_TR[book.genre]) return GENRE_MAP_TR[book.genre];
    return book.genre;
  }
  if (book.genreEn && GENRE_MAP_TR[book.genreEn]) return GENRE_MAP_TR[book.genreEn];
  return book.genre || book.genreEn || '';
};

export const getBookMonth = (book: Book | null | undefined, lang: Language): string => {
  if (!book) return '';
  if (lang === 'en') {
    return book.monthEn || book.month || '';
  }
  return book.monthTr || book.month || '';
};

export const getMemberRole = (member: Member | null | undefined, lang: Language): string => {
  if (!member) return '';
  if (lang === 'en') {
    if (member.roleEn && !hasTurkishChars(member.roleEn)) return member.roleEn;
    const translated = translateTextSync(member.roleEn || member.role || '', 'tr', 'en');
    return translated || member.roleEn || member.role || '';
  }
  // Turkish mode
  if (member.role && !looksLikeEnglish(member.role)) return member.role;
  const translated = translateTextSync(member.role || member.roleEn || '', 'en', 'tr');
  return translated || member.role || member.roleEn || '';
};

export const getMemberBio = (member: Member | null | undefined, lang: Language): string => {
  if (!member) return '';
  if (lang === 'en') {
    if (member.bioEn && !hasTurkishChars(member.bioEn)) return member.bioEn;
    const translated = translateTextSync(member.bioEn || member.bio || '', 'tr', 'en');
    return translated || member.bioEn || member.bio || '';
  }
  // Turkish mode
  if (member.bio && !looksLikeEnglish(member.bio)) return member.bio;
  const translated = translateTextSync(member.bio || member.bioEn || '', 'en', 'tr');
  return translated || member.bio || member.bioEn || '';
};

export const getMemberQuote = (member: Member | null | undefined, lang: Language): string => {
  if (!member) return '';
  if (lang === 'en') {
    if (member.favoriteQuoteEn && !hasTurkishChars(member.favoriteQuoteEn)) return member.favoriteQuoteEn;
    const translated = translateTextSync(member.favoriteQuoteEn || member.favoriteQuote || '', 'tr', 'en');
    return translated || member.favoriteQuoteEn || member.favoriteQuote || '';
  }
  // Turkish mode
  if (member.favoriteQuote && !looksLikeEnglish(member.favoriteQuote)) return member.favoriteQuote;
  const translated = translateTextSync(member.favoriteQuote || member.favoriteQuoteEn || '', 'en', 'tr');
  return translated || member.favoriteQuote || member.favoriteQuoteEn || '';
};

export const getMemberGoal = (member: Member | null | undefined, lang: Language): string => {
  if (!member) return '';
  if (lang === 'en') {
    if (member.readingGoal2026En && !hasTurkishChars(member.readingGoal2026En)) return member.readingGoal2026En;
    return translateTextSync(member.readingGoal2026En || member.readingGoal2026 || '', 'tr', 'en');
  }
  // Turkish mode
  if (member.readingGoal2026 && !looksLikeEnglish(member.readingGoal2026)) return member.readingGoal2026;
  return translateTextSync(member.readingGoal2026 || member.readingGoal2026En || '', 'en', 'tr');
};

export const getMemberCurrentlyReading = (member: Member | null | undefined, lang: Language): string => {
  if (!member) return '';
  if (lang === 'en') {
    if (member.currentlyReadingEn) return member.currentlyReadingEn;
    return member.currentlyReading || '';
  }
  return member.currentlyReading || member.currentlyReadingEn || '';
};

export const getCommentText = (comment: { text: string; textEn?: string } | null | undefined, lang: Language): string => {
  if (!comment) return '';
  if (lang === 'en') {
    return comment.textEn || comment.text || '';
  }
  return comment.text || comment.textEn || '';
};

export const getCommentQuote = (comment: { favoriteQuote?: string; favoriteQuoteEn?: string } | null | undefined, lang: Language): string | undefined => {
  if (!comment) return undefined;
  if (lang === 'en') {
    return comment.favoriteQuoteEn || comment.favoriteQuote;
  }
  return comment.favoriteQuote || comment.favoriteQuoteEn;
};

export const getVideoTitle = (video: { title: string; titleEn?: string } | undefined, defaultBookTitle: string, lang: Language): string => {
  if (!video) return lang === 'en' ? defaultBookTitle + ' — Video Reflection' : defaultBookTitle + ' — Video İncelemesi';
  if (lang === 'en') {
    return video.titleEn || video.title;
  }
  return video.title;
};

export const getVideoNotes = (video: { notes?: string; notesEn?: string } | undefined, lang: Language): string => {
  if (!video) return '';
  if (lang === 'en') {
    return video.notesEn || video.notes || '';
  }
  return video.notes || '';
};

export const getBookBinding = (binding: string | undefined, lang: Language): string => {
  if (!binding) return '';
  if (lang === 'tr') {
    if (binding === 'Paperback') return 'Karton Kapak';
    if (binding === 'Hardcover') return 'Ciltli';
    if (binding === 'Linen Bound') return 'Keten Cilt';
    if (binding === 'Collector Edition') return 'Özel Koleksiyon Baskısı';
  }
  return binding;
};

export const normalizeBook = (book: Partial<Book> & { id: string }): Book => {
  const initialMatch = INITIAL_BOOKS.find(ib => ib.id === book.id) || EDA_EXTRA_BOOKS.find(eb => eb.id === book.id);
  const base: Book = initialMatch ? { ...initialMatch } : {
    id: book.id,
    title: book.title || 'Untitled',
    author: book.author || 'Unknown',
    year: 2025,
    pages: 300,
    genre: 'Edebi Kurgu',
    genreEn: 'Literary Fiction',
    synopsis: '',
    synopsisEn: '',
    suggesterId: 'eda-aydogan',
    suggesterName: 'Eda Aydoğan',
    month: 'Ekim 2026',
    monthEn: 'October 2026',
    monthTr: 'Ekim 2026',
    coverColor: '#2C3E50',
    accentColor: '#E67E22',
    spineTextColor: '#FFFFFF',
    rating: 5,
    themes: ['Literature'],
    comments: [],
    buyLinks: {
      tr: { store: 'Amazon TR', url: `https://www.amazon.com.tr/s?k=${encodeURIComponent(book.title || '')}&tag=${AFFILIATE_TAG_TR}`, language: 'TR' as const, affiliateTag: AFFILIATE_TAG_TR },
      en: { store: 'Amazon', url: `https://www.amazon.com/s?k=${encodeURIComponent(book.titleEn || book.title || '')}&tag=${AFFILIATE_TAG_EN}`, language: 'EN' as const, affiliateTag: AFFILIATE_TAG_EN },
    },
    physicalDetails: {
      binding: 'Paperback' as const,
      thicknessMm: 22,
      format: '13.5 × 21 cm',
    },
  };

  return {
    ...base,
    ...book,
    title: book.title || base.title,
    titleEn: book.titleEn || base.titleEn,
    genre: book.genre || base.genre,
    genreEn: book.genreEn || base.genreEn,
    synopsis: book.synopsis || base.synopsis,
    synopsisEn: book.synopsisEn || base.synopsisEn,
    favoriteQuote: book.favoriteQuote !== undefined ? book.favoriteQuote : base.favoriteQuote,
    favoriteQuoteEn: book.favoriteQuoteEn !== undefined ? book.favoriteQuoteEn : base.favoriteQuoteEn,
    coverImageUrl: book.coverImageUrl !== undefined ? book.coverImageUrl : base.coverImageUrl,
    coverImageUrlTr: book.coverImageUrlTr || base.coverImageUrlTr,
    coverImageUrlEn: book.coverImageUrlEn || base.coverImageUrlEn,
    monthEn: book.monthEn || base.monthEn,
    monthTr: book.monthTr || base.monthTr,
    videoReview: book.videoReview !== undefined ? book.videoReview : base.videoReview,
    comments: (book.comments && book.comments.length > 0) ? book.comments : (base.comments || []),
    buyLinks: {
      tr: book.buyLinks?.tr || base.buyLinks?.tr || { store: 'Amazon TR', url: '#', language: 'TR' as const, affiliateTag: AFFILIATE_TAG_TR },
      en: book.buyLinks?.en || base.buyLinks?.en || { store: 'Amazon', url: '#', language: 'EN' as const, affiliateTag: AFFILIATE_TAG_EN },
    },
    physicalDetails: {
      binding: book.physicalDetails?.binding || base.physicalDetails?.binding || 'Paperback',
      thicknessMm: book.physicalDetails?.thicknessMm || base.physicalDetails?.thicknessMm || 22,
      format: book.physicalDetails?.format || base.physicalDetails?.format || '13.5 × 21 cm',
    },
  };
};

export const normalizeBooks = (bookList: Book[]): Book[] => {
  if (!Array.isArray(bookList) || bookList.length === 0) return INITIAL_BOOKS;
  return bookList.map(b => normalizeBook(b));
};
