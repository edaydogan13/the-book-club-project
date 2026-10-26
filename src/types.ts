export interface AffiliateLink {
  store: string;
  url: string;
  language: 'TR' | 'EN';
  price?: string;
  affiliateTag: string;
  badge?: string;
}

export interface VideoReview {
  id: string;
  title: string;
  titleEn?: string;
  speaker: string;
  duration?: string;
  videoUrl?: string; // HTML5 video or uploaded object URL
  notes?: string;
  notesEn?: string;
  recordedDate: string;
  recordedDateEn?: string;
}

export interface BookComment {
  id: string;
  authorName: string;
  memberId?: string;
  text: string;
  textEn?: string;
  rating: number;
  favoriteQuote?: string;
  favoriteQuoteEn?: string;
  timestamp: string;
}

export interface Book {
  id: string;
  title: string;
  titleEn?: string;
  originalTitle?: string;
  author: string;
  year: number;
  pages: number;
  genre: string;
  genreEn?: string;
  synopsis: string;
  synopsisEn?: string;
  favoriteQuote?: string;
  favoriteQuoteEn?: string;
  suggesterId: string;
  suggesterName: string;
  month: string; // e.g., "October 2026"
  monthEn?: string;
  monthTr?: string;
  isBookOfMonth?: boolean;
  isPersonalExtra?: boolean;
  personalReadDate?: string;
  coverColor: string; // Primary aesthetic color code
  accentColor: string;
  spineTextColor: string;
  coverPattern?: 'minimal' | 'geometric' | 'typographic' | 'stripes' | 'arch';
  coverImageUrl?: string; // Default book cover
  coverImageUrlTr?: string; // Authentic Turkish edition cover
  coverImageUrlEn?: string; // Authentic English publisher edition cover
  rating: number; // 1-5
  buyLinks: {
    tr: AffiliateLink;
    en: AffiliateLink;
  };
  videoReview?: VideoReview;
  comments: BookComment[];
  themes: string[];
  themesEn?: string[];
  physicalDetails: {
    binding: 'Hardcover' | 'Paperback' | 'Linen Bound' | 'Collector Edition';
    thicknessMm: number; // For tactile spine width
    format: string;
  };
}

export interface Member {
  id: string;
  name: string;
  role: string;
  roleEn?: string;
  bio: string;
  bioEn?: string;
  favoriteGenres: string[];
  readingGoal2026: string;
  readingGoal2026En?: string;
  currentlyReading: string;
  currentlyReadingEn?: string;
  linkedinUrl: string;
  avatarUrl: string;
  joinedYear: string;
  favoriteQuote: string;
  favoriteQuoteEn?: string;
  books: Book[];
}

export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'member';
  memberId?: string;
  displayName: string;
  avatarUrl?: string;
}

export interface UserCredential {
  username: string;
  password: string;
  role: 'admin' | 'member';
  memberId?: string;
  displayName: string;
  avatarUrl?: string;
}

export interface ReferralApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  referringMemberId: string;
  referringMemberName: string;
  reason: string;
  favoriteBook: string;
  status: 'pending' | 'approved' | 'declined';
  submittedAt: string;
}

export interface SalonRSVP {
  id: string;
  name: string;
  email: string;
  attendanceType: 'in-person' | 'online';
  note?: string;
  timestamp: string;
}

export interface SiteContent {
  brandName: string;
  tagline: string;
  heroCities: string;
  heroLine1: string;
  heroAccent: string;
  heroLine2: string;
  heroSubtitle: string;
  clubStartDate: string;
  statBooksCount: string;
  statBooksLabel: string;
  statPagesCount: string;
  statPagesLabel: string;
  statMembersCount: string;
  statMembersLabel: string;
  announcement?: string;
  showAnnouncement?: boolean;
}

