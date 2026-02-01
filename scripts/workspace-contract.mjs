import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appsDir = path.join(root, 'apps');
const packagesDir = path.join(root, 'packages');

const appScripts = ['ci', 'build', 'dev'];
const infraScripts = ['ci'];
const packageScripts = ['ci'];

const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const listWorkspaces = (dir, type) => {
  if (!isDir(dir)) return [];
  return fs
    .readdirSync(dir)
    .map((name) => ({
      name,
      type,
      dir: path.join(dir, name),
      pkgPath: path.join(dir, name, 'package.json'),
    }))
    .filter((ws) => isDir(ws.dir) && fs.existsSync(ws.pkgPath));
};

const workspaces = [
  ...listWorkspaces(appsDir, 'app'),
  ...listWorkspaces(packagesDir, 'package'),
];

const errors = [];

const workspaceByName = new Map();
for (const ws of workspaces) {
  const pkg = readJson(ws.pkgPath);
  ws.pkg = pkg;
  ws.pkgName = pkg.name;
  workspaceByName.set(ws.pkgName, ws);
}

const isInactive = (pkg) => pkg.workspaceStatus === 'inactive';
const parseCiChain = (ciScript) =>
  ciScript
    .split('&&')
    .map((step) => step.trim())
    .filter(Boolean)
    .map((step) => {
      const match = step.match(/^pnpm run ([A-Za-z0-9:._-]+)$/);
      return match ? match[1] : null;
    });

for (const ws of workspaces) {
  if (isInactive(ws.pkg)) continue;
  const required =
    ws.type === 'app'
      ? ws.name === 'infra'
        ? infraScripts
        : appScripts
      : packageScripts;
  const scripts = ws.pkg.scripts || {};
  for (const key of required) {
    if (!scripts[key]) {
      errors.push(
        `${ws.type} ${ws.name} is missing script: ${key} (set workspaceStatus: "inactive" to skip)`,
      );
    }
  }

  // CI contract: ciTasks must be a 1:1 mirror of the ci script.
  if (scripts.ci) {
    const ciTasks = ws.pkg.ciTasks;
    if (!Array.isArray(ciTasks) || ciTasks.length === 0) {
      errors.push(
        `${ws.type} ${ws.name} is missing ciTasks (required to mirror scripts.ci)`,
      );
    } else {
      const parsed = parseCiChain(scripts.ci);
      if (parsed.some((task) => task === null)) {
        errors.push(
          `${ws.type} ${ws.name} has a ci script that is not a plain "pnpm run <task>" chain`,
        );
      } else {
        const parsedTasks = parsed.filter(Boolean);
        const matches =
          parsedTasks.length === ciTasks.length &&
          parsedTasks.every((task, i) => task === ciTasks[i]);
        if (!matches) {
          errors.push(
            `${ws.type} ${ws.name} ciTasks must match scripts.ci in order and contents`,
          );
        }
      }

      for (const task of ciTasks || []) {
        if (!scripts[task]) {
          errors.push(
            `${ws.type} ${ws.name} ciTasks references missing script: ${task}`,
          );
        }
      }
    }
  }
}

// Dependency graph (workspace -> workspace) for cycle detection.
const depsFor = (pkg) => ({
  ...pkg.dependencies,
  ...pkg.optionalDependencies,
  ...pkg.peerDependencies,
});

const graph = new Map(); // name -> [depNames]
for (const ws of workspaces) {
  if (isInactive(ws.pkg)) continue;
  const deps = Object.keys(depsFor(ws.pkg) || {});
  const edges = deps.filter((name) => workspaceByName.has(name));
  graph.set(ws.pkgName, edges);
}

const visited = new Set();
const inStack = new Set();
const cycles = [];

const dfs = (node, pathStack) => {
  if (inStack.has(node)) {
    const cycleStart = pathStack.indexOf(node);
    if (cycleStart >= 0) {
      cycles.push(pathStack.slice(cycleStart).concat(node));
    }
    return;
  }
  if (visited.has(node)) return;
  visited.add(node);
  inStack.add(node);
  const edges = graph.get(node) || [];
  for (const dep of edges) {
    dfs(dep, [...pathStack, dep]);
  }
  inStack.delete(node);
};

for (const node of graph.keys()) {
  dfs(node, [node]);
}

if (cycles.length) {
  for (const cycle of cycles) {
    errors.push(`workspace dependency cycle detected: ${cycle.join(' -> ')}`);
  }
}

if (errors.length) {
  console.error('Workspace contract check failed:\n');
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}

console.log('Workspace contract check passed.');
