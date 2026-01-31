import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// 0) Inputs: how we detect changes in this run.
const mode = process.env.AFFECTED_MODE || 'staged'; // staged | pr
const baseRef = process.env.BASE_REF || '';
const headSha = process.env.HEAD_SHA || '';

const root = process.cwd();
const appsDir = path.join(root, 'apps');
const packagesDir = path.join(root, 'packages');

// 1) Shared paths always invalidate all apps (tooling + CI definitions).
const sharedPaths = [
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

// 2) Read changed files either from staged changes or a PR diff.
const readChangedFiles = () => {
  if (mode === 'pr') {
    // PR flow: diff base branch vs current head.
    if (!baseRef || !headSha) return [];
    const base = `origin/${baseRef}`;
    return execSync(`git diff --name-only ${base}...${headSha}`, {
      encoding: 'utf8',
    })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  // Local flow: only staged files count.
  return execSync('git diff --name-only --cached', { encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

// 3) List app folders under /apps.
const listApps = () =>
  fs.existsSync(appsDir)
    ? fs
        .readdirSync(appsDir)
        // Only treat folders as apps.
        .filter((name) => fs.statSync(path.join(appsDir, name)).isDirectory())
    : [];

// 3b) Guard: only treat package folders as packages.
const isPackageDir = (name) => {
  const pkgDir = path.join(packagesDir, name);
  return fs.existsSync(pkgDir) && fs.statSync(pkgDir).isDirectory();
};

// 4) Read package.json names for packages/ + apps/.
// This is used for graph-aware dependency detection.
const readPackageName = (pkgPath) => {
  if (!fs.existsSync(pkgPath)) return undefined;
  const json = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return json.name;
};

const readPackageDeps = (pkgPath) => {
  if (!fs.existsSync(pkgPath)) return [];
  const json = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const deps = {
    ...json.dependencies,
    ...json.optionalDependencies,
    ...json.peerDependencies,
  };
  return Object.keys(deps || {});
};

// 5) Build graph: packageName -> apps that depend on it.
const buildPackageDependents = () => {
  if (!fs.existsSync(packagesDir) || !fs.existsSync(appsDir)) return new Map();

  const packageMap = new Map(); // packageName -> packageDir
  for (const name of fs.readdirSync(packagesDir)) {
    const pkgDir = path.join(packagesDir, name);
    if (!fs.statSync(pkgDir).isDirectory()) continue;
    const pkgName = readPackageName(path.join(pkgDir, 'package.json'));
    if (pkgName) packageMap.set(pkgName, pkgDir);
  }

  const dependents = new Map(); // packageName -> Set(appName)
  for (const appName of listApps()) {
    const appPkgPath = path.join(appsDir, appName, 'package.json');
    const deps = readPackageDeps(appPkgPath);
    for (const dep of deps) {
      if (!packageMap.has(dep)) continue;
      if (!dependents.has(dep)) dependents.set(dep, new Set());
      dependents.get(dep).add(appName);
    }
  }

  return dependents;
};

// 6) Main flow (ordered for readability).
// Step A: shared paths -> run all apps (see touchShared below).
// Step B: apps/ changes -> run those apps (see apps Set below).
// Step C: packages/ changes -> run dependent apps (see packageDependents below).
// Step D: include changed packages in the final payload (see resultPackages below).
const changedFiles = readChangedFiles();
const apps = new Set();
let touchShared = false;
const changedPackages = new Set();
const packageDependents = buildPackageDependents();

for (const file of changedFiles) {
  const normalized = file.replace(/\\/g, '/');

  // Step B: direct app changes.
  if (normalized.startsWith('apps/')) {
    const [, appName] = normalized.split('/');
    if (appName) apps.add(appName);
    continue;
  }

  // Step C: detect changed packages by folder name.
  if (normalized.startsWith('packages/')) {
    const [, pkgFolder] = normalized.split('/');
    if (pkgFolder && isPackageDir(pkgFolder)) {
      changedPackages.add(pkgFolder);
    } else {
      // Non-package files under /packages are treated as shared changes.
      touchShared = true;
    }
    continue;
  }

  // Step A: shared config triggers all apps.
  if (
    sharedPaths.some(
      (shared) => normalized === shared || normalized.startsWith(shared),
    )
  ) {
    touchShared = true;
  }
}

let resultApps = [];
let resultPackages = [];
if (touchShared) {
  resultApps = listApps();
} else {
  resultApps = Array.from(apps);
}

// Step C (cont.): add dependent apps for changed packages.
if (!touchShared && changedPackages.size > 0 && packageDependents.size > 0) {
  for (const pkgFolder of changedPackages) {
    const pkgPath = path.join(packagesDir, pkgFolder, 'package.json');
    const pkgName = readPackageName(pkgPath);
    if (!pkgName) continue;
    const deps = packageDependents.get(pkgName);
    if (!deps) continue;
    for (const appName of deps) {
      if (!resultApps.includes(appName)) resultApps.push(appName);
    }
  }
}

// Step D: include changed packages for package-level CI gates.
if (changedPackages.size > 0) {
  resultPackages = Array.from(changedPackages);
}

process.stdout.write(
  JSON.stringify({
    apps: resultApps,
    packages: resultPackages,
  }),
);
