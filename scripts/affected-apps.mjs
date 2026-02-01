import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// 0) Inputs: how we detect changes in this run.
// - staged: local pre-commit (only staged files)
// - pr:     PR CI (base branch vs HEAD)
// - range:  push/merge CI (before SHA vs after SHA)
const mode = process.env.AFFECTED_MODE || 'staged'; // staged | pr | range
const baseRef = process.env.BASE_REF || '';
const baseSha = process.env.BASE_SHA || '';
const headSha = process.env.HEAD_SHA || '';

const root = process.cwd();
const appsDir = path.join(root, 'apps');
const packagesDir = path.join(root, 'packages');

// 1) System updates always invalidate all apps (tooling + CI definitions).
const systemPaths = [
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

const isZeroSha = (sha) => /^0{40}$/.test(sha);

// 2) Read changed files either from staged changes or a PR diff.
const readChangedFiles = () => {
  if (mode === 'range') {
    // Range flow: compare two SHAs (e.g., push before -> after).
    // In CD, this is the merge/push "before" SHA vs the new "after" SHA on main.
    // The diff determines which apps/packages need a deploy.
    if (!baseSha || !headSha || isZeroSha(baseSha)) {
      return execSync('git ls-files', { encoding: 'utf8' })
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    }
    return execSync(`git diff --name-only ${baseSha}...${headSha}`, {
      encoding: 'utf8',
    })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

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

// 3c) List package folders under /packages.
const listPackages = () =>
  fs.existsSync(packagesDir)
    ? fs
        .readdirSync(packagesDir)
        // Only treat folders as packages.
        .filter((name) => isPackageDir(name))
    : [];

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
// Step A: System paths -> run all apps (see touchSystem below).
// Step B: apps/ changes -> run those apps (see apps Set below).
// Step C: packages/ changes -> run dependent apps (see packageDependents below).
// Step D: include changed packages in the final payload (see resultPackages below).
const changedFiles = readChangedFiles();
const changedApps = new Set();
let touchSystem = false;
const changedPackages = new Set();
const packageDependents = buildPackageDependents();
const packageImpacts = [];

for (const file of changedFiles) {
  const normalized = file.replace(/\\/g, '/');

  // Step B: direct app changes.
  if (normalized.startsWith('apps/')) {
    const [, appName] = normalized.split('/');
    if (appName) changedApps.add(appName);
    continue;
  }

  // Step C: detect changed packages by folder name.
  if (normalized.startsWith('packages/')) {
    const [, pkgFolder] = normalized.split('/');
    if (pkgFolder && isPackageDir(pkgFolder)) {
      changedPackages.add(pkgFolder);
    }
    continue;
  }

  // Step A: system config triggers all apps.
  if (
    systemPaths.some(
      (system) => normalized === system || normalized.startsWith(system),
    )
  ) {
    touchSystem = true;
  }
}

let resultApps = [];
let resultPackages = [];
if (touchSystem) {
  resultApps = listApps();
  resultPackages = listPackages();
} else {
  resultApps = Array.from(changedApps);
}

// Step C (cont.): add dependent apps for changed packages.
if (changedPackages.size > 0 && packageDependents.size > 0) {
  for (const pkgFolder of changedPackages) {
    const pkgPath = path.join(packagesDir, pkgFolder, 'package.json');
    const pkgName = readPackageName(pkgPath);
    if (!pkgName) continue;
    const deps = packageDependents.get(pkgName);
    if (!deps) continue;
    packageImpacts.push({
      package: pkgFolder,
      apps: Array.from(deps),
    });
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
    systemChanges: touchSystem,
    packageImpacts,
    changedFiles,
    allApps: listApps(),
    allPackages: listPackages(),
    changedApps: Array.from(changedApps),
    changedPackages: Array.from(changedPackages),
  }),
);
