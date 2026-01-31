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
} = getAffectedTargets();
const hasApps = apps.length > 0;
const hasPackages = packages.length > 0;

const detected = [];
if (shared) detected.push('Shared files');
if (hasPackages) detected.push('Packages');
if (hasApps) detected.push('Apps');

if (!projectOnly) {
  console.log('\nDetected Changes');
  console.log(`- Shared files: ${shared ? 'changed' : 'no change'}`);
  if (shared) {
    console.log(`- Packages: no change`);
    console.log(`- Apps: none`);
  } else {
    console.log(`- Packages: ${hasPackages ? 'changed' : 'no change'}`);
    console.log(`- Apps: ${hasApps ? apps.join(', ') : 'none'}`);
  }

  if (changedFiles.length) {
    console.log('\nChanged Files');
    for (const file of changedFiles) {
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
        const suffix = shared
          ? 'Triggered From Shared Files Change'
          : packages.includes(pkg)
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
        const suffix = shared
          ? 'Triggered From Shared Files Change'
          : apps.includes(app)
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
