import { Book, Member, PageView } from '../types';

export interface WebMcpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (input: Record<string, unknown>, client?: unknown) => Promise<unknown> | unknown;
}

export interface NavigatorModelContext {
  registerTool?: (tool: WebMcpToolDefinition) => void;
  unregisterTool?: (name: string) => void;
  provideContext?: (context: { tools?: WebMcpToolDefinition[] }) => void;
}

declare global {
  interface Navigator {
    modelContext?: NavigatorModelContext;
  }
}

declare module 'react' {
  interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    toolname?: string;
    tooldescription?: string;
  }
}

export interface WebMcpBindings {
  getBooks: () => Book[];
  getMembers: () => Member[];
  navigate: (view: PageView, memberId?: string) => void;
  submitNewsletter: (input: { name: string; email: string; interests?: string }) => Promise<void>;
}

const TOOL_NAMES = [
  'list_books',
  'get_book_of_the_month',
  'list_members',
  'navigate_salon',
  'submit_newsletter_signup',
] as const;

export function registerWebMcpTools(bindings: WebMcpBindings): () => void {
  if (typeof navigator === 'undefined') return () => {};
  const modelContext = navigator.modelContext;
  if (!modelContext) return () => {};

  const tools: WebMcpToolDefinition[] = [
    {
      name: 'list_books',
      description:
        'List or search curated books in the Books & Friends collective library, including titles, authors, curating members, and ratings.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Optional case-insensitive filter matching title, author, or genre.',
          },
          curator: {
            type: 'string',
            description: 'Optional curating member name or ID.',
          },
        },
      },
      execute: async (input) => {
        const query = typeof input?.query === 'string' ? input.query.trim().toLowerCase() : '';
        const curator = typeof input?.curator === 'string' ? input.curator.trim().toLowerCase() : '';
        const results = bindings.getBooks().filter((book) => {
          const matchesQuery =
            !query ||
            book.title.toLowerCase().includes(query) ||
            (book.titleEn || '').toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.genre.toLowerCase().includes(query) ||
            (book.genreEn || '').toLowerCase().includes(query);
          const matchesCurator =
            !curator ||
            book.suggesterId.toLowerCase() === curator ||
            book.suggesterName.toLowerCase().includes(curator);
          return matchesQuery && matchesCurator;
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                results.map((b) => ({
                  id: b.id,
                  title: b.titleEn || b.title,
                  titleTr: b.title,
                  author: b.author,
                  genre: b.genreEn || b.genre,
                  pages: b.pages,
                  year: b.year,
                  curator: b.suggesterName,
                  isBookOfMonth: Boolean(b.isBookOfMonth),
                  rating: b.rating,
                })),
                null,
                2
              ),
            },
          ],
        };
      },
    },
    {
      name: 'get_book_of_the_month',
      description:
        'Retrieve full details, synopsis, discussion themes, and member reflections for the current Books & Friends Book of the Month.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        const books = bindings.getBooks();
        const current = books.find((b) => b.isBookOfMonth) || books[0];
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(current || null, null, 2),
            },
          ],
        };
      },
    },
    {
      name: 'list_members',
      description:
        'List the Books & Friends curating members, their roles, reading goals, currently reading books, and LinkedIn profiles.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        const members = bindings.getMembers();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                members.map((m) => ({
                  id: m.id,
                  name: m.name,
                  role: m.roleEn || m.role,
                  bio: m.bioEn || m.bio,
                  readingGoal2026: m.readingGoal2026En || m.readingGoal2026,
                  currentlyReading: m.currentlyReadingEn || m.currentlyReading,
                  linkedinUrl: m.linkedinUrl,
                  shelfCount: m.books.length,
                })),
                null,
                2
              ),
            },
          ],
        };
      },
    },
    {
      name: 'navigate_salon',
      description:
        'Navigate the Books & Friends website to a specific page (home, book-of-month, members, about, contact, terms, privacy) and optionally select a member profile.',
      inputSchema: {
        type: 'object',
        properties: {
          view: {
            type: 'string',
            enum: ['home', 'book-of-month', 'members', 'about', 'contact', 'terms', 'privacy'],
            description: 'Target view to display.',
          },
          memberId: {
            type: 'string',
            description: 'Optional member ID when navigating to members.',
          },
        },
        required: ['view'],
      },
      execute: async (input) => {
        const validViews: PageView[] = [
          'home',
          'book-of-month',
          'members',
          'about',
          'contact',
          'terms',
          'privacy',
        ];
        const view = validViews.includes(input?.view as PageView) ? (input.view as PageView) : 'home';
        const memberId = typeof input?.memberId === 'string' ? input.memberId : undefined;
        bindings.navigate(view, memberId);
        return {
          content: [
            {
              type: 'text',
              text: `Navigated to ${view}${memberId ? ` (member: ${memberId})` : ''}.`,
            },
          ],
        };
      },
    },
    {
      name: 'submit_newsletter_signup',
      description: 'Subscribe a reader to the Books & Friends monthly Salon Dispatch newsletter.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Subscriber full name' },
          email: { type: 'string', description: 'Subscriber email address' },
          interests: { type: 'string', description: 'Optional literary genres or topics of interest' },
        },
        required: ['name', 'email'],
      },
      execute: async (input) => {
        const name = typeof input?.name === 'string' ? input.name.trim() : '';
        const email = typeof input?.email === 'string' ? input.email.trim() : '';
        const interests = typeof input?.interests === 'string' ? input.interests.trim() : '';
        if (!name || !email) {
          throw new Error('Both name and email are required to subscribe.');
        }
        await bindings.submitNewsletter({ name, email, interests });
        return {
          content: [
            {
              type: 'text',
              text: `Subscribed ${name} (${email}) to the Books & Friends monthly Salon Dispatch.`,
            },
          ],
        };
      },
    },
  ];

  if (typeof modelContext.registerTool === 'function') {
    for (const tool of tools) {
      try {
        modelContext.unregisterTool?.(tool.name);
        modelContext.registerTool(tool);
      } catch {
        // Ignore duplicate registration errors across hot reloads
      }
    }
  } else if (typeof modelContext.provideContext === 'function') {
    try {
      modelContext.provideContext({ tools });
    } catch {
      // Ignore unsupported context error
    }
  }

  return () => {
    if (typeof modelContext.unregisterTool === 'function') {
      for (const name of TOOL_NAMES) {
        try {
          modelContext.unregisterTool(name);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  };
}
