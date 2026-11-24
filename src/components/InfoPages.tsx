import React, { useState } from 'react';
import { Member, PageView, ReferralApplication } from '../types';
import { Language } from '../translations';
import { getMemberRole } from '../data/initialData';
import {
  BookOpen,
  Mail,
  Send,
  ShieldCheck,
  FileText,
  Users,
  Globe,
  CheckCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface InfoPageBaseProps {
  language: Language;
  onNavigate: (view: PageView, memberId?: string) => void;
}

interface AboutPageProps extends InfoPageBaseProps {
  members: Member[];
  bookCount: number;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  language,
  onNavigate,
  members,
  bookCount,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <header className="space-y-4 border-b border-stone-200 pb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C45B38]">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'About the Collective · Est. Nov 2025' : 'Topluluk Hakkında · Kuruluş Kasım 2025'}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-stone-900">
          {language === 'en' ? 'About Books & Friends' : 'Books & Friends Hakkında'}
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-light max-w-2xl">
          {language === 'en'
            ? 'Books & Friends (The Six) is an intimate private book club connecting six readers across Istanbul, Dubai, New York, and San Francisco around one carefully chosen book each month.'
            : 'Books & Friends (Altılar), İstanbul, Dubai, New York ve San Francisco arasında yaşayan altı okuru her ay özenle seçilmiş tek bir kitap etrafında buluşturan özel bir okuma topluluğudur.'}
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-3">
          <h2 className="font-serif text-2xl font-medium text-stone-900">
            {language === 'en' ? 'Depth Over Velocity' : 'Hız Yerine Derinlik'}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {language === 'en'
              ? `Rather than rushing through annual reading quotas, our circle has shared ${bookCount} curated volumes together—pairing physical editions with unhurried monthly salon discussions, video reflections, and cross-disciplinary notes.`
              : `Yıllık okuma kotalarını hızla tüketmek yerine, bugüne dek ${bookCount} seçkin eseri birlikte okuduk; basılı edisyonları aylık derin salon sohbetleri, video değerlendirmeleri ve disiplinlerarası notlarla buluşturuyoruz.`}
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-3">
          <h2 className="font-serif text-2xl font-medium text-stone-900">
            {language === 'en' ? 'Editorial Leadership' : 'Kürasyon ve Yönetim'}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {language === 'en'
              ? 'Founded by Cemre Şirin and curated by Eda Aydoğan, each month one member nominates a book that permanently shifted their perspective—spanning contemporary fiction, philosophy, memoir, and urban history.'
              : 'Cemre Şirin tarafından kurulan ve Eda Aydoğan küratörlüğünde sürdürülen kulübümüzde her ay bir üye, çağdaş kurgudan felsefeye ve kent tarihine uzanan bir başucu kitabı önerir.'}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-medium text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C45B38]" />
            <span>{language === 'en' ? 'The Curating Members' : 'Küratör Üyeler'}</span>
          </h2>
          <a
            href="/members"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('members');
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#C45B38] hover:underline"
          >
            <span>{language === 'en' ? 'View Full Shelves' : 'Tüm Rafları Gör'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 bg-white rounded-xl border border-stone-200 flex items-start justify-between gap-3"
            >
              <div>
                <a
                  href={`/members/${member.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('members', member.id);
                  }}
                  className="font-serif text-lg font-semibold text-stone-900 hover:text-[#C45B38] transition-colors"
                >
                  {member.name}
                </a>
                <p className="text-xs text-stone-500 mt-0.5">{getMemberRole(member, language)}</p>
              </div>
              {member.linkedinUrl && (
                <a
                  href={member.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-stone-700 p-1"
                  aria-label={`${member.name} LinkedIn`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="p-6 bg-[#F7F4EE] rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif text-xl font-medium text-stone-900">
            {language === 'en' ? 'Explore Our Collective Library' : 'Ortak Kitaplığımızı Keşfedin'}
          </h2>
          <p className="text-xs text-stone-600">
            {language === 'en'
              ? 'Read our Book of the Month notes or get in touch for salon dispatches.'
              : 'Ayın Kitabı notlarımızı inceleyin veya bülten ve salon davetleri için bizimle iletişime geçin.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            {language === 'en' ? 'The Bookshelf' : 'Kitaplık'}
          </a>
          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('contact');
            }}
            className="px-4 py-2 text-xs font-semibold bg-white text-stone-900 border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors"
          >
            {language === 'en' ? 'Contact Salon' : 'İletişim'}
          </a>
        </div>
      </section>
    </div>
  );
};

interface ContactPageProps extends InfoPageBaseProps {
  onOpenNewsletter: () => void;
  onSubmitNewsletter: (app: Omit<ReferralApplication, 'id' | 'status' | 'submittedAt'>) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  language,
  onOpenNewsletter,
  onSubmitNewsletter,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSubmitNewsletter({
      applicantName: name.trim(),
      applicantEmail: email.trim(),
      referringMemberId: 'newsletter',
      referringMemberName: 'Books & Friends Salon',
      reason: message.trim() || 'Direct salon contact & newsletter dispatch request',
      favoriteBook: 'Salon Dispatch',
      submissionType: 'newsletter',
    });
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      <header className="space-y-4 border-b border-stone-200 pb-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C45B38]">
          <Mail className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Correspondence & Guest Access' : 'İletişim ve Misafir Katılımı'}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-stone-900">
          {language === 'en' ? 'Contact Books & Friends' : 'Books & Friends İletişim'}
        </h1>
        <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-light max-w-2xl">
          {language === 'en'
            ? 'Reach our editorial curators directly for book suggestions, salon collaborations, press notes, or newsletter subscriptions.'
            : 'Kitap önerileri, salon iş birlikleri, bülten abonelikleri veya genel sorularınız için editörlerimizle doğrudan iletişime geçebilirsiniz.'}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-4">
          <h2 className="font-serif text-2xl font-medium text-stone-900">
            {language === 'en' ? 'Direct Curatorial Email' : 'Doğrudan Editör E-postası'}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            {language === 'en'
              ? 'All editorial inquiries, affiliate partnership questions, and membership referrals are managed by curator Eda Aydoğan.'
              : 'Tüm editoryal yazışmalar, satış ortaklığı soruları ve üyelik referansları küratör Eda Aydoğan tarafından yanıtlanmaktadır.'}
          </p>
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
            <div>
              <span className="font-mono uppercase text-stone-500 block text-[10px]">
                {language === 'en' ? 'Email' : 'E-posta'}
              </span>
              <a
                href="mailto:edaydogannn@gmail.com"
                className="font-mono text-sm font-semibold text-[#C45B38] hover:underline"
              >
                edaydogannn@gmail.com
              </a>
            </div>
            <div>
              <span className="font-mono uppercase text-stone-500 block text-[10px]">
                {language === 'en' ? 'Salon Chapters' : 'Salon Şehirleri'}
              </span>
              <p className="text-stone-800 font-medium flex items-center gap-1.5 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <span>Istanbul · Dubai · New York · San Francisco</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenNewsletter}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {language === 'en' ? 'Open Guest Referral & Newsletter Portal' : 'Referans ve Bülten Portalını Aç'}
          </button>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-4">
          <h2 className="font-serif text-2xl font-medium text-stone-900">
            {language === 'en' ? 'Salon Dispatch Signup' : 'Salon Bülteni Kaydı'}
          </h2>
          {submitted ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>{language === 'en' ? 'Message & Signup Received!' : 'Mesajınız Alındı!'}</span>
              </div>
              <p>
                {language === 'en'
                  ? 'Thank you for connecting with Books & Friends. You have been added to our Salon Dispatch.'
                  : 'Books & Friends ile iletişime geçtiğiniz için teşekkürler. Bülten listemize eklendiniz.'}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-3"
              toolname="submit_newsletter_signup"
              tooldescription="Subscribe to the Books & Friends monthly reading salon dispatch and send a brief note."
            >
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  {language === 'en' ? 'Your Name *' : 'Adınız Soyadınız *'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={language === 'en' ? 'Full name' : 'Ad Soyad'}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  {language === 'en' ? 'Email Address *' : 'E-posta Adresi *'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@domain.com"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  {language === 'en' ? 'Literary Interests or Message' : 'İlgi Alanları veya Mesajınız'}
                </label>
                <textarea
                  name="interests"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'en' ? 'Share genres or a note for the curators...' : 'Okuma zevkinizi veya notunuzu paylaşın...'}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:border-[#C45B38]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#C45B38] hover:bg-[#a94827] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Send & Subscribe' : 'Gönder ve Kaydol'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const TermsPage: React.FC<InfoPageBaseProps> = ({ language, onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <header className="space-y-3 border-b border-stone-200 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C45B38]">
          <FileText className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Legal & Editorial Standards' : 'Yasal Koşullar ve İlkeler'}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-stone-900">
          {language === 'en' ? 'Terms of Use' : 'Kullanım Koşulları'}
        </h1>
        <p className="text-xs font-mono text-stone-500">
          {language === 'en' ? 'Last updated: November 2026 · Books & Friends' : 'Son güncelleme: Kasım 2026 · Books & Friends'}
        </p>
      </header>

      <div className="space-y-6 text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            {language === 'en' ? '1. Purpose of the Platform' : '1. Platformun Amacı'}
          </h2>
          <p>
            {language === 'en'
              ? 'Books & Friends (booksnfriends.com) serves as a digital reading archive, tactile bookshelf, and literary reflection journal for a private six-member book club. Public visitors may browse curated selections, member notes, and subscribe to monthly reading dispatches.'
              : 'Books & Friends (booksnfriends.com), altı üyeli özel kitap kulübümüzün dijital okuma arşivi ve edebi değerlendirme günlüğüdür. Ziyaretçiler seçkileri inceleyebilir ve aylık bültenimize abone olabilir.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            {language === 'en' ? '2. Member Contributions & Intellectual Property' : '2. Üye Katkıları ve Fikri Mülkiyet'}
          </h2>
          <p>
            {language === 'en'
              ? 'Original essays, salon notes, and video reflections published by members remain the intellectual property of their respective authors. Book covers and publisher metadata are displayed strictly for editorial commentary and bibliography reference.'
              : 'Üyeler tarafından paylaşılan özgün notlar ve video değerlendirmeleri ilgili yazarlara aittir. Kitap kapakları yalnızca edebi tanıtım ve bibliyografik referans amacıyla yer alır.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            {language === 'en' ? '3. Affiliate Links Disclosure' : '3. Satış Ortaklığı Bildirimi'}
          </h2>
          <p>
            {language === 'en'
              ? 'Outbound bookstore links (including Amazon TR and Amazon US editions) may use affiliate tags registered to edaydogannn@gmail.com. Qualifying purchases help fund collective library acquisitions at no extra cost to readers.'
              : 'Kitap satın alma bağlantıları (Amazon TR ve Amazon US), edaydogannn@gmail.com adına kayıtlı satış ortaklığı etiketleri içerebilir ve elde edilen gelir kulüp kütüphanesi için kullanılır.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            {language === 'en' ? '4. Contact & Notices' : '4. İletişim'}
          </h2>
          <p>
            {language === 'en' ? 'Questions regarding these terms may be directed to ' : 'Koşullarla ilgili sorularınız için '}
            <a href="mailto:edaydogannn@gmail.com" className="text-[#C45B38] underline font-mono text-xs">
              edaydogannn@gmail.com
            </a>
            {language === 'en' ? ' or via our ' : ' adresine veya '}
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('contact');
              }}
              className="text-stone-900 underline font-medium"
            >
              {language === 'en' ? 'Contact page' : 'İletişim sayfamıza'}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export const PrivacyPage: React.FC<InfoPageBaseProps> = ({ language, onNavigate }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <header className="space-y-3 border-b border-stone-200 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C45B38]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Data Stewardship' : 'Veri Koruma İlkeleri'}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-stone-900">
          {language === 'en' ? 'Privacy Policy' : 'Gizlilik Politikası'}
        </h1>
        <p className="text-xs font-mono text-stone-500">
          {language === 'en' ? 'Last updated: November 2026 · Books & Friends' : 'Son güncelleme: Kasım 2026 · Books & Friends'}
        </p>
      </header>

      <div className="space-y-6 text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            {language === 'en' ? '1. Information We Collect' : '1. Toplanan Bilgiler'}
          </h2>
          <p>
            {language === 'en'
              ? 'We collect only information you voluntarily submit: newsletter subscription details (name, email, reading interests), guest referral requests, and member profile updates for authenticated club members.'
              : 'Yalnızca gönüllü olarak paylaştığınız verileri (bülten kayıtları, referans başvuruları ve giriş yapmış üye profil düzenlemeleri) işliyoruz.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            {language === 'en' ? '2. Google Workspace Integration' : '2. Google Workspace Entegrasyonu'}
          </h2>
          <p>
            {language === 'en'
              ? 'Authorized curators may optionally connect Google Workspace (Gmail and Google Forms) via client-side OAuth solely to send club dispatches or synchronize club survey responses. We never sell or share user data with third-party advertisers.'
              : 'Yetkili küratörler isteğe bağlı olarak Gmail ve Google Forms entegrasyonunu yalnızca bülten gönderimi ve form senkronizasyonu amacıyla kullanabilir. Veriler asla üçüncü taraflara satılmaz.'}
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-stone-900">
            {language === 'en' ? '3. Data Removal Requests' : '3. Veri Silme Talepleri'}
          </h2>
          <p>
            {language === 'en'
              ? 'You may request access to, correction of, or removal of your newsletter or referral submission at any time by emailing '
              : 'Bülten veya başvuru verilerinizin silinmesini talep etmek için dilediğiniz zaman '}
            <a href="mailto:edaydogannn@gmail.com" className="text-[#C45B38] underline font-mono text-xs">
              edaydogannn@gmail.com
            </a>
            {language === 'en' ? '.' : ' adresine yazabilir veya '}
            {language === 'tr' && (
              <a
                href="/terms"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('terms');
                }}
                className="text-stone-900 underline font-medium"
              >
                Kullanım Koşullarımızı
              </a>
            )}
            {language === 'tr' ? ' inceleyebilirsiniz.' : null}
          </p>
        </section>
      </div>
    </div>
  );
};
