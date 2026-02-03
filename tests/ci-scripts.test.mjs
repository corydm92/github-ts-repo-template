import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = process.cwd();
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-scripts-'));

const writeJson = (filePath, data) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
};

const writeFile = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
};

const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
};

const exec = (cmd, cwd, env = {}) =>
  execSync(cmd, {
    cwd,
    stdio: 'pipe',
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });

// eslint-disable-next-line no-control-regex
const stripAnsi = (value) => value.replace(/\x1b\[[0-9;]*m/g, '');

const expectIncludes = (output, expected) => {
  const clean = stripAnsi(output);
  assert.ok(clean.length > 0, 'Expected output to be non-empty');
  assert.ok(clean.includes(expected), `Expected output to include: ${expected}`);
};

try {
  console.log('[ci-test] setup fixture workspace');
  // Seed temp workspace with scripts and minimal app/package layout.
  copyDir(path.join(repoRoot, 'scripts'), path.join(tmpRoot, 'scripts'));

  writeJson(path.join(tmpRoot, 'package.json'), {
    name: 'ci-scripts-fixture',
    private: true,
    scripts: {
      'format:check': 'echo "ok"',
      lint: 'echo "ok"',
      'type-check': 'echo "ok"',
      test: 'echo "ok"',
      'ci:contract': 'node scripts/workspace-contract.mjs',
      ci: 'node scripts/run-ci.mjs',
    },
  });

  // Apps
  const appScripts = {
    'format:check': 'echo "ok"',
    lint: 'echo "ok"',
    'type-check': 'echo "ok"',
    test: 'echo "ok"',
    build: 'echo "ok"',
    dev: 'echo "ok"',
    ci: 'pnpm run format:check && pnpm run lint && pnpm run type-check && pnpm run test && pnpm run build',
  };

  writeJson(path.join(tmpRoot, 'apps/backend/package.json'), {
    name: '@app/backend',
    version: '0.0.0',
    private: true,
    scripts: appScripts,
    ciTasks: ['format:check', 'lint', 'type-check', 'test', 'build'],
    dependencies: { '@pkg/shared-runtime': 'workspace:*' },
  });

  writeJson(path.join(tmpRoot, 'apps/frontend/package.json'), {
    name: '@app/frontend',
    version: '0.0.0',
    private: true,
    scripts: appScripts,
    ciTasks: ['format:check', 'lint', 'type-check', 'test', 'build'],
    dependencies: { '@pkg/shared-runtime': 'workspace:*' },
  });

  writeFile(path.join(tmpRoot, 'apps/backend/index.ts'), 'export const ok = true;\n');
  writeFile(path.join(tmpRoot, 'apps/frontend/index.ts'), 'export const ok = true;\n');

  // Packages
  writeJson(path.join(tmpRoot, 'packages/shared-runtime/package.json'), {
    name: '@pkg/shared-runtime',
    version: '0.0.0',
    private: true,
    scripts: {
      'format:check': 'echo "ok"',
      lint: 'echo "ok"',
      'type-check': 'echo "ok"',
      test: 'echo "ok"',
      ci: 'pnpm run format:check && pnpm run lint && pnpm run type-check && pnpm run test',
    },
    ciTasks: ['format:check', 'lint', 'type-check', 'test'],
  });

  writeFile(path.join(tmpRoot, 'packages/shared-runtime/index.ts'), 'export const hello = "hi";\n');

  // Init git repo to support affected-apps.
  exec('git init', tmpRoot);
  exec('git config user.email "test@example.com"', tmpRoot);
  exec('git config user.name "Test"', tmpRoot);
  exec('git add .', tmpRoot);
  exec('git commit -m "init"', tmpRoot);

  // Change a package file and stage it.
  writeFile(path.join(tmpRoot, 'packages/shared-runtime/index.ts'), 'export const hello = "changed";\n');
  exec('git add packages/shared-runtime/index.ts', tmpRoot);

  console.log('[ci-test] run affected-apps (staged)');
  const jsonOut = exec('node scripts/affected-apps.mjs', tmpRoot, {
    AFFECTED_MODE: 'staged',
  });
  const data = JSON.parse(jsonOut);

  assert.ok(data.changedPackages.includes('shared-runtime'));
  assert.ok(data.packageImpacts.length === 1);
  assert.deepEqual(data.packageImpacts[0].apps.sort(), ['backend', 'frontend']);

  // Full run (affected only, staged).
  console.log('[ci-test] run run-ci (full affected)');
  const fullOut = exec('node scripts/run-ci.mjs', tmpRoot, {
    AFFECTED_MODE: 'staged',
  });
  expectIncludes(fullOut, 'Detected Changes');
  expectIncludes(fullOut, 'Packages Changed Files');
  expectIncludes(fullOut, 'Package Impacts');
  expectIncludes(fullOut, 'backend - Triggered From Dependency Change');
  expectIncludes(fullOut, 'frontend - Triggered From Dependency Change');

  // Packages only.
  console.log('[ci-test] run run-ci (packages only)');
  const packagesOnlyOut = exec('node scripts/run-ci.mjs --packages-only', tmpRoot, {
    AFFECTED_MODE: 'staged',
  });
  expectIncludes(packagesOnlyOut, 'Package shared-runtime - Detected Change');

  // Apps only.
  console.log('[ci-test] run run-ci (apps only)');
  const appsOnlyOut = exec('node scripts/run-ci.mjs --apps-only', tmpRoot, {
    AFFECTED_MODE: 'staged',
  });
  expectIncludes(appsOnlyOut, 'backend - Triggered From Dependency Change');
  expectIncludes(appsOnlyOut, 'frontend - Triggered From Dependency Change');

  // Project only.
  console.log('[ci-test] run run-ci (project only)');
  const projectOnlyOut = exec('node scripts/run-ci.mjs --project-only', tmpRoot, {
    AFFECTED_MODE: 'staged',
  });
  expectIncludes(projectOnlyOut, 'Project Tasks');
  assert.ok(!projectOnlyOut.includes('Package shared-runtime'));

  // Force full CI.
  console.log('[ci-test] run run-ci (force full)');
  const forceOut = exec('node scripts/run-ci.mjs --force-full-ci', tmpRoot, {
    AFFECTED_MODE: 'staged',
  });
  expectIncludes(forceOut, 'Triggered From Force Full CI');

  // No changes: clear staging and ensure no-change markers.
  exec('git reset', tmpRoot);
  console.log('[ci-test] run run-ci (no changes)');
  const noChangeOut = exec('node scripts/run-ci.mjs', tmpRoot, {
    AFFECTED_MODE: 'staged',
  });
  expectIncludes(noChangeOut, 'Packages: no change');
  expectIncludes(noChangeOut, 'Apps: no change');

  console.log('ci-scripts test passed');
} finally {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
}
