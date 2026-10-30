// Shared API Client for Books & Friends
// Synchronizes data across all sessions, visitors, and devices with backend storage

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

export async function fetchClubData(): Promise<ClubStorePayload | null> {
  try {
    const res = await fetch('/api/data', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.books) && Array.isArray(data.members)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend store fetch error, using local fallback:', err);
  }
  return null;
}

export async function saveClubData(payload: ClubStorePayload): Promise<ApiResponse> {
  try {
    const res = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      broadcastSync('SAVE_CLUB_DATA', data);
      return data;
    }
    return { success: false, error: `Server error: ${res.status}` };
  } catch (err: any) {
    console.error('Failed to save club data to server:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function saveBookApi(book: Book): Promise<ApiResponse<{ book: Book; books: Book[] }>> {
  try {
    const res = await fetch('/api/data/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(book),
    });
    if (res.ok) {
      const data = await res.json();
      broadcastSync('SAVE_BOOK', data);
      return data;
    }
    return { success: false, error: `Server error: ${res.status}` };
  } catch (err: any) {
    console.error('Failed to save book to server:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function deleteBookApi(bookId: string): Promise<ApiResponse<{ books: Book[] }>> {
  try {
    const res = await fetch(`/api/data/book/${encodeURIComponent(bookId)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      broadcastSync('DELETE_BOOK', data);
      return data;
    }
    return { success: false, error: `Server error: ${res.status}` };
  } catch (err: any) {
    console.error('Failed to delete book on server:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function saveMemberApi(member: Member): Promise<ApiResponse<{ member: Member; members: Member[] }>> {
  try {
    const res = await fetch('/api/data/member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    if (res.ok) {
      const data = await res.json();
      broadcastSync('SAVE_MEMBER', data);
      return data;
    }
    return { success: false, error: `Server error: ${res.status}` };
  } catch (err: any) {
    console.error('Failed to save member to server:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function saveSiteContentApi(siteContent: SiteContent): Promise<ApiResponse<{ siteContent: SiteContent }>> {
  try {
    const res = await fetch('/api/data/site-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteContent),
    });
    if (res.ok) {
      const data = await res.json();
      broadcastSync('SAVE_SITE_CONTENT', data);
      return data;
    }
    return { success: false, error: `Server error: ${res.status}` };
  } catch (err: any) {
    console.error('Failed to save site content to server:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function addCommentApi(bookId: string, comment: BookComment): Promise<ApiResponse<{ books: Book[] }>> {
  try {
    const res = await fetch('/api/data/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, comment }),
    });
    if (res.ok) {
      const data = await res.json();
      broadcastSync('ADD_COMMENT', data);
      return data;
    }
    return { success: false, error: `Server error: ${res.status}` };
  } catch (err: any) {
    console.error('Failed to add comment to server:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function updateVideoApi(bookId: string, videoReview: VideoReview): Promise<ApiResponse<{ books: Book[] }>> {
  try {
    const res = await fetch('/api/data/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, videoReview }),
    });
    if (res.ok) {
      const data = await res.json();
      broadcastSync('UPDATE_VIDEO', data);
      return data;
    }
    return { success: false, error: `Server error: ${res.status}` };
  } catch (err: any) {
    console.error('Failed to update video to server:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function addReferralApi(referral: ReferralApplication): Promise<ApiResponse<{ referral: ReferralApplication; referrals: ReferralApplication[] }>> {
  try {
    const res = await fetch('/api/data/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(referral),
    });
    if (res.ok) {
      const data = await res.json();
      broadcastSync('ADD_REFERRAL', data);
      return data;
    }
    return { success: false, error: `Server error: ${res.status}` };
  } catch (err: any) {
    console.error('Failed to submit referral to server:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

export async function updateReferralStatusApi(id: string, status: 'approved' | 'declined'): Promise<ApiResponse<{ referrals: ReferralApplication[] }>> {
  try {
    const res = await fetch(`/api/data/referral/${encodeURIComponent(id)}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      broadcastSync('UPDATE_REFERRAL_STATUS', data);
      return data;
    }
    return { success: false, error: `Server error: ${res.status}` };
  } catch (err: any) {
    console.error('Failed to update referral status on server:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}
