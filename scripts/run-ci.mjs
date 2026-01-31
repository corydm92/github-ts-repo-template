import { execSync } from 'node:child_process';

const isCI = process.env.CI === 'true';

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

console.log('Project tasks');
step('format:check', 'pnpm run format:check');
step('lint', 'pnpm run lint');
step('type-check', 'pnpm run type-check');
step('test', 'pnpm run test');
step('ci:contract', 'pnpm run ci:contract');

console.log('\nApp + package tasks');
const getAffectedTargets = () => {
  const output = execSync('node scripts/affected-apps.mjs', {
    encoding: 'utf8',
  });
  return JSON.parse(output);
};

const readScripts = (pkgPath) =>
  JSON.parse(execSync(`cat ${pkgPath}`, { encoding: 'utf8' })).scripts || {};

const runWorkspaceTasks = (label, cwd, tasks) => {
  console.log(`\n${label} Change Detected`);
  for (const task of tasks) {
    step(task, `pnpm -C ${cwd} run ${task}`);
  }
};

const { apps = [], packages = [] } = getAffectedTargets();
if (!apps.length && !packages.length) {
  console.log('- [x] no affected apps or packages');
} else {
  for (const app of apps) {
    const pkgPath = `apps/${app}/package.json`;
    const scripts = readScripts(pkgPath);
    const tasks = [
      'format:check',
      'lint',
      'type-check',
      'test',
      'build',
    ].filter((t) => scripts[t]);
    runWorkspaceTasks(app, `apps/${app}`, tasks);
  }
  for (const pkg of packages) {
    const pkgPath = `packages/${pkg}/package.json`;
    const scripts = readScripts(pkgPath);
    const tasks = [
      'format:check',
      'lint',
      'type-check',
      'test',
      'build',
    ].filter((t) => scripts[t]);
    runWorkspaceTasks(pkg, `packages/${pkg}`, tasks);
  }
}
