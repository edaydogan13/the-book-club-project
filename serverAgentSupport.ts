import type { Request } from 'express';

export interface StoreMember {
  id: string;
  name: string;
  role?: string;
  roleEn?: string;
  bio?: string;
  bioEn?: string;
  readingGoal2026?: string;
  readingGoal2026En?: string;
  currentlyReading?: string;
  currentlyReadingEn?: string;
  linkedinUrl?: string;
  books?: StoreBook[];
}

export interface StoreBook {
  id: string;
  title: string;
  titleEn?: string;
  originalTitle?: string;
  author: string;
  year?: number;
  pages?: number;
  genre?: string;
  genreEn?: string;
  synopsis?: string;
  synopsisEn?: string;
  favoriteQuote?: string;
  favoriteQuoteEn?: string;
  suggesterId?: string;
  suggesterName?: string;
  isBookOfMonth?: boolean;
  rating?: number;
  themes?: string[];
  themesEn?: string[];
}

export interface StoreData {
  books?: StoreBook[];
  members?: StoreMember[];
  siteContent?: Record<string, any>;
  lastUpdated?: string;
}

export interface RouteMeta {
  valid: boolean;
  cleanPath: string;
  title: string;
  description: string;
  view: 'home' | 'book-of-month' | 'members' | 'about' | 'contact' | 'terms' | 'privacy';
  member?: StoreMember;
}

const DEFAULT_SAME_AS = [
  'https://www.linkedin.com/in/cemresirin/',
  'https://www.linkedin.com/in/eda-aydogan/',
  'https://www.linkedin.com/in/canmert/',
  'https://www.linkedin.com/in/ferhatbabacan/',
  'https://www.linkedin.com/in/gizemyenicikan/',
  'https://www.linkedin.com/in/gokcenuruysal/',
];

export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function getRequestOrigin(req: Request): string {
  const forwardedHost = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim();
  const host = forwardedHost || req.get('host') || 'booksnfriends.com';
  const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim();
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const proto = forwardedProto || (isLocal ? req.protocol || 'http' : 'https');
  return `${proto}://${host}`;
}

export function buildLinkHeader(origin: string, cleanPath = '/'): string {
  return [
    `<${origin}/llms.txt>; rel="alternate"; type="text/markdown"; title="LLMs Summary"`,
    `<${origin}${cleanPath}>; rel="alternate"; type="text/markdown"; title="Markdown Representation"`,
    `<${origin}/sitemap.xml>; rel="sitemap"; type="application/xml"`,
    `<${origin}/.well-known/mcp/server-card.json>; rel="describedby"; type="application/json"`,
  ].join(', ');
}

export function wantsMarkdown(req: Request): boolean {
  const accept = (req.headers['accept'] || '').toLowerCase();
  if (!accept.includes('text/markdown')) return false;
  if (!accept.includes('text/html')) return true;

  const parts = accept.split(',').map((part) => part.trim());
  let mdScore = -1;
  let htmlScore = -1;

  for (const part of parts) {
    const segments = part.split(';').map((s) => s.trim());
    const mediaType = segments[0];
    let q = 1.0;
    for (const seg of segments.slice(1)) {
      if (seg.startsWith('q=')) {
        const parsed = parseFloat(seg.slice(2));
        if (!Number.isNaN(parsed)) q = parsed;
      }
    }
    if (mediaType === 'text/markdown') mdScore = Math.max(mdScore, q);
    if (mediaType === 'text/html') htmlScore = Math.max(htmlScore, q);
  }

  return mdScore >= htmlScore;
}

