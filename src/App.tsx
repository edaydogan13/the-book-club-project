import React, { useState, useEffect } from 'react';
import { Book, Member, BookComment, VideoReview, ReferralApplication, SiteContent, AuthUser } from './types';
import { 
  INITIAL_BOOKS, 
  INITIAL_MEMBERS, 
  INITIAL_REFERRALS,
  INITIAL_SITE_CONTENT,
  EDA_EXTRA_BOOKS,
  getBookTitle
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
import { Edit3, Plus, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation View: 'home' | 'members' | 'book-of-month'
  const [currentView, setCurrentView] = useState<'home' | 'members' | 'book-of-month'>('home');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('eda-aydogan');
  const [language, setLanguage] = useState<Language>('en');

  // Interactive Modals
  const [activeBookModal, setActiveBookModal] = useState<Book | null>(null);
  const [modalInitialVideoUpload, setModalInitialVideoUpload] = useState<boolean>(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const handleOpenBookModal = (book: Book, openVideoUpload?: boolean) => {
    setActiveBookModal(book);
    setModalInitialVideoUpload(Boolean(openVideoUpload));
  };

  // Admin In-Place Editing Modals
  const [isSiteContentModalOpen, setIsSiteContentModalOpen] = useState<boolean>(false);
  const [isBookEditModalOpen, setIsBookEditModalOpen] = useState<boolean>(false);
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);
  const [isMemberEditModalOpen, setIsMemberEditModalOpen] = useState<boolean>(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  // User Authentication & Session (Admin or Member like Gizem123 / Eda123 / etc.)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('books_and_friends_session_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing session user', e);
      }
    }
    const legacyAdmin = localStorage.getItem('books_and_friends_admin_mode') === 'true';
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
    const mergeWithInitial = (bookList: Book[]) => {
      return bookList.map((pb: Book) => {
        const initialMatch = INITIAL_BOOKS.find(ib => ib.id === pb.id) || EDA_EXTRA_BOOKS.find(eb => eb.id === pb.id);
        if (initialMatch) {
          return {
            ...pb,
            title: initialMatch.title || pb.title,
            titleEn: pb.titleEn || initialMatch.titleEn,
            genre: initialMatch.genre || pb.genre,
            genreEn: initialMatch.genreEn || pb.genreEn,
            synopsisEn: pb.synopsisEn || initialMatch.synopsisEn,
            favoriteQuoteEn: pb.favoriteQuoteEn || initialMatch.favoriteQuoteEn,
            coverImageUrl: initialMatch.coverImageUrl,
            coverImageUrlTr: initialMatch.coverImageUrlTr,
            coverImageUrlEn: initialMatch.coverImageUrlEn,
            monthEn: pb.monthEn || initialMatch.monthEn,
            monthTr: initialMatch.monthTr || pb.monthTr,
            videoReview: initialMatch.videoReview !== undefined ? initialMatch.videoReview : pb.videoReview,
            comments: (initialMatch.comments && initialMatch.comments.length > 0) ? initialMatch.comments : pb.comments,
          };
        }
        return pb;
      });
    };

    const saved = localStorage.getItem('books_and_friends_books_v9');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeWithInitial(parsed);
        }
      } catch (e) {
        console.error('Error parsing books v9', e);
      }
    }
    // Migrate previous books by merging new English fields, local verified covers, and comments from INITIAL_BOOKS
    const prevSaved = localStorage.getItem('books_and_friends_books_v8') || localStorage.getItem('books_and_friends_books_v5');
    if (prevSaved) {
      try {
        const parsed = JSON.parse(prevSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return mergeWithInitial(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BOOKS;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('books_and_friends_members_v8');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing members v8', e);
      }
    }
    const prevSaved = localStorage.getItem('books_and_friends_members_v7') || localStorage.getItem('books_and_friends_members_v6');
    if (prevSaved) {
      try {
        const parsed = JSON.parse(prevSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: Member) => {
            const initialMatch = INITIAL_MEMBERS.find(im => im.id === m.id);
            if (initialMatch) {
              return {
                ...m,
                roleEn: m.roleEn || initialMatch.roleEn,
                bioEn: m.bioEn || initialMatch.bioEn,
                favoriteQuoteEn: m.favoriteQuoteEn || initialMatch.favoriteQuoteEn,
                readingGoal2026En: m.readingGoal2026En || initialMatch.readingGoal2026En,
                currentlyReadingEn: m.currentlyReadingEn || initialMatch.currentlyReadingEn,
                avatarUrl: m.id === 'cemre-sirin' && (!m.avatarUrl || m.avatarUrl === '/members/cemresirin.jpg') 
                  ? '/members/cemresirin.webp?v=2' 
                  : m.avatarUrl,
                books: initialMatch.books
              };
            }
            return m;
          });
        }
      } catch (e) {
        console.error('Error parsing members from storage', e);
      }
    }
    return INITIAL_MEMBERS;
  });

  const [referrals, setReferrals] = useState<ReferralApplication[]>(() => {
    const saved = localStorage.getItem('books_and_friends_referrals_v5');
    return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
  });

  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    const saved = localStorage.getItem('books_and_friends_site_content_v5');
    return saved ? JSON.parse(saved) : INITIAL_SITE_CONTENT;
  });

  // Save to localStorage on changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('books_and_friends_session_user', JSON.stringify(currentUser));
      localStorage.setItem('books_and_friends_admin_mode', currentUser.role === 'admin' ? 'true' : 'false');
    } else {
      localStorage.removeItem('books_and_friends_session_user');
      localStorage.setItem('books_and_friends_admin_mode', 'false');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('books_and_friends_books_v9', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('books_and_friends_members_v8', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('books_and_friends_referrals_v5', JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem('books_and_friends_site_content_v5', JSON.stringify(siteContent));
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

  // Handler: Add Comment to a Book
  const handleAddComment = (bookId: string, commentData: Omit<BookComment, 'id' | 'timestamp'>) => {
    const newComment: BookComment = {
      ...commentData,
      id: `comment-${Date.now()}`,
      timestamp: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setBooks(prevBooks =>
      prevBooks.map(b => {
        if (b.id === bookId) {
          return {
            ...b,
            comments: [newComment, ...b.comments]
          };
        }
        return b;
      })
    );

    setActiveBookModal(prev => {
      if (prev && prev.id === bookId) {
        return {
          ...prev,
          comments: [newComment, ...prev.comments]
        };
      }
      return prev;
    });
  };

  // Handler: Update Video Review for a Book (backed by Cloud Storage)
  const handleUpdateVideo = (bookId: string, video: VideoReview) => {
    setBooks(prevBooks =>
      prevBooks.map(b => {
        if (b.id === bookId) {
          return { ...b, videoReview: video };
        }
        return b;
      })
    );

    setActiveBookModal(prev => {
      if (prev && prev.id === bookId) {
        return { ...prev, videoReview: video };
      }
      return prev;
    });
  };

  // Handler: Submit Newsletter & Referral Application
  const handleSubmitReferral = (appData: Omit<ReferralApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApp: ReferralApplication = {
      ...appData,
      id: `ref-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'tr-TR', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setReferrals(prev => [newApp, ...prev]);
  };

  // Handler: Update Referral Status
  const handleUpdateReferralStatus = (id: string, status: 'approved' | 'declined') => {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  // Handler: Update Member Profile (Admin or User edit)
  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
  };

  // Handler: Site Content update
  const handleSaveSiteContent = (updated: SiteContent) => {
    setSiteContent(updated);
  };

  // Handler: Book administration
  const handleOpenAddBook = () => {
    setBookToEdit(null);
    setIsBookEditModalOpen(true);
  };

  const handleOpenEditBook = (book: Book) => {
    setBookToEdit(book);
    setIsBookEditModalOpen(true);
  };

  const handleSaveBook = (bookToSave: Book) => {
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
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
    if (activeBookModal?.id === bookId) {
      setActiveBookModal(null);
    }
  };

  const handleSetBookOfMonth = (bookId: string) => {
    setBooks(prev => prev.map(b => ({
      ...b,
      isBookOfMonth: b.id === bookId
    })));
  };

  // Handler: Member administration
  const handleOpenAddMember = () => {
    setMemberToEdit(null);
    setIsMemberEditModalOpen(true);
  };

  const handleOpenEditMember = (member: Member) => {
    setMemberToEdit(member);
    setIsMemberEditModalOpen(true);
  };

  const handleSaveMember = (memberToSave: Member) => {
    setMembers(prev => {
      const exists = prev.some(m => m.id === memberToSave.id);
      if (exists) {
        return prev.map(m => m.id === memberToSave.id ? memberToSave : m);
      }
      return [...prev, memberToSave];
    });
    setSelectedMemberId(memberToSave.id);
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    if (selectedMemberId === memberId) {
      const remaining = members.filter(m => m.id !== memberId);
      if (remaining.length > 0) {
        setSelectedMemberId(remaining[0].id);
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'tr' : 'en'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#1E1E1E]">
      {/* Optional Admin Editable Announcement Banner */}
      {siteContent.showAnnouncement && siteContent.announcement && (
        <div className="bg-[#C45B38] text-white px-4 py-2 text-xs font-medium flex items-center justify-center gap-3 shadow-xs">
          <span>{siteContent.announcement}</span>
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
                    <span>{t.heroCities}</span>
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
                    {t.heroLine1}<br />
                    <span className="italic text-[#C45B38] font-normal">{t.heroAccent}</span> {t.heroLine2}
                  </h1>

                  <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed font-light max-w-2xl">
                    {t.heroSubtitle}
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
                          {t.statBooksCount}
                        </div>
                        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-normal">
                          {t.statBooksLabel}
                        </p>
                      </div>
                      <div>
                        <div className="font-serif text-4xl sm:text-6xl font-normal italic text-stone-900 tabular-nums">
                          {t.statPagesCount}
                        </div>
                        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-normal">
                          {t.statPagesLabel}
                        </p>
                      </div>
                      <div>
                        <div className="font-serif text-4xl sm:text-6xl font-normal text-stone-900 tabular-nums">
                          {t.statMembersCount}
                        </div>
                        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-normal">
                          {t.statMembersLabel}
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
              onSelectBook={(book) => handleOpenBookModal(book)}
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
        }}
        onAddComment={handleAddComment}
        onUpdateVideo={handleUpdateVideo}
        language={language}
        isAdmin={isAdmin}
        currentUser={currentUser}
        initialOpenVideoUpload={modalInitialVideoUpload}
        onEditBook={handleOpenEditBook}
        onSetBookOfMonth={handleSetBookOfMonth}
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
    </div>
  );
}
