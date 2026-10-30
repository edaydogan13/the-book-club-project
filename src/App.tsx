import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book, Member, BookComment, VideoReview, ReferralApplication, SiteContent, AuthUser } from './types';
import { 
  INITIAL_BOOKS, 
  INITIAL_MEMBERS, 
  INITIAL_REFERRALS, 
  INITIAL_SITE_CONTENT,
  EDA_EXTRA_BOOKS,
  getBookTitle,
  normalizeBooks
} from './data/initialData';
import { Language, TRANSLATIONS } from './translations';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TactileBookshelf } from './components/TactileBookshelf';
import { BookOfTheMonthSection } from './components/BookOfTheMonthSection';
import { BookDetailModal } from './components/BookDetailModal';
import { MemberProfilePage } from './components/MemberProfilePage';
import { ReferralModal } from './components/ReferralModal';
import { AuthModal } from './components/AuthModal';
import { EditSiteContentModal } from './components/EditSiteContentModal';
import { BookEditModal } from './components/BookEditModal';
import { MemberEditModal } from './components/MemberEditModal';
import { AdminFloatingBar } from './components/AdminFloatingBar';
import { Edit3, Plus, Sparkles, CloudCheck, RefreshCw, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { 
  fetchClubData, 
  saveClubData,
  saveBookApi, 
  deleteBookApi, 
  saveMemberApi, 
  saveSiteContentApi, 
  addCommentApi, 
  updateVideoApi,
  addReferralApi,
  updateReferralStatusApi
} from './utils/api';
import { safeStorage } from './utils/safeStorage';

export default function App() {
  // Navigation View: 'home' | 'members' | 'book-of-month'
  const [currentView, setCurrentView] = useState<'home' | 'members' | 'book-of-month'>('home');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('eda-aydogan');
  const [language, setLanguage] = useState<Language>('en');

  // Interactive Modals
  const [activeBookModal, setActiveBookModal] = useState<Book | null>(null);
  const [activeBookShelfMemberId, setActiveBookShelfMemberId] = useState<string | null>(null);
  const [modalInitialVideoUpload, setModalInitialVideoUpload] = useState<boolean>(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const handleOpenBookModal = (book: Book, openVideoUpload?: boolean, fromMemberId?: string) => {
    setActiveBookModal(book);
    setModalInitialVideoUpload(Boolean(openVideoUpload));
    setActiveBookShelfMemberId(fromMemberId || null);
  };

  // Admin In-Place Editing Modals
  const [isSiteContentModalOpen, setIsSiteContentModalOpen] = useState<boolean>(false);
  const [isBookEditModalOpen, setIsBookEditModalOpen] = useState<boolean>(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [isMemberEditModalOpen, setIsMemberEditModalOpen] = useState<boolean>(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  // User Authentication & Session (Admin or Member like Gizem123 / Eda123 / etc.)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = safeStorage.getItem('books_and_friends_session_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing session user', e);
      }
    }
    const legacyAdmin = safeStorage.getItem('books_and_friends_admin_mode') === 'true';
    if (legacyAdmin) {
      return {
        id: 'admin',
        username: 'admin',
        role: 'admin',
        displayName: 'Admin (Eda Aydoğan)',
        avatarUrl: '/members/edaaydogan.jpg',
      };
    }
    return null;
  });

  const isAdmin = currentUser?.role === 'admin';

  // Persistent State with localStorage fallback and bilingual fields synchronization
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = safeStorage.getItem('books_and_friends_books_v9');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeBooks(parsed);
        }
      } catch (e) {
        console.error('Error parsing books v9', e);
      }
    }
    // Migrate previous books by merging new English fields, local verified covers, and comments from INITIAL_BOOKS
    const prevSaved = safeStorage.getItem('books_and_friends_books_v8') || safeStorage.getItem('books_and_friends_books_v5');
    if (prevSaved) {
      try {
        const parsed = JSON.parse(prevSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return normalizeBooks(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return normalizeBooks(INITIAL_BOOKS);
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const mergeMembersWithInitial = (memberList: Member[]) => {
      return memberList.map((m: Member) => {
        const initialMatch = INITIAL_MEMBERS.find(im => im.id === m.id);
        if (initialMatch) {
          return {
            ...initialMatch,
            ...m,
            role: m.role || initialMatch.role,
            roleEn: m.roleEn || initialMatch.roleEn,
            bio: m.bio || initialMatch.bio,
            bioEn: m.bioEn || initialMatch.bioEn,
            favoriteQuote: m.favoriteQuote || initialMatch.favoriteQuote,
            favoriteQuoteEn: m.favoriteQuoteEn || initialMatch.favoriteQuoteEn,
            readingGoal2026: m.readingGoal2026 || initialMatch.readingGoal2026,
            readingGoal2026En: m.readingGoal2026En || initialMatch.readingGoal2026En,
            currentlyReading: m.currentlyReading || initialMatch.currentlyReading,
            currentlyReadingEn: m.currentlyReadingEn || initialMatch.currentlyReadingEn,
            avatarUrl: m.id === 'cemre-sirin' && (!m.avatarUrl || m.avatarUrl === '/members/cemresirin.jpg') 
              ? '/members/cemresirin.webp?v=2' 
              : (m.avatarUrl || initialMatch.avatarUrl),
            books: (m.books && m.books.length > 0) ? m.books : initialMatch.books
          };
        }
        return m;
      });
    };

    const saved = safeStorage.getItem('books_and_friends_members_v8');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeMembersWithInitial(parsed);
        }
      } catch (e) {
        console.error('Error parsing members v8', e);
      }
    }
    const prevSaved = safeStorage.getItem('books_and_friends_members_v7') || safeStorage.getItem('books_and_friends_members_v6');
    if (prevSaved) {
      try {
        const parsed = JSON.parse(prevSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeMembersWithInitial(parsed);
        }
      } catch (e) {
        console.error('Error parsing members from storage', e);
      }
    }
    return INITIAL_MEMBERS;
  });

  const [referrals, setReferrals] = useState<ReferralApplication[]>(() => {
    const saved = safeStorage.getItem('books_and_friends_referrals_v5');
    return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
  });

  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    const saved = safeStorage.getItem('books_and_friends_site_content_v5');
    return saved ? JSON.parse(saved) : INITIAL_SITE_CONTENT;
  });

  // Save to localStorage on changes
  useEffect(() => {
    if (currentUser) {
      safeStorage.setItem('books_and_friends_session_user', JSON.stringify(currentUser));
      safeStorage.setItem('books_and_friends_admin_mode', currentUser.role === 'admin' ? 'true' : 'false');
    } else {
      safeStorage.removeItem('books_and_friends_session_user');
      safeStorage.setItem('books_and_friends_admin_mode', 'false');
    }
  }, [currentUser]);

  // Cloud Synchronization & Ephemeral Toast State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const toastTimeoutRef = useRef<any>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    const id = Date.now();
    setToast({ id, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => (prev?.id === id ? null : prev));
    }, 3500);
  }, []);

  // Guard against overwriting state during active modal editing or in-flight mutations
  const isMutatingRef = useRef(false);
  const lastServerTimestampRef = useRef<string | null>(null);
  const isAnyEditModalOpen = isBookEditModalOpen || isMemberEditModalOpen || isSiteContentModalOpen;

  // Shared Backend Store Synchronization
  const syncWithBackend = useCallback(async (force = false) => {
    // If a mutation is currently in-flight, avoid racing with server response
    if (isMutatingRef.current && !force) return;

    // If an edit modal is actively open, prevent background ticks from resetting form fields
    if (isAnyEditModalOpen && !force) return;

    try {
      const serverData = await fetchClubData();
      if (!serverData) return;

      // If timestamp matches our current synchronized checkpoint and not forced, skip redundant re-renders
      if (serverData.lastUpdated && serverData.lastUpdated === lastServerTimestampRef.current && !force) {
        return;
      }

      if (Array.isArray(serverData.books) && serverData.books.length > 0) {
        setBooks(normalizeBooks(serverData.books));
      }
      if (Array.isArray(serverData.members) && serverData.members.length > 0) {
        setMembers(serverData.members);
      }
      if (serverData.siteContent && serverData.siteContent.brandName) {
        setSiteContent(serverData.siteContent);
      }
      if (Array.isArray(serverData.referrals)) {
        setReferrals(serverData.referrals);
      }
      if (serverData.lastUpdated) {
        lastServerTimestampRef.current = serverData.lastUpdated;
      }
      setSyncStatus('synced');
    } catch (err) {
      console.warn('Sync with backend failed:', err);
      setSyncStatus('error');
    }
  }, [isAnyEditModalOpen]);

  // Multi-session listener: Moderate 10s polling, window focus, visibility change, and BroadcastChannel
  useEffect(() => {
    // Initial fetch on mount
    syncWithBackend(true);

    // Re-sync on window focus (switching tabs/apps)
    const handleFocus = () => {
      syncWithBackend(false);
    };
    window.addEventListener('focus', handleFocus);

    // Re-sync on document visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWithBackend(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Moderate polling every 10 seconds per user choice
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncWithBackend(false);
      }
    }, 10000);

    // Cross-tab instantaneous synchronization via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('the-six-sync');
        channel.onmessage = () => {
          syncWithBackend(true);
        };
      } catch {
        // BroadcastChannel unavailable
      }
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
      if (channel) {
        try {
          channel.close();
        } catch {}
      }
    };
  }, [syncWithBackend]);

  useEffect(() => {
    safeStorage.setItem('books_and_friends_books_v9', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    safeStorage.setItem('books_and_friends_members_v8', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    safeStorage.setItem('books_and_friends_referrals_v5', JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    safeStorage.setItem('books_and_friends_site_content_v5', JSON.stringify(siteContent));
  }, [siteContent]);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'member' && user.memberId) {
      setSelectedMemberId(user.memberId);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Current Book of the Month
  const currentBookOfMonth = books.find(b => b.isBookOfMonth) || books[0];
  const t = TRANSLATIONS[language];

  // Handler: Add Comment to a Book (Awaited with optimistic update and rollback)
  const handleAddComment = async (bookId: string, commentData: Omit<BookComment, 'id' | 'timestamp'>) => {
    const prevBooks = books;
    isMutatingRef.current = true;
    setSyncStatus('syncing');

    const newComment: BookComment = {
      ...commentData,
      id: `comment-${Date.now()}`,
      timestamp: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    // Optimistic local update
    setBooks(prev =>
      prev.map(b => b.id === bookId ? { ...b, comments: [newComment, ...(b.comments || [])] } : b)
    );
    setActiveBookModal(prev =>
      prev && prev.id === bookId ? { ...prev, comments: [newComment, ...(prev.comments || [])] } : prev
    );

    try {
      const res = await addCommentApi(bookId, newComment);
      if (res.success) {
        if (Array.isArray(res.books)) {
          setBooks(res.books);
          const updatedActive = res.books.find(b => b.id === bookId);
          if (updatedActive) setActiveBookModal(updatedActive);
        }
        if (res.lastUpdated) lastServerTimestampRef.current = res.lastUpdated;
        setSyncStatus('synced');
        showToast(language === 'en' ? 'Reflection shared & synced' : 'Düşünceniz paylaşıldı ve eşitlendi', 'success');
      } else {
        setBooks(prevBooks);
        setSyncStatus('error');
        showToast(language === 'en' ? 'Failed to save comment to server' : 'Yorum sunucuya kaydedilemedi', 'error');
      }
    } catch {
      setBooks(prevBooks);
      setSyncStatus('error');
      showToast(language === 'en' ? 'Connection error saving comment' : 'Yorum kaydedilirken bağlantı hatası oluştu', 'error');
    } finally {
      isMutatingRef.current = false;
    }
  };

  // Handler: Update Video Review for a Book (Awaited with optimistic update and rollback)
  const handleUpdateVideo = async (bookId: string, video: VideoReview) => {
    const prevBooks = books;
    isMutatingRef.current = true;
    setSyncStatus('syncing');

    setBooks(prev =>
      prev.map(b => b.id === bookId ? { ...b, videoReview: video } : b)
    );
    setActiveBookModal(prev =>
      prev && prev.id === bookId ? { ...prev, videoReview: video } : prev
    );

    try {
      const res = await updateVideoApi(bookId, video);
      if (res.success) {
        if (Array.isArray(res.books)) {
          setBooks(res.books);
          const updatedActive = res.books.find(b => b.id === bookId);
          if (updatedActive) setActiveBookModal(updatedActive);
        }
        if (res.lastUpdated) lastServerTimestampRef.current = res.lastUpdated;
        setSyncStatus('synced');
        showToast(language === 'en' ? 'Video salon reflection updated' : 'Video incelemesi güncellendi', 'success');
      } else {
        setBooks(prevBooks);
        setSyncStatus('error');
        showToast(language === 'en' ? 'Failed to save video to cloud' : 'Video buluta kaydedilemedi', 'error');
      }
    } catch {
      setBooks(prevBooks);
      setSyncStatus('error');
      showToast(language === 'en' ? 'Network error updating video' : 'Video kaydedilirken ağ hatası', 'error');
    } finally {
      isMutatingRef.current = false;
    }
  };

  // Handler: Submit Newsletter & Referral Application (Awaited with backend persistence)
  const handleSubmitReferral = async (appData: Omit<ReferralApplication, 'id' | 'status' | 'submittedAt'>) => {
    const prevReferrals = referrals;
    isMutatingRef.current = true;
    setSyncStatus('syncing');

    const newApp: ReferralApplication = {
      ...appData,
      id: `ref-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setReferrals(prev => [newApp, ...prev]);

    try {
      const res = await addReferralApi(newApp);
      if (res.success) {
        if (Array.isArray(res.referrals)) setReferrals(res.referrals);
        if (res.lastUpdated) lastServerTimestampRef.current = res.lastUpdated;
        setSyncStatus('synced');
        showToast(language === 'en' ? 'Application submitted & synced' : 'Başvuru başarıyla iletildi ve eşitlendi', 'success');
      } else {
        setReferrals(prevReferrals);
        setSyncStatus('error');
        showToast(language === 'en' ? 'Failed to submit application' : 'Başvuru kaydedilemedi', 'error');
      }
    } catch {
      setReferrals(prevReferrals);
      setSyncStatus('error');
      showToast(language === 'en' ? 'Network error submitting application' : 'Başvuru iletilirken hata', 'error');
    } finally {
      isMutatingRef.current = false;
    }
  };

  // Handler: Update Referral Status
  const handleUpdateReferralStatus = async (id: string, status: 'approved' | 'declined') => {
    const prevReferrals = referrals;
    isMutatingRef.current = true;
    setSyncStatus('syncing');

    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r));

    try {
      const res = await updateReferralStatusApi(id, status);
      if (res.success) {
        if (Array.isArray(res.referrals)) setReferrals(res.referrals);
        if (res.lastUpdated) lastServerTimestampRef.current = res.lastUpdated;
        setSyncStatus('synced');
        showToast(language === 'en' ? `Application ${status}` : `Başvuru ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`, 'success');
      } else {
        setReferrals(prevReferrals);
        setSyncStatus('error');
      }
    } catch {
      setReferrals(prevReferrals);
      setSyncStatus('error');
    } finally {
      isMutatingRef.current = false;
    }
  };

  // Handler: Update Member Profile (Awaited with optimistic update and rollback)
  const handleUpdateMember = async (updatedMember: Member) => {
    const prevMembers = members;
    isMutatingRef.current = true;
    setSyncStatus('syncing');

    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));

    try {
      const res = await saveMemberApi(updatedMember);
      if (res.success) {
        if (Array.isArray(res.members)) setMembers(res.members);
        if (res.lastUpdated) lastServerTimestampRef.current = res.lastUpdated;
        setSyncStatus('synced');
        showToast(language === 'en' ? 'Member profile updated & synced' : 'Üye profili güncellendi ve eşitlendi', 'success');
      } else {
        setMembers(prevMembers);
        setSyncStatus('error');
        showToast(language === 'en' ? 'Failed to update member profile' : 'Üye profili kaydedilemedi', 'error');
      }
    } catch {
      setMembers(prevMembers);
      setSyncStatus('error');
      showToast(language === 'en' ? 'Network error saving member profile' : 'Üye profili kaydedilirken ağ hatası', 'error');
    } finally {
      isMutatingRef.current = false;
    }
  };

  // Handler: Site Content update (Awaited with optimistic update and rollback)
  const handleSaveSiteContent = async (updated: SiteContent) => {
    const prevSiteContent = siteContent;
    isMutatingRef.current = true;
    setSyncStatus('syncing');

    setSiteContent(updated);

    try {
      const res = await saveSiteContentApi(updated);
      if (res.success) {
        if (res.siteContent) setSiteContent(res.siteContent);
        if (res.lastUpdated) lastServerTimestampRef.current = res.lastUpdated;
        setSyncStatus('synced');
        showToast(language === 'en' ? 'Site content saved & published' : 'Site metinleri kaydedildi ve yayınlandı', 'success');
      } else {
        setSiteContent(prevSiteContent);
        setSyncStatus('error');
        showToast(language === 'en' ? 'Failed to save site content' : 'Site içeriği kaydedilemedi', 'error');
      }
    } catch {
      setSiteContent(prevSiteContent);
      setSyncStatus('error');
      showToast(language === 'en' ? 'Network error saving site content' : 'Ağ hatası oluştu', 'error');
    } finally {
      isMutatingRef.current = false;
    }
  };

  // Handler: Book administration (Awaited with optimistic update and rollback)
  const handleOpenAddBook = () => {
    setBookToEdit(null);
    setIsBookEditModalOpen(true);
  };

  const handleOpenEditBook = (book: Book) => {
    setBookToEdit(book);
    setIsBookEditModalOpen(true);
  };

  const handleSaveBook = async (bookToSave: Book) => {
    const prevBooks = books;
    isMutatingRef.current = true;
    setSyncStatus('syncing');

    setBooks(prev => {
      const exists = prev.some(b => b.id === bookToSave.id);
      let updated: Book[];
      if (exists) {
        updated = prev.map(b => b.id === bookToSave.id ? bookToSave : b);
      } else {
        updated = [bookToSave, ...prev];
      }
      if (bookToSave.isBookOfMonth) {
        updated = updated.map(b => ({
          ...b,
          isBookOfMonth: b.id === bookToSave.id
        }));
      }
      return updated;
    });

    if (activeBookModal && activeBookModal.id === bookToSave.id) {
      setActiveBookModal(bookToSave);
    }

    try {
      const res = await saveBookApi(bookToSave);
      if (res.success) {
        if (Array.isArray(res.books)) {
          const normalized = normalizeBooks(res.books);
          setBooks(normalized);
          const updatedActive = normalized.find(b => b.id === bookToSave.id);
          if (updatedActive) setActiveBookModal(updatedActive);
        }
        if (res.lastUpdated) lastServerTimestampRef.current = res.lastUpdated;
        setSyncStatus('synced');
        showToast(language === 'en' ? 'Book saved & synced across salon' : 'Kitap kaydedildi ve eşitlendi', 'success');
      } else {
        setBooks(prevBooks);
        setSyncStatus('error');
        showToast(language === 'en' ? 'Failed to save book to server' : 'Kitap sunucuya kaydedilemedi', 'error');
      }
    } catch {
      setBooks(prevBooks);
      setSyncStatus('error');
      showToast(language === 'en' ? 'Network error saving book' : 'Kitap kaydedilirken ağ hatası', 'error');
    } finally {
      isMutatingRef.current = false;
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    const prevBooks = books;
    isMutatingRef.current = true;
    setSyncStatus('syncing');

    setBooks(prev => prev.filter(b => b.id !== bookId));
    if (activeBookModal?.id === bookId) {
      setActiveBookModal(null);
    }

    try {
      const res = await deleteBookApi(bookId);
      if (res.success) {
        if (Array.isArray(res.books)) setBooks(normalizeBooks(res.books));
        if (res.lastUpdated) lastServerTimestampRef.current = res.lastUpdated;
        setSyncStatus('synced');
        showToast(language === 'en' ? 'Book removed from salon' : 'Kitap salondan kaldırıldı', 'info');
      } else {
        setBooks(prevBooks);
        setSyncStatus('error');
        showToast(language === 'en' ? 'Failed to delete book' : 'Kitap silinemedi', 'error');
      }
    } catch {
      setBooks(prevBooks);
      setSyncStatus('error');
      showToast(language === 'en' ? 'Network error deleting book' : 'Kitap silinirken ağ hatası', 'error');
    } finally {
      isMutatingRef.current = false;
    }
  };

  const handleSetBookOfMonth = async (bookId: string) => {
    const prevBooks = books;
    isMutatingRef.current = true;
    setSyncStatus('syncing');

    const updated = books.map(b => ({
      ...b,
      isBookOfMonth: b.id === bookId
    }));
    setBooks(updated);

    const matched = updated.find(b => b.id === bookId);
    if (matched) {
      try {
        const res = await saveBookApi(matched);
        if (res.success) {
          if (Array.isArray(res.books)) setBooks(res.books);
          if (res.lastUpdated) lastServerTimestampRef.current = res.lastUpdated;
          setSyncStatus('synced');
          showToast(language === 'en' ? 'Book of the month updated' : 'Ayın kitabı güncellendi', 'success');
        } else {
          setBooks(prevBooks);
          setSyncStatus('error');
        }
      } catch {
        setBooks(prevBooks);
        setSyncStatus('error');
      } finally {
        isMutatingRef.current = false;
      }
    } else {
      isMutatingRef.current = false;
    }
  };

  // Handler: Member administration (Awaited with optimistic update and rollback)
  const handleOpenAddMember = () => {
    setMemberToEdit(null);
    setIsMemberEditModalOpen(true);
  };

  const handleOpenEditMember = (member: Member) => {
    setMemberToEdit(member);
    setIsMemberEditModalOpen(true);
  };

  const handleSaveMember = async (memberToSave: Member) => {
    const prevMembers = members;
    isMutatingRef.current = true;
    setSyncStatus('syncing');

    setMembers(prev => {
      const exists = prev.some(m => m.id === memberToSave.id);
      if (exists) {
        return prev.map(m => m.id === memberToSave.id ? memberToSave : m);
      }
      return [...prev, memberToSave];
    });
    setSelectedMemberId(memberToSave.id);

    try {
      const res = await saveMemberApi(memberToSave);
      if (res.success) {
        if (Array.isArray(res.members)) setMembers(res.members);
        if (res.lastUpdated) lastServerTimestampRef.current = res.lastUpdated;
        setSyncStatus('synced');
        showToast(language === 'en' ? 'Member saved & synced' : 'Üye kaydedildi ve eşitlendi', 'success');
      } else {
        setMembers(prevMembers);
        setSyncStatus('error');
        showToast(language === 'en' ? 'Failed to save member' : 'Üye kaydedilemedi', 'error');
      }
    } catch {
      setMembers(prevMembers);
      setSyncStatus('error');
      showToast(language === 'en' ? 'Network error saving member' : 'Ağ hatası oluştu', 'error');
    } finally {
      isMutatingRef.current = false;
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const prevMembers = members;
    const remaining = members.filter(m => m.id !== memberId);
    isMutatingRef.current = true;
    setSyncStatus('syncing');

    setMembers(remaining);
    if (selectedMemberId === memberId && remaining.length > 0) {
      setSelectedMemberId(remaining[0].id);
    }

    try {
      const res = await saveClubData({
        books,
        members: remaining,
        siteContent,
        referrals
      });
      if (res.success) {
        if (res.lastUpdated) lastServerTimestampRef.current = res.lastUpdated;
        setSyncStatus('synced');
        showToast(language === 'en' ? 'Member removed from salon' : 'Üye salondan kaldırıldı', 'info');
      } else {
        setMembers(prevMembers);
        setSyncStatus('error');
      }
    } catch {
      setMembers(prevMembers);
      setSyncStatus('error');
    } finally {
      isMutatingRef.current = false;
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'tr' : 'en'));
  };

  const heroCitiesText = language === 'en'
    ? (siteContent.heroCitiesEn || siteContent.heroCities || t.heroCities)
    : (siteContent.heroCities || t.heroCities);

  const heroLine1Text = language === 'en'
    ? (siteContent.heroLine1En || siteContent.heroLine1 || t.heroLine1)
    : (siteContent.heroLine1 || t.heroLine1);

  const heroAccentText = language === 'en'
    ? (siteContent.heroAccentEn || siteContent.heroAccent || t.heroAccent)
    : (siteContent.heroAccent || t.heroAccent);

  const heroLine2Text = language === 'en'
    ? (siteContent.heroLine2En || siteContent.heroLine2 || t.heroLine2)
    : (siteContent.heroLine2 || t.heroLine2);

  const heroSubtitleText = language === 'en'
    ? (siteContent.heroSubtitleEn || siteContent.heroSubtitle || t.heroSubtitle)
    : (siteContent.heroSubtitle || t.heroSubtitle);

  const statBooksCountText = siteContent.statBooksCount || t.statBooksCount;
  const statBooksLabelText = language === 'en'
    ? (siteContent.statBooksLabelEn || siteContent.statBooksLabel || t.statBooksLabel)
    : (siteContent.statBooksLabel || t.statBooksLabel);

  const statPagesCountText = language === 'en'
    ? (siteContent.statPagesCountEn || siteContent.statPagesCount || t.statPagesCount)
    : (siteContent.statPagesCount || t.statPagesCount);
  const statPagesLabelText = language === 'en'
    ? (siteContent.statPagesLabelEn || siteContent.statPagesLabel || t.statPagesLabel)
    : (siteContent.statPagesLabel || t.statPagesLabel);

  const statMembersCountText = siteContent.statMembersCount || t.statMembersCount;
  const statMembersLabelText = language === 'en'
    ? (siteContent.statMembersLabelEn || siteContent.statMembersLabel || t.statMembersLabel)
    : (siteContent.statMembersLabel || t.statMembersLabel);

  const announcementText = language === 'en'
    ? (siteContent.announcementEn || siteContent.announcement)
    : siteContent.announcement;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#1E1E1E]">
      {/* Optional Admin Editable Announcement Banner */}
      {siteContent.showAnnouncement && (announcementText || siteContent.announcement) && (
        <div className="bg-[#C45B38] text-white px-4 py-2 text-xs font-medium flex items-center justify-center gap-3 shadow-xs">
          <span>{announcementText || siteContent.announcement}</span>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsSiteContentModalOpen(true)}
              className="text-[11px] underline opacity-90 hover:opacity-100 cursor-pointer ml-1"
            >
              ({language === 'en' ? 'Edit' : 'Düzenle'})
            </button>
          )}
        </div>
      )}

      {/* Top Bar with Books & Friends brand, Admin/Member portal, TR/EN switcher, and Newsletter sign-up */}
      <Header
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenNewsletter={() => setIsNewsletterOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        isAdmin={isAdmin}
        currentUser={currentUser}
        language={language}
        onToggleLanguage={toggleLanguage}
        members={members}
        selectedMemberId={selectedMemberId}
        onSelectMember={(id) => {
          setSelectedMemberId(id);
          setCurrentView('members');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        brandName={siteContent.brandName}
        syncStatus={syncStatus}
        onManualSync={() => syncWithBackend(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'home' && (
          <div>
            {/* Modern Minimalist Editorial Hero Section */}
            <section className="relative overflow-hidden pt-10 pb-12 sm:pt-16 sm:pb-16 border-b border-stone-200">
              {/* Soft ambient light glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/50 via-transparent to-transparent pointer-events-none" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-3xl">
                  {/* Clean unboxed city locations with Admin Edit Button */}
                  <div className="flex items-center justify-between gap-2 text-xs font-mono text-stone-500 uppercase tracking-widest mb-4">
                    <span>{heroCitiesText}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsSiteContentModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans font-semibold rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition-colors shadow-xs cursor-pointer"
                        title={language === 'en' ? 'Edit Hero & Statistics (Admin)' : 'Giriş ve İstatistikleri Düzenle (Yönetici)'}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-800" />
                        <span>{language === 'en' ? 'Edit Hero & Stats' : 'Metinleri Düzenle'}</span>
                      </button>
                    )}
                  </div>

                  {/* Headline matching screenshot */}
                  <h1 className="font-serif text-5xl sm:text-7xl font-normal tracking-tight text-[#1A1A1A] leading-[1.08] text-balance">
                    {heroLine1Text}<br />
                    <span className="italic text-[#C45B38] font-normal">{heroAccentText}</span> {heroLine2Text}
                  </h1>

                  <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed font-light max-w-2xl">
                    {heroSubtitleText}
                  </p>

                  {/* Summary Counter Strip with Now Reading, October Month & Book Name */}
                  <div className="mt-10 pt-7 border-t border-stone-200/90">
                    {/* Now Reading indicator with October month and book title */}
                    <div className="mb-6 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#C45B38]/10 text-[#C45B38] font-mono text-[11px] uppercase tracking-wider font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C45B38] animate-pulse" />
                        <span>{t.nowReadingLabel} · {language === 'en' ? 'October' : 'Ekim'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenBookModal(currentBookOfMonth)}
                        className="group inline-flex items-center gap-2 text-stone-900 hover:text-[#C45B38] transition-colors font-medium text-left cursor-pointer"
                        title={`View ${getBookTitle(currentBookOfMonth, language)} details`}
                      >
                        <span className="font-serif text-lg sm:text-xl font-normal italic underline decoration-stone-300 group-hover:decoration-[#C45B38] underline-offset-4">
                          {getBookTitle(currentBookOfMonth, language)}
                        </span>
                        <span className="text-stone-400 font-sans text-xs sm:text-sm">
                          — {currentBookOfMonth.author}
                        </span>
                        <span className="text-stone-400 group-hover:translate-x-0.5 transition-transform text-xs">
                          →
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 max-w-xl gap-8 sm:gap-14">
                      <div>
                        <div className="font-serif text-4xl sm:text-6xl font-normal text-stone-900 tabular-nums">
                          {statBooksCountText}
                        </div>
                        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-normal">
                          {statBooksLabelText}
                        </p>
                      </div>
                      <div>
                        <div className="font-serif text-4xl sm:text-6xl font-normal italic text-stone-900 tabular-nums">
                          {statPagesCountText}
                        </div>
                        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-normal">
                          {statPagesLabelText}
                        </p>
                      </div>
                      <div>
                        <div className="font-serif text-4xl sm:text-6xl font-normal text-stone-900 tabular-nums">
                          {statMembersCountText}
                        </div>
                        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-normal">
                          {statMembersLabelText}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Six Members Portrait Row & Explore Shelves Button */}
                  <div className="mt-8 pt-7 border-t border-stone-200/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2.5 overflow-hidden">
                          {members.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setSelectedMemberId(m.id);
                                setCurrentView('members');
                              }}
                              title={`View ${m.name}'s profile`}
                              className="inline-block h-10 w-10 rounded-full ring-2 ring-white hover:scale-110 hover:z-20 transition-transform bg-stone-300 overflow-hidden cursor-pointer"
                            >
                              <img
                                src={m.avatarUrl}
                                alt={m.name}
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                        <div className="text-xs">
                          <p className="font-semibold text-stone-900">{t.heroCurators}</p>
                          <p className="text-stone-500 text-[11px]">
                            {members.slice(0, 6).map(m => m.name.split(' ')[0]).join(', ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentView('members');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-4 py-2 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition-colors shadow-xs cursor-pointer"
                        >
                          {t.heroExploreShelves} →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Main Interactive Bookshelf */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              <TactileBookshelf
                books={books}
                onSelectBook={(book) => handleOpenBookModal(book)}
                title={t.shelfTitle}
                subtitle={t.shelfSubtitle}
                language={language}
                isAdmin={isAdmin}
                onAddBook={handleOpenAddBook}
              />
            </div>

            {/* Book of the Month Spotlight & Reflections */}
            <BookOfTheMonthSection
              book={currentBookOfMonth}
              language={language}
              onSelectBook={handleOpenBookModal}
              isAdmin={isAdmin}
              currentUser={currentUser}
              onEditBook={handleOpenEditBook}
            />
          </div>
        )}

        {/* Members Profile Page */}
        {currentView === 'members' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <MemberProfilePage
              members={members}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
              onUpdateMember={handleUpdateMember}
              onSelectBook={(book) => handleOpenBookModal(book, false, selectedMemberId)}
              language={language}
              isAdmin={isAdmin}
              currentUser={currentUser}
              onOpenAdmin={() => setIsAdminModalOpen(true)}
              onOpenAuth={() => setIsAdminModalOpen(true)}
              onAddMember={handleOpenAddMember}
              onDeleteMember={handleDeleteMember}
              clubBooks={books}
              onAddBookToClub={handleSaveBook}
            />
          </div>
        )}

        {/* Book of the Month Dedicated View */}
        {currentView === 'book-of-month' && (
          <div>
            <BookOfTheMonthSection
              book={currentBookOfMonth}
              language={language}
              onSelectBook={handleOpenBookModal}
              isAdmin={isAdmin}
              currentUser={currentUser}
              onEditBook={handleOpenEditBook}
            />
          </div>
        )}
      </main>

      {/* Book Detail Modal */}
      <BookDetailModal
        book={activeBookModal}
        onClose={() => {
          setActiveBookModal(null);
          setModalInitialVideoUpload(false);
          setActiveBookShelfMemberId(null);
        }}
        onAddComment={handleAddComment}
        onUpdateVideo={handleUpdateVideo}
        language={language}
        isAdmin={isAdmin}
        currentUser={currentUser}
        initialOpenVideoUpload={modalInitialVideoUpload}
        onEditBook={handleOpenEditBook}
        onSetBookOfMonth={handleSetBookOfMonth}
        onRemoveFromMemberShelf={
          activeBookShelfMemberId && (isAdmin || currentUser?.memberId === activeBookShelfMemberId)
            ? (bookId) => {
                const memberToUpdate = members.find(m => m.id === activeBookShelfMemberId);
                if (memberToUpdate) {
                  handleUpdateMember({
                    ...memberToUpdate,
                    books: memberToUpdate.books.filter(b => b.id !== bookId)
                  });
                }
              }
            : undefined
        }
        memberShelfOwnerName={
          activeBookShelfMemberId
            ? members.find(m => m.id === activeBookShelfMemberId)?.name
            : undefined
        }
      />

      {/* Newsletter & Referral Modal */}
      <ReferralModal
        isOpen={isNewsletterOpen}
        onClose={() => setIsNewsletterOpen(false)}
        language={language}
        members={members}
        referrals={referrals}
        onSubmitReferral={handleSubmitReferral}
        onUpdateStatus={handleUpdateReferralStatus}
      />

      {/* Member & Administrator Access Portal Modal */}
      <AuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        language={language}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReferrals={() => setIsNewsletterOpen(true)}
        onOpenEditSite={() => setIsSiteContentModalOpen(true)}
        onOpenAddBook={handleOpenAddBook}
        onOpenAddMember={handleOpenAddMember}
        onSelectMember={(memId) => {
          setSelectedMemberId(memId);
          setCurrentView('members');
        }}
      />

      {/* Admin Quick Action Floating Bar (Only shown for Admin role) */}
      <AdminFloatingBar
        isAdmin={isAdmin}
        onOpenEditSite={() => setIsSiteContentModalOpen(true)}
        onOpenAddBook={handleOpenAddBook}
        onOpenAddMember={handleOpenAddMember}
        onOpenReferrals={() => setIsNewsletterOpen(true)}
        onSignOut={handleLogout}
        language={language}
      />

      {/* Admin Site Content & Stats Modal */}
      <EditSiteContentModal
        isOpen={isSiteContentModalOpen}
        onClose={() => setIsSiteContentModalOpen(false)}
        siteContent={siteContent}
        onSave={handleSaveSiteContent}
        language={language}
      />

      {/* Admin Book Add/Edit Modal */}
      <BookEditModal
        isOpen={isBookEditModalOpen}
        onClose={() => setIsBookEditModalOpen(false)}
        bookToEdit={bookToEdit}
        onSaveBook={handleSaveBook}
        onDeleteBook={handleDeleteBook}
        members={members}
        language={language}
      />

      {/* Admin Member Add/Edit Modal */}
      <MemberEditModal
        isOpen={isMemberEditModalOpen}
        onClose={() => setIsMemberEditModalOpen(false)}
        memberToEdit={memberToEdit}
        onSaveMember={handleSaveMember}
        onDeleteMember={handleDeleteMember}
        language={language}
      />

      {/* Clean quiet Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenReferral={() => setIsNewsletterOpen(true)}
        language={language}
      />

      {/* Floating Sync Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full transition-all duration-200">
          <div className={`p-3.5 rounded-xl border shadow-lg backdrop-blur-md flex items-center justify-between gap-3 text-xs font-medium ${
            toast.type === 'error'
              ? 'bg-red-950/90 text-red-50 border-red-800'
              : toast.type === 'info'
              ? 'bg-stone-900/90 text-stone-100 border-stone-700'
              : 'bg-stone-900/90 text-stone-100 border-stone-700'
          }`}>
            <div className="flex items-center gap-2.5">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-stone-400 hover:text-stone-200 cursor-pointer p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
