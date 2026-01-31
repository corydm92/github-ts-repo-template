import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Determines where change detection reads from.
const mode = process.env.AFFECTED_MODE || 'staged'; // staged | pr
const baseRef = process.env.BASE_REF || '';
const headSha = process.env.HEAD_SHA || '';

const root = process.cwd();
const appsDir = path.join(root, 'apps');

const sharedPaths = [
  // Shared config changes should re-run all apps.
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  'tsconfig.base.json',
  'eslint.config.js',
  '.prettierrc.json',
  '.prettierignore',
  '.github/workflows/',
  'commitlint.config.cjs',
  'commitlint.config.formatter.mjs',
  'scripts/',
];

// List app folders under /apps.
const listApps = () =>
  fs.existsSync(appsDir)
    ? fs
        .readdirSync(appsDir)
        .filter((name) => fs.statSync(path.join(appsDir, name)).isDirectory())
    : [];

// Read changed files either from staged changes or a PR diff.
const readChangedFiles = () => {
  if (mode === 'pr') {
    if (!baseRef || !headSha) return [];
    const base = `origin/${baseRef}`;
    // Compare PR head against base branch.
    return execSync(`git diff --name-only ${base}...${headSha}`, {
      encoding: 'utf8',
    })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  // Local commit: only staged files.
  return execSync('git diff --name-only --cached', { encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

const changedFiles = readChangedFiles();
const apps = new Set();
let touchShared = false;

// Any app change scopes the run to just that app.
// Shared config changes trigger all apps.
for (const file of changedFiles) {
  const normalized = file.replace(/\\/g, '/');

  if (normalized.startsWith('apps/')) {
    const [, appName] = normalized.split('/');
    if (appName) apps.add(appName);
    continue;
  }

  if (
    sharedPaths.some(
      (shared) => normalized === shared || normalized.startsWith(shared),
    )
  ) {
    touchShared = true;
  }
}

let result = [];
if (touchShared) {
  result = listApps();
} else {
  result = Array.from(apps);
}

process.stdout.write(JSON.stringify(result));
