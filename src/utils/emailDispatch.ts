export const CONTACT_EMAIL = 'hello@booksnfriends.com';

export interface EmailDispatchParams {
  submissionType: 'newsletter' | 'referral' | 'contact';
  name: string;
  email: string;
  subject: string;
  message: string;
  referringMember?: string;
  favoriteBook?: string;
}

export interface EmailDispatchResult {
  delivered: boolean;
  needsActivation: boolean;
  message: string;
}

export function buildMailtoHref(subject: string, body: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function dispatchSubmissionEmail(
  params: EmailDispatchParams
): Promise<EmailDispatchResult> {
  const endpoint = `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;
  const payload: Record<string, string> = {
    name: params.name,
    email: params.email,
    _replyto: params.email,
    _subject: params.subject,
    _template: 'table',
    _captcha: 'false',
    submissionType: params.submissionType,
    submittedAt: new Date().toISOString(),
    message: params.message,
  };

  if (params.referringMember) {
    payload.referringMember = params.referringMember;
  }
  if (params.favoriteBook) {
    payload.favoriteBook = params.favoriteBook;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    const rawMsg = typeof data?.message === 'string' ? data.message : '';
    const isSuccessFlag = data?.success === true || data?.success === 'true';
    const needsActivation = /activat/i.test(rawMsg);

    return {
      delivered: res.ok && (isSuccessFlag || needsActivation),
      needsActivation,
      message: rawMsg || (res.ok ? 'Submission dispatched.' : `Email relay returned HTTP ${res.status}`),
    };
  } catch (err: any) {
    return {
      delivered: false,
      needsActivation: false,
      message: err?.message || 'Unable to reach email dispatch service.',
    };
  }
}
