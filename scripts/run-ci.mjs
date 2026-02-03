import { execSync } from 'node:child_process';
import { header, muted, subheader } from './run-ci.output.mjs';
import { initRunner, runStep } from './run-ci.runner.mjs';

// CI streams full output; local runs default to inline UI.
// Set CI=true locally to mirror full CI-style output.
const isCI = process.env.CI === 'true';
const args = new Set(process.argv.slice(2));
const projectOnly = args.has('--project-only');
const appsOnly = args.has('--apps-only');
const packagesOnly = args.has('--packages-only');
const forceFullCI = args.has('--force-full-ci');

initRunner();

const getAffectedTargets = () => {
  const output = execSync('node scripts/affected-apps.mjs', {
    encoding: 'utf8',
  });
  return JSON.parse(output);
};

// Each package.json has ci and ciPaths
// ci = script that triggers all ci gates
// ciPaths = array of ci scripts, used as a CI UI enhancement
const readWorkspaceMeta = (pkgPath) => {
  const pkg = JSON.parse(execSync(`cat ${pkgPath}`, { encoding: 'utf8' }));
  return {
    scripts: pkg.scripts || {},
    ciTasks: Array.isArray(pkg.ciTasks) ? pkg.ciTasks : null,
  };
};

const runWorkspaceTasks = async (label, cwd, tasks) => {
  console.log(`\n${subheader(label)}`);
  if (!tasks?.length) {
    console.log(muted('- Skipping CI'));
    return;
  }
  for (const task of tasks) {
    await runStep({
      label: task,
      command: `pnpm -C ${cwd} run ${task}`,
      isCI,
    });
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

const impactedApps = new Set(packageImpacts.flatMap((impact) => impact.apps || []));
// Merge direct + dependency-triggered app changes (Set prevents duplicates).
const affectedApps = Array.from(new Set([...changedApps, ...impactedApps]));

const runWorkspaceGroup = async ({ kindLabel, baseDir, workspaceList, changedList, onlyMode, impactedSet }) => {
  if (!workspaceList.length) {
    console.log(`\n${subheader(`${kindLabel} - No Change Detected`)}`);
    console.log(muted('- Skipping CI'));
    return;
  }

  for (const workspace of workspaceList) {
    const pkgPath = `${baseDir}/${workspace}/package.json`;
    const { ciTasks } = readWorkspaceMeta(pkgPath);

    const changed = changedList.includes(workspace);

    const suffix = forceFullCI
      ? 'Triggered From Force Full CI'
      : changedSystems
        ? 'Triggered From System Files Change'
        : impactedSet && impactedSet.has(workspace)
          ? 'Triggered From Dependency Change'
          : changed
            ? 'Detected Change'
            : 'No Change Detected';

    const label = kindLabel === 'Package' ? `Package ${workspace} - ${suffix}` : `${workspace} - ${suffix}`;

    if (!onlyMode && suffix === 'No Change Detected') {
      console.log(`\n${subheader(label)}`);
      console.log(muted('- Skipping CI'));
      continue;
    }

    await runWorkspaceTasks(label, `${baseDir}/${workspace}`, ciTasks);
  }
};

const runProjectTasks = async () => {
  const shouldRunProject = isCI || forceFullCI || projectOnly || changedSystems;

  const getProjectSuffix = () => {
    if (forceFullCI) return 'Triggered From Force Full CI';
    if (changedSystems) return 'Triggered From System Files Change';
    if (projectOnly) return 'Triggered From Project-Only';
    if (isCI) return 'Triggered From CI';
    return 'No Change Detected';
  };

  const projectSuffix = getProjectSuffix();

  if (!shouldRunProject) {
    console.log(`\n${subheader(`Project - ${projectSuffix}`)}`);
    console.log(muted('- Skipping CI'));
    return;
  }

  console.log(subheader(`\nProject - ${projectSuffix}`));
  await runStep({
    label: 'format:check',
    command: 'pnpm run format:check',
    isCI,
  });
  await runStep({
    label: 'lint',
    command: 'pnpm run lint',
    isCI,
  });
  await runStep({
    label: 'type-check',
    command: 'pnpm run type-check',
    isCI,
  });
  await runStep({
    label: 'test',
    command: 'pnpm run test',
    isCI,
  });
  await runStep({
    label: 'ci:contract',
    command: 'pnpm run ci:contract',
    isCI,
  });
};

const runPackageTasks = async () => {
  const packageList = forceFullCI || packagesOnly || changedSystems ? allPackages : changedPackages;
  await runWorkspaceGroup({
    kindLabel: 'Package',
    baseDir: 'packages',
    workspaceList: packageList,
    changedList: changedPackages,
    onlyMode: packagesOnly,
    impactedSet: null,
  });
};

const runAppTasks = async () => {
  const appList = forceFullCI || appsOnly || changedSystems ? allApps : affectedApps;
  await runWorkspaceGroup({
    kindLabel: 'App',
    baseDir: 'apps',
    workspaceList: appList,
    changedList: changedApps,
    onlyMode: appsOnly,
    impactedSet: impactedApps,
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
    console.log(`\n${header('Package Impacts')}`);
    for (const impact of packageImpacts) {
      console.log(`- ${impact.package} → ${impact.apps.join(', ') || 'no dependent apps'}`);
    }
  }
};

const main = async () => {
  if (projectOnly) {
    getDetectedTelemetry();
    await runProjectTasks();

    console.log('\nProject only check finished, exiting.\n');
    process.exit(0);
  } else if (packagesOnly) {
    getDetectedTelemetry();
    await runPackageTasks();

    console.log('\nPackage only check finished, exiting.\n');
    process.exit(0);
  } else if (appsOnly) {
    getDetectedTelemetry();
    await runAppTasks();

    console.log('\nApps only check finished, exiting.\n');
    process.exit(0);
  } else {
    getDetectedTelemetry();
    await runProjectTasks();
    await runPackageTasks();
    await runAppTasks();

    console.log(`\n${header('Full CI check finished, exiting.')}\n`);
    process.exit(0);
  }
};

await main();
