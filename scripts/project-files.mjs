import { execSync } from 'node:child_process';

const mode = process.env.AFFECTED_MODE || 'staged'; // staged | pr
const baseRef = process.env.BASE_REF || '';
const headSha = process.env.HEAD_SHA || '';

const readChangedFiles = () => {
  if (mode === 'pr') {
    if (!baseRef || !headSha) return [];
    const base = `origin/${baseRef}`;
    return execSync(`git diff --name-only ${base}...${headSha}`, {
      encoding: 'utf8',
    })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return execSync('git diff --name-only --cached', { encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

const files = readChangedFiles().filter((file) => {
  const normalized = file.replace(/\\/g, '/');
  if (normalized.startsWith('apps/')) return false;
  if (normalized.startsWith('packages/')) return false;
  if (normalized.startsWith('docs/')) return false;
  if (normalized.startsWith('node_modules/')) return false;
  return true;
});

process.stdout.write(JSON.stringify(files));
