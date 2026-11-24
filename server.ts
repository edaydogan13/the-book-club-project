import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  getRequestOrigin,
  buildLinkHeader,
  wantsMarkdown,
  resolveRouteMeta,
  buildRobotsTxt,
  buildSitemapXml,
  buildLlmsTxt,
  buildMcpServerCard,
  buildMarkdownForRoute,
  injectHtmlMetadata,
  escapeHtml,
} from './serverAgentSupport.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getStoreFilePath(): string {
  const primaryPath = path.resolve(process.cwd(), 'data/store.json');
  if (fs.existsSync(primaryPath)) return primaryPath;
  const secondaryPath = path.resolve(__dirname, '../data/store.json');
  if (fs.existsSync(secondaryPath)) return secondaryPath;
  const tertiaryPath = path.resolve(__dirname, 'data/store.json');
  if (fs.existsSync(tertiaryPath)) return tertiaryPath;
  return primaryPath;
}

function readStoreData() {
  const filePath = getStoreFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading store data:', err);
  }
  return null;
}

function writeStoreData(data: any) {
  const filePath = getStoreFilePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const payload = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Internal server must always bind to port 3000 (nginx listens on 8080 and proxies to 3000)
  const portArgIndex = process.argv.indexOf('--port');
  const portFromArg = portArgIndex !== -1 ? parseInt(process.argv[portArgIndex + 1], 10) : undefined;
  const port = portFromArg || 3000;

  async function generateTranslationWithFallback(
    ai: GoogleGenAI,
    prompt: string,
    config?: Record<string, any>
  ): Promise<string | null> {
    const models = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];
    for (const model of models) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout calling ${model}`)), 6000)
        );
        const response = await Promise.race([
          ai.models.generateContent({ model, contents: prompt, ...(config ? { config } : {}) }),
          timeoutPromise,
        ]);
        const text = response?.text?.trim();
        if (text) return text;
      } catch (err: any) {
        console.warn(`Translation attempt with ${model} failed:`, err?.message || err);
      }
    }
    return null;
  }

  // Single text translation endpoint
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, from, to } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text string is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ translatedText: text, fallback: true, note: 'Fallback: no API key' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const targetLang = to === 'tr' ? 'Turkish' : 'English';
      const prompt = `You are an expert bilingual literary translator. Translate the text below into fluent, elegant ${targetLang}. 
Keep proper names, authors, and formatting intact. Return ONLY the translated text without extra explanation or quotation marks.

Text to translate:
${text}`;

      const aiText = await generateTranslationWithFallback(ai, prompt);
      if (aiText) {
        return res.json({ translatedText: aiText });
      }
      return res.json({ translatedText: text, fallback: true });
    } catch (err: any) {
      console.error('Translation error:', err?.message || err);
      const fallbackText = typeof req.body?.text === 'string' ? req.body.text : '';
      return res.json({ translatedText: fallbackText, fallback: true });
    }
  });

  // Batch object translation endpoint
  app.post('/api/translate-batch', async (req, res) => {
    try {
      const { items, to } = req.body;
      if (!items || typeof items !== 'object') {
        return res.status(400).json({ error: 'Items object is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ translated: items, fallback: true });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const targetLang = to === 'tr' ? 'Turkish' : 'English';
      const prompt = `Translate all string values in the following JSON into natural, high-quality ${targetLang} suitable for a literary book club website. 
Preserve all keys exactly. Output strictly valid JSON matching the exact key structure.

JSON:
${JSON.stringify(items)}`;

      const aiText = await generateTranslationWithFallback(ai, prompt, {
        responseMimeType: 'application/json',
      });

      let translated = items;
      let fallback = true;
      if (aiText) {
        try {
          translated = JSON.parse(aiText);
          fallback = false;
        } catch (parseErr) {
          console.error('Failed to parse translation JSON', parseErr);
        }
      }

      res.json({ translated, ...(fallback ? { fallback: true } : {}) });
    } catch (err: any) {
      console.error('Batch translation error:', err?.message || err);
      res.json({ translated: req.body?.items || {}, fallback: true });
    }
  });

  // ==========================================
  // SHARED PERSISTENT STORE ENDPOINTS
  // Across all sessions, visitors, and devices
  // ==========================================

  // Get current shared club data
  app.get('/api/data', (req, res) => {
    const data = readStoreData();
    if (!data) {
      return res.status(404).json({ error: 'Store data not found' });
    }
    res.json(data);
  });

  // Save complete state update
  app.post('/api/data', (req, res) => {
    const { books, members, siteContent, referrals } = req.body;
    const current = readStoreData() || {};
    const updated = {
      books: Array.isArray(books) ? books : (current.books || []),
      members: Array.isArray(members) ? members : (current.members || []),
      siteContent: siteContent || current.siteContent || {},
      referrals: Array.isArray(referrals) ? referrals : (current.referrals || []),
    };
    const saved = writeStoreData(updated);
    res.json({ success: true, data: saved });
  });

  // Save or update a single book
  app.post('/api/data/book', (req, res) => {
    const book = req.body;
    if (!book || !book.id) {
      return res.status(400).json({ error: 'Valid book object is required' });
    }
    const current = readStoreData() || { books: [], members: [] };
    const books = Array.isArray(current.books) ? [...current.books] : [];
    const index = books.findIndex((b: any) => b.id === book.id);
    if (index >= 0) {
      books[index] = book;
    } else {
      books.unshift(book);
    }
    if (book.isBookOfMonth) {
      books.forEach((b: any) => {
        b.isBookOfMonth = (b.id === book.id);
      });
    }
    current.books = books;
    const saved = writeStoreData(current);
    res.json({ success: true, book, books, lastUpdated: saved.lastUpdated });
  });

  // Delete a book
  app.delete('/api/data/book/:id', (req, res) => {
    const bookId = req.params.id;
    const current = readStoreData() || { books: [] };
    const books = (current.books || []).filter((b: any) => b.id !== bookId);
    current.books = books;
    const saved = writeStoreData(current);
    res.json({ success: true, books, lastUpdated: saved.lastUpdated });
  });

  // Save or update a single member
  app.post('/api/data/member', (req, res) => {
    const member = req.body;
    if (!member || !member.id) {
      return res.status(400).json({ error: 'Valid member object is required' });
    }
    const current = readStoreData() || { members: [] };
    const members = Array.isArray(current.members) ? [...current.members] : [];
    const index = members.findIndex((m: any) => m.id === member.id);
    if (index >= 0) {
      members[index] = member;
    } else {
      members.push(member);
    }
    current.members = members;
    const saved = writeStoreData(current);
    res.json({ success: true, member, members, lastUpdated: saved.lastUpdated });
  });

  // Update site content
  app.post('/api/data/site-content', (req, res) => {
    const siteContent = req.body;
    if (!siteContent) {
      return res.status(400).json({ error: 'Site content is required' });
    }
    const current = readStoreData() || {};
    current.siteContent = siteContent;
    const saved = writeStoreData(current);
    res.json({ success: true, siteContent, lastUpdated: saved.lastUpdated });
  });

  // Add comment to book
  app.post('/api/data/comment', (req, res) => {
    const { bookId, comment } = req.body;
    if (!bookId || !comment) {
      return res.status(400).json({ error: 'bookId and comment are required' });
    }
    const current = readStoreData() || { books: [] };
    const books = (current.books || []).map((b: any) => {
      if (b.id === bookId) {
        return {
          ...b,
          comments: [comment, ...(b.comments || [])],
        };
      }
      return b;
    });
    current.books = books;
    const saved = writeStoreData(current);
    res.json({ success: true, books, lastUpdated: saved.lastUpdated });
  });

  // Update video review for book
  app.post('/api/data/video', (req, res) => {
    const { bookId, videoReview } = req.body;
    if (!bookId || !videoReview) {
      return res.status(400).json({ error: 'bookId and videoReview are required' });
    }
    const current = readStoreData() || { books: [] };
    const books = (current.books || []).map((b: any) => {
      if (b.id === bookId) {
        return {
          ...b,
          videoReview,
        };
      }
      return b;
    });
    current.books = books;
    const saved = writeStoreData(current);
    res.json({ success: true, books, lastUpdated: saved.lastUpdated });
  });

  // Add new referral application
  app.post('/api/data/referral', (req, res) => {
    const referral = req.body;
    if (!referral || !referral.id) {
      return res.status(400).json({ error: 'Valid referral application is required' });
    }
    const current = readStoreData() || { referrals: [] };
    const referrals = Array.isArray(current.referrals) ? [...current.referrals] : [];
    referrals.unshift(referral);
    current.referrals = referrals;
    const saved = writeStoreData(current);
    res.json({ success: true, referral, referrals, lastUpdated: saved.lastUpdated });
  });

  // Update referral status
  app.post('/api/data/referral/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const current = readStoreData() || { referrals: [] };
    const referrals = (current.referrals || []).map((r: any) =>
      r.id === id ? { ...r, status } : r
    );
    current.referrals = referrals;
    const saved = writeStoreData(current);
    res.json({ success: true, referrals, lastUpdated: saved.lastUpdated });
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'Books & Friends API', store: fs.existsSync(getStoreFilePath()) });
  });

  // Unknown API routes return 404 JSON instead of falling through to HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // ==========================================
  // AGENT DISCOVERY & MACHINE-READABLE ENDPOINTS
  // ==========================================

  app.get('/robots.txt', (req, res) => {
    const origin = getRequestOrigin(req);
    res
      .status(200)
      .set({
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      })
      .send(buildRobotsTxt(origin));
  });

  app.get('/sitemap.xml', (req, res) => {
    const origin = getRequestOrigin(req);
    const storeData = readStoreData();
    res
      .status(200)
      .set({
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      })
      .send(buildSitemapXml(origin, storeData));
  });

  app.get('/llms.txt', (req, res) => {
    const origin = getRequestOrigin(req);
    const storeData = readStoreData();
    res
      .status(200)
      .set({
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
      })
      .send(buildLlmsTxt(origin, storeData));
  });

  app.get('/.well-known/mcp/server-card.json', (req, res) => {
    const origin = getRequestOrigin(req);
    res
      .status(200)
      .set({
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      })
      .json(buildMcpServerCard(origin));
  });

  app.get('/mcp', (req, res) => {
    const origin = getRequestOrigin(req);
    res
      .status(200)
      .set({
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      })
      .json(buildMcpServerCard(origin));
  });

  app.post('/mcp', (req, res) => {
    const origin = getRequestOrigin(req);
    const body = req.body || {};
    const id = body.id !== undefined ? body.id : null;
    const method = body.method;
    const params = body.params || {};
    const storeData = readStoreData() || { books: [], members: [] };
    const books = Array.isArray(storeData.books) ? storeData.books : [];
    const members = Array.isArray(storeData.members) ? storeData.members : [];
    const card = buildMcpServerCard(origin);

    res.set({
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });

    if (method === 'initialize') {
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2025-06-18',
          capabilities: card.capabilities,
          serverInfo: card.serverInfo,
        },
      });
    }

    if (method === 'notifications/initialized') {
      return res.status(204).end();
    }

    if (method === 'ping') {
      return res.json({ jsonrpc: '2.0', id, result: {} });
    }

    if (method === 'tools/list') {
      return res.json({ jsonrpc: '2.0', id, result: { tools: card.tools } });
    }

    if (method === 'tools/call') {
      const toolName = params.name;
      const args = params.arguments || {};

      if (toolName === 'list_books') {
        const q = typeof args.query === 'string' ? args.query.trim().toLowerCase() : '';
        const filtered = books.filter((b: any) =>
          !q ||
          (b.title || '').toLowerCase().includes(q) ||
          (b.titleEn || '').toLowerCase().includes(q) ||
          (b.author || '').toLowerCase().includes(q) ||
          (b.genreEn || b.genre || '').toLowerCase().includes(q)
        );
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(filtered, null, 2) }],
          },
        });
      }

      if (toolName === 'get_book_of_the_month') {
        const botm = books.find((b: any) => b.isBookOfMonth) || books[0] || null;
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(botm, null, 2) }],
          },
        });
      }

      if (toolName === 'list_members') {
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(members, null, 2) }],
          },
        });
      }

      return res.status(400).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Unknown tool: ${toolName}` },
      });
    }

    if (method === 'resources/list') {
      return res.json({ jsonrpc: '2.0', id, result: { resources: card.resources } });
    }

    if (method === 'resources/read') {
      const uri = String(params.uri || '');
      if (uri.endsWith('/llms.txt')) {
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            contents: [{ uri, mimeType: 'text/markdown', text: buildLlmsTxt(origin, storeData) }],
          },
        });
      }
      if (uri.endsWith('/api/data')) {
        return res.json({
          jsonrpc: '2.0',
          id,
          result: {
            contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(storeData, null, 2) }],
          },
        });
      }
      return res.status(404).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32002, message: `Resource not found: ${uri}` },
      });
    }

    return res.status(400).json({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  });

  // Mount Vite middleware in development vs Static serving in production
  const isDev = process.env.npm_lifecycle_event === 'dev';
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
  let viteServer: any = null;

  if (!isDev && hasDist) {
    console.log('[Server] Production mode: Serving compiled assets from', distPath);
    app.use(express.static(distPath, { index: false, redirect: false }));
  } else {
    console.log('[Server] Development mode: Mounting Vite middlewares');
    const { createServer: createViteServer } = await import('vite');
    viteServer = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
        allowedHosts: true,
      },
      appType: 'custom',
    });
    app.use(viteServer.middlewares);
  }

  // Page Route Handler with Link Headers, Markdown Content Negotiation, SSR Metadata, and real 404s
  app.get('*', async (req, res, next) => {
    try {
      const origin = getRequestOrigin(req);
      const storeData = readStoreData();
      const meta = resolveRouteMeta(req.path, storeData);

      res.setHeader('Vary', 'Accept');

      if (!meta.valid) {
        if (wantsMarkdown(req)) {
          return res
            .status(404)
            .set({ 'Content-Type': 'text/markdown; charset=utf-8' })
            .send(
              `# 404 — Page Not Found\n\nThe requested path \`${req.path}\` does not exist on Books & Friends.\n\n- [Return Home](${origin}/)\n- [LLMs Summary](${origin}/llms.txt)\n`
            );
        }
        return res
          .status(404)
          .set({ 'Content-Type': 'text/html; charset=utf-8' })
          .send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>404 — Page Not Found — Books &amp; Friends</title>
    <meta name="robots" content="noindex" />
  </head>
  <body style="font-family:sans-serif;background:#FBFBFA;color:#1E1E1E;padding:48px 24px;text-align:center;">
    <main style="max-width:520px;margin:0 auto;">
      <h1 style="font-family:serif;font-size:36px;margin-bottom:12px;">404 — Page Not Found</h1>
      <p style="color:#57534E;margin-bottom:24px;">The page <code>${escapeHtml(req.path)}</code> could not be found on Books &amp; Friends.</p>
      <p><a href="/" style="color:#C45B38;font-weight:600;">Return to The Collective Bookshelf</a></p>
    </main>
  </body>
</html>`);
      }

      res.setHeader('Link', buildLinkHeader(origin, meta.cleanPath));

      if (wantsMarkdown(req)) {
        const md = buildMarkdownForRoute(origin, meta, storeData);
        return res
          .status(200)
          .set({ 'Content-Type': 'text/markdown; charset=utf-8' })
          .send(md);
      }

      let template = !isDev && hasDist
        ? fs.readFileSync(path.resolve(distPath, 'index.html'), 'utf-8')
        : fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');

      if (viteServer) {
        template = await viteServer.transformIndexHtml(req.originalUrl, template);
      }

      const finalHtml = injectHtmlMetadata(template, origin, meta, storeData);
      return res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(finalHtml);
    } catch (e) {
      if (viteServer) {
        viteServer.ssrFixStacktrace(e as Error);
      }
      next(e);
    }
  });

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`[Server] Books & Friends server running on port ${port}`);
    console.log(`  ➜  Local:   http://localhost:${port}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${port}/`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Server] Port ${port} is currently in use, retrying in 1s...`);
      setTimeout(() => {
        server.close();
        server.listen(port, '0.0.0.0');
      }, 1000);
    } else {
      console.error('[Server] Server listen error:', err);
    }
  });

  const handleShutdown = () => {
    console.log('[Server] Gracefully closing server...');
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => process.exit(0), 1000);
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}

startServer();
