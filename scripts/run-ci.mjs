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

const getAffectedTargets = () => {
  const output = execSync('node scripts/affected-apps.mjs', {
    encoding: 'utf8',
  });
  return JSON.parse(output);
};

console.log(getAffectedTargets());

// Each package.json has ci and ciPaths
// ci = run all scripts as one script
// ciPaths = array of ci scripts, used as a CI UI enhancement
const readWorkspaceMeta = (pkgPath) => {
  const pkg = JSON.parse(execSync(`cat ${pkgPath}`, { encoding: 'utf8' }));
  return {
    scripts: pkg.scripts || {},
    ciTasks: Array.isArray(pkg.ciTasks) ? pkg.ciTasks : null,
  };
};

const runWorkspaceTasks = (label, cwd, tasks) => {
  console.log(`\n${label}`);
  if (!tasks?.length) {
    console.log('- Skipping CI');
    return;
  }
  for (const task of tasks) {
    step(task, `pnpm -C ${cwd} run ${task}`);
  }
};

const {
  packageImpacts = [],
  changedFiles = [],
  allApps = [],
  allPackages = [],
  changedApps = [],
  changedPackages = [],
  changedSystems = false,
} = getAffectedTargets();

const runProjectTasks = () => {
  // Manually written to avoid triggering every project script like packages/apps do
  console.log('Project tasks');
  step('format:check', 'pnpm run format:check');
  step('lint', 'pnpm run lint');
  step('type-check', 'pnpm run type-check');
  step('test', 'pnpm run test');
  step('ci:contract', 'pnpm run ci:contract');
};

const runPackageTasks = () => {
  const packageList = packagesOnly || changedSystems ? allPackages : changedPackages;

  if (!packageList.length) {
    console.log('\nPackage - No Change Detected');
    console.log('- Skipping CI');
  } else {
    for (const pkg of packageList) {
      const pkgPath = `packages/${pkg}/package.json`;
      const { ciTasks } = readWorkspaceMeta(pkgPath);
      const changed = changedPackages.includes(pkg);
      const suffix = changedSystems
        ? 'Triggered From System Files Change'
        : changed
          ? 'Detected Change'
          : 'No Change Detected';
      const label = pkg === 'System' ? `Package - ${suffix}` : `Package ${pkg} - ${suffix}`;
      if (!packagesOnly && suffix === 'No Change Detected') {
        console.log(`\n${label}`);
        console.log('- Skipping CI');
        continue;
      }
      runWorkspaceTasks(label, `packages/${pkg}`, ciTasks);
    }
  }
};

const runAppTasks = () => {
  const appList = appsOnly || changedSystems ? allApps : changedApps;

  if (!appList.length) {
    console.log('\nApp - No Change Detected');
    console.log('- Skipping CI');
  } else {
    for (const app of appList) {
      const pkgPath = `apps/${app}/package.json`;
      const { scripts, ciTasks } = readWorkspaceMeta(pkgPath);
      const tasks = ciTasks ?? ['format:check', 'lint', 'type-check', 'test', 'build'].filter((t) => scripts[t]);
      const changed = changedApps.includes(app);
      const suffix = changedSystems
        ? 'Triggered From System Files Change'
        : changed
          ? 'Detected Change'
          : 'No Change Detected';
      const label = `${app} - ${suffix}`;
      if (suffix === 'No Change Detected') {
        console.log(`\n${label}`);
        console.log('- Skipping CI');
        continue;
      }
      runWorkspaceTasks(label, `apps/${app}`, tasks);
    }
  }
};

const getDetectedTelemetry = () => {
  const hasAppChanges = changedApps.length > 0;
  const hasPackageChanges = changedPackages.length > 0;

  console.log('\nDetected Changes');
  console.log(`- System files: ${changedSystems ? 'changed' : 'no change'}`);
  console.log(`- Packages: ${hasPackageChanges ? changedPackages.join(', ') : 'no change'}`);
  console.log(`- Apps: ${hasAppChanges ? changedApps.join(', ') : 'no change'}`);

  const systemFiles = changedFiles.filter((file) => !file.startsWith('apps/') && !file.startsWith('packages/'));
  const packageFiles = changedFiles.filter((file) => file.startsWith('packages/'));
  const appFiles = changedFiles.filter((file) => file.startsWith('apps/'));

  if (systemFiles.length) {
    console.log('\nSystem Changed Files');
    for (const file of systemFiles) {
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

  if (!changedSystems && packageImpacts.length) {
    console.log('\nPackage impacts');
    for (const impact of packageImpacts) {
      console.log(`- ${impact.package} → ${impact.apps.join(', ') || 'no dependent apps'}`);
    }
  }
};

if (projectOnly) {
  runProjectTasks();
  getDetectedTelemetry();

  console.log('\nProject only check finished, exiting.\n');
  process.exit(0);
} else if (packagesOnly) {
  getDetectedTelemetry();
  runPackageTasks();

  console.log('\nPackage only check finished, exiting.\n');
  process.exit(0);
} else if (appsOnly) {
  getDetectedTelemetry();
  runAppTasks();

  console.log('\nApps only check finished, exiting.\n');
  process.exit(0);
} else {
  runProjectTasks();
  getDetectedTelemetry();
  runPackageTasks();
  runAppTasks();

  console.log('\n Full CI check finished, exiting.\n');
  process.exit(0);
}
