import fs from 'node:fs';
import path from 'node:path';

const bundlePath = path.join(process.cwd(), 'dist', 'server-bundle.cjs');

// In production (Cloud Run deployment), execute the pre-bundled server directly.
// This runs on standard Node.js without requiring a TypeScript/TSX runtime loader.
if (fs.existsSync(bundlePath)) {
  await import('./dist/server-bundle.cjs');
} else {
  // In development, tsx executes server-app.ts with full TypeScript and JSX support.
  await import('./server-app.ts');
}
