import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

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

  // Single text translation endpoint
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, from, to } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text string is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ translatedText: text, note: 'Fallback: no API key' });
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const translatedText = response.text?.trim() || text;
      res.json({ translatedText });
    } catch (err: any) {
      console.error('Translation error:', err?.message || err);
      res.status(500).json({ error: 'Translation failed', details: String(err) });
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
        return res.json({ translated: items });
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      let translated = items;
      try {
        const text = response.text?.trim() || '{}';
        translated = JSON.parse(text);
      } catch (parseErr) {
        console.error('Failed to parse translation JSON', parseErr);
      }

      res.json({ translated });
    } catch (err: any) {
      console.error('Batch translation error:', err?.message || err);
      res.status(500).json({ error: 'Batch translation failed' });
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

  // Mount Vite middleware in development vs Static serving in production
  const isDev = process.env.npm_lifecycle_event === 'dev';
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));

  if (!isDev && hasDist) {
    console.log('[Server] Production mode: Serving compiled assets from', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    console.log('[Server] Development mode: Mounting Vite middlewares');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  }

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
