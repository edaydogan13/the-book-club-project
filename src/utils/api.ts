// Shared data layer for Books & Friends, backed by Cloud Firestore.
//
// Why Firestore: the site is deployed as static files on Hostinger, so the old Express
// endpoints (/api/data, ...) returned 404 and nothing could be saved. Firestore is a hosted
// database that the browser can reach directly, so edits are shared across all visitors/devices.
//
// Layout (one document per item so a single edit never rewrites the whole club):
//   books/{id}        -> Book (+ _idx, used only to keep a stable display order)
//   members/{id}      -> Member (+ _idx)
//   referrals/{id}    -> ReferralApplication (+ _idx, newest first)
//   siteContent/main  -> SiteContent
//   meta/store        -> { lastUpdated, seeded } bumped after every write; clients poll this one tiny
//                        document and only re-download the collections when it changes.
//
// The exported function names and return shapes are unchanged from the Express version.

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  runTransaction,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Book, Member, SiteContent, ReferralApplication, BookComment, VideoReview } from '../types';

export interface ClubStorePayload {
  books: Book[];
  members: Member[];
  siteContent: SiteContent;
  referrals: ReferralApplication[];
  lastUpdated?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  books?: Book[];
  book?: Book;
  members?: Member[];
  member?: Member;
  siteContent?: SiteContent;
  referrals?: ReferralApplication[];
  referral?: ReferralApplication;
  lastUpdated?: string;
  error?: string;
}

/**
 * Broadcasts mutation events to other open tabs on the same device
 */
