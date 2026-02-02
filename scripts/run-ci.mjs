import { execSync } from 'node:child_process';

console.clear(); // Gives runner output space

const isCI = process.env.CI === 'true';
const args = new Set(process.argv.slice(2));
const projectOnly = args.has('--project-only');
const appsOnly = args.has('--apps-only');
const packagesOnly = args.has('--packages-only');

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
};

const style = (value, ...tokens) => `${tokens.join('')}${value}${colors.reset}`;

const header = (value) => style(value, colors.bold, colors.cyan);
const subheader = (value) => style(value, colors.bold);
const muted = (value) => style(value, colors.dim);

const step = (label, command) => {
  if (isCI) {
    console.log(`::group::${label}`);
  }
  const pendingLine = `- [ ] ${label}  ${muted(`run: ${command}`)}`;
  process.stdout.write(`\r\x1b[2K${pendingLine}`);
  try {
    execSync(command, { stdio: isCI ? 'inherit' : 'pipe' });
    process.stdout.write(`\r\x1b[2K- ${style('[x]', colors.green)} ${label}\n`);
    if (isCI) console.log('::endgroup::');
  } catch (err) {
    process.stdout.write(`\r\x1b[2K- ${style('[!]', colors.red)} ${label}\n`);
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

console.log('\n');
console.log(getAffectedTargets().packageImpacts);
console.log('\n');

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
  console.log(`\n${subheader(label)}`);
  if (!tasks?.length) {
    console.log(muted('- Skipping CI'));
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
  console.log(header('Project tasks'));
  step('format:check', 'pnpm run format:check');
  step('lint', 'pnpm run lint');
  step('type-check', 'pnpm run type-check');
  step('test', 'pnpm run test');
  step('ci:contract', 'pnpm run ci:contract');
};

const runWorkspaceGroup = ({ kindLabel, baseDir, workspaceList, changedList, onlyMode }) => {
  if (!workspaceList.length) {
    console.log(`\n${subheader(`${kindLabel} - No Change Detected`)}`);
    console.log(muted('- Skipping CI'));
    return;
  }

  for (const workspace of workspaceList) {
    const pkgPath = `${baseDir}/${workspace}/package.json`;
    const { ciTasks } = readWorkspaceMeta(pkgPath);
    const changed = changedList.includes(workspace);
    const suffix = changedSystems
      ? 'Triggered From System Files Change'
      : changed
        ? 'Detected Change'
        : 'No Change Detected';
    const label = kindLabel === 'Package' ? `Package ${workspace} - ${suffix}` : `${workspace} - ${suffix}`;
    if (!onlyMode && suffix === 'No Change Detected') {
      console.log(`\n${subheader(label)}`);
      console.log(muted('- Skipping CI'));
      continue;
    }
    runWorkspaceTasks(label, `${baseDir}/${workspace}`, ciTasks);
  }
};

const runPackageTasks = () => {
  const packageList = packagesOnly || changedSystems ? allPackages : changedPackages;
  runWorkspaceGroup({
    kindLabel: 'Package',
    baseDir: 'packages',
    workspaceList: packageList,
    changedList: changedPackages,
    onlyMode: packagesOnly,
  });
};

const runAppTasks = () => {
  const appList = appsOnly || changedSystems ? allApps : changedApps;
  runWorkspaceGroup({
    kindLabel: 'App',
    baseDir: 'apps',
    workspaceList: appList,
    changedList: changedApps,
    onlyMode: appsOnly,
  });
};

const getDetectedTelemetry = () => {
  const hasAppChanges = changedApps.length > 0;
  const hasPackageChanges = changedPackages.length > 0;

  console.log(`\n${header('Detected Changes')}`);
  console.log(`- System files: ${changedSystems ? 'changed' : 'no change'}`);
  console.log(`- Packages: ${hasPackageChanges ? changedPackages.join(', ') : 'no change'}`);
  console.log(`- Apps: ${hasAppChanges ? changedApps.join(', ') : 'no change'}`);

  const systemFiles = changedFiles.filter((file) => !file.startsWith('apps/') && !file.startsWith('packages/'));
  const packageFiles = changedFiles.filter((file) => file.startsWith('packages/'));
  const appFiles = changedFiles.filter((file) => file.startsWith('apps/'));

  if (systemFiles.length) {
    console.log(`\n${header('System Changed Files')}`);
    for (const file of systemFiles) {
      console.log(`- ${file}`);
    }
  }

  if (packageFiles.length) {
    console.log(`\n${header('Packages Changed Files')}`);
    for (const file of packageFiles) {
      console.log(`- ${file}`);
    }
  }

  if (appFiles.length) {
    console.log(`\n${header('Apps Changed Files')}`);
    for (const file of appFiles) {
      console.log(`- ${file}`);
    }
  }

  if (!changedSystems && packageImpacts.length) {
    console.log(`\n${header('Package impacts')}`);
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

  console.log(`\n${header('Full CI check finished, exiting.')}\n`);
  process.exit(0);
}