export function resolveRouteMeta(reqPath: string, storeData: StoreData | null): RouteMeta {
  const cleanPath = reqPath === '/' ? '/' : reqPath.replace(/\/+$/, '');
  const members = Array.isArray(storeData?.members) ? storeData!.members! : [];

  if (cleanPath === '/') {
    return {
      valid: true,
      cleanPath: '/',
      view: 'home',
      title: 'Books & Friends — Private Book Club & Literary Salon',
      description:
        'An intimate six-member private book club across Istanbul, Dubai, NYC, and San Francisco. Explore our monthly selection, collective bookshelf, and member reading shelves.',
    };
  }

  if (cleanPath === '/book-of-month') {
    const books = Array.isArray(storeData?.books) ? storeData!.books! : [];
    const botm = books.find((b) => b.isBookOfMonth) || books[0];
    const botmTitle = botm ? botm.titleEn || botm.title : 'Book of the Month';
    return {
      valid: true,
      cleanPath: '/book-of-month',
      view: 'book-of-month',
      title: `Book of the Month: ${botmTitle} — Books & Friends`,
      description:
        botm?.synopsisEn ||
        botm?.synopsis ||
        'Explore the current Books & Friends monthly selection, discussion themes, and member reflections.',
    };
  }

  if (cleanPath === '/members') {
    return {
      valid: true,
      cleanPath: '/members',
      view: 'members',
      title: 'Meet the Friends — Books & Friends',
      description:
        'Meet the six curating members of Books & Friends, browse their 2026 reading goals, and explore their personal reading shelves.',
    };
  }

  if (cleanPath.startsWith('/members/')) {
    const rawId = cleanPath.slice('/members/'.length);
    let memberId = rawId;
    try {
      memberId = decodeURIComponent(rawId);
    } catch {
      memberId = rawId;
    }
    const matchedMember = members.find((m) => m.id === memberId);
    if (!matchedMember) {
      return {
        valid: false,
        cleanPath,
        view: 'members',
        title: '404 — Member Not Found — Books & Friends',
        description: 'The requested Books & Friends member profile could not be found.',
      };
    }
    return {
      valid: true,
      cleanPath: `/members/${encodeURIComponent(matchedMember.id)}`,
      view: 'members',
      member: matchedMember,
      title: `${matchedMember.name} — Books & Friends`,
      description:
        matchedMember.bioEn ||
        matchedMember.bio ||
        `${matchedMember.name} (${matchedMember.roleEn || matchedMember.role || 'Member'}) at Books & Friends.`,
    };
  }

  if (cleanPath === '/about') {
    return {
      valid: true,
      cleanPath: '/about',
      view: 'about',
      title: 'About Us — Books & Friends',
      description:
        'Learn about Books & Friends (The Six), an intimate literary collective established in November 2025 across Istanbul, Dubai, NYC, and San Francisco.',
    };
  }

  if (cleanPath === '/contact') {
    return {
      valid: true,
      cleanPath: '/contact',
      view: 'contact',
      title: 'Contact & Inquiries — Books & Friends',
      description:
        'Contact Books & Friends curators at hello@booksnfriends.com for book suggestions, salon dispatches, or guest referral inquiries.',
    };
  }

  if (cleanPath === '/terms') {
    return {
      valid: true,
      cleanPath: '/terms',
      view: 'terms',
      title: 'Terms of Use — Books & Friends',
      description:
        'Editorial guidelines, intellectual property standards, and affiliate disclosure for Books & Friends.',
    };
  }

  if (cleanPath === '/privacy') {
    return {
      valid: true,
      cleanPath: '/privacy',
      view: 'privacy',
      title: 'Privacy Policy — Books & Friends',
      description:
        'Learn how Books & Friends handles newsletter signups, member updates, and optional Google Workspace connections.',
    };
  }

  return {
    valid: false,
    cleanPath,
    view: 'home',
    title: '404 — Page Not Found — Books & Friends',
    description: 'The requested page does not exist on Books & Friends.',
  };
}

