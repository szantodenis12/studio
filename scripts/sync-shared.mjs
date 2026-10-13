// Copies the shared pricing module into the Cloud Functions source tree.
// Usage: node scripts/sync-shared.mjs [--check]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const SRC = 'src/lib/rooms/pricing.ts';
const DEST = 'functions/src/shared/pricing.ts';
const src = readFileSync(SRC, 'utf8');
let dest = '';
try {
  dest = readFileSync(DEST, 'utf8');
} catch {
  /* missing */
}

if (process.argv.includes('--check')) {
  if (src !== dest) {
    console.error(`${DEST} is out of sync with ${SRC}. Run: npm run sync:shared`);
    process.exit(1);
  }
  console.log('shared pricing module in sync');
} else {
  mkdirSync(dirname(DEST), { recursive: true });
  writeFileSync(DEST, src);
  console.log(`copied ${SRC} -> ${DEST}`);
}