export function broadcastSync(action: string, payload?: any) {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('the-six-sync');
      channel.postMessage({ action, payload, timestamp: Date.now() });
      channel.close();
    } catch {
      // BroadcastChannel not available or restricted
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Row = Record<string, any>;

const MAX_DOC_BYTES = 900_000; // Firestore's hard limit is 1 MiB per document

const metaRef = () => doc(db, 'meta', 'store');
const siteRef = () => doc(db, 'siteContent', 'main');
const docKey = (id: string) => String(id).replace(/[\/\s]/g, '_');

/** Firestore rejects undefined values; a JSON round-trip drops those fields. */
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function assertFits(label: string, value: unknown) {
  const size = JSON.stringify(value).length;
  if (size > MAX_DOC_BYTES) {
    throw new Error(label + ' is too large to store (' + Math.round(size / 1024) + ' KB). Use a smaller image.');
  }
}

function errorOf(err: any, fallback: string): ApiResponse {
  return { success: false, error: err?.message || fallback };
}

async function readCollection<T = any>(name: string): Promise<T[]> {
  const snap = await getDocs(collection(db, name));
  const rows: Row[] = snap.docs.map(d => d.data());
  rows.sort((a, b) => (a._idx ?? 0) - (b._idx ?? 0));
  return rows.map(({ _idx, ...rest }) => rest) as T[];
}

async function readSnapshotRows(name: string) {
  const snap = await getDocs(collection(db, name));
  return snap.docs;
}

/** True once the first full copy of the site data has been written (see seedStoreIfEmpty). */
async function isSeeded(): Promise<boolean> {
  const meta = await getDocFromServer(metaRef());
  return meta.exists() && meta.data().seeded === true;
}

const NOT_SEEDED = 'The shared database has not been initialised yet. Log in as admin once to migrate the site data.';

async function touchMeta(markSeeded = false): Promise<string> {
  const lastUpdated = new Date().toISOString();
  await setDoc(metaRef(), markSeeded ? { lastUpdated, seeded: true } : { lastUpdated }, { merge: true });
  cache = null;
  return lastUpdated;
}

let cache: ClubStorePayload | null = null;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/**
 * Returns the shared club data, or null when the store has not been created yet
 * (or Firestore is unreachable). Costs a single document read per call unless
 * something changed since the last call.
 */
export async function fetchClubData(): Promise<ClubStorePayload | null> {
  try {
    const meta = await getDocFromServer(metaRef());
    // A single early write (e.g. a background translation patch) must not make a half-empty store look real.
    if (!meta.exists() || meta.data().seeded !== true) return null;
    const lastUpdated = meta.data().lastUpdated as string;
    if (cache && cache.lastUpdated === lastUpdated) return cache;

    const [books, members, referrals, siteSnap] = await Promise.all([
      readCollection<Book>('books'),
      readCollection<Member>('members'),
      readCollection<ReferralApplication>('referrals').catch(() => [] as ReferralApplication[]),
      getDoc(siteRef()),
    ]);
    const payload: ClubStorePayload = {
      books,
      members,
      referrals,
      siteContent: (siteSnap.exists() ? siteSnap.data() : {}) as SiteContent,
      lastUpdated,
    };
    cache = payload;
    return payload;
  } catch (err) {
    console.warn('Shared store fetch error, using local fallback:', err);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Bulk write (replace books/members, upsert referrals + site content)
// ---------------------------------------------------------------------------

async function commitInChunks(ops: Array<(batch: ReturnType<typeof writeBatch>) => void>) {
  for (let i = 0; i < ops.length; i += 400) {
    const batch = writeBatch(db);
    ops.slice(i, i + 400).forEach(op => op(batch));
    await batch.commit();
  }
}

export async function saveClubData(payload: ClubStorePayload): Promise<ApiResponse> {
  try {
    const ops: Array<(batch: ReturnType<typeof writeBatch>) => void> = [];

    const replaceCollection = async (name: string, items: Row[] | undefined, deleteMissing: boolean) => {
      if (!Array.isArray(items)) return;
      const keep = new Set<string>();
      items.forEach((item, index) => {
        const key = docKey(item.id);
        keep.add(key);
        const data = { ...clean(item), _idx: index };
        assertFits(name + '/' + item.id, data);
        ops.push(batch => batch.set(doc(db, name, key), data));
      });
      if (deleteMissing) {
        const existing = await readSnapshotRows(name);
        existing.forEach(d => {
          if (!keep.has(d.id)) ops.push(batch => batch.delete(d.ref));
        });
      }
    };

    await replaceCollection('books', payload.books, true);
    await replaceCollection('members', payload.members, true);
    // Referrals are submitted by visitors in the meantime, so never delete them from a bulk save.
    await replaceCollection('referrals', payload.referrals, false);

    if (payload.siteContent) {
      const site = clean(payload.siteContent);
      assertFits('siteContent', site);
      ops.push(batch => batch.set(siteRef(), site));
    }

    await commitInChunks(ops);
    const lastUpdated = await touchMeta(true);
    const data = { ...payload, lastUpdated };
    broadcastSync('SAVE_CLUB_DATA', data);
    return { success: true, data, lastUpdated };
  } catch (err: any) {
    console.error('Failed to save club data:', err);
    return errorOf(err, 'Network error');
  }
}

/**
 * One-time migration: if the shared store has never been written, copy the given
 * (browser-local) data into it. Does nothing when the store already exists.
 */
export async function seedStoreIfEmpty(payload: ClubStorePayload): Promise<{ seeded: boolean; error?: string }> {
  try {
    if (await isSeeded()) return { seeded: false };
    const res = await saveClubData(payload);
    return res.success ? { seeded: true } : { seeded: false, error: res.error };
  } catch (err: any) {
    console.error('Failed to seed shared store:', err);
    return { seeded: false, error: err?.message || 'Network error' };
  }
}

// ---------------------------------------------------------------------------
// Books
// ---------------------------------------------------------------------------

export async function saveBookApi(book: Book): Promise<ApiResponse<{ book: Book; books: Book[] }>> {
  try {
    if (!(await isSeeded())) return { success: false, error: NOT_SEEDED };
    const docs = await readSnapshotRows('books');
    const key = docKey(book.id);
    const existing = docs.find(d => d.id === key);
    const minIdx = docs.reduce((min, d) => Math.min(min, d.data()._idx ?? 0), 0);
    const data = { ...clean(book), _idx: existing ? existing.data()._idx ?? 0 : minIdx - 1 };
    assertFits('Book "' + book.title + '"', data);

    const batch = writeBatch(db);
    batch.set(doc(db, 'books', key), data);
    if (book.isBookOfMonth) {
      docs.forEach(d => {
        if (d.id !== key && d.data().isBookOfMonth) batch.update(d.ref, { isBookOfMonth: false });
      });
    }
    await batch.commit();

    const lastUpdated = await touchMeta();
    const result = { success: true, book, books: await readCollection<Book>('books'), lastUpdated };
    broadcastSync('SAVE_BOOK', result);
    return result;
  } catch (err: any) {
    console.error('Failed to save book:', err);
    return errorOf(err, 'Network error');
  }
}

export async function deleteBookApi(bookId: string): Promise<ApiResponse<{ books: Book[] }>> {
  try {
    if (!(await isSeeded())) return { success: false, error: NOT_SEEDED };
    await deleteDoc(doc(db, 'books', docKey(bookId)));
    const lastUpdated = await touchMeta();
    const result = { success: true, books: await readCollection<Book>('books'), lastUpdated };
    broadcastSync('DELETE_BOOK', result);
    return result;
  } catch (err: any) {
    console.error('Failed to delete book:', err);
    return errorOf(err, 'Network error');
  }
}

export async function addCommentApi(bookId: string, comment: BookComment): Promise<ApiResponse<{ books: Book[] }>> {
  try {
    if (!(await isSeeded())) return { success: false, error: NOT_SEEDED };
    const ref = doc(db, 'books', docKey(bookId));
    await runTransaction(db, async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists()) throw new Error('Book not found');
      const comments = Array.isArray(snap.data().comments) ? snap.data().comments : [];
      tx.update(ref, { comments: [clean(comment), ...comments] });
    });
    const lastUpdated = await touchMeta();
    const result = { success: true, books: await readCollection<Book>('books'), lastUpdated };
    broadcastSync('ADD_COMMENT', result);
    return result;
  } catch (err: any) {
    console.error('Failed to add comment:', err);
    return errorOf(err, 'Network error');
  }
}

export async function updateVideoApi(bookId: string, videoReview: VideoReview): Promise<ApiResponse<{ books: Book[] }>> {
  try {
    if (!(await isSeeded())) return { success: false, error: NOT_SEEDED };
    const video = clean(videoReview);
    assertFits('Video review', video);
    await updateDoc(doc(db, 'books', docKey(bookId)), { videoReview: video });
    const lastUpdated = await touchMeta();
    const result = { success: true, books: await readCollection<Book>('books'), lastUpdated };
    broadcastSync('UPDATE_VIDEO', result);
    return result;
  } catch (err: any) {
    console.error('Failed to update video:', err);
    return errorOf(err, 'Network error');
  }
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export async function saveMemberApi(member: Member): Promise<ApiResponse<{ member: Member; members: Member[] }>> {
  try {
    if (!(await isSeeded())) return { success: false, error: NOT_SEEDED };
    const docs = await readSnapshotRows('members');
    const key = docKey(member.id);
    const existing = docs.find(d => d.id === key);
    const maxIdx = docs.reduce((max, d) => Math.max(max, d.data()._idx ?? 0), -1);
    const data = { ...clean(member), _idx: existing ? existing.data()._idx ?? 0 : maxIdx + 1 };
    assertFits('Member "' + member.name + '"', data);

    await setDoc(doc(db, 'members', key), data);
    const lastUpdated = await touchMeta();
    const result = { success: true, member, members: await readCollection<Member>('members'), lastUpdated };
    broadcastSync('SAVE_MEMBER', result);
    return result;
  } catch (err: any) {
    console.error('Failed to save member:', err);
    return errorOf(err, 'Network error');
  }
}

// ---------------------------------------------------------------------------
// Site content
// ---------------------------------------------------------------------------

export async function saveSiteContentApi(siteContent: SiteContent): Promise<ApiResponse<{ siteContent: SiteContent }>> {
  try {
    if (!(await isSeeded())) return { success: false, error: NOT_SEEDED };
    const site = clean(siteContent);
    assertFits('Site content', site);
    await setDoc(siteRef(), site);
    const lastUpdated = await touchMeta();
    const result = { success: true, siteContent, lastUpdated };
    broadcastSync('SAVE_SITE_CONTENT', result);
    return result;
  } catch (err: any) {
    console.error('Failed to save site content:', err);
    return errorOf(err, 'Network error');
  }
}

// ---------------------------------------------------------------------------
// Referrals
// ---------------------------------------------------------------------------

export async function addReferralApi(referral: ReferralApplication): Promise<ApiResponse<{ referral: ReferralApplication; referrals?: ReferralApplication[] }>> {
  try {
    // Negative timestamp => ascending sort shows the newest application first.
    const data = { ...clean(referral), _idx: -Date.now() };
    assertFits('Referral', data);
    await setDoc(doc(db, 'referrals', docKey(referral.id)), data);
    let lastUpdated = new Date().toISOString();
    try {
      lastUpdated = await touchMeta();
    } catch {
      // Public visitors may not have write permission on meta/store
    }
    let referrals: ReferralApplication[] | undefined;
    try {
      referrals = await readCollection<ReferralApplication>('referrals');
    } catch {
      // Public visitors cannot list all referrals when PII read rules are restricted to admins
    }
    const result = { success: true, referral, referrals, lastUpdated };
    broadcastSync('ADD_REFERRAL', result);
    return result;
  } catch (err: any) {
    console.error('Failed to submit referral:', err);
    return errorOf(err, 'Network error');
  }
}

export async function updateReferralStatusApi(id: string, status: 'approved' | 'declined'): Promise<ApiResponse<{ referrals: ReferralApplication[] }>> {
  try {
    if (!(await isSeeded())) return { success: false, error: NOT_SEEDED };
    await updateDoc(doc(db, 'referrals', docKey(id)), { status });
    const lastUpdated = await touchMeta();
    const result = { success: true, referrals: await readCollection<ReferralApplication>('referrals'), lastUpdated };
    broadcastSync('UPDATE_REFERRAL_STATUS', result);
    return result;
  } catch (err: any) {
    console.error('Failed to update referral status:', err);
    return errorOf(err, 'Network error');
  }
}
