// Hostinger entry point. Hostinger requires a .js entry file, so this loads server.ts
// (Node 22.18+ runs TypeScript natively, same as `npm start`).
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

// Hostinger provides the listening port via PORT; server.ts reads it from --port.
if (process.env.PORT && !process.argv.includes('--port')) {
  process.argv.push('--port', process.env.PORT);
}

// Build the frontend once if dist/ is missing (server.ts serves dist/ in production).
if (!existsSync('dist/index.html')) {
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } catch (err) {
    console.warn('Frontend build failed; server.ts will fall back to Vite middleware.', err.message);
  }
}

await import('./server.ts');
