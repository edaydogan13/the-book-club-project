import { getAccessToken } from './firebase';

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  internalDate: string;
  from?: string;
  to?: string;
  subject?: string;
  date?: string;
}

export interface GoogleFormQuestion {
  questionId: string;
  title: string;
  type?: string;
}

export interface GoogleFormDetail {
  formId: string;
  info: {
    title: string;
    description?: string;
    documentTitle?: string;
  };
  responderUri?: string;
  items?: Array<{
    itemId: string;
    title?: string;
    description?: string;
    questionItem?: {
      question: {
        questionId: string;
        required?: boolean;
        textQuestion?: any;
        choiceQuestion?: any;
      };
    };
  }>;
}

export interface GoogleFormResponse {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  respondentEmail?: string;
  answers?: Record<string, {
    questionId: string;
    textAnswers?: {
      answers: Array<{ value: string }>;
    };
  }>;
}

export interface DriveFormFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

// ----------------------------------------------------
// GMAIL SERVICE
// ----------------------------------------------------

export async function fetchClubEmails(maxResults: number = 10, query: string = ''): Promise<GmailMessageSummary[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google Workspace not authenticated. Please sign in with Google.');

  const searchParam = query ? `&q=${encodeURIComponent(query)}` : '';
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}${searchParam}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch messages (${res.status})`);
  }

  const listData = await res.json();
  const messages = listData.messages || [];

  const summaries: GmailMessageSummary[] = await Promise.all(
    messages.map(async (m: { id: string; threadId: string }) => {
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(m.id)}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!msgRes.ok) {
        return {
          id: m.id,
          threadId: m.threadId,
          snippet: '',
          internalDate: '',
        };
      }
      const msgData = await msgRes.json();
      const headers: GmailMessageHeader[] = msgData.payload?.headers || [];
      const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
      const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
      const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
      const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';

      return {
        id: m.id,
        threadId: m.threadId,
        snippet: msgData.snippet || '',
        internalDate: msgData.internalDate || '',
        from,
        to,
        subject,
        date,
      };
    })
  );

  return summaries;
}

export async function sendClubEmail(to: string, subject: string, bodyText: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google Workspace not authenticated. Please sign in with Google.');

  // UTF-8 RFC 2822 email format base64url encoded
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    bodyText,
  ];
  const message = messageParts.join('\r\n');

  // Convert to base64url
  const encodedMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to send email (${res.status})`);
  }

  return true;
}

// ----------------------------------------------------
// GOOGLE FORMS SERVICE
// ----------------------------------------------------

export async function listUserGoogleForms(): Promise<DriveFormFile[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google Workspace not authenticated. Please sign in with Google.');

  // Use Google Drive to query forms created by user or shared
  const query = "mimeType='application/vnd.google-apps.form' and trashed=false";
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,webViewLink)&pageSize=25`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to list Google Forms (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

export async function getGoogleForm(formId: string): Promise<GoogleFormDetail> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google Workspace not authenticated. Please sign in with Google.');

  const safeFormId = encodeURIComponent(formId.trim());
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch form (${res.status})`);
  }

  return await res.json();
}

export async function getGoogleFormResponses(formId: string): Promise<GoogleFormResponse[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google Workspace not authenticated. Please sign in with Google.');

  const safeFormId = encodeURIComponent(formId.trim());
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}/responses`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch form responses (${res.status})`);
  }

  const data = await res.json();
  return data.responses || [];
}

export async function createGoogleForm(title: string, description?: string): Promise<GoogleFormDetail> {
  const token = await getAccessToken();
  if (!token) throw new Error('Google Workspace not authenticated. Please sign in with Google.');

  const res = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title,
        documentTitle: title,
        description: description || 'Created from Books & Friends Club Platform',
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create form (${res.status})`);
  }

  const form = await res.json();

  // Add standard initial questions for the book club (e.g. Favorite book nomination, Salon date attendance)
  try {
    const safeFormId = encodeURIComponent(form.formId);
    await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            createItem: {
              item: {
                title: 'Your Name (Member or Guest)',
                questionItem: {
                  question: {
                    required: true,
                    textQuestion: { paragraph: false },
                  },
                },
              },
              location: { index: 0 },
            },
          },
          {
            createItem: {
              item: {
                title: 'Book Nomination / Discussion Topic',
                questionItem: {
                  question: {
                    required: true,
                    textQuestion: { paragraph: true },
                  },
                },
              },
              location: { index: 1 },
            },
          },
          {
            createItem: {
              item: {
                title: 'Salon Attendance Preference',
                questionItem: {
                  question: {
                    required: true,
                    choiceQuestion: {
                      type: 'RADIO',
                      options: [
                        { value: 'In-person Salon Gathering' },
                        { value: 'Virtual Google Meet Salon' },
                        { value: 'Asynchronous Discussion only' },
                      ],
                    },
                  },
                },
              },
              location: { index: 2 },
            },
          },
        ],
      }),
    });
  } catch (err) {
    console.warn('Initial questions could not be added:', err);
  }

  return form;
}