export function buildRobotsTxt(origin: string): string {
  return [
    'User-agent: *',
    'Content-Signal: search=yes, ai-input=yes, ai-train=no',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');
}

export function buildSitemapXml(origin: string, storeData: StoreData | null): string {
  const lastmod = (storeData?.lastUpdated || new Date().toISOString()).slice(0, 10);
  const members = Array.isArray(storeData?.members) ? storeData!.members! : [];

  const urls: Array<{ loc: string; changefreq: string; priority: string }> = [
    { loc: `${origin}/`, changefreq: 'weekly', priority: '1.0' },
    { loc: `${origin}/book-of-month`, changefreq: 'monthly', priority: '0.9' },
    { loc: `${origin}/members`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${origin}/about`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${origin}/contact`, changefreq: 'monthly', priority: '0.8' },
    { loc: `${origin}/terms`, changefreq: 'yearly', priority: '0.5' },
    { loc: `${origin}/privacy`, changefreq: 'yearly', priority: '0.5' },
  ];

  for (const m of members) {
    if (m?.id) {
      urls.push({
        loc: `${origin}/members/${encodeURIComponent(m.id)}`,
        changefreq: 'weekly',
        priority: '0.8',
      });
    }
  }

  const urlNodes = urls
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>
`;
}

export function buildLlmsTxt(origin: string, storeData: StoreData | null): string {
  const books = Array.isArray(storeData?.books) ? storeData!.books! : [];
  const members = Array.isArray(storeData?.members) ? storeData!.members! : [];
  const botm = books.find((b) => b.isBookOfMonth) || books[0];

  const lines: string[] = [
    '# Books & Friends',
    '',
    '> An intimate six-member private book club and literary salon across Istanbul, Dubai, New York, and San Francisco, reading one curated book per month since November 2025.',
    '',
    'Founded by Cemre Şirin and curated by Eda Aydoğan. All correspondence and membership referral inquiries can be sent to hello@booksnfriends.com.',
    '',
    '## Key Pages',
    `- [The Collective Bookshelf (Home)](${origin}/): Browse all ${books.length} curated books, Book of the Month highlight, and club reading stats.`,
    `- [Book of the Month](${origin}/book-of-month): Current monthly selection, synopsis, discussion themes, and member reflections.`,
    `- [Meet the Friends](${origin}/members): Profiles, 2026 reading goals, and personal shelves of our ${members.length} members.`,
    `- [About Books & Friends](${origin}/about): Collective mission, curatorial history, and member directory.`,
    `- [Contact & Inquiries](${origin}/contact): Editorial email (hello@booksnfriends.com) and Salon Dispatch newsletter signup.`,
    `- [Terms of Use](${origin}/terms): Salon guidelines, contributor rights, and affiliate disclosure.`,
    `- [Privacy Policy](${origin}/privacy): Data stewardship, Google Workspace OAuth notice, and deletion requests.`,
    '',
    '## Agent & Machine-Readable Endpoints',
    `- [MCP Server Card (SEP-1649)](${origin}/.well-known/mcp/server-card.json): Model Context Protocol capability card.`,
    `- [MCP Streamable HTTP Endpoint](${origin}/mcp): JSON-RPC 2.0 MCP tools and resources endpoint.`,
    `- [Structured Club Data JSON](${origin}/api/data): Full JSON snapshot of curated books and members.`,
    `- [XML Sitemap](${origin}/sitemap.xml): Complete list of indexable public URLs.`,
    '',
  ];

  if (botm) {
    lines.push('## Current Book of the Month');
    lines.push(
      `- **${botm.titleEn || botm.title}** (${botm.title}) by ${botm.author} — curated by ${botm.suggesterName || 'Books & Friends'}`
    );
    if (botm.synopsisEn || botm.synopsis) {
      lines.push(`  ${botm.synopsisEn || botm.synopsis}`);
    }
    lines.push('');
  }

  if (books.length > 0) {
    lines.push('## Curated Bookshelf');
    for (const b of books) {
      lines.push(
        `- **${b.titleEn || b.title}** — ${b.author} (${b.genreEn || b.genre || 'Literature'}, ${b.pages || '?'} pages, curated by ${b.suggesterName || 'Club'})`
      );
    }
    lines.push('');
  }

  if (members.length > 0) {
    lines.push('## Curating Members');
    for (const m of members) {
      lines.push(
        `- [${m.name}](${origin}/members/${encodeURIComponent(m.id)}) — ${m.roleEn || m.role || 'Member'}${m.linkedinUrl ? ` (${m.linkedinUrl})` : ''}`
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}

export function buildMcpServerCard(origin: string) {
  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json',
    version: '1.0',
    protocolVersion: '2025-06-18',
    name: 'Books & Friends MCP Server',
    description:
      'MCP server for the Books & Friends reading collective: inspect the curated bookshelf, Book of the Month reflections, and curating member profiles.',
    endpoint: `${origin}/mcp`,
    serverInfo: {
      name: 'books-and-friends',
      title: 'Books & Friends — Private Book Club',
      version: '1.0.0',
    },
    transport: {
      type: 'streamable-http',
      endpoint: '/mcp',
    },
    capabilities: {
      tools: { listChanged: false },
      resources: { subscribe: false, listChanged: false },
      prompts: { listChanged: false },
    },
    authentication: {
      required: false,
    },
    tools: [
      {
        name: 'list_books',
        description: 'List or search curated books in the Books & Friends collective library.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Optional title, author, or genre filter string.',
            },
          },
        },
      },
      {
        name: 'get_book_of_the_month',
        description: 'Return details, synopsis, discussion themes, and comments for the current Book of the Month.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_members',
        description: 'List curating members, roles, reading goals, and personal shelves.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
    resources: [
      {
        uri: `${origin}/llms.txt`,
        name: 'Books & Friends llms.txt',
        mimeType: 'text/markdown',
      },
      {
        uri: `${origin}/api/data`,
        name: 'Books & Friends Catalog JSON',
        mimeType: 'application/json',
      },
    ],
  };
}

export function buildJsonLd(origin: string, meta: RouteMeta, storeData: StoreData | null) {
  const members = Array.isArray(storeData?.members) ? storeData!.members! : [];
  const books = Array.isArray(storeData?.books) ? storeData!.books! : [];
  const botm = books.find((b) => b.isBookOfMonth) || books[0];

  const memberSameAs = members
    .map((m) => m.linkedinUrl)
    .filter((u): u is string => typeof u === 'string' && /^https?:\/\//i.test(u));

  const sameAs = Array.from(new Set(memberSameAs.length > 0 ? memberSameAs : DEFAULT_SAME_AS));
  const canonicalUrl = `${origin}${meta.cleanPath}`;

  const graph: any[] = [
    {
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: 'Books & Friends',
      alternateName: 'The Six — Private Book Club',
      url: `${origin}/`,
      email: 'hello@booksnfriends.com',
      telephone: 'No public phone — correspondence via hello@booksnfriends.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Istanbul Chapter — Private Literary Salon',
        addressLocality: 'Istanbul',
        addressRegion: 'Istanbul',
        postalCode: '34000',
        addressCountry: 'TR',
      },
      areaServed: ['Istanbul', 'Dubai', 'New York', 'San Francisco'],
      foundingDate: '2025-11',
      description:
        'An intimate six-member reading collective across Istanbul, Dubai, New York, and San Francisco reading one curated book every month together.',
      founder: {
        '@type': 'Person',
        name: 'Cemre Şirin',
        sameAs: 'https://www.linkedin.com/in/cemresirin/',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'editorial support',
        email: 'hello@booksnfriends.com',
        telephone: 'No public phone — correspondence via hello@booksnfriends.com',
        availableLanguage: ['English', 'Turkish'],
      },
      sameAs,
      member: members.map((m) => ({
        '@type': 'Person',
        name: m.name,
        jobTitle: m.roleEn || m.role || 'Curating Member',
        url: `${origin}/members/${encodeURIComponent(m.id)}`,
        ...(m.linkedinUrl ? { sameAs: m.linkedinUrl } : {}),
      })),
    },
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: `${origin}/`,
      name: 'Books & Friends — Private Book Club',
      inLanguage: ['en', 'tr'],
      publisher: { '@id': `${origin}/#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: meta.title,
      description: meta.description,
      isPartOf: { '@id': `${origin}/#website` },
      about: { '@id': `${origin}/#organization` },
    },
  ];

  if (botm) {
    graph.push({
      '@type': 'Book',
      '@id': `${origin}/#book-of-month`,
      name: botm.titleEn || botm.title,
      alternateName: botm.title,
      author: {
        '@type': 'Person',
        name: botm.author,
      },
      genre: botm.genreEn || botm.genre || 'Literature',
      numberOfPages: botm.pages || undefined,
      datePublished: botm.year ? String(botm.year) : undefined,
      description: botm.synopsisEn || botm.synopsis || undefined,
    });
  }

  if (books.length > 0) {
    graph.push({
      '@type': 'ItemList',
      '@id': `${origin}/#bookshelf`,
      name: 'Books & Friends Collective Bookshelf',
      numberOfItems: books.length,
      itemListElement: books.slice(0, 10).map((b, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Book',
          name: b.titleEn || b.title,
          author: { '@type': 'Person', name: b.author },
        },
      })),
    });
  }

  if (meta.member) {
    graph.push({
      '@type': 'Person',
      '@id': `${canonicalUrl}#person`,
      name: meta.member.name,
      jobTitle: meta.member.roleEn || meta.member.role || 'Member',
      description: meta.member.bioEn || meta.member.bio || undefined,
      url: canonicalUrl,
      ...(meta.member.linkedinUrl ? { sameAs: meta.member.linkedinUrl } : {}),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function buildMarkdownForRoute(origin: string, meta: RouteMeta, storeData: StoreData | null): string {
  const books = Array.isArray(storeData?.books) ? storeData!.books! : [];
  const members = Array.isArray(storeData?.members) ? storeData!.members! : [];
  const botm = books.find((b) => b.isBookOfMonth) || books[0];

  const navFooter = [
    '',
    '---',
    `**Navigation:** [Home](${origin}/) | [Book of the Month](${origin}/book-of-month) | [Meet the Friends](${origin}/members) | [About](${origin}/about) | [Contact](${origin}/contact) | [Terms](${origin}/terms) | [Privacy](${origin}/privacy)`,
    `**Contact:** [hello@booksnfriends.com](mailto:hello@booksnfriends.com) | **LLMs Summary:** [llms.txt](${origin}/llms.txt)`,
  ].join('\n');

  if (meta.view === 'book-of-month' && botm) {
    return [
      `# Book of the Month: ${botm.titleEn || botm.title}`,
      '',
      `- **Original / Turkish Title:** ${botm.title}`,
      `- **Author:** ${botm.author}`,
      `- **Genre:** ${botm.genreEn || botm.genre || 'Literature'}`,
      `- **Curated by:** ${botm.suggesterName || 'Books & Friends'}`,
      `- **Pages / Year:** ${botm.pages || '?'} pages · ${botm.year || ''}`,
      '',
      '## Synopsis',
      botm.synopsisEn || botm.synopsis || '',
      botm.favoriteQuoteEn || botm.favoriteQuote ? `\n> "${botm.favoriteQuoteEn || botm.favoriteQuote}"` : '',
      navFooter,
    ].join('\n');
  }

  if (meta.view === 'members') {
    if (meta.member) {
      const m = meta.member;
      const shelfLines = (m.books || []).map(
        (b) => `- **${b.titleEn || b.title}** by ${b.author}`
      );
      return [
        `# ${m.name}`,
        '',
        `**Role:** ${m.roleEn || m.role || 'Curating Member'}`,
        m.readingGoal2026En || m.readingGoal2026 ? `**2026 Goal:** ${m.readingGoal2026En || m.readingGoal2026}` : '',
        m.currentlyReadingEn || m.currentlyReading ? `**Currently Reading:** ${m.currentlyReadingEn || m.currentlyReading}` : '',
        m.linkedinUrl ? `**LinkedIn:** ${m.linkedinUrl}` : '',
        '',
        '## Bio',
        m.bioEn || m.bio || '',
        '',
        `## Personal Shelf (${shelfLines.length} books)`,
        ...(shelfLines.length > 0 ? shelfLines : ['- No personal shelf books listed yet.']),
        navFooter,
      ]
        .filter(Boolean)
        .join('\n');
    }

    return [
      '# Meet the Friends — Books & Friends Curators',
      '',
      ...members.map(
        (m) =>
          `- **[${m.name}](${origin}/members/${encodeURIComponent(m.id)})** — ${m.roleEn || m.role || 'Member'}: ${m.bioEn || m.bio || ''}`
      ),
      navFooter,
    ].join('\n');
  }

  if (meta.view === 'about') {
    return [
      '# About Books & Friends',
      '',
      'Books & Friends (The Six) is an intimate six-member reading collective across Istanbul, Dubai, New York, and San Francisco established in November 2025.',
      '',
      'Founded by Cemre Şirin and curated by Eda Aydoğan, we read one carefully selected book each month together—prioritizing depth over velocity.',
      '',
      '## Curating Members',
      ...members.map((m) => `- **${m.name}** (${m.roleEn || m.role || 'Member'})`),
      navFooter,
    ].join('\n');
  }

  if (meta.view === 'contact') {
    return [
      '# Contact Books & Friends',
      '',
      '- **Editorial & Salon Email:** [hello@booksnfriends.com](mailto:hello@booksnfriends.com)',
      '- **Telephone:** No public telephone line (all correspondence handled via email)',
      '- **Founding Location:** Istanbul, 34000, TR (Private Literary Salon)',
      '- **Chapters:** Istanbul · Dubai · New York · San Francisco',
      '- **Newsletter & Referrals:** Subscribe or submit a guest referral on the website.',
      navFooter,
    ].join('\n');
  }

  if (meta.view === 'terms') {
    return [
      '# Terms of Use — Books & Friends',
      '',
      '1. **Purpose:** Books & Friends (booksnfriends.com) is a curated reading archive and literary journal.',
      '2. **Intellectual Property:** Member reflections remain the work of their authors.',
      '3. **Affiliate Disclosure:** Bookstore links may include partner tags associated with hello@booksnfriends.com to fund collective book acquisitions.',
      navFooter,
    ].join('\n');
  }

  if (meta.view === 'privacy') {
    return [
      '# Privacy Policy — Books & Friends',
      '',
      '1. **Data Collection:** Only voluntarily submitted newsletter signups, referral requests, and member profile updates are stored.',
      '2. **Google Workspace:** Authorized curators may optionally connect Gmail and Google Forms via client-side OAuth.',
      '3. **Deletion Requests:** Email [hello@booksnfriends.com](mailto:hello@booksnfriends.com) at any time.',
      navFooter,
    ].join('\n');
  }

  // Default: Home Page Markdown
  return [
    '# Books & Friends — Six readers. One book a month.',
    '',
    'We are a small circle of six readers across Istanbul, Dubai, NYC, and San Francisco who read one book every month together, prioritizing depth over velocity.',
    '',
    botm
      ? `## Now Reading: ${botm.titleEn || botm.title} by ${botm.author}\n${botm.synopsisEn || botm.synopsis || ''}\n`
      : '',
    `## The Collective Bookshelf (${books.length} Editions)`,
    ...books.map(
      (b) =>
        `- **${b.titleEn || b.title}** by ${b.author} (${b.genreEn || b.genre || 'Literature'}, ${b.pages || '?'} pages) — curated by ${b.suggesterName || 'Club'}`
    ),
    '',
    `## The 6 Curating Members`,
    ...members.map(
      (m) => `- [${m.name}](${origin}/members/${encodeURIComponent(m.id)}) — ${m.roleEn || m.role || 'Member'}`
    ),
    navFooter,
  ].join('\n');
}

export function buildStaticSsrRootHtml(origin: string, meta: RouteMeta, storeData: StoreData | null): string {
  const books = Array.isArray(storeData?.books) ? storeData!.books! : [];
  const members = Array.isArray(storeData?.members) ? storeData!.members! : [];
  const botm = books.find((b) => b.isBookOfMonth) || books[0];

  const navLinks = `
    <nav aria-label="Primary">
      <a href="/">The Bookshelf</a> |
      <a href="/book-of-month">Book of the Month</a> |
      <a href="/members">Meet the Friends</a> |
      <a href="/about">About Us</a> |
      <a href="/contact">Contact</a> |
      <a href="/terms">Terms of Use</a> |
      <a href="/privacy">Privacy Policy</a>
    </nav>
    <p>Contact: <a href="mailto:hello@booksnfriends.com">hello@booksnfriends.com</a></p>
  `;

  let bodyHtml = '';
  if (meta.view === 'about') {
    bodyHtml = `
      <h1>About Books &amp; Friends</h1>
      <p>${escapeHtml(meta.description)}</p>
      <ul>${members.map((m) => `<li><a href="/members/${encodeURIComponent(m.id)}">${escapeHtml(m.name)}</a> — ${escapeHtml(m.roleEn || m.role || 'Member')}</li>`).join('')}</ul>
    `;
  } else if (meta.view === 'contact') {
    bodyHtml = `
      <h1>Contact Books &amp; Friends</h1>
      <p>${escapeHtml(meta.description)}</p>
      <p>Editorial email: <a href="mailto:hello@booksnfriends.com">hello@booksnfriends.com</a></p>
      <p>Location: Istanbul, 34000, TR (Private Literary Salon across Istanbul, Dubai, New York, and San Francisco). Telephone: No public phone — correspondence via email.</p>
    `;
  } else if (meta.view === 'terms') {
    bodyHtml = `
      <h1>Terms of Use</h1>
      <p>${escapeHtml(meta.description)}</p>
    `;
  } else if (meta.view === 'privacy') {
    bodyHtml = `
      <h1>Privacy Policy</h1>
      <p>${escapeHtml(meta.description)}</p>
    `;
  } else if (meta.view === 'book-of-month' && botm) {
    bodyHtml = `
      <h1>Book of the Month: ${escapeHtml(botm.titleEn || botm.title)}</h1>
      <p>By ${escapeHtml(botm.author)} · Curated by ${escapeHtml(botm.suggesterName || 'Books & Friends')}</p>
      <p>${escapeHtml(botm.synopsisEn || botm.synopsis || '')}</p>
    `;
  } else if (meta.view === 'members') {
    if (meta.member) {
      bodyHtml = `
        <h1>${escapeHtml(meta.member.name)}</h1>
        <p>${escapeHtml(meta.member.roleEn || meta.member.role || 'Member')}</p>
        <p>${escapeHtml(meta.member.bioEn || meta.member.bio || '')}</p>
      `;
    } else {
      bodyHtml = `
        <h1>Meet the Friends</h1>
        <ul>${members.map((m) => `<li><a href="/members/${encodeURIComponent(m.id)}">${escapeHtml(m.name)}</a> — ${escapeHtml(m.roleEn || m.role || 'Member')}</li>`).join('')}</ul>
      `;
    }
  } else {
    bodyHtml = `
      <h1>Books &amp; Friends — Six readers. One book a month.</h1>
      <p>We are a small circle of friends across Istanbul, Dubai, NYC, and San Francisco who read one book every month together, prioritizing depth over velocity.</p>
      ${botm ? `<section><h2>Book of the Month: ${escapeHtml(botm.titleEn || botm.title)}</h2><p>By ${escapeHtml(botm.author)}</p></section>` : ''}
      <section><h2>The Collective Bookshelf (${books.length} Editions)</h2><ul>${books.map((b) => `<li>${escapeHtml(b.titleEn || b.title)} — ${escapeHtml(b.author)}</li>`).join('')}</ul></section>
      <section><h2>The 6 Curating Members</h2><ul>${members.map((m) => `<li><a href="/members/${encodeURIComponent(m.id)}">${escapeHtml(m.name)}</a>${m.linkedinUrl ? ` (<a href="${escapeHtml(m.linkedinUrl)}">LinkedIn</a>)` : ''}</li>`).join('')}</ul></section>
    `;
  }

  return `<div id="root"><main>${bodyHtml}<footer>${navLinks}<p>Canonical: ${escapeHtml(`${origin}${meta.cleanPath}`)}</p></footer></main></div>`;
}

export function injectHtmlMetadata(
  template: string,
  origin: string,
  meta: RouteMeta,
  storeData: StoreData | null
): string {
  const canonicalUrl = `${origin}${meta.cleanPath}`;
  const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(
    buildJsonLd(origin, meta, storeData)
  ).replace(/</g, '\\u003c')}</script>`;
  const ssrRoot = buildStaticSsrRootHtml(origin, meta, storeData);

  let html = template;
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${escapeHtml(`${origin}/og-preview.jpg`)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image:secure_url" content="${escapeHtml(`${origin}/og-preview.jpg`)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${escapeHtml(`${origin}/og-preview.jpg`)}" />`
  );
  html = html.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    jsonLdScript
  );
  html = html.replace(/<div\s+id="root">[\s\S]*?<\/div>(?=\s*<script)/i, ssrRoot);

  return html;
}
