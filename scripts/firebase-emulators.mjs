// Runs the Firebase CLI emulators with settings that work on slow (Windows)
// machines. Requires Java 11+ on PATH and the firebase CLI (npm i -g firebase-tools).
//
//   node scripts/firebase-emulators.mjs start   -> dev emulators (demo-hotel-maxim, firebase.json)
//   node scripts/firebase-emulators.mjs test    -> isolated test emulators + vitest (firebase.test.json)
//
// Both use demo-* project ids, so nothing can ever reach a real Firebase project.
import { spawnSync } from 'node:child_process';

const mode = process.argv[2] || 'start';
const env = {
  ...process.env,
  // Loading the functions source can exceed the default 10s on Windows.
  FUNCTIONS_DISCOVERY_TIMEOUT: process.env.FUNCTIONS_DISCOVERY_TIMEOUT || '60',
};

function run(cmd) {
  const res = spawnSync(cmd, { stdio: 'inherit', shell: true, env });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

run('npm --prefix functions run build');
run('node scripts/sync-shared.mjs --check');

if (mode === 'test') {
  run(
    'firebase emulators:exec --config firebase.test.json --project demo-hotel-maxim-test ' +
      '--only auth,firestore,functions,storage "vitest run"',
  );
} else {
  run('firebase emulators:start --project demo-hotel-maxim');
}
