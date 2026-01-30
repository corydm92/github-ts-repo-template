import { execSync } from 'node:child_process';
import fs from 'node:fs';

const input = fs.readFileSync(0, 'utf8').trim();
if (!input) {
  console.log('No project-level files to format-check. Skipping.');
  process.exit(0);
}

const files = JSON.parse(input);
if (!files.length) {
  console.log('No project-level files to format-check. Skipping.');
  process.exit(0);
}

const supported = files.filter(
  (file) =>
    file.endsWith('.js') ||
    file.endsWith('.mjs') ||
    file.endsWith('.cjs') ||
    file.endsWith('.ts') ||
    file.endsWith('.tsx') ||
    file.endsWith('.json') ||
    file.endsWith('.yml') ||
    file.endsWith('.yaml') ||
    file.endsWith('.md'),
);

if (!supported.length) {
  console.log('No project-level files with supported extensions. Skipping.');
  process.exit(0);
}

const escaped = supported.map((file) => `"${file}"`).join(' ');
execSync(`pnpm exec prettier --check ${escaped}`, { stdio: 'inherit' });
