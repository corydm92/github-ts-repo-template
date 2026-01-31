import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Task to run inside each affected app (intentionally fixed to "ci").
// We keep this non-parameterized because affected-app + graph logic is only meaningful for CI gating, not for ad-hoc task runs.
const task = 'ci';

// Delegate app detection to the shared helper.
const getAffectedApps = () => {
  const output = execSync('node scripts/affected-apps.mjs', {
    encoding: 'utf8',
  });
  return JSON.parse(output);
};

const apps = getAffectedApps();
if (!apps.length) {
  console.log('No affected apps detected. Skipping.');
  process.exit(0);
}

for (const app of apps) {
  const appPackageJson = path.join(process.cwd(), 'apps', app, 'package.json');
  if (!fs.existsSync(appPackageJson)) {
    console.log(`\n▶ ${task} for apps/${app} (skipped: no package.json)`);
    continue;
  }

  const appPackage = JSON.parse(fs.readFileSync(appPackageJson, 'utf8'));
  const scripts = appPackage.scripts || {};

  // Enforce that each app explicitly defines its gate.
  if (!scripts[task]) {
    console.error(`\n✖ apps/${app} is missing script: ${task}`);
    process.exit(1);
  }

  console.log(`\n▶ ${task} for apps/${app}`);
  execSync(`pnpm -C apps/${app} run ${task}`, { stdio: 'inherit' });
}
