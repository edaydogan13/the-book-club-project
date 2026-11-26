import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  FileText, 
  Send, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Inbox, 
  Layers, 
  LogOut,
  Users
} from 'lucide-react';
import { Language } from '../translations';
import { 
  auth, 
  signInWithGoogleWorkspace, 
  logoutGoogle, 
  initAuth, 
  getAccessToken 
} from '../utils/firebaseAuth';
import { 
  fetchClubEmails, 
  sendClubEmail, 
  listUserGoogleForms, 
  getGoogleForm, 
  getGoogleFormResponses, 
  createGoogleForm,
  GmailMessageSummary,
  DriveFormFile,
  GoogleFormDetail,
  GoogleFormResponse
} from '../utils/workspace';
import { User } from 'firebase/auth';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'forms'>('gmail');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Gmail states
  const [emails, setEmails] = useState<GmailMessageSummary[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [emailQuery, setEmailQuery] = useState('to:hello@booksnfriends.com OR subject:"Books & Friends" OR label:INBOX');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [recipient, setRecipient] = useState('hello@booksnfriends.com');
  const [subject, setSubject] = useState('[Books & Friends] Salon Newsletter & Reflection');
  const [bodyText, setBodyText] = useState(
    'Dear Fellow Reader,\n\nHere are our salon notes and reflections for this month\'s reading.\n\nWarmly,\nBooks & Friends Club'
  );
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // Forms states
  const [formsList, setFormsList] = useState<DriveFormFile[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [selectedFormDetail, setSelectedFormDetail] = useState<GoogleFormDetail | null>(null);
  const [selectedFormResponses, setSelectedFormResponses] = useState<GoogleFormResponse[]>([]);
  const [isLoadingResponses, setIsLoadingResponses] = useState(false);
  const [showCreateFormDialog, setShowCreateFormDialog] = useState(false);
  const [newFormTitle, setNewFormTitle] = useState('Books & Friends — Book Nomination & Salon RSVP');
  const [newFormDescription, setNewFormDescription] = useState('Vote for upcoming monthly books and RSVP for our literary gatherings.');
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  // General error/success banner
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Confirm dialog state for sending email (Mandatory destructive/mutating operation user confirmation)
  const [showConfirmSend, setShowConfirmSend] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(!!token);
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );

    // Initial check
    getAccessToken().then(tok => {
      setHasToken(!!tok);
      if (auth.currentUser) setCurrentUser(auth.currentUser);
    });

    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    if (hasToken) {
      if (activeTab === 'gmail') {
        loadEmails();
      } else {
        loadForms();
      }
    }
  }, [hasToken, activeTab]);

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setErrorNotice(null);
    try {
      const res = await signInWithGoogleWorkspace();
      if (res) {
        setCurrentUser(res.user);
        setHasToken(true);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setErrorNotice(err.message || 'Failed to authenticate with Google Workspace');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setHasToken(false);
    setEmails([]);
    setFormsList([]);
    setSelectedFormDetail(null);
  };

  const loadEmails = async () => {
    setIsLoadingEmails(true);
    setErrorNotice(null);
    try {
      const list = await fetchClubEmails(12, emailQuery);
      setEmails(list);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to load Gmail messages');
    } finally {
      setIsLoadingEmails(false);
    }
  };

  const loadForms = async () => {
    setIsLoadingForms(true);
    setErrorNotice(null);
    try {
      const list = await listUserGoogleForms();
      setFormsList(list);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to list Google Forms');
    } finally {
      setIsLoadingForms(false);
    }
  };

  const handleSelectForm = async (formId: string) => {
    setIsLoadingResponses(true);
    setErrorNotice(null);
    try {
      const detail = await getGoogleForm(formId);
      setSelectedFormDetail(detail);

      const resp = await getGoogleFormResponses(formId);
      setSelectedFormResponses(resp);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to load form details and responses');
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const handleTriggerSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim() || !bodyText.trim()) return;
    // Mandate explicit confirmation before mutating/sending external user communications
    setShowConfirmSend(true);
  };

  const handleConfirmSendEmail = async () => {
    setShowConfirmSend(false);
    setIsSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      await sendClubEmail(recipient.trim(), subject.trim(), bodyText);
      setSendSuccess(true);
      setTimeout(() => {
        setSendSuccess(false);
        setShowSendDialog(false);
      }, 2500);
      loadEmails();
    } catch (err: any) {
      setSendError(err.message || 'Error sending message via Gmail');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormTitle.trim()) return;

    setIsCreatingForm(true);
    setErrorNotice(null);
    try {
      const created = await createGoogleForm(newFormTitle.trim(), newFormDescription.trim());
      setShowCreateFormDialog(false);
      await loadForms();
      handleSelectForm(created.formId);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to create Google Form');
    } finally {
      setIsCreatingForm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#FBFBFA] rounded-2xl border border-stone-300 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-[#C45B38] border border-amber-200 shadow-xs">
              {activeTab === 'gmail' ? <Mail className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  Google Workspace & Firebase Hub
                </h2>
                <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                {language === 'en'
                  ? 'Access club discussions on Gmail, organize Google Forms for RSVPs & ballots, backed by Firebase.'
                  : 'Gmail üzerinden kulüp postalarını yönetin, Google Forms ile anket ve salon kayıtları toplayın.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Auth State Bar */}
        <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/80 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('gmail')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'gmail'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#C45B38]" />
              <span>Gmail {language === 'en' ? 'Discussions' : 'Postaları'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('forms')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'forms'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Forms {language === 'en' ? 'Ballots & RSVP' : 'Anket & Katılım'}</span>
            </button>
          </div>

          {/* User Sign In Status */}
          <div className="flex items-center gap-3">
            {currentUser && hasToken ? (
              <div className="flex items-center gap-2 text-xs">
                {currentUser.photoURL && (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-6 h-6 rounded-full object-cover border border-stone-300"
                  />
                )}
                <span className="font-medium text-stone-800 hidden sm:inline">
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                  title="Sign out of Google"
                >
                  <LogOut className="w-3 h-3" />
                  <span>{language === 'en' ? 'Disconnect' : 'Bağlantıyı Kes'}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
                className="gsi-material-button inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-xl border border-stone-300 shadow-xs transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 shrink-0">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </div>
                <span>
                  {isAuthenticating
                    ? (language === 'en' ? 'Connecting...' : 'Bağlanıyor...')
                    : (language === 'en' ? 'Connect Google Account' : 'Google ile Bağlan')}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Global Alert Notification */}
        {errorNotice && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorNotice(null)}
              className="p-1 hover:bg-rose-100 rounded text-rose-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {!hasToken ? (
            /* Unauthenticated Prompt */
            <div className="py-12 px-4 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-[#C45B38] mx-auto flex items-center justify-center shadow-xs">
                {activeTab === 'gmail' ? <Mail className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
              </div>
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                {activeTab === 'gmail'
                  ? (language === 'en' ? 'Connect Gmail for Club Salons' : 'Kulüp Postaları İçin Gmail\'i Bağlayın')
                  : (language === 'en' ? 'Connect Google Forms for Ballots' : 'Oylamalar İçin Google Forms\'u Bağlayın')}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {language === 'en'
                  ? 'Authenticate securely with Google to view and dispatch salon updates, survey responses, and literary nominations with permission from the app’s users.'
                  : 'Salon duyuruları göndermek ve anket sonuçlarını anlık görüntülemek için Google hesabınızla tek tıkla bağlanın.'}
              </p>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isAuthenticating}
                className="w-full py-3 px-5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{language === 'en' ? 'Sign in with Google' : 'Google ile Giriş Yap'}</span>
              </button>
            </div>
          ) : activeTab === 'gmail' ? (
            /* GMAIL TAB */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={emailQuery}
                    onChange={(e) => setEmailQuery(e.target.value)}
                    placeholder="Search filter (e.g. Books & Friends)"
                    className="text-xs px-3 py-1.5 bg-white border border-stone-300 rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-stone-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={loadEmails}
                    disabled={isLoadingEmails}
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingEmails ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSendDialog(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C45B38] hover:bg-[#a94827] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Compose Newsletter / Email' : 'Yeni Bülten / Posta Gönder'}</span>
                </button>
              </div>

              {/* Send Dialog / Form */}
              {showSendDialog && (
                <div className="p-4 sm:p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-[#C45B38]" />
                      <span>{language === 'en' ? 'Send Club Salon Dispatch' : 'Kulüp Salon Postası Gönder'}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowSendDialog(false)}
                      className="p-1 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {sendSuccess && (
                    <div className="p-2.5 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'en' ? 'Email sent successfully via Gmail!' : 'Posta Gmail üzerinden başarıyla gönderildi!'}</span>
                    </div>
                  )}

                  {sendError && (
                    <div className="p-2.5 bg-rose-100 border border-rose-300 text-rose-900 text-xs rounded-xl">
                      {sendError}
                    </div>
                  )}

                  <form onSubmit={handleTriggerSendEmail} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 uppercase mb-1">
                        {language === 'en' ? 'To (Recipient Email)' : 'Kime (E-posta adresi)'}
                      </label>
                      <input
                        type="email"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="hello@booksnfriends.com"
                        required
                        className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 uppercase mb-1">
                        {language === 'en' ? 'Subject' : 'Konu'}
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-600 uppercase mb-1">
                        {language === 'en' ? 'Message Body' : 'Mesaj Metni'}
                      </label>
                      <textarea
                        rows={4}
                        value={bodyText}
                        onChange={(e) => setBodyText(e.target.value)}
                        required
                        className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none font-sans"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowSendDialog(false)}
                        className="px-3 py-1.5 bg-stone-200 text-stone-700 text-xs rounded-lg hover:bg-stone-300"
                      >
                        {language === 'en' ? 'Cancel' : 'İptal'}
                      </button>
                      <button
                        type="submit"
                        disabled={isSending}
                        className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSending ? (language === 'en' ? 'Sending...' : 'Gönderiliyor...') : (language === 'en' ? 'Send via Gmail' : 'Gmail ile Gönder')}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Email List */}
              {isLoadingEmails ? (
                <div className="py-12 text-center text-xs text-stone-500 font-mono">
                  {language === 'en' ? 'Connecting to Gmail inbox...' : 'Gmail gelen kutusu taranıyor...'}
                </div>
              ) : emails.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-stone-200">
                  <Inbox className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <p>{language === 'en' ? 'No recent club messages found with current filter.' : 'Mevcut filtreyle eşleşen mesaj bulunamadı.'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {emails.map((msg) => (
                    <div
                      key={msg.id}
                      className="p-3.5 bg-white rounded-xl border border-stone-200 hover:border-stone-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-serif text-xs font-bold text-stone-900 truncate">
                            {msg.subject}
                          </p>
                          <span className="text-[10px] font-mono text-stone-400 shrink-0">
                            {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          <span className="font-semibold text-stone-700">{msg.from}</span>
                          {msg.snippet && ` — ${msg.snippet}`}
                        </p>
                      </div>

                      <a
                        href={`https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(msg.threadId || msg.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-600 hover:text-[#C45B38] px-2 py-1 rounded bg-stone-50 hover:bg-stone-100 shrink-0 border border-stone-200"
                      >
                        <span>{language === 'en' ? 'Open in Gmail' : 'Gmail\'de Aç'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* FORMS TAB */
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-sm font-bold text-stone-900">
                    {language === 'en' ? 'Club Google Forms & Polls' : 'Kulüp Google Forms Anketleri'}
                  </h4>
                  <button
                    type="button"
                    onClick={loadForms}
                    disabled={isLoadingForms}
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg border border-stone-200 transition-colors cursor-pointer"
                    title="Refresh forms"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingForms ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateFormDialog(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Create New Google Form' : 'Yeni Google Form Oluştur'}</span>
                </button>
              </div>

              {/* Create Form Dialog */}
              {showCreateFormDialog && (
                <form onSubmit={handleCreateForm} className="p-4 sm:p-5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-serif text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{language === 'en' ? 'Generate Book Club Ballot Form' : 'Kitap Kulübü Anketi Oluştur'}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowCreateFormDialog(false)}
                      className="p-1 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-stone-600 uppercase mb-1">
                      {language === 'en' ? 'Form Title' : 'Form Başlığı'}
                    </label>
                    <input
                      type="text"
                      value={newFormTitle}
                      onChange={(e) => setNewFormTitle(e.target.value)}
                      required
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-stone-600 uppercase mb-1">
                      {language === 'en' ? 'Description' : 'Açıklama'}
                    </label>
                    <input
                      type="text"
                      value={newFormDescription}
                      onChange={(e) => setNewFormDescription(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowCreateFormDialog(false)}
                      className="px-3 py-1.5 bg-stone-200 text-stone-700 text-xs rounded-lg hover:bg-stone-300"
                    >
                      {language === 'en' ? 'Cancel' : 'İptal'}
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingForm}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                    >
                      {isCreatingForm ? (language === 'en' ? 'Creating...' : 'Oluşturuluyor...') : (language === 'en' ? 'Publish Form' : 'Formu Yayınla')}
                    </button>
                  </div>
                </form>
              )}

              {/* Forms List and Selected Form Preview */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Left column: forms list */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-[11px] font-mono uppercase text-stone-400 block mb-1">
                    {language === 'en' ? 'Forms in Your Google Drive:' : 'Drive\'daki Anketleriniz:'}
                  </span>

                  {isLoadingForms ? (
                    <div className="py-8 text-center text-xs text-stone-400 font-mono">
                      {language === 'en' ? 'Scanning Google Drive for forms...' : 'Google Forms taranıyor...'}
                    </div>
                  ) : formsList.length === 0 ? (
                    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-center text-xs text-stone-400">
                      {language === 'en' ? 'No Google Forms found. Create your first club ballot above!' : 'Henüz anket bulunamadı. Yukarıdan ilk anketinizi oluşturun!'}
                    </div>
                  ) : (
                    formsList.map((form) => (
                      <div
                        key={form.id}
                        onClick={() => handleSelectForm(form.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedFormDetail?.formId === form.id
                            ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-serif text-xs font-bold text-stone-900 truncate">
                            {form.name}
                          </p>
                          {form.webViewLink && (
                            <a
                              href={form.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-stone-400 hover:text-blue-600 p-0.5"
                              title="Open in Google Forms"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-stone-400 mt-1">
                          {form.modifiedTime ? `Updated ${new Date(form.modifiedTime).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Right column: Form details & live responses */}
                <div className="md:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  {selectedFormDetail ? (
                    <>
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-200">
                        <div>
                          <h4 className="font-serif text-base font-bold text-stone-900">
                            {selectedFormDetail.info.title}
                          </h4>
                          {selectedFormDetail.info.description && (
                            <p className="text-xs text-stone-500 mt-0.5">
                              {selectedFormDetail.info.description}
                            </p>
                          )}
                        </div>

                        {selectedFormDetail.responderUri && (
                          <a
                            href={selectedFormDetail.responderUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors shrink-0"
                          >
                            <span>{language === 'en' ? 'Open & Submit' : 'Doldur'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Questions summary */}
                      <div>
                        <span className="text-[10px] font-mono uppercase text-stone-400 block mb-2 font-bold">
                          {language === 'en' ? 'Form Questions / Poll Fields:' : 'Anket Soruları:'}
                        </span>
                        <div className="space-y-1.5">
                          {selectedFormDetail.items?.map((item, idx) => (
                            <div key={item.itemId || idx} className="text-xs p-2 bg-stone-50 rounded-lg border border-stone-100 text-stone-800">
                              <span className="font-semibold text-stone-600 mr-1.5">{idx + 1}.</span>
                              <span>{item.title || (item.questionItem?.question?.textQuestion ? 'Question' : 'Field')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Real Responses */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                            {language === 'en'
                              ? `Live Submissions (${selectedFormResponses.length}):`
                              : `Canlı Yanıtlar (${selectedFormResponses.length}):`}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSelectForm(selectedFormDetail.formId)}
                            disabled={isLoadingResponses}
                            className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
                          >
                            <RefreshCw className={`w-3 h-3 ${isLoadingResponses ? 'animate-spin' : ''}`} />
                            <span>{language === 'en' ? 'Sync' : 'Yenile'}</span>
                          </button>
                        </div>

                        {selectedFormResponses.length === 0 ? (
                          <div className="p-4 bg-stone-50 rounded-xl text-center text-xs text-stone-400 italic">
                            {language === 'en' ? 'No responses submitted yet. Share the responder link with members!' : 'Henüz yanıt gönderilmedi. Üyelerle formu paylaşın!'}
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {selectedFormResponses.map((resp, i) => (
                              <div key={resp.responseId || i} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                                <div className="flex items-center justify-between text-stone-500 text-[10px]">
                                  <span>{resp.respondentEmail || `Submission #${i + 1}`}</span>
                                  <span>{resp.lastSubmittedTime ? new Date(resp.lastSubmittedTime).toLocaleDateString() : ''}</span>
                                </div>
                                {resp.answers && (
                                  <div className="space-y-1 pt-1">
                                    {Object.entries(resp.answers).map(([qId, ans]) => (
                                      <p key={qId} className="text-stone-800">
                                        <span className="font-medium text-stone-600">Answer: </span>
                                        <span>{ans.textAnswers?.answers?.map(a => a.value).join(', ') || 'Submitted'}</span>
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-16 text-center text-xs text-stone-400">
                      <FileText className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                      <p>{language === 'en' ? 'Select a Google Form from the left to inspect questions and live poll responses.' : 'Soruları ve anket yanıtlarını incelemek için soldan bir form seçin.'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mandatory User Confirmation Dialog before sending an email */}
        {showConfirmSend && (
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-stone-300 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-bold font-serif">
                <Send className="w-4 h-4 text-[#C45B38]" />
                <h3>{language === 'en' ? 'Confirm Sending Email?' : 'E-posta Gönderilsin mi?'}</h3>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {language === 'en'
                  ? `Are you sure you want to send this email to "${recipient}" with subject "${subject}" from your connected Gmail account?`
                  : `"${recipient}" adresine "${subject}" konulu e-postayı Gmail hesabınızdan göndermek istediğinize emin misiniz?`}
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmSend(false)}
                  className="px-3 py-1.5 bg-stone-200 text-stone-700 text-xs rounded-lg hover:bg-stone-300 font-medium"
                >
                  {language === 'en' ? 'Cancel' : 'İptal'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSendEmail}
                  className="px-4 py-1.5 bg-[#C45B38] hover:bg-[#a94827] text-white text-xs font-semibold rounded-lg shadow-xs"
                >
                  {language === 'en' ? 'Yes, Send Email' : 'Evet, Gönder'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
