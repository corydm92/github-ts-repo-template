import { execSync } from 'node:child_process';

console.clear(); // Gives runner output space

const isCI = process.env.CI === 'true';
const args = new Set(process.argv.slice(2));
const projectOnly = args.has('--project-only');
const appsOnly = args.has('--apps-only');
const packagesOnly = args.has('--packages-only');

const step = (label, command) => {
  if (isCI) {
    console.log(`::group::${label}`);
  }
  const pendingLine = `- [ ] ${label}  run: ${command}`;
  process.stdout.write(`\r\x1b[2K${pendingLine}`);
  try {
    execSync(command, { stdio: isCI ? 'inherit' : 'pipe' });
    process.stdout.write(`\r\x1b[2K- [x] ${label}\n`);
    if (isCI) console.log('::endgroup::');
  } catch (err) {
    process.stdout.write(`\r\x1b[2K- [!] ${label}\n`);
    if (!isCI) {
      // On local failure, rerun to show full output.
      execSync(command, { stdio: 'inherit' });
    }
    if (isCI) console.log('::endgroup::');
    throw err;
  }
};

if (!appsOnly && !packagesOnly) {
  console.log('Project tasks');
  step('format:check', 'pnpm run format:check');
  step('lint', 'pnpm run lint');
  step('type-check', 'pnpm run type-check');
  step('test', 'pnpm run test');
  step('ci:contract', 'pnpm run ci:contract');
}

const getAffectedTargets = () => {
  const output = execSync('node scripts/affected-apps.mjs', {
    encoding: 'utf8',
  });
  return JSON.parse(output);
};

const readScripts = (pkgPath) =>
  JSON.parse(execSync(`cat ${pkgPath}`, { encoding: 'utf8' })).scripts || {};

const capitalize = (value) =>
  value ? `${value[0].toUpperCase()}${value.slice(1)}` : value;

const runWorkspaceTasks = (label, cwd, tasks) => {
  console.log(`\n${label}`);
  for (const task of tasks) {
    step(task, `pnpm -C ${cwd} run ${task}`);
  }
};

const {
  apps = [],
  packages = [],
  shared = false,
  packageImpacts = [],
  changedFiles = [],
  allApps = [],
  allPackages = [],
  changedApps = [],
  changedPackages = [],
} = getAffectedTargets();

const hasAppChanges = changedApps.length > 0;
const hasPackageChanges = changedPackages.length > 0;

if (!projectOnly) {
  console.log('\nDetected Changes');
  console.log(`- Shared files: ${shared ? 'changed' : 'no change'}`);
  console.log(`- Packages: ${hasPackageChanges ? 'changed' : 'no change'}`);
  console.log(`- Apps: ${hasAppChanges ? changedApps.join(', ') : 'none'}`);

  const sharedFiles = changedFiles.filter(
    (file) => !file.startsWith('apps/') && !file.startsWith('packages/'),
  );
  const packageFiles = changedFiles.filter((file) =>
    file.startsWith('packages/'),
  );
  const appFiles = changedFiles.filter((file) => file.startsWith('apps/'));

  if (sharedFiles.length) {
    console.log('\nShared Changed Files');
    for (const file of sharedFiles) {
      console.log(`- ${file}`);
    }
  }

  if (packageFiles.length) {
    console.log('\nPackages Changed Files');
    for (const file of packageFiles) {
      console.log(`- ${file}`);
    }
  }

  if (appFiles.length) {
    console.log('\nApps Changed Files');
    for (const file of appFiles) {
      console.log(`- ${file}`);
    }
  }

  if (!shared && packageImpacts.length) {
    console.log('\nPackage impacts');
    for (const impact of packageImpacts) {
      console.log(
        `- ${impact.package} → ${impact.apps.join(', ') || 'no dependent apps'}`,
      );
    }
  }

  if (!appsOnly) {
    const packageList = packagesOnly ? packages : allPackages;
    if (!packageList.length) {
      console.log('\nPackage - No Change Detected');
      console.log('- Skipping CI');
    } else {
      for (const pkg of packageList) {
        const pkgPath = `packages/${pkg}/package.json`;
        const scripts = readScripts(pkgPath);
        const tasks = [
          'format:check',
          'lint',
          'type-check',
          'test',
          'build',
        ].filter((t) => scripts[t]);
        const changed = changedPackages.includes(pkg);
        const suffix = shared
          ? 'Triggered From Shared Files Change'
          : changed
            ? 'Detected Change'
            : 'No Change Detected';
        const label =
          pkg === 'shared'
            ? `Package - ${suffix}`
            : `Package ${capitalize(pkg)} - ${suffix}`;
        if (suffix === 'No Change Detected') {
          console.log(`\n${label}`);
          console.log('- Skipping CI');
          continue;
        }
        runWorkspaceTasks(label, `packages/${pkg}`, tasks);
      }
    }
  }

  if (!packagesOnly) {
    const appList = appsOnly ? apps : allApps;
    if (!appList.length) {
      console.log('\nApp - No Change Detected');
      console.log('- Skipping CI');
    } else {
      for (const app of appList) {
        const pkgPath = `apps/${app}/package.json`;
        const scripts = readScripts(pkgPath);
        const tasks = [
          'format:check',
          'lint',
          'type-check',
          'test',
          'build',
        ].filter((t) => scripts[t]);
        const changed = changedApps.includes(app);
        const suffix = shared
          ? 'Triggered From Shared Files Change'
          : changed
            ? 'Detected Change'
            : 'No Change Detected';
        const label = `${capitalize(app)} - ${suffix}`;
        if (suffix === 'No Change Detected') {
          console.log(`\n${label}`);
          console.log('- Skipping CI');
          continue;
        }
        runWorkspaceTasks(label, `apps/${app}`, tasks);
      }
    }
  }
}
